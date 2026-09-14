const D = require('better-sqlite3');
const db = new D('isp-erp.sqlite');
try {
  const users = db.prepare("SELECT id, username, email, roleId FROM users").all();
  console.log('Users:', JSON.stringify(users, null, 2));
} catch (e) {
  console.error("Error reading users:", e.message);
}
try {
  const managers = db.prepare("SELECT id, username, email FROM managers").all();
  console.log('Managers:', JSON.stringify(managers, null, 2));
} catch (e) {
  console.error("Error reading managers:", e.message);
}
db.close();
