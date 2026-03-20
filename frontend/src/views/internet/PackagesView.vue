<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">إدارة الباقات</h2>
      <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة باقة
      </button>
    </div>

    <!-- Error / Success Toast -->
    <div v-if="toast.show" :class="['fixed top-5 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition', toast.type === 'error' ? 'bg-red-500' : 'bg-green-500']">
      {{ toast.message }}
    </div>

    <div v-if="packages.length === 0" class="text-center py-16 text-gray-400">
      <i class="fas fa-box-open text-4xl mb-3"></i>
      <p>لا توجد باقات بعد. أضف أول باقة!</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="pkg in packages" :key="pkg.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-secondary">{{ pkg.name }}</h3>
          <span class="text-xs text-white bg-primary px-2 py-0.5 rounded-full">{{ pkg.duration }} يوم</span>
        </div>
        <div class="space-y-2 text-sm text-gray-500">
          <div class="flex justify-between"><span>⬇ سرعة التحميل</span><span class="font-medium text-secondary">{{ pkg.downloadSpeed }} Mbps</span></div>
          <div class="flex justify-between"><span>⬆ سرعة الرفع</span><span class="font-medium text-secondary">{{ pkg.uploadSpeed }} Mbps</span></div>
          <div class="flex justify-between"><span>السعر</span><span class="font-bold text-primary">{{ pkg.price }} د.ع</span></div>
          <div v-if="pkg.routerProfile" class="flex justify-between"><span>Pool</span><span class="font-medium text-secondary font-mono text-xs">{{ pkg.routerProfile }}</span></div>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(pkg)" class="flex-1 text-center py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition">
            <i class="fas fa-edit me-1"></i>تعديل
          </button>
          <button @click="deleteTargetPkg = pkg; showDeleteConfirmModal = true" class="flex-1 text-center py-1.5 text-xs text-danger hover:bg-danger/5 rounded-lg transition">
            <i class="fas fa-trash me-1"></i>حذف
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <transition name="fade">
      <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" @click.self="showDeleteConfirmModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-trash text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-white font-bold text-lg">حذف الباقة نهائياً</h3>
              <p class="text-red-200 text-xs mt-0.5">يرجى قراءة التحذير قبل المتابعة</p>
            </div>
            <button @click="showDeleteConfirmModal = false" class="mr-auto w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="p-6">
            <div class="flex items-start gap-4 mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <i class="fas fa-exclamation-circle text-red-500 text-xl mt-0.5 flex-shrink-0"></i>
              <div>
                <p class="font-bold text-red-800 text-sm mb-1">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                <p class="text-red-700 text-xs leading-relaxed">سيتم حذف الباقة <strong>{{ deleteTargetPkg?.name }}</strong> بشكل نهائي من النظام.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-2 mb-5">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-times-circle text-red-400 w-4"></i>
                <span>حذف بيانات الباقة نهائياً</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-times-circle text-red-400 w-4"></i>
                <span>لا يمكن استعادة البيانات بعد الحذف</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="showDeleteConfirmModal = false" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
              <button @click="confirmDelete" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-sm font-bold rounded-xl transition shadow-sm">
                <i class="fas fa-trash ml-2"></i>تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل باقة' : 'إضافة باقة جديدة' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">اسم الباقة <span class="text-red-500">*</span></label>
              <input v-model="form.name" placeholder="مثال: باقة 50 ميغا" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">سرعة التحميل (Mbps) <span class="text-red-500">*</span></label>
              <input v-model.number="form.downloadSpeed" type="number" min="1" placeholder="50" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">سرعة الرفع (Mbps) <span class="text-red-500">*</span></label>
              <input v-model.number="form.uploadSpeed" type="number" min="1" placeholder="10" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">السعر (د.ع) <span class="text-red-500">*</span></label>
              <input v-model.number="form.price" type="number" min="0" placeholder="25000" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">المدة (أيام) <span class="text-red-500">*</span></label>
              <input v-model.number="form.duration" type="number" min="1" placeholder="30" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">Pool (بروفايل الراوتر)</label>
              <input v-model="form.routerProfile" placeholder="مثال: pppoe-profile" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-xs text-gray-400 mt-1">اسم البروفايل (PPPoE Pool) في الميكروتك المرتبط بهذه الباقة</p>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          <button @click="save" :disabled="saving" class="px-6 py-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm rounded-lg font-medium transition flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import { logActivity } from '../../utils/activityLog';

const packages = ref<any[]>([]);
const showModal = ref(false);
const saving = ref(false);
const showDeleteConfirmModal = ref(false);
const deleteTargetPkg = ref<any>(null);
const editingId = ref<number | null>(null);
const form = ref({ name: '', downloadSpeed: 0, uploadSpeed: 0, price: 0, duration: 30, routerProfile: '' });
const toast = ref({ show: false, message: '', type: 'success' });

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

async function loadData() {
  try {
    const { data } = await api.get('/packages');
    packages.value = data;
  } catch {
    showToast('فشل تحميل الباقات', 'error');
  }
}

function openAdd() {
  editingId.value = null;
  form.value = { name: '', downloadSpeed: 0, uploadSpeed: 0, price: 0, duration: 30, routerProfile: '' };
  showModal.value = true;
}

function openEdit(pkg: any) {
  editingId.value = pkg.id;
  form.value = {
    name: pkg.name,
    downloadSpeed: Number(pkg.downloadSpeed),
    uploadSpeed: Number(pkg.uploadSpeed),
    price: Number(pkg.price),
    duration: Number(pkg.duration),
    routerProfile: pkg.routerProfile || '',
  };
  showModal.value = true;
}

async function save() {
  if (!form.value.name.trim()) return showToast('يرجى إدخال اسم الباقة', 'error');
  if (!form.value.downloadSpeed || form.value.downloadSpeed <= 0) return showToast('يرجى إدخال سرعة التحميل', 'error');
  if (!form.value.uploadSpeed || form.value.uploadSpeed <= 0) return showToast('يرجى إدخال سرعة الرفع', 'error');
  if (!form.value.price || form.value.price <= 0) return showToast('يرجى إدخال السعر', 'error');

  saving.value = true;
  try {
    const payload: any = {
      name: form.value.name.trim(),
      downloadSpeed: Number(form.value.downloadSpeed),
      uploadSpeed: Number(form.value.uploadSpeed),
      price: Number(form.value.price),
      duration: Number(form.value.duration),
    };
    if (form.value.routerProfile.trim()) payload.routerProfile = form.value.routerProfile.trim();
    if (editingId.value) {
      await api.patch(`/packages/${editingId.value}`, payload);
      logActivity({ action: 'edit_package', module: 'package', packageName: form.value.name, details: `تعديل باقة: ${form.value.name}` });
      showToast('تم تحديث الباقة بنجاح');
    } else {
      await api.post('/packages', payload);
      logActivity({ action: 'add_package', module: 'package', packageName: form.value.name, details: `إضافة باقة جديدة: ${form.value.name}` });
      showToast('تم إضافة الباقة بنجاح');
    }
    showModal.value = false;
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ أثناء الحفظ'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  const pkg = packages.value.find((p: any) => p.id === id);
  try {
    await api.delete(`/packages/${id}`);
    if (pkg) logActivity({ action: 'delete_package', module: 'package', packageName: pkg.name, details: `حذف باقة: ${pkg.name}` });
    showToast('تم حذف الباقة');
    await loadData();
  } catch {
    showToast('فشل حذف الباقة', 'error');
  }
}

async function confirmDelete() {
  const pkg = deleteTargetPkg.value;
  if (!pkg) return;
  showDeleteConfirmModal.value = false;
  await remove(pkg.id);
}

onMounted(loadData);
</script>
