<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary flex items-center gap-2"><i class="fas fa-fire text-restaurant"></i> شاشة المطبخ</h2>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400"><i class="fas fa-sync-alt animate-spin"></i> تحديث تلقائي كل 15 ثانية</span>
        <button @click="load" class="bg-restaurant hover:opacity-90 text-white px-4 py-2 rounded-xl text-sm font-medium"><i class="fas fa-sync-alt"></i> تحديث</button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-yellow-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-yellow-700">{{ pending.length }}</p><p class="text-xs text-yellow-600">قيد الانتظار</p></div>
      <div class="bg-blue-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-blue-700">{{ preparing.length }}</p><p class="text-xs text-blue-600">قيد التحضير</p></div>
      <div class="bg-green-50 rounded-xl p-3 text-center"><p class="text-2xl font-bold text-green-700">{{ ready.length }}</p><p class="text-xs text-green-600">جاهز للتقديم</p></div>
    </div>

    <!-- Three Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Pending Column -->
      <div>
        <h3 class="text-sm font-bold text-yellow-700 bg-yellow-50 rounded-xl px-4 py-2 mb-3 flex items-center gap-2"><i class="fas fa-clock"></i> قيد الانتظار ({{ pending.length }})</h3>
        <div class="space-y-3">
          <div v-for="o in pending" :key="o.id" class="bg-white rounded-xl border-2 border-yellow-200 p-4 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono font-bold text-restaurant text-sm">{{ o.orderNumber }}</span>
              <span class="text-xs text-gray-400">{{ timeAgo(o.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">{{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }} • {{ o.customerName || '-' }}</p>
            <div class="space-y-1 mb-3">
              <div v-for="item in o.items" :key="item.id" class="flex items-center gap-2 text-sm">
                <span class="w-6 h-6 bg-yellow-50 text-yellow-700 rounded-full flex items-center justify-center text-xs font-bold">{{ item.quantity }}</span>
                <span>{{ item.menuItem?.name || 'صنف' }}</span>
                <span v-if="item.notes" class="text-xs text-gray-400">({{ item.notes }})</span>
              </div>
            </div>
            <button @click="updateStatus(o.id, 'preparing')" class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-fire ml-1"></i> بدء التحضير</button>
          </div>
          <div v-if="pending.length === 0" class="text-center text-gray-300 py-8"><i class="fas fa-check-circle text-2xl mb-2"></i><p class="text-xs">لا توجد طلبات منتظرة</p></div>
        </div>
      </div>

      <!-- Preparing Column -->
      <div>
        <h3 class="text-sm font-bold text-blue-700 bg-blue-50 rounded-xl px-4 py-2 mb-3 flex items-center gap-2"><i class="fas fa-fire"></i> قيد التحضير ({{ preparing.length }})</h3>
        <div class="space-y-3">
          <div v-for="o in preparing" :key="o.id" class="bg-white rounded-xl border-2 border-blue-200 p-4 shadow-sm">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono font-bold text-restaurant text-sm">{{ o.orderNumber }}</span>
              <span class="text-xs font-bold" :class="elapsed(o.createdAt) > 15 ? 'text-red-500' : 'text-gray-400'">{{ timeAgo(o.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">{{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }} • {{ o.customerName || '-' }}</p>
            <div class="space-y-1 mb-3">
              <div v-for="item in o.items" :key="item.id" class="flex items-center gap-2 text-sm">
                <span class="w-6 h-6 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">{{ item.quantity }}</span>
                <span>{{ item.menuItem?.name || 'صنف' }}</span>
              </div>
            </div>
            <button @click="updateStatus(o.id, 'ready')" class="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-check ml-1"></i> جاهز</button>
          </div>
          <div v-if="preparing.length === 0" class="text-center text-gray-300 py-8"><i class="fas fa-fire text-2xl mb-2"></i><p class="text-xs">لا يوجد طلبات قيد التحضير</p></div>
        </div>
      </div>

      <!-- Ready Column -->
      <div>
        <h3 class="text-sm font-bold text-green-700 bg-green-50 rounded-xl px-4 py-2 mb-3 flex items-center gap-2"><i class="fas fa-check-circle"></i> جاهز للتقديم ({{ ready.length }})</h3>
        <div class="space-y-3">
          <div v-for="o in ready" :key="o.id" class="bg-white rounded-xl border-2 border-green-200 p-4 shadow-sm animate-pulse-slow">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono font-bold text-restaurant text-sm">{{ o.orderNumber }}</span>
              <span class="text-xs text-gray-400">{{ timeAgo(o.createdAt) }}</span>
            </div>
            <p class="text-xs text-gray-400 mb-2">{{ o.table ? 'طاولة ' + o.table.number : 'بدون طاولة' }} • {{ o.customerName || '-' }}</p>
            <div class="space-y-1 mb-3">
              <div v-for="item in o.items" :key="item.id" class="flex items-center gap-2 text-sm">
                <span class="w-6 h-6 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-xs font-bold">{{ item.quantity }}</span>
                <span>{{ item.menuItem?.name || 'صنف' }}</span>
              </div>
            </div>
            <button @click="updateStatus(o.id, 'served')" class="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition"><i class="fas fa-concierge-bell ml-1"></i> تم التقديم</button>
          </div>
          <div v-if="ready.length === 0" class="text-center text-gray-300 py-8"><i class="fas fa-bell text-2xl mb-2"></i><p class="text-xs">لا توجد طلبات جاهزة</p></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';

const orders = ref<any[]>([]);
let interval: any = null;

const pending = computed(() => orders.value.filter(o => o.status === 'pending'));
const preparing = computed(() => orders.value.filter(o => o.status === 'preparing'));
const ready = computed(() => orders.value.filter(o => o.status === 'ready'));

async function load() {
  orders.value = (await api.get('/restaurant/kitchen')).data;
}

async function updateStatus(id: number, status: string) {
  await api.patch(`/restaurant/orders/${id}`, { status });
  await load();
}

function elapsed(d: string) { return Math.floor((Date.now() - new Date(d).getTime()) / 60000); }
function timeAgo(d: string) {
  const mins = elapsed(d);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `${mins} د`;
  return `${Math.floor(mins / 60)} س ${mins % 60} د`;
}

onMounted(() => { load(); interval = setInterval(load, 15000); });
onUnmounted(() => { if (interval) clearInterval(interval); });
</script>

<style scoped>
@keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.85; } }
.animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
</style>
