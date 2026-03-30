import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/BackupView.vue'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

import re
content = re.sub(r'async function downloadBackup\(\) \{.*?\n  \} catch \(e\) \{.*?\n  \}', '''async function downloadBackup() {
  try {
    const res = await api.get('/backup/download', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', isp-erp-backup-.sqlite);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (e) {
    Swal.fire('خطأ', 'فشل تحميل النسخة تأكد من اتصالك', 'error');
  }
}''', content, flags=re.DOTALL)

with codecs.open(filepath, 'w', 'utf-8') as f:
    f.write(content)
