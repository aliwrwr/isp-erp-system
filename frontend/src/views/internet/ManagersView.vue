<template>
  <div>
    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition"
    >
      {{ toast.message }}
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">المدراء</h2>
      <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة مدير
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="search"
        placeholder="بحث بالاسم أو الهاتف أو المنصب..."
        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.size > 0 && paginatedManagers.every(m => selectedIds.has(m.id))"
                  :indeterminate="selectedIds.size > 0 && !paginatedManagers.every(m => selectedIds.has(m.id))"
                  @change="toggleSelectAll" />
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">#</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('username')">
                <span class="inline-flex items-center gap-1">اسم الدخول<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='username'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='username'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('name')">
                <span class="inline-flex items-center gap-1">الاسم الكامل<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='name'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='name'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('balance')">
                <span class="inline-flex items-center gap-1">الرصيد<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='balance'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='balance'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('loans')">
                <span class="inline-flex items-center gap-1">القروض<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='loans'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='loans'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الصلاحيات</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">تابع الى</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('subscriberCount')">
                <span class="inline-flex items-center gap-1">عدد المشتركين<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='subscriberCount'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='subscriberCount'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('points')">
                <span class="inline-flex items-center gap-1">النقاط<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='points'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='points'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredManagers.length === 0">
              <td colspan="11" class="text-center py-12 text-gray-400">لا يوجد مدراء</td>
            </tr>
            <tr
              v-for="(m, index) in paginatedManagers"
              :key="m.id"
              :class="selectedIds.has(m.id) ? 'bg-primary/5' : 'hover:bg-gray-50'"
              class="border-b border-gray-50 transition"
            >
              <td class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.has(m.id)"
                  @change="toggleSelect(m.id)" />
              </td>
              <td class="px-3 py-3 text-gray-400">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-3 py-3 font-mono text-indigo-700 font-semibold">{{ m.username || '—' }}</td>
              <td class="px-3 py-3 font-medium text-secondary">{{ m.name }}</td>
              <td class="px-3 py-3 text-green-700 font-semibold">{{ fmtNum(m.balance) }}</td>
              <td class="px-3 py-3 text-red-600 font-semibold">{{ fmtNum(m.loans) }}</td>
              <td class="px-3 py-3 text-gray-600 max-w-[140px] truncate" :title="m.permissions || ''">{{ m.permissions || '—' }}</td>
              <td class="px-3 py-3 text-gray-600">{{ getParentName(m.parentId) }}</td>
              <td class="px-3 py-3">
                <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{{ m.subscriberCount ?? 0 }}</span>
              </td>
              <td class="px-3 py-3 text-amber-600 font-semibold">{{ fmtNum(m.points) }}</td>
              <td class="px-3 py-3">
                <div class="flex gap-1">
                  <button @click="openEdit(m)" class="text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg text-xs transition">تعديل</button>
                  <button @click="remove(m.id)" class="text-danger hover:bg-danger/10 px-2.5 py-1 rounded-lg text-xs transition">حذف</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            ««
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            «
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage
                ? 'bg-primary border-primary text-white shadow-sm shadow-primary/30'
                : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »»
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button v-for="size in [5, 10, 50, 100, 500]" :key="size"
            @click="pageSize = size; currentPage = 1"
            class="w-10 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
            :class="pageSize === size
              ? 'bg-gray-200 border-gray-300 text-gray-600'
              : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'">
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل مدير' : 'إضافة مدير جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div class="grid grid-cols-2 gap-4">
            <!-- اسم الدخول -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">اسم الدخول</label>
              <input v-model="form.username" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono" placeholder="username" />
            </div>
            <!-- الاسم الكامل -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الاسم الكامل <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- الرصيد -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الرصيد</label>
              <input v-model.number="form.balance" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- القروض -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">القروض</label>
              <input v-model.number="form.loans" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- الصلاحيات -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">الصلاحيات</label>
              <input v-model="form.permissions" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="مثال: internet.subscribers, internet.managers" />
            </div>
            <!-- تابع الى -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">تابع الى</label>
              <select v-model="form.parentId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option :value="null">— بدون —</option>
                <option v-for="mgr in managers.filter(mg => mg.id !== editingId)" :key="mgr.id" :value="mgr.id">
                  {{ mgr.name }}{{ mgr.username ? ` (${mgr.username})` : '' }}
                </option>
              </select>
            </div>
            <!-- النقاط -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">النقاط</label>
              <input v-model.number="form.points" type="number" step="0.01" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- الهاتف -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الهاتف</label>
              <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- البريد -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
              <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- المنصب -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">المنصب</label>
              <input v-model="form.position" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <!-- نشط -->
            <div class="flex items-center gap-2 mt-2">
              <input v-model="form.active" type="checkbox" id="activeCheck" class="w-4 h-4 accent-primary" />
              <label for="activeCheck" class="text-sm text-gray-600">نشط</label>
            </div>
            <!-- ملاحظات -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          <button
            @click="save"
            :disabled="saving"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-60"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            حفظ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { logActivity } from '../../utils/activityLog';

const managers = ref<any[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const toast = ref({ show: false, message: '', type: 'success' });
const selectedIds = ref<Set<number>>(new Set());

const form = ref({
  username: '', name: '', balance: 0, loans: 0,
  permissions: '', parentId: null as number | null, points: 0,
  phone: '', email: '', position: '', notes: '', active: true,
});

function fmtNum(v: any): string {
  const n = parseFloat(v);
  if (!v && v !== 0) return '—';
  if (isNaN(n)) return '—';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function getParentName(parentId: number | null): string {
  if (!parentId) return '—';
  const p = managers.value.find(m => m.id === parentId);
  return p ? (p.name + (p.username ? ` (${p.username})` : '')) : '—';
}

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedIds.value = s;
}

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  const s = new Set(selectedIds.value);
  for (const m of paginatedManagers.value) {
    checked ? s.add(m.id) : s.delete(m.id);
  }
  selectedIds.value = s;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

const sortKey = ref<string>('');
const sortDir = ref<'asc' | 'desc'>('asc');

function setSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
  currentPage.value = 1;
}

const filteredManagers = computed(() => {
  const q = search.value.trim().toLowerCase();
  let list = q
    ? managers.value.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q)
      )
    : [...managers.value];

  if (sortKey.value) {
    const key = sortKey.value;
    const dir = sortDir.value === 'asc' ? 1 : -1;
    list = list.slice().sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'ar') * dir;
    });
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredManagers.value.length / pageSize.value)));

const paginatedManagers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredManagers.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

async function loadData() {
  try {
    const { data } = await api.get('/managers');
    managers.value = data;
  } catch {}
}

function openAdd() {
  editingId.value = null;
  form.value = { username: '', name: '', balance: 0, loans: 0, permissions: '', parentId: null, points: 0, phone: '', email: '', position: '', notes: '', active: true };
  showModal.value = true;
}

function openEdit(m: any) {
  editingId.value = m.id;
  form.value = {
    username: m.username || '',
    name: m.name || '',
    balance: parseFloat(m.balance) || 0,
    loans: parseFloat(m.loans) || 0,
    permissions: m.permissions || '',
    parentId: m.parentId || null,
    points: parseFloat(m.points) || 0,
    phone: m.phone || '',
    email: m.email || '',
    position: m.position || '',
    notes: m.notes || '',
    active: m.active !== false,
  };
  showModal.value = true;
}

async function save() {
  if (!form.value.name.trim()) {
    showToast('الاسم مطلوب', 'error');
    return;
  }
  saving.value = true;
  try {
    const payload = { ...form.value };
    if (editingId.value) {
      await api.patch(`/managers/${editingId.value}`, payload);
      logActivity({ action: 'edit_manager', module: 'manager', subscriberName: form.value.name, details: `تعديل بيانات المدير: ${form.value.name}` });
      showToast('تم تعديل المدير بنجاح');
    } else {
      await api.post('/managers', payload);
      logActivity({ action: 'add_manager', module: 'manager', subscriberName: form.value.name, details: `إضافة مدير جديد: ${form.value.name}` });
      showToast('تم إضافة المدير بنجاح');
    }
    showModal.value = false;
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المدير؟')) return;
  const mgr = managers.value.find(m => m.id === id);
  try {
    await api.delete(`/managers/${id}`);
    if (mgr) logActivity({ action: 'delete_manager', module: 'manager', subscriberName: mgr.name, details: `حذف المدير: ${mgr.name}` });
    showToast('تم حذف المدير بنجاح');
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ'), 'error');
  }
}

onMounted(loadData);
</script>
