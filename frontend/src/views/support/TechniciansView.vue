<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">الفنيين</h2>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="t in technicians" :key="t.id" class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-support/10 flex items-center justify-center"><i class="fas fa-hard-hat text-support text-lg"></i></div>
          <div>
            <h3 class="font-bold text-secondary">{{ t.name }}</h3>
            <p class="text-xs text-gray-400">{{ t.phone || '—' }}</p>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between text-gray-500"><span>المنصب</span><span class="font-medium text-secondary">{{ t.position || '—' }}</span></div>
          <div class="flex justify-between text-gray-500"><span>القسم</span><span class="font-medium text-secondary">{{ t.department?.name || '—' }}</span></div>
          <div class="flex justify-between text-gray-500"><span>الحالة</span><span :class="t.status === 'active' ? 'text-success' : 'text-danger'">{{ t.status === 'active' ? 'نشط' : 'غير نشط' }}</span></div>
        </div>
      </div>
    </div>
    <div v-if="technicians.length === 0" class="text-center text-gray-400 py-12">
      <i class="fas fa-users text-4xl mb-3"></i>
      <p>لا يوجد فنيين حالياً</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const technicians = ref<any[]>([]);

onMounted(async () => {
  try {
    const { data } = await api.get('/employees');
    technicians.value = data;
  } catch {}
});
</script>
