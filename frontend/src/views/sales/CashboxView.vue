<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <StatsCard title="رصيد الصندوق" :value="balance" icon="fas fa-cash-register" color="#27AE60" />
      <StatsCard title="الإيداعات" :value="deposits" icon="fas fa-arrow-down" color="#2980B9" />
      <StatsCard title="السحوبات" :value="withdrawals" icon="fas fa-arrow-up" color="#E74C3C" />
    </div>
    <DataTable title="حركات الصندوق">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">النوع</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الوصف</th>
        </tr></thead>
        <tbody>
          <tr v-for="(t, i) in transactions" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500">{{ t.date }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ t.type === 'in' ? 'إيداع' : 'سحب' }}</span></td>
            <td class="px-4 py-3 font-bold" :class="t.type === 'in' ? 'text-success' : 'text-danger'">{{  t.amount  }} د.ع</td>
            <td class="px-4 py-3 text-gray-500">{{ t.desc }}</td>
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

const invoicesData = ref<any[]>([]);
const expensesData = ref<any[]>([]);

const transactions = computed(() => {
  const items: { date: string; type: string; amount: number; desc: string }[] = [];
  invoicesData.value.forEach(inv => {
    items.push({ date: inv.date || '', type: 'in', amount: Number(inv.total || 0), desc: 'فاتورة ' + inv.invoiceNumber });
  });
  expensesData.value.forEach(exp => {
    items.push({ date: exp.date || '', type: 'out', amount: Number(exp.amount || 0), desc: exp.description || exp.category });
  });
  return items.sort((a, b) => b.date.localeCompare(a.date));
});

const totalIn = computed(() => invoicesData.value.reduce((s, i) => s + Number(i.total || 0), 0));
const totalOut = computed(() => expensesData.value.reduce((s, e) => s + Number(e.amount || 0), 0));
const balance = computed(() => '$' + (totalIn.value - totalOut.value).toLocaleString());
const deposits = computed(() => '$' + totalIn.value.toLocaleString());
const withdrawals = computed(() => '$' + totalOut.value.toLocaleString());

onMounted(async () => {
  try {
    const [invRes, expRes] = await Promise.all([api.get('/invoices'), api.get('/expenses')]);
    invoicesData.value = invRes.data;
    expensesData.value = expRes.data;
  } catch {}
});
</script>
