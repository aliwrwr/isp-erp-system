<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">المصروفات</h2>
      <button @click="openAdd" class="bg-sales hover:bg-success-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> إضافة مصروف</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      <StatsCard title="مصروفات الشهر" :value="totalExpenses" icon="fas fa-receipt" color="#E74C3C" />
      <StatsCard title="عدد المصروفات" :value="expenses.length" icon="fas fa-list" color="#F39C12" />
      <StatsCard title="أعلى مصروف" :value="maxExpense" icon="fas fa-arrow-up" color="#8E44AD" />
      <StatsCard title="أقل مصروف" :value="minExpense" icon="fas fa-arrow-down" color="#2980B9" />
    </div>
    <DataTable title="سجل المصروفات">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">النوع</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المبلغ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">ملاحظات</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">إجراءات</th>
        </tr></thead>
        <tbody>
          <tr v-for="e in expenses" :key="e.id" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500">{{ e.date }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ e.category }}</td>
            <td class="px-4 py-3 font-bold text-danger">{{  e.amount  }} د.ع</td>
            <td class="px-4 py-3 text-gray-500">{{ e.description }}</td>
            <td class="px-4 py-3"><button @click="remove(e.id)" class="text-danger hover:text-danger-dark"><i class="fas fa-trash"></i></button></td>
          </tr>
        </tbody>
      </table>
    </DataTable>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">إضافة مصروف</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="block text-sm font-medium text-gray-600 mb-1">الوصف</label><input v-model="form.description" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">المبلغ</label><input v-model="form.amount" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">التصنيف</label>
            <select v-model="form.category" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales">
              <option value="general">عام</option><option value="rent">إيجار</option><option value="utilities">خدمات</option><option value="salary">رواتب</option><option value="maintenance">صيانة</option>
            </select>
          </div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">التاريخ</label><input v-model="form.date" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500">إلغاء</button>
          <button @click="save" class="px-6 py-2 bg-sales text-white text-sm rounded-lg font-medium transition">حفظ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import StatsCard from '../../components/StatsCard.vue';
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const expenses = ref<any[]>([]);
const showModal = ref(false);
const form = ref({ description: '', amount: 0, category: 'general', date: new Date().toISOString().slice(0, 10) });

const totalExpenses = computed(() => '$' + expenses.value.reduce((s, e) => s + Number(e.amount || 0), 0).toLocaleString());
const maxExpense = computed(() => {
  if (!expenses.value.length) return '$0';
  return '$' + Math.max(...expenses.value.map(e => Number(e.amount || 0)));
});
const minExpense = computed(() => {
  if (!expenses.value.length) return '$0';
  return '$' + Math.min(...expenses.value.map(e => Number(e.amount || 0)));
});

async function loadData() {
  try { const { data } = await api.get('/expenses'); expenses.value = data; } catch {}
}

function openAdd() { form.value = { description: '', amount: 0, category: 'general', date: new Date().toISOString().slice(0, 10) }; showModal.value = true; }

async function save() {
  try {
    await api.post('/expenses', { ...form.value, amount: Number(form.value.amount) });
    showModal.value = false;
    await loadData();
  } catch {}
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try { await api.delete(`/expenses/${id}`); await loadData(); } catch {}
}

onMounted(loadData);
</script>
