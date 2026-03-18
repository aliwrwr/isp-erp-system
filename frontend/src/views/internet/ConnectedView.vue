<template>
  <div class="flex flex-col h-full" dir="rtl">

    <!-- ── Status Legend Bar ── -->
    <div class="flex items-center justify-between px-5 py-2 bg-gray-800 text-xs text-white flex-wrap gap-2 select-none">
      <div class="flex items-center gap-5">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-green-500 inline-block"></span> متصل الصلاحية
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> معطل
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-gray-400 inline-block"></span> متصل غير معروف
        </span>
      </div>
      <span class="text-gray-300">
        <i class="fas fa-users ml-1"></i>
        المشتركون المتصلون
        <strong class="text-white mx-1">{{ filteredConnections.length }}</strong>
        أعلى على
        <strong class="text-white mx-1">{{ connections.length }}</strong>
        قيد
      </span>
    </div>

    <!-- ── Toolbar ── -->
    <div class="flex items-center gap-1 px-3 py-2 bg-gray-700 border-b border-gray-600">
      <!-- Disconnect selected -->
      <button @click="disconnectSelected" :disabled="!selectedIds.size || disconnecting"
        title="قطع اتصال المحدد"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600 disabled:opacity-30 transition">
        <i class="fas fa-user-slash text-xs"></i>
      </button>
      <div class="w-px h-5 bg-gray-600 mx-1"></div>
      <!-- Filter toggle -->
      <button @click="showFilter = !showFilter" :title="showFilter ? 'إخفاء التصفية' : 'تصفية'"
        :class="showFilter ? 'text-blue-300 bg-gray-600' : 'text-white/70'"
        class="w-8 h-8 rounded flex items-center justify-center hover:text-white hover:bg-gray-600 transition">
        <i class="fas fa-filter text-xs"></i>
      </button>
      <!-- Export CSV -->
      <button @click="exportCSV" title="تصدير CSV"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-gray-600 transition">
        <i class="fas fa-file-export text-xs"></i>
      </button>
      <!-- Refresh -->
      <button @click="loadConnections" :disabled="loading" title="تحديث"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-gray-600 disabled:opacity-50 transition">
        <i class="fas fa-sync-alt text-xs" :class="loading ? 'fa-spin' : ''"></i>
      </button>
      <!-- Auto-refresh indicator -->
      <div class="mr-auto flex items-center gap-2 text-xs text-gray-400">
        <template v-if="autoRefresh">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
          تحديث تلقائي كل 30 ث
        </template>
        <button @click="autoRefresh = !autoRefresh"
          class="px-2 py-0.5 rounded border border-gray-600 hover:border-gray-400 transition text-gray-400 hover:text-white">
          {{ autoRefresh ? 'إيقاف' : 'تحديث تلقائي' }}
        </button>
        <span v-if="lastFetch" class="text-gray-500">آخر تحديث: {{ lastFetch }}</span>
      </div>
    </div>

    <!-- ── Filter Row ── -->
    <Transition name="slide-down">
      <div v-if="showFilter" class="flex items-center gap-3 px-5 py-2.5 bg-gray-800 border-b border-gray-700 flex-wrap">
        <select v-model="filterRouter"
          class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">كل الراوترات</option>
          <option v-for="r in routers" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select v-model="filterStatus"
          class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">كل الحالات</option>
          <option value="active">متصل الصلاحية</option>
          <option value="disabled">معطل</option>
          <option value="unknown">متصل غير معروف</option>
        </select>
        <div class="relative">
          <i class="fas fa-search absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
          <input v-model="searchTerm" placeholder="بحث باسم المشترك أو اسم الدخول أو IP..."
            class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg pr-7 pl-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500" />
        </div>
        <button @click="filterRouter = ''; filterStatus = ''; searchTerm = ''"
          class="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 transition flex items-center gap-1">
          <i class="fas fa-times text-[10px]"></i> مسح التصفية
        </button>
      </div>
    </Transition>

    <!-- ── Main Content ── -->
    <div class="flex-1 overflow-hidden flex flex-col bg-white">

      <!-- Loading state -->
      <div v-if="loading && !connections.length" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fas fa-circle-notch fa-spin text-4xl text-blue-400 mb-3 block"></i>
          <p class="text-sm">جاري جلب المتصلين من الراوترات...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && !connections.length" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fas fa-wifi text-5xl opacity-20 mb-3 block"></i>
          <p class="text-sm font-medium">لا يوجد متصلون حالياً</p>
          <p class="text-xs text-gray-400 mt-1">تأكد من أن الراوترات متصلة وتم تهيئتها</p>
          <button @click="loadConnections" class="mt-3 text-xs text-blue-500 hover:text-blue-700 underline">تحديث</button>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="flex-1 overflow-auto">
        <table class="w-full text-xs border-collapse min-w-[900px]">
          <thead class="sticky top-0 z-10">
            <tr class="bg-gray-800 text-white text-right">
              <!-- Checkbox all -->
              <th class="w-8 px-2 py-2.5 text-center">
                <input type="checkbox"
                  :checked="selectedIds.size === pagedConnections.length && pagedConnections.length > 0"
                  :indeterminate="selectedIds.size > 0 && selectedIds.size < pagedConnections.length"
                  @change="toggleAll"
                  class="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              </th>
              <!-- # -->
              <th class="w-10 px-2 py-2.5 text-center text-gray-300">#</th>
              <!-- Status -->
              <th class="w-10 px-2 py-2.5 text-center">
                <span class="text-gray-300">الحالة</span>
              </th>
              <!-- Sortable columns -->
              <th v-for="col in columns" :key="col.key"
                @click="toggleSort(col.key)"
                class="px-3 py-2.5 cursor-pointer hover:bg-gray-700 transition select-none whitespace-nowrap"
                :class="col.center ? 'text-center' : 'text-right'">
                <span class="flex items-center gap-1" :class="col.center ? 'justify-center' : 'justify-start'">
                  {{ col.label }}
                  <span class="text-[9px] opacity-50">
                    <i v-if="sortKey === col.key" :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    <i v-else class="fas fa-sort opacity-30"></i>
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(conn, i) in pagedConnections" :key="conn.id + conn.routerId"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              :class="selectedIds.has(conn.id + '_' + conn.routerId) ? 'bg-blue-50' : ''">
              <!-- Checkbox -->
              <td class="px-2 py-2 text-center">
                <input type="checkbox"
                  :checked="selectedIds.has(conn.id + '_' + conn.routerId)"
                  @change="toggleSelect(conn)"
                  class="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              </td>
              <!-- # -->
              <td class="px-2 py-2 text-center text-gray-400 font-mono">
                {{ (currentPage - 1) * pageSize + i + 1 }}
              </td>
              <!-- Status indicator -->
              <td class="px-2 py-2 text-center">
                <span class="inline-block w-3.5 h-3.5 rounded-sm"
                  :class="statusColor(conn.subscriberStatus)"></span>
              </td>
              <!-- Username -->
              <td class="px-3 py-2 font-mono text-blue-600 font-medium">{{ conn.name }}</td>
              <!-- Full name -->
              <td class="px-3 py-2 font-medium text-gray-700">{{ conn.subscriberName || '—' }}</td>
              <!-- Download -->
              <td class="px-3 py-2 text-right font-mono text-green-700">{{ fmtBytes(conn.bytesIn) }}</td>
              <!-- Upload -->
              <td class="px-3 py-2 text-right font-mono text-orange-600">{{ fmtBytes(conn.bytesOut) }}</td>
              <!-- Package -->
              <td class="px-3 py-2">
                <span v-if="conn.packageName" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                  {{ conn.packageName }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <!-- IP -->
              <td class="px-3 py-2 font-mono text-blue-500">{{ conn.address || '—' }}</td>
              <!-- MAC -->
              <td class="px-3 py-2 font-mono text-gray-500 text-[11px]">{{ conn.macAddress || '—' }}</td>
              <!-- Uptime -->
              <td class="px-3 py-2 text-gray-500 whitespace-nowrap">{{ formatUptime(conn.uptime) }}</td>
              <!-- Router -->
              <td class="px-3 py-2">
                <span class="flex items-center gap-1 text-gray-500">
                  <i class="fas fa-server text-[9px] text-gray-400"></i>
                  {{ conn.routerName }}
                </span>
              </td>
              <!-- Disconnect -->
              <td class="px-2 py-2 text-center">
                <button @click="disconnectOne(conn)"
                  :disabled="disconnectingId === (conn.id + '_' + conn.routerId)"
                  title="قطع الاتصال"
                  class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-40 transition mx-auto">
                  <i class="fas fa-sign-out-alt text-[11px]"
                    :class="disconnectingId === (conn.id + '_' + conn.routerId) ? 'fa-spin fas fa-circle-notch' : ''"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Footer: Pagination ── -->
      <div v-if="filteredConnections.length > 0"
        class="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex-wrap gap-2">
        <!-- Page navigation -->
        <div class="flex items-center gap-1 text-xs">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-double-right text-[10px]"></i>
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-right text-[10px]"></i>
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-7 h-7 rounded border text-[11px] transition"
              :class="p === currentPage ? 'bg-blue-600 border-blue-600 text-white font-bold' : 'border-gray-300 hover:bg-gray-200 text-gray-600'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-left text-[10px]"></i>
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-double-left text-[10px]"></i>
          </button>
        </div>

        <!-- Per-page sizes -->
        <div class="flex items-center gap-1 text-xs">
          <span class="text-gray-400 ml-1">عدد الصفوف:</span>
          <button v-for="s in [5, 10, 50, 100, 500]" :key="s"
            @click="pageSize = s; currentPage = 1"
            class="w-9 h-7 rounded border text-[11px] transition"
            :class="pageSize === s ? 'bg-gray-700 border-gray-700 text-white font-bold' : 'border-gray-300 hover:bg-gray-200 text-gray-600'">
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Toast ── -->
    <Transition name="toast">
      <div v-if="toast.show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ toast.message }}
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Connection {
  id: string;
  name: string;
  service: string;
  address: string;
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  routerId: number;
  routerName: string;
  subscriberId: number | null;
  subscriberName: string;
  packageName: string;
  subscriberStatus: 'active' | 'disabled' | 'unknown';
}

// ── State ─────────────────────────────────────────────────────────────────────
const connections = ref<Connection[]>([]);
const routers = ref<{ id: number; name: string }[]>([]);
const loading = ref(false);
const disconnecting = ref(false);
const disconnectingId = ref('');

const searchTerm = ref('');
const filterRouter = ref<number | ''>('');
const filterStatus = ref('');
const showFilter = ref(false);

const sortKey = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');

const currentPage = ref(1);
const pageSize = ref(10);

const selectedIds = ref<Set<string>>(new Set());

const autoRefresh = ref(false);
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const lastFetch = ref('');

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' });
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// ── Table columns ─────────────────────────────────────────────────────────────
const columns = [
  { key: 'name',            label: 'اسم الدخول',    center: false },
  { key: 'subscriberName',  label: 'الاسم الكامل',   center: false },
  { key: 'bytesIn',        label: 'التحميل',        center: true  },
  { key: 'bytesOut',       label: 'الرفع',          center: true  },
  { key: 'packageName',    label: 'الباقة',         center: false },
  { key: 'address',        label: 'IP',             center: false },
  { key: 'macAddress',     label: 'MAC',            center: false },
  { key: 'uptime',         label: 'مدة الاتصال',    center: false },
  { key: 'routerName',     label: 'DEVICE',         center: false },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'active')   return 'bg-green-500';
  if (s === 'disabled') return 'bg-red-500';
  return 'bg-gray-400';
}

function fmtBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024)           return bytes + ' B';
  if (bytes < 1024 * 1024)    return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 ** 3)      return (bytes / 1024 ** 2).toFixed(2) + ' MB';
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

function formatUptime(uptime: string): string {
  if (!uptime) return '—';
  // MikroTik format: 2d3h45m12s → 2d 3h 45m
  return uptime.replace(/(\d+)w/, '$1w ').replace(/(\d+)d/, '$1d ').replace(/(\d+)h/, '$1h ').replace(/(\d+)m/, '$1m ').replace(/(\d+)s.*/, '').trim() || uptime;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value.show = false), 3500);
}

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredConnections = computed(() => {
  let list = connections.value;
  if (filterRouter.value !== '') list = list.filter(c => c.routerId === filterRouter.value);
  if (filterStatus.value)        list = list.filter(c => c.subscriberStatus === filterStatus.value);
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.subscriberName.toLowerCase().includes(q) ||
      c.address.includes(q) ||
      c.macAddress.toLowerCase().includes(q) ||
      c.packageName.toLowerCase().includes(q),
    );
  }
  // Sort
  return [...list].sort((a, b) => {
    const av = (a as any)[sortKey.value] ?? '';
    const bv = (b as any)[sortKey.value] ?? '';
    const cmp = typeof av === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'ar');
    return sortDir.value === 'asc' ? cmp : -cmp;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredConnections.value.length / pageSize.value)));

const pagedConnections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredConnections.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i);
  return pages;
});

// Reset page when filter changes
watch([searchTerm, filterRouter, filterStatus, pageSize], () => { currentPage.value = 1; });

// ── Selection ─────────────────────────────────────────────────────────────────
function connKey(c: Connection) { return c.id + '_' + c.routerId; }

function toggleSelect(c: Connection) {
  const k = connKey(c);
  const s = new Set(selectedIds.value);
  s.has(k) ? s.delete(k) : s.add(k);
  selectedIds.value = s;
}

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedIds.value = new Set(pagedConnections.value.map(connKey));
  } else {
    selectedIds.value = new Set();
  }
}

// ── Sort ──────────────────────────────────────────────────────────────────────
function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'asc'; }
}

// ── API ───────────────────────────────────────────────────────────────────────
async function loadConnections() {
  loading.value = true;
  try {
    const [connRes, routersRes] = await Promise.all([
      api.get('/routers/connections'),
      api.get('/routers'),
    ]);
    connections.value = connRes.data;
    routers.value = routersRes.data;
    lastFetch.value = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (_) {
    showToast('فشل جلب بيانات المتصلين', 'error');
  } finally {
    loading.value = false;
  }
}

async function disconnectOne(conn: Connection) {
  if (!confirm(`هل تريد قطع اتصال "${conn.name}" (${conn.address})؟`)) return;
  const key = connKey(conn);
  disconnectingId.value = key;
  try {
    const { data } = await api.post(`/routers/${conn.routerId}/disconnect-session`, { sessionId: conn.id });
    showToast(data.message || 'تم قطع الاتصال', data.success ? 'success' : 'error');
    if (data.success) {
      connections.value = connections.value.filter(c => connKey(c) !== key);
      selectedIds.value.delete(key);
    }
  } catch (_) {
    showToast('حدث خطأ أثناء قطع الاتصال', 'error');
  } finally {
    disconnectingId.value = '';
  }
}

async function disconnectSelected() {
  if (!selectedIds.value.size) return;
  const count = selectedIds.value.size;
  if (!confirm(`هل تريد قطع اتصال ${count} مشترك محدد؟`)) return;
  disconnecting.value = true;
  let success = 0;
  for (const key of Array.from(selectedIds.value)) {
    const conn = connections.value.find(c => connKey(c) === key);
    if (!conn) continue;
    try {
      const { data } = await api.post(`/routers/${conn.routerId}/disconnect-session`, { sessionId: conn.id });
      if (data.success) { success++; connections.value = connections.value.filter(c => connKey(c) !== key); }
    } catch (_) {}
  }
  selectedIds.value = new Set();
  disconnecting.value = false;
  showToast(`تم قطع الاتصال لـ ${success} من ${count}`, success === count ? 'success' : 'error');
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['اسم الدخول', 'الاسم الكامل', 'التحميل', 'الرفع', 'الباقة', 'IP', 'MAC', 'مدة الاتصال', 'الراوتر', 'الحالة'];
  const rows = filteredConnections.value.map(c => [
    c.name, c.subscriberName,
    fmtBytes(c.bytesIn), fmtBytes(c.bytesOut),
    c.packageName, c.address, c.macAddress,
    c.uptime, c.routerName,
    c.subscriberStatus === 'active' ? 'متصل الصلاحية' : c.subscriberStatus === 'disabled' ? 'معطل' : 'غير معروف',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `connected-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// ── Auto-refresh ──────────────────────────────────────────────────────────────
watch(autoRefresh, (v) => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (v) refreshTimer = setInterval(loadConnections, 30_000);
});

onMounted(() => loadConnections());
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
