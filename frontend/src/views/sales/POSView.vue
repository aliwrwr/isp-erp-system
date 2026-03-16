<template>
  <div class="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4" dir="rtl">
    <!-- Products List -->
    <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <div class="relative">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input v-model="search" placeholder="بحث عن منتج أو باركود..." class="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
        </div>
        <div class="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button v-for="cat in categories" :key="cat" @click="selectedCat = cat"
            class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition"
            :class="selectedCat === cat ? 'bg-sales text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
            {{ cat }}
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button v-for="product in filteredProducts" :key="product.name" @click="addToCart(product)"
            class="bg-gray-50 hover:bg-sales/5 border border-gray-100 hover:border-sales/30 rounded-xl p-3 text-center transition group">
            <div class="w-10 h-10 bg-sales/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <i class="fas fa-box text-sales"></i>
            </div>
            <p class="text-xs font-medium text-secondary truncate">{{ product.name }}</p>
            <p class="text-sm font-bold text-sales mt-1">{{  product.price  }} د.ع</p>
          </button>
        </div>
      </div>
    </div>

    <!-- Cart -->
    <div class="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div class="p-4 border-b border-gray-100">
        <h3 class="font-bold text-secondary"><i class="fas fa-shopping-cart ml-2 text-sales"></i>سلة المشتريات</h3>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div v-if="cart.length === 0" class="text-center text-gray-400 py-8">
          <i class="fas fa-shopping-basket text-4xl mb-3"></i>
          <p class="text-sm">السلة فارغة</p>
        </div>
        <div v-for="(item, i) in cart" :key="i" class="flex items-center gap-3 py-3 border-b border-gray-50">
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-secondary truncate">{{ item.name }}</p>
            <p class="text-xs text-gray-400">{{  item.price  }} د.ع × {{ item.qty }}</p>
          </div>
          <div class="flex items-center gap-1">
            <button @click="item.qty > 1 ? item.qty-- : removeFromCart(i)" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">-</button>
            <span class="w-8 text-center text-sm font-medium">{{ item.qty }}</span>
            <button @click="item.qty++" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xs">+</button>
          </div>
          <span class="font-bold text-sm text-secondary w-16 text-left">{{  (item.price * item.qty).toFixed(2)  }} د.ع</span>
        </div>
      </div>
      <div class="p-4 border-t border-gray-100 space-y-3">
        <div class="flex justify-between text-sm"><span class="text-gray-500">المجموع</span><span class="font-bold text-lg text-secondary">{{  total.toFixed(2)  }} د.ع</span></div>
        <button @click="checkout" class="w-full py-3 bg-sales hover:bg-success-dark text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
          <i class="fas fa-cash-register"></i> إتمام البيع
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const search = ref('');
const selectedCat = ref('الكل');
const categoriesData = ref<any[]>([]);
const productsData = ref<any[]>([]);

const categories = computed(() => {
  const cats = categoriesData.value.map(c => c.name);
  return ['الكل', ...cats];
});

const products = computed(() => productsData.value.map(p => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  category: p.category?.name || '—',
  stock: p.stock,
})));

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchCat = selectedCat.value === 'الكل' || p.category === selectedCat.value;
    const matchSearch = p.name.includes(search.value);
    return matchCat && matchSearch;
  });
});

interface CartItem { id: number; name: string; price: number; qty: number; }
const cart = ref<CartItem[]>([]);

const total = computed(() => cart.value.reduce((sum, item) => sum + item.price * item.qty, 0));

function addToCart(product: { id: number; name: string; price: number }) {
  const existing = cart.value.find(i => i.id === product.id);
  if (existing) { existing.qty++; }
  else { cart.value.push({ id: product.id, name: product.name, price: product.price, qty: 1 }); }
}

function removeFromCart(index: number) {
  cart.value.splice(index, 1);
}

async function checkout() {
  if (cart.value.length === 0) return;
  try {
    await api.post('/invoices', {
      paymentMethod: 'cash',
      items: cart.value.map(i => ({ productId: i.id, quantity: i.qty, price: i.price })),
    });
    cart.value = [];
    const { data } = await api.get('/products');
    productsData.value = data;
    alert('تم إتمام البيع بنجاح');
  } catch {}
}

onMounted(async () => {
  try {
    const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
    productsData.value = prodRes.data;
    categoriesData.value = catRes.data;
  } catch {}
});
</script>
