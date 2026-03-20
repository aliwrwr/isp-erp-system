<template>
  <div>
    <!-- Date Range Selector -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <div class="flex flex-col sm:flex-row gap-3 items-end">
        <div class="flex-1">
          <label class="text-xs font-semibold text-gray-500 mb-1 block">من تاريخ</label>
          <input v-model="fromDate" type="date" class="input-field" />
        </div>
        <div class="flex-1">
          <label class="text-xs font-semibold text-gray-500 mb-1 block">إلى تاريخ</label>
          <input v-model="toDate" type="date" class="input-field" />
        </div>
        <div class="flex gap-2">
          <button @click="setPreset('today')" class="px-3 py-2 text-xs border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-gray-500 transition">اليوم</button>
          <button @click="setPreset('week')" class="px-3 py-2 text-xs border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-gray-500 transition">هذا الأسبوع</button>
          <button @click="setPreset('month')" class="px-3 py-2 text-xs border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-gray-500 transition">هذا الشهر</button>
          <button @click="setPreset('year')" class="px-3 py-2 text-xs border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-gray-500 transition">هذا العام</button>
          <button @click="load" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
            <i class="fas fa-chart-bar"></i> عرض
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400">
      <i class="fas fa-spinner fa-spin text-3xl text-indigo-400 mb-3 block"></i>جاري التحميل...
    </div>

    <template v-else-if="data">
      <!-- Stat Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0"><i class="fas fa-file-contract text-white"></i></div>
          <div><p class="text-xs text-gray-500">إجمالي العقود</p><p class="font-black text-secondary text-xl">{{ data.totalContracts }}</p></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shrink-0"><i class="fas fa-money-bill-wave text-white"></i></div>
          <div><p class="text-xs text-gray-500">إجمالي المحصل</p><p class="font-black text-secondary text-lg leading-tight">{{ fmt(data.totalCollected) }}</p></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0"><i class="fas fa-hourglass-half text-white"></i></div>
          <div><p class="text-xs text-gray-500">المتبقي للتحصيل</p><p class="font-black text-secondary text-lg leading-tight">{{ fmt(data.totalRemaining) }}</p></div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-red-500 flex items-center justify-center shrink-0"><i class="fas fa-exclamation-circle text-white"></i></div>
          <div><p class="text-xs text-gray-500">عقود متأخرة</p><p class="font-black text-secondary text-xl">{{ data.lateContracts }}</p></div>
        </div>
      </div>

      <!-- Contract Status Breakdown -->
      <div class="grid md:grid-cols-2 gap-4 mb-5">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-black text-secondary mb-4 flex items-center gap-2"><i class="fas fa-chart-pie text-indigo-500"></i> توزيع العقود حسب الحالة</h3>
          <div class="space-y-3">
            <div v-for="s in statusBreakdown" :key="s.key" class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full shrink-0" :style="`background:${s.color}`"></span>
              <span class="text-sm text-gray-600 flex-1">{{ s.label }}</span>
              <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :style="`width:${s.pct}%;background:${s.color}`"></div>
              </div>
              <span class="w-8 text-right font-bold text-sm text-gray-700">{{ s.count }}</span>
            </div>
          </div>
        </div>

        <!-- Payments in period -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 class="font-black text-secondary mb-4 flex items-center gap-2"><i class="fas fa-coins text-indigo-500"></i> دفعات الفترة</h3>
          <div class="text-center py-4">
            <p class="text-4xl font-black text-indigo-600">{{ data.paymentsInPeriod?.length || 0 }}</p>
            <p class="text-sm text-gray-500 mt-1">دفعة مسجلة</p>
            <p class="text-2xl font-black text-green-600 mt-3">{{ fmt(periodTotal) }}</p>
            <p class="text-sm text-gray-500">إجمالي دفعات الفترة</p>
          </div>
        </div>
      </div>

      <!-- Payments List -->
      <div v-if="data.paymentsInPeriod?.length" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-black text-secondary flex items-center gap-2"><i class="fas fa-list-alt text-indigo-500"></i> تفاصيل الدفعات ({{ fromDate || '...' }} — {{ toDate || '...' }})</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">التاريخ</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">العميل</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">رقم العقد</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">المبلغ</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">استلم بواسطة</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="p in data.paymentsInPeriod" :key="p.id" class="hover:bg-indigo-50/20 transition">
                <td class="px-5 py-3 text-gray-700">{{ formatDate(p.date) }}</td>
                <td class="px-5 py-3 font-semibold text-secondary">{{ p.contract?.customer?.name }}</td>
                <td class="px-5 py-3">
                  <router-link :to="`/installments/contracts/${p.contract?.id}`"
                    class="font-mono text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded">
                    {{ p.contract?.contractNumber }}
                  </router-link>
                </td>
                <td class="px-5 py-3 font-black text-green-600">{{ fmt(p.amount) }}</td>
                <td class="px-5 py-3 text-gray-500">{{ p.receivedBy || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const data     = ref<any>(null);
const loading  = ref(false);

const now = new Date();
const fromDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
const toDate   = ref(now.toISOString().split('T')[0]);

const fmt = (v: number) => Number(v || 0).toLocaleString('ar-IQ') + ' د.ع';
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-IQ') : '—';

const periodTotal = computed(() => (data.value?.paymentsInPeriod || []).reduce((s: number, p: any) => s + Number(p.amount || 0), 0));

const statusBreakdown = computed(() => {
  if (!data.value) return [];
  const total = data.value.totalContracts || 1;
  return [
    { key: 'active',    label: 'نشط',    color: '#22C55E', count: data.value.activeContracts,    pct: Math.round((data.value.activeContracts / total) * 100) },
    { key: 'late',      label: 'متأخر',  color: '#EF4444', count: data.value.lateContracts,      pct: Math.round((data.value.lateContracts / total) * 100)   },
    { key: 'completed', label: 'مكتمل',  color: '#3B82F6', count: data.value.completedContracts, pct: Math.round((data.value.completedContracts / total) * 100) },
    { key: 'cancelled', label: 'ملغي',   color: '#9CA3AF', count: data.value.cancelledContracts, pct: Math.round((data.value.cancelledContracts / total) * 100) },
  ];
});

function setPreset(p: string) {
  const now = new Date();
  if (p === 'today') { fromDate.value = toDate.value = now.toISOString().split('T')[0]; }
  else if (p === 'week') {
    const mon = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
    fromDate.value = mon.toISOString().split('T')[0]; toDate.value = now.toISOString().split('T')[0];
  } else if (p === 'month') {
    fromDate.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    toDate.value = now.toISOString().split('T')[0];
  } else if (p === 'year') {
    fromDate.value = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    toDate.value = now.toISOString().split('T')[0];
  }
}

async function load() {
  loading.value = true;
  try {
    const params: any = {};
    if (fromDate.value) params.from = fromDate.value;
    if (toDate.value) params.to = toDate.value;
    const r = await api.get('/installments/reports', { params });
    data.value = r.data;
  } finally { loading.value = false; }
}
onMounted(load);
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
</style>
