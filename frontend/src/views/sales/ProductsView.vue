<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">المنتجات</h2>
      <button @click="openAdd" class="bg-sales hover:bg-success-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> إضافة منتج</button>
    </div>
    <DataTable title="قائمة المنتجات">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المنتج</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التصنيف</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">السعر</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التكلفة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المخزون</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">إجراءات</th>
        </tr></thead>
        <tbody>
          <tr v-for="p in products" :key="p.id" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-secondary">{{ p.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ p.category?.name || '—' }}</td>
            <td class="px-4 py-3 text-success font-bold">{{  p.price  }} د.ع</td>
            <td class="px-4 py-3 text-gray-500">{{  p.cost  }} د.ع</td>
            <td class="px-4 py-3"><span :class="p.stock < 10 ? 'text-danger font-bold' : 'text-gray-500'">{{ p.stock }}</span></td>
            <td class="px-4 py-3"><div class="flex gap-2"><button @click="openEdit(p)" class="text-primary hover:text-primary-dark"><i class="fas fa-edit"></i></button><button @click="remove(p.id)" class="text-danger hover:text-danger-dark"><i class="fas fa-trash"></i></button></div></td>
          </tr>
        </tbody>
      </table>
    </DataTable>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل منتج' : 'إضافة منتج جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2"><label class="block text-sm font-medium text-gray-600 mb-1">اسم المنتج</label><input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">السعر</label><input v-model="form.price" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">التكلفة</label><input v-model="form.cost" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">المخزون</label><input v-model="form.stock" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">التصنيف</label>
              <select v-model="form.categoryId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sales">
                <option value="">اختر تصنيف</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
          </div>
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
import DataTable from '../../components/DataTable.vue';
import api from '../../api';

const products = ref<any[]>([]);
const categories = ref<any[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ name: '', price: 0, cost: 0, stock: 0, categoryId: '' });

async function loadData() {
  try {
    const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
    products.value = prodRes.data;
    categories.value = catRes.data;
  } catch {}
}

function openAdd() {
  editingId.value = null;
  form.value = { name: '', price: 0, cost: 0, stock: 0, categoryId: '' };
  showModal.value = true;
}

function openEdit(p: any) {
  editingId.value = p.id;
  form.value = { name: p.name, price: p.price, cost: p.cost, stock: p.stock, categoryId: p.category?.id || '' };
  showModal.value = true;
}

async function save() {
  try {
    const payload: any = { ...form.value, price: Number(form.value.price), cost: Number(form.value.cost), stock: Number(form.value.stock) };
    if (payload.categoryId) payload.categoryId = Number(payload.categoryId); else delete payload.categoryId;
    if (editingId.value) { await api.patch(`/products/${editingId.value}`, payload); }
    else { await api.post('/products', payload); }
    showModal.value = false;
    await loadData();
  } catch {}
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try { await api.delete(`/products/${id}`); await loadData(); } catch {}
}

onMounted(loadData);
</script>
