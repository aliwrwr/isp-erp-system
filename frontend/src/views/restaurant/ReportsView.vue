<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-secondary">تقارير المطعم</h2>
        <p class="text-xs text-gray-400 mt-0.5">
          {{ rangeLabel }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="printReport"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-600 bg-white hover:border-secondary hover:text-secondary hover:shadow-md transition-all duration-200 focus:outline-none">
          <i class="fas fa-print"></i>
          <span class="hidden sm:inline">طباعة</span>
        </button>
        <button @click="load"
          :disabled="loading"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-restaurant text-white shadow-md shadow-restaurant/25 hover:opacity-90 hover:scale-105 transition-all duration-200 focus:outline-none disabled:opacity-60">
          <i class="fas fa-sync-alt" :class="loading && 'fa-spin'"></i>
          <span class="hidden sm:inline">تحديث</span>
        </button>
      </div>
    </div>

    <!-- Toolbar: Quick filters + Date range -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Quick filter buttons -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-xs font-bold text-gray-400 ml-2">فترة زمنية:</span>
          <button v-for="q in quickFilters" :key="q.key"
            @click="applyQuick(q.key)"
            :class="activeQuick === q.key
              ? 'bg-restaurant text-white shadow-md shadow-restaurant/25 scale-105'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-restaurant/40 hover:text-restaurant'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 focus:outline-none">
            {{ q.label }}
          </button>
        </div>

        <!-- Divider -->
        <div class="w-px h-8 bg-gray-200 hidden sm:block"></div>

        <!-- Custom date range -->
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-gray-400">من:</span>
          <input type="date" v-model="dateFrom"
            class="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-restaurant focus:ring-1 focus:ring-restaurant/20 transition" />
          <span class="text-xs font-bold text-gray-400">إلى:</span>
          <input type="date" v-model="dateTo"
            class="border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-restaurant focus:ring-1 focus:ring-restaurant/20 transition" />
          <button @click="applyCustom"
            class="px-4 py-1.5 rounded-xl text-xs font-bold bg-secondary text-white hover:opacity-90 transition focus:outline-none">
            <i class="fas fa-search ml-1"></i> بحث
          </button>
          <button v-if="activeQuick !== 'all'" @click="applyQuick('all')"
            class="px-3 py-1.5 rounded-xl text-xs font-bold border border-red-200 text-red-400 hover:bg-red-50 transition focus:outline-none">
            <i class="fas fa-times"></i> إلغاء
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-400 py-16">
      <i class="fas fa-spinner fa-spin text-4xl text-restaurant mb-3"></i>
      <p class="text-sm">جاري تحميل التقارير...</p>
    </div>

    <template v-else-if="data">
      <!-- Summary Cards -->
      <div id="print-area">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <i class="fas fa-receipt text-blue-500"></i>
              </div>
              <span class="text-xs text-gray-400 font-medium">إجمالي الطلبات</span>
            </div>
            <p class="text-2xl font-bold text-secondary">{{ data.totalOrders }}</p>
            <p class="text-xs text-gray-400 mt-1">اليوم: <span class="font-bold text-blue-500">{{ data.todayOrders }}</span></p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="fas fa-check-circle text-green-500"></i>
              </div>
              <span class="text-xs text-gray-400 font-medium">طلبات مدفوعة</span>
            </div>
            <p class="text-2xl font-bold text-green-600">{{ data.paidOrders }}</p>
            <p class="text-xs text-gray-400 mt-1">ملغية: <span class="font-bold text-red-400">{{ data.cancelledOrders }}</span></p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-restaurant/10 flex items-center justify-center">
                <i class="fas fa-coins text-restaurant"></i>
              </div>
              <span class="text-xs text-gray-400 font-medium">إجمالي الإيرادات</span>
            </div>
            <p class="text-2xl font-bold text-restaurant">{{ data.totalRevenue.toFixed(2) }}</p>
            <p class="text-xs text-gray-400 mt-1">اليوم: <span class="font-bold text-restaurant">{{ data.todayRevenue.toFixed(2) }}</span></p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <i class="fas fa-money-bill text-red-400"></i>
              </div>
              <span class="text-xs text-gray-400 font-medium">إجمالي المصروفات</span>
            </div>
            <p class="text-2xl font-bold text-danger">{{ data.totalExpenses.toFixed(2) }}</p>
            <p class="text-xs text-gray-400 mt-1">اليوم: <span class="font-bold text-danger">{{ data.todayExpenses.toFixed(2) }}</span></p>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
            :class="data.netProfit >= 0 ? 'border-green-100' : 'border-red-100'">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="data.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'">
                <i class="fas fa-chart-line" :class="data.netProfit >= 0 ? 'text-green-500' : 'text-red-500'"></i>
              </div>
              <span class="text-xs text-gray-400 font-medium">صافي الربح</span>
            </div>
            <p class="text-2xl font-bold" :class="data.netProfit >= 0 ? 'text-green-600' : 'text-red-500'">
              {{ data.netProfit.toFixed(2) }}
            </p>
            <p class="text-xs text-gray-400 mt-1">اليوم: <span class="font-bold" :class="data.todayProfit >= 0 ? 'text-green-500' : 'text-red-400'">{{ data.todayProfit.toFixed(2) }}</span></p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Daily Revenue Chart -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-secondary flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-restaurant/10 flex items-center justify-center">
                  <i class="fas fa-chart-bar text-restaurant text-xs"></i>
                </span>
                الإيرادات اليومية
              </h3>
              <span class="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                {{ data.dailyData.filter((x: any) => x.revenue > 0 || x.expenses > 0).length }} يوم
              </span>
            </div>
            <div class="space-y-1 max-h-[380px] overflow-y-auto custom-scrollbar pl-1">
              <div v-for="d in data.dailyData.filter((x: any) => x.revenue > 0 || x.expenses > 0)"
                :key="d.date"
                class="flex items-center gap-2 text-xs py-1.5 hover:bg-gray-50 rounded-lg px-1 transition group">
                <span class="w-16 text-gray-400 shrink-0 font-medium">{{ formatDate(d.date) }}</span>
                <div class="flex-1 flex flex-col gap-0.5">
                  <div class="flex items-center gap-1 h-3">
                    <div class="h-3 rounded-full bg-green-400 transition-all"
                      :style="{ width: barWidth(d.revenue, maxRevenue) + '%', minWidth: d.revenue > 0 ? '6px' : '0' }"></div>
                  </div>
                  <div v-if="d.expenses > 0" class="flex items-center gap-1 h-2">
                    <div class="h-2 rounded-full bg-red-300 transition-all"
                      :style="{ width: barWidth(d.expenses, maxRevenue) + '%', minWidth: '4px' }"></div>
                  </div>
                </div>
                <div class="text-left shrink-0 min-w-[90px]">
                  <span class="text-green-600 font-bold">{{ d.revenue.toFixed(0) }}</span>
                  <span v-if="d.expenses > 0" class="text-red-400 mr-1 text-[10px]"> -{{ d.expenses.toFixed(0) }}</span>
                </div>
              </div>
              <div v-if="data.dailyData.every((x: any) => x.revenue === 0 && x.expenses === 0)"
                class="text-center text-gray-300 py-8">
                <i class="fas fa-chart-bar text-3xl mb-2"></i>
                <p>لا توجد بيانات في هذه الفترة</p>
              </div>
            </div>
            <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-green-400 inline-block"></span> إيرادات</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-300 inline-block"></span> مصروفات</span>
            </div>
          </div>

          <!-- Top Selling Items -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-secondary flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <i class="fas fa-trophy text-yellow-500 text-xs"></i>
                </span>
                أكثر الأصناف مبيعاً
              </h3>
              <span class="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">أفضل {{ data.topItems.length }}</span>
            </div>
            <div class="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar">
              <div v-for="(item, idx) in data.topItems" :key="item.name"
                class="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition group">
                <span class="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                  :class="(idx as number) === 0 ? 'bg-yellow-100 text-yellow-700' : (idx as number) === 1 ? 'bg-gray-100 text-gray-600' : (idx as number) === 2 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'">
                  {{ (idx as number) < 3 ? ['🥇','🥈','🥉'][idx as number] : (idx as number) + 1 }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-secondary truncate">{{ item.name }}</p>
                  <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                    <div class="bg-restaurant h-1.5 rounded-full transition-all"
                      :style="{ width: (item.revenue / (data.topItems[0]?.revenue || 1) * 100) + '%' }"></div>
                  </div>
                </div>
                <div class="text-left shrink-0">
                  <p class="text-sm font-bold text-restaurant">{{ item.revenue.toFixed(0) }} <span class="text-[10px] font-normal">د.ع</span></p>
                  <p class="text-[10px] text-gray-400">{{ item.quantity }} وحدة</p>
                </div>
              </div>
              <div v-if="data.topItems.length === 0" class="text-center text-gray-300 py-8">
                <i class="fas fa-trophy text-3xl mb-2"></i>
                <p>لا توجد بيانات</p>
              </div>
            </div>
          </div>

          <!-- Expenses by Category -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-secondary flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <i class="fas fa-pie-chart text-danger text-xs"></i>
                </span>
                المصروفات حسب التصنيف
              </h3>
              <span class="text-sm font-bold text-danger">
                {{ data.totalExpenses.toFixed(2) }} <span class="text-[10px] font-normal text-gray-400">د.ع</span>
              </span>
            </div>
            <div class="space-y-3">
              <div v-for="(amount, cat) in data.expensesByCategory" :key="cat"
                class="flex items-center gap-3 group">
                <span class="text-xs px-2.5 py-1 rounded-xl font-bold w-24 text-center shrink-0"
                  :class="expCatClass(cat as string)">{{ expCatLabel(cat as string) }}</span>
                <div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div class="h-3 rounded-full transition-all duration-500"
                    :class="expCatBar(cat as string)"
                    :style="{ width: (Number(amount) / data.totalExpenses * 100) + '%' }"></div>
                </div>
                <div class="text-left shrink-0 min-w-[80px]">
                  <span class="text-sm font-bold text-secondary">{{ Number(amount).toFixed(0) }}</span>
                  <span class="text-[10px] text-gray-400 mr-1">
                    ({{ (Number(amount) / data.totalExpenses * 100).toFixed(0) }}%)
                  </span>
                </div>
              </div>
              <div v-if="Object.keys(data.expensesByCategory).length === 0"
                class="text-center text-gray-300 py-8">
                <i class="fas fa-receipt text-3xl mb-2"></i>
                <p>لا توجد مصروفات</p>
              </div>
            </div>
          </div>

          <!-- Orders Summary -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-secondary flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                  <i class="fas fa-chart-pie text-blue-500 text-xs"></i>
                </span>
                ملخص الطلبات
              </h3>
            </div>
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-green-50 rounded-2xl p-4 text-center border border-green-100">
                <p class="text-3xl font-bold text-green-700">{{ data.paidOrders }}</p>
                <p class="text-xs text-green-600 mt-1 font-medium">مدفوعة</p>
              </div>
              <div class="bg-red-50 rounded-2xl p-4 text-center border border-red-100">
                <p class="text-3xl font-bold text-red-500">{{ data.cancelledOrders }}</p>
                <p class="text-xs text-red-500 mt-1 font-medium">ملغية</p>
              </div>
              <div class="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <p class="text-3xl font-bold text-blue-700">{{ data.todayOrders }}</p>
                <p class="text-xs text-blue-600 mt-1 font-medium">طلبات اليوم</p>
              </div>
              <div class="bg-restaurant/5 rounded-2xl p-4 text-center border border-restaurant/10">
                <p class="text-3xl font-bold text-restaurant">{{ data.totalOrders }}</p>
                <p class="text-xs text-restaurant mt-1 font-medium">إجمالي الطلبات</p>
              </div>
            </div>
            <div class="space-y-2 pt-3 border-t border-gray-100">
              <div class="flex justify-between items-center py-1.5 px-2 rounded-xl hover:bg-gray-50 transition">
                <span class="text-xs text-gray-500 font-medium">متوسط قيمة الطلب</span>
                <span class="text-sm font-bold text-secondary">
                  {{ data.paidOrders > 0 ? (data.totalRevenue / data.paidOrders).toFixed(2) : '0.00' }}
                  <span class="text-[10px] font-normal text-gray-400">د.ع</span>
                </span>
              </div>
              <div class="flex justify-between items-center py-1.5 px-2 rounded-xl hover:bg-gray-50 transition">
                <span class="text-xs text-gray-500 font-medium">نسبة الإلغاء</span>
                <span class="text-sm font-bold" :class="cancelRate > 20 ? 'text-red-500' : 'text-green-600'">
                  {{ cancelRate.toFixed(1) }}%
                </span>
              </div>
              <div class="flex justify-between items-center py-1.5 px-2 rounded-xl hover:bg-gray-50 transition">
                <span class="text-xs text-gray-500 font-medium">هامش الربح</span>
                <span class="text-sm font-bold" :class="profitMargin >= 0 ? 'text-green-600' : 'text-red-500'">
                  {{ profitMargin.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading" class="text-center text-gray-300 py-16">
      <i class="fas fa-chart-bar text-5xl mb-4"></i>
      <p class="text-lg font-medium">لا توجد بيانات</p>
      <p class="text-sm mt-1">اضغط تحديث لتحميل التقارير</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const data = ref<any>(null);
const loading = ref(true);
const dateFrom = ref('');
const dateTo = ref('');
const activeQuick = ref('all');

const quickFilters = [
  { key: 'today',     label: 'اليوم' },
  { key: 'yesterday', label: 'الأمس' },
  { key: 'week',      label: 'هذا الأسبوع' },
  { key: 'month',     label: 'هذا الشهر' },
  { key: 'last3',     label: 'آخر 3 أشهر' },
  { key: 'all',       label: 'الكل' },
];

const rangeLabel = computed(() => {
  if (activeQuick.value === 'today') return 'عرض: اليوم';
  if (activeQuick.value === 'yesterday') return 'عرض: الأمس';
  if (activeQuick.value === 'week') return 'عرض: هذا الأسبوع';
  if (activeQuick.value === 'month') return 'عرض: هذا الشهر';
  if (activeQuick.value === 'last3') return 'عرض: آخر 3 أشهر';
  if (dateFrom.value || dateTo.value) return `عرض: ${dateFrom.value || '...'} → ${dateTo.value || '...'}`;
  return 'عرض: جميع البيانات';
});

const maxRevenue = computed(() =>
  data.value
    ? Math.max(...data.value.dailyData.map((d: any) => Math.max(d.revenue, d.expenses)), 1)
    : 1
);

const cancelRate = computed(() =>
  data.value && data.value.totalOrders > 0
    ? (data.value.cancelledOrders / data.value.totalOrders) * 100
    : 0
);

const profitMargin = computed(() =>
  data.value && data.value.totalRevenue > 0
    ? (data.value.netProfit / data.value.totalRevenue) * 100
    : 0
);

function applyQuick(key: string) {
  activeQuick.value = key;
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  if (key === 'today') {
    dateFrom.value = fmt(today);
    dateTo.value = fmt(today);
  } else if (key === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    dateFrom.value = fmt(y);
    dateTo.value = fmt(y);
  } else if (key === 'week') {
    const start = new Date(today);
    start.setDate(today.getDate() - today.getDay());
    dateFrom.value = fmt(start);
    dateTo.value = fmt(today);
  } else if (key === 'month') {
    dateFrom.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    dateTo.value = fmt(today);
  } else if (key === 'last3') {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 3);
    dateFrom.value = fmt(start);
    dateTo.value = fmt(today);
  } else {
    dateFrom.value = '';
    dateTo.value = '';
  }
  load();
}

function applyCustom() {
  activeQuick.value = 'custom';
  load();
}

async function load() {
  loading.value = true;
  const params: Record<string, string> = {};
  if (dateFrom.value) params.from = dateFrom.value;
  if (dateTo.value) params.to = dateTo.value;
  data.value = (await api.get('/restaurant/reports/summary', { params })).data;
  loading.value = false;
}

function barWidth(val: number, max: number) {
  return max > 0 ? Math.min((val / max) * 100, 100) : 0;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar', { month: 'short', day: 'numeric' });
}

function expCatClass(c: string) {
  return ({
    ingredients: 'bg-green-50 text-green-700',
    maintenance: 'bg-blue-50 text-blue-700',
    salaries: 'bg-purple-50 text-purple-700',
    utilities: 'bg-yellow-50 text-yellow-700',
    general: 'bg-gray-100 text-gray-600',
  } as Record<string, string>)[c] ?? 'bg-gray-100 text-gray-600';
}

function expCatLabel(c: string) {
  return ({
    ingredients: 'مواد أولية',
    maintenance: 'صيانة',
    salaries: 'رواتب',
    utilities: 'خدمات',
    general: 'عام',
  } as Record<string, string>)[c] ?? c;
}

function expCatBar(c: string) {
  return ({
    ingredients: 'bg-green-400',
    maintenance: 'bg-blue-400',
    salaries: 'bg-purple-400',
    utilities: 'bg-yellow-400',
    general: 'bg-gray-400',
  } as Record<string, string>)[c] ?? 'bg-gray-400';
}

function printReport() {
  const content = document.getElementById('print-area')?.innerHTML ?? '';
  const title = `تقارير المطعم — ${rangeLabel.value}`;
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    * { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
    body { margin: 20px; background: #fff; color: #333; }
    h1 { font-size: 18px; color: #2C3E50; border-bottom: 2px solid #D35400; padding-bottom: 8px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-bottom: 20px; }
    .card { border: 1px solid #eee; border-radius: 12px; padding: 12px; }
    .card p { margin: 4px 0; font-size: 13px; }
    .big { font-size: 22px; font-weight: 800; margin: 6px 0; }
    .section { border: 1px solid #eee; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
    .section h3 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #2C3E50; }
    .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; font-size: 12px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <script>window.onload = () => { window.print(); }<\/script>
</body></html>`);
  win.document.close();
}

onMounted(load);
</script>
