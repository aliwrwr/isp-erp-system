<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">التذاكر</h2>
      <button @click="openAdd" class="bg-support hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> تذكرة جديدة</button>
    </div>
    <div class="flex gap-2 mb-4 overflow-x-auto pb-1">
      <button v-for="s in statusFilters" :key="s.value" @click="selectedStatus = s.value"
        class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition"
        :class="selectedStatus === s.value ? 'bg-support text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
        {{ s.label }} ({{ s.count }})
      </button>
    </div>
    <DataTable title="قائمة التذاكر">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">#</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المشترك</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الموضوع</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الأولوية</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الفني</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">إجراءات</th>
        </tr></thead>
        <tbody>
          <tr v-for="t in filteredTickets" :key="t.id" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-400">#{{ t.id }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ t.subscriber?.name || '—' }}</td>
            <td class="px-4 py-3 text-gray-500">{{ t.subject }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="{'bg-red-100 text-red-700':t.priority==='high'||t.priority==='critical','bg-yellow-100 text-yellow-700':t.priority==='medium','bg-blue-100 text-blue-700':t.priority==='low'}">{{ priorityMap[t.priority] || t.priority }}</span></td>
            <td class="px-4 py-3 text-gray-500">{{ t.assignedTo?.name || '—' }}</td>
            <td class="px-4 py-3"><span class="px-2 py-1 rounded-full text-xs font-medium" :class="{'bg-orange-100 text-orange-700':t.status==='open','bg-blue-100 text-blue-700':t.status==='in-progress','bg-green-100 text-green-700':t.status==='resolved','bg-gray-100 text-gray-600':t.status==='closed'}">{{ statusMap[t.status] || t.status }}</span></td>
            <td class="px-4 py-3"><div class="flex gap-2"><button @click="openEdit(t)" class="text-primary hover:text-primary-dark"><i class="fas fa-edit"></i></button><button @click="remove(t.id)" class="text-danger hover:text-danger-dark"><i class="fas fa-trash"></i></button></div></td>
          </tr>
        </tbody>
      </table>
    </DataTable>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل تذكرة' : 'تذكرة جديدة' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="block text-sm font-medium text-gray-600 mb-1">الموضوع</label><input v-model="form.subject" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-support" /></div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">الوصف</label><textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-support"></textarea></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-gray-600 mb-1">الأولوية</label>
              <select v-model="form.priority" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-support">
                <option value="low">عادي</option><option value="medium">متوسط</option><option value="high">عاجل</option><option value="critical">حرج</option>
              </select>
            </div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">الحالة</label>
              <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-support">
                <option value="open">مفتوحة</option><option value="in-progress">قيد المعالجة</option><option value="resolved">تم الحل</option><option value="closed">مغلقة</option>
              </select>
            </div>
          </div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">المشترك</label>
            <select v-model="form.subscriberId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-support">
              <option value="">اختر مشترك</option><option v-for="s in subscribers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500">إلغاء</button>
          <button @click="save" class="px-6 py-2 bg-support text-white text-sm rounded-lg font-medium transition">حفظ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const ticketsData = ref<any[]>([]);
const subscribers = ref<any[]>([]);
const selectedStatus = ref('الكل');
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ subject: '', description: '', priority: 'medium', status: 'open', subscriberId: '' });

const priorityMap: Record<string, string> = { low: 'عادي', medium: 'متوسط', high: 'عاجل', critical: 'حرج' };
const statusMap: Record<string, string> = { open: 'مفتوحة', 'in-progress': 'قيد المعالجة', resolved: 'تم الحل', closed: 'مغلقة' };

const statusFilters = computed(() => {
  const all = ticketsData.value.length;
  const open = ticketsData.value.filter(t => t.status === 'open').length;
  const inProgress = ticketsData.value.filter(t => t.status === 'in-progress').length;
  const resolved = ticketsData.value.filter(t => t.status === 'resolved').length;
  const closed = ticketsData.value.filter(t => t.status === 'closed').length;
  return [
    { value: 'الكل', label: 'الكل', count: all },
    { value: 'open', label: 'مفتوحة', count: open },
    { value: 'in-progress', label: 'قيد المعالجة', count: inProgress },
    { value: 'resolved', label: 'تم الحل', count: resolved },
    { value: 'closed', label: 'مغلقة', count: closed },
  ];
});

const filteredTickets = computed(() => {
  if (selectedStatus.value === 'الكل') return ticketsData.value;
  return ticketsData.value.filter(t => t.status === selectedStatus.value);
});

async function loadData() {
  try {
    const [tickRes, subRes] = await Promise.all([api.get('/tickets'), api.get('/subscribers')]);
    ticketsData.value = tickRes.data;
    subscribers.value = subRes.data;
  } catch {}
}

function openAdd() {
  editingId.value = null;
  form.value = { subject: '', description: '', priority: 'medium', status: 'open', subscriberId: '' };
  showModal.value = true;
}

function openEdit(t: any) {
  editingId.value = t.id;
  form.value = { subject: t.subject, description: t.description || '', priority: t.priority, status: t.status, subscriberId: t.subscriber?.id || '' };
  showModal.value = true;
}

async function save() {
  try {
    const payload: any = { ...form.value };
    if (payload.subscriberId) payload.subscriberId = Number(payload.subscriberId); else delete payload.subscriberId;
    if (editingId.value) { await api.patch(`/tickets/${editingId.value}`, payload); }
    else { await api.post('/tickets', payload); }
    showModal.value = false;
    await loadData();
  } catch {}
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try { await api.delete(`/tickets/${id}`); await loadData(); } catch {}
}

onMounted(loadData);
</script>
