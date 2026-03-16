<template>
  <div class="flex flex-col gap-5">

    <!-- Page Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-secondary">تقارير الاشتراكات</h2>
        <p class="text-sm text-gray-400 mt-0.5">تحليل شامل لأداء الاشتراكات والإيرادات</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Filter: Month/Year -->
        <select v-model="filterYear" class="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="filterMonth" class="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">كل الأشهر</option>
          <option v-for="(name, idx) in monthNames" :key="idx" :value="idx + 1">{{ name }}</option>
        </select>
        <button @click="loadData" class="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition shadow-sm">
          <i class="fas fa-sync-alt text-xs" :class="{'animate-spin': loading}"></i> تحديث
        </button>
        <button @click="printReport" class="flex items-center gap-1.5 text-sm border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm">
          <i class="fas fa-print text-xs"></i> طباعة
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>

    <template v-else>

      <!-- ─── Summary Cards ─── -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        <div v-for="card in summaryCards" :key="card.label"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400 font-medium">{{ card.label }}</span>
            <div class="w-9 h-9 rounded-xl flex items-center justify-center" :style="{background: card.color + '18'}">
              <i :class="card.icon" class="text-sm" :style="{color: card.color}"></i>
            </div>
          </div>
          <div class="text-xl font-bold text-secondary leading-none">{{ card.value }}</div>
          <div v-if="card.sub" class="text-xs" :class="card.subColor || 'text-gray-400'">{{ card.sub }}</div>
        </div>
      </div>

      <!-- ─── Charts Row 1 ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Monthly Revenue Bar Chart -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-secondary text-sm">الإيرادات الشهرية</h3>
            <span class="text-xs text-gray-400">آخر 6 أشهر</span>
          </div>
          <div class="relative h-52">
            <Bar v-if="revenueChartData.labels.length" :data="revenueChartData" :options="barOptions" />
            <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">لا توجد بيانات</div>
          </div>
        </div>

        <!-- Package Distribution Doughnut -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-secondary text-sm">توزيع الباقات</h3>
            <span class="text-xs text-gray-400">الاشتراكات النشطة</span>
          </div>
          <div class="relative h-40 flex items-center justify-center">
            <Doughnut v-if="packageChartData.labels.length" :data="packageChartData" :options="doughnutOptions" />
            <div v-else class="text-gray-300 text-sm">لا توجد بيانات</div>
          </div>
          <!-- Legend -->
          <div class="mt-3 flex flex-col gap-1.5">
            <div v-for="(label, i) in packageChartData.labels" :key="i" class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{background: chartColors[i % chartColors.length]}"></div>
                <span class="text-gray-600">{{ label }}</span>
              </div>
              <span class="font-semibold text-secondary">{{ packageChartData.datasets[0]?.data[i] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Charts Row 2 ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Payment Methods Bar -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-secondary text-sm mb-4">طرق الدفع</h3>
          <div class="relative h-44">
            <Bar v-if="paymentChartData.labels.length" :data="paymentChartData" :options="barOptions" />
            <div v-else class="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">لا توجد بيانات</div>
          </div>
        </div>

        <!-- Status Distribution -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-secondary text-sm mb-4">حالة الاشتراكات</h3>
          <div class="flex flex-col gap-3 mt-2">
            <div v-for="item in statusBreakdown" :key="item.label" class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full" :style="{background: item.color}"></div>
                  <span class="text-gray-600 font-medium">{{ item.label }}</span>
                </div>
                <span class="font-bold text-secondary">{{ item.count }} <span class="text-gray-400 font-normal">({{ item.pct }}%)</span></span>
              </div>
              <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700" :style="{width: item.pct + '%', background: item.color}"></div>
              </div>
            </div>
          </div>

          <!-- Debt Summary -->
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
              <div class="text-xs text-red-400 mb-1">إجمالي الديون</div>
              <div class="font-bold text-red-600 text-base">{{ totalDebt.toLocaleString() }} <span class="text-xs">د.ع</span></div>
            </div>
            <div class="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
              <div class="text-xs text-green-500 mb-1">إجمالي المحصّل</div>
              <div class="font-bold text-green-600 text-base">{{ totalCollected.toLocaleString() }} <span class="text-xs">د.ع</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Tables Row ─── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- Top Debtors -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-secondary text-sm flex items-center gap-2">
              <i class="fas fa-exclamation-circle text-red-400"></i> أعلى المديونين
            </h3>
            <span class="text-xs text-gray-400">{{ topDebtors.length }} مشترك</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">#</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">المشترك</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">الباقة</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">الدين</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="topDebtors.length === 0">
                  <td colspan="4" class="px-4 py-6 text-center text-gray-300 text-xs">لا توجد ديون</td>
                </tr>
                <tr v-for="(d, i) in topDebtors" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
                  <td class="px-4 py-3 text-gray-400 text-xs">{{ i + 1 }}</td>
                  <td class="px-4 py-3 font-medium text-secondary">{{ d.name }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ d.package }}</td>
                  <td class="px-4 py-3">
                    <span class="text-red-600 font-bold">{{ Number(d.debt).toLocaleString() }}</span>
                    <span class="text-xs text-gray-400"> د.ع</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Expiring Soon -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-secondary text-sm flex items-center gap-2">
              <i class="fas fa-clock text-orange-400"></i> تنتهي خلال 30 يوماً
            </h3>
            <span class="text-xs text-gray-400">{{ expiringSoon.length }} اشتراك</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">المشترك</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">الباقة</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">تاريخ الانتهاء</th>
                  <th class="px-4 py-2.5 text-right text-xs font-semibold text-gray-400">الأيام</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="expiringSoon.length === 0">
                  <td colspan="4" class="px-4 py-6 text-center text-gray-300 text-xs">لا توجد اشتراكات منتهية قريباً</td>
                </tr>
                <tr v-for="(e, i) in expiringSoon" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-secondary">{{ e.name }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ e.package }}</td>
                  <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(e.endDate) }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold"
                      :class="e.days <= 7 ? 'bg-red-100 text-red-600' : e.days <= 15 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-700'">
                      {{ e.days }} يوم
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ─── Package Revenue Table ─── -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h3 class="font-bold text-secondary text-sm flex items-center gap-2">
            <i class="fas fa-table text-primary"></i> إيرادات الباقات
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">الباقة</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">الاشتراكات</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">النشطة</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">المنتهية</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">إجمالي الإيرادات</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">المحصّل</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">الديون</th>
                <th class="px-5 py-3 text-right text-xs font-semibold text-gray-400">نسبة التحصيل</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="packageStats.length === 0">
                <td colspan="8" class="px-5 py-6 text-center text-gray-300 text-xs">لا توجد بيانات</td>
              </tr>
              <tr v-for="(pkg, i) in packageStats" :key="i" class="border-t border-gray-50 hover:bg-gray-50">
                <td class="px-5 py-3 font-semibold text-secondary">{{ pkg.name }}</td>
                <td class="px-5 py-3 text-gray-600">{{ pkg.total }}</td>
                <td class="px-5 py-3"><span class="text-green-600 font-medium">{{ pkg.active }}</span></td>
                <td class="px-5 py-3"><span class="text-red-500 font-medium">{{ pkg.expired }}</span></td>
                <td class="px-5 py-3 font-semibold text-secondary">{{ pkg.revenue.toLocaleString() }} <span class="text-xs text-gray-400">د.ع</span></td>
                <td class="px-5 py-3 text-green-600 font-medium">{{ pkg.collected.toLocaleString() }} <span class="text-xs text-gray-400">د.ع</span></td>
                <td class="px-5 py-3 text-red-500 font-medium">{{ pkg.debt.toLocaleString() }} <span class="text-xs text-gray-400">د.ع</span></td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-16">
                      <div class="h-full bg-green-500 rounded-full" :style="{width: pkg.rate + '%'}"></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">{{ pkg.rate }}%</span>
                  </div>
                </td>
              </tr>
              <!-- Totals Row -->
              <tr v-if="packageStats.length" class="border-t-2 border-gray-200 bg-gray-50 font-semibold">
                <td class="px-5 py-3 text-secondary">الإجمالي</td>
                <td class="px-5 py-3">{{ filteredSubs.length }}</td>
                <td class="px-5 py-3 text-green-600">{{ filteredSubs.filter(s => s.status === 'active').length }}</td>
                <td class="px-5 py-3 text-red-500">{{ filteredSubs.filter(s => s.status === 'expired').length }}</td>
                <td class="px-5 py-3 text-secondary">{{ totalRevenue.toLocaleString() }} <span class="text-xs text-gray-400 font-normal">د.ع</span></td>
                <td class="px-5 py-3 text-green-600">{{ totalCollected.toLocaleString() }} <span class="text-xs text-gray-400 font-normal">د.ع</span></td>
                <td class="px-5 py-3 text-red-500">{{ totalDebt.toLocaleString() }} <span class="text-xs text-gray-400 font-normal">د.ع</span></td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-16">
                      <div class="h-full bg-green-500 rounded-full" :style="{width: overallRate + '%'}"></div>
                    </div>
                    <span class="text-xs font-semibold text-gray-600">{{ overallRate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Bar, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS, Title, Tooltip, Legend, BarElement,
  CategoryScale, LinearScale, ArcElement
} from 'chart.js';
import api from '../../api';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

// ─── State ───────────────────────────────────────────────
const loading = ref(false);
const allSubs = ref<any[]>([]);
const filterYear = ref(new Date().getFullYear());
const filterMonth = ref<number | ''>('');

const monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const chartColors = ['#4F81C7','#27AE60','#F39C12','#E74C3C','#9B59B6','#1ABC9C','#E67E22','#2C3E50'];

const availableYears = computed(() => {
  const years = new Set<number>();
  const cur = new Date().getFullYear();
  for (let y = cur - 3; y <= cur + 1; y++) years.add(y);
  allSubs.value.forEach(s => {
    if (s.startDate) years.add(new Date(s.startDate).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
});

// ─── Filtered Subscriptions ───────────────────────────────
const filteredSubs = computed(() => {
  return allSubs.value.filter(s => {
    if (!s.startDate) return false;
    const d = new Date(s.startDate);
    if (d.getFullYear() !== filterYear.value) return false;
    if (filterMonth.value && d.getMonth() + 1 !== filterMonth.value) return false;
    return true;
  });
});

// ─── Summary Metrics ──────────────────────────────────────
const totalRevenue = computed(() => filteredSubs.value.reduce((s, x) => s + Number(x.price || 0), 0));
const totalCollected = computed(() => filteredSubs.value.reduce((s, x) => s + Number(x.paidAmount || 0), 0));
const totalDebt = computed(() =>
  filteredSubs.value.reduce((s, x) => {
    return s + Math.max(0, Number(x.price || 0) + Number(x.debtAmount || 0) - Number(x.paidAmount || 0));
  }, 0)
);
const overallRate = computed(() => {
  if (!totalRevenue.value) return 0;
  return Math.round((totalCollected.value / totalRevenue.value) * 100);
});

const summaryCards = computed(() => [
  // Row 1: حالة الاشتراكات
  { label: 'إجمالي الاشتراكات', value: filteredSubs.value.length, icon: 'fas fa-list', color: '#4F81C7' },
  { label: 'الاشتراكات النشطة', value: filteredSubs.value.filter(s => s.status === 'active').length, icon: 'fas fa-check-circle', color: '#27AE60', sub: 'نشط', subColor: 'text-green-500' },
  { label: 'الاشتراكات المنتهية', value: filteredSubs.value.filter(s => s.status === 'expired').length, icon: 'fas fa-times-circle', color: '#E74C3C', sub: 'منتهي', subColor: 'text-red-500' },
  { label: 'الاشتراكات المعلقة', value: filteredSubs.value.filter(s => s.status === 'pending').length, icon: 'fas fa-pause-circle', color: '#9B59B6', sub: 'معلق', subColor: 'text-purple-500' },
  // Row 2: الملخص المالي
  { label: 'إجمالي الإيرادات', value: totalRevenue.value.toLocaleString() + ' د.ع', icon: 'fas fa-coins', color: '#27AE60' },
  { label: 'إجمالي المحصّل', value: totalCollected.value.toLocaleString() + ' د.ع', icon: 'fas fa-hand-holding-usd', color: '#1ABC9C' },
  { label: 'إجمالي الديون', value: totalDebt.value.toLocaleString() + ' د.ع', icon: 'fas fa-exclamation-triangle', color: '#E74C3C', sub: totalDebt.value > 0 ? (filteredSubs.value.filter(s => Math.max(0, Number(s.price||0) + Number(s.debtAmount||0) - Number(s.paidAmount||0)) > 0).length + ' مشترك') : '', subColor: 'text-red-400' },
  { label: 'نسبة التحصيل', value: overallRate.value + '%', icon: 'fas fa-percentage', color: '#F39C12', sub: 'من الإيرادات' },
]);

// ─── Status Breakdown ─────────────────────────────────────
const statusBreakdown = computed(() => {
  const total = filteredSubs.value.length || 1;
  const counts: Record<string, { label: string; color: string; count: number }> = {
    active:   { label: 'نشط',     color: '#27AE60', count: 0 },
    expired:  { label: 'منتهي',   color: '#E74C3C', count: 0 },
    suspended:{ label: 'معلق',    color: '#F39C12', count: 0 },
    pending:  { label: 'معلق الدفع', color: '#9B59B6', count: 0 },
  };
  filteredSubs.value.forEach(s => {
    if (counts[s.status]) counts[s.status].count++;
  });
  return Object.values(counts)
    .filter(x => x.count > 0)
    .map(x => ({ ...x, pct: Math.round((x.count / total) * 100) }));
});

// ─── Monthly Revenue Chart ─────────────────────────────────
const revenueChartData = computed(() => {
  const months: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = 0;
  }
  allSubs.value.forEach(s => {
    if (!s.startDate) return;
    const d = new Date(s.startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (key in months) months[key] += Number(s.price || 0);
  });
  const labels = Object.keys(months).map(k => {
    const [y, m] = k.split('-');
    return monthNames[parseInt(m) - 1] + ' ' + y;
  });
  return {
    labels,
    datasets: [{
      label: 'الإيرادات (د.ع)',
      data: Object.values(months),
      backgroundColor: 'rgba(79,129,199,0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
});

// ─── Package Distribution Chart ───────────────────────────
const packageChartData = computed(() => {
  const pkgCount: Record<string, number> = {};
  filteredSubs.value.filter(s => s.status === 'active').forEach(s => {
    const name = s.package?.name || 'غير محدد';
    pkgCount[name] = (pkgCount[name] || 0) + 1;
  });
  return {
    labels: Object.keys(pkgCount),
    datasets: [{
      data: Object.values(pkgCount),
      backgroundColor: chartColors,
      borderWidth: 0,
    }],
  };
});

// ─── Payment Methods Chart ────────────────────────────────
const paymentChartData = computed(() => {
  const methods: Record<string, number> = { cash: 0, credit: 0, partial: 0 };
  filteredSubs.value.forEach(s => {
    if (s.paymentMethod in methods) methods[s.paymentMethod]++;
  });
  return {
    labels: ['نقداً', 'آجل', 'جزئي'],
    datasets: [{
      label: 'عدد الاشتراكات',
      data: [methods.cash, methods.credit, methods.partial],
      backgroundColor: ['#27AE60', '#E74C3C', '#F39C12'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
});

// ─── Package Stats Table ──────────────────────────────────
const packageStats = computed(() => {
  const map: Record<string, any> = {};
  filteredSubs.value.forEach(s => {
    const name = s.package?.name || 'غير محدد';
    if (!map[name]) map[name] = { name, total: 0, active: 0, expired: 0, revenue: 0, collected: 0, debt: 0 };
    map[name].total++;
    if (s.status === 'active') map[name].active++;
    if (s.status === 'expired') map[name].expired++;
    map[name].revenue += Number(s.price || 0);
    map[name].collected += Number(s.paidAmount || 0);
    map[name].debt += Math.max(0, Number(s.price || 0) + Number(s.debtAmount || 0) - Number(s.paidAmount || 0));
  });
  return Object.values(map).map((p: any) => ({
    ...p,
    rate: p.revenue ? Math.round((p.collected / p.revenue) * 100) : 0,
  })).sort((a: any, b: any) => b.revenue - a.revenue);
});

// ─── Top Debtors ──────────────────────────────────────────
const topDebtors = computed(() =>
  filteredSubs.value
    .map(s => ({
      name: s.subscriber?.name || '—',
      package: s.package?.name || '—',
      debt: Math.max(0, Number(s.price || 0) + Number(s.debtAmount || 0) - Number(s.paidAmount || 0)),
    }))
    .filter(s => s.debt > 0)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 8)
);

// ─── Expiring Soon ────────────────────────────────────────
const expiringSoon = computed(() => {
  const now = Date.now();
  return allSubs.value
    .filter(s => s.status === 'active' && s.endDate)
    .map(s => {
      const days = Math.ceil((new Date(s.endDate).getTime() - now) / 86400000);
      return { name: s.subscriber?.name || '—', package: s.package?.name || '—', endDate: s.endDate, days };
    })
    .filter(s => s.days > 0 && s.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);
});

// ─── Chart Options ────────────────────────────────────────
const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 } } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
};
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  cutout: '65%',
};

// ─── Helpers ──────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ');
}
function printReport() { window.print(); }

// ─── Data Loading ─────────────────────────────────────────
async function loadData() {
  loading.value = true;
  try {
    const res = await api.get('/subscriptions');
    allSubs.value = res.data;
  } catch {
    allSubs.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>
