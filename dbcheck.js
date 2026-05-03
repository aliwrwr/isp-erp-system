const D = require('better-sqlite3');
const db = new D('isp-erp.sqlite');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables.map(t => t.name)));
const count = db.prepare('SELECT COUNT(*) as c FROM subscriptions').get();
console.log('Subscriptions count:', count.c);
const sample = db.prepare("SELECT id, startDate, createdAt FROM subscriptions LIMIT 5").all();
console.log('Sample:', JSON.stringify(sample));
// Check subscribers with nested subscriptions
const subs = db.prepare('SELECT COUNT(*) as c FROM subscribers').get();
console.log('Subscribers count:', subs.c);
db.close();
