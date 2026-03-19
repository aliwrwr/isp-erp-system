<template>
  <div class="space-y-5">

    <!-- ═══ HEADER ═══ -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold text-secondary">مصروفات المطعم</h2>
        <p class="text-xs text-gray-400 mt-0.5">تتبع وإدارة جميع المصروفات التشغيلية</p>
      </div>
      <button @click="openAdd"
        class="bg-restaurant hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm">
        <i class="fas fa-plus"></i> مصروف جديد
      </button>
    </div>

    <!-- ═══ STATS ═══ -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-coins text-danger text-sm"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400">إجمالي المصروفات</p>
          <p class="text-lg font-black text-danger">{{ totalExpenses.toLocaleString() }} <span class="text-xs font-normal">د.ع</span></p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-calendar-day text-orange-500 text-sm"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400">مصروفات اليوم</p>
          <p class="text-lg font-black text-orange-500">{{ todayExpenses.toLocaleString() }} <span class="text-xs font-normal">د.ع</span></p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-calendar-alt text-yellow-500 text-sm"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400">مصروفات الشهر</p>
          <p class="text-lg font-black text-yellow-600">{{ monthExpenses.toLocaleString() }} <span class="text-xs font-normal">د.ع</span></p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-list-ul text-purple-500 text-sm"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400">عدد العمليات</p>
          <p class="text-lg font-black text-purple-600">{{ filtered.length }}</p>
        </div>
      </div>
    </div>

    <!-- ═══ CATEGORY BREAKDOWN BARS ═══ -->
    <div v-if="expenses.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 class="text-sm font-bold text-secondary mb-4">توزيع المصروفات حسب التصنيف</h3>
      <div class="space-y-3">
        <div v-for="cat in categoryBreakdown" :key="cat.value" class="flex items-center gap-3">
          <span class="text-xs text-gray-500 w-24 text-right flex-shrink-0">{{ cat.label }}</span>
          <div class="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="cat.barColor"
              :style="{ width: cat.pct + '%' }"></div>
          </div>
          <span class="text-xs font-bold w-24 text-left flex-shrink-0" :class="cat.textColor">
            {{ cat.total.toLocaleString() }} د.ع
          </span>
          <span class="text-xs text-gray-400 w-10 text-left flex-shrink-0">{{ cat.pct.toFixed(0) }}%</span>
        </div>
      </div>
    </div>

    <!-- ═══ FILTERS ═══ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Category tabs -->
        <div class="flex gap-1.5 flex-wrap flex-1">
          <button v-for="c in categoryFilters" :key="c.value" @click="activeCategory = c.value"
            :class="activeCategory === c.value ? 'bg-restaurant text-white shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'"
            class="px-3 py-1.5 rounded-lg text-xs font-medium transition">
            {{ c.label }}
          </button>
        </div>
        <!-- Date range -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <input v-model="dateFrom" type="date" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
          <span class="text-gray-400 text-xs">—</span>
          <input v-model="dateTo" type="date" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs" />
          <button v-if="dateFrom || dateTo" @click="dateFrom=''; dateTo=''" class="text-xs text-gray-400 hover:text-danger">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <!-- Search -->
        <div class="relative flex-shrink-0">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
          <input v-model="search" placeholder="بحث..." class="pr-8 pl-3 py-1.5 border border-gray-200 rounded-lg text-xs w-36" />
        </div>
      </div>
    </div>

    <!-- ═══ TABLE ═══ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- Loading -->
      <div v-if="loading" class="p-8 text-center text-gray-400">
        <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
        <p class="text-sm">جارٍ التحميل...</p>
      </div>

      <table v-else class="w-full">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">#</th>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">العنوان</th>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">المبلغ</th>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">التصنيف</th>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3">التاريخ</th>
            <th class="text-right text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">ملاحظات</th>
            <th class="text-center text-xs font-semibold text-gray-500 px-4 py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="(e, idx) in filtered" :key="e.id" class="hover:bg-gray-50/60 transition">
            <td class="px-4 py-3 text-xs text-gray-400">{{ idx + 1 }}</td>
            <td class="px-4 py-3">
              <p class="text-sm font-semibold text-secondary">{{ e.title }}</p>
            </td>
            <td class="px-4 py-3">
              <span class="text-sm font-black text-danger">{{ Number(e.amount).toLocaleString() }} <span class="text-xs font-normal text-gray-400">د.ع</span></span>
            </td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" :class="catClass(e.category)">
                <i :class="catIcon(e.category)" class="text-[10px]"></i>
                {{ catLabel(e.category) }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(e.date) }}</td>
            <td class="px-4 py-3 text-xs text-gray-400 max-w-[180px] truncate hidden md:table-cell">{{ e.notes || '—' }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button @click="openEdit(e)" title="تعديل"
                  class="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-400 hover:text-blue-600 flex items-center justify-center transition">
                  <i class="fas fa-edit text-xs"></i>
                </button>
                <button @click="remove(e.id)" title="حذف"
                  class="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-300 hover:text-danger flex items-center justify-center transition">
                  <i class="fas fa-trash text-xs"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="!loading && filtered.length === 0" class="text-center py-14">
        <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <i class="fas fa-receipt text-gray-300 text-2xl"></i>
        </div>
        <p class="text-sm font-medium text-gray-400">لا توجد مصروفات</p>
        <p class="text-xs text-gray-300 mt-1">أضف أول مصروف بالضغط على "مصروف جديد"</p>
      </div>

      <!-- Footer total -->
      <div v-if="!loading && filtered.length > 0" class="bg-gray-50 border-t border-gray-100 px-4 py-3 flex justify-between items-center">
        <span class="text-xs text-gray-400">{{ filtered.length }} سجل</span>
        <span class="text-sm font-bold text-danger">الإجمالي: {{ filteredTotal.toLocaleString() }} د.ع</span>
      </div>
    </div>

    <!-- ═══ MODAL ═══ -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-restaurant/10 flex items-center justify-center">
                <i class="fas fa-coins text-restaurant text-sm"></i>
              </div>
              <h3 class="text-base font-bold text-secondary">{{ editing ? 'تعديل مصروف' : 'مصروف جديد' }}</h3>
            </div>
            <button @click="showModal = false" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-400 flex items-center justify-center">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">عنوان المصروف <span class="text-danger">*</span></label>
              <input v-model="form.title" placeholder="مثال: شراء زيت طبخ" :class="errors.title ? 'border-danger' : 'border-gray-200'"
                class="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-restaurant/20" />
              <p v-if="errors.title" class="text-xs text-danger mt-1">{{ errors.title }}</p>
            </div>

            <!-- Amount + Category row -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5">المبلغ (د.ع) <span class="text-danger">*</span></label>
                <input v-model.number="form.amount" type="number" min="0" step="100" placeholder="0"
                  :class="errors.amount ? 'border-danger' : 'border-gray-200'"
                  class="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-restaurant/20" />
                <p v-if="errors.amount" class="text-xs text-danger mt-1">{{ errors.amount }}</p>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5">التصنيف</label>
                <select v-model="form.category" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-restaurant/20">
                  <option value="ingredients">🥬 مواد أولية</option>
                  <option value="maintenance">🔧 صيانة</option>
                  <option value="salaries">👤 رواتب</option>
                  <option value="utilities">💡 خدمات</option>
                  <option value="general">📦 عام</option>
                </select>
              </div>
            </div>

            <!-- Date -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">التاريخ <span class="text-danger">*</span></label>
              <input v-model="form.date" type="date" :class="errors.date ? 'border-danger' : 'border-gray-200'"
                class="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-restaurant/20" />
              <p v-if="errors.date" class="text-xs text-danger mt-1">{{ errors.date }}</p>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1.5">ملاحظات</label>
              <textarea v-model="form.notes" placeholder="أي تفاصيل إضافية..." rows="2"
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-restaurant/20"></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-2 px-5 pb-5">
            <button @click="save" :disabled="saving"
              class="flex-1 py-2.5 bg-restaurant hover:opacity-90 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
              <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-check text-xs"></i>
              {{ saving ? 'جارٍ الحفظ...' : 'حفظ' }}
            </button>
            <button @click="showModal = false" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold transition">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const expenses   = ref<any[]>([]);
const loading    = ref(false);
const saving     = ref(false);
const showModal  = ref(false);
const editing    = ref<any>(null);
const activeCategory = ref('all');
const dateFrom   = ref('');
const dateTo     = ref('');
const search     = ref('');
const errors     = ref<any>({});
const form       = ref({ title: '', amount: 0, category: 'general', date: '', notes: '' });

const today        = new Date().toISOString().split('T')[0];
const currentMonth = today.slice(0, 7);

const categoryFilters = [
  { value: 'all',          label: 'الكل' },
  { value: 'ingredients',  label: 'مواد أولية' },
  { value: 'maintenance',  label: 'صيانة' },
  { value: 'salaries',     label: 'رواتب' },
  { value: 'utilities',    label: 'خدمات' },
  { value: 'general',      label: 'عام' },
];

const CAT_CONFIG: Record<string, { label: string; icon: string; cls: string; bar: string; text: string }> = {
  ingredients: { label: 'مواد أولية', icon: 'fas fa-seedling',      cls: 'bg-green-50 text-green-700',   bar: 'bg-green-400',  text: 'text-green-700' },
  maintenance:  { label: 'صيانة',      icon: 'fas fa-tools',          cls: 'bg-blue-50 text-blue-700',    bar: 'bg-blue-400',   text: 'text-blue-700' },
  salaries:     { label: 'رواتب',      icon: 'fas fa-user-tie',       cls: 'bg-purple-50 text-purple-700', bar: 'bg-purple-400', text: 'text-purple-700' },
  utilities:    { label: 'خدمات',      icon: 'fas fa-bolt',           cls: 'bg-yellow-50 text-yellow-700', bar: 'bg-yellow-400', text: 'text-yellow-700' },
  general:      { label: 'عام',        icon: 'fas fa-box-open',       cls: 'bg-gray-100 text-gray-600',   bar: 'bg-gray-400',   text: 'text-gray-600' },
};

// ── computed stats ──
const totalExpenses  = computed(() => expenses.value.reduce((s, e) => s + Number(e.amount), 0));
const todayExpenses  = computed(() => expenses.value.filter(e => e.date === today).reduce((s, e) => s + Number(e.amount), 0));
const monthExpenses  = computed(() => expenses.value.filter(e => e.date?.startsWith(currentMonth)).reduce((s, e) => s + Number(e.amount), 0));

const filtered = computed(() => {
  return expenses.value.filter(e => {
    if (activeCategory.value !== 'all' && e.category !== activeCategory.value) return false;
    if (dateFrom.value && e.date < dateFrom.value) return false;
    if (dateTo.value   && e.date > dateTo.value)   return false;
    if (search.value && !e.title?.toLowerCase().includes(search.value.toLowerCase()) && !e.notes?.toLowerCase().includes(search.value.toLowerCase())) return false;
    return true;
  });
});

const filteredTotal = computed(() => filtered.value.reduce((s, e) => s + Number(e.amount), 0));

const categoryBreakdown = computed(() => {
  const total = totalExpenses.value || 1;
  return Object.entries(CAT_CONFIG).map(([key, cfg]) => {
    const t = expenses.value.filter(e => e.category === key).reduce((s, e) => s + Number(e.amount), 0);
    return { value: key, label: cfg.label, total: t, pct: (t / total) * 100, barColor: cfg.bar, textColor: cfg.text };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
});

// ── helpers ──
function catLabel(c: string) { return CAT_CONFIG[c]?.label || c; }
function catClass(c: string) { return CAT_CONFIG[c]?.cls  || 'bg-gray-100 text-gray-600'; }
function catIcon(c: string)  { return CAT_CONFIG[c]?.icon || 'fas fa-tag'; }
function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

// ── load ──
async function load() {
  loading.value = true;
  try { expenses.value = (await api.get('/restaurant/expenses')).data; }
  finally { loading.value = false; }
}

// ── modal ──
function openAdd() {
  editing.value = null;
  errors.value  = {};
  form.value    = { title: '', amount: 0, category: 'general', date: today, notes: '' };
  showModal.value = true;
}
function openEdit(e: any) {
  editing.value   = e;
  errors.value    = {};
  form.value      = { title: e.title, amount: e.amount, category: e.category, date: e.date || today, notes: e.notes || '' };
  showModal.value = true;
}

function validate() {
  const e: any = {};
  if (!form.value.title?.trim())   e.title  = 'العنوان مطلوب';
  if (!form.value.amount || form.value.amount <= 0) e.amount = 'أدخل مبلغاً صحيحاً';
  if (!form.value.date)            e.date   = 'التاريخ مطلوب';
  errors.value = e;
  return Object.keys(e).length === 0;
}

async function save() {
  if (!validate()) return;
  saving.value = true;
  try {
    if (editing.value) await api.patch(`/restaurant/expenses/${editing.value.id}`, form.value);
    else               await api.post('/restaurant/expenses', form.value);
    showModal.value = false;
    await load();
  } finally { saving.value = false; }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
  await api.delete(`/restaurant/expenses/${id}`);
  await load();
}

onMounted(load);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>


