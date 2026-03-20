<template>
  <div>
    <!-- Stats Row -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <div v-for="s in stats" :key="s.label" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :style="`background:${s.bg}`">
          <i :class="s.icon" class="text-white text-lg"></i>
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ s.label }}</p>
          <p class="font-black text-secondary text-lg leading-tight">{{ s.value }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
        <input v-model="search" type="text" placeholder="بحث بالمنتج أو رقم العقد..."
          class="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition" />
      </div>
      <select v-model="filterStatus" class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px]">
        <option value="">جميع الحالات</option>
        <option value="active">نشط</option>
        <option value="late">متأخر</option>
        <option value="completed">مكتمل</option>
        <option value="cancelled">ملغي</option>
      </select>
      <button @click="openAdd"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-200 shrink-0">
        <i class="fas fa-plus"></i> عقد جديد
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-l from-indigo-50 to-gray-50 border-b border-gray-100">
              <th class="px-4 py-3.5 text-right text-xs font-bold text-gray-500">رقم العقد</th>
              <th class="px-4 py-3.5 text-right text-xs font-bold text-gray-500">العميل</th>
              <th class="px-4 py-3.5 text-right text-xs font-bold text-gray-500">المنتج</th>
              <th class="px-4 py-3.5 text-right text-xs font-bold text-gray-500">السعر الكلي</th>
              <th class="px-4 py-3.5 text-right text-xs font-bold text-gray-500">المتبقي</th>
              <th class="px-4 py-3.5 text-center text-xs font-bold text-gray-500">الأقساط</th>
              <th class="px-4 py-3.5 text-center text-xs font-bold text-gray-500">الحالة</th>
              <th class="px-4 py-3.5 text-center text-xs font-bold text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading"><td colspan="8" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl text-indigo-400 mb-2 block"></i>جاري التحميل...</td></tr>
            <tr v-else-if="filtered.length === 0"><td colspan="8" class="text-center py-12 text-gray-400"><i class="fas fa-file-contract text-3xl mb-2 block"></i>لا توجد عقود</td></tr>
            <tr v-for="c in filtered" :key="c.id"
              class="hover:bg-indigo-50/30 group transition cursor-pointer select-none"
              @contextmenu.prevent="openCtx($event, c)"
              @touchstart="onTouchStart($event, c)"
              @touchend="onTouchEnd"
              @touchmove="onTouchEnd"
              @click.stop>
              <td class="px-4 py-3.5">
                <span class="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{{ c.contractNumber }}</span>
              </td>
              <td class="px-4 py-3.5">
                <p class="font-semibold text-secondary text-sm">{{ c.customer?.name }}</p>
                <p class="text-xs text-gray-400 font-mono">{{ c.customer?.phone }}</p>
              </td>
              <td class="px-4 py-3.5 max-w-[160px]">
                <p class="font-medium text-gray-700 truncate">{{ c.productName }}</p>
              </td>
              <td class="px-4 py-3.5">
                <span class="font-bold text-gray-700">{{ fmt(c.totalPrice) }}</span>
              </td>
              <td class="px-4 py-3.5">
                <span class="font-bold" :class="c.remainingAmount > 0 ? 'text-red-500' : 'text-green-600'">{{ fmt(c.remainingAmount) }}</span>
              </td>
              <td class="px-4 py-3.5 text-center">
                <div class="flex flex-col items-center">
                  <span class="font-mono text-xs">{{ c.paidCount }}/{{ c.installmentCount }}</span>
                  <div class="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                    <div class="h-full rounded-full bg-gradient-to-l from-indigo-500 to-blue-400 transition-all"
                      :style="`width:${c.installmentCount ? Math.round((c.paidCount/c.installmentCount)*100) : 0}%`"></div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
              </td>
              <td class="px-4 py-3.5">
                <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                  <button v-if="c.status === 'active' || c.status === 'late'"
                    @click.stop="openPay(c)"
                    class="w-8 h-8 rounded-lg hover:bg-green-50 text-green-500 flex items-center justify-center transition" title="تسديد قسط">
                    <i class="fas fa-coins text-xs"></i>
                  </button>
                  <router-link :to="`/installments/contracts/${c.id}`"
                    class="w-8 h-8 rounded-lg hover:bg-indigo-50 text-indigo-500 flex items-center justify-center transition" title="تفاصيل">
                    <i class="fas fa-eye text-xs"></i>
                  </router-link>
                  <button @click.stop="deleteTarget = c" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Contract Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-6 py-4 flex items-center justify-between shrink-0">
              <h3 class="text-white font-bold text-base flex items-center gap-2"><i class="fas fa-file-contract"></i> {{ editingContract ? 'تعديل العقد' : 'إنشاء عقد جديد' }}</h3>
              <button @click="showModal = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="save" class="p-6 space-y-4 overflow-y-auto">
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">العميل <span class="text-red-400">*</span></label>
                <select v-model="form.customerId" required class="input-field">
                  <option value="">اختر العميل</option>
                  <option v-for="cu in customers" :key="cu.id" :value="cu.id">{{ cu.name }} — {{ cu.phone }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">اسم المنتج <span class="text-red-400">*</span></label>
                  <input v-model="form.productName" required class="input-field" placeholder="مثال: ثلاجة، تلفاز..." />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">السعر الإجمالي <span class="text-red-400">*</span></label>
                  <input v-model.number="form.totalPrice" required type="number" min="0" class="input-field" placeholder="0" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">الدفعة الأولى</label>
                  <input v-model.number="form.downPayment" type="number" min="0" class="input-field" placeholder="0" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">مبلغ القسط <span class="text-red-400">*</span></label>
                  <input v-model.number="form.installmentAmount" required type="number" min="0" class="input-field" placeholder="0" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">عدد الأقساط <span class="text-red-400">*</span></label>
                  <div class="relative">
                    <input v-model.number="form.installmentCount" required type="number" min="1" class="input-field" placeholder="0" />
                    <span v-if="form.installmentCount > 0" class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 font-semibold pointer-events-none">قسط</span>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">دورية السداد</label>
                  <select v-model="form.frequency" class="input-field">
                    <option value="monthly">شهري</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="daily">يومي</option>
                  </select>
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">تاريخ البدء <span class="text-red-400">*</span></label>
                  <input v-model="form.startDate" required type="date" class="input-field" />
                </div>
              </div>
              <div class="pt-2 border-t border-gray-100">
                <p class="text-xs font-bold text-gray-500 mb-3">معلومات الضامن (اختياري)</p>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-xs font-semibold text-gray-500 mb-1 block">اسم الضامن</label>
                    <input v-model="form.guarantorName" class="input-field" placeholder="الاسم الكامل" />
                  </div>
                  <div>
                    <label class="text-xs font-semibold text-gray-500 mb-1 block">هاتف الضامن</label>
                    <input v-model="form.guarantorPhone" class="input-field" dir="ltr" placeholder="07X XXXX XXXX" />
                  </div>
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">وصف المنتج / ملاحظات</label>
                <textarea v-model="form.notes" rows="2" class="input-field resize-none" placeholder="..."></textarea>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ saving ? 'جاري الحفظ...' : (editingContract ? 'حفظ التعديلات' : 'إنشاء العقد') }}
                </button>
                <button type="button" @click="showModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Quick Pay Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="payTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="payTarget = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="bg-gradient-to-l from-green-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 class="text-white font-bold flex items-center gap-2"><i class="fas fa-coins"></i> تسديد قسط</h3>
                <p class="text-green-100 text-xs mt-0.5">{{ payTarget.contractNumber }} — {{ payTarget.customer?.name }}</p>
              </div>
              <button @click="payTarget = null" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="savePay" class="p-5 space-y-3">
              <!-- Summary bar -->
              <div class="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-center">
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">مبلغ القسط</p>
                  <p class="font-black text-indigo-600 text-sm">{{ fmt(payTarget.installmentAmount) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">المتبقي</p>
                  <p class="font-black text-red-500 text-sm">{{ fmt(payTarget.remainingAmount) }}</p>
                </div>
                <div>
                  <p class="text-xs text-gray-400 mb-0.5">الأقساط</p>
                  <p class="font-black text-gray-600 text-sm">{{ payTarget.paidCount }}/{{ payTarget.installmentCount }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">المبلغ المدفوع <span class="text-red-400">*</span></label>
                  <input v-model.number="payForm.amount" required type="number" min="1" class="input-field" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">تاريخ التسديد <span class="text-red-400">*</span></label>
                  <input v-model="payForm.date" required type="date" class="input-field" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">استلم بواسطة</label>
                <input v-model="payForm.receivedBy" class="input-field" placeholder="اسم الموظف" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">ملاحظات</label>
                <input v-model="payForm.notes" class="input-field" placeholder="..." />
              </div>
              <div class="flex gap-3 pt-1">
                <button type="submit" :disabled="savingPay"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="savingPay ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ savingPay ? 'جاري الحفظ...' : 'تسجيل الدفعة' }}
                </button>
                <button type="button" @click="payTarget = null" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
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
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><i class="fas fa-file-times text-white"></i></div>
              <div>
                <h3 class="text-white font-black text-base">حذف العقد</h3>
                <p class="text-red-100 text-xs">سيتم حذف العقد وجميع الدفعات المرتبطة</p>
              </div>
            </div>
            <div class="px-6 py-5">
              <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p class="font-bold text-indigo-600 font-mono">{{ deleteTarget.contractNumber }}</p>
                <p class="text-sm text-gray-700">{{ deleteTarget.productName }}</p>
                <p class="text-xs text-gray-500">{{ deleteTarget.customer?.name }}</p>
              </div>
            </div>
            <div class="flex gap-3 px-6 pb-5">
              <button @click="confirmDelete" :disabled="deleting"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                <i :class="deleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
                {{ deleting ? 'جاري الحذف...' : 'حذف' }}
              </button>
              <button @click="deleteTarget = null" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition">إلغاء</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Context Menu -->
    <Teleport to="body">
      <Transition name="ctx-fade">
        <div v-if="ctx.show" class="fixed inset-0 z-[200]" @click="closeCtx" @contextmenu.prevent="closeCtx">
          <div class="absolute bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-52 py-1" :style="ctxStyle" @click.stop>
            <button @click="ctxAction('detail')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition">
              <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0"><i class="fas fa-eye text-indigo-600 text-xs"></i></div>
              <span class="font-medium">عرض التفاصيل</span>
            </button>
            <button @click="ctxAction('edit')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition">
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><i class="fas fa-pen text-blue-600 text-xs"></i></div>
              <span class="font-medium">تعديل</span>
            </button>
            <button @click="ctxAction('pay')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition"
              :class="(ctx.target?.status !== 'active' && ctx.target?.status !== 'late') ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''">
              <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><i class="fas fa-coins text-green-600 text-xs"></i></div>
              <span class="font-medium">تسجيل دفعة</span>
            </button>
            <button @click="ctxAction('print')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><i class="fas fa-print text-gray-500 text-xs"></i></div>
              <span class="font-medium">طباعة سند قبض</span>
            </button>
            <div class="mx-3 my-1 border-t border-gray-100"></div>
            <button @click="ctxAction('delete')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
              <div class="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><i class="fas fa-trash-alt text-red-500 text-xs"></i></div>
              <span class="font-medium">حذف</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const contracts    = ref<any[]>([]);
const customers    = ref<any[]>([]);
const loading      = ref(true);
const saving       = ref(false);
const deleting     = ref(false);
const showModal    = ref(false);
const editingContract = ref<any>(null);
const deleteTarget = ref<any>(null);
const payTarget    = ref<any>(null);
const savingPay    = ref(false);
const search       = ref('');
const filterStatus = ref('');

const emptyPayForm = () => ({ amount: 0, date: new Date().toISOString().split('T')[0], receivedBy: '', notes: '' });
const payForm = ref(emptyPayForm());

const emptyForm = () => ({ customerId: '', productName: '', productDescription: '', totalPrice: 0, downPayment: 0, installmentAmount: 0, installmentCount: 0, frequency: 'monthly', startDate: new Date().toISOString().split('T')[0], guarantorName: '', guarantorPhone: '', notes: '' });
const form = ref(emptyForm());

// Auto-calculate installment count when amount, totalPrice, or downPayment changes
watch(
  () => [form.value.installmentAmount, form.value.totalPrice, form.value.downPayment],
  ([amount, total, down]) => {
    if (!editingContract.value && amount > 0 && total > 0) {
      const remaining = Math.max(0, Number(total) - Number(down || 0));
      form.value.installmentCount = Math.ceil(remaining / Number(amount));
    }
  }
);

const fmt = (v: number) => Number(v || 0).toLocaleString('ar-IQ') + ' د.ع';
const statusLabel = (s: string) => ({ active: 'نشط', completed: 'مكتمل', late: 'متأخر', cancelled: 'ملغي' }[s] ?? s);
const statusClass = (s: string) => ({ active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', late: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' }[s] ?? '');

const filtered = computed(() => contracts.value.filter(c => {
  const q = search.value.toLowerCase();
  const matchQ = !q || c.contractNumber?.toLowerCase().includes(q) || c.productName?.toLowerCase().includes(q) || c.customer?.name?.toLowerCase().includes(q);
  const matchS = !filterStatus.value || c.status === filterStatus.value;
  return matchQ && matchS;
}));

const stats = computed(() => [
  { label: 'إجمالي العقود', value: contracts.value.length, icon: 'fas fa-file-contract', bg: '#6366F1' },
  { label: 'العقود النشطة', value: contracts.value.filter(c => c.status === 'active').length, icon: 'fas fa-check-circle', bg: '#22C55E' },
  { label: 'العقود المتأخرة', value: contracts.value.filter(c => c.status === 'late').length, icon: 'fas fa-exclamation-circle', bg: '#EF4444' },
  { label: 'العقود المكتملة', value: contracts.value.filter(c => c.status === 'completed').length, icon: 'fas fa-flag-checkered', bg: '#3B82F6' },
]);

function openAdd() { editingContract.value = null; form.value = emptyForm(); showModal.value = true; }
function openEdit(c: any) {
  editingContract.value = c;
  form.value = {
    customerId: c.customer?.id || '',
    productName: c.productName || '',
    productDescription: c.productDescription || '',
    totalPrice: c.totalPrice || 0,
    downPayment: c.downPayment || 0,
    installmentAmount: c.installmentAmount || 0,
    installmentCount: c.installmentCount || 0,
    frequency: c.frequency || 'monthly',
    startDate: c.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    guarantorName: c.guarantorName || '',
    guarantorPhone: c.guarantorPhone || '',
    notes: c.notes || '',
  };
  showModal.value = true;
}

function openPay(c: any) {
  payTarget.value = c;
  payForm.value = { ...emptyPayForm(), amount: c.installmentAmount };
}

async function savePay() {
  if (!payTarget.value) return;
  savingPay.value = true;
  try {
    await api.post(`/installments/contracts/${payTarget.value.id}/payments`, payForm.value);
    payTarget.value = null;
    await load();
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { savingPay.value = false; }
}

async function save() {
  saving.value = true;
  try {
    if (editingContract.value) {
      await api.patch(`/installments/contracts/${editingContract.value.id}`, form.value);
    } else {
      await api.post('/installments/contracts', form.value);
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
    await api.delete(`/installments/contracts/${deleteTarget.value.id}`);
    deleteTarget.value = null;
    await load();
  } finally { deleting.value = false; }
}

async function load() {
  try {
    const [cr, cu] = await Promise.all([api.get('/installments/contracts'), api.get('/installments/customers')]);
    contracts.value = cr.data;
    customers.value = cu.data;
  } finally { loading.value = false; }
}
// ─── Context Menu ─────────────────────────────────────────────────
const router = useRouter();
const ctx = reactive({ show: false, x: 0, y: 0, target: null as any });
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
const ctxStyle = computed(() => {
  const W = 210, H = 245;
  const x = ctx.x + W > window.innerWidth ? ctx.x - W : ctx.x;
  const y = ctx.y + H > window.innerHeight ? ctx.y - H : ctx.y;
  return { left: `${x}px`, top: `${y}px` };
});
function openCtx(event: MouseEvent, item: any) { ctx.x = event.clientX; ctx.y = event.clientY; ctx.target = item; ctx.show = true; }
function closeCtx() { ctx.show = false; }
function onTouchStart(event: TouchEvent, item: any) {
  longPressTimer = setTimeout(() => {
    const t = event.touches[0];
    openCtx({ clientX: t.clientX, clientY: t.clientY } as MouseEvent, item);
  }, 600);
}
function onTouchEnd() { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } }
function ctxAction(action: string) {
  const c = ctx.target; closeCtx(); if (!c) return;
  if (action === 'detail') router.push(`/installments/contracts/${c.id}`);
  else if (action === 'edit')   openEdit(c);
  else if (action === 'pay')    openPay(c);
  else if (action === 'print')  router.push(`/installments/contracts/${c.id}`);
  else if (action === 'delete') deleteTarget.value = c;
}

onMounted(load);
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: all .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity .12s, transform .12s; }
.ctx-fade-enter-from, .ctx-fade-leave-to { opacity: 0; transform: scale(.96); }
</style>
