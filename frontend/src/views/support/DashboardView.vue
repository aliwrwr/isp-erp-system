<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="التذاكر المفتوحة" :value="stats.open" icon="fas fa-folder-open" color="#E67E22" />
      <StatsCard title="قيد المعالجة" :value="stats.inProgress" icon="fas fa-spinner" color="#2980B9" />
      <StatsCard title="تم الحل" :value="stats.resolved" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="الإجمالي" :value="stats.total" icon="fas fa-ticket-alt" color="#8E44AD" />
    </div>
    <DataTable title="آخر التذاكر">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">#</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المشترك</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الموضوع</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الأولوية</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الفني</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ</th>
        </tr></thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="text-center py-8 text-gray-400">جاري التحميل...</td></tr>
          <tr v-else-if="recentTickets.length === 0"><td colspan="7" class="text-center py-8 text-gray-400">لا توجد تذاكر</td></tr>
          <tr v-for="t in recentTickets" :key="t.id" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-400">#{{ t.id }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ t.subscriber?.name || '—' }}</td>
            <td class="px-4 py-3 text-gray-700">{{ t.subject }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-red-100 text-red-700': t.priority === 'critical',
                  'bg-orange-100 text-orange-700': t.priority === 'high',
                  'bg-yellow-100 text-yellow-700': t.priority === 'medium',
                  'bg-blue-100 text-blue-700': t.priority === 'low'
                }">
                {{ priorityMap[t.priority] || t.priority }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ t.assignedTo?.name || '—' }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-orange-100 text-orange-700': t.status === 'open',
                  'bg-blue-100 text-blue-700': t.status === 'in-progress',
                  'bg-green-100 text-green-700': t.status === 'resolved',
                  'bg-gray-100 text-gray-600': t.status === 'closed'
                }">
                {{ statusMap[t.status] || t.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-gray-400 text-xs">{{ formatDate(t.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const ticketsData = ref<any[]>([]);
const stats = ref({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
const loading = ref(true);

const priorityMap: Record<string, string> = { low: 'عادي', medium: 'متوسط', high: 'عاجل', critical: 'حرج' };
const statusMap: Record<string, string> = { open: 'مفتوحة', 'in-progress': 'قيد المعالجة', resolved: 'تم الحل', closed: 'مغلقة' };

const recentTickets = computed(() => ticketsData.value.slice(0, 8));

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(async () => {
  try {
    const [tickRes, statsRes] = await Promise.all([
      api.get('/tickets'),
      api.get('/tickets/stats'),
    ]);
    ticketsData.value = tickRes.data;
    stats.value = statsRes.data;
  } finally {
    loading.value = false;
  }
});
</script>
