<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">الرواتب</h2>
      <button class="bg-hr hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-money-check-alt"></i> صرف الرواتب</button>
    </div>
    <DataTable title="كشف الرواتب - مارس 2026">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الموظف</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الراتب الأساسي</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">البدلات</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الخصومات</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الصافي</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
        </tr></thead>
        <tbody>
          <tr v-for="(s, i) in salaries" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-secondary">{{ s.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{  s.base  }} د.ع</td>
            <td class="px-4 py-3 text-success">{{  s.bonus  }} د.ع</td>
            <td class="px-4 py-3 text-danger">{{  s.deductions  }} د.ع</td>
            <td class="px-4 py-3 font-bold text-hr">{{  s.base + s.bonus - s.deductions  }} د.ع</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="s.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">{{ s.paid ? 'مدفوع' : 'معلق' }}</span></td>
          </tr>
        </tbody>
      </table>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const salaries = ref<any[]>([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/salaries');
    salaries.value = data.map((s: any) => ({
      name: s.employee?.name || '—',
      base: Number(s.amount || 0),
      bonus: 0,
      deductions: 0,
      paid: true,
      date: s.date,
    }));
  } catch {}
});
</script>
