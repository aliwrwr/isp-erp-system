<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-secondary flex items-center gap-2"><i class="fas fa-cash-register text-restaurant"></i> نقطة البيع</h2>
      <div class="flex gap-2">
        <button @click="orderType = 'dine-in'" :class="orderType === 'dine-in' ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border'" class="px-3 py-1.5 rounded-lg text-xs font-medium transition">محلي</button>
        <button @click="orderType = 'takeaway'" :class="orderType === 'takeaway' ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border'" class="px-3 py-1.5 rounded-lg text-xs font-medium transition">سفري</button>
        <button @click="orderType = 'delivery'" :class="orderType === 'delivery' ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border'" class="px-3 py-1.5 rounded-lg text-xs font-medium transition">توصيل</button>
      </div>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
      <!-- Menu Items (Left 2/3) -->
      <div class="lg:col-span-2 flex flex-col">
        <!-- Category Tabs -->
        <div class="flex gap-2 mb-3 overflow-x-auto pb-1">
          <button @click="activeCat = null" :class="!activeCat ? 'bg-restaurant text-white shadow' : 'bg-white text-gray-600 border border-gray-200'" class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]">
            <i class="fas fa-layer-group text-base"></i>
            <span>الكل</span>
          </button>
          <button v-for="c in categories" :key="c.id" @click="activeCat = c.id" :class="activeCat === c.id ? 'bg-restaurant text-white shadow' : 'bg-white text-gray-600 border border-gray-200'" class="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition min-w-[64px]">
            <img v-if="c.image" :src="c.image" class="w-7 h-7 rounded-lg object-cover" />
            <i v-else :class="c.icon || 'fas fa-folder'" class="text-base"></i>
            <span>{{ c.name }}</span>
          </button>
        </div>
        <!-- Items Grid -->
        <div class="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 content-start">
          <button v-for="item in filteredMenu" :key="item.id" @click="addToCart(item)" class="bg-white rounded-xl border border-gray-100 overflow-hidden text-center hover:shadow-md hover:border-restaurant/30 transition active:scale-95" :class="{ 'opacity-40 pointer-events-none': !item.available }">
            <div class="w-full h-24 bg-gradient-to-br from-restaurant/10 to-restaurant/5 flex items-center justify-center overflow-hidden">
              <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
              <i v-else class="fas fa-utensils text-2xl text-restaurant/30"></i>
            </div>
            <div class="p-2">
              <p class="text-xs font-bold text-secondary truncate">{{ item.name }}</p>
              <p class="text-xs font-bold text-restaurant">{{  Number(item.price).toFixed(2)  }} د.ع</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Cart (Right 1/3) -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
        <div class="p-3 border-b border-gray-100">
          <div class="grid grid-cols-2 gap-2 mb-2">
            <input v-model="customerName" placeholder="اسم العميل" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
            <select v-if="orderType === 'dine-in'" v-model.number="selectedTable" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
              <option value="">اختر طاولة</option>
              <option v-for="t in availableTables" :key="t.id" :value="t.id">طاولة {{ t.number }}</option>
            </select>
            <input v-else v-model="waiter" placeholder="النادل / السائق" class="px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div v-for="(ci, idx) in cart" :key="idx" class="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-secondary truncate">{{ ci.name }}</p>
              <p class="text-xs text-gray-400">{{  ci.price.toFixed(2)  }} د.ع</p>
            </div>
            <div class="flex items-center gap-1">
              <button @click="ci.quantity > 1 ? ci.quantity-- : cart.splice(idx, 1)" class="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 flex items-center justify-center text-xs">-</button>
              <span class="w-6 text-center text-xs font-bold">{{ ci.quantity }}</span>
              <button @click="ci.quantity++" class="w-6 h-6 rounded bg-restaurant/10 hover:bg-restaurant/20 text-restaurant flex items-center justify-center text-xs">+</button>
            </div>
            <span class="text-xs font-bold w-14 text-left">{{  (ci.price * ci.quantity).toFixed(2)  }} د.ع</span>
          </div>
          <div v-if="cart.length === 0" class="text-center text-gray-300 py-8"><i class="fas fa-shopping-cart text-2xl mb-2"></i><p class="text-xs">السلة فارغة</p></div>
        </div>

        <!-- Total & Actions -->
        <div class="p-3 border-t border-gray-100 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">المجموع الفرعي</span>
            <span class="font-bold">{{  subtotal.toFixed(2)  }} د.ع</span>
          </div>
          <div class="flex justify-between text-lg font-bold">
            <span class="text-secondary">الإجمالي</span>
            <span class="text-restaurant">{{  subtotal.toFixed(2)  }} د.ع</span>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <button @click="clearCart" class="py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">مسح</button>
            <button @click="submitOrder" :disabled="cart.length === 0" class="py-2.5 bg-restaurant text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50"><i class="fas fa-check ml-1"></i> إرسال</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const categories = ref<any[]>([]);
const menuItems = ref<any[]>([]);
const tables = ref<any[]>([]);
const activeCat = ref<number | null>(null);
const orderType = ref('dine-in');
const customerName = ref('');
const waiter = ref('');
const selectedTable = ref<number | ''>('');
const cart = ref<{ id: number; name: string; price: number; quantity: number }[]>([]);

const filteredMenu = computed(() => {
  const available = menuItems.value.filter(i => i.available);
  return activeCat.value ? available.filter(i => i.category?.id === activeCat.value) : available;
});
const availableTables = computed(() => tables.value.filter(t => t.status === 'available'));
const subtotal = computed(() => cart.value.reduce((sum, ci) => sum + ci.price * ci.quantity, 0));

async function load() {
  const [cRes, mRes, tRes] = await Promise.all([api.get('/restaurant/categories'), api.get('/restaurant/menu'), api.get('/restaurant/tables')]);
  categories.value = cRes.data;
  menuItems.value = mRes.data;
  tables.value = tRes.data;
}

function addToCart(item: any) {
  const existing = cart.value.find(ci => ci.id === item.id);
  if (existing) existing.quantity++;
  else cart.value.push({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 });
}

function clearCart() { cart.value = []; customerName.value = ''; waiter.value = ''; selectedTable.value = ''; }

async function submitOrder() {
  if (cart.value.length === 0) return;
  const body: any = {
    orderType: orderType.value,
    customerName: customerName.value,
    waiter: waiter.value,
    items: cart.value.map(ci => ({ menuItemId: ci.id, quantity: ci.quantity })),
  };
  if (selectedTable.value) body.tableId = selectedTable.value;
  await api.post('/restaurant/orders', body);
  clearCart();
  alert('تم إنشاء الطلب بنجاح');
  await load();
}

onMounted(load);
</script>
