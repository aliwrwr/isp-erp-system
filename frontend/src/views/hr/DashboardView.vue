<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="الموظفين" :value="totalEmployees" icon="fas fa-user-tie" color="#8E44AD" />
      <StatsCard title="الأقسام" :value="totalDepts" icon="fas fa-building" color="#2980B9" />
      <StatsCard title="الحاضرين اليوم" :value="presentToday" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="إجمالي الرواتب" :value="totalSalaries" icon="fas fa-money-check-alt" color="#F39C12" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTable title="آخر الموظفين">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الاسم</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">القسم</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
          </tr></thead>
          <tbody>
            <tr v-for="(e, i) in employees" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ e.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ e.dept }}</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">نشط</span></td>
            </tr>
          </tbody>
        </table>
      </DataTable>
      <DataTable title="حضور اليوم">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الاسم</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الدخول</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الخروج</th>
          </tr></thead>
          <tbody>
            <tr v-for="(a, i) in attendance" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ a.name }}</td>
              <td class="px-4 py-3 text-success">{{ a.checkIn }}</td>
              <td class="px-4 py-3 text-gray-500">{{ a.checkOut || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const employeesData = ref<any[]>([]);
const departmentsData = ref<any[]>([]);
const attendanceData = ref<any[]>([]);
const salariesData = ref<any[]>([]);

const employees = computed(() => employeesData.value.slice(0, 5).map(e => ({ name: e.name, dept: e.department?.name || '—' })));
const attendance = computed(() => attendanceData.value.slice(0, 5).map(a => ({
  name: a.employee?.name || '—',
  checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
  checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) : '',
})));

const totalEmployees = computed(() => employeesData.value.length);
const totalDepts = computed(() => departmentsData.value.length);
const presentToday = computed(() => attendanceData.value.length);
const totalSalaries = computed(() => {
  const sum = salariesData.value.reduce((s, x) => s + Number(x.amount || 0), 0);
  return sum.toLocaleString() + ' د.ع';
});

onMounted(async () => {
  try {
    const [empRes, deptRes, attRes, salRes] = await Promise.all([
      api.get('/employees'), api.get('/departments'), api.get('/attendances'), api.get('/salaries'),
    ]);
    employeesData.value = empRes.data;
    departmentsData.value = deptRes.data;
    attendanceData.value = attRes.data;
    salariesData.value = salRes.data;
  } catch {}
});
</script>
