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
              <th class="text-right px-4 py-3 font-semibold text-gray-500">#</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">الاسم</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">الهاتف</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">البريد الإلكتروني</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">المنصب</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">الحالة</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredManagers.length === 0">
              <td colspan="7" class="text-center py-12 text-gray-400">لا يوجد مدراء</td>
            </tr>
            <tr
              v-for="(m, index) in paginatedManagers"
              :key="m.id"
              class="border-b border-gray-50 hover:bg-gray-50 transition"
            >
              <td class="px-4 py-3 text-gray-400">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-4 py-3 font-medium text-secondary">{{ m.name }}</td>
              <td class="px-4 py-3 text-gray-600">{{ m.phone || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ m.email || '—' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ m.position || '—' }}</td>
              <td class="px-4 py-3">
                <span
                  :class="m.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                  class="px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  {{ m.active ? 'نشط' : 'غير نشط' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="openEdit(m)" class="text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg text-xs transition">تعديل</button>
                  <button @click="remove(m.id)" class="text-danger hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs transition">حذف</button>
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
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل مدير' : 'إضافة مدير جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">الاسم <span class="text-red-500">*</span></label>
              <input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الهاتف</label>
              <input v-model="form.phone" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
              <input v-model="form.email" type="email" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">المنصب</label>
              <input v-model="form.position" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div class="flex items-center gap-2 mt-2">
              <input v-model="form.active" type="checkbox" id="activeCheck" class="w-4 h-4 accent-primary" />
              <label for="activeCheck" class="text-sm text-gray-600">نشط</label>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">ملاحظات</label>
              <textarea v-model="form.notes" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
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
const form = ref({ name: '', phone: '', email: '', position: '', notes: '', active: true });

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

const filteredManagers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return managers.value;
  return managers.value.filter(m =>
    m.name?.toLowerCase().includes(q) ||
    m.phone?.toLowerCase().includes(q) ||
    m.position?.toLowerCase().includes(q)
  );
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
  form.value = { name: '', phone: '', email: '', position: '', notes: '', active: true };
  showModal.value = true;
}

function openEdit(m: any) {
  editingId.value = m.id;
  form.value = {
    name: m.name || '',
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
