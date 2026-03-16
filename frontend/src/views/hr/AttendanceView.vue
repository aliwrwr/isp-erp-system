<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatsCard title="الحاضرين" :value="present" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="الغائبين" :value="absent" icon="fas fa-times-circle" color="#E74C3C" />
      <StatsCard title="متأخرين" :value="late" icon="fas fa-clock" color="#F39C12" />
    </div>
    <DataTable title="سجل الحضور - اليوم">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الموظف</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">القسم</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الدخول</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الخروج</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">ساعات العمل</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
        </tr></thead>
        <tbody>
          <tr v-for="(a, i) in records" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-secondary">{{ a.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.dept }}</td>
            <td class="px-4 py-3 text-success">{{ a.checkIn }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.checkOut || '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ a.hours || '—' }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="{'bg-green-100 text-green-700': a.status==='حاضر','bg-red-100 text-red-700': a.status==='غائب','bg-yellow-100 text-yellow-700': a.status==='متأخر'}">{{ a.status }}</span></td>
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

const allRecords = ref<any[]>([]);
const employeesCount = ref(0);

const records = computed(() => allRecords.value.map(a => ({
  name: a.employee?.name || '—',
  dept: a.employee?.department?.name || '—',
  checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
  checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
  hours: a.checkIn && a.checkOut ? ((new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / 3600000).toFixed(1) + ' ساعة' : '',
  status: !a.checkIn ? 'غائب' : (new Date(a.checkIn).getHours() > 8 ? 'متأخر' : 'حاضر'),
})));

const present = computed(() => records.value.filter(r => r.status === 'حاضر').length);
const absent = computed(() => employeesCount.value - allRecords.value.length);
const late = computed(() => records.value.filter(r => r.status === 'متأخر').length);

onMounted(async () => {
  try {
    const [attRes, empRes] = await Promise.all([api.get('/attendances'), api.get('/employees')]);
    allRecords.value = attRes.data;
    employeesCount.value = empRes.data.length;
  } catch {}
});
</script>
