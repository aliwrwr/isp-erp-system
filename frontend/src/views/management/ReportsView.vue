<template>
  <div class="space-y-6" dir="rtl">
    <!-- Header & Period selector -->
    <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <div>
        <h2 class="text-xl font-black text-gray-800 flex items-center gap-2">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <i class="fas fa-chart-pie"></i>
          </div>
          التقارير الشاملة
        </h2>
        <p class="text-sm text-gray-500 mt-1 pl-12">نظرة عامة على أداء جميع الأنظمة</p>
      </div>

      <!-- System Tabs -->
      <div class="flex flex-wrap items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button v-for="tab in systemTabs" :key="tab.id" @click="activeSystemTab = tab.id; fetchData()"
          class="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="activeSystemTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ tab.label }}
        </button>
      </div>

      <div class="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
        <button v-for="p in periods" :key="p.id" @click="setPeriod(p.id)"
          class="px-5 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="selectedPeriod === p.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Main Stat Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-wallet text-xl"></i>
            </div>
            <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              إجمالي الدخل
            </span>
          </div>
          <div>
            <h3 class="text-3xl font-black font-mono tracking-tight">{{ data?.totalIncome?.toLocaleString('ar-IQ') || 0 }}</h3>
            <p class="text-blue-100 text-sm mt-1 font-medium">دينار عراقي</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-file-invoice-dollar text-xl"></i>
            </div>
            <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
              إجمالي المصروفات
            </span>
          </div>
          <div>
            <h3 class="text-3xl font-black font-mono tracking-tight">{{ data?.totalExpenses?.toLocaleString('ar-IQ') || 0 }}</h3>
            <p class="text-rose-100 text-sm mt-1 font-medium">دينار عراقي</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-coins text-xl"></i>
            </div>
            <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
              صافي الأرباح
            </span>
          </div>
          <div>
            <h3 class="text-3xl font-black font-mono tracking-tight">{{ data?.netProfit?.toLocaleString('ar-IQ') || 0 }}</h3>
            <p class="text-teal-100 text-sm mt-1 font-medium">دينار عراقي</p>
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div class="relative z-10">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <i class="fas fa-users text-xl"></i>
            </div>
            <span class="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
              المشتركين النشطين
            </span>
          </div>
          <div>
            <h3 class="text-3xl font-black font-mono tracking-tight">{{ data?.activeSubscribers?.toLocaleString('ar-IQ') || 0 }}</h3>
            <p class="text-purple-100 text-sm mt-1 font-medium">مشترك فعّال</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Income breakdown -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i class="fas fa-layer-group text-blue-500"></i>
          تحليل مصادر الدخل
        </h3>
        
        <div class="space-y-4">
          <!-- Internet -->
          <div class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="fas fa-wifi"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-gray-700">الإنترنت والاشتراكات</span>
                <span class="text-sm font-bold text-gray-900 font-mono">{{ data?.breakdown?.internet?.toLocaleString('ar-IQ') || 0 }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-blue-500 h-2 rounded-full" :style="{ width: percent(data?.breakdown?.internet) }"></div>
              </div>
            </div>
          </div>
          <!-- Sales -->
          <div class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-gray-700">المبيعات ونقاط البيع</span>
                <span class="text-sm font-bold text-gray-900 font-mono">{{ data?.breakdown?.sales?.toLocaleString('ar-IQ') || 0 }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-emerald-500 h-2 rounded-full" :style="{ width: percent(data?.breakdown?.sales) }"></div>
              </div>
            </div>
          </div>
          <!-- Installments -->
          <div class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-gray-700">الأقساط (الدفعات المستلمة)</span>
                <span class="text-sm font-bold text-gray-900 font-mono">{{ data?.breakdown?.installments?.toLocaleString('ar-IQ') || 0 }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-indigo-500 h-2 rounded-full" :style="{ width: percent(data?.breakdown?.installments) }"></div>
              </div>
            </div>
          </div>
          <!-- Restaurant -->
          <div class="flex items-center gap-4 group">
            <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <i class="fas fa-utensils"></i>
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-bold text-gray-700">المطاعم والكافيهات</span>
                <span class="text-sm font-bold text-gray-900 font-mono">{{ data?.breakdown?.restaurant?.toLocaleString('ar-IQ') || 0 }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full" :style="{ width: percent(data?.breakdown?.restaurant) }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Summary Details -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
        <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <i class="fas fa-info-circle text-purple-500"></i>
          ملخص وحالة النظام
        </h3>

        <div class="flex-1 bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-center gap-6 relative overflow-hidden">
          <div class="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500"></div>
          
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-500 font-medium">معدل الدخل الإجمالي للاشتراكات مقارنة بالمصروفات</p>
              <h4 class="text-2xl font-black text-gray-800 mt-1 font-mono" dir="ltr">
                {{ ((data?.totalIncome || 0) > 0 ? (((data?.totalIncome || 0) - (data?.totalExpenses || 0)) / (data?.totalIncome || 1) * 100).toFixed(1) : 0) }}%
              </h4>
            </div>
            <div class="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-xl text-teal-600 border border-teal-100">
              <i class="fas fa-percent"></i>
            </div>
          </div>

          <div class="h-px bg-gray-200"></div>

          <div class="flex items-center gap-3">
             <i class="fas fa-clock text-amber-500"></i>
             <p class="text-sm text-gray-600">آخر تحديث للبيانات: <span class="font-bold font-mono">{{ new Date().toLocaleTimeString('ar-IQ') }}</span></p>
             <button @click="fetchData" class="mx-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition">تحديث الآن</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const periods = [
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'هذا الأسبوع' },
  { id: 'month', label: 'هذا الشهر' },
  { id: 'year', label: 'هذا العام' },
];

const selectedPeriod = ref('month');
const activeSystemTab = ref('all');

const systemTabs = [
  { id: 'all', label: 'الكل' },
  { id: 'internet', label: 'الانترنت' },
  { id: 'sales', label: 'المبيعات' },
  { id: 'installments', label: 'الاقساط' },
  { id: 'restaurant', label: 'المطعم' },
];

const data = ref<any>({});
const loading = ref(false);

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/global-reports/dashboard', { params: { period: selectedPeriod.value, system: activeSystemTab.value === 'all' ? undefined : activeSystemTab.value } });
    data.value = res.data;
  } catch (err) {
    console.error('Failed to fetch global reports', err);
  } finally {
    loading.value = false;
  }
}

function setPeriod(p: string) {
  selectedPeriod.value = p;
  fetchData();
}

function percent(val: number | undefined) {
  if (!val || !data.value?.totalIncome) return '0%';
  return Math.round((val / data.value.totalIncome) * 100) + '%';
}

onMounted(() => {
  fetchData();
});
</script>