<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">إدارة الحجوزات</h2>
      <button @click="openAdd" class="bg-restaurant hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> حجز جديد</button>
    </div>

    <!-- Status Filters -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button v-for="s in statuses" :key="s.value" @click="activeStatus = s.value" :class="activeStatus === s.value ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border border-gray-200'" class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition">{{ s.label }}</button>
    </div>

    <!-- Reservations List -->
    <div class="space-y-3">
      <div v-for="r in filtered" :key="r.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" :class="statusBg(r.status)">
              <i class="fas" :class="statusIconClass(r.status)"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary text-sm">{{ r.customerName }}</h3>
              <p class="text-xs text-gray-400">{{ r.customerPhone || '-' }}</p>
            </div>
          </div>
          <div class="text-left">
            <p class="text-sm font-medium text-secondary">{{ r.date }}</p>
            <p class="text-xs text-gray-400">{{ r.time }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-bold text-secondary">{{ r.guests }}</p>
            <p class="text-xs text-gray-400">ضيوف</p>
          </div>
          <div class="text-center">
            <p class="text-sm">{{ r.table ? 'طاولة ' + r.table.number : '-' }}</p>
            <p class="text-xs text-gray-400">الطاولة</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full" :class="statusBadge(r.status)">{{ statusLabel(r.status) }}</span>
          <div class="flex gap-1">
            <button v-if="r.status === 'confirmed'" @click="updateStatus(r.id, 'completed')" class="w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 flex items-center justify-center" title="مكتمل"><i class="fas fa-check text-xs"></i></button>
            <button v-if="r.status === 'confirmed'" @click="updateStatus(r.id, 'cancelled')" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center" title="إلغاء"><i class="fas fa-times text-xs"></i></button>
            <button v-if="r.status === 'confirmed'" @click="updateStatus(r.id, 'no-show')" class="w-8 h-8 rounded-lg bg-yellow-50 hover:bg-yellow-100 text-yellow-600 flex items-center justify-center" title="لم يحضر"><i class="fas fa-user-slash text-xs"></i></button>
            <button @click="openEdit(r)" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary flex items-center justify-center"><i class="fas fa-edit text-xs"></i></button>
            <button @click="remove(r.id)" class="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-danger flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>
        <p v-if="r.notes" class="text-xs text-gray-400 mt-2 mr-16">📝 {{ r.notes }}</p>
      </div>
    </div>
    <div v-if="filtered.length === 0" class="text-center text-gray-400 py-12"><i class="fas fa-calendar-alt text-4xl mb-3"></i><p>لا توجد حجوزات</p></div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-secondary mb-4">{{ editing ? 'تعديل حجز' : 'حجز جديد' }}</h3>
        <div class="space-y-3">
          <input v-model="form.customerName" placeholder="اسم العميل" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input v-model="form.customerPhone" placeholder="رقم الهاتف" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <div class="grid grid-cols-2 gap-3">
            <input v-model="form.date" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <input v-model="form.time" type="time" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <input v-model.number="form.guests" type="number" min="1" placeholder="عدد الضيوف" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            <select v-model.number="form.tableId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="">بدون طاولة</option>
              <option v-for="t in tables" :key="t.id" :value="t.id">طاولة {{ t.number }} ({{ t.capacity }})</option>
            </select>
          </div>
          <textarea v-model="form.notes" placeholder="ملاحظات" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="save" class="flex-1 py-2 bg-restaurant text-white rounded-lg text-sm font-medium">حفظ</button>
          <button @click="showModal = false" class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const reservations = ref<any[]>([]);
const tables = ref<any[]>([]);
const activeStatus = ref('all');
const showModal = ref(false);
const editing = ref<any>(null);
const form = ref({ customerName: '', customerPhone: '', date: '', time: '', guests: 2, tableId: '', notes: '' });

const statuses = [
  { value: 'all', label: 'الكل' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'no-show', label: 'لم يحضر' },
];

const filtered = computed(() => activeStatus.value === 'all' ? reservations.value : reservations.value.filter(r => r.status === activeStatus.value));

async function load() {
  const [rRes, tRes] = await Promise.all([api.get('/restaurant/reservations'), api.get('/restaurant/tables')]);
  reservations.value = rRes.data;
  tables.value = tRes.data;
}

function openAdd() {
  editing.value = null;
  const today = new Date().toISOString().split('T')[0];
  form.value = { customerName: '', customerPhone: '', date: today, time: '18:00', guests: 2, tableId: '', notes: '' };
  showModal.value = true;
}
function openEdit(r: any) {
  editing.value = r;
  form.value = { customerName: r.customerName, customerPhone: r.customerPhone || '', date: r.date, time: r.time, guests: r.guests, tableId: r.table?.id || '', notes: r.notes || '' };
  showModal.value = true;
}

async function save() {
  const body: any = { ...form.value };
  if (body.tableId) body.table = { id: body.tableId };
  else delete body.table;
  delete body.tableId;
  if (editing.value) await api.patch(`/restaurant/reservations/${editing.value.id}`, body);
  else await api.post('/restaurant/reservations', body);
  showModal.value = false;
  await load();
}

async function updateStatus(id: number, status: string) {
  await api.patch(`/restaurant/reservations/${id}`, { status });
  await load();
}

async function remove(id: number) {
  if (!confirm('حذف هذا الحجز؟')) return;
  await api.delete(`/restaurant/reservations/${id}`);
  await load();
}

function statusBg(s: string) { return { confirmed: 'bg-green-100 text-green-600', completed: 'bg-blue-100 text-blue-600', cancelled: 'bg-red-100 text-red-600', 'no-show': 'bg-yellow-100 text-yellow-600' }[s] || 'bg-gray-100 text-gray-500'; }
function statusIconClass(s: string) { return { confirmed: 'fa-check', completed: 'fa-check-double', cancelled: 'fa-times', 'no-show': 'fa-user-slash' }[s] || 'fa-calendar'; }
function statusBadge(s: string) { return { confirmed: 'bg-green-50 text-green-700', completed: 'bg-blue-50 text-blue-700', cancelled: 'bg-red-50 text-red-700', 'no-show': 'bg-yellow-50 text-yellow-700' }[s] || 'bg-gray-50 text-gray-500'; }
function statusLabel(s: string) { return { confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي', 'no-show': 'لم يحضر' }[s] || s; }

onMounted(load);
</script>
