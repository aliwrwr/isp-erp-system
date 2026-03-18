const Database = require('better-sqlite3');
const db = new Database('isp-erp.sqlite');
const info = db.prepare("SELECT sql FROM sqlite_master WHERE name='expenses'").get();
console.log('TABLE SCHEMA:', info ? info.sql : 'TABLE NOT FOUND');
db.close();
