<template>
  <div class="flex flex-col gap-6">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-secondary">الإعدادات</h2>
        <p class="text-sm text-gray-400 mt-0.5">إعدادات نظام الاشتراكات</p>
      </div>
      <button
        @click="saveAll"
        :disabled="saving"
        class="flex items-center gap-2 bg-gradient-to-l from-indigo-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-60"
      >
        <i class="fas fa-save"></i>
        {{ saving ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
      </button>
    </div>

    <!-- Saved notification -->
    <transition name="fade">
      <div v-if="savedNotice" class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
        <i class="fas fa-check-circle"></i>
        تم حفظ الإعدادات بنجاح
      </div>
    </transition>

    <!-- Logo Upload - Full Width -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-image text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">شعار الشركة</h3>
        </div>
        <span class="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
          <i class="fas fa-info-circle ml-1"></i>يُستخدم في الاشتراكات والفواتير فقط
        </span>
      </div>
      <div class="p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <!-- Preview -->
          <div
            class="w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition"
            :class="logoPreview ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-gray-50'"
          >
            <img v-if="logoPreview" :src="logoPreview" alt="شعار" class="w-full h-full object-contain p-1" />
            <div v-else class="flex flex-col items-center gap-2 text-gray-300">
              <i class="fas fa-image text-3xl"></i>
              <span class="text-xs">لا يوجد شعار</span>
            </div>
          </div>
          <!-- Controls -->
          <div class="flex flex-col gap-3 flex-1">
            <p class="text-sm text-gray-500">سيظهر الشعار في رأس الفواتير المطبوعة لنظام الاشتراكات</p>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                <i class="fas fa-upload"></i>
                {{ logoPreview ? 'تغيير الشعار' : 'رفع الشعار' }}
                <input type="file" accept="image/*" @change="onLogoChange" class="hidden" />
              </label>
              <button
                v-if="logoPreview"
                @click="removeLogo"
                class="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                <i class="fas fa-trash"></i>
                حذف الشعار
              </button>
            </div>
            <p class="text-xs text-gray-400">الصيغ المدعومة: PNG، JPG، SVG — الحجم الأقصى: 2 ميغابايت</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Company Info -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-building text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">معلومات الشركة</h3>
          <span class="mr-auto text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
            <i class="fas fa-info-circle ml-1"></i>تُستخدم في الاشتراكات فقط
          </span>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم الشركة</label>
            <input v-model="settings.companyName" type="text" placeholder="اسم الشركة..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف</label>
            <input v-model="settings.companyPhone" type="text" placeholder="07XXXXXXXXX"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">البريد الإلكتروني</label>
            <input v-model="settings.companyEmail" type="email" placeholder="info@company.com"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العنوان</label>
            <textarea v-model="settings.companyAddress" rows="2" placeholder="العنوان التفصيلي..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Subscription Defaults -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-file-contract text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">إعدادات الاشتراكات</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">مدة الاشتراك الافتراضية (بالأيام)</label>
            <input v-model.number="settings.defaultDuration" type="number" min="1" placeholder="30"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">تنبيه انتهاء الاشتراك قبل (بالأيام)</label>
            <input v-model.number="settings.expiryWarningDays" type="number" min="1" placeholder="5"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العملة المستخدمة</label>
            <select v-model="settings.currency" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option value="IQD">دينار عراقي (د.ع)</option>
              <option value="USD">دولار أمريكي ($)</option>
            </select>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">تجديد تلقائي للاشتراكات</p>
              <p class="text-xs text-gray-400 mt-0.5">تجديد الاشتراك تلقائياً عند انتهاء المدة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.autoRenew" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-bell text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">إعدادات الإشعارات</h3>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار انتهاء الاشتراك</p>
              <p class="text-xs text-gray-400 mt-0.5">إرسال تنبيه عند اقتراب انتهاء الاشتراك</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyExpiry" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار الاشتراك الجديد</p>
              <p class="text-xs text-gray-400 mt-0.5">إشعار عند إضافة اشتراك جديد</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyNewSub" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار الديون المتراكمة</p>
              <p class="text-xs text-gray-400 mt-0.5">تنبيه عند وجود ديون غير مسددة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyDebt" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Display Preferences -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-sliders-h text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">تفضيلات العرض</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">عدد السجلات في الصفحة</label>
            <select v-model.number="settings.pageSize" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option :value="10">10 سجلات</option>
              <option :value="25">25 سجل</option>
              <option :value="50">50 سجل</option>
              <option :value="100">100 سجل</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">تنسيق التاريخ</label>
            <select v-model="settings.dateFormat" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option value="YYYY-MM-DD">2026-03-15</option>
              <option value="DD/MM/YYYY">15/03/2026</option>
              <option value="DD-MM-YYYY">15-03-2026</option>
            </select>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إظهار الاشتراكات المنتهية</p>
              <p class="text-xs text-gray-400 mt-0.5">عرض الاشتراكات المنتهية في القوائم</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.showExpired" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const saving = ref(false);
const savedNotice = ref(false);
const logoPreview = ref<string | null>(null);

const LOGO_KEY = 'isp_internet_logo';
const STORAGE_KEY = 'isp_internet_settings';

const settings = ref({
  companyName: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  defaultDuration: 30,
  expiryWarningDays: 5,
  currency: 'IQD',
  autoRenew: false,
  notifyExpiry: true,
  notifyNewSub: true,
  notifyDebt: true,
  pageSize: 25,
  dateFormat: 'YYYY-MM-DD',
  showExpired: true,
});

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { Object.assign(settings.value, JSON.parse(saved)); } catch {}
  }
  logoPreview.value = localStorage.getItem(LOGO_KEY) || null;
});

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('حجم الصورة يتجاوز 2 ميغابايت');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    logoPreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoPreview.value = null;
}

async function saveAll() {
  saving.value = true;
  await new Promise(r => setTimeout(r, 300));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
  if (logoPreview.value) {
    localStorage.setItem(LOGO_KEY, logoPreview.value);
  } else {
    localStorage.removeItem(LOGO_KEY);
  }
  saving.value = false;
  savedNotice.value = true;
  setTimeout(() => { savedNotice.value = false; }, 3000);
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
