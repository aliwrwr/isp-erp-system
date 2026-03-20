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
                  <div class="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition">
                    <button @click="printReceipt(p, i + 1)"
                      class="w-7 h-7 rounded-lg hover:bg-indigo-50 text-indigo-500 flex items-center justify-center transition" title="سند قبض">
                      <i class="fas fa-print text-xs"></i>
                    </button>
                    <button @click="deletePaymentTarget = p"
                      class="w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
                      <i class="fas fa-trash text-xs"></i>
                    </button>
                  </div>
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

    <!-- Receipt Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="receiptData" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm no-print" @click.self="receiptData = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <!-- Modal header -->
            <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-5 py-4 flex items-center justify-between no-print">
              <h3 class="text-white font-bold flex items-center gap-2"><i class="fas fa-receipt"></i> سند قبض</h3>
              <div class="flex items-center gap-2">
                <!-- Paper size selector -->
                <select v-model="paperSize"
                  class="bg-white/20 border-0 text-white text-xs font-bold rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white/50 appearance-none cursor-pointer"
                  title="حجم الورق">
                  <option value="A5" class="text-gray-800">A5</option>
                  <option value="80mm" class="text-gray-800">حراري 80mm</option>
                  <option value="58mm" class="text-gray-800">حراري 58mm</option>
                </select>
                <button @click="doPrint" class="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition">
                  <i class="fas fa-print"></i> طباعة
                </button>
                <button @click="receiptData = null" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
              </div>
            </div>
            <!-- Receipt content (printable) -->
            <div id="receipt-area" class="p-6 font-[Arial,sans-serif]" dir="rtl">
              <!-- Header -->
              <div class="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <template v-if="sysSettings.logo">
                  <img :src="sysSettings.logo" class="w-16 h-16 object-contain mx-auto mb-2 rounded-lg" />
                </template>
                <template v-else>
                  <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-hand-holding-usd text-2xl text-indigo-600"></i>
                  </div>
                </template>
                <h2 class="text-lg font-black text-gray-800">{{ sysSettings.shopName || 'نظام الأقساط' }}</h2>
                <p class="text-xs text-gray-500 mt-0.5">{{ sysSettings.subtitle || 'سند قبض' }}</p>
                <p v-if="sysSettings.phone" class="text-xs text-gray-400 mt-0.5" dir="ltr">{{ sysSettings.phone }}</p>
                <p v-if="sysSettings.address" class="text-xs text-gray-400">{{ sysSettings.address }}</p>
              </div>
              <!-- Details -->
              <div class="space-y-2.5 text-sm">
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">رقم السند</span>
                  <span class="font-black text-indigo-600 font-mono">#{{ String(receiptData.paymentId).padStart(6,'0') }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">رقم العقد</span>
                  <span class="font-bold font-mono">{{ receiptData.contractNumber }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">التاريخ</span>
                  <span class="font-bold">{{ receiptData.date }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">اسم العميل</span>
                  <span class="font-bold">{{ receiptData.customerName }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">الهاتف</span>
                  <span class="font-bold font-mono" dir="ltr">{{ receiptData.customerPhone }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">المنتج</span>
                  <span class="font-bold">{{ receiptData.productName }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">رقم القسط</span>
                  <span class="font-bold">{{ receiptData.installmentNo }} / {{ receiptData.installmentCount }}</span>
                </div>
                <!-- Amount highlight -->
                <div class="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span class="text-green-700 font-bold">المبلغ المدفوع</span>
                  <span class="text-xl font-black text-green-600">{{ receiptData.amount }}</span>
                </div>
                <div class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">المتبقي بعد الدفعة</span>
                  <span class="font-bold text-red-500">{{ receiptData.remaining }}</span>
                </div>
                <div v-if="receiptData.receivedBy" class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">استلم بواسطة</span>
                  <span class="font-bold">{{ receiptData.receivedBy }}</span>
                </div>
                <div v-if="receiptData.notes" class="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span class="text-gray-500">ملاحظات</span>
                  <span class="font-bold text-gray-600 text-xs">{{ receiptData.notes }}</span>
                </div>
              </div>
              <!-- Signature -->
              <div class="mt-5 pt-4 border-t border-dashed border-gray-300 grid grid-cols-2 gap-4 text-center">
                <div>
                  <div class="h-10 border-b border-gray-300 mb-1"></div>
                  <p class="text-xs text-gray-400">توقيع المستلم</p>
                </div>
                <div>
                  <div class="h-10 border-b border-gray-300 mb-1"></div>
                  <p class="text-xs text-gray-400">توقيع العميل</p>
                </div>
              </div>
              <p class="text-center text-xs text-gray-400 mt-4">{{ sysSettings.footer || 'شكراً لتعاملكم' }}</p>
            </div>
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
const receiptData        = ref<any>(null);
const paperSize          = ref<'A5' | '80mm' | '58mm'>('A5');
const sysSettings        = ref<any>({});

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
    const res = await api.post(`/installments/contracts/${route.params.id}/payments`, payForm.value);
    showPaymentModal.value = false;
    await load();
    // Build receipt data
    const newPaidCount = contract.value?.paidCount || 0;
    const newRemaining = contract.value?.remainingAmount ?? 0;
    receiptData.value = {
      paymentId:        res.data?.id || Date.now(),
      contractNumber:   contract.value?.contractNumber,
      date:             formatDate(payForm.value.date),
      customerName:     contract.value?.customer?.name,
      customerPhone:    contract.value?.customer?.phone,
      productName:      contract.value?.productName,
      installmentNo:    newPaidCount,
      installmentCount: contract.value?.installmentCount,
      amount:           fmt(payForm.value.amount),
      remaining:        fmt(newRemaining),
      receivedBy:       payForm.value.receivedBy,
      notes:            payForm.value.notes,
    };
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { savingPay.value = false; }
}

function printReceipt(p: any, idx: number) {
  receiptData.value = {
    paymentId:        p.id,
    contractNumber:   contract.value?.contractNumber,
    date:             formatDate(p.date),
    customerName:     contract.value?.customer?.name,
    customerPhone:    contract.value?.customer?.phone,
    productName:      contract.value?.productName,
    installmentNo:    idx,
    installmentCount: contract.value?.installmentCount,
    amount:           fmt(p.amount),
    remaining:        fmt(contract.value?.remainingAmount ?? 0),
    receivedBy:       p.receivedBy,
    notes:            p.notes,
  };
}

function doPrint() {
  if (!receiptData.value) return;
  const d   = receiptData.value;
  const cfg = sysSettings.value;

  const shopName = cfg.shopName || 'نظام الأقساط';
  const subtitle = cfg.subtitle || 'سند قبض';
  const phone    = cfg.phone    || '';
  const address  = cfg.address  || '';
  const footer   = cfg.footer   || 'شكراً لتعاملكم';
  const logo     = cfg.logo     || '';

  const pageCSS: Record<string, string> = {
    'A5':   '@page { size: A5 portrait; margin: 12mm 15mm; }',
    '80mm': '@page { size: 80mm auto;  margin: 4mm 5mm; }',
    '58mm': '@page { size: 58mm auto;  margin: 3mm 4mm; }',
  };
  const bodyW: Record<string, string> = {
    'A5': '100%', '80mm': '70mm', '58mm': '50mm',
  };
  const fz: Record<string, string> = {
    'A5': '13px', '80mm': '11.5px', '58mm': '10px',
  };
  const ps = paperSize.value;

  const maybeRow = (label: string, val: string | undefined, cls = '') =>
    val ? `<div class="row"><span class="lbl">${label}</span><span class="val ${cls}">${val}</span></div>` : '';

  // Build header: logo img or icon fallback
  const hdrLogo = logo
    ? `<img src="${logo}" style="width:56px;height:56px;object-fit:contain;border-radius:8px;margin:0 auto 6px;display:block;" />`
    : `<div class="ico"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="22" height="22" fill="#4f46e5"><path d="M96 64c0-17.7 14.3-32 32-32H448h64c70.7 0 128 57.3 128 128s-57.3 128-128 128H480c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64H96zm416 160h32c35.3 0 64-28.7 64-64s-28.7-64-64-64H512v128zM0 416c0-17.7 14.3-32 32-32H576c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32z"/></svg></div>`;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<title>سند قبض - ${d.contractNumber}</title>
<style>
${pageCSS[ps]}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Arial','Tahoma',sans-serif;
  font-size:${fz[ps]};
  color:#111;background:#fff;
  width:${bodyW[ps]};margin:0 auto;direction:rtl;
}
.hdr{text-align:center;border-bottom:2px dashed #cbd5e1;padding-bottom:10px;margin-bottom:10px}
.ico{width:46px;height:46px;border-radius:50%;background:#e0e7ff;
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 6px}
.hdr-title{font-size:1.1em;font-weight:900;color:#1e293b}
.hdr-sub{font-size:.75em;color:#64748b;margin-top:2px}
.hdr-meta{font-size:.7em;color:#94a3b8;margin-top:1px}
.row{display:flex;justify-content:space-between;align-items:center;
  padding:5px 0;border-bottom:1px solid #f1f5f9}
.lbl{color:#64748b}
.val{font-weight:700}
.val.mono{font-family:monospace}
.val.indigo{color:#4f46e5}
.val.red{color:#dc2626}
.val.sm{font-size:.85em}
.amt{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
  padding:8px 12px;display:flex;justify-content:space-between;
  align-items:center;margin:8px 0}
.amt-lbl{color:#15803d;font-weight:700}
.amt-val{font-size:1.25em;font-weight:900;color:#16a34a}
.sig{border-top:1px dashed #cbd5e1;margin-top:12px;padding-top:10px;
  display:grid;grid-template-columns:1fr 1fr;gap:14px;text-align:center}
.sig-line{height:28px;border-bottom:1px solid #d1d5db;margin-bottom:3px}
.sig-lbl{font-size:.7em;color:#9ca3af}
.footer{text-align:center;font-size:.7em;color:#9ca3af;margin-top:10px}
</style>
</head>
<body>
<div class="hdr">
  ${hdrLogo}
  <div class="hdr-title">${shopName}</div>
  <div class="hdr-sub">${subtitle}</div>
  ${phone   ? `<div class="hdr-meta" dir="ltr">${phone}</div>`   : ''}
  ${address ? `<div class="hdr-meta">${address}</div>` : ''}
</div>
<div class="row"><span class="lbl">رقم السند</span><span class="val mono indigo">#${String(d.paymentId).padStart(6,'0')}</span></div>
<div class="row"><span class="lbl">رقم العقد</span><span class="val mono">${d.contractNumber}</span></div>
<div class="row"><span class="lbl">التاريخ</span><span class="val">${d.date}</span></div>
<div class="row"><span class="lbl">اسم العميل</span><span class="val">${d.customerName||''}</span></div>
${maybeRow('الهاتف', d.customerPhone ? `<span dir="ltr">${d.customerPhone}</span>` : undefined)}
<div class="row"><span class="lbl">المنتج</span><span class="val">${d.productName||''}</span></div>
<div class="row"><span class="lbl">رقم القسط</span><span class="val">${d.installmentNo} / ${d.installmentCount}</span></div>
<div class="amt">
  <span class="amt-lbl">المبلغ المدفوع</span>
  <span class="amt-val">${d.amount}</span>
</div>
<div class="row"><span class="lbl">المتبقي بعد الدفعة</span><span class="val red">${d.remaining}</span></div>
${maybeRow('استلم بواسطة', d.receivedBy)}
${maybeRow('ملاحظات', d.notes, 'sm')}
<div class="sig">
  <div><div class="sig-line"></div><div class="sig-lbl">توقيع المستلم</div></div>
  <div><div class="sig-line"></div><div class="sig-lbl">توقيع العميل</div></div>
</div>
<div class="footer">${footer}</div>
</body></html>`;

  const win = window.open('', '_blank', 'width=520,height=720');
  if (!win) { alert('يرجى السماح بالنوافذ المنبثقة'); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
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
onMounted(() => { load(); loadSettings(); });

function loadSettings() {
  try { sysSettings.value = JSON.parse(localStorage.getItem('inst_settings') || '{}'); } catch { sysSettings.value = {}; }
}
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: all .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
select option { background: #fff; color: #1e293b; }
</style>
