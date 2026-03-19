<template>
  <div :class="fullscreen && 'fixed inset-0 z-50 bg-gray-950 overflow-auto p-4'" class="transition-all">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-2xl bg-restaurant/10 flex items-center justify-center">
          <i class="fas fa-fire text-restaurant text-lg"></i>
        </div>
        <div>
          <h2 class="text-lg font-bold" :class="fullscreen ? 'text-white' : 'text-secondary'">شاشة المطبخ</h2>
          <p class="text-xs text-gray-400">{{ currentTime }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <!-- Refresh countdown -->
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs text-gray-500 font-medium">
          <i class="fas fa-sync-alt text-xs" :class="refreshing && 'fa-spin text-restaurant'"></i>
          <span>تحديث بعد {{ countdown }}ث</span>
        </div>
        <!-- Sound toggle -->
        <button @click="soundEnabled = !soundEnabled"
          :class="soundEnabled ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'"
          class="p-2 rounded-xl border text-sm transition" :title="soundEnabled ? 'تعطيل الصوت' : 'تفعيل الصوت'">
          <i :class="soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute'"></i>
        </button>
        <!-- Fullscreen -->
        <button @click="fullscreen = !fullscreen"
          class="p-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm transition">
          <i :class="fullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
        <!-- Manual refresh -->
        <button @click="load"
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-restaurant text-white text-sm font-bold shadow-md shadow-restaurant/25 hover:opacity-90 transition">
          <i class="fas fa-sync-alt" :class="refreshing && 'fa-spin'"></i>
          تحديث
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      <div class="rounded-2xl p-3 text-center border-2 border-yellow-200 bg-yellow-50">
        <p class="text-3xl font-black text-yellow-700">{{ pending.length }}</p>
        <p class="text-xs font-bold text-yellow-600 mt-0.5">انتظار</p>
      </div>
      <div class="rounded-2xl p-3 text-center border-2 border-blue-200 bg-blue-50">
        <p class="text-3xl font-black text-blue-700">{{ preparing.length }}</p>
        <p class="text-xs font-bold text-blue-600 mt-0.5">تحضير</p>
      </div>
      <div class="rounded-2xl p-3 text-center border-2 border-green-200 bg-green-50">
        <p class="text-3xl font-black text-green-700">{{ ready.length }}</p>
        <p class="text-xs font-bold text-green-600 mt-0.5">جاهز</p>
      </div>
      <div class="rounded-2xl p-3 text-center border-2 border-purple-200 bg-purple-50">
        <p class="text-3xl font-black text-purple-700">{{ recentServed.length }}</p>
        <p class="text-xs font-bold text-purple-600 mt-0.5">قُدِّم اليوم</p>
      </div>
      <div class="rounded-2xl p-3 text-center border-2 border-gray-200 bg-gray-50">
        <p class="text-3xl font-black text-gray-700">{{ urgentCount }}</p>
        <p class="text-xs font-bold text-red-500 mt-0.5">متأخر +20د</p>
      </div>
    </div>

    <!-- 4-Column Layout -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

      <!-- PENDING -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-xl text-sm font-bold">
            <i class="fas fa-clock"></i>
            انتظار
            <span class="bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-lg">{{ pending.length }}</span>
          </div>
        </div>
        <div class="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
          <div v-for="o in pending" :key="o.id"
            :class="elapsed(o.createdAt) > 10 ? 'border-red-300 shadow-red-100' : 'border-yellow-200'"
            class="bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition group">
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="font-mono font-black text-restaurant text-sm">{{ o.orderNumber }}</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-md font-bold" :class="typeClass(o.orderType)">{{ typeLabel(o.orderType) }}</span>
                  <span v-if="o.waiter" class="text-[10px] text-gray-400"><i class="fas fa-user-tie text-[8px]"></i> {{ o.waiter }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-black px-2 py-1 rounded-lg"
                  :class="elapsed(o.createdAt) > 20 ? 'bg-red-100 text-red-600 animate-pulse' : elapsed(o.createdAt) > 10 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'">
                  {{ timeAgo(o.createdAt) }}
                </span>
              </div>
            </div>
            <!-- Table + Customer -->
            <p class="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <i class="fas fa-chair text-[10px]"></i>
              {{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }}
              <span v-if="o.customerName"> • {{ o.customerName }}</span>
            </p>
            <!-- Items -->
            <div class="space-y-1.5 mb-3">
              <div v-for="item in o.items" :key="item.id"
                class="flex items-center gap-2 py-1 px-2 rounded-xl bg-yellow-50/60 border border-yellow-100">
                <span class="w-6 h-6 bg-yellow-400 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                  {{ item.quantity }}
                </span>
                <span class="text-sm font-medium text-gray-800 flex-1">{{ item.menuItem?.name || 'صنف' }}</span>
                <span v-if="item.notes" class="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">{{ item.notes }}</span>
              </div>
            </div>
            <!-- Notes -->
            <div v-if="o.notes" class="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 mb-3 flex items-start gap-1.5">
              <i class="fas fa-sticky-note mt-0.5 shrink-0"></i>
              {{ o.notes }}
            </div>
            <!-- Action -->
            <button @click="updateStatus(o.id, 'preparing')"
              class="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-blue-200 flex items-center justify-center gap-2">
              <i class="fas fa-fire"></i> بدء التحضير
            </button>
          </div>
          <div v-if="pending.length === 0" class="text-center py-10 text-gray-300">
            <i class="fas fa-check-circle text-4xl mb-2 block"></i>
            <p class="text-xs">لا انتظار</p>
          </div>
        </div>
      </div>

      <!-- PREPARING -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-xl text-sm font-bold">
            <i class="fas fa-fire"></i>
            تحضير
            <span class="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-lg">{{ preparing.length }}</span>
          </div>
        </div>
        <div class="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
          <div v-for="o in preparing" :key="o.id"
            :class="elapsed(o.createdAt) > 20 ? 'border-red-400 shadow-red-100 ring-1 ring-red-300' : elapsed(o.createdAt) > 15 ? 'border-orange-300' : 'border-blue-200'"
            class="bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition">
            <!-- Card Header -->
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="font-mono font-black text-restaurant text-sm">{{ o.orderNumber }}</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-md font-bold" :class="typeClass(o.orderType)">{{ typeLabel(o.orderType) }}</span>
                  <span v-if="o.waiter" class="text-[10px] text-gray-400"><i class="fas fa-user-tie text-[8px]"></i> {{ o.waiter }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-black px-2 py-1 rounded-lg"
                  :class="elapsed(o.createdAt) > 20 ? 'bg-red-100 text-red-600 animate-pulse' : elapsed(o.createdAt) > 15 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
                  {{ timeAgo(o.createdAt) }}
                </span>
                <div v-if="elapsed(o.createdAt) > 20" class="text-[9px] text-red-500 font-bold mt-0.5">⚠ متأخر!</div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <i class="fas fa-chair text-[10px]"></i>
              {{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }}
              <span v-if="o.customerName"> • {{ o.customerName }}</span>
            </p>
            <!-- Items checklist -->
            <div class="space-y-1.5 mb-3">
              <div v-for="item in o.items" :key="item.id"
                @click="toggleItem(o.id, item.id)"
                :class="doneItems[o.id]?.has(item.id) ? 'bg-green-50 border-green-200 opacity-70' : 'bg-blue-50/60 border-blue-100'"
                class="flex items-center gap-2 py-1 px-2 rounded-xl border cursor-pointer select-none transition">
                <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                  :class="doneItems[o.id]?.has(item.id) ? 'bg-green-400 text-white' : 'bg-blue-400 text-white'">
                  <i v-if="doneItems[o.id]?.has(item.id)" class="fas fa-check text-[10px]"></i>
                  <span v-else>{{ item.quantity }}</span>
                </span>
                <span class="text-sm font-medium flex-1"
                  :class="doneItems[o.id]?.has(item.id) ? 'line-through text-gray-400' : 'text-gray-800'">
                  {{ item.menuItem?.name || 'صنف' }}
                </span>
                <span v-if="item.notes" class="text-[10px] text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-md">{{ item.notes }}</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div v-if="o.items?.length > 0" class="mb-3">
              <div class="flex justify-between text-[10px] text-gray-400 mb-1">
                <span>تقدم التحضير</span>
                <span>{{ doneCount(o.id, o.items) }}/{{ o.items.length }}</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-300"
                  :class="doneCount(o.id, o.items) === o.items.length ? 'bg-green-400' : 'bg-blue-400'"
                  :style="{ width: (doneCount(o.id, o.items) / o.items.length * 100) + '%' }"></div>
              </div>
            </div>
            <div v-if="o.notes" class="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 mb-3 flex items-start gap-1.5">
              <i class="fas fa-sticky-note mt-0.5 shrink-0"></i>
              {{ o.notes }}
            </div>
            <button @click="updateStatus(o.id, 'ready')"
              class="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-green-200 flex items-center justify-center gap-2">
              <i class="fas fa-bell"></i> جاهز للتقديم
            </button>
          </div>
          <div v-if="preparing.length === 0" class="text-center py-10 text-gray-300">
            <i class="fas fa-fire text-4xl mb-2 block"></i>
            <p class="text-xs">لا شيء قيد التحضير</p>
          </div>
        </div>
      </div>

      <!-- READY -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-xl text-sm font-bold">
            <i class="fas fa-bell"></i>
            جاهز
            <span class="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-lg">{{ ready.length }}</span>
          </div>
        </div>
        <div class="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
          <div v-for="o in ready" :key="o.id"
            class="bg-white rounded-2xl border-2 border-green-300 p-4 shadow-md ready-glow">
            <div class="flex items-start justify-between mb-2">
              <div>
                <span class="font-mono font-black text-restaurant text-sm">{{ o.orderNumber }}</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[10px] px-1.5 py-0.5 rounded-md font-bold" :class="typeClass(o.orderType)">{{ typeLabel(o.orderType) }}</span>
                  <span v-if="o.waiter" class="text-[10px] text-gray-400"><i class="fas fa-user-tie text-[8px]"></i> {{ o.waiter }}</span>
                </div>
              </div>
              <span class="text-xs font-black px-2 py-1 rounded-lg bg-green-100 text-green-700">{{ timeAgo(o.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-500 mb-3 flex items-center gap-1">
              <i class="fas fa-chair text-[10px]"></i>
              {{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }}
              <span v-if="o.customerName"> • {{ o.customerName }}</span>
            </p>
            <div class="space-y-1.5 mb-3">
              <div v-for="item in o.items" :key="item.id"
                class="flex items-center gap-2 py-1 px-2 rounded-xl bg-green-50/60 border border-green-100">
                <span class="w-6 h-6 bg-green-400 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">{{ item.quantity }}</span>
                <span class="text-sm font-medium text-gray-800 flex-1">{{ item.menuItem?.name || 'صنف' }}</span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="updateStatus(o.id, 'served')"
                class="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-purple-200 flex items-center justify-center gap-2">
                <i class="fas fa-concierge-bell"></i> تم التقديم
              </button>
              <button @click="printTicket(o)"
                class="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition" title="طباعة التذكرة">
                <i class="fas fa-print"></i>
              </button>
            </div>
          </div>
          <div v-if="ready.length === 0" class="text-center py-10 text-gray-300">
            <i class="fas fa-concierge-bell text-4xl mb-2 block"></i>
            <p class="text-xs">لا يوجد جاهز</p>
          </div>
        </div>
      </div>

      <!-- SERVED (Recent) -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-xl text-sm font-bold">
            <i class="fas fa-check-double"></i>
            قُدِّم
            <span class="bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-lg">{{ recentServed.length }}</span>
          </div>
        </div>
        <div class="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">
          <div v-for="o in recentServed" :key="o.id"
            class="bg-gray-50 rounded-2xl border border-gray-200 p-3 opacity-80 hover:opacity-100 transition">
            <div class="flex items-center justify-between mb-1">
              <span class="font-mono text-xs font-bold text-gray-500">{{ o.orderNumber }}</span>
              <span class="text-[10px] text-gray-400">{{ timeAgo(o.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">
              {{ o.table ? 'طاولة ' + o.table.number : '-' }}
              <span v-if="o.customerName"> • {{ o.customerName }}</span>
            </p>
            <div class="flex flex-wrap gap-1">
              <span v-for="item in o.items" :key="item.id"
                class="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-lg text-gray-600">
                {{ item.quantity }}× {{ item.menuItem?.name || 'صنف' }}
              </span>
            </div>
          </div>
          <div v-if="recentServed.length === 0" class="text-center py-10 text-gray-300">
            <i class="fas fa-history text-4xl mb-2 block"></i>
            <p class="text-xs">لا يوجد</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';

const orders = ref<any[]>([]);
const fullscreen = ref(false);
const soundEnabled = ref(false);
const refreshing = ref(false);
const countdown = ref(15);
const currentTime = ref('');
const doneItems = ref<Record<number, Set<number>>>({});

let refreshInterval: any = null;
let countdownInterval: any = null;
let clockInterval: any = null;

const pending = computed(() => [...orders.value.filter(o => o.status === 'pending')].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
const preparing = computed(() => [...orders.value.filter(o => o.status === 'preparing')].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
const ready = computed(() => [...orders.value.filter(o => o.status === 'ready')].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
const recentServed = computed(() => [...orders.value.filter(o => o.status === 'served')].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8));
const urgentCount = computed(() => [...pending.value, ...preparing.value].filter(o => elapsed(o.createdAt) > 20).length);

async function load() {
  refreshing.value = true;
  const prevPendingCount = pending.value.length;
  orders.value = (await api.get('/restaurant/kitchen')).data;
  // Sound alert for new pending orders
  if (soundEnabled.value && pending.value.length > prevPendingCount) {
    playBeep();
  }
  countdown.value = 15;
  refreshing.value = false;
}

async function updateStatus(id: number, status: string) {
  await api.patch(`/restaurant/orders/${id}`, { status });
  // Clear done items for this order
  if (doneItems.value[id]) delete doneItems.value[id];
  await load();
}

function toggleItem(orderId: number, itemId: number) {
  if (!doneItems.value[orderId]) {
    doneItems.value[orderId] = new Set();
  }
  const set = doneItems.value[orderId];
  if (set.has(itemId)) set.delete(itemId);
  else set.add(itemId);
  // Trigger reactivity
  doneItems.value = { ...doneItems.value };
}

function doneCount(orderId: number, items: any[]) {
  return doneItems.value[orderId]?.size ?? 0;
}

function elapsed(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 60000);
}
function timeAgo(d: string) {
  const mins = elapsed(d);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins} د`;
  return `${Math.floor(mins / 60)} س ${mins % 60} د`;
}

function typeClass(t: string) {
  return ({ 'dine-in': 'bg-blue-100 text-blue-700', takeaway: 'bg-orange-100 text-orange-700', delivery: 'bg-green-100 text-green-700', direct: 'bg-teal-100 text-teal-700' } as Record<string, string>)[t] ?? 'bg-gray-100 text-gray-500';
}
function typeLabel(t: string) {
  return ({ 'dine-in': 'محلي', takeaway: 'سفري', delivery: 'توصيل', direct: 'مباشر' } as Record<string, string>)[t] ?? t;
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) { /* ignore */ }
}

function printTicket(o: any) {
  const win = window.open('', '_blank', 'width=400,height=500');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"/>
  <style>body{font-family:monospace;font-size:14px;padding:16px}h2{text-align:center;border-bottom:2px dashed #ccc;padding-bottom:8px}
  .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
  .footer{text-align:center;margin-top:12px;font-size:12px;color:#666}</style></head>
  <body><h2>تذكرة مطبخ<br/><span style="font-size:18px;color:#D35400">${o.orderNumber}</span></h2>
  <p style="margin:4px 0;font-size:12px;color:#666">${o.table ? 'طاولة ' + o.table.number : 'بدون طاولة'} ${o.customerName ? ' • ' + o.customerName : ''}</p>
  <p style="margin:4px 0;font-size:12px;color:#666">${new Date(o.createdAt).toLocaleTimeString('ar')}</p>
  <hr style="margin:8px 0"/>
  ${o.items.map((i: any) => `<div class="row"><span>${i.menuItem?.name || 'صنف'}</span><span style="font-weight:bold">× ${i.quantity}</span></div>`).join('')}
  ${o.notes ? `<p style="margin-top:8px;background:#fff3cd;padding:6px;border-radius:6px;font-size:12px">ملاحظة: ${o.notes}</p>` : ''}
  <div class="footer">طُبع: ${new Date().toLocaleTimeString('ar')}</div>
  <script>window.onload=()=>{window.print()}<\/script></body></html>`);
  win.document.close();
}

function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

onMounted(() => {
  load();
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      countdown.value = 15;
      load();
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(refreshInterval);
  clearInterval(countdownInterval);
  clearInterval(clockInterval);
});
</script>

<style scoped>
.ready-glow {
  box-shadow: 0 0 0 1px #86efac, 0 4px 16px rgba(34,197,94,0.15);
  animation: glow-pulse 2s ease-in-out infinite;
}
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 0 1px #86efac, 0 4px 16px rgba(34,197,94,0.15); }
  50% { box-shadow: 0 0 0 2px #4ade80, 0 4px 24px rgba(34,197,94,0.3); }
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px; }
</style>
