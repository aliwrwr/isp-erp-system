<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl font-bold text-secondary">إدارة الأقسام</h2>
        <p class="text-sm text-gray-400 mt-1">إجمالي الأقسام: {{ departments.length }}</p>
      </div>
      <button v-if="auth.isSuperAdmin" @click="openAddModal" class="bg-hr hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md shadow-purple-200">
        <i class="fas fa-plus-circle"></i> إضافة قسم جديد
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center"><i class="fas fa-building text-hr text-lg"></i></div>
        <div><p class="text-xs text-gray-400">الأقسام</p><p class="text-lg font-bold text-secondary">{{ departments.length }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"><i class="fas fa-users text-blue-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">إجمالي الموظفين</p><p class="text-lg font-bold text-secondary">{{ totalEmployees }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"><i class="fas fa-chart-bar text-green-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">أكبر قسم</p><p class="text-lg font-bold text-secondary">{{ largestDept }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center"><i class="fas fa-user-tie text-amber-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">المتوسط/قسم</p><p class="text-lg font-bold text-secondary">{{ avgPerDept }}</p></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <i class="fas fa-spinner fa-spin text-3xl text-hr mb-3 block"></i>
      <p class="text-gray-400 text-sm">جاري التحميل...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="departments.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-100">
      <i class="fas fa-folder-open text-4xl text-gray-200 mb-3 block"></i>
      <p class="text-gray-400">لا يوجد أقسام حالياً</p>
      <button v-if="auth.isSuperAdmin" @click="openAddModal" class="mt-4 bg-hr text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">إضافة أول قسم</button>
    </div>

    <!-- Department Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="dept in departments" :key="dept.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-100 transition-all duration-300 group">
        <!-- Card Header -->
        <div class="bg-gradient-to-l from-purple-50 to-white px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-hr to-purple-400 flex items-center justify-center text-white shadow-sm">
              <i :class="getDeptIcon(dept.name)" class="text-base"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary text-sm">{{ dept.name }}</h3>
              <p class="text-[11px] text-gray-400">{{ dept.employees?.length || 0 }} موظف</p>
            </div>
          </div>
          <div v-if="auth.isSuperAdmin" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openEditModal(dept)" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition" title="تعديل">
              <i class="fas fa-pen text-xs"></i>
            </button>
            <button @click="confirmDelete(dept)" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4 space-y-3">
          <p class="text-sm text-gray-400 leading-relaxed min-h-[40px]">{{ dept.description || 'لا يوجد وصف' }}</p>

          <!-- Manager -->
          <div class="flex items-center gap-2">
            <i class="fas fa-user-shield text-xs text-hr"></i>
            <span class="text-xs text-gray-500">المدير:</span>
            <span class="text-xs font-semibold text-secondary">{{ dept.manager || 'غير محدد' }}</span>
          </div>

          <!-- Permissions -->
          <div v-if="dept.permissions?.length">
            <div class="flex items-center gap-1.5 mb-2">
              <i class="fas fa-shield-alt text-xs text-hr"></i>
              <span class="text-[11px] text-gray-500 font-semibold">الصلاحيات:</span>
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="perm in dept.permissions" :key="perm"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
                :class="getPermColor(perm)">
                <i :class="getPermIcon(perm)" class="text-[8px]"></i>
                {{ getPermLabel(perm) }}
              </span>
            </div>
          </div>

          <!-- Employee Count Bar -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] text-gray-400">عدد الموظفين</span>
              <span class="text-xs font-bold text-hr">{{ dept.employees?.length || 0 }}</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-l from-hr to-purple-400 rounded-full transition-all duration-500"
                :style="{ width: getBarWidth(dept.employees?.length || 0) + '%' }"></div>
            </div>
          </div>

          <!-- Employee Avatars -->
          <div v-if="dept.employees?.length" class="flex items-center gap-1 pt-1">
            <div v-for="(emp, i) in dept.employees.slice(0, 5)" :key="i"
              class="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-500 -ml-1.5 first:ml-0 border-2 border-white"
              :title="emp.name">
              {{ emp.name?.charAt(0) }}
            </div>
            <span v-if="dept.employees.length > 5" class="text-[10px] text-gray-400 mr-1">+{{ dept.employees.length - 5 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden max-h-[90vh] flex flex-col" @click.stop>
          <div class="bg-gradient-to-l from-hr to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-white font-bold text-base">{{ editingDept ? 'تعديل القسم' : 'إضافة قسم جديد' }}</h3>
            <button @click="showModal = false" class="text-white/70 hover:text-white transition"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveDept" class="p-6 space-y-4 overflow-y-auto">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم القسم <span class="text-red-400">*</span></label>
              <input v-model="form.name" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" placeholder="مثال: قسم الشبكات" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">المدير المسؤول</label>
              <input v-model="form.manager" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" placeholder="اسم المدير" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">الوصف</label>
              <textarea v-model="form.description" rows="2" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr resize-none" placeholder="وصف مختصر عن القسم ومهامه..."></textarea>
            </div>

            <!-- Permissions Section -->
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-3">
                <i class="fas fa-shield-alt text-hr ml-1"></i> صلاحيات القسم
              </label>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div v-for="group in permissionGroups" :key="group.key" class="space-y-2">
                  <div class="flex items-center gap-2 mb-1">
                    <i :class="group.icon" class="text-xs" :style="{ color: group.color }"></i>
                    <span class="text-xs font-bold text-secondary">{{ group.label }}</span>
                    <button type="button" @click="toggleGroup(group.key)" class="text-[10px] text-hr hover:underline mr-auto">{{ isGroupAllSelected(group.key) ? 'إلغاء الكل' : 'تحديد الكل' }}</button>
                  </div>
                  <div class="grid grid-cols-2 gap-2 pr-5">
                    <label v-for="perm in group.items" :key="perm.value"
                      class="flex items-center gap-2 cursor-pointer group/perm">
                      <input type="checkbox" :value="perm.value" v-model="form.permissions"
                        class="w-4 h-4 rounded border-gray-300 text-hr focus:ring-hr/30 cursor-pointer" />
                      <span class="text-xs text-gray-600 group-hover/perm:text-secondary transition">{{ perm.label }}</span>
                    </label>
                  </div>
                </div>
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5"><i class="fas fa-info-circle"></i> حدد ما يمكن لموظفي هذا القسم الوصول إليه</p>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="flex-1 bg-hr hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ editingDept ? 'حفظ التعديلات' : 'إضافة القسم' }}
              </button>
              <button type="button" @click="showModal = false" class="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition">إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDeleteConfirm = false">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 text-center" @click.stop>
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h3 class="font-bold text-secondary text-base mb-2">تأكيد الحذف</h3>
          <p class="text-sm text-gray-400 mb-1">هل أنت متأكد من حذف قسم</p>
          <p class="font-bold text-secondary mb-1">{{ deletingDept?.name }}؟</p>
          <p v-if="deletingDept?.employees?.length" class="text-xs text-red-400 mb-4">
            <i class="fas fa-exclamation-circle"></i> يحتوي على {{ deletingDept.employees.length }} موظف
          </p>
          <div class="flex gap-3 mt-4">
            <button @click="deleteDept" :disabled="saving" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-trash-alt"></i> حذف
            </button>
            <button @click="showDeleteConfirm = false" class="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">إلغاء</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

interface Employee {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  manager: string;
  permissions: string[];
  employees: Employee[];
}

const departments = ref<Department[]>([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const editingDept = ref<Department | null>(null);
const deletingDept = ref<Department | null>(null);

const form = ref<{ name: string; description: string; manager: string; permissions: string[] }>({ name: '', description: '', manager: '', permissions: [] });

// Permission definitions
const permissionGroups = [
  {
    key: 'internet',
    label: 'نظام الإنترنت',
    icon: 'fas fa-wifi',
    color: '#2980B9',
    items: [
      { value: 'internet.subscribers', label: 'المشتركين' },
      { value: 'internet.packages', label: 'الباقات' },
      { value: 'internet.subscriptions', label: 'الاشتراكات' },
      { value: 'internet.routers', label: 'الراوترات' },
      { value: 'internet.payments', label: 'المدفوعات' },
      { value: 'internet.reports', label: 'التقارير' },
      { value: 'internet.managers', label: 'المدراء' },
      { value: 'internet.log', label: 'سجل العمليات' },
      { value: 'internet.whatsapp', label: 'واتساب' },
      { value: 'internet.settings', label: 'الإعدادات' },
    ],
  },
  {
    key: 'sales',
    label: 'نظام المبيعات',
    icon: 'fas fa-cash-register',
    color: '#27AE60',
    items: [
      { value: 'sales.pos', label: 'نقطة البيع' },
      { value: 'sales.products', label: 'المنتجات' },
      { value: 'sales.customers', label: 'العملاء' },
      { value: 'sales.categories', label: 'التصنيفات' },
      { value: 'sales.invoices', label: 'الفواتير' },
      { value: 'sales.expenses', label: 'المصروفات' },
      { value: 'sales.inventory', label: 'المخزون' },
      { value: 'sales.suppliers', label: 'الموردين' },
    ],
  },
  {
    key: 'hr',
    label: 'شؤون الموظفين',
    icon: 'fas fa-users',
    color: '#8E44AD',
    items: [
      { value: 'hr.employees', label: 'الموظفين' },
      { value: 'hr.departments', label: 'الأقسام' },
      { value: 'hr.attendance', label: 'الحضور' },
      { value: 'hr.salaries', label: 'الرواتب' },
    ],
  },
  {
    key: 'support',
    label: 'الدعم الفني',
    icon: 'fas fa-headset',
    color: '#E67E22',
    items: [
      { value: 'support.tickets', label: 'التذاكر' },
      { value: 'support.technicians', label: 'الفنيين' },
    ],
  },
  {
    key: 'messaging',
    label: 'الرسائل',
    icon: 'fas fa-envelope',
    color: '#16A085',
    items: [
      { value: 'messaging.send', label: 'إرسال رسائل' },
      { value: 'messaging.templates', label: 'القوالب' },
      { value: 'messaging.history', label: 'السجل' },
    ],
  },
  {
    key: 'restaurant',
    label: 'نظام المطاعم',
    icon: 'fas fa-utensils',
    color: '#D35400',
    items: [
      { value: 'restaurant.menu', label: 'قائمة الطعام' },
      { value: 'restaurant.tables', label: 'الطاولات' },
      { value: 'restaurant.orders', label: 'الطلبات' },
      { value: 'restaurant.kitchen', label: 'المطبخ' },
      { value: 'restaurant.reservations', label: 'الحجوزات' },
      { value: 'restaurant.expenses', label: 'المصروفات' },
      { value: 'restaurant.reports', label: 'التقارير' },
    ],
  },
];

const allPermItems = permissionGroups.flatMap(g => g.items);

function toggleGroup(groupKey: string) {
  const group = permissionGroups.find(g => g.key === groupKey);
  if (!group) return;
  const groupValues = group.items.map(i => i.value);
  const allSelected = groupValues.every(v => form.value.permissions.includes(v));
  if (allSelected) {
    form.value.permissions = form.value.permissions.filter(p => !groupValues.includes(p));
  } else {
    const newPerms = new Set([...form.value.permissions, ...groupValues]);
    form.value.permissions = [...newPerms];
  }
}

function isGroupAllSelected(groupKey: string) {
  const group = permissionGroups.find(g => g.key === groupKey);
  if (!group) return false;
  return group.items.every(i => form.value.permissions.includes(i.value));
}

function getPermLabel(perm: string) {
  return allPermItems.find(i => i.value === perm)?.label || perm;
}

function getPermIcon(perm: string) {
  const groupKey = perm.split('.')[0];
  return permissionGroups.find(g => g.key === groupKey)?.icon || 'fas fa-check';
}

function getPermColor(perm: string) {
  const groupKey = perm.split('.')[0];
  const colors: Record<string, string> = {
    internet: 'bg-blue-50 text-blue-700',
    sales: 'bg-green-50 text-green-700',
    hr: 'bg-purple-50 text-purple-700',
    support: 'bg-orange-50 text-orange-700',
    messaging: 'bg-teal-50 text-teal-700',
    restaurant: 'bg-orange-50 text-orange-700',
  };
  return colors[groupKey] || 'bg-gray-50 text-gray-700';
}

const totalEmployees = computed(() => departments.value.reduce((sum, d) => sum + (d.employees?.length || 0), 0));
const largestDept = computed(() => {
  if (!departments.value.length) return '—';
  const max = departments.value.reduce((a, b) => (a.employees?.length || 0) >= (b.employees?.length || 0) ? a : b);
  return max.name;
});
const avgPerDept = computed(() => {
  if (!departments.value.length) return '0';
  return Math.round(totalEmployees.value / departments.value.length);
});

function getBarWidth(count: number) {
  const max = Math.max(...departments.value.map(d => d.employees?.length || 0), 1);
  return Math.round((count / max) * 100);
}

const deptIcons: Record<string, string> = {
  'الشبكات': 'fas fa-network-wired',
  'المبيعات': 'fas fa-cash-register',
  'المحاسبة': 'fas fa-calculator',
  'الدعم الفني': 'fas fa-headset',
  'الإدارة': 'fas fa-landmark',
  'الموارد البشرية': 'fas fa-users-cog',
  'التسويق': 'fas fa-bullhorn',
  'التطوير': 'fas fa-code',
};
function getDeptIcon(name: string) {
  return deptIcons[name] || 'fas fa-building';
}

function resetForm() {
  form.value = { name: '', description: '', manager: '', permissions: [] };
}

function openAddModal() {
  editingDept.value = null;
  resetForm();
  showModal.value = true;
}

function openEditModal(dept: Department) {
  editingDept.value = dept;
  form.value = {
    name: dept.name,
    description: dept.description || '',
    manager: dept.manager || '',
    permissions: dept.permissions ? [...dept.permissions] : [],
  };
  showModal.value = true;
}

function confirmDelete(dept: Department) {
  deletingDept.value = dept;
  showDeleteConfirm.value = true;
}

async function saveDept() {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || undefined,
      manager: form.value.manager || undefined,
      permissions: form.value.permissions.length ? form.value.permissions : undefined,
    };
    if (editingDept.value) {
      await api.patch(`/departments/${editingDept.value.id}`, payload);
    } else {
      await api.post('/departments', payload);
    }
    showModal.value = false;
    await fetchDepartments();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}

async function deleteDept() {
  if (!deletingDept.value) return;
  saving.value = true;
  try {
    await api.delete(`/departments/${deletingDept.value.id}`);
    showDeleteConfirm.value = false;
    await fetchDepartments();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}

async function fetchDepartments() {
  try {
    const res = await api.get('/departments');
    departments.value = res.data;
  } catch {
    departments.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchDepartments();
});
</script>
