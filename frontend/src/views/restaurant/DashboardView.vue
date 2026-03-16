<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="الطلبات اليوم" :value="todayOrders" icon="fas fa-receipt" color="#D35400" />
      <StatsCard title="إيرادات اليوم" :value="todayRevenue + ' \u062f.\u0639'" icon="fas fa-coins" color="#27AE60" />
      <StatsCard title="الطاولات المشغولة" :value="occupiedTables + '/' + totalTables" icon="fas fa-chair" color="#2980B9" />
      <StatsCard title="أصناف القائمة" :value="menuCount" icon="fas fa-utensils" color="#8E44AD" />
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataTable title="آخر الطلبات">
        <table class="w-full text-sm">
          <thead class="bg-gray-50"><tr>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">رقم الطلب</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الطاولة</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
            <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
          </tr></thead>
          <tbody>
            <tr v-for="o in recentOrders" :key="o.id" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ o.orderNumber }}</td>
              <td class="px-4 py-3 text-gray-500">{{ o.table ? 'طاولة ' + o.table.number : o.orderType === 'takeaway' ? 'سفري' : 'توصيل' }}</td>
              <td class="px-4 py-3 font-bold text-restaurant">{{  Number(o.totalAmount).toFixed(2)  }} د.ع</td>
              <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </DataTable>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-bold text-secondary mb-4">حالة الطاولات</h3>
        <div class="grid grid-cols-4 gap-3">
          <div v-for="t in tables" :key="t.id"
            class="rounded-xl p-3 text-center border-2 transition"
            :class="t.status === 'occupied' ? 'border-danger bg-danger/5' : t.status === 'reserved' ? 'border-warning bg-warning/5' : 'border-success bg-success/5'">
            <i class="fas fa-chair text-lg mb-1" :class="t.status === 'occupied' ? 'text-danger' : t.status === 'reserved' ? 'text-warning' : 'text-success'"></i>
            <div class="text-xs font-bold text-secondary">{{ t.number }}</div>
            <div class="text-[10px] text-gray-400">{{ t.capacity }} أشخاص</div>
          </div>
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

const orders = ref<any[]>([]);
const tables = ref<any[]>([]);
const menuItems = ref<any[]>([]);

const today = new Date().toISOString().split('T')[0];
const todayOrders = computed(() => orders.value.filter(o => o.createdAt?.startsWith(today)).length);
const todayRevenue = computed(() => orders.value.filter(o => o.createdAt?.startsWith(today) && o.status === 'paid').reduce((s, o) => s + Number(o.totalAmount), 0).toFixed(2));
const totalTables = computed(() => tables.value.length);
const occupiedTables = computed(() => tables.value.filter(t => t.status === 'occupied').length);
const menuCount = computed(() => menuItems.value.length);
const recentOrders = computed(() => orders.value.slice(0, 5));

function statusClass(s: string) {
  const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', preparing: 'bg-blue-100 text-blue-700', ready: 'bg-purple-100 text-purple-700', served: 'bg-green-100 text-green-700', paid: 'bg-gray-100 text-gray-700', cancelled: 'bg-red-100 text-red-700' };
  return map[s] || 'bg-gray-100 text-gray-600';
}
function statusLabel(s: string) {
  const map: Record<string, string> = { pending: 'قيد الانتظار', preparing: 'قيد التحضير', ready: 'جاهز', served: 'تم التقديم', paid: 'مدفوع', cancelled: 'ملغي' };
  return map[s] || s;
}

onMounted(async () => {
  try {
    const [oRes, tRes, mRes] = await Promise.all([
      api.get('/restaurant/orders'),
      api.get('/restaurant/tables'),
      api.get('/restaurant/menu'),
    ]);
    orders.value = oRes.data;
    tables.value = tRes.data;
    menuItems.value = mRes.data;
  } catch {}
});
</script>
