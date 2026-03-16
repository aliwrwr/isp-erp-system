<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="إيرادات الشهر" :value="revenue" icon="fas fa-coins" color="#27AE60" />
      <StatsCard title="اشتراكات جديدة" :value="newSubs" icon="fas fa-user-plus" color="#2980B9" />
      <StatsCard title="اشتراكات منتهية" :value="expiredSubs" icon="fas fa-user-minus" color="#E74C3C" />
      <StatsCard title="نسبة التحصيل" :value="collectionRate" icon="fas fa-chart-pie" color="#F39C12" />
    </div>
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-bold text-secondary mb-4">ملخص التقارير</h3>
      <p class="text-gray-400 text-sm">سيتم إضافة الرسوم البيانية والتقارير التفصيلية قريباً...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import api from '../../api';

const subscriptionsData = ref<any[]>([]);
const paymentsData = ref<any[]>([]);

const revenue = computed(() => {
  const sum = subscriptionsData.value.reduce((s, x) => s + Number(x.price || 0), 0);
  return sum.toLocaleString() + ' د.ع';
});
const newSubs = computed(() => subscriptionsData.value.filter(s => s.status === 'active').length);
const expiredSubs = computed(() => subscriptionsData.value.filter(s => s.status === 'expired').length);
const collectionRate = computed(() => {
  const total = paymentsData.value.length;
  if (!total) return '0%';
  const paid = paymentsData.value.filter(p => p.status === 'paid').length;
  return Math.round((paid / total) * 100) + '%';
});

onMounted(async () => {
  try {
    const [subsRes, payRes] = await Promise.all([api.get('/subscriptions'), api.get('/payments')]);
    subscriptionsData.value = subsRes.data;
    paymentsData.value = payRes.data;
  } catch {}
});
</script>
