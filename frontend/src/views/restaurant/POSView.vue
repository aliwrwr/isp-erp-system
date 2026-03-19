<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-bold text-secondary flex items-center gap-2">
        <i class="fas fa-cash-register text-restaurant"></i> نقطة البيع
      </h2>
      <div class="text-xs text-gray-400">{{ currentDate }}</div>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
      <!-- Menu Items (Left 2/3) - unchanged -->
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
              <p class="text-xs font-bold text-restaurant">{{ Number(item.price).toFixed(2) }} د.ع</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Cart Panel (Right 1/3) -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">

        <!-- Order Type Tabs -->
        <div class="p-2 border-b border-gray-100 bg-gray-50">
          <div class="grid grid-cols-4 gap-1 bg-gray-200/60 p-1 rounded-xl">
            <button v-for="type in orderTypes" :key="type.value"
              @click="setOrderType(type.value)"
              :class="orderType === type.value ? 'bg-white shadow-sm text-restaurant' : 'text-gray-500 hover:text-gray-700'"
              class="flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs font-medium transition-all">
              <i :class="type.icon" class="text-sm"></i>
              <span class="text-[10px] leading-tight">{{ type.label }}</span>
            </button>
          </div>
        </div>

        <!-- Order Info Fields (conditional) -->
        <div v-if="orderType !== 'direct'" class="px-3 pt-2 space-y-1.5">
          <!-- Dine-in: table picker -->
          <div v-if="orderType === 'dine-in'">
            <select v-model.number="selectedTable" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none">
              <option value="">🪑 اختر الطاولة...</option>
              <option v-for="t in availableTables" :key="t.id" :value="t.id">طاولة {{ t.number }}{{ t.capacity ? ` — ${t.capacity} أشخاص` : '' }}</option>
            </select>
          </div>
          <!-- Takeaway / Delivery: name + phone (+ address) -->
          <template v-else>
            <input v-model="customerName" placeholder="👤 اسم العميل" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none" />
            <input v-model="customerPhone" type="tel" placeholder="📞 رقم الهاتف" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none" />
            <input v-if="orderType === 'delivery'" v-model="customerAddress" placeholder="📍 العنوان / الموقع" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none" />
          </template>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0 mt-2">
          <div v-if="cart.length === 0" class="flex flex-col items-center justify-center h-full text-gray-300 py-10">
            <i class="fas fa-shopping-basket text-3xl mb-2"></i>
            <p class="text-xs">أضف أصنافاً لبدء الطلب</p>
          </div>
          <div v-for="(ci, idx) in cart" :key="idx"
            class="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl p-2 transition">
            <div class="flex-1 min-w-0">
              <p class="text-xs font-bold text-secondary truncate">{{ ci.name }}</p>
              <p class="text-[10px] text-gray-400">{{ ci.price.toFixed(2) }} × {{ ci.quantity }}</p>
            </div>
            <div class="flex items-center gap-0.5">
              <button @click="ci.quantity > 1 ? ci.quantity-- : cart.splice(idx, 1)"
                class="w-6 h-6 rounded-lg bg-gray-200 hover:bg-red-100 hover:text-red-500 text-gray-600 flex items-center justify-center text-xs font-bold transition">
                {{ ci.quantity > 1 ? '−' : '×' }}
              </button>
              <span class="w-6 text-center text-xs font-black text-secondary">{{ ci.quantity }}</span>
              <button @click="ci.quantity++"
                class="w-6 h-6 rounded-lg bg-restaurant/10 hover:bg-restaurant/25 text-restaurant flex items-center justify-center text-xs font-bold transition">+</button>
            </div>
            <span class="text-xs font-black text-restaurant w-16 text-left">{{ (ci.price * ci.quantity).toFixed(2) }}</span>
          </div>
        </div>

        <!-- Totals + Payment + Actions -->
        <div class="border-t border-gray-100 p-3 space-y-2 bg-gray-50/50">
          <!-- Subtotal -->
          <div class="flex justify-between text-xs text-gray-500">
            <span>المجموع الفرعي</span>
            <span class="font-medium">{{ subtotal.toFixed(2) }} د.ع</span>
          </div>

          <!-- Discount -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 whitespace-nowrap">خصم</span>
            <input v-model.number="discount" type="number" min="0" :max="subtotal" placeholder="0"
              class="flex-1 w-0 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white focus:ring-2 focus:ring-restaurant/30 focus:border-restaurant outline-none" />
            <span class="text-xs text-gray-400">د.ع</span>
          </div>

          <!-- Grand Total -->
          <div class="flex justify-between items-center bg-restaurant/5 border border-restaurant/10 rounded-xl px-3 py-2">
            <span class="text-sm font-bold text-secondary">الإجمالي</span>
            <span class="text-xl font-black text-restaurant">{{ grandTotal.toFixed(2) }} <span class="text-xs font-medium">د.ع</span></span>
          </div>

          <!-- Payment Methods -->
          <div class="grid grid-cols-3 gap-1">
            <button v-for="pm in paymentMethods" :key="pm.value"
              @click="paymentMethod = pm.value"
              :class="paymentMethod === pm.value ? 'ring-2 ring-restaurant bg-restaurant text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-restaurant/40'"
              class="py-1.5 rounded-lg text-xs font-medium transition text-center">
              <i :class="pm.icon" class="block mb-0.5 text-sm"></i>
              {{ pm.label }}
            </button>
          </div>

          <!-- Cash calculator -->
          <div v-if="paymentMethod === 'cash'" class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <i class="fas fa-coins text-yellow-500 text-sm flex-none"></i>
            <input v-model.number="cashReceived" type="number" min="0" placeholder="المبلغ المستلم"
              class="flex-1 w-0 text-xs border-none outline-none bg-transparent" />
            <span class="text-xs font-bold whitespace-nowrap" :class="cashReceived >= grandTotal ? 'text-green-600' : 'text-gray-400'">
              الباقي: {{ cashReceived >= grandTotal ? (cashReceived - grandTotal).toFixed(2) : '—' }} د.ع
            </span>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2 pt-1">
            <button @click="clearCart"
              class="w-10 h-10 flex-none flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-xl transition" title="مسح الطلب">
              <i class="fas fa-trash text-sm"></i>
            </button>
            <button @click="printReceipt" :disabled="cart.length === 0"
              class="flex-1 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1">
              <i class="fas fa-print"></i> طباعة
            </button>
            <button @click="submitOrder" :disabled="cart.length === 0 || submitting"
              class="flex-1 py-2.5 bg-restaurant hover:opacity-90 text-white rounded-xl text-xs font-bold transition disabled:opacity-40 flex items-center justify-center gap-1">
              <i :class="submitting ? 'fas fa-spinner fa-spin' : 'fas fa-check-circle'"></i>
              {{ submitting ? '...' : 'إتمام' }}
            </button>
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
const orderType = ref('direct');
const customerName = ref('');
const customerPhone = ref('');
const customerAddress = ref('');
const selectedTable = ref<number | ''>('');
const cart = ref<{ id: number; name: string; price: number; quantity: number }[]>([]);
const discount = ref(0);
const paymentMethod = ref('cash');
const cashReceived = ref(0);
const submitting = ref(false);

const orderTypes = [
  { value: 'direct',   label: 'مباشر',  icon: 'fas fa-bolt' },
  { value: 'takeaway', label: 'سفري',   icon: 'fas fa-shopping-bag' },
  { value: 'delivery', label: 'توصيل',  icon: 'fas fa-motorcycle' },
  { value: 'dine-in',  label: 'صالة',   icon: 'fas fa-chair' },
];

const paymentMethods = [
  { value: 'cash',   label: 'نقداً',  icon: 'fas fa-money-bill-wave' },
  { value: 'card',   label: 'بطاقة',  icon: 'fas fa-credit-card' },
  { value: 'credit', label: 'آجل',    icon: 'fas fa-file-invoice-dollar' },
];

const currentDate = computed(() =>
  new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
);
const filteredMenu = computed(() => {
  const available = menuItems.value.filter(i => i.available);
  return activeCat.value ? available.filter(i => i.category?.id === activeCat.value) : available;
});
const availableTables = computed(() => tables.value.filter(t => t.status === 'available'));
const subtotal = computed(() => cart.value.reduce((sum, ci) => sum + ci.price * ci.quantity, 0));
const grandTotal = computed(() => Math.max(0, subtotal.value - (discount.value || 0)));

function setOrderType(type: string) {
  orderType.value = type;
  customerName.value = '';
  customerPhone.value = '';
  customerAddress.value = '';
  selectedTable.value = '';
}

async function load() {
  const [cRes, mRes, tRes] = await Promise.all([
    api.get('/restaurant/categories'),
    api.get('/restaurant/menu'),
    api.get('/restaurant/tables'),
  ]);
  categories.value = cRes.data;
  menuItems.value = mRes.data;
  tables.value = tRes.data;
}

function addToCart(item: any) {
  const existing = cart.value.find(ci => ci.id === item.id);
  if (existing) existing.quantity++;
  else cart.value.push({ id: item.id, name: item.name, price: Number(item.price), quantity: 1 });
}

function clearCart() {
  cart.value = [];
  discount.value = 0;
  cashReceived.value = 0;
  customerName.value = '';
  customerPhone.value = '';
  customerAddress.value = '';
  selectedTable.value = '';
}

function printReceipt() {
  const dateStr = new Date().toLocaleString('ar-IQ');
  const orderTypeName = orderTypes.find(t => t.value === orderType.value)?.label ?? orderType.value;
  const pmName = paymentMethods.find(p => p.value === paymentMethod.value)?.label ?? paymentMethod.value;

  const itemsHtml = cart.value.map(ci => `
    <tr>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;">${ci.name}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:center;">${ci.quantity}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:left;">${ci.price.toFixed(2)}</td>
      <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:left;font-weight:bold;">${(ci.price * ci.quantity).toFixed(2)}</td>
    </tr>`).join('');

  let extraHtml = '';
  if (orderType.value !== 'direct') {
    const rows = [];
    if (customerName.value) rows.push(`<div><b>العميل:</b> ${customerName.value}</div>`);
    if (customerPhone.value) rows.push(`<div><b>الهاتف:</b> ${customerPhone.value}</div>`);
    if (customerAddress.value) rows.push(`<div><b>العنوان:</b> ${customerAddress.value}</div>`);
    if (selectedTable.value) rows.push(`<div><b>الطاولة:</b> ${selectedTable.value}</div>`);
    if (rows.length) extraHtml = `<div style="background:#f9f9f9;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;">${rows.join('')}</div>`;
  }

  const discountRow = discount.value > 0
    ? `<div style="display:flex;justify-content:space-between;color:#e67e22;"><span>خصم</span><span>− ${discount.value.toFixed(2)} د.ع</span></div>`
    : '';

  const win = window.open('', '_blank', 'width=420,height=640');
  win?.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>فاتورة</title>
    <style>
      body{font-family:Arial,sans-serif;direction:rtl;margin:0;padding:20px;font-size:13px;color:#222;}
      h2{text-align:center;margin:0 0 2px;font-size:18px;}
      .meta{text-align:center;color:#888;font-size:11px;margin-bottom:14px;}
      table{width:100%;border-collapse:collapse;}
      th{background:#f5f5f5;padding:5px 8px;text-align:right;font-size:12px;}
      .totals div{display:flex;justify-content:space-between;margin:4px 0;}
      .grand{font-size:16px;font-weight:900;color:#c0392b;padding-top:8px;margin-top:8px;border-top:2px solid #ddd;}
      .footer{text-align:center;color:#aaa;font-size:11px;margin-top:18px;}
    </style></head>
    <body>
    <h2>فاتورة طلب</h2>
    <div class="meta">
      <div>${dateStr}</div>
      <div>نوع الطلب: <b>${orderTypeName}</b> &nbsp;|&nbsp; الدفع: <b>${pmName}</b></div>
    </div>
    ${extraHtml}
    <table>
      <thead><tr><th>الصنف</th><th style="text-align:center">الكمية</th><th style="text-align:left">السعر</th><th style="text-align:left">الإجمالي</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <div class="totals" style="background:#f9f9f9;border-radius:8px;padding:10px 14px;margin-top:14px;">
      ${discount.value > 0 ? `<div><span>المجموع الفرعي</span><span>${subtotal.value.toFixed(2)} د.ع</span></div>` : ''}
      ${discountRow}
      <div class="grand"><span>الإجمالي</span><span>${grandTotal.value.toFixed(2)} د.ع</span></div>
    </div>
    <div class="footer">شكراً لزيارتكم ✦</div>
    <script>window.onload=function(){window.print();setTimeout(()=>window.close(),800);}<\/script>
    </body></html>`);
  win?.document.close();
}

async function submitOrder() {
  if (cart.value.length === 0) return;
  if (orderType.value === 'dine-in' && !selectedTable.value) { alert('الرجاء اختيار الطاولة'); return; }
  if (['takeaway', 'delivery'].includes(orderType.value) && !customerName.value) { alert('الرجاء إدخال اسم العميل'); return; }
  if (['takeaway', 'delivery'].includes(orderType.value) && !customerPhone.value) { alert('الرجاء إدخال رقم الهاتف'); return; }
  if (orderType.value === 'delivery' && !customerAddress.value) { alert('الرجاء إدخال العنوان'); return; }

  submitting.value = true;
  try {
    const body: any = {
      orderType: orderType.value,
      customerName: orderType.value === 'direct' ? 'بيع مباشر' : customerName.value,
      phone: customerPhone.value || undefined,
      address: customerAddress.value || undefined,
      totalAmount: grandTotal.value,
      items: cart.value.map(ci => ({ menuItemId: ci.id, quantity: ci.quantity })),
    };
    if (orderType.value === 'dine-in' && selectedTable.value) body.tableId = selectedTable.value;
    await api.post('/restaurant/orders', body);
    clearCart();
    await load();
  } catch {
    alert('فشل في إرسال الطلب');
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>
