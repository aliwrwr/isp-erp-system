<template>
  <div class="space-y-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <i class="fas fa-users text-blue-600 text-lg"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">إجمالي العملاء</p>
          <p class="text-2xl font-black text-secondary">{{ stats.totalCustomers ?? '—' }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <i class="fas fa-file-contract text-indigo-600 text-lg"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">العقود النشطة</p>
          <p class="text-2xl font-black text-secondary">{{ stats.activeContracts ?? '—' }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <i class="fas fa-coins text-green-600 text-lg"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">إجمالي التحصيل</p>
          <p class="text-xl font-black text-green-600">{{ formatCurrency(stats.totalCollected) }}</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          :class="stats.overdueContracts > 0 ? 'bg-red-100' : 'bg-amber-100'">
          <i class="fas fa-exclamation-triangle text-lg"
            :class="stats.overdueContracts > 0 ? 'text-red-500' : 'text-amber-500'"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 mb-0.5">عقود متأخرة</p>
          <p class="text-2xl font-black" :class="stats.overdueContracts > 0 ? 'text-red-500' : 'text-secondary'">
            {{ stats.overdueContracts ?? '—' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Secondary row -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-gradient-to-l from-indigo-600 to-blue-500 rounded-2xl p-5 text-white shadow-lg shadow-indigo-100">
        <p class="text-sm text-white/70 mb-1">إجمالي العقود</p>
        <p class="text-3xl font-black">{{ stats.totalContracts ?? 0 }}</p>
        <p class="text-xs text-white/60 mt-2">منها {{ stats.lateContracts ?? 0 }} متأخرة</p>
      </div>
      <div class="bg-gradient-to-l from-emerald-600 to-teal-500 rounded-2xl p-5 text-white shadow-lg shadow-emerald-100">
        <p class="text-sm text-white/70 mb-1">المبالغ المحصلة</p>
        <p class="text-2xl font-black">{{ formatCurrency(stats.totalCollected) }}</p>
        <p class="text-xs text-white/60 mt-2">من إجمالي عقود</p>
      </div>
      <div class="bg-gradient-to-l from-orange-500 to-amber-400 rounded-2xl p-5 text-white shadow-lg shadow-orange-100">
        <p class="text-sm text-white/70 mb-1">المبالغ المتبقية</p>
        <p class="text-2xl font-black">{{ formatCurrency(stats.totalRemaining) }}</p>
        <p class="text-xs text-white/60 mt-2">على العملاء</p>
      </div>
    </div>

    <!-- Recent Contracts -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <h3 class="font-bold text-secondary text-sm flex items-center gap-2">
          <i class="fas fa-clock text-indigo-400"></i> آخر العقود
        </h3>
        <router-link to="/installments/contracts"
          class="text-xs text-indigo-500 hover:text-indigo-700 font-semibold flex items-center gap-1">
          عرض الكل <i class="fas fa-arrow-left text-[10px]"></i>
        </router-link>
      </div>
      <div v-if="loading" class="py-10 text-center">
        <i class="fas fa-spinner fa-spin text-2xl text-indigo-400"></i>
      </div>
      <div v-else-if="!stats.recentContracts?.length" class="py-10 text-center text-gray-400 text-sm">
        لا توجد عقود بعد
      </div>
      <div v-else class="divide-y divide-gray-50">
        <div v-for="c in stats.recentContracts" :key="c.id"
          class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/60 transition">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <i class="fas fa-file-contract text-indigo-400 text-sm"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-secondary truncate">{{ c.productName }}</p>
            <p class="text-xs text-gray-400 font-mono">{{ c.contractNumber }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm font-black text-indigo-600">{{ formatCurrency(c.totalPrice) }}</p>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-semibold" :class="statusClass(c.status)">
              {{ statusLabel(c.status) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const stats   = ref<any>({});
const loading = ref(true);

function formatCurrency(v: any) {
  return Number(v || 0).toLocaleString('ar-IQ') + ' د.ع';
}
function statusClass(s: string) {
  return {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    late: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  }[s] || 'bg-gray-100 text-gray-500';
}
function statusLabel(s: string) {
  return { active: 'نشط', completed: 'مكتمل', late: 'متأخر', cancelled: 'ملغي' }[s] || s;
}

async function load() {
  try {
    const r = await api.get('/installments/dashboard');
    stats.value = r.data;
  } finally { loading.value = false; }
}
onMounted(load);
</script>
