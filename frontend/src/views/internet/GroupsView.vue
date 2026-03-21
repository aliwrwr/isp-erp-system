<template>
  <!-- stretch out of main padding -->
  <div class="flex flex-col bg-gray-100 -m-4 lg:-m-6 overflow-hidden" style="height:calc(100vh - 56px)" dir="rtl">

    <!-- ══ Top Bar ══════════════════════════════════════════════════════════ -->
    <div class="bg-[#1e293b] text-white px-5 py-2.5 flex items-center justify-between flex-shrink-0 select-none">
      <div class="flex items-center gap-1.5 text-sm">
        <span class="text-gray-400 text-xs font-medium">Tools</span>
        <span class="text-gray-600 px-0.5">/</span>
        <span class="font-semibold tracking-wide">Dashboard Manager</span>
      </div>
      <i class="fas fa-sliders-h text-gray-400 hover:text-white cursor-pointer transition text-sm"></i>
    </div>

    <!-- ══ Body ═════════════════════════════════════════════════════════════ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- Sidebar: available widgets -->
      <aside class="w-52 bg-white border-l border-gray-200 flex flex-col overflow-y-auto flex-shrink-0 shadow-sm">
        <div class="px-3 pt-3 pb-2 border-b border-gray-100 sticky top-0 bg-white z-10">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">الودجات</p>
        </div>
        <div class="p-2 space-y-0.5">
          <div
            v-for="wd in WIDGET_DEFS" :key="wd.type"
            draggable="true"
            @dragstart.stop="startDragSidebar(wd)"
            @dragend="endDrag"
            class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab active:cursor-grabbing border border-transparent hover:bg-gray-50 hover:border-gray-200 transition select-none"
            :class="dragging?.from==='sidebar' && dragging.wd.type===wd.type ? 'opacity-40' : ''"
          >
            <span class="w-6 h-6 rounded-md flex items-center justify-center text-white text-[11px] flex-shrink-0 shadow-sm"
              :style="{ background: wd.color }">
              <i :class="wd.icon"></i>
            </span>
            <span class="text-xs text-gray-700 font-medium leading-tight">{{ wd.label }}</span>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <div class="flex-1 overflow-y-auto p-5">
        <div class="space-y-3 max-w-5xl">

          <!-- Rows -->
          <div v-for="(row, rIdx) in layout" :key="rIdx" class="relative group/row">
            <div class="grid grid-cols-4 gap-3">
              <template v-for="cIdx in 4" :key="cIdx-1">

                <!-- Filled cell -->
                <div
                  v-if="row[cIdx-1]"
                  draggable="true"
                  @dragstart.stop="startDragCanvas(rIdx, cIdx-1)"
                  @dragend="endDrag"
                  @dragover.prevent="dropTarget = { rIdx, cIdx: cIdx-1 }"
                  @dragleave.self="dropTarget = null"
                  @drop.stop="handleDrop(rIdx, cIdx-1)"
                  class="rounded-xl p-4 text-white relative group/cell cursor-grab active:cursor-grabbing min-h-[100px] flex flex-col justify-between shadow-md hover:shadow-xl transition select-none"
                  :style="{ background: defOf(row[cIdx-1]!.type)?.color ?? '#888' }"
                  :class="dropTarget?.rIdx===rIdx && dropTarget?.cIdx===cIdx-1 ? 'ring-2 ring-white ring-offset-1 opacity-80' : ''"
                >
                  <button @click.stop="removeWidget(rIdx, cIdx-1)"
                    class="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-black/20 hover:bg-red-500 flex items-center justify-center text-[9px] opacity-0 group-hover/cell:opacity-100 transition z-10">
                    <i class="fas fa-times"></i>
                  </button>
                  <div class="flex items-start justify-between gap-2">
                    <span class="text-sm font-semibold leading-snug">{{ defOf(row[cIdx-1]!.type)?.label ?? row[cIdx-1]!.type }}</span>
                    <i :class="[defOf(row[cIdx-1]!.type)?.icon ?? 'fas fa-chart-bar', 'text-3xl opacity-20 flex-shrink-0']"></i>
                  </div>
                  <div>
                    <p v-if="defOf(row[cIdx-1]!.type)?.sub" class="text-xs opacity-70 mb-0.5 truncate">{{ defOf(row[cIdx-1]!.type)!.sub }}</p>
                    <p class="text-xl font-bold truncate">{{ getVal(row[cIdx-1]!.type) }}</p>
                  </div>
                </div>

                <!-- Empty slot -->
                <div
                  v-else
                  @dragover.prevent="dropTarget = { rIdx, cIdx: cIdx-1 }"
                  @dragleave.self="dropTarget = null"
                  @drop.stop="handleDrop(rIdx, cIdx-1)"
                  class="rounded-xl border-2 border-dashed min-h-[100px] flex items-center justify-center transition"
                  :class="dropTarget?.rIdx===rIdx && dropTarget?.cIdx===cIdx-1
                    ? 'border-primary bg-primary/5 text-primary scale-[1.02]'
                    : 'border-gray-200 text-gray-300 hover:border-gray-300'"
                >
                  <i class="fas fa-plus text-xl"></i>
                </div>

              </template>
            </div>
            <!-- Remove row -->
            <button @click="removeRow(rIdx)"
              class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-[9px] items-center justify-center hidden group-hover/row:flex shadow z-10">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Add Row -->
          <button @click="addRow"
            class="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm hover:border-primary hover:text-primary transition flex items-center justify-center gap-2">
            <i class="fas fa-plus"></i> Add Row
          </button>

        </div>
      </div>
    </div>

    <!-- ══ Bottom Bar ════════════════════════════════════════════════════════ -->
    <div class="bg-white border-t border-gray-200 px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
      <button @click="confirmDelete" title="حذف اللوحة"
        class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
        <i class="fas fa-trash text-xs"></i>
      </button>
      <button @click="newDashboard" title="لوحة جديدة"
        class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition">
        <i class="fas fa-plus text-xs"></i>
      </button>
      <div class="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"></div>
      <select v-model="currentId" @change="switchDashboard"
        class="flex-1 text-sm text-gray-600 border-0 focus:outline-none bg-transparent cursor-pointer min-w-0">
        <option v-if="!dashboards.length" :value="null">— لا توجد لوحات —</option>
        <option v-for="d in dashboards" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <div class="w-px h-5 bg-gray-200 mx-1 flex-shrink-0"></div>
      <input v-model="currentName"
        class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 w-40 flex-shrink-0"
        placeholder="اسم اللوحة..." />
      <button @click="saveDashboard" :disabled="saving"
        class="bg-primary hover:bg-primary-dark text-white text-xs px-4 py-1.5 rounded-lg font-semibold transition disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        حفظ
      </button>
    </div>

    <!-- Toast -->
    <div v-if="toast.show"
      :class="toast.ok ? 'bg-green-500' : 'bg-red-500'"
      class="fixed bottom-14 left-1/2 -translate-x-1/2 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium z-50 transition">
      {{ toast.msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

// ── Widget Definitions ──────────────────────────────────────────────────────
interface WDef { type: string; label: string; sub?: string; icon: string; color: string; }

const WIDGET_DEFS: WDef[] = [
  { type: 'total_subs',      label: 'عدد المشتركين',        sub: 'العدد الكلي للمشتركين',        icon: 'fas fa-users',              color: '#3B82F6' },
  { type: 'active_subs',     label: 'المشتركين الفعالين',   sub: 'مشتركين متصلين حالياً',        icon: 'fas fa-user-check',         color: '#10B981' },
  { type: 'connected',       label: 'المتصلين',             sub: 'مشتركين متصلين حالياً',        icon: 'fas fa-signal',             color: '#06B6D4' },
  { type: 'managers',        label: 'المدراء',              sub: 'عدد المدراء المفوّضين',         icon: 'fas fa-user-shield',        color: '#6366F1' },
  { type: 'cancelled',       label: 'الملغى اشتراكاتهم',                                         icon: 'fas fa-user-times',         color: '#EF4444' },
  { type: 'exp_soon',        label: 'تنتهي اشتراكاتهم',    sub: 'ختى اشتراكهم بـ 3 أيام',      icon: 'fas fa-clock',              color: '#F59E0B' },
  { type: 'exp_today',       label: 'ينتهي اشتراكهم اليوم',                                      icon: 'fas fa-calendar-day',       color: '#8B5CF6' },
  { type: 'balance',         label: 'الرصيد',               sub: 'الرصيد الإجمالي',              icon: 'fas fa-wallet',             color: '#059669' },
  { type: 'uptime',          label: 'مدة عمل النظام',       sub: 'الفترة المستمرة',              icon: 'fas fa-server',             color: '#7C3AED' },
  { type: 'ram',             label: 'ذاكر النظام',          sub: 'الذاكرة المستخدمة',            icon: 'fas fa-memory',             color: '#7E22CE' },
  { type: 'storage',         label: 'وحدة الخزن',           sub: 'المساحة المستخدمة',            icon: 'fas fa-hdd',                color: '#475569' },
  { type: 'network',         label: 'الشبكة',               sub: 'حالة الشبكة',                  icon: 'fas fa-wifi',               color: '#0F172A' },
  { type: 'dns_ping',        label: 'DNS Ping',             sub: 'Ping on 1.1.1.1',             icon: 'fas fa-satellite-dish',     color: '#0891B2' },
  { type: 'google_ping',     label: 'Google Ping',          sub: 'Ping on Google.com',          icon: 'fab fa-google',             color: '#16A34A' },
  { type: 'points',          label: 'النقاط التشجيعية',                                          icon: 'fas fa-star',               color: '#EA580C' },
  { type: 'online_fup',      label: 'Online FUP',                                               icon: 'fas fa-tachometer-alt',     color: '#0D9488' },
  { type: 'system_time',     label: 'System Time',                                              icon: 'fas fa-clock',              color: '#4F46E5' },
  { type: 'debts',           label: 'الديون',               sub: 'ديون مستحقة عليه',             icon: 'fas fa-balance-scale',      color: '#B91C1C' },
  { type: 'financial',       label: 'المطالبات المالية',    sub: 'ديون مستحقة له',               icon: 'fas fa-file-invoice-dollar',color: '#7C3AED' },
];

function defOf(type: string): WDef | undefined {
  return WIDGET_DEFS.find(w => w.type === type);
}

// ── Layout ──────────────────────────────────────────────────────────────────
type Cell = { type: string } | null;
type Row  = [Cell, Cell, Cell, Cell];

const layout = ref<Row[]>([[null, null, null, null]]);

function emptyRow(): Row { return [null, null, null, null]; }

function parseLayout(raw: string | null | undefined): Row[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {}
  return [emptyRow()];
}

// ── Dashboards ──────────────────────────────────────────────────────────────
const dashboards  = ref<any[]>([]);
const currentId   = ref<number | null>(null);
const currentName = ref('');
const saving      = ref(false);
const toast       = ref({ show: false, msg: '', ok: true });

function showToast(msg: string, ok = true) {
  toast.value = { show: true, msg, ok };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

async function loadDashboards() {
  try {
    const { data } = await api.get('/groups');
    dashboards.value = data;
    if (data.length) loadDashboard(data[0]);
  } catch {}
}

function loadDashboard(d: any) {
  currentId.value   = d.id;
  currentName.value = d.name;
  layout.value      = parseLayout(d.layout);
}

function switchDashboard() {
  const d = dashboards.value.find(x => x.id === currentId.value);
  if (d) loadDashboard(d);
}

function newDashboard() {
  currentId.value   = null;
  currentName.value = 'لوحة جديدة';
  layout.value      = [emptyRow()];
}

async function saveDashboard() {
  if (!currentName.value.trim()) return;
  saving.value = true;
  try {
    const payload = { name: currentName.value, layout: JSON.stringify(layout.value) };
    if (currentId.value) {
      await api.patch(`/groups/${currentId.value}`, payload);
      const idx = dashboards.value.findIndex(d => d.id === currentId.value);
      if (idx >= 0) dashboards.value[idx] = { ...dashboards.value[idx], ...payload };
      showToast('تم الحفظ بنجاح');
    } else {
      const { data } = await api.post('/groups', payload);
      dashboards.value.push(data);
      currentId.value = data.id;
      showToast('تم إنشاء اللوحة بنجاح');
    }
  } catch { showToast('حدث خطأ أثناء الحفظ', false); }
  saving.value = false;
}

async function confirmDelete() {
  if (!currentId.value) return;
  if (!confirm('هل أنت متأكد من حذف هذه اللوحة؟')) return;
  try {
    await api.delete(`/groups/${currentId.value}`);
    dashboards.value = dashboards.value.filter(d => d.id !== currentId.value);
    if (dashboards.value.length) loadDashboard(dashboards.value[0]);
    else newDashboard();
    showToast('تم الحذف');
  } catch { showToast('حدث خطأ', false); }
}

// ── Layout Operations ────────────────────────────────────────────────────────
function addRow() {
  layout.value = [...layout.value, emptyRow()];
}

function removeRow(rIdx: number) {
  if (layout.value.length <= 1) return;
  layout.value = layout.value.filter((_, i) => i !== rIdx);
}

function removeWidget(rIdx: number, cIdx: number) {
  const nl = layout.value.map(r => [...r] as Row);
  nl[rIdx][cIdx] = null;
  layout.value = nl;
}

// ── Drag & Drop ──────────────────────────────────────────────────────────────
type DragSrc =
  | { from: 'sidebar'; wd: WDef }
  | { from: 'canvas';  rIdx: number; cIdx: number };

const dragging   = ref<DragSrc | null>(null);
const dropTarget = ref<{ rIdx: number; cIdx: number } | null>(null);

function startDragSidebar(wd: WDef)             { dragging.value = { from: 'sidebar', wd }; }
function startDragCanvas(rIdx: number, cIdx: number) { dragging.value = { from: 'canvas', rIdx, cIdx }; }
function endDrag()                              { dragging.value = null; dropTarget.value = null; }

function handleDrop(rIdx: number, cIdx: number) {
  const src = dragging.value;
  if (!src) return;
  const nl = layout.value.map(r => [...r] as Row);

  if (src.from === 'sidebar') {
    nl[rIdx][cIdx] = { type: src.wd.type };
  } else {
    // swap canvas cells
    const tmp          = nl[rIdx][cIdx];
    nl[rIdx][cIdx]     = nl[src.rIdx][src.cIdx];
    nl[src.rIdx][src.cIdx] = tmp;
  }
  layout.value = nl;
  dropTarget.value = null;
  dragging.value = null;
}

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = ref<Record<string, any>>({});

function getVal(type: string): string {
  const s = stats.value;
  switch (type) {
    case 'total_subs':   return String(s.totalSubs  ?? '—');
    case 'active_subs':  return String(s.activeSubs ?? '—');
    case 'connected':    return String(s.connected  ?? '—');
    case 'managers':     return String(s.managers   ?? '—');
    case 'cancelled':    return String(s.cancelled  ?? '—');
    case 'exp_soon':     return String(s.expSoon    ?? '—');
    case 'exp_today':    return String(s.expToday   ?? '—');
    case 'balance':      return s.balance  ? `IQD ${Number(s.balance).toLocaleString()}`   : 'IQD 0';
    case 'debts':        return s.debts    ? `IQD ${Number(s.debts).toLocaleString()}`     : 'IQD 0.00';
    case 'financial':    return s.financial? `IQD ${Number(s.financial).toLocaleString()}` : 'IQD 0.00';
    case 'ram':          return s.ram      ? `${s.ram}%`     : '—';
    case 'storage':      return s.disk     ? `${s.disk}%`    : '—';
    case 'uptime':       return s.uptime   ?? '—';
    case 'network':      return s.network  ?? 'packet loss, 0 ms 0%';
    case 'dns_ping':     return s.dnsPing  ? `${s.dnsPing} ms` : '—';
    case 'google_ping':  return s.googlePing ? `${s.googlePing} ms` : '—';
    case 'points':       return String(s.points ?? '—');
    case 'online_fup':   return String(s.onlineFup ?? '—');
    case 'system_time':  return s.systemTime ?? new Date().toLocaleString('ar-IQ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
    default: return '—';
  }
}

async function loadStats() {
  try {
    const [sys, subs, mgrs] = await Promise.all([
      api.get('/system/stats').catch(() => ({ data: {} })),
      api.get('/subscribers').catch(() => ({ data: [] })),
      api.get('/managers').catch(() => ({ data: [] })),
    ]);
    const subsArr: any[] = Array.isArray(subs.data) ? subs.data : [];
    const now = new Date();
    const active = subsArr.filter(s => {
      if (s.isEnabled === false) return false;
      const sub = [...(s.subscriptions ?? [])].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
      return sub && new Date(sub.endDate) >= now;
    }).length;
    const expToday = subsArr.filter(s => {
      const sub = [...(s.subscriptions ?? [])].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
      if (!sub?.endDate) return false;
      const d = new Date(sub.endDate);
      return d.getFullYear()===now.getFullYear() && d.getMonth()===now.getMonth() && d.getDate()===now.getDate();
    }).length;
    const expSoon = subsArr.filter(s => {
      const sub = [...(s.subscriptions ?? [])].sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];
      if (!sub?.endDate) return false;
      const diff = (new Date(sub.endDate).getTime() - now.getTime()) / 86400000;
      return diff >= 0 && diff <= 3;
    }).length;

    stats.value = {
      totalSubs:  subsArr.length,
      activeSubs: active,
      expToday,
      expSoon,
      cancelled:  subsArr.filter(s => s.status !== 'active').length,
      managers:   Array.isArray(mgrs.data) ? mgrs.data.length : 0,
      ram:        sys.data?.ram  ?? 0,
      disk:       sys.data?.disk ?? 0,
      systemTime: new Date().toLocaleString('ar-IQ', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
    };
  } catch {}
}

onMounted(() => { loadDashboards(); loadStats(); });
</script>

