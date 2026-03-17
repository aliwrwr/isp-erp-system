<template>
  <div class="max-w-4xl mx-auto flex flex-col gap-5" dir="rtl">

    <!-- Header -->
    <div class="bg-gradient-to-l from-indigo-600 to-violet-700 rounded-2xl px-8 py-6 flex items-center justify-between shadow-lg shadow-indigo-100">
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-3">
          <i class="fas fa-truck-ramp-box"></i>
          إدارة الموردين
        </h1>
        <p class="text-indigo-200 text-sm mt-1">{{ suppliers.length }} مورّد مسجّل — مرتبطون تلقائياً بصفحة المنتجات</p>
      </div>
      <button @click="openAdd()"
        class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition border border-white/30">
        <i class="fas fa-plus-circle text-base"></i>
        إضافة مورّد
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-building text-indigo-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-700">{{ suppliers.length }}</p>
          <p class="text-xs text-gray-400 font-semibold">إجمالي الموردين</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-phone text-emerald-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-700">{{ suppliers.filter(s => s.phone).length }}</p>
          <p class="text-xs text-gray-400 font-semibold">لديهم رقم هاتف</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-box text-amber-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-black text-gray-700">{{ suppliersWithProducts }}</p>
          <p class="text-xs text-gray-400 font-semibold">لديهم منتجات</p>
        </div>
      </div>
    </div>

    <!-- Search -->
    <div class="relative max-w-sm">
      <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
      <input v-model="search" placeholder="بحث بالاسم أو الهاتف..."
        class="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-400 text-xs font-bold">
              <th class="px-4 py-3 text-right">#</th>
              <th class="px-4 py-3 text-right">اسم المورّد</th>
              <th class="px-4 py-3 text-center">رقم الهاتف</th>
              <th class="px-4 py-3 text-center">البريد الإلكتروني</th>
              <th class="px-4 py-3 text-right">العنوان</th>
              <th class="px-4 py-3 text-center">المنتجات</th>
              <th class="px-4 py-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="py-12 text-center text-gray-400">
                <i class="fas fa-spinner fa-spin text-2xl text-indigo-400"></i>
              </td>
            </tr>
            <tr v-else-if="filtered.length === 0">
              <td colspan="7" class="py-12 text-center text-gray-400">
                <i class="fas fa-truck text-4xl text-gray-200 mb-2 block"></i>
                لا يوجد موردون
              </td>
            </tr>
            <tr v-for="(s, idx) in filtered" :key="s.id"
              class="border-t border-gray-50 hover:bg-gray-50/50 transition group">
              <td class="px-4 py-3.5 text-gray-400 text-xs font-mono">{{ idx + 1 }}</td>
              <td class="px-4 py-3.5">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <span class="text-indigo-600 font-black text-sm">{{ s.name.charAt(0) }}</span>
                  </div>
                  <div>
                    <p class="font-bold text-gray-700">{{ s.name }}</p>
                    <p v-if="s.notes" class="text-[11px] text-gray-400 truncate max-w-[180px]">{{ s.notes }}</p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 text-center">
                <a v-if="s.phone" :href="`tel:${s.phone}`"
                  class="text-xs font-mono text-indigo-600 hover:underline flex items-center gap-1 justify-center">
                  <i class="fas fa-phone text-[10px]"></i>{{ s.phone }}
                </a>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="px-4 py-3.5 text-center text-xs text-gray-500">
                <a v-if="s.email" :href="`mailto:${s.email}`" class="hover:underline text-indigo-600">{{ s.email }}</a>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-4 py-3.5 text-xs text-gray-500 max-w-xs truncate">{{ s.address || '—' }}</td>
              <td class="px-4 py-3.5 text-center">
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                  {{ productCountBySupplier(s.name) }} منتج
                </span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex items-center gap-1 justify-center opacity-0 group-hover:opacity-100 transition">
                  <button @click="openEdit(s)"
                    class="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button @click="confirmDelete(s)"
                    class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 flex items-center justify-center transition">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
          <div class="bg-gradient-to-l from-indigo-600 to-violet-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fas fa-truck-ramp-box"></i>
              {{ editingId ? 'تعديل مورّد' : 'إضافة مورّد جديد' }}
            </h3>
            <button @click="showModal = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">اسم المورّد <span class="text-red-400">*</span></label>
              <input v-model="form.name" placeholder="مثال: شركة الخليج للاستيراد"
                class="w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                :class="formError && !form.name.trim() ? 'border-red-300' : 'border-gray-200'" />
              <p v-if="formError && !form.name.trim()" class="text-xs text-red-400 mt-1">اسم المورّد مطلوب</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-gray-600 block mb-1.5">رقم الهاتف</label>
                <input v-model="form.phone" placeholder="07xx xxx xxxx" dir="ltr"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label class="text-xs font-bold text-gray-600 block mb-1.5">البريد الإلكتروني</label>
                <input v-model="form.email" placeholder="email@example.com" dir="ltr" type="email"
                  class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">العنوان</label>
              <input v-model="form.address" placeholder="المدينة، الحي، الشارع..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">ملاحظات</label>
              <textarea v-model="form.notes" rows="2" placeholder="أي معلومات إضافية..."
                class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"></textarea>
            </div>
          </div>
          <div class="px-6 pb-5 flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button @click="showModal = false"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition">إلغاء</button>
            <button @click="save" :disabled="saving"
              class="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition disabled:opacity-50 flex items-center gap-2">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              {{ saving ? 'جار الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إضافة') }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Modal -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="showDeleteModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center" dir="rtl">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-trash text-red-500 text-xl"></i>
          </div>
          <h3 class="font-bold text-gray-700 mb-1">حذف المورّد</h3>
          <p class="text-sm text-gray-400 mb-5">هل أنت متأكد من حذف <strong class="text-gray-600">{{ deletingItem?.name }}</strong>؟<br>لن يتأثر أي منتج مرتبط به.</p>
          <div class="flex gap-2 justify-center">
            <button @click="showDeleteModal = false"
              class="px-5 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition">إلغاء</button>
            <button @click="doDelete" :disabled="deleting"
              class="px-5 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition disabled:opacity-50">
              <i v-if="deleting" class="fas fa-spinner fa-spin ml-1"></i>حذف
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold text-white"
        :class="toastError ? 'bg-red-500' : 'bg-emerald-500'">
        <i class="fas" :class="toastError ? 'fa-times-circle' : 'fa-check-circle'"></i>
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const suppliers  = ref<any[]>([]);
const products   = ref<any[]>([]);
const loading    = ref(false);
const saving     = ref(false);
const deleting   = ref(false);
const search     = ref('');
const showModal  = ref(false);
const showDeleteModal = ref(false);
const editingId  = ref<number | null>(null);
const deletingItem = ref<any>(null);
const formError  = ref(false);
const toastMsg   = ref('');
const toastError = ref(false);

const form = ref({ name: '', phone: '', email: '', address: '', notes: '' });

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return suppliers.value;
  return suppliers.value.filter(s =>
    s.name.toLowerCase().includes(q) || (s.phone || '').includes(q)
  );
});

const suppliersWithProducts = computed(() =>
  suppliers.value.filter(s => productCountBySupplier(s.name) > 0).length
);

function productCountBySupplier(name: string) {
  return products.value.filter(p => p.supplier === name).length;
}

function toast(msg: string, error = false) {
  toastMsg.value = msg; toastError.value = error;
  setTimeout(() => { toastMsg.value = ''; }, 3000);
}

async function load() {
  loading.value = true;
  try {
    const [sr, pr] = await Promise.all([api.get('/suppliers'), api.get('/products')]);
    suppliers.value = sr.data;
    products.value  = pr.data;
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null; formError.value = false;
  form.value = { name: '', phone: '', email: '', address: '', notes: '' };
  showModal.value = true;
}

function openEdit(s: any) {
  editingId.value = s.id; formError.value = false;
  form.value = { name: s.name, phone: s.phone || '', email: s.email || '', address: s.address || '', notes: s.notes || '' };
  showModal.value = true;
}

async function save() {
  formError.value = true;
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    const payload: any = { name: form.value.name.trim() };
    if (form.value.phone)   payload.phone   = form.value.phone;
    if (form.value.email)   payload.email   = form.value.email;
    if (form.value.address) payload.address = form.value.address;
    if (form.value.notes)   payload.notes   = form.value.notes;
    if (editingId.value) {
      await api.patch(`/suppliers/${editingId.value}`, payload);
      toast('تم تعديل المورّد ✓');
    } else {
      await api.post('/suppliers', payload);
      toast('تمت إضافة المورّد ✓');
    }
    showModal.value = false;
    await load();
  } catch (e: any) {
    toast(e?.response?.data?.message || 'حدث خطأ', true);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(s: any) {
  deletingItem.value = s; showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await api.delete(`/suppliers/${deletingItem.value.id}`);
    showDeleteModal.value = false;
    toast('تم حذف المورّد');
    await load();
  } catch {
    toast('فشل الحذف', true);
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
