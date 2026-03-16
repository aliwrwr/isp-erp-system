<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">الراوترات</h2>
      <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة راوتر
      </button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="r in routers" :key="r.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-internet/10 flex items-center justify-center">
            <i class="fas fa-server text-internet"></i>
          </div>
          <div>
            <h3 class="font-bold text-secondary text-sm">{{ r.name }}</h3>
            <p class="text-xs text-gray-400">{{ r.ipAddress }}</p>
          </div>
        </div>
        <div class="text-sm text-gray-500 space-y-1">
          <div class="flex justify-between"><span>المنفذ</span><span class="font-medium text-secondary">{{ r.port || '—' }}</span></div>
        </div>
        <div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button @click="openEdit(r)" class="flex-1 text-center py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition">تعديل</button>
          <button @click="remove(r.id)" class="flex-1 text-center py-1.5 text-xs text-danger hover:bg-danger/5 rounded-lg transition">حذف</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل راوتر' : 'إضافة راوتر جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2"><label class="block text-sm font-medium text-gray-600 mb-1">اسم الراوتر</label><input v-model="form.name" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">عنوان IP</label><input v-model="form.ipAddress" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">المنفذ</label><input v-model="form.port" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">اسم المستخدم</label><input v-model="form.username" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label class="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label><input v-model="form.password" type="password" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          <button @click="save" class="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg font-medium transition">حفظ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const routers = ref<any[]>([]);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({ name: '', ipAddress: '', port: 8728, username: '', password: '' });

async function loadData() {
  try { const { data } = await api.get('/routers'); routers.value = data; } catch {}
}

function openAdd() {
  editingId.value = null;
  form.value = { name: '', ipAddress: '', port: 8728, username: '', password: '' };
  showModal.value = true;
}

function openEdit(r: any) {
  editingId.value = r.id;
  form.value = { name: r.name, ipAddress: r.ipAddress, port: r.port || 8728, username: r.username || '', password: '' };
  showModal.value = true;
}

async function save() {
  try {
    const payload: any = { ...form.value, port: Number(form.value.port) };
    if (!payload.password) delete payload.password;
    if (editingId.value) { await api.patch(`/routers/${editingId.value}`, payload); }
    else { await api.post('/routers', payload); }
    showModal.value = false;
    await loadData();
  } catch {}
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من الحذف؟')) return;
  try { await api.delete(`/routers/${id}`); await loadData(); } catch {}
}

onMounted(loadData);
</script>
