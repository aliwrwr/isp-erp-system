<template>
  <div>
    <!-- Back -->
    <div class="mb-4">
      <router-link to="/installments/contracts" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition">
        <i class="fas fa-arrow-right"></i> العودة إلى العقود
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-400">
      <i class="fas fa-spinner fa-spin text-3xl text-indigo-400 mb-3 block"></i>جاري التحميل...
    </div>

    <div v-else-if="!contract" class="text-center py-20 text-gray-400">
      <i class="fas fa-file-times text-4xl mb-3 block"></i>
      <p>العقد غير موجود</p>
    </div>

    <template v-else>
      <!-- Header Cards -->
      <div class="grid md:grid-cols-3 gap-4 mb-5">
        <!-- Contract Info -->
        <div class="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-xs text-gray-400 mb-1">رقم العقد</p>
              <h2 class="text-2xl font-black text-indigo-600 font-mono">{{ contract.contractNumber }}</h2>
            </div>
            <span class="px-3 py-1.5 rounded-full text-sm font-bold" :class="statusClass(contract.status)">
              <span class="w-2 h-2 rounded-full inline-block ml-1.5" :class="dotClass(contract.status)"></span>
              {{ statusLabel(contract.status) }}
            </span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">المنتج</p>
              <p class="font-bold text-gray-700">{{ contract.productName }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">السعر الإجمالي</p>
              <p class="font-bold text-gray-700">{{ fmt(contract.totalPrice) }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">الدفعة الأولى</p>
              <p class="font-bold text-gray-700">{{ fmt(contract.downPayment) }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">قيمة القسط</p>
              <p class="font-bold text-gray-700">{{ fmt(contract.installmentAmount) }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">تاريخ البدء</p>
              <p class="font-bold text-gray-700">{{ formatDate(contract.startDate) }}</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-400 mb-0.5">الموعد القادم</p>
              <p class="font-bold" :class="isOverdue(contract.nextDueDate) ? 'text-red-600' : 'text-gray-700'">{{ formatDate(contract.nextDueDate) }}</p>
            </div>
            <div v-if="contract.guarantorName" class="bg-amber-50 rounded-xl p-3">
              <p class="text-xs text-amber-500 mb-0.5">الضامن</p>
              <p class="font-bold text-gray-700">{{ contract.guarantorName }}</p>
              <p class="text-xs text-gray-500 font-mono">{{ contract.guarantorPhone }}</p>
            </div>
          </div>
          <!-- Progress Bar -->
          <div class="mt-4 bg-gray-50 rounded-xl p-4">
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm font-bold text-gray-600">تقدم السداد</span>
              <span class="font-mono font-black text-indigo-600">{{ contract.paidCount }}/{{ contract.installmentCount }}</span>
            </div>
            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-l from-indigo-500 to-blue-400 transition-all"
                :style="`width:${pct}%`"></div>
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-xs text-gray-500">المدفوع: <span class="font-bold text-green-600">{{ fmt(contract.totalPrice - contract.remainingAmount) }}</span></span>
              <span class="text-xs text-gray-500">المتبقي: <span class="font-bold text-red-500">{{ fmt(contract.remainingAmount) }}</span></span>
            </div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p class="text-xs font-bold text-gray-400 uppercase mb-4">بيانات العميل</p>
          <div v-if="contract.customer" class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-black text-lg">{{ contract.customer.name?.charAt(0) }}</div>
              <div>
                <p class="font-black text-secondary">{{ contract.customer.name }}</p>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="contract.customer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ contract.customer.status === 'active' ? 'نشط' : 'محظور' }}
                </span>
              </div>
            </div>
            <div v-if="contract.customer.phone" class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-phone text-indigo-400 w-4"></i>
              <span dir="ltr">{{ contract.customer.phone }}</span>
            </div>
            <div v-if="contract.customer.phone2" class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-phone-square text-indigo-400 w-4"></i>
              <span dir="ltr">{{ contract.customer.phone2 }}</span>
            </div>
            <div v-if="contract.customer.address" class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-map-marker-alt text-indigo-400 w-4"></i>
              <span>{{ contract.customer.address }}</span>
            </div>
            <div v-if="contract.customer.nationalId" class="flex items-center gap-2 text-sm text-gray-600">
              <i class="fas fa-id-card text-indigo-400 w-4"></i>
              <span>{{ contract.customer.nationalId }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 class="font-black text-secondary flex items-center gap-2"><i class="fas fa-coins text-indigo-500"></i> سجل الدفعات</h3>
          <button v-if="contract.status !== 'completed' && contract.status !== 'cancelled'"
            @click="openPayment"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-200">
            <i class="fas fa-plus"></i> تسجيل دفعة
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100">
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">#</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">التاريخ</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">المبلغ</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">استلم بواسطة</th>
                <th class="px-5 py-3 text-right text-xs font-bold text-gray-500">ملاحظات</th>
                <th class="px-5 py-3 text-center text-xs font-bold text-gray-500">الحالة</th>
                <th class="px-5 py-3 text-center text-xs font-bold text-gray-500"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="!contract.payments?.length"><td colspan="7" class="text-center py-8 text-gray-400 text-sm"><i class="fas fa-inbox text-2xl mb-2 block"></i>لا توجد دفعات مسجلة</td></tr>
              <tr v-for="(p, i) in contract.payments" :key="p.id" class="hover:bg-indigo-50/20 group transition">
                <td class="px-5 py-3 text-gray-400 font-mono text-xs">{{ i + 1 }}</td>
                <td class="px-5 py-3 font-medium text-gray-700">{{ formatDate(p.date) }}</td>
                <td class="px-5 py-3 font-bold text-green-600">{{ fmt(p.amount) }}</td>
                <td class="px-5 py-3 text-gray-600">{{ p.receivedBy || '—' }}</td>
                <td class="px-5 py-3 text-gray-500 text-xs max-w-[200px] truncate">{{ p.notes || '—' }}</td>
                <td class="px-5 py-3 text-center">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold"
                    :class="{ paid: 'bg-green-100 text-green-700', partial: 'bg-amber-100 text-amber-700', late: 'bg-red-100 text-red-700' }[p.status] || ''">
                    {{ { paid: 'مدفوع', partial: 'جزئي', late: 'متأخر' }[p.status] || p.status }}
                  </span>
                </td>
                <td class="px-5 py-3 text-center">
                  <button @click="deletePaymentTarget = p"
                    class="w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition opacity-40 group-hover:opacity-100 mx-auto">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Add Payment Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showPaymentModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="bg-gradient-to-l from-green-600 to-green-500 px-6 py-4 flex items-center justify-between">
              <h3 class="text-white font-bold flex items-center gap-2"><i class="fas fa-coins"></i> تسجيل دفعة</h3>
              <button @click="showPaymentModal = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="savePayment" class="p-6 space-y-3">
              <div class="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex justify-between text-sm">
                <span class="text-gray-500">مبلغ القسط:</span>
                <span class="font-black text-indigo-600">{{ fmt(contract?.installmentAmount) }}</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">المبلغ <span class="text-red-400">*</span></label>
                  <input v-model.number="payForm.amount" required type="number" min="1" class="input-field" :placeholder="contract?.installmentAmount" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">التاريخ <span class="text-red-400">*</span></label>
                  <input v-model="payForm.date" required type="date" class="input-field" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">استلم بواسطة</label>
                <input v-model="payForm.receivedBy" class="input-field" placeholder="اسم الموظف" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">ملاحظات</label>
                <textarea v-model="payForm.notes" rows="2" class="input-field resize-none" placeholder="..."></textarea>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="savingPay"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="savingPay ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ savingPay ? '...' : 'تسجيل الدفعة' }}
                </button>
                <button type="button" @click="showPaymentModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Payment Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deletePaymentTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="deletePaymentTarget = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="bg-gradient-to-l from-red-600 to-red-500 px-6 py-4">
              <h3 class="text-white font-black text-base">حذف الدفعة</h3>
            </div>
            <div class="px-6 py-5">
              <p class="text-sm text-gray-600 mb-2">هل تريد حذف هذه الدفعة؟</p>
              <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p class="font-bold text-green-600">{{ fmt(deletePaymentTarget.amount) }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(deletePaymentTarget.date) }}</p>
              </div>
            </div>
            <div class="flex gap-3 px-6 pb-5">
              <button @click="confirmDeletePayment" :disabled="deletingPay"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                <i :class="deletingPay ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
                {{ deletingPay ? '...' : 'حذف' }}
              </button>
              <button @click="deletePaymentTarget = null" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition">إلغاء</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../../api';

const route = useRoute();
const contract = ref<any>(null);
const loading  = ref(true);
const showPaymentModal   = ref(false);
const savingPay          = ref(false);
const deletePaymentTarget = ref<any>(null);
const deletingPay        = ref(false);

const emptyPay = () => ({ amount: 0, date: new Date().toISOString().split('T')[0], notes: '', receivedBy: '' });
const payForm  = ref(emptyPay());

const fmt = (v: number) => Number(v || 0).toLocaleString('ar-IQ') + ' د.ع';
const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-IQ') : '—';
const isOverdue = (d: string) => d && new Date(d) < new Date();
const pct = computed(() => contract.value ? Math.round((contract.value.paidCount / contract.value.installmentCount) * 100) : 0);
const statusLabel = (s: string) => ({ active: 'نشط', completed: 'مكتمل', late: 'متأخر', cancelled: 'ملغي' }[s] ?? s);
const statusClass = (s: string) => ({ active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', late: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' }[s] ?? '');
const dotClass   = (s: string) => ({ active: 'bg-green-500', completed: 'bg-blue-500', late: 'bg-red-500', cancelled: 'bg-gray-400' }[s] ?? '');

function openPayment() { payForm.value = { ...emptyPay(), amount: contract.value?.installmentAmount || 0 }; showPaymentModal.value = true; }

async function savePayment() {
  savingPay.value = true;
  try {
    await api.post(`/installments/contracts/${route.params.id}/payments`, payForm.value);
    showPaymentModal.value = false;
    await load();
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { savingPay.value = false; }
}

async function confirmDeletePayment() {
  if (!deletePaymentTarget.value) return;
  deletingPay.value = true;
  try {
    await api.delete(`/installments/contracts/${route.params.id}/payments/${deletePaymentTarget.value.id}`);
    deletePaymentTarget.value = null;
    await load();
  } finally { deletingPay.value = false; }
}

async function load() {
  try {
    const r = await api.get(`/installments/contracts/${route.params.id}`);
    contract.value = r.data;
  } finally { loading.value = false; }
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
</style>
