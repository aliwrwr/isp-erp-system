<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl font-bold text-secondary">إدارة الموظفين</h2>
        <p class="text-sm text-gray-400 mt-1">إجمالي الموظفين: {{ employees.length }}</p>
      </div>
      <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.employees.add')" @click="openAddModal" class="bg-hr hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md shadow-purple-200">
        <i class="fas fa-plus-circle"></i> إضافة موظف جديد
      </button>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
        <input v-model="searchQuery" type="text" placeholder="بحث بالاسم أو اسم الدخول أو الهاتف..."
          class="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr transition" />
      </div>
      <select v-model="filterDept" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr transition min-w-[160px]">
        <option value="">جميع الأقسام</option>
        <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
      </select>
      <select v-model="filterStatus" class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr transition min-w-[130px]">
        <option value="">جميع الحالات</option>
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-l from-purple-50 to-gray-50 border-b border-gray-100">
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الاسم الكامل</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">اسم الدخول</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">رقم الهاتف</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">القسم</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">المنصب</th>
              <th class="px-5 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">الراتب</th>
              <th class="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الحالة</th>
              <th class="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading" class="text-center">
              <td colspan="9" class="px-5 py-12 text-gray-400">
                <i class="fas fa-spinner fa-spin text-2xl text-hr mb-2 block"></i>
                جاري التحميل...
              </td>
            </tr>
            <tr v-else-if="filteredEmployees.length === 0" class="text-center">
              <td colspan="9" class="px-5 py-12 text-gray-400">
                <i class="fas fa-users-slash text-3xl mb-2 block"></i>
                لا يوجد موظفين
              </td>
            </tr>
            <tr v-for="(emp, index) in filteredEmployees" :key="emp.id"
              class="hover:bg-purple-50/40 transition-colors duration-150 group">
              <td class="px-5 py-4 text-gray-400 font-mono text-xs">{{ index + 1 }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-hr to-purple-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    {{ emp.name?.charAt(0) }}
                  </div>
                  <span class="font-semibold text-secondary">{{ emp.name }}</span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded text-xs">{{ emp.username || '—' }}</span>
              </td>
              <td class="px-5 py-4 text-gray-600" dir="ltr">{{ emp.phone }}</td>
              <td class="px-5 py-4">
                <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                  <i class="fas fa-building text-[10px]"></i>
                  {{ emp.department?.name || '—' }}
                </span>
              </td>
              <td class="px-5 py-4 text-gray-600">{{ emp.position }}</td>
              <td class="px-5 py-4">
                <span class="font-bold text-hr">{{ formatCurrency(emp.salary) }}</span>
              </td>
              <td class="px-5 py-4 text-center">
                <span :class="statusClass(emp.status)" class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold">
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(emp.status)"></span>
                  {{ statusLabel(emp.status) }}
                </span>
              </td>
              <td class="px-5 py-4">
                <div v-if="auth.isSuperAdmin || auth.hasPermission('hr.employees.edit') || auth.hasPermission('hr.employees.delete')" class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.employees.edit')" @click="openEditModal(emp)" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition" title="تعديل">
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.employees.delete')" @click="confirmDelete(emp)" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer -->
      <div v-if="filteredEmployees.length > 0" class="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>عرض {{ filteredEmployees.length }} من {{ employees.length }} موظف</span>
        <span>آخر تحديث: {{ lastUpdate }}</span>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden" @click.stop>
          <div class="bg-gradient-to-l from-hr to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-white font-bold text-base">{{ editingEmployee ? 'تعديل موظف' : 'إضافة موظف جديد' }}</h3>
            <button @click="showModal = false" class="text-white/70 hover:text-white transition"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveEmployee" class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">الاسم الكامل <span class="text-red-400">*</span></label>
                <input v-model="form.name" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم الدخول</label>
                <input v-model="form.username" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" />
              </div>
            </div>
            <div v-if="!editingEmployee" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">كلمة المرور <span class="text-red-400">*</span></label>
                <div class="relative">
                  <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr pl-9" />
                  <button type="button" @click="showPassword = !showPassword" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-xs"></i>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">تأكيد كلمة المرور <span class="text-red-400">*</span></label>
                <input v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" :class="{'border-red-300 focus:ring-red-200 focus:border-red-400': form.confirmPassword && form.password !== form.confirmPassword}" />
                <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-[11px] text-red-400 mt-1"><i class="fas fa-exclamation-circle"></i> كلمة المرور غير متطابقة</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف <span class="text-red-400">*</span></label>
                <input v-model="form.phone" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" dir="ltr" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">القسم</label>
                <select v-model="form.departmentId" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr">
                  <option value="">اختر القسم</option>
                  <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">المنصب <span class="text-red-400">*</span></label>
                <input v-model="form.position" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">الراتب <span class="text-red-400">*</span></label>
                <input v-model.number="form.salary" type="number" required min="0" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" dir="ltr" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">العنوان</label>
                <input v-model="form.address" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">تاريخ التعيين</label>
                <input v-model="form.hireDate" type="date" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" dir="ltr" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">الحالة</label>
              <select v-model="form.status" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr">
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
              </select>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="flex-1 bg-hr hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف' }}
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
          <p class="text-sm text-gray-400 mb-5">هل أنت متأكد من حذف <span class="font-bold text-secondary">{{ deletingEmployee?.name }}</span>؟</p>
          <div class="flex gap-3">
            <button @click="deleteEmployee" :disabled="saving" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
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

interface Department {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  username: string;
  phone: string;
  address: string;
  department: Department | null;
  position: string;
  salary: number;
  hireDate: string;
  status: string;
}

const employees = ref<Employee[]>([]);
const departments = ref<Department[]>([]);
const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const filterDept = ref('');
const filterStatus = ref('');
const showModal = ref(false);
const showDeleteConfirm = ref(false);
const editingEmployee = ref<Employee | null>(null);
const deletingEmployee = ref<Employee | null>(null);
const lastUpdate = ref('');

const showPassword = ref(false);

const form = ref({
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: '',
  departmentId: '',
  position: '',
  salary: 0,
  hireDate: '',
  status: 'active',
});

const filteredEmployees = computed(() => {
  let list = employees.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.username?.toLowerCase().includes(q) ||
      e.phone?.includes(q)
    );
  }
  if (filterDept.value) {
    list = list.filter(e => e.department?.id === Number(filterDept.value));
  }
  if (filterStatus.value) {
    list = list.filter(e => e.status === filterStatus.value);
  }
  return list;
});

function formatCurrency(val: number) {
  return (val || 0).toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 });
}

function statusClass(status: string) {
  return status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600';
}
function statusDot(status: string) {
  return status === 'active' ? 'bg-emerald-500' : 'bg-red-400';
}
function statusLabel(status: string) {
  return status === 'active' ? 'نشط' : 'غير نشط';
}

function resetForm() {
  form.value = { name: '', username: '', password: '', confirmPassword: '', phone: '', address: '', departmentId: '', position: '', salary: 0, hireDate: '', status: 'active' };
  showPassword.value = false;
}

function openAddModal() {
  editingEmployee.value = null;
  resetForm();
  showModal.value = true;
}

function openEditModal(emp: Employee) {
  editingEmployee.value = emp;
  form.value = {
    name: emp.name,
    username: emp.username || '',
    phone: emp.phone,
    address: emp.address || '',
    departmentId: emp.department?.id?.toString() || '',
    position: emp.position,
    salary: emp.salary,
    hireDate: emp.hireDate ? emp.hireDate.split('T')[0] : '',
    status: emp.status || 'active',
  };
  showModal.value = true;
}

function confirmDelete(emp: Employee) {
  deletingEmployee.value = emp;
  showDeleteConfirm.value = true;
}

function buildPayload() {
  const payload: any = {
    name: form.value.name,
    username: form.value.username || undefined,
    phone: form.value.phone,
    address: form.value.address || '',
    position: form.value.position,
    salary: form.value.salary,
    status: form.value.status,
  };
  if (form.value.password && !editingEmployee.value) payload.password = form.value.password;
  if (form.value.hireDate) payload.hireDate = form.value.hireDate;
  if (form.value.departmentId) payload.department = { id: Number(form.value.departmentId) };
  return payload;
}

async function saveEmployee() {
  if (!editingEmployee.value && form.value.password !== form.value.confirmPassword) {
    alert('كلمة المرور غير متطابقة');
    return;
  }
  if (!editingEmployee.value && !form.value.password) {
    alert('يرجى إدخال كلمة المرور');
    return;
  }
  saving.value = true;
  try {
    if (editingEmployee.value) {
      await api.patch(`/employees/${editingEmployee.value.id}`, buildPayload());
    } else {
      await api.post('/employees', buildPayload());
    }
    showModal.value = false;
    await fetchEmployees();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}

async function deleteEmployee() {
  if (!deletingEmployee.value) return;
  saving.value = true;
  try {
    await api.delete(`/employees/${deletingEmployee.value.id}`);
    showDeleteConfirm.value = false;
    await fetchEmployees();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}

async function fetchEmployees() {
  try {
    const res = await api.get('/employees');
    employees.value = res.data;
    lastUpdate.value = new Date().toLocaleTimeString('ar-EG');
  } catch {
    employees.value = [];
  } finally {
    loading.value = false;
  }
}

async function fetchDepartments() {
  try {
    const res = await api.get('/departments');
    departments.value = res.data;
  } catch {
    departments.value = [];
  }
}

onMounted(() => {
  fetchEmployees();
  fetchDepartments();
});
</script>
