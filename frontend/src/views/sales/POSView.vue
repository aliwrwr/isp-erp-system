<template>
  <div class="flex flex-col lg:flex-row gap-4 h-[calc(100vh-110px)]" dir="rtl">

    <!-- ========== Right Column: Order Panel ========== -->
    <div class="w-full lg:w-[420px] flex flex-col gap-3 overflow-y-auto pb-2 lg:overflow-y-auto">

      <!-- Invoice Header -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-sales/10 flex items-center justify-center">
            <i class="fas fa-cash-register text-sales text-sm"></i>
          </div>
          <div>
            <h3 class="font-bold text-secondary text-sm">فاتورة جديدة</h3>
            <p class="text-[11px] text-gray-400 font-mono">INV-{{ invoicePreviewNum }}</p>
          </div>
        </div>
        <button @click="clearAll" title="مسح الكل"
          class="w-8 h-8 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 flex items-center justify-center transition">
          <i class="fas fa-trash-alt text-sm"></i>
        </button>
      </div>

      <!-- Customer Info Card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button @click="showCustomer = !showCustomer"
          class="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50/70 transition">
          <div class="flex items-center gap-2 text-sm font-semibold text-secondary">
            <i class="fas fa-user-circle text-sales text-base"></i>
            معلومات العميل
            <span v-if="customer.name || customer.phone"
              class="text-[11px] font-normal text-sales bg-sales/10 px-2 py-0.5 rounded-full">
              {{ customer.name || customer.phone }}
            </span>
          </div>
          <i class="fas text-gray-300 text-xs transition-transform"
            :class="showCustomer ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
        </button>
        <div v-show="showCustomer" class="px-4 pb-4 space-y-3 border-t border-gray-50">
          <div class="grid grid-cols-2 gap-3 pt-3">
            <div>
              <label class="text-[11px] font-semibold text-gray-500 mb-1 block">اسم العميل</label>
              <div class="relative">
                <i class="fas fa-user absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                <input v-model="customer.name" placeholder="الاسم الكامل"
                  class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
            <div>
              <label class="text-[11px] font-semibold text-gray-500 mb-1 block">رقم الهاتف</label>
              <div class="relative">
                <i class="fas fa-phone absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
                <input v-model="customer.phone" placeholder="07xxxxxxxxxx" dir="ltr"
                  class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
              </div>
            </div>
          </div>
          <div>
            <label class="text-[11px] font-semibold text-gray-500 mb-1 block">العنوان</label>
            <div class="relative">
              <i class="fas fa-map-marker-alt absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
              <input v-model="customer.address" placeholder="المنطقة / الحي / الشارع"
                class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Items -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style="min-height:160px;max-height:320px">
        <div class="px-4 py-3 border-b border-gray-50 flex items-center justify-between flex-shrink-0">
          <span class="text-sm font-bold text-secondary flex items-center gap-2">
            <i class="fas fa-shopping-cart text-sales"></i>
            السلة
          </span>
          <span v-if="cart.length > 0" class="text-xs bg-sales text-white px-2 py-0.5 rounded-full font-bold">
            {{ cart.reduce((s, i) => s + i.qty, 0) }} قطعة
          </span>
        </div>

        <!-- Empty state -->
        <div v-if="cart.length === 0" class="flex flex-col items-center justify-center text-gray-300 py-8">
          <i class="fas fa-shopping-basket text-4xl mb-2"></i>
          <p class="text-xs text-gray-400">السلة فارغة — اختر منتجاً</p>
        </div>

        <!-- Items list -->
        <div v-else class="overflow-y-auto divide-y divide-gray-50">
          <div v-for="(item, i) in cart" :key="item.id"
            class="px-4 py-2.5 flex items-center gap-3 group hover:bg-gray-50/50 transition">
            <div class="w-7 h-7 rounded-lg bg-sales/10 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-box text-sales text-xs"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-xs font-semibold text-secondary truncate">{{ item.name }}</p>
              <div class="flex items-center gap-1 mt-0.5">
                <input v-model.number="item.price" type="number" min="0"
                  class="w-20 text-[11px] text-gray-400 border-b border-dashed border-gray-200 focus:outline-none focus:border-sales bg-transparent text-center"
                  @focus="($event.target as HTMLInputElement).select()" />
                <span class="text-[10px] text-gray-300">د.ع</span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button @click="item.qty > 1 ? item.qty-- : removeFromCart(i)"
                class="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition">
                <i class="fas fa-minus text-[9px]"></i>
              </button>
              <input v-model.number="item.qty" type="number" min="1"
                class="w-8 text-center text-xs font-bold text-secondary border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sales py-0.5"
                @focus="($event.target as HTMLInputElement).select()" />
              <button @click="item.qty++"
                class="w-6 h-6 rounded-lg border border-sales/30 bg-sales/5 flex items-center justify-center text-sales hover:bg-sales/10 transition">
                <i class="fas fa-plus text-[9px]"></i>
              </button>
            </div>
            <div class="text-left min-w-[52px]">
              <p class="text-xs font-bold text-secondary">{{ (item.price * item.qty).toLocaleString() }}</p>
              <p class="text-[10px] text-gray-300">د.ع</p>
            </div>
            <button @click="removeFromCart(i)"
              class="w-6 h-6 rounded-lg text-gray-200 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Discount + Notes -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-[11px] font-semibold text-gray-500 mb-1 block">الخصم</label>
            <div class="flex items-center gap-1">
              <input v-model.number="discount" type="number" min="0" placeholder="0"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
              <div class="flex rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                <button @click="discountType = 'fixed'"
                  class="px-2 py-2 text-[10px] font-bold transition"
                  :class="discountType === 'fixed' ? 'bg-sales text-white' : 'bg-white text-gray-400 hover:bg-gray-50'">د.ع</button>
                <button @click="discountType = 'percent'"
                  class="px-2 py-2 text-[10px] font-bold transition"
                  :class="discountType === 'percent' ? 'bg-sales text-white' : 'bg-white text-gray-400 hover:bg-gray-50'">%</button>
              </div>
            </div>
          </div>
          <div>
            <label class="text-[11px] font-semibold text-gray-500 mb-1 block">ضريبة (%)</label>
            <input v-model.number="taxPercent" type="number" min="0" max="100" placeholder="0"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
          </div>
        </div>
        <div>
          <label class="text-[11px] font-semibold text-gray-500 mb-1 block">ملاحظات</label>
          <textarea v-model="notes" rows="2" placeholder="ملاحظات للفاتورة..."
            class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition resize-none"></textarea>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
        <p class="text-xs font-bold text-secondary mb-3 flex items-center gap-2">
          <i class="fas fa-credit-card text-sales"></i>طريقة الدفع
        </p>
        <div class="grid grid-cols-3 gap-2">
          <button v-for="m in paymentMethods" :key="m.value" @click="paymentMethod = m.value"
            class="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 transition text-center"
            :class="paymentMethod === m.value
              ? 'border-sales bg-sales/5 text-sales'
              : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'">
            <i :class="['fas', m.icon, 'text-base']"></i>
            <span class="text-[11px] font-semibold">{{ m.label }}</span>
            <span class="text-[9px] opacity-60">{{ m.desc }}</span>
          </button>
        </div>

        <!-- Partial: paid amount -->
        <div v-if="paymentMethod === 'partial'" class="mt-3 pt-3 border-t border-gray-50">
          <label class="text-[11px] font-semibold text-gray-500 mb-1.5 block">المبلغ المدفوع الآن</label>
          <div class="relative">
            <i class="fas fa-coins absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
            <input v-model.number="paidAmount" type="number" min="0" :max="grandTotal" placeholder="0"
              class="w-full pr-10 pl-12 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
          </div>
          <div v-if="paidAmount > 0" class="mt-2 flex items-center justify-between text-xs px-1">
            <span class="text-gray-400">المتبقي:</span>
            <span class="font-bold" :class="remaining > 0 ? 'text-amber-500' : 'text-emerald-500'">
              {{ remaining.toLocaleString() }} د.ع
            </span>
          </div>
        </div>

        <!-- Cash: change calculator -->
        <div v-if="paymentMethod === 'cash'" class="mt-3 pt-3 border-t border-gray-50 space-y-2">
          <label class="text-[11px] font-semibold text-gray-500 block">المبلغ المستلم</label>
          <div class="relative">
            <input v-model.number="receivedAmount" type="number" min="0" placeholder="0"
              class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
          </div>
          <div v-if="receivedAmount > 0" class="flex items-center justify-between text-xs px-1">
            <span class="text-gray-400">الباقي للعميل:</span>
            <span class="font-bold" :class="change >= 0 ? 'text-emerald-500' : 'text-red-500'">
              {{ change.toLocaleString() }} د.ع
            </span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="q in quickAmounts" :key="q" @click="receivedAmount = q"
              class="px-2.5 py-1 bg-gray-100 hover:bg-sales/10 hover:text-sales text-gray-500 text-[10px] font-semibold rounded-lg transition">
              {{ q.toLocaleString() }}
            </button>
          </div>
        </div>

        <!-- Deferred note -->
        <div v-if="paymentMethod === 'deferred'" class="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-100">
          <i class="fas fa-clock text-amber-400 text-xs"></i>
          <span class="text-[11px] text-amber-600 font-medium">ستُسجَّل كدين على العميل</span>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 space-y-2">
        <div class="flex justify-between text-xs text-gray-400">
          <span>المجموع الفرعي</span>
          <span class="font-medium text-gray-600">{{ subtotal.toLocaleString() }} د.ع</span>
        </div>
        <div v-if="discountAmount > 0" class="flex justify-between text-xs text-emerald-500">
          <span>الخصم</span><span class="font-medium">- {{ discountAmount.toLocaleString() }} د.ع</span>
        </div>
        <div v-if="taxAmount > 0" class="flex justify-between text-xs text-amber-500">
          <span>الضريبة ({{ taxPercent }}%)</span><span class="font-medium">+ {{ taxAmount.toLocaleString() }} د.ع</span>
        </div>
        <div class="pt-2 border-t border-gray-100 flex justify-between items-center">
          <span class="text-sm font-bold text-secondary">الإجمالي</span>
          <span class="text-xl font-black text-sales">{{ grandTotal.toLocaleString() }} <span class="text-xs font-semibold text-gray-400">د.ع</span></span>
        </div>
        <template v-if="paymentMethod === 'partial' && paidAmount > 0">
          <div class="flex justify-between text-xs text-emerald-600">
            <span>المدفوع</span><span class="font-bold">{{ paidAmount.toLocaleString() }} د.ع</span>
          </div>
          <div class="flex justify-between text-xs text-amber-500">
            <span>المتبقي</span><span class="font-bold">{{ remaining.toLocaleString() }} د.ع</span>
          </div>
        </template>
      </div>

      <!-- Actions -->
      <div class="space-y-2 pb-2">
        <button @click="checkout" :disabled="cart.length === 0 || saving"
          class="w-full py-3.5 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          :class="cart.length > 0 ? 'bg-sales hover:opacity-90 text-white shadow-sm shadow-sales/30' : 'bg-gray-100 text-gray-300'">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-check-circle"></i>
          {{ saving ? 'جار إتمام البيع...' : 'إتمام البيع' }}
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button @click="printReceipt" :disabled="cart.length === 0"
            class="py-2.5 rounded-2xl font-semibold text-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition disabled:opacity-40 flex items-center justify-center gap-2">
            <i class="fas fa-print text-xs"></i> طباعة
          </button>
          <button @click="clearAll"
            class="py-2.5 rounded-2xl font-semibold text-sm border border-red-100 bg-red-50 hover:bg-red-100 text-red-400 transition flex items-center justify-center gap-2">
            <i class="fas fa-broom text-xs"></i> مسح الكل
          </button>
        </div>
      </div>
    </div>

    <!-- ========== Left Column: Product Browser ========== -->
    <div class="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-0">

      <!-- Search + Filters -->
      <div class="p-4 border-b border-gray-100 space-y-3">
        <div class="relative">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
          <input v-model="search" placeholder="بحث بالاسم أو الباركود..." dir="rtl"
            class="w-full pr-9 pl-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
          <button v-if="search" @click="search = ''" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button v-for="cat in categoryPills" :key="cat" @click="selectedCat = cat"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0"
            :class="selectedCat === cat ? 'bg-sales text-white shadow-sm shadow-sales/30' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
            {{ cat }}
          </button>
        </div>
        <div class="flex items-center justify-between text-xs text-gray-400">
          <span>{{ filteredProducts.length }} منتج</span>
          <div class="flex items-center gap-2">
            <button @click="view = 'grid'" :class="view === 'grid' ? 'text-sales' : 'text-gray-300'" class="transition">
              <i class="fas fa-th-large"></i>
            </button>
            <button @click="view = 'list'" :class="view === 'list' ? 'text-sales' : 'text-gray-300'" class="transition">
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="filteredProducts.length === 0" class="flex flex-col items-center justify-center py-16 text-gray-300">
          <i class="fas fa-box-open text-5xl mb-3"></i>
          <p class="text-sm text-gray-400">لا توجد منتجات</p>
        </div>

        <!-- Grid view -->
        <div v-else-if="view === 'grid'" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <button v-for="product in filteredProducts" :key="product.id" @click="addToCart(product)"
            class="group relative bg-gray-50 hover:bg-white border-2 border-transparent hover:border-sales/20 rounded-2xl p-3 text-center transition shadow-[0_1px_3px_rgba(0,0,0,.04)] hover:shadow-md"
            :disabled="product.stock <= 0">
            <div v-if="product.stock <= 0"
              class="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
              <span class="text-[10px] font-bold text-red-400 bg-red-50 border border-red-100 px-2 py-1 rounded-lg">نفد المخزون</span>
            </div>
            <div class="w-11 h-11 bg-sales/10 rounded-xl flex items-center justify-center mx-auto mb-2.5 group-hover:bg-sales/20 transition">
              <i class="fas fa-box text-sales text-base"></i>
            </div>
            <p class="text-xs font-semibold text-secondary truncate leading-tight mb-1">{{ product.name }}</p>
            <p class="text-sm font-black text-sales">{{ product.price.toLocaleString() }}</p>
            <p class="text-[10px] text-gray-300">د.ع</p>
            <div class="absolute top-2 left-2">
              <span class="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="product.stock <= 0 ? 'bg-red-100 text-red-500'
                  : product.stock < 5 ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-400'">
                {{ product.stock }}
              </span>
            </div>
          </button>
        </div>

        <!-- List view -->
        <div v-else class="divide-y divide-gray-50">
          <button v-for="product in filteredProducts" :key="product.id" @click="addToCart(product)"
            class="w-full flex items-center gap-3 py-3 px-2 hover:bg-gray-50/70 rounded-xl transition text-right group"
            :disabled="product.stock <= 0">
            <div class="w-9 h-9 rounded-xl bg-sales/10 flex items-center justify-center flex-shrink-0 group-hover:bg-sales/20 transition">
              <i class="fas fa-box text-sales text-sm"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-secondary truncate">{{ product.name }}</p>
              <p class="text-xs text-gray-400">{{ product.category }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-sm font-black text-sales">{{ product.price.toLocaleString() }} <span class="text-xs font-normal text-gray-300">د.ع</span></p>
              <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="product.stock <= 0 ? 'bg-red-100 text-red-500'
                  : product.stock < 5 ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-400'">
                مخزون: {{ product.stock }}
              </span>
            </div>
            <i class="fas fa-plus-circle text-sales/30 group-hover:text-sales text-lg transition"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <transition name="toast">
    <div v-if="toastMsg"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold">
      <i class="fas fa-check-circle text-lg"></i>
      {{ toastMsg }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const search = ref('');
const selectedCat = ref('الكل');
const view = ref<'grid' | 'list'>('grid');
const categoriesData = ref<any[]>([]);
const productsData = ref<any[]>([]);
const saving = ref(false);
const toastMsg = ref('');

const showCustomer = ref(false);
const customer = ref({ name: '', phone: '', address: '' });

interface CartItem { id: number; name: string; price: number; qty: number; }
const cart = ref<CartItem[]>([]);

const discount = ref(0);
const discountType = ref<'fixed' | 'percent'>('fixed');
const taxPercent = ref(0);
const notes = ref('');
const paymentMethod = ref('cash');
const paidAmount = ref(0);
const receivedAmount = ref(0);

const paymentMethods = [
  { value: 'cash',     label: 'نقد',  icon: 'fa-money-bill-wave',  desc: 'دفع فوري' },
  { value: 'deferred', label: 'آجل',  icon: 'fa-clock',            desc: 'دين مؤجل' },
  { value: 'partial',  label: 'جزئي', icon: 'fa-hand-holding-usd', desc: 'دفع جزئي' },
];

const quickAmounts = computed(() => {
  const g = grandTotal.value;
  if (g <= 0) return [];
  const rounds = [1000, 2000, 5000, 10000, 25000, 50000, 100000];
  return [...new Set([...rounds.filter(r => r >= g).slice(0, 4), Math.ceil(g / 1000) * 1000])].slice(0, 5);
});

const categoryPills = computed(() => ['الكل', ...categoriesData.value.map((c: any) => c.name)]);

const products = computed(() => productsData.value.map((p: any) => ({
  id: p.id, name: p.name, price: Number(p.price),
  category: p.category?.name || '—', stock: p.stock, barcode: p.barcode || '',
})));

const filteredProducts = computed(() => products.value.filter(p => {
  const matchCat = selectedCat.value === 'الكل' || p.category === selectedCat.value;
  const q = search.value.toLowerCase();
  return matchCat && (!q || p.name.toLowerCase().includes(q) || p.barcode.includes(q));
}));

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0));

const discountAmount = computed(() => {
  if (!discount.value || discount.value <= 0) return 0;
  return discountType.value === 'percent'
    ? Math.round(subtotal.value * discount.value / 100)
    : Math.min(discount.value, subtotal.value);
});

const taxAmount = computed(() =>
  taxPercent.value > 0 ? Math.round((subtotal.value - discountAmount.value) * taxPercent.value / 100) : 0
);

const grandTotal = computed(() => subtotal.value - discountAmount.value + taxAmount.value);
const remaining = computed(() => grandTotal.value - (paidAmount.value || 0));
const change = computed(() => (receivedAmount.value || 0) - grandTotal.value);
const invoicePreviewNum = computed(() => String(Date.now()).slice(-6));

function addToCart(product: { id: number; name: string; price: number; stock: number }) {
  if (product.stock <= 0) return;
  const existing = cart.value.find(i => i.id === product.id);
  if (existing) { if (existing.qty < product.stock) existing.qty++; }
  else { cart.value.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); }
}

function removeFromCart(index: number) { cart.value.splice(index, 1); }

function clearAll() {
  if (cart.value.length === 0 && !customer.value.name) return;
  if (!confirm('هل تريد مسح السلة وبيانات العميل؟')) return;
  cart.value = [];
  customer.value = { name: '', phone: '', address: '' };
  discount.value = 0; taxPercent.value = 0; notes.value = '';
  paymentMethod.value = 'cash'; paidAmount.value = 0; receivedAmount.value = 0;
}

async function checkout() {
  if (cart.value.length === 0) return;
  saving.value = true;
  try {
    const actualPaid = paymentMethod.value === 'cash' ? grandTotal.value
      : paymentMethod.value === 'deferred' ? 0 : paidAmount.value;
    const payStatus = paymentMethod.value === 'cash' ? 'paid'
      : paymentMethod.value === 'deferred' ? 'deferred'
      : (remaining.value <= 0 ? 'paid' : 'partial');

    await api.post('/invoices', {
      customerName: customer.value.name || undefined,
      customerPhone: customer.value.phone || undefined,
      customerAddress: customer.value.address || undefined,
      items: cart.value.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
      total: grandTotal.value,
      discount: discountAmount.value,
      tax: taxAmount.value,
      paymentMethod: paymentMethod.value,
      paymentStatus: payStatus,
      paidAmount: actualPaid,
      notes: notes.value || undefined,
    });

    const { data } = await api.get('/products');
    productsData.value = data;
    cart.value = [];
    customer.value = { name: '', phone: '', address: '' };
    discount.value = 0; taxPercent.value = 0; notes.value = '';
    paidAmount.value = 0; receivedAmount.value = 0;
    showToast('تم إتمام البيع بنجاح ✓');
  } catch (e: any) {
    alert(e?.response?.data?.message || 'حدث خطأ أثناء إتمام البيع');
  } finally {
    saving.value = false;
  }
}

function printReceipt() {
  if (cart.value.length === 0) return;
  const now = new Date().toLocaleString('ar-IQ');
  const methodMap: Record<string, string> = { cash: 'نقد', deferred: 'آجل', partial: 'جزئي' };
  const rows = cart.value.map(i =>
    `<tr><td>${i.name}</td><td style="text-align:center">${i.qty}</td>
     <td style="text-align:left">${i.price.toLocaleString()}</td>
     <td style="text-align:left;font-weight:700">${(i.price*i.qty).toLocaleString()}</td></tr>`
  ).join('');
  const cust = customer.value.name
    ? `<div class="cust"><b>العميل:</b> ${customer.value.name}${customer.value.phone ? ` — ${customer.value.phone}` : ''}${customer.value.address ? `<br>${customer.value.address}` : ''}</div>` : '';
  const win = window.open('', '_blank', 'width=420,height=680')!;
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="utf-8"><title>فاتورة</title>
  <style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,sans-serif}
  body{padding:20px;font-size:13px;color:#222}
  h1{text-align:center;font-size:20px;margin-bottom:4px}
  .sub{text-align:center;font-size:11px;color:#999;margin-bottom:14px}
  .cust{background:#f7f7f7;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:12px}
  th,td{border:1px solid #eee;padding:6px 8px;text-align:right}
  th{background:#f5f5f5;font-size:12px}
  .tot{font-size:16px;font-weight:900;color:#e05c00;text-align:left;margin-bottom:4px}
  .footer{text-align:center;font-size:11px;color:#bbb;margin-top:18px;border-top:1px dashed #ddd;padding-top:12px}
  @media print{.np{display:none}}
  </style></head><body>
  <h1>🧾 فاتورة مبيعات</h1><p class="sub">${now}</p>
  ${cust}
  <table><thead><tr><th>المنتج</th><th>الكمية</th><th style="text-align:left">السعر</th><th style="text-align:left">الإجمالي</th></tr></thead>
  <tbody>${rows}</tbody></table>
  ${discountAmount.value > 0 ? `<p style="text-align:left;color:#10b981;margin-bottom:3px;font-size:12px">خصم: - ${discountAmount.value.toLocaleString()} د.ع</p>` : ''}
  ${taxAmount.value > 0 ? `<p style="text-align:left;color:#f59e0b;margin-bottom:3px;font-size:12px">ضريبة: + ${taxAmount.value.toLocaleString()} د.ع</p>` : ''}
  <p class="tot">الإجمالي: ${grandTotal.value.toLocaleString()} د.ع</p>
  <p style="text-align:left;font-size:12px;color:#666;margin-bottom:4px">طريقة الدفع: ${methodMap[paymentMethod.value]}</p>
  ${paymentMethod.value === 'partial' && paidAmount.value > 0 ? `<p style="text-align:left;font-size:12px;color:#f59e0b">المتبقي: ${remaining.value.toLocaleString()} د.ع</p>` : ''}
  ${notes.value ? `<p style="font-size:11px;color:#888;margin-top:8px">ملاحظات: ${notes.value}</p>` : ''}
  <div class="footer">شكراً لتعاملكم معنا</div>
  <div class="np" style="text-align:center;margin-top:14px">
    <button onclick="window.print()" style="padding:8px 24px;background:#e05c00;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px">🖨 طباعة</button>
  </div></body></html>`);
  win.document.close();
}

function showToast(msg: string) {
  toastMsg.value = msg;
  setTimeout(() => { toastMsg.value = ''; }, 3000);
}

onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
    productsData.value = prodRes.data;
    categoriesData.value = catRes.data;
  } catch {}
});
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>

