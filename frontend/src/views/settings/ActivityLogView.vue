<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <i class="fas fa-history text-primary text-lg"></i>
          </div>
          <div>
            <h3 class="font-bold text-secondary text-base">سجل العمليات</h3>
            <p class="text-xs text-gray-400">عرض آخر العمليات المسجلة في النظام</p>
          </div>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50/70">
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">الموظف</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">العملية</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">التفاصيل</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">المبلغ</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="py-20 text-center text-gray-400">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                جاري تحميل السجلات...
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="5" class="py-20 text-center text-gray-400">
                لا توجد سجلات لعرضها.
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="border-b border-gray-100 hover:bg-gray-50/50">
              <td class="px-5 py-4 align-top">
                <div class="font-semibold text-gray-800">{{ log.user?.name || log.user?.username || 'غير معروف' }}</div>
                <div class="text-xs text-gray-500">{{ log.user?.position || 'موظف' }}</div>
              </td>
              <td class="px-5 py-4 align-top">
                <span class="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{{ log.action }}</span>
              </td>
              <td class="px-5 py-4 align-top text-gray-600 max-w-sm">
                {{ log.details }}
                <div v-if="log.subscriberName" class="text-xs text-primary mt-1">
                  المشترك: {{ log.subscriberName }}
                </div>
              </td>
              <td class="px-5 py-4 align-top">
                <span v-if="log.amount" class="font-semibold text-emerald-600">{{ Number(log.amount).toLocaleString() }} د.ع</span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-5 py-4 align-top text-xs text-gray-500">
                {{ formatDate(log.timestamp) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const logs = ref<any[]>([]);
const loading = ref(true);

async function fetchLogs() {
  loading.value = true;
  try {
    const response = await api.get('/activity-log');
    logs.value = response.data;
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
  } finally {
    loading.value = false;
  }
}

function formatDate(dateString: string) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(fetchLogs);
</script>
