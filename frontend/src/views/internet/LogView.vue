<template>
  <div class="flex flex-col gap-4">

    <!-- Clear Log Confirm Dialog -->
    <Teleport to="body">
      <div v-if="showClearConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 text-right">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-red-600"></i>
            </div>
            <h3 class="font-bold text-gray-800 text-base">مسح سجل العمليات</h3>
          </div>
          <p class="text-sm text-gray-500 mb-6">هل أنت متأكد من حذف جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <div class="flex gap-3">
            <button @click="showClearConfirm = false" class="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">
              إلغاء
            </button>
            <button @click="doClearLog" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl text-sm font-semibold hover:from-red-700 hover:to-red-800 transition">
              مسح الكل
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Page Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h2 class="text-xl font-bold text-secondary">سجل العمليات</h2>
        <p class="text-sm text-gray-400 mt-0.5">{{ filteredLogs.length }} سجل</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="clearFilters" class="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition border border-gray-200 hover:border-indigo-300 px-4 py-2 rounded-xl">
          <i class="fas fa-filter-circle-xmark"></i>
          مسح الفلاتر
        </button>
        <button @click="showClearConfirm = true" class="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition border border-red-200 hover:border-red-400 px-4 py-2 rounded-xl">
          <i class="fas fa-trash-alt"></i>
          مسح السجل
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <!-- Toolbar -->
      <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex flex-wrap items-center gap-2.5">

        <!-- Search -->
        <div class="relative flex-1 min-w-[180px] max-w-xs">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs"></i>
          <input
            v-model="search"
            type="text"
            placeholder="بحث بالاسم أو التفاصيل..."
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/60 text-white transition"
          />
        </div>

        <!-- Filter by module -->
        <div class="relative min-w-[130px]">
          <i class="fas fa-layer-group absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <select v-model="filterModule" class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white appearance-none transition">
            <option value="" class="text-gray-800">كل الأقسام</option>
            <option value="subscriber" class="text-gray-800">المشتركون</option>
            <option value="subscription" class="text-gray-800">الاشتراكات</option>
            <option value="package" class="text-gray-800">الباقات</option>
            <option value="manager" class="text-gray-800">المدراء</option>
          </select>
        </div>

        <!-- Filter by action type -->
        <div class="relative min-w-[165px]">
          <i class="fas fa-tag absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <select v-model="filterAction" class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white appearance-none transition">
            <option value="" class="text-gray-800">كل العمليات</option>
            <option value="add_subscriber" class="text-gray-800">إضافة مشترك</option>
            <option value="edit_subscriber" class="text-gray-800">تعديل مشترك</option>
            <option value="delete_subscriber" class="text-gray-800">حذف مشترك</option>
            <option value="activate_subscriber" class="text-gray-800">تفعيل مشترك</option>
            <option value="suspend_subscriber" class="text-gray-800">تعليق مشترك</option>
            <option value="change_package" class="text-gray-800">تغيير الباقة</option>
            <option value="add_debt" class="text-gray-800">إضافة دين</option>
            <option value="pay_debt" class="text-gray-800">تسديد دين</option>
            <option value="edit_subscription" class="text-gray-800">تعديل اشتراك</option>
            <option value="delete_subscription" class="text-gray-800">حذف اشتراك</option>
            <option value="add_package" class="text-gray-800">إضافة باقة</option>
            <option value="edit_package" class="text-gray-800">تعديل باقة</option>
            <option value="delete_package" class="text-gray-800">حذف باقة</option>
            <option value="add_manager" class="text-gray-800">إضافة مدير</option>
            <option value="edit_manager" class="text-gray-800">تعديل مدير</option>
            <option value="delete_manager" class="text-gray-800">حذف مدير</option>
          </select>
        </div>

        <!-- Filter by date -->
        <div class="relative min-w-[165px]">
          <i class="fas fa-calendar-alt absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <input
            v-model="filterDate"
            type="date"
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-white transition"
          />
        </div>

        <div class="flex-1"></div>

        <!-- Refresh -->
        <button @click="loadData" class="flex items-center gap-2 bg-white/15 border border-white/30 text-white px-4 py-2 rounded-xl text-sm hover:bg-white/25 transition">
          <i class="fas fa-sync-alt"></i>
          تحديث
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
        <i class="fas fa-spinner fa-spin text-2xl text-indigo-400"></i>
        <span class="text-sm">جاري التحميل...</span>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">#</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">التاريخ</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">الوقت</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">المشترك</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">القسم</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">نوع العملية</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">التفاصيل</th>
              <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">المبلغ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="8" class="text-center py-16 text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <i class="fas fa-history text-3xl text-gray-200"></i>
                  <span class="text-sm">لا توجد سجلات — ستظهر هنا كل العمليات تلقائياً</span>
                </div>
              </td>
            </tr>
            <tr
              v-for="(log, idx) in paginatedLogs"
              :key="log.id"
              class="border-b border-gray-50 hover:bg-indigo-50/30 transition"
            >
              <td class="px-4 py-3 text-gray-400 text-xs">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td class="px-4 py-3 text-gray-700 whitespace-nowrap text-xs font-medium">{{ formatDate(log.timestamp) }}</td>
              <td class="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">{{ formatTime(log.timestamp) }}</td>
              <td class="px-4 py-3">
                <div class="font-semibold text-gray-800">{{ log.subscriberName || '—' }}</div>
                <div v-if="log.packageName" class="text-xs text-gray-400">{{ log.packageName }}</div>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ moduleLabel(log.module) }}</td>
              <td class="px-4 py-3">
                <span
                  :class="actionBadgeClass(log.action)"
                  class="px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 border"
                >
                  <span>{{ actionIcon(log.action) }}</span>
                  {{ actionLabel(log.action) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs max-w-xs truncate" :title="log.details">{{ log.details || '—' }}</td>
              <td class="px-4 py-3 font-semibold text-xs" :class="log.amount ? 'text-green-600' : 'text-gray-400'">
                {{ log.amount ? Number(log.amount).toLocaleString('ar-IQ') + ' د.ع' : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            ««
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            «
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage
                ? 'bg-primary border-primary text-white shadow-sm shadow-primary/30'
                : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »»
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button v-for="size in [5, 10, 50, 100, 500]" :key="size"
            @click="pageSize = size; currentPage = 1"
            class="w-10 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
            :class="pageSize === size
              ? 'bg-gray-200 border-gray-300 text-gray-600'
              : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'">
            {{ size }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getActivityLog, clearActivityLog, ACTION_LABELS, ACTION_COLORS, ACTION_ICONS, MODULE_LABELS } from '../../utils/activityLog';
import type { ActivityLogEntry } from '../../utils/activityLog';

const loading = ref(false);
const search = ref('');
const filterAction = ref('');
const filterModule = ref('');
const filterDate = ref('');
const currentPage = ref(1);
const pageSize = ref(25);
const showClearConfirm = ref(false);

const allLogs = ref<ActivityLogEntry[]>([]);

function loadData() {
  loading.value = true;
  try {
    allLogs.value = getActivityLog(); // already newest-first
  } finally {
    loading.value = false;
  }
}

function doClearLog() {
  clearActivityLog();
  allLogs.value = [];
  showClearConfirm.value = false;
}

const filteredLogs = computed(() => {
  let rows = allLogs.value;
  const q = search.value.trim().toLowerCase();
  if (q) {
    rows = rows.filter(l =>
      (l.subscriberName || '').toLowerCase().includes(q) ||
      (l.details || '').toLowerCase().includes(q) ||
      (l.packageName || '').toLowerCase().includes(q)
    );
  }
  if (filterModule.value) rows = rows.filter(l => l.module === filterModule.value);
  if (filterAction.value) rows = rows.filter(l => l.action === filterAction.value);
  if (filterDate.value) rows = rows.filter(l => l.timestamp && l.timestamp.startsWith(filterDate.value));
  return rows;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / pageSize.value)));

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredLogs.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

function formatDate(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(ts: string) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function actionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}

function actionIcon(action: string): string {
  return ACTION_ICONS[action] || '•';
}

function actionBadgeClass(action: string): string {
  return ACTION_COLORS[action] || 'bg-gray-100 text-gray-600 border-gray-200';
}

function moduleLabel(module: string): string {
  return MODULE_LABELS[module] || module || '—';
}

function clearFilters() {
  search.value = '';
  filterAction.value = '';
  filterModule.value = '';
  filterDate.value = '';
  currentPage.value = 1;
}

onMounted(() => loadData());
</script>
