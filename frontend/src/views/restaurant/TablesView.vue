<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">إدارة الطاولات</h2>
      <button @click="openAdd" class="bg-restaurant hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> طاولة جديدة</button>
    </div>

    <!-- Section Filters -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button @click="activeSection = ''" :class="!activeSection ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border border-gray-200'" class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition">الكل ({{ tables.length }})</button>
      <button v-for="s in sections" :key="s" @click="activeSection = s" :class="activeSection === s ? 'bg-restaurant text-white' : 'bg-white text-gray-600 border border-gray-200'" class="px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition">{{ s }}</button>
    </div>

    <!-- Tables Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      <div v-for="t in filtered" :key="t.id" class="relative bg-white rounded-xl border-2 p-4 text-center cursor-pointer hover:shadow-md transition" :class="statusBorder(t.status)" @click="openEdit(t)">
        <div class="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-2" :class="statusBg(t.status)">
          <i class="fas fa-chair text-xl" :class="statusIcon(t.status)"></i>
        </div>
        <p class="font-bold text-secondary text-base">{{ t.number }}</p>
        <p class="text-xs text-gray-400">{{ t.capacity }} أشخاص</p>
        <span class="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full" :class="statusBadge(t.status)">{{ statusLabel(t.status) }}</span>
        <p v-if="t.section" class="text-[10px] text-gray-400 mt-1">{{ t.section }}</p>
        <button @click.stop="remove(t.id)" class="absolute top-2 left-2 w-6 h-6 rounded-full bg-gray-50 hover:bg-red-50 text-gray-300 hover:text-red-500 flex items-center justify-center"><i class="fas fa-times text-xs"></i></button>
      </div>
    </div>
    <div v-if="filtered.length === 0" class="text-center text-gray-400 py-12"><i class="fas fa-chair text-4xl mb-3"></i><p>لا توجد طاولات</p></div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mt-6">
      <div class="bg-green-50 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-green-700">{{ tables.filter(t => t.status === 'available').length }}</p><p class="text-xs text-green-600">متاحة</p></div>
      <div class="bg-red-50 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-red-700">{{ tables.filter(t => t.status === 'occupied').length }}</p><p class="text-xs text-red-600">مشغولة</p></div>
      <div class="bg-yellow-50 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-yellow-700">{{ tables.filter(t => t.status === 'reserved').length }}</p><p class="text-xs text-yellow-600">محجوزة</p></div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold text-secondary mb-4">{{ editing ? 'تعديل طاولة' : 'إضافة طاولة' }}</h3>
        <div class="space-y-3">
          <input v-model.number="form.number" type="number" placeholder="رقم الطاولة" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input v-model.number="form.capacity" type="number" placeholder="السعة" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <input v-model="form.section" placeholder="القسم (مثلاً: داخلي، خارجي)" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select v-model="form.status" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="available">متاحة</option>
            <option value="occupied">مشغولة</option>
            <option value="reserved">محجوزة</option>
          </select>
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

const tables = ref<any[]>([]);
const activeSection = ref('');
const showModal = ref(false);
const editing = ref<any>(null);
const form = ref({ number: 0, capacity: 4, section: '', status: 'available' });

const sections = computed(() => [...new Set(tables.value.map(t => t.section).filter(Boolean))]);
const filtered = computed(() => !activeSection.value ? tables.value : tables.value.filter(t => t.section === activeSection.value));

async function load() { tables.value = (await api.get('/restaurant/tables')).data; }

function openAdd() { editing.value = null; form.value = { number: 0, capacity: 4, section: '', status: 'available' }; showModal.value = true; }
function openEdit(t: any) { editing.value = t; form.value = { number: t.number, capacity: t.capacity, section: t.section || '', status: t.status }; showModal.value = true; }

async function save() {
  if (editing.value) await api.patch(`/restaurant/tables/${editing.value.id}`, form.value);
  else await api.post('/restaurant/tables', form.value);
  showModal.value = false;
  await load();
}

async function remove(id: number) {
  if (!confirm('حذف هذه الطاولة؟')) return;
  await api.delete(`/restaurant/tables/${id}`);
  await load();
}

function statusBorder(s: string) { return { available: 'border-green-200', occupied: 'border-red-200', reserved: 'border-yellow-200' }[s] || 'border-gray-200'; }
function statusBg(s: string) { return { available: 'bg-green-100', occupied: 'bg-red-100', reserved: 'bg-yellow-100' }[s] || 'bg-gray-100'; }
function statusIcon(s: string) { return { available: 'text-green-600', occupied: 'text-red-600', reserved: 'text-yellow-600' }[s] || 'text-gray-400'; }
function statusBadge(s: string) { return { available: 'bg-green-50 text-green-700', occupied: 'bg-red-50 text-red-700', reserved: 'bg-yellow-50 text-yellow-700' }[s] || 'bg-gray-50 text-gray-500'; }
function statusLabel(s: string) { return { available: 'متاحة', occupied: 'مشغولة', reserved: 'محجوزة' }[s] || s; }

onMounted(load);
</script>
