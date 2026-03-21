<template>
  <div>
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

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const canSeeRouters = computed(() => authStore.hasPermission('internet.routers'));

// ── Subscribers / Subscriptions ───────────────────────────────────
const subscribersData = ref<any[]>([]);
const subscriptionsData = ref<any[]>([]);

const totalSub = computed(() => subscribersData.value.length);
const activeSub = computed(() => subscribersData.value.filter(s => s.status === 'active').length);
const expiredSub = computed(() => totalSub.value - activeSub.value);
const monthlyRevenue = computed(() => {
  const sum = subscriptionsData.value.reduce((s, x) => s + Number(x.price || 0), 0);
  return '$' + sum.toLocaleString();
});

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
    const requests: Promise<any>[] = [api.get('/subscribers'), api.get('/subscriptions')];
    if (canSeeRouters.value) requests.push(api.get('/routers'));
    const [subRes, subscRes, routersRes] = await Promise.all(requests);
    subscribersData.value = subRes.data;
    subscriptionsData.value = subscRes.data;
    if (routersRes) routers.value = routersRes.data;
  } catch {}
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
