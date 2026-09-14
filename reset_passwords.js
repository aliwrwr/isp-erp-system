const D = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new D('isp-erp.sqlite');

async function main() {
  const plainPass = 'admin123'; // كلمة المرور الجديدة التي يمكن تجربتها
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPass, salt);
  
  try {
    // 1. تحديث حساب الـ Admin في جدول users
    const updateAdminStmt = db.prepare("UPDATE users SET password = ? WHERE email = ?");
    const adminRes = updateAdminStmt.run(hash, 'admin@isp.com');
    console.log('Update users (admin@isp.com):', adminRes.changes > 0 ? 'SUCCESS' : 'NOT FOUND');
    
    // 2. تحديث حساب الـ manager الأساسي admin@wrwr في جدول managers
    const updateManagerStmt = db.prepare("UPDATE managers SET password = ? WHERE username = ?");
    const managerRes = updateManagerStmt.run(hash, 'admin@wrwr');
    console.log('Update managers (admin@wrwr):', managerRes.changes > 0 ? 'SUCCESS' : 'NOT FOUND');
  } catch (err) {
    console.error('Error updating passwords:', err.message);
  } finally {
    db.close();
  }
}

main();
