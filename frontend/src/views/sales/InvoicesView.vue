<template>
  <div>
    <DataTable title="الفواتير">
      <template #actions>
        <button class="bg-sales hover:bg-success-dark text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"><i class="fas fa-plus ml-1"></i>فاتورة جديدة</button>
      </template>
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">رقم الفاتورة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">العميل</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
        </tr></thead>
        <tbody>
          <tr v-for="(inv, i) in invoices" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ inv.no }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ inv.customer }}</td>
            <td class="px-4 py-3 font-bold text-success">{{  inv.total  }} د.ع</td>
            <td class="px-4 py-3 text-gray-500">{{ inv.date }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="inv.paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">{{ inv.paid ? 'مدفوعة' : 'معلقة' }}</span></td>
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

const invoices = ref<any[]>([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/invoices');
    invoices.value = data.map((inv: any) => ({
      no: inv.invoiceNumber,
      customer: inv.customer?.name || '—',
      total: Number(inv.total || 0),
      date: inv.date,
      paid: inv.paymentMethod ? true : false,
    }));
  } catch {}
});
</script>
