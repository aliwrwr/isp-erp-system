<template>
  <div>
    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[180px]">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
        <input v-model="search" type="text" placeholder="بحث بالعميل أو العقد..."
          class="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" />
      </div>
      <div class="flex gap-3 flex-wrap">
        <input v-model="fromDate" type="date" class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <input v-model="toDate" type="date" class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        <button @click="load" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center gap-2">
          <i class="fas fa-filter"></i> تطبيق
        </button>
        <button @click="clearFilters" class="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm hover:bg-gray-50 transition">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0"><i class="fas fa-list text-white"></i></div>
        <div><p class="text-xs text-gray-500">إجمالي الدفعات</p><p class="font-black text-secondary text-lg">{{ filtered.length }}</p></div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-green-500 flex items-center justify-center shrink-0"><i class="fas fa-coins text-white"></i></div>
        <div><p class="text-xs text-gray-500">إجمالي المبالغ</p><p class="font-black text-secondary text-lg">{{ fmt(totalAmount) }}</p></div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-blue-500 flex items-center justify-center shrink-0"><i class="fas fa-check-double text-white"></i></div>
        <div><p class="text-xs text-gray-500">مدفوعة بالكامل</p><p class="font-black text-secondary text-lg">{{ filtered.filter(p => p.status === 'paid').length }}</p></div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center shrink-0"><i class="fas fa-exclamation-triangle text-white"></i></div>
        <div><p class="text-xs text-gray-500">جزئية / متأخرة</p><p class="font-black text-secondary text-lg">{{ filtered.filter(p => p.status !== 'paid').length }}</p></div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-l from-indigo-50 to-gray-50 border-b border-gray-100">
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">#</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">التاريخ</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">العميل</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">رقم العقد</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">المنتج</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">المبلغ</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">استلم بواسطة</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-500">الحالة</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">ملاحظات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading"><td colspan="9" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl text-indigo-400 mb-2 block"></i>جاري التحميل...</td></tr>
            <tr v-else-if="filtered.length === 0"><td colspan="9" class="text-center py-12 text-gray-400"><i class="fas fa-inbox text-3xl mb-2 block"></i>لا توجد دفعات</td></tr>
            <tr v-for="(p, i) in filtered" :key="p.id" class="hover:bg-indigo-50/30 transition">
              <td class="px-5 py-3.5 text-gray-400 font-mono text-xs">{{ i + 1 }}</td>
              <td class="px-5 py-3.5 font-medium text-gray-700">{{ formatDate(p.date) }}</td>
              <td class="px-5 py-3.5">
                <p class="font-semibold text-secondary">{{ p.contract?.customer?.name }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ p.contract?.customer?.phone }}</p>
              </td>
              <td class="px-5 py-3.5">
                <router-link :to="`/installments/contracts/${p.contract?.id}`"
                  class="font-mono text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded">
                  {{ p.contract?.contractNumber }}
                </router-link>
              </td>
              <td class="px-5 py-3.5 text-gray-600 text-xs max-w-[120px] truncate">{{ p.contract?.productName }}</td>
              <td class="px-5 py-3.5 font-black text-green-600">{{ fmt(p.amount) }}</td>
              <td class="px-5 py-3.5 text-gray-500 text-sm">{{ p.receivedBy || '—' }}</td>
              <td class="px-5 py-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="{ paid: 'bg-green-100 text-green-700', partial: 'bg-amber-100 text-amber-700', late: 'bg-red-100 text-red-700' }[p.status] || 'bg-gray-100 text-gray-500'">
                  {{ { paid: 'مدفوع', partial: 'جزئي', late: 'متأخر' }[p.status] || p.status }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-gray-400 text-xs max-w-[150px] truncate">{{ p.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const payments = ref<any[]>([]);
const loading  = ref(true);
const search   = ref('');
const fromDate = ref('');
const toDate   = ref('');

const fmt = (v: number) => Number(v || 0).toLocaleString('ar-IQ') + ' د.ع';
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-IQ') : '—';

const filtered = computed(() => payments.value.filter(p => {
  const q = search.value.toLowerCase();
  const matchQ = !q || p.contract?.customer?.name?.toLowerCase().includes(q) || p.contract?.contractNumber?.toLowerCase().includes(q);
  return matchQ;
}));

const totalAmount = computed(() => filtered.value.reduce((s, p) => s + Number(p.amount || 0), 0));

function clearFilters() { search.value = ''; fromDate.value = ''; toDate.value = ''; load(); }

async function load() {
  loading.value = true;
  try {
    const params: any = {};
    if (fromDate.value) params.from = fromDate.value;
    if (toDate.value) params.to = toDate.value;
    const r = await api.get('/installments/payments', { params });
    payments.value = r.data;
  } finally { loading.value = false; }
}
onMounted(load);
</script>
