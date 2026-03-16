<template>
  <div>
    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="إجمالي المشتركين" :value="totalSub" icon="fas fa-users" color="#2980B9" />
      <StatsCard title="المشتركين النشطين" :value="activeSub" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="منتهي الصلاحية" :value="expiredSub" icon="fas fa-exclamation-triangle" color="#E74C3C" />
      <StatsCard title="الإيرادات الشهرية" :value="monthlyRevenue" icon="fas fa-coins" color="#F39C12" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Subscribers -->
      <DataTable title="آخر المشتركين">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الاسم</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الباقة</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(sub, i) in recentSubs" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ sub.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ sub.package }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium" :class="sub.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ sub.active ? 'نشط' : 'معلق' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </DataTable>

      <!-- Expiring Soon -->
      <DataTable title="ينتهي قريباً">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">المشترك</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">تاريخ الانتهاء</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الأيام المتبقية</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in expiringSoon" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-secondary">{{ item.name }}</td>
              <td class="px-4 py-3 text-gray-500">{{ item.expiry }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">{{ item.days }} يوم</span>
              </td>
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

const subscribersData = ref<any[]>([]);
const subscriptionsData = ref<any[]>([]);

const totalSub = computed(() => subscribersData.value.length);
const activeSub = computed(() => subscribersData.value.filter(s => s.status === 'active').length);
const expiredSub = computed(() => totalSub.value - activeSub.value);
const monthlyRevenue = computed(() => {
  const sum = subscriptionsData.value.reduce((s, x) => s + Number(x.price || 0), 0);
  return '$' + sum.toLocaleString();
});

const recentSubs = computed(() => subscribersData.value.slice(0, 5).map(s => ({
  name: s.name,
  package: s.package?.name || '—',
  active: s.status === 'active',
})));

const expiringSoon = computed(() => {
  const now = Date.now();
  return subscriptionsData.value
    .filter(s => s.status === 'active' && s.endDate)
    .map(s => {
      const end = new Date(s.endDate).getTime();
      const days = Math.ceil((end - now) / 86400000);
      return { name: s.subscriber?.name || '—', expiry: s.endDate, days };
    })
    .filter(s => s.days > 0 && s.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);
});

onMounted(async () => {
  try {
    const [subRes, subscRes] = await Promise.all([api.get('/subscribers'), api.get('/subscriptions')]);
    subscribersData.value = subRes.data;
    subscriptionsData.value = subscRes.data;
  } catch {}
});
</script>
