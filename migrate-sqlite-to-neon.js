// One-time migration: copy data from an old SQLite backup into the Neon PostgreSQL database.
// Usage: node migrate-sqlite-to-neon.js <path-to-sqlite-file>
require('dotenv').config();
const Database = require('better-sqlite3');
const { Client } = require('pg');

const SQLITE_FILE = process.argv[2] || 'isp-erp-backup-2026-09-13.sqlite';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env');
  }

  const sqlite = new Database(SQLITE_FILE, { readonly: true });
  const pg = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await pg.connect();

  const sqliteTables = sqlite
    .prepare("select name from sqlite_master where type='table' and name not like 'sqlite_%'")
    .all()
    .map((r) => r.name);

  const { rows: pgTables } = await pg.query(
    "select table_name from information_schema.tables where table_schema='public'",
  );
  const pgTableNames = new Set(pgTables.map((r) => r.table_name));

  const tables = sqliteTables.filter((t) => pgTableNames.has(t));
  const skipped = sqliteTables.filter((t) => !pgTableNames.has(t));
  if (skipped.length) console.log('Skipping tables not found in Neon schema:', skipped.join(', '));

  // Build FK dependency graph so we insert parents before children and delete children before parents.
  const { rows: fkRows } = await pg.query(`
    SELECT tc.table_name AS child_table, ccu.table_name AS parent_table
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
  `);
  const tableSet = new Set(tables);
  const dependsOn = new Map(tables.map((t) => [t, new Set()])); // child -> set(parent)
  for (const { child_table, parent_table } of fkRows) {
    if (tableSet.has(child_table) && tableSet.has(parent_table) && child_table !== parent_table) {
      dependsOn.get(child_table).add(parent_table);
    }
  }
  const insertOrder = [];
  const visited = new Set();
  function visit(t, stack) {
    if (visited.has(t)) return;
    if (stack.has(t)) return; // cycle guard, break it
    stack.add(t);
    for (const parent of dependsOn.get(t) || []) visit(parent, stack);
    stack.delete(t);
    visited.add(t);
    insertOrder.push(t);
  }
  for (const t of tables) visit(t, new Set());
  const deleteOrder = [...insertOrder].reverse();

  const summary = [];

  for (const table of deleteOrder) {
    await pg.query(`DELETE FROM "${table}"`);
  }

  for (const table of insertOrder) {
    const { rows: cols } = await pg.query(
      `select column_name, data_type from information_schema.columns where table_schema='public' and table_name=$1`,
      [table],
    );
    const colTypes = new Map(cols.map((c) => [c.column_name, c.data_type]));
    const colNames = cols.map((c) => c.column_name);

    const sqliteCols = sqlite
      .prepare(`pragma table_info("${table}")`)
      .all()
      .map((c) => c.name);
    const usableCols = colNames.filter((c) => sqliteCols.includes(c));
    if (!usableCols.length) continue;

    const rows = sqlite.prepare(`select * from "${table}"`).all();

    let inserted = 0;
    let failed = 0;
    const quotedCols = usableCols.map((c) => `"${c}"`).join(', ');
    const placeholders = usableCols.map((_, i) => `$${i + 1}`).join(', ');
    const insertSql = `INSERT INTO "${table}" (${quotedCols}) VALUES (${placeholders})`;

    for (const row of rows) {
      const values = usableCols.map((c) => {
        let v = row[c];
        const type = colTypes.get(c);
        if (type === 'boolean' && v !== null && v !== undefined) {
          v = v === 1 || v === '1' || v === true;
        }
        return v;
      });
      try {
        await pg.query(insertSql, values);
        inserted++;
      } catch (e) {
        failed++;
        if (failed <= 3) console.error(`  ! ${table}:`, e.message);
      }
    }

    if (colNames.includes('id')) {
      try {
        await pg.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`,
        );
      } catch (e) {
        // no serial sequence on this table, ignore
      }
    }

    summary.push({ table, source: rows.length, inserted, failed });
    console.log(`${table}: source=${rows.length} inserted=${inserted} failed=${failed}`);
  }

  await pg.end();
  sqlite.close();

  console.log('\nMigration complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
