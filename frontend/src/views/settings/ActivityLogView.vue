<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-secondary">سجل العمليات</h2>
        <p class="text-sm text-gray-400 mt-0.5">تتبع جميع الإجراءات المنفذة من قِبل المستخدمين</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="fetchLogs" class="flex items-center gap-1.5 text-sm bg-primary text-white px-4 py-2 rounded-xl hover:bg-primary/90 transition shadow-sm">
          <i class="fas fa-sync-alt text-xs" :class="{ 'animate-spin': loading }"></i> تحديث
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="search" placeholder="بحث في التفاصيل أو اسم الموظف..." class="w-full pr-8 pl-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
        </div>
        <!-- Module filter -->
        <select v-model="filterModule" class="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[150px]">
          <option value="">كل الأقسام</option>
          <option value="subscribers">المشتركين</option>
          <option value="subscriptions">الاشتراكات</option>
          <option value="managers">المدراء</option>
          <option value="packages">الباقات</option>
          <option value="routers">الراوترات</option>
        </select>
        <!-- Date filter -->
        <input v-model="filterDate" type="date" class="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        <!-- Clear -->
        <button v-if="search || filterModule || filterDate" @click="search=''; filterModule=''; filterDate=''" class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition">
          <i class="fas fa-times-circle"></i> مسح الفلاتر
        </button>
        <!-- Counter -->
        <span class="mr-auto text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium">
          {{ filteredLogs.length }} سجل
        </span>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b-2 border-gray-100" style="background: #f8fafc;">
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">الموظف</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">القسم</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">العملية</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">التفاصيل</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">المبلغ</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wide">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody>

            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="6" class="py-24 text-center">
                <div class="flex flex-col items-center gap-3 text-gray-400">
                  <div class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <span class="text-sm">جاري تحميل السجلات...</span>
                </div>
              </td>
            </tr>

            <!-- Empty -->
            <tr v-else-if="filteredLogs.length === 0">
              <td colspan="6" class="py-24 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-clipboard-list text-3xl text-gray-300"></i>
                  </div>
                  <p class="font-semibold text-gray-400">لا توجد سجلات</p>
                  <p class="text-xs text-gray-300">قم بأي عملية في النظام وستظهر هنا</p>
                </div>
              </td>
            </tr>

            <!-- Rows -->
            <tr v-else v-for="log in pagedLogs" :key="log.id"
              class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">

              <!-- الموظف -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    :style="{ background: getAvatarColor(log.user?.username || log.user?.name || '?') }">
                    {{ (log.user?.name || log.user?.username || '؟').charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800 text-sm leading-tight">
                      {{ log.user?.name || log.user?.username || 'مستخدم النظام' }}
                    </p>
                    <p class="text-[11px] text-gray-400 font-mono mt-0.5">
                      {{ log.user?.username ? '@' + log.user.username : 'admin' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- القسم -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border"
                  :class="getModuleStyle(log.module).badge">
                  <i :class="getModuleStyle(log.module).icon" class="text-[10px]"></i>
                  {{ getModuleStyle(log.module).label }}
                </span>
              </td>

              <!-- العملية -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border"
                  :class="getActionStyle(log.action).badge">
                  <i :class="getActionStyle(log.action).icon" class="text-[10px]"></i>
                  {{ getActionStyle(log.action).label }}
                </span>
              </td>

              <!-- التفاصيل -->
              <td class="px-5 py-4 max-w-xs">
                <p class="text-gray-700 text-sm leading-relaxed">{{ log.details }}</p>
                <div v-if="log.subscriberName" class="mt-1 inline-flex items-center gap-1 text-[11px] bg-primary/8 text-primary px-2 py-0.5 rounded-md">
                  <i class="fas fa-user text-[9px]"></i>
                  {{ log.subscriberName }}
                </div>
              </td>

              <!-- المبلغ -->
              <td class="px-5 py-4">
                <div v-if="log.amount && Number(log.amount) > 0"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                  :class="isDebtAction(log.action) ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'">
                  <i class="fas" :class="isDebtAction(log.action) ? 'fa-arrow-up' : 'fa-arrow-down'"></i>
                  {{ Number(log.amount).toLocaleString('ar-IQ') }}
                  <span class="font-normal opacity-70">د.ع</span>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- الوقت -->
              <td class="px-5 py-4">
                <div class="text-xs text-gray-600 font-medium">{{ formatDateShort(log.timestamp) }}</div>
                <div class="text-[11px] text-gray-400 mt-0.5">{{ formatTime(log.timestamp) }}</div>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredLogs.length > pageSize" class="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 flex-wrap">
        <p class="text-xs text-gray-500">
          عرض <span class="font-bold text-gray-700">{{ (currentPage - 1) * pageSize + 1 }}</span> –
          <span class="font-bold text-gray-700">{{ Math.min(currentPage * pageSize, filteredLogs.length) }}</span>
          من <span class="font-bold text-gray-700">{{ filteredLogs.length }}</span> سجل
        </p>
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            ««
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            «
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »»
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const logs = ref<any[]>([]);
const loading = ref(true);
const search = ref('');
const filterModule = ref('');
const filterDate = ref('');
const currentPage = ref(1);
const pageSize = 50;

// ── Fetch ───────────────────────────────────────────────
async function fetchLogs() {
  loading.value = true;
  try {
    const { data } = await api.get('/activity-log');
    logs.value = data;
  } catch (error) {
    console.error('Failed to fetch activity logs:', error);
  } finally {
    loading.value = false;
  }
}

// ── Filtering ───────────────────────────────────────────
const filteredLogs = computed(() => {
  let list = logs.value;
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter(l =>
      l.details?.toLowerCase().includes(q) ||
      l.subscriberName?.toLowerCase().includes(q) ||
      l.user?.name?.toLowerCase().includes(q) ||
      l.user?.username?.toLowerCase().includes(q)
    );
  }
  if (filterModule.value) {
    list = list.filter(l => l.module === filterModule.value);
  }
  if (filterDate.value) {
    list = list.filter(l => l.timestamp && l.timestamp.startsWith(filterDate.value));
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / pageSize)));
const pagedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredLogs.value.slice(start, start + pageSize);
});
const visiblePages = computed(() => {
  const pages: number[] = [];
  for (let p = Math.max(1, currentPage.value - 2); p <= Math.min(totalPages.value, currentPage.value + 2); p++) {
    pages.push(p);
  }
  return pages;
});

// ── Formatting ──────────────────────────────────────────
function formatDateShort(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
}
function formatTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}

// ── Avatar color (deterministic from name) ──────────────
const AVATAR_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#14b8a6'];
function getAvatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Module styles ───────────────────────────────────────
function getModuleStyle(module: string) {
  const map: Record<string, { label: string; icon: string; badge: string }> = {
    subscribers:   { label: 'المشتركين',  icon: 'fas fa-users',        badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    subscriptions: { label: 'الاشتراكات', icon: 'fas fa-file-contract', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    managers:      { label: 'المدراء',    icon: 'fas fa-user-shield',   badge: 'bg-violet-50 text-violet-700 border-violet-200' },
    manager:       { label: 'المدراء',    icon: 'fas fa-user-shield',   badge: 'bg-violet-50 text-violet-700 border-violet-200' },
    packages:      { label: 'الباقات',    icon: 'fas fa-wifi',          badge: 'bg-sky-50 text-sky-700 border-sky-200' },
    routers:       { label: 'الراوترات',  icon: 'fas fa-router',        badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    subscription:  { label: 'الاشتراكات', icon: 'fas fa-file-contract', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    subscriber:    { label: 'المشتركين',  icon: 'fas fa-users',         badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  };
  return map[module] ?? { label: module || 'عام', icon: 'fas fa-circle', badge: 'bg-gray-100 text-gray-600 border-gray-200' };
}

// ── Action styles ───────────────────────────────────────
function getActionStyle(action: string) {
  const map: Record<string, { label: string; icon: string; badge: string }> = {
    create:                  { label: 'إضافة',           icon: 'fas fa-plus',              badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    update:                  { label: 'تعديل',           icon: 'fas fa-pen',               badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    delete:                  { label: 'حذف',             icon: 'fas fa-trash',             badge: 'bg-red-50 text-red-700 border-red-200' },
    activate:                { label: 'تفعيل اشتراك',   icon: 'fas fa-bolt',              badge: 'bg-green-50 text-green-700 border-green-200' },
    suspend:                 { label: 'إلغاء اشتراك',   icon: 'fas fa-pause-circle',      badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    toggle_enabled:          { label: 'تعطيل/تفعيل',    icon: 'fas fa-toggle-on',         badge: 'bg-slate-50 text-slate-700 border-slate-200' },
    sync:                    { label: 'مزامنة راوتر',   icon: 'fas fa-sync-alt',          badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    change_package:          { label: 'تغيير الباقة',   icon: 'fas fa-exchange-alt',      badge: 'bg-sky-50 text-sky-700 border-sky-200' },
    add_debt:                { label: 'إضافة دين',       icon: 'fas fa-plus-circle',       badge: 'bg-red-50 text-red-700 border-red-200' },
    pay_debt:                { label: 'تسديد دين',       icon: 'fas fa-check-circle',      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    send_message:            { label: 'إرسال رسالة',    icon: 'fab fa-whatsapp',          badge: 'bg-green-50 text-green-700 border-green-200' },
    add_manager:             { label: 'إضافة مدير',      icon: 'fas fa-user-plus',         badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    edit_manager:            { label: 'تعديل مدير',      icon: 'fas fa-user-edit',         badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    delete_manager:          { label: 'حذف مدير',        icon: 'fas fa-user-minus',        badge: 'bg-red-50 text-red-700 border-red-200' },
    manager_deposit:         { label: 'إيداع رصيد',      icon: 'fas fa-wallet',            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    manager_withdraw:        { label: 'سحب رصيد',        icon: 'fas fa-hand-holding-usd',  badge: 'bg-orange-50 text-orange-700 border-orange-200' },
    manager_add_debt:        { label: 'إضافة قرض',       icon: 'fas fa-file-invoice-dollar',badge: 'bg-red-50 text-red-700 border-red-200' },
    manager_pay_debt:        { label: 'تسديد قرض',       icon: 'fas fa-money-check-alt',   badge: 'bg-teal-50 text-teal-700 border-teal-200' },
    manager_points_add:      { label: 'منح نقاط',        icon: 'fas fa-star',              badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    manager_points_withdraw: { label: 'سحب نقاط',        icon: 'fas fa-star-half-alt',     badge: 'bg-purple-50 text-purple-700 border-purple-200' },
  };
  return map[action] ?? { label: action, icon: 'fas fa-circle-dot', badge: 'bg-gray-100 text-gray-600 border-gray-200' };
}

function isDebtAction(action: string) {
  return ['add_debt', 'manager_add_debt', 'manager_withdraw', 'suspend'].includes(action);
}

onMounted(fetchLogs);
</script>
