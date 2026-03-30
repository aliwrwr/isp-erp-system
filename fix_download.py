import codecs

filepath = 'c:/Users/OMC/isp-erp-system/frontend/src/views/BackupView.vue'

with codecs.open(filepath, 'r', 'utf-8') as f:
    content = f.read()

old_download = '''function downloadBackup() {
  window.open(api.defaults.baseURL + '/backup/download', '_blank');
}'''

new_download = '''async function downloadBackup() {
  try {
    const res = await api.get('/backup/download', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', isp-erp-backup-\.sqlite);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (e) {
    Swal.fire('خطأ', 'فشل تحميل النسخة تأكد من اتصالك', 'error');
  }
}'''

content = content.replace(old_download, new_download)

old_card = '''      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
        <div class="absolute inset-y-0 right-0 w-1" :class="status?.enabled ? 'bg-emerald-500' : 'bg-rose-500'"></div>
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg" :class="status?.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
          <i class="fas" :class="status?.enabled ? 'fa-check-circle' : 'fa-times-circle'"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-bold mb-1">حالة النسخ التلقائي (كل 6 ساعات)</p>
          <h3 class="text-lg font-black" :class="status?.enabled ? 'text-emerald-700' : 'text-rose-700'">
            {{ status?.enabled ? 'مفعل' : 'معطل' }}
          </h3>
        </div>
      </div>'''

new_card = '''      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
        <div class="absolute inset-y-0 right-0 w-1 bg-emerald-500"></div>
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg bg-emerald-50 text-emerald-600">
          <i class="fas fa-check-double"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-bold mb-1">النسخ التلقائي (كل 6 ساعات)</p>
          <h3 class="text-lg font-black text-emerald-700">
            مفعل محليا 
            <span v-if="status?.enabled" class="text-xs text-amber-600 mr-2"><i class="fas fa-cloud"></i> + وسحابيا</span>
          </h3>
          <p v-if="!status?.enabled" class="text-[10px] text-gray-400 mt-1">يمكنك تفعيله سحابيا من إعدادات Google Drive أدناه</p>
        </div>
      </div>'''

content = content.replace(old_card, new_card)

with codecs.open(filepath, 'w', 'utf-8') as f:
    f.write(content)

print("Fixed download Backup logic and Card!")
