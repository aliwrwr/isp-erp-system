<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="التذاكر المفتوحة" :value="openCount" icon="fas fa-ticket-alt" color="#E67E22" />
      <StatsCard title="قيد المعالجة" :value="processingCount" icon="fas fa-spinner" color="#2980B9" />
      <StatsCard title="تم الحل" :value="resolvedCount" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="الإجمالي" :value="ticketsData.length" icon="fas fa-list" color="#8E44AD" />
    </div>
    <DataTable title="آخر التذاكر">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">#</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المشترك</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المشكلة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الأولوية</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الفني</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
        </tr></thead>
        <tbody>
          <tr v-for="(t, i) in tickets" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-400">#{{ t.id }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ t.subscriber }}</td>
            <td class="px-4 py-3 text-gray-500">{{ t.problem }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="{'bg-red-100 text-red-700':t.priority==='عاجل','bg-yellow-100 text-yellow-700':t.priority==='متوسط','bg-blue-100 text-blue-700':t.priority==='عادي'}">{{ t.priority }}</span></td>
            <td class="px-4 py-3 text-gray-500">{{ t.technician }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="{'bg-orange-100 text-orange-700':t.status==='مفتوحة','bg-blue-100 text-blue-700':t.status==='قيد المعالجة','bg-green-100 text-green-700':t.status==='تم الحل'}">{{ t.status }}</span></td>
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

const priorityMap: Record<string, string> = { low: 'عادي', medium: 'متوسط', high: 'عاجل', critical: 'عاجل' };
const statusMap: Record<string, string> = { open: 'مفتوحة', 'in-progress': 'قيد المعالجة', resolved: 'تم الحل', closed: 'مغلقة' };

const openCount = computed(() => ticketsData.value.filter(t => t.status === 'open').length);
const processingCount = computed(() => ticketsData.value.filter(t => t.status === 'in-progress').length);
const resolvedCount = computed(() => ticketsData.value.filter(t => t.status === 'resolved' || t.status === 'closed').length);

const tickets = computed(() => ticketsData.value.slice(0, 5).map(t => ({
  id: t.id,
  subscriber: t.subscriber?.name || '—',
  problem: t.subject,
  priority: priorityMap[t.priority] || t.priority,
  technician: t.assignedTo?.name || '',
  status: statusMap[t.status] || t.status,
})));

onMounted(async () => {
  try { const { data } = await api.get('/tickets'); ticketsData.value = data; } catch {}
});
</script>
