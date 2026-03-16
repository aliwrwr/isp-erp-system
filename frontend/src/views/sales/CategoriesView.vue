<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">التصنيفات</h2>
      <button @click="openAdd" class="bg-sales hover:bg-success-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> إضافة تصنيف</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="cat in categories" :key="cat.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-sales/10 flex items-center justify-center"><i class="fas fa-tag text-sales"></i></div>
          <div><h3 class="font-bold text-secondary text-sm">{{ cat.name }}</h3><p class="text-xs text-gray-400">{{ cat.description || '' }}</p></div>
        </div>
        <div class="flex gap-2 mt-2">
          <button @click="openEdit(cat)" class="text-xs text-primary hover:text-primary-dark"><i class="fas fa-edit ml-1"></i>تعديل</button>
          <button @click="remove(cat.id)" class="text-xs text-danger hover:text-danger-dark"><i class="fas fa-trash ml-1"></i>حذف</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل تصنيف' : 'إضافة تصنيف جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div><label class="block text-sm font-medium text-gray-600 mb-1">اسم التصنيف</label><input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
          <div><label class="block text-sm font-medium text-gray-600 mb-1">الوصف</label><input v-model="form.description" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
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
import { ref, onMounted } from 'vue';
import api from '../../api';

const categories = ref<any[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ name: '', description: '' });

async function loadData() {
  try { const { data } = await api.get('/categories'); categories.value = data; } catch {}
}

function openAdd() { editingId.value = null; form.value = { name: '', description: '' }; showModal.value = true; }
function openEdit(c: any) { editingId.value = c.id; form.value = { name: c.name, description: c.description || '' }; showModal.value = true; }

async function save() {
  try {
    if (editingId.value) { await api.patch(`/categories/${editingId.value}`, form.value); }
    else { await api.post('/categories', form.value); }
    showModal.value = false;
    await loadData();
  } catch {}
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try { await api.delete(`/categories/${id}`); await loadData(); } catch {}
}

onMounted(loadData);
</script>
