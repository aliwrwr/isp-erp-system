const D = require('better-sqlite3');
const db = new D('isp-erp.sqlite');
try {
  const users = db.prepare("SELECT * FROM users LIMIT 1").all();
  if (users.length > 0) {
    console.log('Columns in users:', Object.keys(users[0]));
    console.log('Sample user:', JSON.stringify(users[0], null, 2));
  } else {
    console.log('Users table is empty.');
  }
} catch (e) {
  console.error("Error reading users details:", e.message);
}
db.close();
