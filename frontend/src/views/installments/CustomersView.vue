<template>
  <div>
    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
        <input v-model="search" type="text" placeholder="بحث بالاسم أو الهاتف أو الهوية..."
          class="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition" />
      </div>
      <select v-model="filterStatus" class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px]">
        <option value="">جميع الحالات</option>
        <option value="active">نشط</option>
        <option value="blocked">محظور</option>
      </select>
      <button @click="openAdd"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-200 shrink-0">
        <i class="fas fa-user-plus"></i> عميل جديد
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-l from-indigo-50 to-gray-50 border-b border-gray-100">
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">#</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الهوية</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">العنوان</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-500">الحالة</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading"><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl text-indigo-400 mb-2 block"></i>جاري التحميل...</td></tr>
            <tr v-else-if="filtered.length === 0"><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-users-slash text-3xl mb-2 block"></i>لا يوجد عملاء</td></tr>
            <tr v-for="(c, i) in filtered" :key="c.id" class="hover:bg-indigo-50/30 group transition">
              <td class="px-5 py-3.5 text-gray-400 font-mono text-xs">{{ i+1 }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold text-xs shrink-0">{{ c.name?.charAt(0) }}</div>
                  <div>
                    <p class="font-bold text-secondary">{{ c.name }}</p>
                    <p v-if="c.phone2" class="text-xs text-gray-400">{{ c.phone2 }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 text-gray-600 font-mono" dir="ltr">{{ c.phone || '—' }}</td>
              <td class="px-5 py-3.5 text-gray-500 font-mono text-xs">{{ c.nationalId || '—' }}</td>
              <td class="px-5 py-3.5 text-gray-500 text-xs max-w-[160px] truncate">{{ c.address || '—' }}</td>
              <td class="px-5 py-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <span class="w-1.5 h-1.5 rounded-full inline-block ml-1"
                    :class="c.status === 'active' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ c.status === 'active' ? 'نشط' : 'محظور' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                  <button @click="openEdit(c)" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition" title="تعديل">
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button @click="deleteTarget = c" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-6 py-4 flex items-center justify-between">
              <h3 class="text-white font-bold text-base flex items-center gap-2">
                <i class="fas fa-user-plus"></i>
                {{ editing ? 'تعديل العميل' : 'إضافة عميل جديد' }}
              </h3>
              <button @click="showModal = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="save" class="p-6 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">الاسم الكامل <span class="text-red-400">*</span></label>
                  <input v-model="form.name" required class="input-field" placeholder="محمد أحمد" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">رقم الهاتف</label>
                  <input v-model="form.phone" class="input-field" dir="ltr" placeholder="07X XXXX XXXX" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">هاتف بديل</label>
                  <input v-model="form.phone2" class="input-field" dir="ltr" placeholder="07X XXXX XXXX" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">رقم الهوية</label>
                  <input v-model="form.nationalId" class="input-field" placeholder="رقم الهوية" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">العنوان</label>
                <input v-model="form.address" class="input-field" placeholder="المدينة، الحي، الشارع" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">ملاحظات</label>
                <textarea v-model="form.notes" rows="2" class="input-field resize-none" placeholder="..."></textarea>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">الحالة</label>
                <select v-model="form.status" class="input-field">
                  <option value="active">نشط</option>
                  <option value="blocked">محظور</option>
                </select>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة') }}
                </button>
                <button type="button" @click="showModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="deleteTarget = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="bg-gradient-to-l from-red-600 to-red-500 px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-user-times text-white"></i>
              </div>
              <div>
                <h3 class="text-white font-black text-base">تأكيد الحذف</h3>
                <p class="text-red-100 text-xs">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <div class="px-6 py-5">
              <p class="text-sm text-gray-600 mb-3">هل تريد حذف العميل:</p>
              <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">{{ deleteTarget.name?.charAt(0) }}</div>
                <div>
                  <p class="font-black text-secondary text-sm">{{ deleteTarget.name }}</p>
                  <p class="text-xs text-gray-500">{{ deleteTarget.phone }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3 px-6 pb-5">
              <button @click="confirmDelete" :disabled="deleting"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                <i :class="deleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
                {{ deleting ? 'جاري الحذف...' : 'نعم، احذف' }}
              </button>
              <button @click="deleteTarget = null" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition">إلغاء</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const customers    = ref<any[]>([]);
const loading      = ref(true);
const saving       = ref(false);
const deleting     = ref(false);
const showModal    = ref(false);
const editing      = ref<any>(null);
const deleteTarget = ref<any>(null);
const search       = ref('');
const filterStatus = ref('');

const emptyForm = () => ({ name: '', phone: '', phone2: '', nationalId: '', address: '', notes: '', status: 'active' });
const form = ref(emptyForm());

const filtered = computed(() => customers.value.filter(c => {
  const s = search.value.toLowerCase();
  const matchSearch = !s || c.name?.toLowerCase().includes(s) || c.phone?.includes(s) || c.nationalId?.includes(s);
  const matchStatus = !filterStatus.value || c.status === filterStatus.value;
  return matchSearch && matchStatus;
}));

function openAdd() { editing.value = null; form.value = emptyForm(); showModal.value = true; }
function openEdit(c: any) { editing.value = c; form.value = { ...c }; showModal.value = true; }

async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await api.patch(`/installments/customers/${editing.value.id}`, form.value);
    } else {
      await api.post('/installments/customers', form.value);
    }
    showModal.value = false;
    await load();
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { saving.value = false; }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await api.delete(`/installments/customers/${deleteTarget.value.id}`);
    deleteTarget.value = null;
    await load();
  } finally { deleting.value = false; }
}

async function load() {
  try {
    const r = await api.get('/installments/customers');
    customers.value = r.data;
  } finally { loading.value = false; }
}
onMounted(load);
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
</style>
