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

// Restaurant info loaded from DB (restaurant-specific settings)
const companyName    = ref('');
const companyPhone   = ref('');
const companyAddress = ref('');
const logoBase64     = ref('');
const currency       = ref('د.ع');
const taxEnabled     = ref(false);
const taxRate        = ref(0);
const receiptFooter  = ref('شكراً لزيارتكم 🙏');
const paperSize      = ref('80mm');

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
const subtotal  = computed(() => cart.value.reduce((sum, ci) => sum + ci.price * ci.quantity, 0));
const taxAmount  = computed(() => taxEnabled.value ? Math.round(subtotal.value * taxRate.value / 100) : 0);
const grandTotal = computed(() => Math.max(0, subtotal.value - (discount.value || 0) + taxAmount.value));

function setOrderType(type: string) {
  orderType.value = type;
  customerName.value = '';
  customerPhone.value = '';
  customerAddress.value = '';
  selectedTable.value = '';
}

async function load() {
  const [cRes, mRes, tRes, sRes] = await Promise.all([
    api.get('/restaurant/categories'),
    api.get('/restaurant/menu'),
    api.get('/restaurant/tables'),
    api.get('/system-settings'),
  ]);
  categories.value = cRes.data;
  menuItems.value = mRes.data;
  tables.value = tRes.data;
  const s = sRes.data;
  companyName.value    = s.restaurantName    || s.companyName    || '';
  companyPhone.value   = s.restaurantPhone   || s.companyPhone   || '';
  companyAddress.value = s.restaurantAddress || s.companyAddress || '';
  logoBase64.value     = s.restaurantLogoBase64 || s.logoBase64  || '';
  currency.value       = s.receiptCurrency   || s.currency       || 'د.ع';
  taxEnabled.value     = s.taxEnabled   ?? false;
  taxRate.value        = Number(s.taxRate) || 0;
  receiptFooter.value  = s.receiptFooter || 'شكراً لزيارتكم 🙏';
  paperSize.value      = s.receiptPaperSize || '80mm';
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
  const now        = new Date();
  const dateStr    = now.toLocaleDateString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timeStr    = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  const orderNum   = 'ORD-' + Date.now().toString().slice(-6);
  const cur        = currency.value || 'د.ع';

  const typeLabels: Record<string,string> = { direct:'بيع مباشر', takeaway:'سفري', delivery:'توصيل', 'dine-in':'صالة' };
  const typeIcons:  Record<string,string> = { direct:'⚡', takeaway:'🛍', delivery:'🏍', 'dine-in':'🪑' };
  const pmLabels:   Record<string,string> = { cash:'نقداً', card:'بطاقة', credit:'آجل' };
  const pmIcons:    Record<string,string> = { cash:'💵', card:'💳', credit:'📋' };

  const typeName = typeLabels[orderType.value] ?? orderType.value;
  const typeIcon = typeIcons[orderType.value]  ?? '';
  const pmName   = pmLabels[paymentMethod.value] ?? paymentMethod.value;
  const pmIcon   = pmIcons[paymentMethod.value]  ?? '';

  /* ── separator line ── */
  const sep = `<div class="sep"></div>`;
  const dashedSep = `<div class="sep-dash"></div>`;

  /* ── logo ── */
  const logoHtml = logoBase64.value
    ? `<img src="${logoBase64.value}" class="logo" alt="logo" />`
    : '';

  /* ── order info block ── */
  let orderInfoRows = '';
  if (orderType.value === 'dine-in' && selectedTable.value) {
    const tbl = tables.value.find(t => t.id === selectedTable.value);
    orderInfoRows += `<tr><td class="lbl">الطاولة</td><td class="val">🪑 طاولة ${tbl?.number ?? selectedTable.value}</td></tr>`;
  }
  if (orderType.value !== 'direct') {
    if (customerName.value)    orderInfoRows += `<tr><td class="lbl">العميل</td><td class="val">${customerName.value}</td></tr>`;
    if (customerPhone.value)   orderInfoRows += `<tr><td class="lbl">الهاتف</td><td class="val" dir="ltr">${customerPhone.value}</td></tr>`;
    if (customerAddress.value) orderInfoRows += `<tr><td class="lbl">العنوان</td><td class="val">${customerAddress.value}</td></tr>`;
  }

  /* ── items rows ── */
  const itemsRows = cart.value.map((ci, i) => `
    <tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
      <td class="item-name">${ci.name}</td>
      <td class="item-qty">${ci.quantity}</td>
      <td class="item-price">${ci.price.toFixed(0)}</td>
      <td class="item-total">${(ci.price * ci.quantity).toFixed(0)}</td>
    </tr>`).join('');

  /* ── totals ── */
  const subtotalRow = discount.value > 0 || taxEnabled.value
    ? `<tr><td colspan="2" class="tot-lbl">المجموع الفرعي</td><td colspan="2" class="tot-val">${subtotal.value.toFixed(0)} ${cur}</td></tr>`
    : '';
  const discountRow = discount.value > 0
    ? `<tr class="discount-row"><td colspan="2" class="tot-lbl">الخصم</td><td colspan="2" class="tot-val">− ${Number(discount.value).toFixed(0)} ${cur}</td></tr>`
    : '';
  const taxRow = taxEnabled.value
    ? `<tr><td colspan="2" class="tot-lbl">ضريبة ${taxRate.value}%</td><td colspan="2" class="tot-val">${taxAmount.value.toFixed(0)} ${cur}</td></tr>`
    : '';

  /* ── cash change ── */
  const changeHtml = (paymentMethod.value === 'cash' && cashReceived.value >= grandTotal.value)
    ? `${dashedSep}
       <table class="tot-table">
         <tr><td colspan="2" class="tot-lbl">المبلغ المستلم</td><td colspan="2" class="tot-val">${Number(cashReceived.value).toFixed(0)} ${cur}</td></tr>
         <tr class="change-row"><td colspan="2" class="tot-lbl">الباقي</td><td colspan="2" class="tot-val">${(cashReceived.value - grandTotal.value).toFixed(0)} ${cur}</td></tr>
       </table>`
    : '';

  const win = window.open('', '_blank', 'width=340,height=700,menubar=no,toolbar=no,location=no,status=no');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>فاتورة - ${companyName.value || 'مطعم'}</title>
  <style>
    /* ═══════════════════════════════════════
       THERMAL PAPER RECEIPT — 58mm / 80mm
       Page width: 58mm uses ~48mm printable
                   80mm uses ~72mm printable
       Font sizes kept ≤ 11pt for readability
       ═══════════════════════════════════════ */
    @page {
      size: ${paperSize.value} auto;
      margin: 3mm 4mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 10pt;
      color: #000;
      background: #fff;
      width: ${paperSize.value === '58mm' ? '48mm' : '72mm'};
      direction: rtl;
    }

    /* ── Header ── */
    .header        { text-align: center; padding: 4px 0 2px; }
    .logo          { max-width: 50mm; max-height: 22mm; object-fit: contain; display: block; margin: 0 auto 4px; }
    .shop-name     { font-size: 13pt; font-weight: 900; letter-spacing: 0.5px; margin-bottom: 2px; }
    .shop-sub      { font-size: 8pt; color: #444; line-height: 1.5; }

    /* ── Separators ── */
    .sep      { border-top: 2px solid #000; margin: 5px 0; }
    .sep-dash { border-top: 1px dashed #555; margin: 4px 0; }

    /* ── Receipt title bar ── */
    .receipt-title {
      text-align: center;
      font-size: 11pt;
      font-weight: bold;
      padding: 3px 0;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      margin: 4px 0;
      letter-spacing: 1px;
    }

    /* ── Meta info ── */
    .meta-table    { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 2px; }
    .meta-table td { padding: 1px 2px; vertical-align: top; }
    .lbl           { color: #444; width: 28%; white-space: nowrap; }
    .val           { font-weight: bold; }

    /* ── Order type badge ── */
    .type-badge {
      display: inline-block;
      border: 1px solid #000;
      border-radius: 3px;
      padding: 1px 6px;
      font-size: 9pt;
      font-weight: bold;
      margin: 3px auto;
    }

    /* ── Items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9pt;
      margin: 2px 0;
    }
    .items-table thead tr {
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
    }
    .items-table th {
      padding: 2px 2px;
      text-align: right;
      font-size: 8.5pt;
      font-weight: bold;
    }
    .items-table td { padding: 2px 2px; }
    .row-even      { background: #f7f7f7; }
    .row-odd       { background: #fff; }
    .item-name     { text-align: right; max-width: 34mm; word-break: break-word; }
    .item-qty      { text-align: center; width: 8mm; }
    .item-price    { text-align: left;   width: 12mm; direction: ltr; }
    .item-total    { text-align: left;   width: 14mm; direction: ltr; font-weight: bold; }

    /* ── Totals table ── */
    .tot-table     { width: 100%; border-collapse: collapse; font-size: 9.5pt; }
    .tot-table td  { padding: 2px 2px; }
    .tot-lbl       { color: #333; }
    .tot-val       { text-align: left; font-weight: bold; direction: ltr; }
    .discount-row  { color: #c0392b; }

    /* ── Grand total ── */
    .grand-row td {
      font-size: 12pt;
      font-weight: 900;
      padding: 3px 2px;
    }
    .grand-label   { font-size: 11pt; }
    .grand-amount  { text-align: left; direction: ltr; }

    /* ── Cash change ── */
    .change-row td { color: #27ae60; font-weight: bold; }

    /* ── Payment ── */
    .payment-line {
      text-align: center;
      font-size: 8.5pt;
      padding: 2px 0;
      border: 1px dashed #999;
      border-radius: 3px;
      margin: 3px 0;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      font-size: 8pt;
      color: #555;
      padding: 6px 0 2px;
      line-height: 1.6;
    }
    .footer .thanks {
      font-size: 10pt;
      font-weight: bold;
      color: #000;
    }
    .barcode-placeholder {
      text-align: center;
      letter-spacing: 3px;
      font-size: 7pt;
      color: #999;
      margin-top: 4px;
    }

    /* ── Print trigger ── */
    @media print {
      body { width: ${paperSize.value === '58mm' ? '48mm' : '72mm'}; }
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══ -->
  <div class="header">
    ${logoHtml}
    <div class="shop-name">${companyName.value || 'المطعم'}</div>
    <div class="shop-sub">
      ${companyAddress.value ? companyAddress.value + '<br>' : ''}
      ${companyPhone.value   ? '📞 ' + companyPhone.value   : ''}
    </div>
  </div>

  <!-- ══ RECEIPT TITLE ══ -->
  <div class="receipt-title">★ فاتورة ★</div>

  <!-- ══ META INFO ══ -->
  <table class="meta-table">
    <tr>
      <td class="lbl">التاريخ</td>
      <td class="val">${dateStr}</td>
      <td class="lbl" style="text-align:center">الوقت</td>
      <td class="val" dir="ltr">${timeStr}</td>
    </tr>
    <tr>
      <td class="lbl">رقم الطلب</td>
      <td class="val" colspan="3" dir="ltr">${orderNum}</td>
    </tr>
  </table>

  ${dashedSep}

  <!-- ══ ORDER TYPE ══ -->
  <div style="text-align:center; margin: 3px 0;">
    <span class="type-badge">${typeIcon} ${typeName}</span>
    &nbsp;
    <span class="payment-line" style="display:inline-block;padding:1px 8px;">${pmIcon} ${pmName}</span>
  </div>

  <!-- ══ ORDER DETAILS (customer/table) ══ -->
  ${orderInfoRows ? `${dashedSep}<table class="meta-table">${orderInfoRows}</table>` : ''}

  ${sep}

  <!-- ══ ITEMS TABLE ══ -->
  <table class="items-table">
    <thead>
      <tr>
        <th class="item-name">الصنف</th>
        <th class="item-qty">كمية</th>
        <th class="item-price">سعر</th>
        <th class="item-total">إجمالي</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  ${sep}

  <!-- ══ TOTALS ══ -->
  <table class="tot-table">
    ${subtotalRow}
    ${discountRow}
    ${taxRow}
    <tr style="border-top:1px solid #000;">
      <td colspan="2" class="tot-lbl grand-label">▶ الإجمالي الكلي</td>
      <td colspan="2" class="tot-val grand-amount">${grandTotal.value.toFixed(0)} ${cur}</td>
    </tr>
  </table>

  <!-- ══ CASH CHANGE ══ -->
  ${changeHtml}

  ${sep}

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="thanks">${receiptFooter.value}</div>
    <div>نتمنى لكم تجربة طعام رائعة</div>
    <div style="margin-top:4px; font-size:7.5pt; color:#aaa;">
      ${new Date().getFullYear()} © ${companyName.value || 'نظام إدارة المطاعم'}
    </div>
    <div class="barcode-placeholder">|||||||||||||||||||||||||||||||</div>
  </div>

  <script>
    window.onload = function () {
      window.print();
      setTimeout(function () { window.close(); }, 1200);
    };
  <\/script>
</body>
</html>`);
  win.document.close();
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
