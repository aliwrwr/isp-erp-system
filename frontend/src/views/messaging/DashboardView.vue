<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="الرسائل المرسلة" :value="totalSent" icon="fas fa-paper-plane" color="#16A085" />
      <StatsCard title="تم التوصيل" :value="delivered" icon="fas fa-check-double" color="#27AE60" />
      <StatsCard title="فشل الإرسال" :value="failed" icon="fas fa-exclamation-circle" color="#E74C3C" />
      <StatsCard title="القوالب" :value="templateCount" icon="fas fa-file-alt" color="#2980B9" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTable title="آخر الرسائل المرسلة">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">المستلم</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">النوع</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
          </tr></thead>
          <tbody>
            <tr v-for="m in messages.slice(0, 5)" :key="m.id" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ m.recipient }}</td>
              <td class="px-4 py-3 text-gray-500">{{ m.type }}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="m.status === 'delivered' ? 'bg-green-100 text-green-700' : m.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">{{ {delivered:'تم التوصيل',failed:'فشل',pending:'قيد الإرسال',sent:'تم الإرسال'}[m.status] || m.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </DataTable>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-secondary mb-4">إرسال رسالة سريعة</h3>
        <div class="space-y-3">
          <select v-model="recipientGroup" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="all">جميع المشتركين</option><option value="active">المشتركين النشطين</option><option value="expired">منتهي الصلاحية</option>
          </select>
          <select v-model="templateId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="">بدون قالب</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <textarea v-model="quickMessage" rows="3" placeholder="نص الرسالة..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging"></textarea>
          <button @click="sendQuick" class="w-full py-2.5 bg-messaging hover:opacity-90 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"><i class="fas fa-paper-plane"></i> إرسال</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';

const messages = ref<any[]>([]);
const templates = ref<any[]>([]);
const subscribers = ref<any[]>([]);

const totalSent = computed(() => messages.value.length);
const delivered = computed(() => messages.value.filter(m => m.status === 'delivered').length);
const failed = computed(() => messages.value.filter(m => m.status === 'failed').length);
const templateCount = computed(() => templates.value.length);

const recipientGroup = ref('all');
const templateId = ref('');
const quickMessage = ref('');

async function sendQuick() {
  if (!quickMessage.value) return;
  const targets = recipientGroup.value === 'active' ? subscribers.value.filter(s => s.status === 'active') : recipientGroup.value === 'expired' ? subscribers.value.filter(s => s.status !== 'active') : subscribers.value;
  for (const s of targets) {
    await api.post('/messaging/messages', { recipient: s.name || s.username, type: 'sms', content: quickMessage.value });
  }
  quickMessage.value = '';
  const { data } = await api.get('/messaging/messages');
  messages.value = data;
}

onMounted(async () => {
  try {
    const [mRes, tRes, sRes] = await Promise.all([
      api.get('/messaging/messages'),
      api.get('/messaging/templates'),
      api.get('/subscribers'),
    ]);
    messages.value = mRes.data;
    templates.value = tRes.data;
    subscribers.value = sRes.data;
  } catch {}
});
</script>
