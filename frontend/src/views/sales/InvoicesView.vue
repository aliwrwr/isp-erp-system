<template>
  <div class="flex flex-col gap-4" dir="rtl">

    <!-- ══ Stats Cards ══ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          :class="stat.bg">
          <i :class="['fas', stat.icon, 'text-base', stat.color]"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">{{ stat.label }}</p>
          <p class="text-lg font-black" :class="stat.color">{{ stat.value }}</p>
          <p v-if="stat.sub" class="text-[10px] text-gray-400">{{ stat.sub }}</p>
        </div>
      </div>
    </div>

    <!-- ══ Main Panel ══ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- ─ Toolbar ─ -->
      <div class="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <i class="fas fa-file-invoice text-indigo-600 text-sm"></i>
          </div>
          <div>
            <h2 class="font-black text-secondary text-sm">قائمة الفواتير</h2>
            <p class="text-[11px] text-gray-400">{{ filtered.length }} فاتورة</p>
          </div>
        </div>

        <!-- Search + filters -->
        <div class="flex flex-wrap gap-2 flex-1 sm:max-w-2xl">
          <!-- Search box -->
          <div class="relative flex-1 min-w-[180px]">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input v-model="searchQ" placeholder="بحث بالاسم، الهاتف، رقم الفاتورة..."
              class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition" />
            <button v-if="searchQ" @click="searchQ = ''"
              class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
          <!-- Status filter -->
          <select v-model="filterStatus"
            class="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">كل الحالات</option>
            <option value="paid">مدفوعة</option>
            <option value="deferred">آجل</option>
            <option value="partial">جزئي</option>
          </select>
          <!-- Payment method filter -->
          <select v-model="filterMethod"
            class="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">كل طرق الدفع</option>
            <option value="cash">نقداً</option>
            <option value="deferred">آجل</option>
            <option value="partial">جزئي</option>
          </select>
          <!-- Date from -->
          <input v-model="dateFrom" type="date"
            class="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <!-- Date to -->
          <input v-model="dateTo" type="date"
            class="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <!-- Reset -->
          <button @click="resetFilters"
            class="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-400 hover:bg-gray-100 transition flex items-center gap-1">
            <i class="fas fa-redo-alt"></i> إعادة ضبط
          </button>
        </div>
      </div>

      <!-- Bulk actions bar (when rows selected) -->
      <div v-if="selected.length > 0"
        class="px-5 py-2.5 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3">
        <span class="text-xs font-bold text-indigo-700">
          <i class="fas fa-check-square ml-1"></i>
          {{ selected.length }} فاتورة محددة
        </span>
        <button @click="bulkDelete"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition">
          <i class="fas fa-trash-alt"></i> حذف المحدد
        </button>
        <button @click="selected = []"
          class="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs text-gray-500 hover:bg-gray-50 transition">
          إلغاء التحديد
        </button>
      </div>

      <!-- ─ Table ─ -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-indigo-600 text-white text-xs">
              <th class="px-4 py-3 rounded-r-none w-10">
                <input type="checkbox" :checked="allSelected" @change="toggleAll"
                  class="w-3.5 h-3.5 rounded accent-white cursor-pointer" />
              </th>
              <th class="px-4 py-3 text-center w-10">#</th>
              <th class="px-4 py-3 text-right cursor-pointer select-none" @click="setSort('invoiceNumber')">
                رقم الفاتورة <i :class="sortIcon('invoiceNumber')"></i>
              </th>
              <th class="px-4 py-3 text-right cursor-pointer select-none" @click="setSort('customerName')">
                العميل <i :class="sortIcon('customerName')"></i>
              </th>
              <th class="px-4 py-3 text-center">البنود</th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('total')">
                المبلغ <i :class="sortIcon('total')"></i>
              </th>
              <th class="px-4 py-3 text-center">طريقة الدفع</th>
              <th class="px-4 py-3 text-center">الحالة</th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('date')">
                التاريخ <i :class="sortIcon('date')"></i>
              </th>
              <th class="px-4 py-3 text-center rounded-l-none">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="10" class="py-12 text-center text-gray-300">
                <i class="fas fa-spinner fa-spin text-2xl mb-2 block text-indigo-400"></i>
                <p class="text-xs">جاري التحميل...</p>
              </td>
            </tr>
            <tr v-else-if="paginated.length === 0">
              <td colspan="10" class="py-12 text-center text-gray-300">
                <i class="fas fa-file-invoice text-3xl mb-2 block"></i>
                <p class="text-xs">لا توجد فواتير تطابق البحث</p>
              </td>
            </tr>
            <tr v-for="(inv, i) in paginated" :key="inv.id"
              class="border-b border-gray-50 transition group"
              :class="selected.includes(inv.id) ? 'bg-indigo-50/60' : 'hover:bg-gray-50/70'">
              <!-- Checkbox -->
              <td class="px-4 py-3 text-center">
                <input type="checkbox" :value="inv.id" v-model="selected"
                  class="w-3.5 h-3.5 rounded accent-indigo-500 cursor-pointer" />
              </td>
              <!-- Row number -->
              <td class="px-4 py-3 text-center text-[11px] text-gray-300 font-mono">
                {{ (page - 1) * perPage + i + 1 }}
              </td>
              <!-- Invoice number -->
              <td class="px-4 py-3">
                <span class="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                  {{ inv.invoiceNumber }}
                </span>
              </td>
              <!-- Customer -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 text-xs font-bold">
                    {{ (inv.customerName || '?')[0] }}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-secondary">{{ inv.customerName || 'عميل غير مسجل' }}</p>
                    <p v-if="inv.customerPhone" class="text-[10px] text-gray-400 font-mono">{{ inv.customerPhone }}</p>
                    <p v-if="inv.customerAddress" class="text-[10px] text-gray-300 truncate max-w-[120px]">{{ inv.customerAddress }}</p>
                  </div>
                </div>
              </td>
              <!-- Items count -->
              <td class="px-4 py-3 text-center">
                <span class="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-bold">
                  {{ inv.itemsCount }} بند
                </span>
              </td>
              <!-- Total -->
              <td class="px-4 py-3 text-center">
                <p class="text-sm font-black text-indigo-700">{{ Number(inv.total).toLocaleString() }}</p>
                <p class="text-[10px] text-gray-400">د.ع</p>
                <p v-if="inv.discount > 0" class="text-[10px] text-emerald-500">خصم: {{ Number(inv.discount).toLocaleString() }}</p>
              </td>
              <!-- Payment method -->
              <td class="px-4 py-3 text-center">
                <span class="text-[11px] font-bold px-2 py-1 rounded-lg"
                  :class="{
                    'bg-emerald-100 text-emerald-700': inv.paymentMethod === 'cash',
                    'bg-red-100 text-red-600': inv.paymentMethod === 'deferred',
                    'bg-amber-100 text-amber-700': inv.paymentMethod === 'partial',
                  }">
                  <i :class="methodIcon(inv.paymentMethod)" class="ml-1 text-[9px]"></i>
                  {{ methodLabel(inv.paymentMethod) }}
                </span>
              </td>
              <!-- Status -->
              <td class="px-4 py-3 text-center">
                <span class="text-[11px] font-bold px-2 py-1 rounded-full"
                  :class="{
                    'bg-green-100 text-green-700': inv.paymentStatus === 'paid',
                    'bg-red-100 text-red-600': inv.paymentStatus === 'deferred',
                    'bg-amber-100 text-amber-700': inv.paymentStatus === 'partial',
                  }">
                  {{ statusLabel(inv.paymentStatus) }}
                </span>
              </td>
              <!-- Date -->
              <td class="px-4 py-3 text-center">
                <p class="text-xs text-gray-600 font-medium">{{ formatDate(inv.date) }}</p>
                <p class="text-[10px] text-gray-300">{{ formatTime(inv.date) }}</p>
              </td>
              <!-- Actions -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <!-- Use customer in POS -->
                  <button @click="useCustomerInPOS(inv)"
                    title="استخدامه في نقطة البيع"
                    class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition">
                    <i class="fas fa-cash-register text-[10px]"></i>
                  </button>
                  <!-- View details -->
                  <button @click="openDetails(inv)"
                    title="تفاصيل الفاتورة"
                    class="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 flex items-center justify-center transition">
                    <i class="fas fa-eye text-[10px]"></i>
                  </button>
                  <!-- Print -->
                  <button @click="printInvoice(inv)"
                    title="طباعة"
                    class="w-7 h-7 rounded-lg bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition">
                    <i class="fas fa-print text-[10px]"></i>
                  </button>
                  <!-- Delete -->
                  <button @click="deleteInvoice(inv.id)"
                    title="حذف"
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
            عرض {{ (page - 1) * perPage + 1 }}–{{ Math.min(page * perPage, filtered.length) }} من {{ filtered.length }}
          </span>
          <select v-model.number="perPage" @change="page = 1"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none">
            <option :value="10">10 / صفحة</option>
            <option :value="25">25 / صفحة</option>
            <option :value="50">50 / صفحة</option>
            <option :value="100">100 / صفحة</option>
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
              :class="page === p ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-100'">
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

    <!-- ══ Invoice Details Modal ══ -->
    <transition name="modal">
      <div v-if="detailInv" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" @click.self="detailInv = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <div class="bg-gradient-to-l from-indigo-600 to-purple-700 px-6 py-4 rounded-t-2xl flex items-center justify-between sticky top-0">
            <h3 class="font-bold text-white flex items-center gap-2 text-sm">
              <i class="fas fa-file-invoice"></i>
              تفاصيل الفاتورة — {{ detailInv.invoiceNumber }}
            </h3>
            <button @click="detailInv = null" class="text-white/70 hover:text-white text-sm">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Customer info -->
            <div class="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">العميل</p>
                <p class="text-sm font-semibold text-secondary">{{ detailInv.customerName || '—' }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">الهاتف</p>
                <p class="text-sm font-mono text-secondary">{{ detailInv.customerPhone || '—' }}</p>
              </div>
              <div v-if="detailInv.customerAddress" class="col-span-2">
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">العنوان</p>
                <p class="text-sm text-secondary">{{ detailInv.customerAddress }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">التاريخ</p>
                <p class="text-sm text-secondary">{{ formatDate(detailInv.date) }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">طريقة الدفع</p>
                <p class="text-sm text-secondary">{{ methodLabel(detailInv.paymentMethod) }}</p>
              </div>
              <div v-if="detailInv.notes" class="col-span-2">
                <p class="text-[10px] text-gray-400 font-bold mb-0.5">ملاحظات</p>
                <p class="text-sm text-secondary">{{ detailInv.notes }}</p>
              </div>
            </div>
            <!-- Items -->
            <div>
              <p class="text-xs font-bold text-gray-500 mb-2">البنود</p>
              <table class="w-full text-xs">
                <thead><tr class="bg-indigo-50 text-indigo-700">
                  <th class="px-3 py-2 text-right rounded-r-lg">الوصف</th>
                  <th class="px-3 py-2 text-center">الكمية</th>
                  <th class="px-3 py-2 text-center">السعر</th>
                  <th class="px-3 py-2 text-center rounded-l-lg">الإجمالي</th>
                </tr></thead>
                <tbody>
                  <tr v-for="item in detailInv.items" :key="item.id" class="border-b border-gray-50">
                    <td class="px-3 py-2">{{ item.product?.name || item.name || '—' }}</td>
                    <td class="px-3 py-2 text-center">{{ item.quantity }}</td>
                    <td class="px-3 py-2 text-center">{{ Number(item.price).toLocaleString() }}</td>
                    <td class="px-3 py-2 text-center font-bold text-indigo-700">{{ (item.quantity * Number(item.price)).toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Totals -->
            <div class="bg-indigo-50 rounded-xl p-4 space-y-2">
              <div v-if="detailInv.discount > 0" class="flex justify-between text-xs text-emerald-600">
                <span>الخصم:</span><span>- {{ Number(detailInv.discount).toLocaleString() }} د.ع</span>
              </div>
              <div v-if="detailInv.tax > 0" class="flex justify-between text-xs text-amber-600">
                <span>الضريبة:</span><span>+ {{ Number(detailInv.tax).toLocaleString() }} د.ع</span>
              </div>
              <div class="flex justify-between font-black text-indigo-700">
                <span class="text-sm">الإجمالي:</span>
                <span class="text-base">{{ Number(detailInv.total).toLocaleString() }} د.ع</span>
              </div>
              <div v-if="detailInv.paymentStatus !== 'paid'" class="flex justify-between text-xs text-amber-600">
                <span>المدفوع:</span><span>{{ Number(detailInv.paidAmount).toLocaleString() }} د.ع</span>
              </div>
            </div>
            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="useCustomerInPOS(detailInv); detailInv = null"
                class="flex-1 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition">
                <i class="fas fa-cash-register ml-1"></i> استخدام في نقطة البيع
              </button>
              <button @click="printInvoice(detailInv)"
                class="flex-1 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition">
                <i class="fas fa-print ml-1"></i> طباعة
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold">
        <i class="fas fa-check-circle text-lg"></i>{{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();
const invoices = ref<any[]>([]);
const loading = ref(true);

// ─── Filters ───────────────────────────────────────────────
const searchQ = ref('');
const filterStatus = ref('');
const filterMethod = ref('');
const dateFrom = ref('');
const dateTo = ref('');

function resetFilters() {
  searchQ.value = ''; filterStatus.value = ''; filterMethod.value = '';
  dateFrom.value = ''; dateTo.value = ''; page.value = 1;
}

// ─── Sort ──────────────────────────────────────────────────
const sortKey = ref<string>('date');
const sortDir = ref<'asc' | 'desc'>('desc');

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'desc'; }
}
function sortIcon(key: string) {
  if (sortKey.value !== key) return 'fas fa-sort text-white/40 text-[9px]';
  return sortDir.value === 'asc' ? 'fas fa-sort-up text-yellow-300 text-[9px]' : 'fas fa-sort-down text-yellow-300 text-[9px]';
}

// ─── Filtered + Sorted ─────────────────────────────────────
const filtered = computed(() => {
  let list = invoices.value;
  const q = searchQ.value.toLowerCase().trim();
  if (q) list = list.filter(inv =>
    (inv.customerName || '').toLowerCase().includes(q) ||
    (inv.customerPhone || '').includes(q) ||
    (inv.invoiceNumber || '').toLowerCase().includes(q)
  );
  if (filterStatus.value) list = list.filter(inv => inv.paymentStatus === filterStatus.value);
  if (filterMethod.value) list = list.filter(inv => inv.paymentMethod === filterMethod.value);
  if (dateFrom.value) list = list.filter(inv => new Date(inv.date) >= new Date(dateFrom.value));
  if (dateTo.value) list = list.filter(inv => new Date(inv.date) <= new Date(dateTo.value + 'T23:59:59'));

  // Sort
  list = [...list].sort((a, b) => {
    let av = a[sortKey.value] ?? '', bv = b[sortKey.value] ?? '';
    if (sortKey.value === 'date') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
    else if (['total'].includes(sortKey.value)) { av = Number(av); bv = Number(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    return sortDir.value === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
  return list;
});

// ─── Pagination ────────────────────────────────────────────
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

// ─── Selection ─────────────────────────────────────────────
const selected = ref<number[]>([]);
const allSelected = computed(() => paginated.value.length > 0 && paginated.value.every(inv => selected.value.includes(inv.id)));

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) paginated.value.forEach(inv => { if (!selected.value.includes(inv.id)) selected.value.push(inv.id); });
  else selected.value = selected.value.filter(id => !paginated.value.map(i => i.id).includes(id));
}

// ─── Stats ─────────────────────────────────────────────────
const stats = computed(() => {
  const all = invoices.value;
  const totalAmount = all.reduce((s, i) => s + Number(i.total), 0);
  const paid = all.filter(i => i.paymentStatus === 'paid').length;
  const deferred = all.filter(i => i.paymentStatus === 'deferred').length;
  const debtAmount = all.filter(i => i.paymentStatus !== 'paid')
    .reduce((s, i) => s + (Number(i.total) - Number(i.paidAmount || 0)), 0);
  return [
    { label: 'إجمالي الفواتير', value: all.length, sub: null, icon: 'fa-file-invoice', bg: 'bg-indigo-100', color: 'text-indigo-600' },
    { label: 'إجمالي المبيعات', value: totalAmount.toLocaleString() + ' د.ع', sub: null, icon: 'fa-coins', bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { label: 'مدفوعة', value: paid, sub: null, icon: 'fa-check-circle', bg: 'bg-green-100', color: 'text-green-600' },
    { label: 'إجمالي الديون', value: debtAmount.toLocaleString() + ' د.ع', sub: `${deferred} فاتورة`, icon: 'fa-exclamation-circle', bg: 'bg-red-100', color: 'text-red-500' },
  ];
});

// ─── Helpers ───────────────────────────────────────────────
function methodLabel(m: string) {
  return { cash: 'نقداً', deferred: 'آجل', partial: 'جزئي' }[m] || m;
}
function methodIcon(m: string) {
  return { cash: 'fas fa-money-bill-wave', deferred: 'fas fa-clock', partial: 'fas fa-hand-holding-usd' }[m] || 'fas fa-question';
}
function statusLabel(s: string) {
  return { paid: 'مدفوعة', deferred: 'آجل', partial: 'جزئي' }[s] || s;
}
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: '2-digit' });
}
function formatTime(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}

// ─── Actions ───────────────────────────────────────────────
const detailInv = ref<any>(null);
const toastMsg = ref('');

function showToast(msg: string) { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 3000); }

function openDetails(inv: any) { detailInv.value = inv; }

function useCustomerInPOS(inv: any) {
  if (!inv.customerName && !inv.customerPhone) {
    showToast('لا توجد بيانات عميل في هذه الفاتورة');
    return;
  }
  localStorage.setItem('pos_prefill_customer', JSON.stringify({
    name: inv.customerName || '',
    phone: inv.customerPhone || '',
    address: inv.customerAddress || '',
  }));
  router.push('/sales/pos');
}

async function deleteInvoice(id: number) {
  if (!confirm('هل تريد حذف هذه الفاتورة؟')) return;
  try {
    await api.delete(`/invoices/${id}`);
    invoices.value = invoices.value.filter(i => i.id !== id);
    selected.value = selected.value.filter(s => s !== id);
    showToast('تم حذف الفاتورة');
  } catch {
    alert('فشل الحذف');
  }
}

async function bulkDelete() {
  if (!confirm(`هل تريد حذف ${selected.value.length} فاتورة؟`)) return;
  try {
    await Promise.all(selected.value.map(id => api.delete(`/invoices/${id}`)));
    invoices.value = invoices.value.filter(i => !selected.value.includes(i.id));
    showToast(`تم حذف ${selected.value.length} فاتورة`);
    selected.value = [];
  } catch {
    alert('فشل حذف بعض الفواتير');
  }
}

function printInvoice(inv: any) {
  const rows = (inv.items || []).map((item: any, idx: number) => `
    <tr>
      <td style="text-align:center;color:#888">${idx + 1}</td>
      <td>${item.product?.name || item.name || '—'}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:center">${Number(item.price).toLocaleString()}</td>
      <td style="text-align:center;font-weight:700;color:#4f46e5">${(item.quantity * Number(item.price)).toLocaleString()}</td>
    </tr>`).join('');

  const win = window.open('', '_blank', 'width=820,height=950');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>فاتورة</title>
<style>*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif}
body{padding:30px;font-size:13px}
.banner{background:linear-gradient(to left,#4f46e5,#7c3aed);color:#fff;border-radius:12px;padding:18px 24px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.title{font-size:20px;font-weight:900}.sub{font-size:11px;opacity:.7;margin-top:2px}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;background:#f8f9ff;border-radius:10px;padding:14px;margin-bottom:18px}
.lbl{font-size:10px;color:#888;font-weight:700;margin-bottom:2px}.val{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
thead tr{background:#4f46e5;color:#fff}th{padding:9px 12px;font-size:11px}td{padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px}
.totals{display:flex;justify-content:flex-end}.totals-box{width:220px}
.trow{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#555}
.grand{font-size:15px;font-weight:900;color:#4f46e5;padding:8px;background:#f0f0ff;border-radius:8px;margin-top:4px;display:flex;justify-content:space-between}
.footer{text-align:center;margin-top:22px;font-size:11px;color:#bbb;border-top:1px dashed #eee;padding-top:12px}
.noprint{text-align:center;margin-top:14px}.btn{padding:9px 24px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px}
@media print{.noprint{display:none}body{padding:8px}}
</style></head><body>
<div class="banner"><div><div class="title">فاتورة مبيعات</div><div class="sub">SALES INVOICE — ${inv.invoiceNumber}</div></div></div>
<div class="meta">
  <div><div class="lbl">العميل</div><div class="val">${inv.customerName || '—'}</div></div>
  <div><div class="lbl">الهاتف</div><div class="val">${inv.customerPhone || '—'}</div></div>
  <div><div class="lbl">التاريخ</div><div class="val">${formatDate(inv.date)}</div></div>
  <div><div class="lbl">طريقة الدفع</div><div class="val">${methodLabel(inv.paymentMethod)}</div></div>
  <div><div class="lbl">الحالة</div><div class="val">${statusLabel(inv.paymentStatus)}</div></div>
  ${inv.notes ? `<div><div class="lbl">ملاحظات</div><div class="val">${inv.notes}</div></div>` : ''}
</div>
<table><thead><tr><th style="width:32px;text-align:center">#</th><th>الوصف</th><th style="text-align:center">الكمية</th><th style="text-align:center">السعر</th><th style="text-align:center">الإجمالي</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="totals"><div class="totals-box">
  ${Number(inv.discount) > 0 ? `<div class="trow" style="color:#10b981"><span>الخصم:</span><span>- IQD ${Number(inv.discount).toLocaleString()}</span></div>` : ''}
  ${Number(inv.tax) > 0 ? `<div class="trow" style="color:#f59e0b"><span>الضريبة:</span><span>+ IQD ${Number(inv.tax).toLocaleString()}</span></div>` : ''}
  <div class="grand"><span>الإجمالي:</span><span>IQD ${Number(inv.total).toLocaleString()}</span></div>
</div></div>
<div class="footer">شكراً لتعاملكم معنا</div>
<div class="noprint"><button class="btn" onclick="window.print()">طباعة الفاتورة</button></div>
</body></html>`);
  win.document.close();
}

// ─── Load Data ─────────────────────────────────────────────
async function loadInvoices() {
  loading.value = true;
  try {
    const { data } = await api.get('/invoices');
    invoices.value = data.map((inv: any) => ({
      ...inv,
      itemsCount: inv.items?.length || 0,
    }));
  } catch {}
  loading.value = false;
}

onMounted(loadInvoices);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
