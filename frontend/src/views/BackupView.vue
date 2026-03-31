<template>
  <div class="space-y-6" dir="rtl">
    <div class="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white shadow-lg">
          <i class="fas fa-database text-xl"></i>
        </div>
        <div>
          <h2 class="text-xl font-black text-gray-800">نظام النسخ الاحتياطي</h2>
          <p class="text-sm text-gray-500">حماية واستعادة بيانات المنظومة محلياً وسحابياً</p>
        </div>
      </div>
      <div>
        <button @click="back" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-bold text-sm flex items-center gap-2">
          <i class="fas fa-arrow-left"></i> رجوع
        </button>
      </div>
    </div>

    <!-- Stats / Info -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
          <i class="fas fa-hdd"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-bold mb-1">حجم قاعدة البيانات الحالي</p>
          <h3 class="text-2xl font-black font-mono">
            {{ formatSize(status?.dbSizeKb || 0) }}
          </h3>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
          <i class="fas fa-clock"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-bold mb-1">آخر نسخة سحابية</p>
          <h3 class="text-lg font-bold font-mono">
            {{ status?.lastBackup ? new Date(status.lastBackup).toLocaleString('ar-IQ') : 'لا يوجد نسخة سابقة' }}
          </h3>
        </div>
      </div>
      
      <div class="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
        <div class="absolute inset-y-0 right-0 w-1 bg-emerald-500"></div>
        <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg bg-emerald-50 text-emerald-600">
          <i class="fas fa-check-double"></i>
        </div>
        <div>
          <p class="text-sm text-gray-500 font-bold mb-1">النسخ التلقائي (كل 6 ساعات)</p>
          <h3 class="text-lg font-black text-emerald-700">
            مُفعّل محلياً
            <span v-if="status?.enabled" class="text-xs text-amber-600 mr-2"><i class="fas fa-cloud"></i> + وسحابياً</span>
          </h3>
          <p v-if="!status?.enabled" class="text-[10px] text-gray-400 mt-1">يمكنك تفعيله سحابياً من إعدادات Google Drive أدناه</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Local DB Actions -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div class="p-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
          <i class="fas fa-laptop-code text-indigo-500"></i>
          <h3 class="font-bold text-gray-800">بيانات النظام المحلي</h3>
        </div>
        <div class="p-6 space-y-6 flex-1 flex flex-col justify-center">
          <div class="text-center">
            <i class="fas fa-download text-5xl text-indigo-200 mb-4"></i>
            <p class="text-gray-600 mb-4 text-sm leading-relaxed">
              يمكنك تحميل نسخة كاملة من النظام بصيغة SQLite والاحتفاظ بها محلياً على جهازك. 
            </p>
            <button @click="downloadBackup" :disabled="downloading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2">
              <i class="fas fa-cloud-download-alt" :class="{'fa-spin': downloading}"></i>
              {{ downloading ? 'جاري التجهيز والتحميل...' : 'تحميل نسخة يدوية الآن' }}
            </button>
          </div>
          
          <div class="h-px bg-gray-100 my-2"></div>
          
          <div class="text-center">
            <p class="text-gray-600 mb-4 text-sm leading-relaxed">
              لاستعادة بيانات سابقة، ارفع ملف SQLite الذي قمت بتحميله مسبقاً.
              <span class="text-rose-500 font-bold block mt-1">تنبيه: سيتم استبدال البيانات الحالية بالكامل وإعادة تشغيل النظام!</span>
            </p>
            
            <input type="file" ref="fileInput" accept=".sqlite" class="hidden" @change="onFileSelected" />
            
            <div class="flex gap-2">
              <button @click="fileInput.click()" class="flex-1 bg-white border-2 border-indigo-100 hover:border-indigo-500 text-indigo-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                <i class="fas fa-folder-open"></i>
                اختيار ملف (.sqlite)
              </button>
              
              <button v-if="selectedFile" @click="restoreBackup" :disabled="restoring" class="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition shadow-md shadow-rose-600/20 flex items-center justify-center gap-2">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': restoring }"></i>
                {{ restoring ? 'جاري الاستعادة...' : 'بدء الاستعادة' }}
              </button>
            </div>
            <p v-if="selectedFile" class="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 py-2 rounded-lg">
              الملف المحدد: {{ selectedFile.name }}
            </p>
          </div>
        </div>
      </div>

      <!-- Google Drive Actions -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden border-t-4 border-t-amber-400 flex flex-col">
        <div class="p-5 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
          <i class="fab fa-google-drive text-amber-500"></i>
          <h3 class="font-bold text-gray-800">الربط السحابي (Google Drive - OAuth 2.0)</h3>
        </div>
        <div class="p-6 space-y-5">
           
          <!-- OAuth Connected State -->
          <div v-if="status?.configured" class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
             <div class="flex items-center gap-3 mb-2">
               <i class="fas fa-check-circle text-emerald-500 text-xl"></i>
               <h4 class="font-bold text-emerald-800">تم ربط حساب Google Drive بنجاح</h4>
             </div>
             <p class="text-sm text-emerald-700/80 mb-4 pr-8">الحساب متصل ويمكنك رفع نسخ احتياطية مباشرة أو تفعيل الرفع التلقائي كل 6 ساعات.</p>
             
             <div class="flex flex-wrap gap-2 pr-8">
               <button @click="backupNowToDrive" :disabled="uploading" class="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-lg transition shadow-md shadow-amber-500/20 flex items-center gap-2 text-sm">
                  <i class="fas fa-cloud-upload-alt" :class="{ 'animate-bounce': uploading }"></i>
                  {{ uploading ? 'جاري الرفع...' : 'رفع نسخة للـ Drive الآن' }}
               </button>
               
               <button v-if="status?.enabled" @click="toggleDriveAuto(false)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                  <i class="fas fa-pause"></i> تعطيل النسخ التلقائي
               </button>
               <button v-else @click="toggleDriveAuto(true)" class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold py-2.5 px-5 rounded-lg transition flex items-center gap-2 text-sm">
                  <i class="fas fa-play"></i> تفعيل النسخ التلقائي
               </button>
             </div>
          </div>

          <!-- Last Error -->
          <div v-if="status?.lastError" class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
            <i class="fas fa-exclamation-triangle ml-1"></i>
            آخر خطأ: {{ status.lastError }}
          </div>

          <!-- OAuth Setup -->
          <div class="space-y-4 pt-4 border-t border-gray-100">
             <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 leading-relaxed">
               <h4 class="font-bold mb-2"><i class="fas fa-info-circle ml-1"></i> طريقة الإعداد:</h4>
               <ol class="list-decimal list-inside space-y-1 text-xs">
                 <li>اذهب إلى <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="underline font-bold">Google Cloud Console</a></li>
                 <li>أنشئ مشروع جديد (أو استخدم المشروع الحالي)</li>
                 <li>فعّل <strong>Google Drive API</strong> من قسم APIs & Services</li>
                 <li>اذهب لـ <strong>OAuth consent screen</strong> واختر External ثم أضف بريدك كـ Test User</li>
                 <li>أنشئ <strong>OAuth 2.0 Client ID</strong> من نوع <strong>Web Application</strong></li>
                 <li>أضف رابط إعادة التوجيه (Redirect URI): <code class="bg-blue-100 px-1 rounded" dir="ltr">{{ redirectUri }}</code></li>
                 <li>انسخ الـ Client ID والـ Client Secret وأدخلهما هنا</li>
               </ol>
             </div>

             <div>
               <label class="block text-sm font-bold text-gray-700 mb-1">Client ID</label>
               <input type="text" v-model="oauthConfig.clientId" dir="ltr" class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="xxxx.apps.googleusercontent.com" />
             </div>
             <div>
               <label class="block text-sm font-bold text-gray-700 mb-1">Client Secret</label>
               <input type="password" v-model="oauthConfig.clientSecret" dir="ltr" class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="GOCSPX-xxxxxxxxxxxx" />
             </div>
             <div>
               <label class="block text-sm font-bold text-gray-700 mb-1">مجلد الـ Folder ID (اختياري)</label>
               <input type="text" v-model="oauthConfig.folderId" dir="ltr" class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-sm focus:ring-2 focus:ring-amber-500 outline-none transition" placeholder="1A2b3C4d5E6f7G8h9I0J" />
             </div>
             
             <div class="flex gap-2">
               <button @click="saveOAuthConfig" class="flex-1 bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                 <i class="fas fa-save"></i>
                 حفظ الإعدادات
               </button>
               <button v-if="status?.hasOAuth" @click="startGoogleAuth" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
                 <i class="fab fa-google"></i>
                 تسجيل الدخول بحساب Google
               </button>
             </div>

             <!-- OAuth Processing Notice -->
             <div v-if="oauthProcessing" class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
               <i class="fas fa-spinner fa-spin text-amber-500 text-2xl mb-2"></i>
               <p class="text-sm text-amber-700 font-bold">جاري ربط حساب Google... يرجى الانتظار</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../api';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute();

const status = ref<any>(null);
const fileInput = ref<any>(null);
const selectedFile = ref<File | null>(null);
const restoring = ref(false);
const uploading = ref(false);
const downloading = ref(false);
const oauthProcessing = ref(false);

const oauthConfig = ref({
  clientId: '',
  clientSecret: '',
  folderId: '',
});

const redirectUri = computed(() => {
  return window.location.origin + window.location.pathname;
});

function back() {
  router.push('/select-system');
}

async function fetchStatus() {
  try {
    const res = await api.get('/backup/gdrive-status');
    status.value = res.data;
  } catch (e) {
    console.error(e);
  }
}

function formatSize(kb: number) {
  if (kb < 1024) return kb + ' KB';
  return (kb / 1024).toFixed(2) + ' MB';
}

async function downloadBackup() {
  downloading.value = true;
  try {
    const res = await api.get('/backup/download', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `isp-erp-backup-${date}.sqlite`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  } catch (e: any) {
    Swal.fire('خطأ', 'فشل تحميل النسخة، تأكد من اتصالك', 'error');
  } finally {
    downloading.value = false;
  }
}

function onFileSelected(e: any) {
  if (e.target.files && e.target.files.length > 0) {
    selectedFile.value = e.target.files[0];
  }
}

async function restoreBackup() {
  if (!selectedFile.value) return;
  const res = await Swal.fire({
    title: 'هل أنت متأكد؟',
    text: 'سيتم استبدال قاعدة البيانات الحالية وإعادة تشغيل النظام فوراً!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e3342f',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'نعم، استعد البيانات!',
    cancelButtonText: 'إلغاء'
  });

  if (!res.isConfirmed) return;

  const formData = new FormData();
  formData.append('file', selectedFile.value);

  restoring.value = true;
  try {
    await api.post('/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    Swal.fire('نجاح', 'تم استرجاع النظام، سيتم إعادة التحميل الآن...', 'success');
    setTimeout(() => {
      window.location.href = '/login';
    }, 2000);
  } catch (e: any) {
    Swal.fire('خطأ', e.response?.data?.message || 'فشل الاسترجاع', 'error');
    restoring.value = false;
  }
}

async function saveOAuthConfig() {
  if (!oauthConfig.value.clientId || !oauthConfig.value.clientSecret) {
    Swal.fire('خطأ', 'يجب إدخال Client ID و Client Secret', 'error');
    return;
  }
  try {
    await api.post('/backup/gdrive-config', oauthConfig.value);
    Swal.fire('نجاح', 'تم حفظ الإعدادات. الآن اضغط "تسجيل الدخول بحساب Google" للربط.', 'success');
    fetchStatus();
  } catch (e: any) {
    Swal.fire('خطأ', e.response?.data?.message || 'فشل حفظ الإعدادات', 'error');
  }
}

async function startGoogleAuth() {
  try {
    const res = await api.get('/backup/gdrive-auth-url', {
      params: { redirect_uri: redirectUri.value }
    });
    window.location.href = res.data.url;
  } catch (e: any) {
    Swal.fire('خطأ', 'فشل في إنشاء رابط التوثيق', 'error');
  }
}

async function handleOAuthCallback() {
  const code = route.query.code as string;
  if (!code) return;

  oauthProcessing.value = true;

  // Clean URL from code params
  const cleanUrl = window.location.pathname;
  window.history.replaceState({}, '', cleanUrl);

  try {
    const res = await api.post('/backup/gdrive-callback', {
      code,
      redirect_uri: redirectUri.value,
    });
    if (res.data.success) {
      Swal.fire('تم الربط بنجاح!', 'تم ربط حساب Google Drive. يمكنك الآن رفع النسخ الاحتياطية.', 'success');
      fetchStatus();
    } else {
      Swal.fire('خطأ', res.data.error || 'فشل في ربط الحساب', 'error');
    }
  } catch (e: any) {
    Swal.fire('خطأ', e.response?.data?.message || 'فشل في ربط حساب Google', 'error');
  } finally {
    oauthProcessing.value = false;
  }
}

async function toggleDriveAuto(enable: boolean) {
  try {
    if (enable) {
      await api.post('/backup/gdrive-config', oauthConfig.value);
      fetchStatus();
    } else {
      await api.post('/backup/gdrive-disable');
      fetchStatus();
    }
  } catch (e) { }
}

async function backupNowToDrive() {
  uploading.value = true;
  try {
    const r = await api.post('/backup/gdrive-now');
    if (r.data.success) {
      Swal.fire('نجاح', 'تم رفع النسخة إلى Google Drive بنجاح!', 'success');
      fetchStatus();
    } else {
       throw new Error(r.data.error || 'Unknown upload error');
    }
  } catch (e: any) {
    Swal.fire('خطأ', e.response?.data?.message || e.message || 'فشل رفع النسخة', 'error');
  } finally {
    uploading.value = false;
  }
}

onMounted(() => {
  if (route.query.code) {
    handleOAuthCallback();
  }
  fetchStatus();
});
</script>