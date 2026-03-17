<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-secondary">المنتجات</h2>
        <p class="text-xs text-gray-400 mt-0.5">{{ products.length }} منتج مسجل</p>
      </div>
      <button @click="openAdd"
        class="bg-sales hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm shadow-sales/30">
        <i class="fas fa-plus text-xs"></i> إضافة منتج
      </button>
    </div>

    <!-- Search + filter bar -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1 max-w-xs">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
        <input v-model="search" placeholder="بحث بالاسم أو الباركود..." dir="rtl"
          class="w-full pr-9 pl-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-white" />
      </div>
      <select v-model="filterCat"
        class="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-white text-gray-600">
        <option value="">كل التصنيفات</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button v-if="search || filterCat" @click="search=''; filterCat=''"
        class="px-3 py-2.5 text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-xl bg-white transition">
        <i class="fas fa-times ml-1"></i>مسح
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3.5 text-center">
                <input type="checkbox" :checked="allPageSelected" :indeterminate="somePageSelected" @change="toggleSelectAll"
                  class="w-4 h-4 accent-sales rounded cursor-pointer" />
              </th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">#</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">المنتج</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">الباركود</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">التصنيف</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">سعر البيع</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">سعر الشراء</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">الربح</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400">المخزون</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold text-gray-400"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="pagedItems.length === 0">
              <td colspan="10" class="px-5 py-12 text-center text-gray-400 text-sm">
                <i class="fas fa-box-open text-2xl mb-2 block text-gray-200"></i>
                لا توجد منتجات
              </td>
            </tr>
            <tr v-for="(p, i) in pagedItems" :key="p.id"
              class="border-t border-gray-50 hover:bg-gray-50/70 transition group"
              :class="selectedIds.has(p.id) ? 'bg-sales/5' : ''">
              <td class="px-4 py-3.5 text-center">
                <input type="checkbox" :checked="selectedIds.has(p.id)" @change="toggleSelect(p.id)"
                  class="w-4 h-4 accent-sales rounded cursor-pointer" />
              </td>
              <td class="px-5 py-3.5 text-gray-400 text-xs font-mono">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-sales/10 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-box text-sales text-xs"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-secondary text-sm">{{ p.name }}</p>
                    <p v-if="p.description" class="text-xs text-gray-400 truncate max-w-[160px]">{{ p.description }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5">
                <span v-if="p.barcode" class="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg">{{ p.barcode }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="px-5 py-3.5">
                <span v-if="p.category" class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sales/10 text-sales text-xs rounded-lg font-medium">
                  <i class="fas fa-tag text-[9px]"></i>{{ p.category.name }}
                </span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="font-bold text-green-600">{{ Number(p.price).toLocaleString() }}</span>
                <span class="text-gray-400 text-xs mr-1">د.ع</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="text-gray-500">{{ p.cost ? Number(p.cost).toLocaleString() : '—' }}</span>
                <span v-if="p.cost" class="text-gray-400 text-xs mr-1">د.ع</span>
              </td>
              <td class="px-5 py-3.5">
                <span v-if="p.cost && p.price" :class="profit(p) > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'">
                  {{ profit(p).toLocaleString() }} د.ع
                </span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  :class="p.stock <= 0 ? 'bg-red-50 text-red-600' : p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'">
                  <i class="fas fa-warehouse text-[9px]"></i>
                  {{ p.stock }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button @click="openEdit(p)"
                    class="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button @click="remove(p.id)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Selected bar -->
    <transition name="slide-up">
      <div v-if="selectedIds.size > 0"
        class="mt-3 px-4 py-2.5 bg-sales/10 border border-sales/20 rounded-xl flex items-center justify-between text-sm">
        <span class="text-sales font-semibold">
          <i class="fas fa-check-square ml-1"></i>
          تم تحديد {{ selectedIds.size }} {{ selectedIds.size === 1 ? 'منتج' : 'منتجات' }}
        </span>
        <div class="flex items-center gap-2">
          <button @click="deleteSelected"
            class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5">
            <i class="fas fa-trash text-xs"></i> حذف المحددة
          </button>
          <button @click="selectedIds = new Set()"
            class="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-500 text-xs font-semibold rounded-lg border border-gray-200 transition">
            إلغاء التحديد
          </button>
        </div>
      </div>
    </transition>

    <!-- Pagination bar -->
    <div v-if="filtered.length > 0" class="flex items-center justify-between mt-4 px-1 select-none" dir="ltr">
      <!-- Page navigation -->
      <div class="flex items-center gap-1">
        <button @click="currentPage = 1" :disabled="currentPage === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white">
          &#171;
        </button>
        <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white">
          &#8249;
        </button>
        <template v-for="p in pageNumbers" :key="String(p) + '_pg'">
          <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">…</span>
          <button v-else @click="goPage(p)"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === p ? 'bg-sales border-sales text-white shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'">
            {{ p }}
          </button>
        </template>
        <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white">
          &#8250;
        </button>
        <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
          class="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition bg-white">
          &#187;
        </button>
      </div>

      <!-- Info + page size -->
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400" dir="rtl">
          {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filtered.length) }}
          من {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button v-for="s in [500, 100, 50, 10, 5]" :key="s" @click="setPageSize(s)"
            class="w-10 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="pageSize === s ? 'bg-sales border-sales text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:bg-gray-50 bg-white'">
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <transition name="modal">
      <div v-if="showModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl">

          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-sales/10 flex items-center justify-center">
                <i class="fas fa-box text-sales text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">{{ editingId ? 'تعديل منتج' : 'إضافة منتج جديد' }}</h3>
                <p class="text-xs text-gray-400">{{ editingId ? 'تعديل بيانات المنتج' : 'أدخل بيانات المنتج الجديد' }}</p>
              </div>
            </div>
            <button @click="showModal = false"
              class="w-8 h-8 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5">

            <!-- اسم المنتج -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                اسم المنتج <span class="text-red-400">*</span>
              </label>
              <input v-model="form.name" placeholder="مثال: مياه معدنية 500ml"
                class="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales transition bg-gray-50 focus:bg-white"
                :class="formError && !form.name.trim() ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'" />
              <p v-if="formError && !form.name.trim()" class="text-xs text-red-400 mt-1">اسم المنتج مطلوب</p>
            </div>

            <!-- الأسعار -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                  سعر البيع <span class="text-red-400">*</span>
                </label>
                <div class="relative">
                  <input v-model="form.price" type="number" min="0" placeholder="0"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">سعر الشراء</label>
                <div class="relative">
                  <input v-model="form.cost" type="number" min="0" placeholder="0"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                </div>
              </div>
            </div>

            <!-- هامش الربح preview -->
            <div v-if="form.price > 0 && form.cost > 0"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
              :class="form.price - form.cost > 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'">
              <i :class="form.price - form.cost > 0 ? 'fas fa-arrow-trend-up text-emerald-500' : 'fas fa-arrow-trend-down text-red-500'"></i>
              <span :class="form.price - form.cost > 0 ? 'text-emerald-700' : 'text-red-600'">
                هامش الربح: <strong>{{ (form.price - form.cost).toLocaleString() }} د.ع</strong>
                ({{ form.cost > 0 ? Math.round(((form.price - form.cost) / form.cost) * 100) : 0 }}%)
              </span>
            </div>

            <!-- الباركود -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">الباركود</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <i class="fas fa-barcode absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
                  <input v-model="form.barcode" placeholder="أدخل الباركود أو اضغط تخمين" dir="ltr"
                    class="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
                </div>
                <button @click="generateBarcode" type="button"
                  class="px-4 py-2.5 bg-gray-100 hover:bg-sales/10 hover:text-sales text-gray-500 text-xs font-semibold rounded-xl border border-gray-200 transition flex items-center gap-1.5 whitespace-nowrap">
                  <i class="fas fa-wand-magic-sparkles text-xs"></i>
                  تخمين
                </button>
                <button @click="printBarcode" type="button" :disabled="!form.barcode"
                  class="px-3 py-2.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-500 text-xs font-semibold rounded-xl border border-gray-200 transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="طباعة الباركود">
                  <i class="fas fa-print text-xs"></i>
                </button>
              </div>
              <p class="text-[11px] text-gray-400 mt-1">يمكنك إدخال الباركود يدويا أو توليده تلقائيا (EAN-13)</p>
            </div>

            <!-- المخزون والتصنيف -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">الكمية في المخزون</label>
                <div class="relative">
                  <i class="fas fa-warehouse absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
                  <input v-model="form.stock" type="number" min="0" placeholder="0"
                    class="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">التصنيف</label>
                <select v-model="form.categoryId"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition text-gray-600">
                  <option value="">بدون تصنيف</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>

            <!-- المورد -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">المورّد <span class="text-gray-300 font-normal">(اختياري)</span></label>
              <select v-model="form.supplier"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition text-gray-600">
                <option value="">بدون مورد</option>
                <option v-for="s in suppliers" :key="s.id" :value="s.name">{{ s.name }}</option>
              </select>
            </div>

            <!-- الوصف -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">وصف المنتج <span class="text-gray-300 font-normal">(اختياري)</span></label>
              <textarea v-model="form.description" rows="2" placeholder="وصف مختصر للمنتج..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sales bg-gray-50 focus:bg-white transition resize-none"></textarea>
            </div>

          </div>

          <!-- Modal Footer -->
          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showModal = false"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="save" :disabled="saving"
              class="px-6 py-2.5 bg-sales hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i v-if="saving" class="fas fa-spinner fa-spin text-sm"></i>
              <i v-else class="fas fa-check text-sm"></i>
              {{ saving ? 'جار الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إضافة المنتج') }}
            </button>
          </div>

        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../api';

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const formError = ref(false);
const search = ref('');
const filterCat = ref<number | ''>('');
const selectedIds = ref<Set<number>>(new Set());
const currentPage = ref(1);
const pageSize = ref(10);

const suppliers = ref<any[]>([]);

const form = ref({
  name: '',
  price: 0,
  cost: 0,
  barcode: '',
  stock: 0,
  categoryId: '' as number | '',
  supplier: '',
  description: '',
});

const filtered = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !search.value ||
      p.name.toLowerCase().includes(search.value.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search.value));
    const matchCat = !filterCat.value || p.category?.id === Number(filterCat.value);
    return matchSearch && matchCat;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)));

const pagedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filtered.value.slice(start, start + pageSize.value);
});

const pageNumbers = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_: any, i: number) => i + 1);
  const pages: (number | '...')[] = [];
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push('...'); pages.push(total);
  } else if (cur >= total - 3) {
    pages.push(1); pages.push('...');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push(1); pages.push('...'); pages.push(cur - 1); pages.push(cur);
    pages.push(cur + 1); pages.push('...'); pages.push(total);
  }
  return pages;
});

const allPageSelected = computed(() =>
  pagedItems.value.length > 0 && pagedItems.value.every((p: any) => selectedIds.value.has(p.id)));

const somePageSelected = computed(() =>
  pagedItems.value.some((p: any) => selectedIds.value.has(p.id)) && !allPageSelected.value);

watch([search, filterCat], () => {
  currentPage.value = 1;
  selectedIds.value = new Set();
});

function profit(p: any) {
  return Number(p.price) - Number(p.cost || 0);
}

async function loadData() {
  try {
    const [prodRes, catRes, supRes] = await Promise.all([api.get('/products'), api.get('/categories'), api.get('/suppliers')]);
    products.value = prodRes.data;
    categories.value = catRes.data;
    suppliers.value = supRes.data;
  } catch {}
}

function openAdd() {
  editingId.value = null;
  formError.value = false;
  form.value = { name: '', price: 0, cost: 0, barcode: '', stock: 0, categoryId: '', supplier: '', description: '' };
  showModal.value = true;
}

function openEdit(p: any) {
  editingId.value = p.id;
  formError.value = false;
  form.value = {
    name: p.name,
    price: Number(p.price),
    cost: Number(p.cost || 0),
    barcode: p.barcode || '',
    stock: p.stock,
    categoryId: p.category?.id || '',
    supplier: p.supplier || '',
    description: p.description || '',
  };
  showModal.value = true;
}

function toggleSelectAll() {
  const s = new Set(selectedIds.value);
  if (allPageSelected.value) {
    pagedItems.value.forEach((p: any) => s.delete(p.id));
  } else {
    pagedItems.value.forEach((p: any) => s.add(p.id));
  }
  selectedIds.value = s;
}

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value);
  if (s.has(id)) s.delete(id); else s.add(id);
  selectedIds.value = s;
}

function setPageSize(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  selectedIds.value = new Set();
}

function goPage(p: number | '...') {
  if (typeof p === 'number') {
    currentPage.value = p;
    selectedIds.value = new Set();
  }
}

async function deleteSelected() {
  if (!confirm(`هل أنت متأكد من حذف ${selectedIds.value.size} منتج؟`)) return;
  try {
    await Promise.all([...selectedIds.value].map(id => api.delete(`/products/${id}`)));
    selectedIds.value = new Set();
    await loadData();
  } catch { alert('تعذر حذف بعض المنتجات'); }
}

function generateBarcode() {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  form.value.barcode = [...digits, check].join('');
}

// ---- Code128B encoder ----
function code128Bars(text: string): string {
  const CODE128B_START = 104;
  const CODE128_STOP  = 106;
  const vals: number[] = [CODE128B_START];
  let checksum = CODE128B_START;
  for (let i = 0; i < text.length; i++) {
    const v = text.charCodeAt(i) - 32;
    vals.push(v);
    checksum += v * (i + 1);
  }
  vals.push(checksum % 103);
  vals.push(CODE128_STOP);

  // Encoding table (111 + stop pattern)
  const PATTERNS = [
    '11011001100','11001101100','11001100110','10010011000','10010001100',
    '10001001100','10011001000','10011000100','10001100100','11001001000',
    '11001000100','11000100100','10110011100','10011011100','10011001110',
    '10111001100','10011101100','10011100110','11001110010','11001011100',
    '11001001110','11011100100','11001110100','11101101110','11101001100',
    '11100101100','11100100110','11101100100','11100110100','11100110010',
    '11011011000','11011000110','11000110110','10100011000','10001011000',
    '10001000110','10110001000','10001101000','10001100010','11010001000',
    '11000101000','11000100010','10110111000','10110001110','10001101110',
    '10111011000','10111000110','10001110110','11101110110','11010001110',
    '11000101110','11011101000','11011100010','11011101110','11101011000',
    '11101000110','11100010110','11101101000','11101100010','11100011010',
    '11101111010','11001000010','11110001010','10100110000','10100001100',
    '10010110000','10010000110','10000101100','10000100110','10110010000',
    '10110000100','10011010000','10011000010','10000110100','10000110010',
    '11000010010','11001010000','11110111010','11000010100','10001111010',
    '10100111100','10010111100','10010011110','10111100100','10011110100',
    '10011110010','11110100100','11110010100','11110010010','11011011110',
    '11011110110','11110110110','10101111000','10100011110','10001011110',
    '10111101000','10111100010','11110101000','11110100010','10111011110',
    '10111101110','11101011110','11110101110','11010000100','11010010000',
    '11010011100','1100011101011',
  ];
  return vals.map(v => PATTERNS[v] || '').join('');
}

function printBarcode() {
  const code = form.value.barcode;
  const name = form.value.name || 'منتج';
  const price = form.value.price;
  if (!code) return;

  // Build bars string
  const bars = code128Bars(code);

  // Canvas dimensions (58mm label ~ 220px wide)
  const W = 280, H = 120;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Product name (top)
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'center';
  const displayName = name.length > 28 ? name.slice(0, 27) + '…' : name;
  ctx.fillText(displayName, W / 2, 16);

  // Price
  ctx.font = 'bold 11px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText(Number(price).toLocaleString() + ' IQD', W / 2, 30);

  // Draw barcode bars
  const barW = Math.max(1, Math.floor((W - 20) / bars.length));
  const barH = 55;
  const startX = Math.floor((W - bars.length * barW) / 2);
  const startY = 36;
  for (let i = 0; i < bars.length; i++) {
    ctx.fillStyle = bars[i] === '1' ? '#000000' : '#ffffff';
    ctx.fillRect(startX + i * barW, startY, barW, barH);
  }

  // Barcode number text (below bars)
  ctx.fillStyle = '#111111';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(code, W / 2, startY + barH + 12);

  // Open print window
  const dataUrl = canvas.toDataURL('image/png');
  const win = window.open('', '_blank', 'width=400,height=300')!;
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>طباعة باركود - ${name}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5; }
      .label { background:#fff; border:1px solid #ddd; border-radius:8px; padding:16px; text-align:center; box-shadow:0 2px 8px rgba(0,0,0,.1); }
      img { display:block; margin:0 auto; image-rendering:pixelated; }
      @media print {
        body { background:#fff; }
        .label { border:none; box-shadow:none; padding:0; }
        .no-print { display:none; }
      }
    </style></head><body>
    <div class="label">
      <img src="${dataUrl}" width="${W}" height="${H}" />
      <div class="no-print" style="margin-top:12px">
        <button onclick="window.print()" style="padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">
          &#128438; طباعة
        </button>
      </div>
    </div>
  </body></html>`);
  win.document.close();
}

async function save() {
  formError.value = true;
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    const payload: any = {
      name: form.value.name.trim(),
      price: Number(form.value.price),
      stock: Number(form.value.stock),
    };
    if (form.value.cost) payload.cost = Number(form.value.cost);
    if (form.value.barcode) payload.barcode = form.value.barcode;
    if (form.value.description) payload.description = form.value.description;
    if (form.value.categoryId) payload.categoryId = Number(form.value.categoryId);
    if (form.value.supplier) payload.supplier = form.value.supplier;

    if (editingId.value) {
      await api.patch(`/products/${editingId.value}`, payload);
    } else {
      await api.post('/products', payload);
    }
    showModal.value = false;
    await loadData();
  } catch (e: any) {
    alert(e?.response?.data?.message || 'حدث خطأ أثناء الحفظ');
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج')) return;
  try {
    await api.delete(`/products/${id}`);
    await loadData();
  } catch { alert('تعذر حذف المنتج'); }
}

onMounted(loadData);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white { transition: transform .2s; }
.modal-enter-from .bg-white { transform: scale(.96); }
</style>
