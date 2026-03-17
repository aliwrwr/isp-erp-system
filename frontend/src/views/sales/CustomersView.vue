<template>
  <div class="flex flex-col gap-4" dir="rtl">

    <!-- ══ Stats Cards ══ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :class="stat.bg">
          <i :class="['fas', stat.icon, 'text-base', stat.color]"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">{{ stat.label }}</p>
          <p class="text-lg font-black" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- ══ Main Panel ══ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- ─ Toolbar ─ -->
      <div class="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <i class="fas fa-users text-teal-600 text-sm"></i>
          </div>
          <div>
            <h2 class="font-black text-secondary text-sm">عملاء المبيعات</h2>
            <p class="text-[11px] text-gray-400">{{ filtered.length }} عميل</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 flex-1 sm:max-w-xl items-center">
          <!-- Search -->
          <div class="relative flex-1 min-w-[180px]">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input v-model="searchQ" placeholder="بحث بالاسم أو الهاتف..."
              class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white transition" />
            <button v-if="searchQ" @click="searchQ = ''" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
          <!-- Add button -->
          <button @click="openAdd"
            class="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition shadow-sm">
            <i class="fas fa-plus"></i> إضافة عميل
          </button>
        </div>
      </div>

      <!-- ─ Table ─ -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-teal-600 text-white text-xs">
              <th class="px-4 py-3 text-center w-10">#</th>
              <th class="px-4 py-3 text-right cursor-pointer select-none" @click="setSort('name')">
                العميل <i :class="sortIcon('name')"></i>
              </th>
              <th class="px-4 py-3 text-center">الهاتف</th>
              <th class="px-4 py-3 text-right">العنوان</th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('invoiceCount')">
                الفواتير <i :class="sortIcon('invoiceCount')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('totalSales')">
                إجمالي المشتريات <i :class="sortIcon('totalSales')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('totalDebt')">
                الرصيد المتبقي <i :class="sortIcon('totalDebt')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('createdAt')">
                تاريخ الإضافة <i :class="sortIcon('createdAt')"></i>
              </th>
              <th class="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="py-12 text-center text-gray-300">
                <i class="fas fa-spinner fa-spin text-2xl mb-2 block text-teal-400"></i>
                <p class="text-xs">جاري التحميل...</p>
              </td>
            </tr>
            <tr v-else-if="paginated.length === 0">
              <td colspan="9" class="py-12 text-center text-gray-300">
                <i class="fas fa-users text-3xl mb-2 block"></i>
                <p class="text-xs">لا يوجد عملاء</p>
              </td>
            </tr>
            <tr v-for="(c, i) in paginated" :key="c.id"
              class="border-b border-gray-50 hover:bg-gray-50/70 transition group">
              <!-- # -->
              <td class="px-4 py-3 text-center text-[11px] text-gray-300 font-mono">
                {{ (page - 1) * perPage + i + 1 }}
              </td>
              <!-- Name -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 text-xs font-black">
                    {{ c.name[0] }}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-secondary">{{ c.name }}</p>
                    <p v-if="c.notes" class="text-[10px] text-gray-400 truncate max-w-[140px]">{{ c.notes }}</p>
                  </div>
                </div>
              </td>
              <!-- Phone -->
              <td class="px-4 py-3 text-center">
                <span v-if="c.phone" class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{{ c.phone }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <!-- Address -->
              <td class="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                {{ c.address || '—' }}
              </td>
              <!-- Invoice count -->
              <td class="px-4 py-3 text-center">
                <span class="text-xs bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5 font-bold">
                  {{ c.invoiceCount }} فاتورة
                </span>
              </td>
              <!-- Total sales -->
              <td class="px-4 py-3 text-center">
                <p class="text-sm font-black text-teal-700">{{ Number(c.totalSales).toLocaleString() }}</p>
                <p class="text-[10px] text-gray-400">د.ع</p>
              </td>
              <!-- Debt -->
              <td class="px-4 py-3 text-center">
                <span v-if="c.totalDebt > 0"
                  class="text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-600">
                  {{ Number(c.totalDebt).toLocaleString() }} د.ع
                </span>
                <span v-else class="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-lg">
                  <i class="fas fa-check text-[9px] ml-0.5"></i> مسدد
                </span>
              </td>
              <!-- Date -->
              <td class="px-4 py-3 text-center text-xs text-gray-400">
                {{ formatDate(c.createdAt) }}
              </td>
              <!-- Actions -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <!-- Use in POS -->
                  <button @click="useInPOS(c)" title="استخدام في نقطة البيع"
                    class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition">
                    <i class="fas fa-cash-register text-[10px]"></i>
                  </button>
                  <!-- Edit -->
                  <button @click="openEdit(c)" title="تعديل"
                    class="w-7 h-7 rounded-lg bg-teal-50 text-teal-500 hover:bg-teal-100 flex items-center justify-center transition">
                    <i class="fas fa-pen text-[10px]"></i>
                  </button>
                  <!-- Delete -->
                  <button @click="doDelete(c)" title="حذف"
                    class="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition">
                    <i class="fas fa-trash-alt text-[10px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ─ Pagination ─ -->
      <div class="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400">
            عرض {{ Math.min((page - 1) * perPage + 1, filtered.length) }}–{{ Math.min(page * perPage, filtered.length) }} من {{ filtered.length }}
          </span>
          <select v-model.number="perPage" @change="page = 1"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none">
            <option :value="10">10 / صفحة</option>
            <option :value="25">25 / صفحة</option>
            <option :value="50">50 / صفحة</option>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button @click="page = 1" :disabled="page === 1"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button @click="page--" :disabled="page === 1"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-right"></i>
          </button>
          <template v-for="p in pageRange" :key="p">
            <button v-if="p !== '...'" @click="page = p as number"
              class="w-7 h-7 rounded-lg text-xs font-bold transition"
              :class="page === p ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-100'">
              {{ p }}
            </button>
            <span v-else class="w-7 text-center text-gray-300 text-xs">…</span>
          </template>
          <button @click="page++" :disabled="page === totalPages"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-left"></i>
          </button>
          <button @click="page = totalPages" :disabled="page === totalPages"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ══ Add / Edit Modal ══ -->
    <transition name="modal">
      <div v-if="formModal.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="formModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl">
          <!-- Header -->
          <div class="bg-gradient-to-l from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i :class="formModal.isEdit ? 'fas fa-pen' : 'fas fa-user-plus'"></i>
              {{ formModal.isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد' }}
            </h3>
            <button @click="formModal.visible = false" class="text-white/70 hover:text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="p-6 space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-user ml-1 text-teal-500"></i> اسم العميل *
              </label>
              <input v-model="form.name" placeholder="أدخل اسم العميل" required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Phone -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-phone ml-1 text-teal-500"></i> رقم الهاتف
              </label>
              <input v-model="form.phone" placeholder="07xxxxxxxx" type="tel" dir="ltr"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Address -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-map-marker-alt ml-1 text-teal-500"></i> العنوان
              </label>
              <input v-model="form.address" placeholder="المحلة، الشارع..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Notes -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-sticky-note ml-1 text-teal-500"></i> ملاحظات
              </label>
              <textarea v-model="form.notes" placeholder="ملاحظات إضافية..." rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"></textarea>
            </div>
            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" @click="formModal.visible = false"
                class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
                إلغاء
              </button>
              <button type="submit" :disabled="saving"
                class="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else :class="formModal.isEdit ? 'fas fa-save' : 'fas fa-plus'"></i>
                {{ formModal.isEdit ? 'حفظ التعديلات' : 'إضافة العميل' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- ══ Confirm Delete Modal ══ -->
    <transition name="modal">
      <div v-if="confirmModal.visible"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="confirmModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
          <div class="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fas fa-trash-alt text-2xl text-red-500"></i>
            </div>
            <div>
              <h3 class="text-base font-black text-secondary">حذف العميل</h3>
              <p class="text-xs text-gray-400 mt-1 leading-relaxed">
                هل أنت متأكد من حذف العميل <strong class="text-secondary">{{ confirmModal.customerName }}</strong>؟<br/>
                لن يتم حذف فواتيره السابقة.
              </p>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3">
            <button @click="confirmModal.visible = false"
              class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
              إلغاء
            </button>
            <button @click="confirmDelete"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition">
              <i class="fas fa-trash-alt ml-1"></i> حذف
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold"
        :class="toastType === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'">
        <i :class="toastType === 'error' ? 'fas fa-times-circle text-lg' : 'fas fa-check-circle text-lg'"></i>
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();
const customers = ref<any[]>([]);
const loading = ref(true);
const saving = ref(false);

// ─── Search & Sort ───────────────────────────────────────────
const searchQ = ref('');
const sortKey = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'desc'; }
}
function sortIcon(key: string) {
  if (sortKey.value !== key) return 'fas fa-sort text-white/40 text-[9px]';
  return sortDir.value === 'asc' ? 'fas fa-sort-up text-yellow-300 text-[9px]' : 'fas fa-sort-down text-yellow-300 text-[9px]';
}

const filtered = computed(() => {
  const q = searchQ.value.toLowerCase().trim();
  let list = q
    ? customers.value.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.address || '').toLowerCase().includes(q)
      )
    : [...customers.value];

  list.sort((a, b) => {
    let av = a[sortKey.value] ?? 0, bv = b[sortKey.value] ?? 0;
    if (sortKey.value === 'createdAt') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
    else { av = typeof av === 'string' ? av.toLowerCase() : Number(av); bv = typeof bv === 'string' ? bv.toLowerCase() : Number(bv); }
    return sortDir.value === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
  return list;
});

// ─── Pagination ──────────────────────────────────────────────
const page = ref(1);
const perPage = ref(25);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)));
const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filtered.value.slice(start, start + perPage.value);
});
const pageRange = computed(() => {
  const total = totalPages.value, cur = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

// ─── Stats ───────────────────────────────────────────────────
const stats = computed(() => {
  const all = customers.value;
  const totalSales = all.reduce((s, c) => s + Number(c.totalSales || 0), 0);
  const debtors = all.filter(c => c.totalDebt > 0).length;
  const totalDebt = all.reduce((s, c) => s + Number(c.totalDebt || 0), 0);
  return [
    { label: 'إجمالي العملاء', value: all.length, icon: 'fa-users', bg: 'bg-teal-100', color: 'text-teal-600' },
    { label: 'إجمالي المبيعات', value: totalSales.toLocaleString() + ' د.ع', icon: 'fa-coins', bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { label: 'عملاء لديهم دين', value: debtors, icon: 'fa-exclamation-circle', bg: 'bg-red-100', color: 'text-red-500' },
    { label: 'إجمالي الديون', value: totalDebt.toLocaleString() + ' د.ع', icon: 'fa-hand-holding-usd', bg: 'bg-amber-100', color: 'text-amber-600' },
  ];
});

// ─── Toast ───────────────────────────────────────────────────
const toastMsg = ref('');
const toastType = ref<'success' | 'error'>('success');
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value = msg; toastType.value = type;
  setTimeout(() => toastMsg.value = '', 3500);
}

// ─── Form Modal ──────────────────────────────────────────────
const formModal = ref({ visible: false, isEdit: false, editId: 0 });
const form = ref({ name: '', phone: '', address: '', notes: '' });

function openAdd() {
  form.value = { name: '', phone: '', address: '', notes: '' };
  formModal.value = { visible: true, isEdit: false, editId: 0 };
}
function openEdit(c: any) {
  form.value = { name: c.name, phone: c.phone || '', address: c.address || '', notes: c.notes || '' };
  formModal.value = { visible: true, isEdit: true, editId: c.id };
}
async function submitForm() {
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    if (formModal.value.isEdit) {
      const { data } = await api.patch(`/sales-customers/${formModal.value.editId}`, form.value);
      const idx = customers.value.findIndex(c => c.id === formModal.value.editId);
      if (idx !== -1) customers.value[idx] = { ...customers.value[idx], ...data };
      showToast('✓ تم تعديل بيانات العميل');
    } else {
      await api.post('/sales-customers', form.value);
      await loadCustomers();
      showToast('✓ تم إضافة العميل بنجاح');
    }
    formModal.value.visible = false;
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  } finally {
    saving.value = false;
  }
}

// ─── Delete ──────────────────────────────────────────────────
const confirmModal = ref({ visible: false, customerId: 0, customerName: '' });

function doDelete(c: any) {
  confirmModal.value = { visible: true, customerId: c.id, customerName: c.name };
}
async function confirmDelete() {
  confirmModal.value.visible = false;
  try {
    await api.delete(`/sales-customers/${confirmModal.value.customerId}`);
    customers.value = customers.value.filter(c => c.id !== confirmModal.value.customerId);
    showToast('✓ تم حذف العميل');
  } catch {
    showToast('فشل الحذف، حاول مرة أخرى', 'error');
  }
}

// ─── Use in POS ──────────────────────────────────────────────
function useInPOS(c: any) {
  localStorage.setItem('pos_prefill_customer', JSON.stringify({
    name: c.name, phone: c.phone || '', address: c.address || '',
  }));
  router.push('/sales/pos');
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: '2-digit' });
}

// ─── Load ────────────────────────────────────────────────────
async function loadCustomers() {
  try {
    const { data } = await api.get('/sales-customers');
    customers.value = data;
  } finally {
    loading.value = false;
  }
}
onMounted(loadCustomers);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
