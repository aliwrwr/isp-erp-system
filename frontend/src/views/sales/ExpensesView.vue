<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary flex items-center gap-2">
        <i class="fas fa-receipt text-red-500"></i> المصروفات
      </h2>
      <button @click="openAdd" class="bg-sales hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة مصروف
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <StatsCard title="مصروفات الشهر"  :value="fmt(stats.monthTotal)" icon="fas fa-calendar-alt" color="#E74C3C" />
      <StatsCard title="إجمالي السجلات" :value="String(stats.count)"    icon="fas fa-list"        color="#F39C12" />
      <StatsCard title="أعلى مصروف"     :value="fmt(stats.max)"         icon="fas fa-arrow-up"    color="#8E44AD" />
      <StatsCard title="أقل مصروف"      :value="fmt(stats.min)"         icon="fas fa-arrow-down"  color="#2980B9" />
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <!-- Search -->
        <div class="relative">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          <input v-model="search" @input="onSearch" placeholder="بحث بالاسم أو الوصف..."
            class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
        </div>
        <!-- Category -->
        <select v-model="filterCategory" @change="loadData"
          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales">
          <option value="all">كل التصنيفات</option>
          <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
        </select>
        <!-- Date From -->
        <div class="relative">
          <label class="absolute -top-2 right-3 bg-white px-1 text-[10px] text-gray-400">من</label>
          <input v-model="dateFrom" @change="loadData" type="date"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
        </div>
        <!-- Date To -->
        <div class="relative">
          <label class="absolute -top-2 right-3 bg-white px-1 text-[10px] text-gray-400">إلى</label>
          <input v-model="dateTo" @change="loadData" type="date"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
        </div>
      </div>
      <!-- Active filters chips -->
      <div v-if="hasFilters" class="flex flex-wrap gap-2 mt-3">
        <span v-if="search" class="inline-flex items-center gap-1 bg-sales/10 text-sales text-xs px-2 py-1 rounded-full">
          <i class="fas fa-search text-[10px]"></i> {{ search }}
          <button @click="search=''; loadData()" class="ml-1 hover:text-red-500"><i class="fas fa-times text-[10px]"></i></button>
        </span>
        <span v-if="filterCategory!=='all'" class="inline-flex items-center gap-1 bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full">
          <i class="fas fa-tag text-[10px]"></i> {{ catLabel(filterCategory) }}
          <button @click="filterCategory='all'; loadData()" class="ml-1 hover:text-red-500"><i class="fas fa-times text-[10px]"></i></button>
        </span>
        <span v-if="dateFrom||dateTo" class="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs px-2 py-1 rounded-full">
          <i class="fas fa-calendar text-[10px]"></i> {{ dateFrom || '...' }} — {{ dateTo || '...' }}
          <button @click="dateFrom=''; dateTo=''; loadData()" class="ml-1 hover:text-red-500"><i class="fas fa-times text-[10px]"></i></button>
        </span>
        <button @click="clearFilters" class="text-xs text-gray-400 hover:text-red-500 underline">مسح الكل</button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <span class="text-sm font-bold text-secondary flex items-center gap-2">
          <i class="fas fa-table text-gray-400"></i> سجل المصروفات
          <span class="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">{{ total }}</span>
        </span>
        <span class="text-xs text-gray-400">{{ perPage }} سجل / صفحة</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-right text-gray-500 font-medium w-10">#</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">اسم المستلم</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">الوصف</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">التصنيف</th>
              <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ والوقت</th>
              <th class="px-4 py-3 text-center text-gray-500 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                <i class="fas fa-spinner fa-spin text-xl"></i>
              </td>
            </tr>
            <tr v-else-if="!expenses.length">
              <td colspan="7" class="px-4 py-12 text-center text-gray-400">
                <i class="fas fa-receipt text-3xl mb-2 block opacity-20"></i>
                لا توجد مصروفات
              </td>
            </tr>
            <tr v-for="(e, idx) in expenses" :key="e.id"
              class="border-t border-gray-50 hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-400 text-xs">{{ (currentPage - 1) * perPage + idx + 1 }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                    {{ e.recipientName?.charAt(0) || '?' }}
                  </div>
                  <span class="font-medium text-secondary">{{ e.recipientName }}</span>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 max-w-[200px]">
                <span class="truncate block" :title="e.description">{{ e.description || '—' }}</span>
              </td>
              <td class="px-4 py-3">
                <span class="font-bold text-red-600">{{ Number(e.amount).toLocaleString() }}</span>
                <span class="text-xs text-gray-400 mr-1">د.ع</span>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="catColor(e.category)">
                  <i :class="catIcon(e.category)" class="text-[10px]"></i>
                  {{ catLabel(e.category) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">
                <div class="font-medium text-gray-700">{{ formatDate(e.date) }}</div>
                <div class="text-gray-400">{{ e.time || '—' }}</div>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <button @click="openEdit(e)" title="تعديل"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button @click="remove(e.id)" title="حذف"
                    class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pages > 1" class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
        <span class="text-xs text-gray-500">
          صفحة {{ currentPage }} من {{ pages }} — إجمالي {{ total }} سجل
        </span>
        <div class="flex items-center gap-1">
          <button @click="goPage(1)" :disabled="currentPage===1"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button @click="goPage(currentPage-1)" :disabled="currentPage===1"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <i class="fas fa-angle-right"></i>
          </button>
          <template v-for="p in pageList" :key="p">
            <span v-if="p==='...'" class="px-1 text-gray-400 text-xs">...</span>
            <button v-else @click="goPage(Number(p))"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-xs border transition"
              :class="currentPage===Number(p) ? 'bg-sales text-white border-sales' : 'border-gray-200 bg-white hover:bg-gray-100'">
              {{ p }}
            </button>
          </template>
          <button @click="goPage(currentPage+1)" :disabled="currentPage===pages"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <i class="fas fa-angle-left"></i>
          </button>
          <button @click="goPage(pages)" :disabled="currentPage===pages"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-xs border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit Modal -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal=false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <!-- Header -->
          <div class="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-bold text-lg text-secondary flex items-center gap-2">
              <i class="fas fa-receipt text-red-500"></i>
              {{ editId ? 'تعديل مصروف' : 'إضافة مصروف جديد' }}
            </h3>
            <button @click="showModal=false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <!-- Body -->
          <div class="p-5 space-y-4">
            <!-- Row 1: recipient + amount -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                  <i class="fas fa-user text-gray-400 ml-1"></i>اسم المستلم <span class="text-red-400">*</span>
                </label>
                <input v-model="form.recipientName" placeholder="مثال: أحمد محمد"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                  <i class="fas fa-money-bill text-gray-400 ml-1"></i>المبلغ (د.ع) <span class="text-red-400">*</span>
                </label>
                <input v-model="form.amount" type="number" min="0" placeholder="0"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
              </div>
            </div>
            <!-- Description -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                <i class="fas fa-align-right text-gray-400 ml-1"></i>الوصف
              </label>
              <textarea v-model="form.description" rows="2" placeholder="وصف المصروف..."
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales resize-none"></textarea>
            </div>
            <!-- Category -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                <i class="fas fa-tag text-gray-400 ml-1"></i>التصنيف
              </label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="c in categories" :key="c.value" @click="form.category=c.value"
                  class="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition"
                  :class="form.category===c.value ? 'border-sales bg-sales/5 text-sales' : 'border-gray-200 text-gray-500 hover:border-gray-300'">
                  <i :class="c.icon" class="text-[11px]"></i> {{ c.label }}
                </button>
              </div>
            </div>
            <!-- Date + Time -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                  <i class="fas fa-calendar text-gray-400 ml-1"></i>التاريخ <span class="text-red-400">*</span>
                </label>
                <input v-model="form.date" type="date"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                  <i class="fas fa-clock text-gray-400 ml-1"></i>الوقت
                </label>
                <input v-model="form.time" type="time"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" />
              </div>
            </div>
          </div>
          <!-- Footer -->
          <div class="p-5 border-t border-gray-100 flex items-center justify-between">
            <p v-if="formError" class="text-xs text-red-500"><i class="fas fa-exclamation-circle ml-1"></i>{{ formError }}</p>
            <div v-else></div>
            <div class="flex gap-3">
              <button @click="showModal=false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition">إلغاء</button>
              <button @click="save" :disabled="saving"
                class="px-6 py-2 bg-sales text-white text-sm rounded-xl font-medium transition disabled:opacity-60 flex items-center gap-2">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-save"></i>
                {{ editId ? 'حفظ التعديل' : 'إضافة' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import api from '../../api';

// ── Categories ────────────────────────────────────────────────
const categories = [
  { value: 'general',     label: 'عام',       icon: 'fas fa-box',          color: 'bg-gray-100 text-gray-600' },
  { value: 'rent',        label: 'إيجار',     icon: 'fas fa-building',     color: 'bg-blue-50 text-blue-600' },
  { value: 'utilities',   label: 'خدمات',     icon: 'fas fa-bolt',         color: 'bg-yellow-50 text-yellow-600' },
  { value: 'salary',      label: 'رواتب',     icon: 'fas fa-users',        color: 'bg-green-50 text-green-600' },
  { value: 'maintenance', label: 'صيانة',     icon: 'fas fa-tools',        color: 'bg-orange-50 text-orange-600' },
  { value: 'transport',   label: 'مواصلات',   icon: 'fas fa-car',          color: 'bg-purple-50 text-purple-600' },
  { value: 'marketing',   label: 'تسويق',     icon: 'fas fa-bullhorn',     color: 'bg-pink-50 text-pink-600' },
  { value: 'equipment',   label: 'معدات',     icon: 'fas fa-desktop',      color: 'bg-indigo-50 text-indigo-600' },
  { value: 'other',       label: 'أخرى',      icon: 'fas fa-ellipsis-h',   color: 'bg-red-50 text-red-500' },
];
const catLabel = (v: string) => categories.find(c => c.value === v)?.label ?? v;
const catColor = (v: string) => categories.find(c => c.value === v)?.color ?? 'bg-gray-100 text-gray-600';
const catIcon  = (v: string) => categories.find(c => c.value === v)?.icon  ?? 'fas fa-circle';

// ── State ─────────────────────────────────────────────────────
const expenses    = ref<any[]>([]);
const total       = ref(0);
const pages       = ref(1);
const currentPage = ref(1);
const perPage     = 20;
const loading     = ref(false);
const stats       = ref({ monthTotal: 0, count: 0, max: 0, min: 0 });

const search         = ref('');
const filterCategory = ref('all');
const dateFrom       = ref('');
const dateTo         = ref('');
let   searchTimeout: ReturnType<typeof setTimeout> | null = null;

const hasFilters = computed(() => search.value || filterCategory.value !== 'all' || dateFrom.value || dateTo.value);

// ── Modal ─────────────────────────────────────────────────────
const showModal  = ref(false);
const editId     = ref<number | null>(null);
const saving     = ref(false);
const formError  = ref('');

const now = new Date();
const form = ref({
  recipientName: '',
  description: '',
  amount: 0,
  category: 'general',
  date: now.toISOString().slice(0, 10),
  time: now.toTimeString().slice(0, 5),
});

// ── Helpers ───────────────────────────────────────────────────
const fmt = (n: number) => Number(n || 0).toLocaleString() + ' د.ع';

function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── Pagination list ───────────────────────────────────────────
const pageList = computed(() => {
  const p = pages.value, c = currentPage.value;
  if (p <= 7) return Array.from({ length: p }, (_, i) => i + 1);
  const arr: (number | string)[] = [1];
  if (c > 3) arr.push('...');
  for (let i = Math.max(2, c - 1); i <= Math.min(p - 1, c + 1); i++) arr.push(i);
  if (c < p - 2) arr.push('...');
  arr.push(p);
  return arr;
});

// ── Load ──────────────────────────────────────────────────────
async function loadData() {
  loading.value = true;
  try {
    const params: any = { page: currentPage.value, limit: perPage };
    if (search.value)                params.search   = search.value;
    if (filterCategory.value !== 'all') params.category = filterCategory.value;
    if (dateFrom.value)              params.dateFrom = dateFrom.value;
    if (dateTo.value)                params.dateTo   = dateTo.value;

    const { data } = await api.get('/expenses', { params });
    expenses.value = data.data ?? data;
    total.value    = data.total ?? data.length;
    pages.value    = data.pages ?? 1;
  } catch { expenses.value = []; total.value = 0; }
  loading.value = false;
}

async function loadStats() {
  try { const { data } = await api.get('/expenses/stats'); stats.value = data; } catch {}
}

function onSearch() {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => { currentPage.value = 1; loadData(); }, 400);
}

function goPage(p: number) {
  if (p < 1 || p > pages.value) return;
  currentPage.value = p;
  loadData();
}

function clearFilters() {
  search.value = ''; filterCategory.value = 'all'; dateFrom.value = ''; dateTo.value = '';
  currentPage.value = 1; loadData();
}

// ── CRUD ──────────────────────────────────────────────────────
function openAdd() {
  editId.value = null;
  formError.value = '';
  const n = new Date();
  form.value = { recipientName: '', description: '', amount: 0, category: 'general',
    date: n.toISOString().slice(0, 10), time: n.toTimeString().slice(0, 5) };
  showModal.value = true;
}

function openEdit(e: any) {
  editId.value = e.id;
  formError.value = '';
  form.value = { recipientName: e.recipientName, description: e.description || '',
    amount: e.amount, category: e.category, date: e.date, time: e.time || '' };
  showModal.value = true;
}

async function save() {
  formError.value = '';
  if (!form.value.recipientName.trim()) { formError.value = 'يرجى إدخال اسم المستلم'; return; }
  if (!form.value.amount || Number(form.value.amount) <= 0) { formError.value = 'يرجى إدخال مبلغ صحيح'; return; }
  saving.value = true;
  try {
    const payload = { ...form.value, amount: Number(form.value.amount) };
    if (editId.value) await api.patch(`/expenses/${editId.value}`, payload);
    else              await api.post('/expenses', payload);
    showModal.value = false;
    await Promise.all([loadData(), loadStats()]);
  } catch { formError.value = 'حدث خطأ أثناء الحفظ'; }
  saving.value = false;
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
  try { await api.delete(`/expenses/${id}`); await Promise.all([loadData(), loadStats()]); } catch {}
}

onMounted(() => { loadData(); loadStats(); });
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s, transform .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.97); }
</style>
