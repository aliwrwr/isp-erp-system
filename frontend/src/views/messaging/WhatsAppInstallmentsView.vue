<template>
  <div class="p-4 md:p-6 space-y-6" dir="rtl">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-md">
          <i class="fab fa-whatsapp text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">واتساب نظام الأقساط</h1>
          <p class="text-sm text-gray-500">إشعارات تلقائية لعملاء الأقساط</p>
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
              <router-link to="/messaging/whatsapp-internet" class="text-indigo-500 hover:underline font-medium">واتساب الاشتراكات</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-bell text-gray-400"></i>
          إعدادات الإشعارات التلقائية — الأقساط
        </h2>
        <button @click="saveSettings" :disabled="savingSettings"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
          <i class="fas fa-save text-xs"></i>
          {{ savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
        </button>
      </div>

      <!-- Toggle Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Payment Due Reminder -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.paymentDueEnabled ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.paymentDueEnabled = !settings.paymentDueEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.paymentDueEnabled ? 'bg-orange-500' : 'bg-gray-300'">
              <i class="fas fa-clock text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.paymentDueEnabled ? 'bg-orange-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.paymentDueEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">تذكير موعد القسط</p>
          <div class="flex items-center gap-1 mt-1">
            <p class="text-xs text-gray-500">قبل</p>
            <input v-model.number="settings.warningDays" type="number" min="1" max="30" @click.stop
              class="w-12 text-xs text-center border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-orange-400" />
            <p class="text-xs text-gray-500">أيام</p>
          </div>
        </div>

        <!-- Overdue Payment -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.overdueEnabled ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.overdueEnabled = !settings.overdueEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.overdueEnabled ? 'bg-red-500' : 'bg-gray-300'">
              <i class="fas fa-exclamation-triangle text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.overdueEnabled ? 'bg-red-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.overdueEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">إشعار التأخر في الدفع</p>
          <p class="text-xs text-gray-500 mt-1">عند تأخر العميل عن الموعد</p>
        </div>

        <!-- Payment Received -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.paymentReceivedEnabled ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.paymentReceivedEnabled = !settings.paymentReceivedEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.paymentReceivedEnabled ? 'bg-green-500' : 'bg-gray-300'">
              <i class="fas fa-check-circle text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.paymentReceivedEnabled ? 'bg-green-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.paymentReceivedEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">تأكيد استلام الدفعة</p>
          <p class="text-xs text-gray-500 mt-1">عند تسجيل دفعة جديدة</p>
        </div>
      </div>

      <!-- Template Variables Help -->
      <div class="p-3 bg-gray-50 rounded-xl mb-5 text-xs text-gray-600">
        <p class="font-semibold mb-1.5"><i class="fas fa-code ml-1"></i>المتغيرات المتاحة في القوالب:</p>
        <div class="flex flex-wrap gap-x-4 gap-y-1">
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;name&#125;&#125;</code> — اسم العميل</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;amount&#125;&#125;</code> — مبلغ القسط</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;dueDate&#125;&#125;</code> — تاريخ الاستحقاق</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;contract&#125;&#125;</code> — رقم العقد</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;installmentNo&#125;&#125;</code> — رقم القسط</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;remaining&#125;&#125;</code> — المتبقي</span>
          <span><code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;days&#125;&#125;</code> — الأيام المتبقية</span>
        </div>
      </div>

      <!-- Template Editors -->
      <div class="space-y-4">
        <div v-if="settings.paymentDueEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-clock text-orange-500 ml-1"></i>
            قالب رسالة تذكير موعد القسط
          </label>
          <textarea v-model="settings.paymentDueTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="settings.overdueEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-exclamation-triangle text-red-500 ml-1"></i>
            قالب رسالة التأخر في الدفع
          </label>
          <textarea v-model="settings.overdueTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="settings.paymentReceivedEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-check-circle text-green-500 ml-1"></i>
            قالب رسالة تأكيد استلام الدفعة
          </label>
          <textarea v-model="settings.paymentReceivedTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
        <div v-if="!settings.paymentDueEnabled && !settings.overdueEnabled && !settings.paymentReceivedEnabled"
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
        إرسال رسالة يدوية لعميل
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
          <input v-model="manualPhone" type="text" placeholder="07701234567"
            class="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            dir="ltr" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">نص الرسالة</label>
          <div class="flex gap-2">
            <textarea v-model="manualMessage" rows="1"
              placeholder="اكتب رسالتك هنا..."
              class="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"></textarea>
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
const sendingManual = ref(false);
const manualPhone = ref('');
const manualMessage = ref('');

const status = reactive({
  connected: false,
  initializing: false,
  phone: null as string | null,
});

const settings = reactive({
  paymentDueEnabled: false,
  warningDays: 3,
  paymentDueTemplate: '',
  overdueEnabled: false,
  overdueTemplate: '',
  paymentReceivedEnabled: false,
  paymentReceivedTemplate: '',
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
    const [stRes, cfgRes] = await Promise.all([
      api.get('/whatsapp/status'),
      api.get('/whatsapp/settings-installments'),
    ]);
    Object.assign(status, stRes.data);
    Object.assign(settings, cfgRes.data);
  } catch {
    showToast('فشل تحميل البيانات', 'error');
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    await api.patch('/whatsapp/settings-installments', { ...settings });
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
