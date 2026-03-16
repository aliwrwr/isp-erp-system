<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">قوالب الرسائل</h2>
      <button @click="openAdd" class="bg-messaging hover:opacity-90 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"><i class="fas fa-plus"></i> قالب جديد</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="t in templates" :key="t.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-bold text-secondary text-sm">{{ t.name }}</h3>
          <span class="px-2 py-1 rounded-full text-xs font-medium bg-messaging/10 text-messaging">{{ t.type }}</span>
        </div>
        <p class="text-sm text-gray-400 mb-3">{{ t.content }}</p>
        <div class="flex gap-2">
          <button @click="openEdit(t)" class="text-xs text-primary hover:text-primary-dark"><i class="fas fa-edit ml-1"></i>تعديل</button>
          <button @click="remove(t.id)" class="text-xs text-danger hover:text-danger-dark"><i class="fas fa-trash ml-1"></i>حذف</button>
        </div>
      </div>
    </div>
    <div v-if="templates.length === 0" class="text-center text-gray-400 py-12"><i class="fas fa-file-alt text-4xl mb-3"></i><p>لا يوجد قوالب</p></div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-secondary mb-4">{{ editing ? 'تعديل قالب' : 'إضافة قالب' }}</h3>
        <div class="space-y-3">
          <input v-model="form.name" placeholder="اسم القالب" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          <select v-model="form.type" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option>
          </select>
          <textarea v-model="form.content" rows="4" placeholder="محتوى القالب..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="save" class="flex-1 py-2 bg-messaging text-white rounded-lg text-sm font-medium">حفظ</button>
          <button @click="showModal = false" class="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">إلغاء</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const templates = ref<any[]>([]);
const showModal = ref(false);
const editing = ref<any>(null);
const form = ref({ name: '', content: '', type: 'sms' });

async function loadData() {
  const { data } = await api.get('/messaging/templates');
  templates.value = data;
}

function openAdd() {
  editing.value = null;
  form.value = { name: '', content: '', type: 'sms' };
  showModal.value = true;
}

function openEdit(t: any) {
  editing.value = t;
  form.value = { name: t.name, content: t.content, type: t.type };
  showModal.value = true;
}

async function save() {
  if (editing.value) {
    await api.patch(`/messaging/templates/${editing.value.id}`, form.value);
  } else {
    await api.post('/messaging/templates', form.value);
  }
  showModal.value = false;
  await loadData();
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا القالب؟')) return;
  await api.delete(`/messaging/templates/${id}`);
  await loadData();
}

onMounted(loadData);
</script>
