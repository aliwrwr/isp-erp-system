<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">إدارة الطلبات</h2>
      <button @click="openAdd" class="bg-restaurant hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> طلب جديد</button>
    </div>

    <!-- Status Filters -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button v-for="s in statusFilters" :key="s.value" @click="activeStatus = s.value" :class="activeStatus === s.value ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border border-gray-200'" class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition">{{ s.label }} ({{ countByStatus(s.value) }})</button>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">رقم الطلب</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">الطاولة</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">العميل</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">النوع</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">الأصناف</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">المبلغ</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">الحالة</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">الوقت</th>
            <th class="text-center text-xs font-medium text-gray-500 px-4 py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="o in filtered" :key="o.id" class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-sm font-mono font-bold text-restaurant">{{ o.orderNumber }}</td>
            <td class="px-4 py-3 text-sm">{{ o.table ? 'طاولة ' + o.table.number : '-' }}</td>
            <td class="px-4 py-3 text-sm">{{ o.customerName || '-' }}</td>
            <td class="px-4 py-3"><span class="text-xs px-2 py-0.5 rounded-full" :class="typeClass(o.orderType)">{{ typeLabel(o.orderType) }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ o.items?.length || 0 }} صنف</td>
            <td class="px-4 py-3 text-sm font-bold">{{  Number(o.totalAmount).toFixed(2)  }} د.ع</td>
            <td class="px-4 py-3"><span class="text-xs px-2 py-0.5 rounded-full" :class="statusClass(o.status)">{{ statusLabel(o.status) }}</span></td>
            <td class="px-4 py-3 text-xs text-gray-400">{{ new Date(o.createdAt).toLocaleTimeString('ar') }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-1">
                <button v-if="o.status === 'pending'" @click="updateStatus(o.id, 'preparing')" class="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="بدء التحضير"><i class="fas fa-fire"></i></button>
                <button v-if="o.status === 'preparing'" @click="updateStatus(o.id, 'ready')" class="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="جاهز"><i class="fas fa-check"></i></button>
                <button v-if="o.status === 'ready'" @click="updateStatus(o.id, 'served')" class="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" title="تم التقديم"><i class="fas fa-concierge-bell"></i></button>
                <button v-if="o.status === 'served'" @click="updateStatus(o.id, 'paid')" class="text-xs px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="تم الدفع"><i class="fas fa-money-bill"></i></button>
                <button v-if="o.status !== 'paid' && o.status !== 'cancelled'" @click="updateStatus(o.id, 'cancelled')" class="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="إلغاء"><i class="fas fa-times"></i></button>
                <button @click="viewOrder(o)" class="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100" title="عرض"><i class="fas fa-eye"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="text-center text-gray-400 py-8">لا توجد طلبات</div>
    </div>

    <!-- New Order Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-secondary mb-4">طلب جديد</h3>
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <select v-model.number="form.tableId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">بدون طاولة</option>
              <option v-for="t in availableTables" :key="t.id" :value="t.id">طاولة {{ t.number }} ({{ t.capacity }} أشخاص)</option>
            </select>
            <select v-model="form.orderType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="dine-in">محلي</option>
              <option value="takeaway">سفري</option>
              <option value="delivery">توصيل</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.customerName" placeholder="اسم العميل" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input v-model="form.waiter" placeholder="النادل" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <textarea v-model="form.notes" placeholder="ملاحظات" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>

          <!-- Items -->
          <div class="border border-gray-200 rounded-xl p-3">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-bold text-secondary">الأصناف</h4>
              <button @click="addFormItem" class="text-xs text-restaurant hover:underline"><i class="fas fa-plus"></i> إضافة</button>
            </div>
            <div v-for="(fi, idx) in form.items" :key="idx" class="flex items-center gap-2 mb-2">
              <select v-model.number="fi.menuItemId" class="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                <option value="">اختر صنف</option>
                <option v-for="m in menuItems" :key="m.id" :value="m.id">{{ m.name }} ({{  Number(m.price).toFixed(2)  }} د.ع)</option>
              </select>
              <input v-model.number="fi.quantity" type="number" min="1" class="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-center" />
              <button @click="form.items.splice(idx, 1)" class="text-red-400 hover:text-red-600"><i class="fas fa-trash text-xs"></i></button>
            </div>
            <p class="text-left text-sm font-bold text-restaurant mt-2">المجموع: {{  calcTotal.toFixed(2)  }} د.ع</p>
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="saveOrder" class="flex-1 py-2 bg-restaurant text-white rounded-lg text-sm font-medium">إنشاء الطلب</button>
          <button @click="showModal = false" class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">إلغاء</button>
        </div>
      </div>
    </div>

    <!-- View Order Modal -->
    <div v-if="viewingOrder" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="viewingOrder = null">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-secondary mb-4">تفاصيل الطلب {{ viewingOrder.orderNumber }}</h3>
        <div class="space-y-2 text-sm">
          <p><span class="text-gray-400">الطاولة:</span> {{ viewingOrder.table ? viewingOrder.table.number : '-' }}</p>
          <p><span class="text-gray-400">العميل:</span> {{ viewingOrder.customerName || '-' }}</p>
          <p><span class="text-gray-400">النوع:</span> {{ typeLabel(viewingOrder.orderType) }}</p>
          <p><span class="text-gray-400">الحالة:</span> {{ statusLabel(viewingOrder.status) }}</p>
          <div class="border-t border-gray-100 pt-2 mt-2">
            <p class="font-bold mb-2">الأصناف:</p>
            <div v-for="item in viewingOrder.items" :key="item.id" class="flex justify-between py-1">
              <span>{{ item.menuItem?.name || 'صنف' }} × {{ item.quantity }}</span>
              <span class="font-bold">{{  (item.price * item.quantity).toFixed(2)  }} د.ع</span>
            </div>
            <div class="border-t border-gray-200 mt-2 pt-2 flex justify-between font-bold text-restaurant">
              <span>الإجمالي</span>
              <span>{{  Number(viewingOrder.totalAmount).toFixed(2)  }} د.ع</span>
            </div>
          </div>
        </div>
        <button @click="viewingOrder = null" class="w-full mt-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">إغلاق</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const orders = ref<any[]>([]);
const tables = ref<any[]>([]);
const menuItems = ref<any[]>([]);
const activeStatus = ref('all');
const showModal = ref(false);
const viewingOrder = ref<any>(null);
const form = ref<any>({ tableId: '', orderType: 'dine-in', customerName: '', waiter: '', notes: '', items: [{ menuItemId: '', quantity: 1 }] });

const statusFilters = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'preparing', label: 'قيد التحضير' },
  { value: 'ready', label: 'جاهز' },
  { value: 'served', label: 'تم التقديم' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'cancelled', label: 'ملغي' },
];

const availableTables = computed(() => tables.value.filter(t => t.status === 'available'));
const filtered = computed(() => activeStatus.value === 'all' ? orders.value : orders.value.filter(o => o.status === activeStatus.value));
function countByStatus(s: string) { return s === 'all' ? orders.value.length : orders.value.filter(o => o.status === s).length; }

const calcTotal = computed(() => {
  return form.value.items.reduce((sum: number, fi: any) => {
    const mi = menuItems.value.find(m => m.id === fi.menuItemId);
    return sum + (mi ? mi.price * fi.quantity : 0);
  }, 0);
});

async function load() {
  const [oRes, tRes, mRes] = await Promise.all([api.get('/restaurant/orders'), api.get('/restaurant/tables'), api.get('/restaurant/menu')]);
  orders.value = oRes.data;
  tables.value = tRes.data;
  menuItems.value = mRes.data;
}

function openAdd() {
  form.value = { tableId: '', orderType: 'dine-in', customerName: '', waiter: '', notes: '', items: [{ menuItemId: '', quantity: 1 }] };
  showModal.value = true;
}

function addFormItem() { form.value.items.push({ menuItemId: '', quantity: 1 }); }

async function saveOrder() {
  const body: any = {
    orderType: form.value.orderType,
    customerName: form.value.customerName,
    waiter: form.value.waiter,
    notes: form.value.notes,
    items: form.value.items.filter((fi: any) => fi.menuItemId).map((fi: any) => ({ menuItemId: fi.menuItemId, quantity: fi.quantity })),
  };
  if (form.value.tableId) body.tableId = form.value.tableId;
  await api.post('/restaurant/orders', body);
  showModal.value = false;
  await load();
}

async function updateStatus(id: number, status: string) {
  await api.patch(`/restaurant/orders/${id}`, { status });
  await load();
}

function viewOrder(o: any) { viewingOrder.value = o; }

function statusClass(s: string) {
  return { pending: 'bg-yellow-50 text-yellow-700', preparing: 'bg-blue-50 text-blue-700', ready: 'bg-green-50 text-green-700', served: 'bg-purple-50 text-purple-700', paid: 'bg-gray-100 text-gray-600', cancelled: 'bg-red-50 text-red-700' }[s] || 'bg-gray-50 text-gray-500';
}
function statusLabel(s: string) {
  return { pending: 'قيد الانتظار', preparing: 'قيد التحضير', ready: 'جاهز', served: 'تم التقديم', paid: 'مدفوع', cancelled: 'ملغي' }[s] || s;
}
function typeClass(t: string) {
  return { 'dine-in': 'bg-blue-50 text-blue-700', takeaway: 'bg-orange-50 text-orange-700', delivery: 'bg-green-50 text-green-700' }[t] || 'bg-gray-50 text-gray-500';
}
function typeLabel(t: string) {
  return { 'dine-in': 'محلي', takeaway: 'سفري', delivery: 'توصيل' }[t] || t;
}

onMounted(load);
</script>
