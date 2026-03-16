<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">مصروفات المطعم</h2>
      <button @click="openAdd" class="bg-restaurant hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> مصروف جديد</button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-400 mb-1">إجمالي المصروفات</p>
        <p class="text-xl font-bold text-danger">{{  totalExpenses.toFixed(2)  }} د.ع</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-400 mb-1">مصروفات اليوم</p>
        <p class="text-xl font-bold text-restaurant">{{  todayExpenses.toFixed(2)  }} د.ع</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-400 mb-1">مصروفات الشهر</p>
        <p class="text-xl font-bold text-warning">{{  monthExpenses.toFixed(2)  }} د.ع</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p class="text-xs text-gray-400 mb-1">عدد العمليات</p>
        <p class="text-xl font-bold text-secondary">{{ expenses.length }}</p>
      </div>
    </div>

    <!-- Category Filters -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button v-for="c in categoryFilters" :key="c.value" @click="activeCategory = c.value" :class="activeCategory === c.value ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border border-gray-200'" class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition">{{ c.label }}</button>
    </div>

    <!-- Expenses Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">#</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">العنوان</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">المبلغ</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">التصنيف</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">التاريخ</th>
            <th class="text-right text-xs font-medium text-gray-500 px-4 py-3">ملاحظات</th>
            <th class="text-center text-xs font-medium text-gray-500 px-4 py-3">إجراءات</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="(e, idx) in filtered" :key="e.id" class="hover:bg-gray-50 transition">
            <td class="px-4 py-3 text-sm text-gray-400">{{ idx + 1 }}</td>
            <td class="px-4 py-3 text-sm font-medium text-secondary">{{ e.title }}</td>
            <td class="px-4 py-3 text-sm font-bold text-danger">{{  Number(e.amount).toFixed(2)  }} د.ع</td>
            <td class="px-4 py-3"><span class="text-xs px-2 py-0.5 rounded-full" :class="catClass(e.category)">{{ catLabel(e.category) }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-500">{{ e.date }}</td>
            <td class="px-4 py-3 text-xs text-gray-400 max-w-[200px] truncate">{{ e.notes || '-' }}</td>
            <td class="px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click="openEdit(e)" class="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-primary flex items-center justify-center"><i class="fas fa-edit text-xs"></i></button>
                <button @click="remove(e.id)" class="w-7 h-7 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-danger flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filtered.length === 0" class="text-center text-gray-400 py-8">لا توجد مصروفات</div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-secondary mb-4">{{ editing ? 'تعديل مصروف' : 'إضافة مصروف' }}</h3>
        <div class="space-y-3">
          <input v-model="form.title" placeholder="عنوان المصروف" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input v-model.number="form.amount" type="number" step="0.01" placeholder="المبلغ" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select v-model="form.category" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="ingredients">مواد أولية</option>
            <option value="maintenance">صيانة</option>
            <option value="salaries">رواتب</option>
            <option value="utilities">خدمات (كهرباء/ماء/غاز)</option>
            <option value="general">عام</option>
          </select>
          <input v-model="form.date" type="date" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
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

const expenses = ref<any[]>([]);
const activeCategory = ref('all');
const showModal = ref(false);
const editing = ref<any>(null);
const form = ref({ title: '', amount: 0, category: 'general', date: '', notes: '' });

const categoryFilters = [
  { value: 'all', label: 'الكل' },
  { value: 'ingredients', label: 'مواد أولية' },
  { value: 'maintenance', label: 'صيانة' },
  { value: 'salaries', label: 'رواتب' },
  { value: 'utilities', label: 'خدمات' },
  { value: 'general', label: 'عام' },
];

const today = new Date().toISOString().split('T')[0];
const currentMonth = today.slice(0, 7);

const totalExpenses = computed(() => expenses.value.reduce((sum, e) => sum + Number(e.amount), 0));
const todayExpenses = computed(() => expenses.value.filter(e => e.date === today).reduce((sum, e) => sum + Number(e.amount), 0));
const monthExpenses = computed(() => expenses.value.filter(e => e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + Number(e.amount), 0));
const filtered = computed(() => activeCategory.value === 'all' ? expenses.value : expenses.value.filter(e => e.category === activeCategory.value));

async function load() { expenses.value = (await api.get('/restaurant/expenses')).data; }

function openAdd() {
  editing.value = null;
  form.value = { title: '', amount: 0, category: 'general', date: today, notes: '' };
  showModal.value = true;
}
function openEdit(e: any) {
  editing.value = e;
  form.value = { title: e.title, amount: e.amount, category: e.category, date: e.date || '', notes: e.notes || '' };
  showModal.value = true;
}

async function save() {
  if (editing.value) await api.patch(`/restaurant/expenses/${editing.value.id}`, form.value);
  else await api.post('/restaurant/expenses', form.value);
  showModal.value = false;
  await load();
}

async function remove(id: number) {
  if (!confirm('حذف هذا المصروف؟')) return;
  await api.delete(`/restaurant/expenses/${id}`);
  await load();
}

function catClass(c: string) {
  return { ingredients: 'bg-green-50 text-green-700', maintenance: 'bg-blue-50 text-blue-700', salaries: 'bg-purple-50 text-purple-700', utilities: 'bg-yellow-50 text-yellow-700', general: 'bg-gray-100 text-gray-600' }[c] || 'bg-gray-100 text-gray-600';
}
function catLabel(c: string) {
  return { ingredients: 'مواد أولية', maintenance: 'صيانة', salaries: 'رواتب', utilities: 'خدمات', general: 'عام' }[c] || c;
}

onMounted(load);
</script>
