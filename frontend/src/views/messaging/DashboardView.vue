<template>
  <div class="space-y-6">
    <!-- Stats Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Connection Status -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          :class="status.connected ? 'bg-green-100 text-green-600' : status.initializing ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-500'">
          <i :class="status.connected ? 'fab fa-whatsapp' : status.initializing ? 'fas fa-spinner fa-spin' : 'fas fa-wifi-slash'"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">حالة الاتصال</p>
          <p class="font-black text-sm" :class="status.connected ? 'text-green-600' : status.initializing ? 'text-yellow-600' : 'text-red-500'">
            {{ status.connected ? 'متصل' : status.initializing ? 'جارٍ الاتصال...' : 'غير متصل' }}
          </p>
          <p v-if="status.phone" class="text-xs text-gray-400 font-mono mt-0.5" dir="ltr">+{{ status.phone }}</p>
        </div>
      </div>
      <!-- Total -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl"><i class="fas fa-paper-plane"></i></div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">إجمالي الرسائل</p>
          <p class="font-black text-2xl text-gray-700">{{ stats.total.toLocaleString('ar-IQ') }}</p>
        </div>
      </div>
      <!-- Success -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center text-xl"><i class="fas fa-check-double"></i></div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">تم الإرسال بنجاح</p>
          <p class="font-black text-2xl text-green-600">{{ stats.success.toLocaleString('ar-IQ') }}</p>
        </div>
      </div>
      <!-- Failed -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-100 text-red-500 flex items-center justify-center text-xl"><i class="fas fa-exclamation-circle"></i></div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">فشل الإرسال</p>
          <p class="font-black text-2xl text-red-500">{{ stats.failed.toLocaleString('ar-IQ') }}</p>
        </div>
      </div>
    </div>

    <!-- Quick Send + Log -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Quick Send -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 class="font-black text-gray-700 mb-4 flex items-center gap-2"><i class="fab fa-whatsapp text-green-500"></i> إرسال سريع</h3>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-semibold text-gray-500 mb-1 block">رقم الهاتف <span class="text-red-400">*</span></label>
            <input v-model="quickPhone" type="text" dir="ltr" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" placeholder="07xxxxxxxxx" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 mb-1 block">الرسالة <span class="text-red-400">*</span></label>
            <textarea v-model="quickMessage" rows="4" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 resize-none" placeholder="اكتب رسالتك هنا..."></textarea>
          </div>
          <button @click="sendQuick" :disabled="sendingQuick || !status.connected"
            class="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm">
            <i :class="sendingQuick ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
            {{ sendingQuick ? 'جارٍ الإرسال...' : 'إرسال' }}
          </button>
          <p v-if="!status.connected" class="text-xs text-center text-red-400"><i class="fas fa-info-circle ml-1"></i>يجب الاتصال بواتساب أولاً</p>
          <p v-if="quickResult" class="text-xs text-center font-semibold" :class="quickResult === 'success' ? 'text-green-600' : 'text-red-500'">
            {{ quickResult === 'success' ? '✓ تم الإرسال بنجاح' : '✗ فشل الإرسال' }}
          </p>
        </div>
      </div>

      <!-- Log Table -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="font-black text-gray-700 flex items-center gap-2"><i class="fas fa-history text-indigo-500"></i> سجل الرسائل الأخيرة</h3>
          <button @click="loadLogs" class="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1">
            <i class="fas fa-sync-alt" :class="loadingLogs ? 'fa-spin' : ''"></i> تحديث
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500">الاسم / الرقم</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500">النوع</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500">الوقت</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500">الحالة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="loadingLogs">
                <td colspan="4" class="text-center py-8 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl"></i></td>
              </tr>
              <tr v-else-if="!logs.length">
                <td colspan="4" class="text-center py-8 text-gray-400 text-sm"><i class="fab fa-whatsapp text-2xl mb-2 block text-gray-300"></i>لا توجد رسائل مسجلة بعد</td>
              </tr>
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition">
                <td class="px-4 py-3">
                  <p class="font-semibold text-gray-700 text-xs">{{ log.subscriberName || '—' }}</p>
                  <p class="text-gray-400 font-mono text-xs" dir="ltr">{{ log.phone }}</p>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :class="typeClass(log.type)">{{ typeLabel(log.type) }}</span>
                </td>
                <td class="px-4 py-3 text-xs text-gray-400">{{ formatTime(log.createdAt) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="log.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'">
                    <i :class="log.success ? 'fas fa-check' : 'fas fa-times'"></i>
                    {{ log.success ? 'نجح' : 'فشل' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalLogs > logsPerPage" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-sm">
          <span class="text-gray-400 text-xs">{{ totalLogs.toLocaleString('ar-IQ') }} رسالة إجمالاً</span>
          <div class="flex items-center gap-2">
            <button @click="changePage(-1)" :disabled="currentPage === 1" class="px-3 py-1 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50">السابق</button>
            <span class="text-xs text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="changePage(1)" :disabled="currentPage >= totalPages" class="px-3 py-1 rounded-lg border border-gray-200 text-xs disabled:opacity-40 hover:bg-gray-50">التالي</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const status = ref({ connected: false, initializing: false, phone: null as string | null, hasQR: false });
const stats = ref({ total: 0, success: 0, failed: 0 });
const logs = ref<any[]>([]);
const totalLogs = ref(0);
const currentPage = ref(1);
const logsPerPage = 15;
const loadingLogs = ref(false);

const totalPages = computed(() => Math.ceil(totalLogs.value / logsPerPage));

// Quick send
const quickPhone = ref('');
const quickMessage = ref('');
const sendingQuick = ref(false);
const quickResult = ref<'success' | 'failed' | null>(null);

const typeLabels: Record<string, string> = {
  activation: 'تفعيل اشتراك',
  expiry_warning: 'تحذير انتهاء',
  expiry: 'انتهاء اشتراك',
  manual: 'يدوي',
  installment_received: 'دفعة قسط',
  ticket_created: 'تذكرة جديدة',
  ticket_resolved: 'تذكرة محلولة',
  tech_assigned: 'تعيين تقني',
};
const typeColors: Record<string, string> = {
  activation: 'bg-green-100 text-green-700',
  expiry_warning: 'bg-amber-100 text-amber-700',
  expiry: 'bg-red-100 text-red-600',
  manual: 'bg-blue-100 text-blue-700',
  installment_received: 'bg-indigo-100 text-indigo-700',
  ticket_created: 'bg-orange-100 text-orange-700',
  ticket_resolved: 'bg-teal-100 text-teal-700',
  tech_assigned: 'bg-purple-100 text-purple-700',
};

function typeLabel(t: string) { return typeLabels[t] ?? t; }
function typeClass(t: string) { return typeColors[t] ?? 'bg-gray-100 text-gray-600'; }

function formatTime(dt: string) {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('ar-IQ') + ' ' + d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}

async function loadLogs() {
  loadingLogs.value = true;
  try {
    const { data } = await api.get('/whatsapp/logs', { params: { page: currentPage.value, limit: logsPerPage } });
    logs.value = data.data;
    totalLogs.value = data.total;
  } catch {} finally {
    loadingLogs.value = false;
  }
}

function changePage(dir: number) {
  currentPage.value += dir;
  loadLogs();
}

async function sendQuick() {
  if (!quickPhone.value.trim() || !quickMessage.value.trim()) return;
  sendingQuick.value = true;
  quickResult.value = null;
  try {
    const res = await api.post('/whatsapp/send', { phone: quickPhone.value.trim(), message: quickMessage.value.trim() });
    quickResult.value = res.data?.success ? 'success' : 'failed';
    if (res.data?.success) {
      quickMessage.value = '';
      await Promise.all([loadLogs(), loadStats()]);
    }
  } catch {
    quickResult.value = 'failed';
  } finally {
    sendingQuick.value = false;
    setTimeout(() => { quickResult.value = null; }, 4000);
  }
}

async function loadStats() {
  try {
    const { data } = await api.get('/whatsapp/stats');
    stats.value = data;
  } catch {}
}

async function loadStatus() {
  try {
    const { data } = await api.get('/whatsapp/status');
    status.value = data;
  } catch {}
}

onMounted(async () => {
  await Promise.all([loadStatus(), loadStats(), loadLogs()]);
});
</script>
