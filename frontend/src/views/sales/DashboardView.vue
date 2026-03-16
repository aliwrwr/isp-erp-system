<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="مبيعات اليوم" :value="todaySales" icon="fas fa-shopping-cart" color="#27AE60" />
      <StatsCard title="مبيعات الشهر" :value="monthlySales" icon="fas fa-chart-line" color="#2980B9" />
      <StatsCard title="المنتجات" :value="productCount" icon="fas fa-boxes" color="#8E44AD" />
      <StatsCard title="منتجات منخفضة المخزون" :value="lowStock" icon="fas fa-exclamation-triangle" color="#E74C3C" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTable title="آخر الفواتير">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">رقم الفاتورة</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">العميل</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(inv, i) in invoices" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ inv.no }}</td>
              <td class="px-4 py-3 font-medium text-secondary">{{ inv.customer }}</td>
              <td class="px-4 py-3 font-bold text-success">{{  inv.total  }} د.ع</td>
            </tr>
          </tbody>
        </table>
      </DataTable>
      <DataTable title="الأكثر مبيعاً">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">المنتج</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">المبيعات</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الإيراد</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in topProducts" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ p.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ p.sold }} وحدة</td>
              <td class="px-4 py-3 font-bold text-success">{{  p.revenue  }} د.ع</td>
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

const invoicesData = ref<any[]>([]);
const productsData = ref<any[]>([]);

const todaySales = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  const sum = invoicesData.value.filter(i => i.date?.startsWith(today)).reduce((s, i) => s + Number(i.total || 0), 0);
  return '$' + sum.toLocaleString();
});
const monthlySales = computed(() => {
  const sum = invoicesData.value.reduce((s, i) => s + Number(i.total || 0), 0);
  return '$' + sum.toLocaleString();
});
const productCount = computed(() => productsData.value.length);
const lowStock = computed(() => productsData.value.filter(p => p.stock < 10).length);

const invoices = computed(() => invoicesData.value.slice(0, 5).map(i => ({
  no: i.invoiceNumber,
  customer: i.customer?.name || '—',
  total: Number(i.total || 0),
})));

const topProducts = computed(() =>
  productsData.value.slice(0, 5).map(p => ({
    name: p.name,
    sold: p.stock,
    revenue: Number(p.price || 0) * (p.stock || 0),
  }))
);

onMounted(async () => {
  try {
    const [invRes, prodRes] = await Promise.all([api.get('/invoices'), api.get('/products')]);
    invoicesData.value = invRes.data;
    productsData.value = prodRes.data;
  } catch {}
});
</script>
