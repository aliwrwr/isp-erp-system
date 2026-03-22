<template>
  <div>

    <!-- ══ Personalized Dashboard (manager has linked dashboard group) ══════ -->
    <template v-if="personalLayout.length">
      <div v-for="(row, rIdx) in personalLayout" :key="rIdx" class="grid grid-cols-4 gap-4 mb-4">
        <template v-for="cIdx in 4" :key="cIdx">
          <div v-if="row[cIdx - 1]"
            class="rounded-xl p-4 text-white flex flex-col justify-between min-h-[108px] shadow-md"
            :style="{ background: wDef(row[cIdx - 1].type)?.color ?? '#888' }">
            <div class="flex items-start justify-between gap-2">
              <span class="text-sm font-semibold leading-snug">{{ wDef(row[cIdx - 1].type)?.label ?? row[cIdx - 1].type }}</span>
              <i :class="[wDef(row[cIdx - 1].type)?.icon ?? 'fas fa-chart-bar', 'text-3xl opacity-20 flex-shrink-0 mt-0.5']"></i>
            </div>
            <div>
              <p v-if="wDef(row[cIdx - 1].type)?.sub" class="text-xs opacity-70 mb-0.5 truncate">{{ wDef(row[cIdx - 1].type)?.sub }}</p>
              <p class="text-2xl font-bold tabular-nums">{{ widgetVal(row[cIdx - 1].type) }}</p>
            </div>
          </div>
          <!-- empty cell placeholder -->
          <div v-else class="rounded-xl border border-dashed border-gray-200 min-h-[108px] opacity-30"></div>
        </template>
      </div>
    </template>

    <!-- ══ Default Dashboard ══════════════════════════════════════════════════ -->
    <template v-else>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard title="إجمالي المشتركين" :value="totalSub" icon="fas fa-users" color="#2980B9" />
      <StatsCard title="المشتركين النشطين" :value="activeSub" icon="fas fa-check-circle" color="#27AE60" />
      <StatsCard title="منتهي الصلاحية" :value="expiredSub" icon="fas fa-exclamation-triangle" color="#E74C3C" />
      <StatsCard title="الإيرادات الشهرية" :value="monthlyRevenue" icon="fas fa-coins" color="#F39C12" />
    </div>

    <!-- Routers Overview -->
    <div v-if="canSeeRouters" class="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6">
      <!-- Header -->
      <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-server text-internet text-sm"></i>
          <h3 class="font-bold text-secondary text-sm">حالة الراوترات</h3>
          <span class="text-xs text-gray-400">({{ routerOnlineCount }}/{{ routers.length }} متصل)</span>
          <!-- LIVE badge -->
          <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block"></span>
            LIVE
          </span>
        </div>
        <div class="flex items-center gap-3">
          <!-- countdown -->
          <span class="text-[11px] text-gray-400 flex items-center gap-1">
            <i class="fas fa-sync-alt text-[9px]" :class="{ 'fa-spin': routersLoading }"></i>
            تحديث بعد {{ countdown }}ث
          </span>
          <button @click="refreshRouters(); countdown = LIVE_INTERVAL" :disabled="routersLoading"
            class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary transition">
            تحديث الآن
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="routersLoading && !routers.length" class="flex items-center justify-center py-10 text-gray-400 text-sm gap-2">
        <i class="fas fa-circle-notch fa-spin"></i> جاري تحميل الراوترات...
      </div>

      <!-- Empty -->
      <div v-else-if="!routers.length" class="text-center py-10 text-gray-400 text-sm">
        <i class="fas fa-server opacity-20 text-3xl block mb-2"></i>
        لا توجد راوترات مضافة
      </div>

      <!-- Grid -->
      <div v-else class="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <div v-for="r in routers" :key="r.id"
          class="rounded-xl border p-4 transition-all"
          :class="routerStatus(r.id) === 'online'  ? 'border-green-100 bg-green-50/40' :
                  routerStatus(r.id) === 'offline' ? 'border-red-100 bg-red-50/30' :
                  routerStatus(r.id) === 'checking' ? 'border-gray-100 bg-gray-50' :
                  'border-gray-100 bg-white'">

          <!-- Router header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                :class="routerStatus(r.id) === 'online' ? 'bg-green-100' : routerStatus(r.id) === 'offline' ? 'bg-red-100' : 'bg-gray-100'">
                <i class="fas fa-server text-sm"
                  :class="routerStatus(r.id) === 'online' ? 'text-green-500' : routerStatus(r.id) === 'offline' ? 'text-red-400' : 'text-gray-400'"></i>
              </div>
              <div>
                <p class="text-sm font-bold text-secondary leading-tight">{{ r.name }}</p>
                <p class="text-[11px] text-gray-400 font-mono">{{ r.ipAddress }}</p>
              </div>
            </div>
            <!-- Status badge -->
            <span v-if="routerStatus(r.id) === 'checking'"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-500">
              <i class="fas fa-circle-notch fa-spin text-[8px]"></i> فحص
            </span>
            <span v-else-if="routerStatus(r.id) === 'online'"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> متصل
            </span>
            <span v-else-if="routerStatus(r.id) === 'offline'"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-600 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> منقطع
            </span>
            <span v-else
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] bg-gray-100 text-gray-400">
              <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span> غير معروف
            </span>
          </div>

          <!-- Live stats (online only) -->
          <div v-if="routerStatus(r.id) === 'online' && routerData(r.id)" class="space-y-1.5">
            <!-- CPU -->
            <div class="flex items-center gap-1.5 text-[11px]">
              <span class="text-gray-400 w-7">CPU</span>
              <div class="flex-1 bg-gray-200 rounded-full h-1">
                <div class="h-1 rounded-full transition-all"
                  :class="routerData(r.id).cpu > 80 ? 'bg-red-400' : routerData(r.id).cpu > 50 ? 'bg-yellow-400' : 'bg-green-400'"
                  :style="`width:${routerData(r.id).cpu}%`"></div>
              </div>
              <span class="text-gray-500 w-6 text-right font-mono">{{ routerData(r.id).cpu }}%</span>
            </div>
            <!-- RAM -->
            <div class="flex items-center gap-1.5 text-[11px]">
              <span class="text-gray-400 w-7">RAM</span>
              <div class="flex-1 bg-gray-200 rounded-full h-1">
                <div class="h-1 rounded-full transition-all bg-blue-400"
                  :style="`width:${ramPct(r.id)}%`"></div>
              </div>
              <span class="text-gray-500 w-6 text-right font-mono">{{ ramPct(r.id) }}%</span>
            </div>
            <!-- Uptime -->
            <div class="flex items-center justify-between pt-1 text-[10px] text-gray-400 border-t border-gray-100 mt-1">
              <span><i class="fas fa-clock mr-0.5"></i> {{ routerData(r.id).uptime }}</span>
              <span class="font-mono text-gray-500">v{{ routerData(r.id).version }}</span>
            </div>
          </div>

          <!-- Offline message -->
          <div v-else-if="routerStatus(r.id) === 'offline'" class="text-[11px] text-red-400 flex items-center gap-1 mt-1">
            <i class="fas fa-exclamation-circle text-[10px]"></i> تعذّر الاتصال بالجهاز
          </div>

          <!-- Location tag -->
          <div v-if="r.location" class="mt-2 flex items-center gap-1 text-[10px] text-gray-400">
            <i class="fas fa-map-marker-alt text-[9px]"></i>{{ r.location }}
          </div>
        </div>
      </div>

      <!-- Summary bar -->
      <div v-if="routers.length" class="px-5 py-3 border-t border-gray-50 flex items-center gap-6 text-xs text-gray-500">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-green-500"></span>
          متصل: <strong class="text-green-600">{{ routerOnlineCount }}</strong>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-red-400"></span>
          منقطع: <strong class="text-red-500">{{ routerOfflineCount }}</strong>
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-gray-300"></span>
          غير معروف: <strong class="text-gray-500">{{ routerUnknownCount }}</strong>
        </span>
        <span class="mr-auto text-gray-400">آخر تحديث: {{ lastRefresh }}</span>
      </div>
    </div>

    <!-- Bottom Row: Subscriber Stats + Server Resources -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Right: Subscriber Stats -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <i class="fas fa-users text-internet text-sm"></i>
          <h3 class="font-bold text-secondary text-sm">المشتركين</h3>
        </div>
        <div class="divide-y divide-gray-50">
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-secondary">{{ totalSub }}</span>
            <span class="text-sm text-gray-500">عدد المشتركين</span>
          </div>
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-green-600">{{ activeSub }}</span>
            <span class="text-sm text-gray-500">المشتركين الفعاليين</span>
          </div>
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-red-500">{{ expiredSub }}</span>
            <span class="text-sm text-gray-500">المنتهي اشتراكهم</span>
          </div>
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-orange-500">{{ expiringToday }}</span>
            <span class="text-sm text-gray-500">ينتهي اشتراكهم اليوم</span>
          </div>
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-yellow-600">{{ almostExpiring }}</span>
            <span class="text-sm text-gray-500">على وشك الانتهاء</span>
          </div>
          <div class="flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition">
            <span class="text-sm font-bold text-indigo-600">{{ adminCount }}</span>
            <span class="text-sm text-gray-500">مدراء النظام</span>
          </div>
        </div>
      </div>

      <!-- Left: Server Resources -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <i class="fas fa-microchip text-internet text-sm"></i>
          <h3 class="font-bold text-secondary text-sm">موارد الخادم</h3>
          <button @click="fetchServerStats" class="mr-auto text-xs text-gray-400 hover:text-primary transition flex items-center gap-1">
            <i class="fas fa-sync-alt text-[10px]"></i> تحديث
          </button>
        </div>
        <div class="p-5 grid grid-cols-3 gap-4">
          <!-- CPU -->
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center mb-2">
              <i class="fas fa-robot text-orange-500 text-sm"></i>
            </div>
            <svg viewBox="-5 -5 210 115" class="w-full max-w-[140px]">
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#f3f4f6" stroke-width="18" stroke-linecap="round"/>
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#f97316" stroke-width="18" stroke-linecap="round"
                :stroke-dasharray="`${(serverStats.cpu / 100) * 282.74} 282.74`"
                class="transition-all duration-700"/>
              <text x="100" y="82" text-anchor="middle" font-size="20" font-weight="700" fill="#0ea5e9">{{ serverStats.cpu }}%</text>
            </svg>
            <p class="text-xs text-gray-500 mt-1 font-medium">المعالج</p>
          </div>
          <!-- RAM -->
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
              <i class="fas fa-memory text-purple-500 text-sm"></i>
            </div>
            <svg viewBox="-5 -5 210 115" class="w-full max-w-[140px]">
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#f3f4f6" stroke-width="18" stroke-linecap="round"/>
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#a855f7" stroke-width="18" stroke-linecap="round"
                :stroke-dasharray="`${(serverStats.ram / 100) * 282.74} 282.74`"
                class="transition-all duration-700"/>
              <text x="100" y="82" text-anchor="middle" font-size="20" font-weight="700" fill="#0ea5e9">{{ serverStats.ram }}%</text>
            </svg>
            <p class="text-xs text-gray-500 mt-1 font-medium">الذاكرة العشوائية</p>
          </div>
          <!-- Disk -->
          <div class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-2">
              <i class="fas fa-hdd text-green-500 text-sm"></i>
            </div>
            <svg viewBox="-5 -5 210 115" class="w-full max-w-[140px]">
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#f3f4f6" stroke-width="18" stroke-linecap="round"/>
              <path d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none" stroke="#22c55e" stroke-width="18" stroke-linecap="round"
                :stroke-dasharray="`${(serverStats.disk / 100) * 282.74} 282.74`"
                class="transition-all duration-700"/>
              <text x="100" y="82" text-anchor="middle" font-size="20" font-weight="700" fill="#0ea5e9">{{ serverStats.disk }}%</text>
            </svg>
            <p class="text-xs text-gray-500 mt-1 font-medium">وحدة الخزن</p>
          </div>
        </div>
      </div>
    </div>

    </template><!-- end default dashboard -->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// ── Widget Definitions (same as GroupsView) ───────────────────────────────
interface WDef { type: string; label: string; sub?: string; icon: string; color: string; }
const WIDGET_DEFS: WDef[] = [
  { type: 'total_subs',   label: 'عدد المشتركين',         sub: 'العدد الكلي للمشتركين',   icon: 'fas fa-users',               color: '#3B82F6' },
  { type: 'active_subs',  label: 'المشتركين الفعالين',    sub: 'مشتركين متصلين حالياً',   icon: 'fas fa-user-check',          color: '#10B981' },
  { type: 'connected',    label: 'المتصلين',              sub: 'مشتركين متصلين حالياً',   icon: 'fas fa-signal',              color: '#06B6D4' },
  { type: 'managers',     label: 'المدراء',               sub: 'عدد المدراء المفوّضين',    icon: 'fas fa-user-shield',         color: '#6366F1' },
  { type: 'cancelled',    label: 'منتهي اشتراكاتهم',                                     icon: 'fas fa-user-times',          color: '#EF4444' },
  { type: 'exp_soon',     label: 'تنتهي اشتراكاتهم',     sub: 'ختى اشتراكهم بـ 3 أيام', icon: 'fas fa-clock',               color: '#F59E0B' },
  { type: 'exp_today',    label: 'ينتهي اشتراكهم اليوم',                                  icon: 'fas fa-calendar-day',        color: '#8B5CF6' },
  { type: 'balance',      label: 'الرصيد',                sub: 'الرصيد الإجمالي',         icon: 'fas fa-wallet',              color: '#059669' },
  { type: 'uptime',       label: 'مدة عمل النظام',        sub: 'الفترة المستمرة',         icon: 'fas fa-server',              color: '#7C3AED' },
  { type: 'ram',          label: 'ذاكرة النظام',          sub: 'الذاكرة المستخدمة',       icon: 'fas fa-memory',              color: '#7E22CE' },
  { type: 'storage',      label: 'وحدة الخزن',            sub: 'المساحة المستخدمة',       icon: 'fas fa-hdd',                 color: '#475569' },
  { type: 'network',      label: 'الشبكة',                sub: 'حالة الشبكة',             icon: 'fas fa-wifi',                color: '#0F172A' },
  { type: 'dns_ping',     label: 'DNS Ping',              sub: 'Ping on 1.1.1.1',        icon: 'fas fa-satellite-dish',      color: '#0891B2' },
  { type: 'google_ping',  label: 'Google Ping',           sub: 'Ping on Google.com',     icon: 'fab fa-google',              color: '#16A34A' },
  { type: 'points',       label: 'النقاط التشجيعية',                                      icon: 'fas fa-star',                color: '#EA580C' },
  { type: 'online_fup',   label: 'Online FUP',                                           icon: 'fas fa-tachometer-alt',      color: '#0D9488' },
  { type: 'system_time',  label: 'System Time',                                          icon: 'fas fa-clock',               color: '#4F46E5' },
  { type: 'debts',        label: 'الديون',                sub: 'ديون مستحقة عليه',        icon: 'fas fa-balance-scale',       color: '#B91C1C' },
  { type: 'financial',    label: 'المطالبات المالية',     sub: 'ديون مستحقة له',          icon: 'fas fa-file-invoice-dollar', color: '#7C3AED' },
];
function wDef(type: string): WDef | undefined { return WIDGET_DEFS.find(w => w.type === type); }

function widgetVal(type: string): string {
  switch (type) {
    case 'total_subs':  return String(totalSub.value);
    case 'active_subs': return String(activeSub.value);
    case 'connected':   return String(activeSub.value);
    case 'managers':    return String(adminCount.value);
    case 'cancelled':   return String(expiredSub.value);
    case 'exp_soon':    return String(almostExpiring.value);
    case 'exp_today':   return String(expiringToday.value);
    case 'ram':         return serverStats.value.ram ? `${serverStats.value.ram}%` : '—';
    case 'storage':     return serverStats.value.disk ? `${serverStats.value.disk}%` : '—';
    case 'network':
      if (routers.value.length) {
        const online = routerOnlineCount.value;
        const total = routers.value.length;
        return `${online}/${total}`;
      }
      return serverStats.value.cpu ? `${serverStats.value.cpu}%` : '—';
    case 'system_time':
      return serverStats.value.uptime ? formatUptime(serverStats.value.uptime) : '—';
    case 'dns_ping':
    case 'google_ping':
      return '—';
    case 'points':
      return '—';
    case 'online_fup':
      return '—';
    case 'debts':
    case 'financial':
      return '—';
    default:            return '—';
  }
}

// ── Personalized Dashboard ────────────────────────────────────────
type PCell = { type: string } | null;
const personalLayout = ref<PCell[][]>([]);

const canSeeRouters = computed(() => authStore.hasPermission('internet.routers'));



// ── Subscribers / Subscriptions ───────────────────────────────────
const subscribersData = ref<any[]>([]);
const subscriptionsData = ref<any[]>([]);
const managersData = ref<any[]>([]);

const totalSub = computed(() => subscribersData.value.length);
const activeSub = computed(() => {
  const now = Date.now();
  return subscribersData.value.filter(s => {
    if (s.status === 'suspended' || s.isEnabled === false) return false;
    return s.subscriptions?.some((sub: any) =>
      sub.status === 'active' && (!sub.endDate || new Date(sub.endDate).getTime() >= now)
    );
  }).length;
});
const expiredSub = computed(() => totalSub.value - activeSub.value);
const monthlyRevenue = computed(() => {
  const sum = subscriptionsData.value.reduce((s, x) => s + Number(x.price || 0), 0);
  return '$' + sum.toLocaleString();
});

const expiringToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return subscriptionsData.value.filter(s => s.status === 'active' && s.endDate?.slice(0, 10) === today).length;
});
const almostExpiring = computed(() => {
  const now = Date.now();
  return subscriptionsData.value.filter(s => {
    if (s.status !== 'active' || !s.endDate) return false;
    const days = Math.ceil((new Date(s.endDate).getTime() - now) / 86400000);
    return days > 0 && days <= 7;
  }).length;
});
const adminCount = computed(() => managersData.value.length);

// ── Server Resources ──────────────────────────────────────────────
const serverStats = ref({ cpu: 0, ram: 0, disk: 0, uptime: 0 });
function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = uptimeSeconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || !parts.length) parts.push(`${seconds}s`);
  return parts.join(' ');
}

async function fetchServerStats() {
  try {
    const { data } = await api.get('/system/stats');
    serverStats.value = data;
  } catch { /* ignore */ }
}

// ── Routers ───────────────────────────────────────────────────────
const routers = ref<any[]>([]);
const routerStatuses = ref<Record<number, 'checking' | 'online' | 'offline' | 'unknown'>>({});
const routerStatusData = ref<Record<number, any>>({});
const routersLoading = ref(false);
const lastRefresh = ref('—');

const routerOnlineCount  = computed(() => Object.values(routerStatuses.value).filter(s => s === 'online').length);
const routerOfflineCount = computed(() => Object.values(routerStatuses.value).filter(s => s === 'offline').length);
const routerUnknownCount = computed(() => routers.value.filter(r => !routerStatuses.value[r.id] || routerStatuses.value[r.id] === 'unknown').length);

// ── Live refresh ──────────────────────────────────────────────────
let liveTimer: ReturnType<typeof setInterval> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const LIVE_INTERVAL = 10; // seconds
const countdown = ref(LIVE_INTERVAL);

function startLiveRefresh() {
  if (liveTimer) clearInterval(liveTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  countdown.value = LIVE_INTERVAL;
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) countdown.value = LIVE_INTERVAL;
  }, 1000);
  liveTimer = setInterval(() => {
    refreshRouters();
  }, LIVE_INTERVAL * 1000);
}

function routerStatus(id: number): string {
  return routerStatuses.value[id] || 'unknown';
}
function routerData(id: number): any {
  return routerStatusData.value[id] || null;
}
function ramPct(id: number): number {
  const d = routerStatusData.value[id];
  if (!d || !d.totalMemory) return 0;
  return Math.round((d.totalMemory - d.freeMemory) / d.totalMemory * 100);
}

async function checkOne(r: any) {
  routerStatuses.value[r.id] = 'checking';
  try {
    const { data } = await api.get(`/routers/${r.id}/status`);
    if (data?.online !== false && data?.identity) {
      routerStatuses.value[r.id] = 'online';
      routerStatusData.value[r.id] = data;
    } else {
      routerStatuses.value[r.id] = 'offline';
    }
  } catch {
    routerStatuses.value[r.id] = 'offline';
  }
}

async function refreshRouters() {
  if (!routers.value.length) return;
  routersLoading.value = true;
  await Promise.all(routers.value.map(r => checkOne(r)));
  routersLoading.value = false;
  const now = new Date();
  lastRefresh.value = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}

// ── Mount ─────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const requests: Promise<any>[] = [
      api.get('/subscribers'),
      api.get('/subscriptions'),
      api.get('/managers'),
    ];
    if (canSeeRouters.value) requests.push(api.get('/routers'));
    const [subRes, subscRes, managersRes, routersRes] = await Promise.all(requests);
    subscribersData.value = subRes.data;
    subscriptionsData.value = subscRes.data;
    managersData.value = managersRes?.data || [];
    if (routersRes) routers.value = routersRes.data;
  } catch {}

  // Load personalized dashboard for current manager
  try {
    // First try the layout from profile (via authStore.user.dashboardLayout)
    const dashboardLayout = authStore.user?.dashboardLayout;
    if (dashboardLayout) {
      try {
        personalLayout.value = JSON.parse(dashboardLayout);
        console.log('[DashboardView] personalLayout loaded from profile:', personalLayout.value);
      } catch (err) {
        console.warn('[DashboardView] failed to parse dashboardLayout:', err);
      }
    } else if (authStore.user?.groupId) {
      // Fallback: look up group and its dashboard connection
      const secRes = await api.get(`/groups/${authStore.user.groupId}`).catch(() => null);
      const secGrp = secRes?.data;
      if (secGrp) {
        let layout = secGrp.layout;
        if (!layout && secGrp.dashboardId) {
          const dashRes = await api.get(`/groups/${secGrp.dashboardId}`).catch(() => null);
          layout = dashRes?.data?.layout;
        }
        if (layout) {
          try {
            personalLayout.value = JSON.parse(layout);
            console.log('[DashboardView] personalLayout loaded from (fallback) group:', personalLayout.value);
          } catch (err) {
            console.warn('[DashboardView] failed to parse fallback layout:', err);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[DashboardView] failed while loading personal layout:', err);
  }

  fetchServerStats();
  // Check routers status in background (non-blocking)
  if (canSeeRouters.value) {
    refreshRouters();
    startLiveRefresh();
  }
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
  if (countdownTimer) clearInterval(countdownTimer);
});
</script>
