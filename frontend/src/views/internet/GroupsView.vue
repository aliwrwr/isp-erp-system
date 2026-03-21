<template>
  <div>
    <!-- Toast -->
    <div v-if="toast.show" :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition">
      {{ toast.message }}
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">المجموعات</h2>
      <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة مجموعة
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="search" placeholder="بحث بالاسم أو الوصف..."
        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.size > 0 && paginatedGroups.every(g => selectedIds.has(g.id))"
                  :indeterminate="selectedIds.size > 0 && !paginatedGroups.every(g => selectedIds.has(g.id))"
                  @change="toggleSelectAll" />
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('id')">
                <span class="inline-flex items-center gap-1">#<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='id'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='id'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('name')">
                <span class="inline-flex items-center gap-1">اسم المجموعة<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='name'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='name'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الوصف</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الصلاحيات</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الحالة</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredGroups.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-400">لا توجد مجموعات</td>
            </tr>
            <tr v-for="(g, index) in paginatedGroups" :key="g.id"
              :class="selectedIds.has(g.id) ? 'bg-primary/5' : 'hover:bg-gray-50'"
              class="border-b border-gray-50 transition">
              <td class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.has(g.id)" @change="toggleSelect(g.id)" />
              </td>
              <td class="px-3 py-2.5 text-gray-400 text-xs">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-3 py-2.5 font-semibold text-secondary">{{ g.name }}</td>
              <td class="px-3 py-2.5 text-gray-500 text-xs max-w-[180px] truncate" :title="g.description || ''">{{ g.description || '—' }}</td>
              <td class="px-3 py-2.5">
                <div class="flex flex-wrap gap-1">
                  <span v-for="p in parsePerms(g.permissions)" :key="p"
                    class="bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md px-1.5 py-0.5 text-[10px] font-mono">{{ p }}</span>
                  <span v-if="!parsePerms(g.permissions).length" class="text-gray-400 text-xs">—</span>
                </div>
              </td>
              <td class="px-3 py-2.5">
                <span :class="g.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ g.active ? 'نشطة' : 'معطّلة' }}
                </span>
              </td>
              <td class="px-3 py-2.5">
                <div class="flex gap-1">
                  <button @click="openEdit(g)" class="text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg text-xs transition">تعديل</button>
                  <button @click="remove(g.id)" class="text-danger hover:bg-danger/10 px-2.5 py-1 rounded-lg text-xs transition">حذف</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">««</button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">«</button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage ? 'bg-primary border-primary text-white shadow-sm' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">{{ p }}</button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">»</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">»»</button>
        </div>
        <div class="flex items-center gap-1">
          <button v-for="size in [5, 10, 50, 100]" :key="size" @click="pageSize = size; currentPage = 1"
            class="w-10 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
            :class="pageSize === size ? 'bg-gray-200 border-gray-300 text-gray-600' : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'">{{ size }}</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل مجموعة' : 'إضافة مجموعة جديدة' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-5 space-y-4 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">اسم المجموعة <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الوصف</label>
              <input v-model="form.description" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <!-- Permissions checklist -->
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-2">الصلاحيات</label>
            <div class="border border-gray-200 rounded-xl overflow-hidden">
              <div v-for="(group, idx) in permissionGroups" :key="idx" class="border-b border-gray-100 last:border-b-0">
                <div class="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer" @click="togglePermGroup(idx)">
                  <span class="text-xs font-semibold text-gray-600 flex items-center gap-2">
                    <i :class="group.icon" class="text-gray-400 w-3.5 text-center"></i>{{ group.label }}
                  </span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-gray-400">{{ selectedFromGroup(group).length }}/{{ group.perms.length }}</span>
                    <i class="fas text-gray-400 text-xs" :class="expandedGroups.has(idx) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                  </div>
                </div>
                <div v-if="expandedGroups.has(idx)" class="px-3 py-2 grid grid-cols-2 gap-1.5">
                  <label v-for="perm in group.perms" :key="perm.key"
                    class="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 hover:bg-gray-50 transition">
                    <input type="checkbox" class="w-3.5 h-3.5 accent-primary rounded"
                      :checked="selectedPerms.has(perm.key)"
                      @change="togglePerm(perm.key)" />
                    <span class="text-xs text-gray-600">{{ perm.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="form.active" type="checkbox" id="grpActive" class="w-4 h-4 accent-primary" />
            <label for="grpActive" class="text-sm text-gray-600">مجموعة نشطة</label>
          </div>
        </div>
        <div class="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          <button @click="save" :disabled="saving"
            class="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-60">
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

interface Group { id: number; name: string; description?: string; permissions?: string; active: boolean; }

const groups = ref<Group[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedIds = ref<Set<number>>(new Set());
const sortKey = ref('');
const sortDir = ref<'asc' | 'desc'>('asc');
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' });
const form = ref({ name: '', description: '', active: true });
const selectedPerms = ref<Set<string>>(new Set());
const expandedGroups = ref<Set<number>>(new Set([0]));

// All available permissions organized by module
const permissionGroups = [
  { label: 'الاشتراكات', icon: 'fas fa-wifi', perms: [
    { key: 'internet.subscribers', label: 'المشتركين' },
    { key: 'internet.connected', label: 'المتصلين' },
    { key: 'internet.packages', label: 'الباقات' },
    { key: 'internet.subscriptions', label: 'الاشتراكات' },
    { key: 'internet.routers', label: 'الراوترات' },
    { key: 'internet.reports', label: 'التقارير' },
    { key: 'internet.managers', label: 'المدراء' },
    { key: 'internet.groups', label: 'المجموعات' },
    { key: 'internet.permissions', label: 'الصلاحيات' },
    { key: 'internet.log', label: 'سجل العمليات' },
    { key: 'internet.settings', label: 'الإعدادات' },
    { key: 'internet.whatsapp', label: 'واتساب' },
  ]},
  { label: 'المبيعات', icon: 'fas fa-cash-register', perms: [
    { key: 'sales.pos', label: 'نقطة البيع' },
    { key: 'sales.products', label: 'المنتجات' },
    { key: 'sales.categories', label: 'التصنيفات' },
    { key: 'sales.invoices', label: 'الفواتير' },
    { key: 'sales.expenses', label: 'المصروفات' },
    { key: 'sales.inventory', label: 'المخزون' },
    { key: 'sales.suppliers', label: 'الموردين' },
    { key: 'sales.customers', label: 'العملاء' },
  ]},
  { label: 'الموظفين', icon: 'fas fa-users-cog', perms: [
    { key: 'hr.employees', label: 'الموظفين' },
    { key: 'hr.departments', label: 'الأقسام' },
    { key: 'hr.attendance', label: 'الحضور' },
    { key: 'hr.salaries', label: 'الرواتب' },
  ]},
  { label: 'الدعم الفني', icon: 'fas fa-headset', perms: [
    { key: 'support.tickets', label: 'التذاكر' },
    { key: 'support.technicians', label: 'الفنيين' },
  ]},
  { label: 'الرسائل', icon: 'fas fa-comment-dots', perms: [
    { key: 'messaging.whatsapp_internet', label: 'واتساب الاشتراكات' },
    { key: 'messaging.whatsapp_installments', label: 'واتساب الأقساط' },
    { key: 'messaging.whatsapp_support', label: 'واتساب الدعم' },
    { key: 'messaging.history', label: 'السجل' },
  ]},
  { label: 'المطاعم', icon: 'fas fa-utensils', perms: [
    { key: 'restaurant.menu', label: 'قائمة الطعام' },
    { key: 'restaurant.orders', label: 'الطلبات' },
    { key: 'restaurant.kitchen', label: 'المطبخ' },
    { key: 'restaurant.reports', label: 'التقارير' },
    { key: 'restaurant.expenses', label: 'المصروفات' },
    { key: 'restaurant.settings', label: 'الإعدادات' },
  ]},
  { label: 'الأقساط', icon: 'fas fa-hand-holding-usd', perms: [
    { key: 'installments.customers', label: 'العملاء' },
    { key: 'installments.contracts', label: 'العقود' },
    { key: 'installments.payments', label: 'الدفعات' },
    { key: 'installments.reports', label: 'التقارير' },
  ]},
];

function parsePerms(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

function selectedFromGroup(group: typeof permissionGroups[0]) {
  return group.perms.filter(p => selectedPerms.value.has(p.key));
}

function togglePermGroup(idx: number) {
  const s = new Set(expandedGroups.value);
  s.has(idx) ? s.delete(idx) : s.add(idx);
  expandedGroups.value = s;
}

function togglePerm(key: string) {
  const s = new Set(selectedPerms.value);
  s.has(key) ? s.delete(key) : s.add(key);
  selectedPerms.value = s;
}

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'asc'; }
  currentPage.value = 1;
}

const filteredGroups = computed(() => {
  const q = search.value.trim().toLowerCase();
  let list = q ? groups.value.filter(g => g.name?.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) : [...groups.value];
  if (sortKey.value) {
    const k = sortKey.value, d = sortDir.value === 'asc' ? 1 : -1;
    list = list.slice().sort((a: any, b: any) => String(a[k] ?? '').localeCompare(String(b[k] ?? ''), 'ar') * d);
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredGroups.value.length / pageSize.value)));
const paginatedGroups = computed(() => filteredGroups.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value));
const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2), end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value); s.has(id) ? s.delete(id) : s.add(id); selectedIds.value = s;
}
function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  const s = new Set(selectedIds.value);
  for (const g of paginatedGroups.value) checked ? s.add(g.id) : s.delete(g.id);
  selectedIds.value = s;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

async function loadData() {
  try { const { data } = await api.get('/groups'); groups.value = data; } catch {}
}

function openAdd() {
  editingId.value = null;
  form.value = { name: '', description: '', active: true };
  selectedPerms.value = new Set();
  showModal.value = true;
}
function openEdit(g: Group) {
  editingId.value = g.id;
  form.value = { name: g.name, description: g.description || '', active: g.active !== false };
  selectedPerms.value = new Set(parsePerms(g.permissions));
  showModal.value = true;
}

async function save() {
  if (!form.value.name.trim()) { showToast('اسم المجموعة مطلوب', 'error'); return; }
  saving.value = true;
  try {
    const payload = { ...form.value, permissions: [...selectedPerms.value].join(',') };
    if (editingId.value) {
      await api.patch(`/groups/${editingId.value}`, payload);
      showToast('تم تعديل المجموعة بنجاح');
    } else {
      await api.post('/groups', payload);
      showToast('تم إضافة المجموعة بنجاح');
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
  if (!confirm('هل أنت متأكد من حذف هذه المجموعة؟')) return;
  try {
    await api.delete(`/groups/${id}`);
    showToast('تم حذف المجموعة بنجاح');
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ'), 'error');
  }
}

onMounted(loadData);
</script>
