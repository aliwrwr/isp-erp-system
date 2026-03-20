<template>
  <div class="p-4 md:p-6 space-y-6" dir="rtl">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
          <i class="fab fa-whatsapp text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">واتساب الدعم الفني</h1>
          <p class="text-sm text-gray-500">إشعارات تلقائية لتذاكر الدعم الفني</p>
        </div>
      </div>
      <button @click="refresh" :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
        <i class="fas fa-sync-alt" :class="loading ? 'animate-spin' : ''"></i>
        تحديث
      </button>
    </div>

    <!-- Connection Status (read-only) -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <i class="fas fa-plug text-gray-400"></i>
        حالة اتصال واتساب
      </h2>
      <div class="flex items-center gap-4">
        <div v-if="status.connected" class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
            <i class="fab fa-whatsapp text-green-500 text-2xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span class="font-semibold text-green-600">متصل</span>
            </div>
            <p v-if="status.phone" class="text-xs text-gray-500 mt-0.5" dir="ltr">+{{ status.phone }}</p>
          </div>
        </div>
        <div v-else-if="status.initializing" class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-yellow-100 flex items-center justify-center">
            <i class="fas fa-circle-notch text-yellow-500 text-2xl animate-spin"></i>
          </div>
          <span class="font-semibold text-yellow-600">جاري التهيئة...</span>
        </div>
        <div v-else class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
            <i class="fab fa-whatsapp text-red-400 text-2xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="font-semibold text-red-500">غير متصل</span>
            </div>
            <p class="text-xs text-gray-500 mt-0.5">
              لإدارة الاتصال، انتقل إلى
              <router-link to="/messaging/whatsapp-internet" class="text-orange-500 hover:underline font-medium">واتساب الاشتراكات</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto Connect Setting -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-plug text-gray-400"></i>
          إعداد الاتصال التلقائي
        </h2>
        <button @click="saveAutoConnect" :disabled="savingAutoConnect"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
          <i class="fas fa-save text-xs"></i>
          {{ savingAutoConnect ? 'جاري الحفظ...' : 'حفظ' }}
        </button>
      </div>
      <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
        :class="autoConnect ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'"
        @click="autoConnect = !autoConnect">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="autoConnect ? 'bg-blue-500' : 'bg-gray-300'">
              <i class="fas fa-plug text-white text-sm"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-700">اتصال تلقائي عند تشغيل النظام</p>
              <p class="text-xs text-gray-500 mt-0.5">يقوم النظام بالاتصال بواتساب تلقائياً عند كل إعادة تشغيل — يستخدم الجلسة المحفوظة دون الحاجة لمسح QR</p>
            </div>
          </div>
          <div class="relative flex-shrink-0">
            <div class="w-12 h-6 rounded-full transition-colors"
              :class="autoConnect ? 'bg-blue-500' : 'bg-gray-300'">
              <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                :class="autoConnect ? 'right-1' : 'left-1'"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-bell text-gray-400"></i>
          إعدادات الإشعارات التلقائية — الدعم الفني
        </h2>
        <button @click="saveSettings" :disabled="savingSettings"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
          <i class="fas fa-save text-xs"></i>
          {{ savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
        </button>
      </div>

      <!-- Toggle Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Ticket Created -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.ticketCreatedEnabled ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.ticketCreatedEnabled = !settings.ticketCreatedEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.ticketCreatedEnabled ? 'bg-blue-500' : 'bg-gray-300'">
              <i class="fas fa-ticket-alt text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.ticketCreatedEnabled ? 'bg-blue-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.ticketCreatedEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">إنشاء تذكرة جديدة</p>
          <p class="text-xs text-gray-500 mt-1">إشعار العميل عند استلام طلبه</p>
        </div>

        <!-- Ticket Resolved -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.ticketResolvedEnabled ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.ticketResolvedEnabled = !settings.ticketResolvedEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.ticketResolvedEnabled ? 'bg-green-500' : 'bg-gray-300'">
              <i class="fas fa-check-double text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.ticketResolvedEnabled ? 'bg-green-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.ticketResolvedEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">حل التذكرة</p>
          <p class="text-xs text-gray-500 mt-1">إشعار العميل عند اكتمال الحل</p>
        </div>

        <!-- Tech Assigned -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.techAssignedEnabled ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.techAssignedEnabled = !settings.techAssignedEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.techAssignedEnabled ? 'bg-orange-500' : 'bg-gray-300'">
              <i class="fas fa-hard-hat text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.techAssignedEnabled ? 'bg-orange-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.techAssignedEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">تعيين فني</p>
          <p class="text-xs text-gray-500 mt-1">إشعار العميل عند تعيين الفني</p>
        </div>
      </div>

      <!-- Template Variables Help -->
      <div class="p-3 bg-gray-50 rounded-xl mb-5 text-xs text-gray-600">
        <p class="font-semibold mb-1.5"><i class="fas fa-code ml-1"></i>المتغيرات المتاحة في القوالب:</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;name&#125;&#125;</code> — اسم العميل</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;ticketId&#125;&#125;</code> — رقم التذكرة</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;description&#125;&#125;</code> — وصف المشكلة</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;techName&#125;&#125;</code> — اسم الفني</span>
        </div>
      </div>

      <!-- Template Editors -->
      <div class="space-y-4">
        <div v-if="settings.ticketCreatedEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-ticket-alt text-blue-500 ml-1"></i>
            قالب رسالة استلام التذكرة
          </label>
          <textarea v-model="settings.ticketCreatedTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="settings.ticketResolvedEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-check-double text-green-500 ml-1"></i>
            قالب رسالة حل التذكرة
          </label>
          <textarea v-model="settings.ticketResolvedTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="settings.techAssignedEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-hard-hat text-orange-500 ml-1"></i>
            قالب رسالة تعيين الفني
          </label>
          <textarea v-model="settings.techAssignedTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="!settings.ticketCreatedEnabled && !settings.ticketResolvedEnabled && !settings.techAssignedEnabled"
          class="text-center py-8 text-gray-400">
          <i class="fas fa-toggle-off text-4xl mb-2 block"></i>
          فعّل أحد الإشعارات أعلاه لتظهر القوالب هنا
        </div>
      </div>
    </div>

    <!-- Manual Send -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
        <i class="fas fa-paper-plane text-gray-400"></i>
        إرسال رسالة يدوية
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
          <input v-model="manualPhone" type="text" placeholder="07701234567"
            class="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
            dir="ltr" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">نص الرسالة</label>
          <div class="flex gap-2">
            <textarea v-model="manualMessage" rows="1"
              placeholder="اكتب رسالتك هنا..."
              class="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"></textarea>
            <button @click="sendManual" :disabled="!manualPhone || !manualMessage || sendingManual || !status.connected"
              class="px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
              <i class="fab fa-whatsapp text-xs"></i>
              {{ sendingManual ? 'جاري...' : 'إرسال' }}
            </button>
          </div>
        </div>
      </div>
      <p v-if="!status.connected" class="text-xs text-red-400 mt-2">
        <i class="fas fa-info-circle ml-1"></i>
        واتساب غير متصل — لا يمكن الإرسال
      </p>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import api from '../../api';

const loading = ref(false);
const savingSettings = ref(false);
const savingAutoConnect = ref(false);
const autoConnect = ref(false);
const sendingManual = ref(false);
const manualPhone = ref('');
const manualMessage = ref('');

const status = reactive({
  connected: false,
  initializing: false,
  phone: null as string | null,
});

const settings = reactive({
  ticketCreatedEnabled: false,
  ticketCreatedTemplate: '',
  ticketResolvedEnabled: false,
  ticketResolvedTemplate: '',
  techAssignedEnabled: false,
  techAssignedTemplate: '',
});

const toast = reactive({ show: false, type: 'success', message: '' });

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  setTimeout(() => (toast.show = false), 3000);
}

async function refresh() {
  loading.value = true;
  try {
    const [stRes, cfgRes, mainCfgRes] = await Promise.all([
      api.get('/whatsapp/status'),
      api.get('/whatsapp/settings-support'),
      api.get('/whatsapp/settings'),
    ]);
    Object.assign(status, stRes.data);
    Object.assign(settings, cfgRes.data);
    autoConnect.value = mainCfgRes.data.autoConnect ?? false;
  } catch {
    showToast('فشل تحميل البيانات', 'error');
  } finally {
    loading.value = false;
  }
}

async function saveAutoConnect() {
  savingAutoConnect.value = true;
  try {
    await api.patch('/whatsapp/settings', { autoConnect: autoConnect.value });
    showToast('تم حفظ إعداد الاتصال التلقائي');
  } catch {
    showToast('فشل الحفظ', 'error');
  } finally {
    savingAutoConnect.value = false;
  }
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    await api.patch('/whatsapp/settings-support', { ...settings });
    showToast('تم حفظ الإعدادات بنجاح');
  } catch {
    showToast('فشل حفظ الإعدادات', 'error');
  } finally {
    savingSettings.value = false;
  }
}

async function sendManual() {
  if (!manualPhone.value || !manualMessage.value) return;
  sendingManual.value = true;
  try {
    const res = await api.post('/whatsapp/send-direct', {
      phone: manualPhone.value,
      message: manualMessage.value,
    });
    if (res.data.success) {
      showToast('تم إرسال الرسالة بنجاح');
      manualPhone.value = '';
      manualMessage.value = '';
    } else {
      showToast('فشل الإرسال — تأكد من الاتصال', 'error');
    }
  } catch {
    showToast('فشل الإرسال', 'error');
  } finally {
    sendingManual.value = false;
  }
}

onMounted(refresh);
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
