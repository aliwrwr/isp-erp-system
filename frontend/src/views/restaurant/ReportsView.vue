<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">تقارير المطعم</h2>
      <button @click="load" class="bg-restaurant hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-sync-alt"></i> تحديث</button>
    </div>

    <div v-if="loading" class="text-center text-gray-400 py-12"><i class="fas fa-spinner fa-spin text-3xl mb-3"></i><p>جاري تحميل التقارير...</p></div>

    <template v-else-if="data">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><i class="fas fa-receipt text-blue-500 text-sm"></i></div><span class="text-xs text-gray-400">إجمالي الطلبات</span></div>
          <p class="text-xl font-bold text-secondary">{{ data.totalOrders }}</p>
          <p class="text-xs text-gray-400">اليوم: {{ data.todayOrders }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center"><i class="fas fa-check-circle text-green-500 text-sm"></i></div><span class="text-xs text-gray-400">طلبات مدفوعة</span></div>
          <p class="text-xl font-bold text-green-600">{{ data.paidOrders }}</p>
          <p class="text-xs text-gray-400">ملغية: {{ data.cancelledOrders }}</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg bg-restaurant/10 flex items-center justify-center"><i class="fas fa-coins text-restaurant text-sm"></i></div><span class="text-xs text-gray-400">إجمالي الإيرادات</span></div>
          <p class="text-xl font-bold text-restaurant">{{  data.totalRevenue.toFixed(2)  }} د.ع</p>
          <p class="text-xs text-gray-400">اليوم: {{  data.todayRevenue.toFixed(2)  }} د.ع</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center"><i class="fas fa-money-bill text-red-500 text-sm"></i></div><span class="text-xs text-gray-400">إجمالي المصروفات</span></div>
          <p class="text-xl font-bold text-danger">{{  data.totalExpenses.toFixed(2)  }} د.ع</p>
          <p class="text-xs text-gray-400">اليوم: {{  data.todayExpenses.toFixed(2)  }} د.ع</p>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 rounded-lg" :class="data.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'" style="display:flex;align-items:center;justify-content:center"><i class="fas fa-chart-line text-sm" :class="data.netProfit >= 0 ? 'text-green-500' : 'text-red-500'"></i></div><span class="text-xs text-gray-400">صافي الربح</span></div>
          <p class="text-xl font-bold" :class="data.netProfit >= 0 ? 'text-green-600' : 'text-red-600'">{{  data.netProfit.toFixed(2)  }} د.ع</p>
          <p class="text-xs text-gray-400">اليوم: {{  data.todayProfit.toFixed(2)  }} د.ع</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Daily Revenue Chart (Table-based) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-secondary mb-4"><i class="fas fa-chart-bar text-restaurant ml-2"></i>الإيرادات اليومية (آخر 30 يوم)</h3>
          <div class="space-y-1 max-h-[350px] overflow-y-auto">
            <div v-for="d in data.dailyData.filter((x: any) => x.revenue > 0 || x.expenses > 0)" :key="d.date" class="flex items-center gap-2 text-xs py-1">
              <span class="w-20 text-gray-400 shrink-0">{{ formatDate(d.date) }}</span>
              <div class="flex-1 flex items-center gap-1">
                <div class="h-4 rounded bg-green-400" :style="{ width: barWidth(d.revenue, maxRevenue) + '%', minWidth: d.revenue > 0 ? '4px' : '0' }"></div>
                <div class="h-4 rounded bg-red-300" :style="{ width: barWidth(d.expenses, maxRevenue) + '%', minWidth: d.expenses > 0 ? '4px' : '0' }"></div>
              </div>
              <span class="w-24 text-left text-gray-500 shrink-0">
                <span class="text-green-600">{{  d.revenue.toFixed(0)  }} د.ع</span>
                <span v-if="d.expenses > 0" class="text-red-400 mr-1">-{{  d.expenses.toFixed(0)  }} د.ع</span>
              </span>
            </div>
            <div v-if="data.dailyData.every((x: any) => x.revenue === 0 && x.expenses === 0)" class="text-center text-gray-300 py-4">لا توجد بيانات</div>
          </div>
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-green-400 inline-block"></span> إيرادات</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-red-300 inline-block"></span> مصروفات</span>
          </div>
        </div>

        <!-- Top Selling Items -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-secondary mb-4"><i class="fas fa-trophy text-yellow-500 ml-2"></i>أكثر الأصناف مبيعاً</h3>
          <div class="space-y-2">
            <div v-for="(item, idx) in data.topItems" :key="item.name" class="flex items-center gap-3">
              <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" :class="(idx as number) < 3 ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-500'">{{ (idx as number) + 1 }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-secondary truncate">{{ item.name }}</p>
                <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div class="bg-restaurant h-1.5 rounded-full" :style="{ width: (item.revenue / (data.topItems[0]?.revenue || 1) * 100) + '%' }"></div>
                </div>
              </div>
              <div class="text-left shrink-0">
                <p class="text-xs font-bold text-restaurant">{{  item.revenue.toFixed(2)  }} د.ع</p>
                <p class="text-[10px] text-gray-400">{{ item.quantity }} وحدة</p>
              </div>
            </div>
            <div v-if="data.topItems.length === 0" class="text-center text-gray-300 py-4">لا توجد بيانات</div>
          </div>
        </div>

        <!-- Expenses by Category -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-secondary mb-4"><i class="fas fa-pie-chart text-danger ml-2"></i>المصروفات حسب التصنيف</h3>
          <div class="space-y-3">
            <div v-for="(amount, cat) in data.expensesByCategory" :key="cat" class="flex items-center gap-3">
              <span class="text-xs px-2 py-1 rounded-full w-20 text-center" :class="expCatClass(cat as string)">{{ expCatLabel(cat as string) }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-3">
                <div class="h-3 rounded-full" :class="expCatBar(cat as string)" :style="{ width: (Number(amount) / data.totalExpenses * 100) + '%' }"></div>
              </div>
              <span class="text-sm font-bold text-secondary w-20 text-left">{{  Number(amount).toFixed(2)  }} د.ع</span>
            </div>
            <div v-if="Object.keys(data.expensesByCategory).length === 0" class="text-center text-gray-300 py-4">لا توجد مصروفات</div>
          </div>
        </div>

        <!-- Orders Summary -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-sm font-bold text-secondary mb-4"><i class="fas fa-chart-pie text-blue-500 ml-2"></i>ملخص الطلبات</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-green-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-bold text-green-700">{{ data.paidOrders }}</p>
              <p class="text-xs text-green-600">مدفوعة</p>
            </div>
            <div class="bg-red-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-bold text-red-700">{{ data.cancelledOrders }}</p>
              <p class="text-xs text-red-600">ملغية</p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3 text-center">
              <p class="text-2xl font-bold text-blue-700">{{ data.todayOrders }}</p>
              <p class="text-xs text-blue-600">طلبات اليوم</p>
            </div>
            <div class="bg-restaurant/10 rounded-xl p-3 text-center">
              <p class="text-2xl font-bold text-restaurant">{{ data.totalOrders }}</p>
              <p class="text-xs text-gray-500">إجمالي الطلبات</p>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-gray-100">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">متوسط قيمة الطلب</span>
              <span class="font-bold text-secondary">{{  data.paidOrders > 0 ? (data.totalRevenue / data.paidOrders).toFixed(2) : '0.00'  }} د.ع</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const data = ref<any>(null);
const loading = ref(true);

const maxRevenue = computed(() => data.value ? Math.max(...data.value.dailyData.map((d: any) => Math.max(d.revenue, d.expenses)), 1) : 1);

async function load() {
  loading.value = true;
  data.value = (await api.get('/restaurant/reports/summary')).data;
  loading.value = false;
}

function barWidth(val: number, max: number) { return max > 0 ? (val / max * 60) : 0; }

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('ar', { month: 'short', day: 'numeric' });
}

function expCatClass(c: string) {
  return { ingredients: 'bg-green-50 text-green-700', maintenance: 'bg-blue-50 text-blue-700', salaries: 'bg-purple-50 text-purple-700', utilities: 'bg-yellow-50 text-yellow-700', general: 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600';
}
function expCatLabel(c: string) {
  return { ingredients: 'مواد أولية', maintenance: 'صيانة', salaries: 'رواتب', utilities: 'خدمات', general: 'عام' }[c] || c;
}
function expCatBar(c: string) {
  return { ingredients: 'bg-green-400', maintenance: 'bg-blue-400', salaries: 'bg-purple-400', utilities: 'bg-yellow-400', general: 'bg-gray-400' }[c] || 'bg-gray-400';
}

onMounted(load);
</script>
