<template>
  <div>
    <h2 class="text-lg font-bold text-secondary mb-6">سجل الرسائل</h2>
    <DataTable title="جميع الرسائل المرسلة">
      <table class="w-full text-sm">
        <thead class="bg-gray-50"><tr>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">التاريخ</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">المستلم</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">النوع</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الرسالة</th>
          <th class="px-4 py-3 text-right text-gray-500 font-medium">الحالة</th>
        </tr></thead>
        <tbody>
          <tr v-for="m in history" :key="m.id" class="border-t border-gray-50 hover:bg-gray-50">
            <td class="px-4 py-3 text-gray-500 text-xs">{{ new Date(m.sentAt).toLocaleString('ar') }}</td>
            <td class="px-4 py-3 font-medium text-secondary">{{ m.recipient }}</td>
            <td class="px-4 py-3 text-gray-500">{{ m.type }}</td>
            <td class="px-4 py-3 text-gray-500 max-w-xs truncate">{{ m.content }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :class="m.status === 'delivered' ? 'bg-green-100 text-green-700' : m.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'">
                {{ {delivered:'تم التوصيل',failed:'فشل',pending:'قيد الإرسال'}[m.status] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';
import DataTable from '../../components/DataTable.vue';

const history = ref<any[]>([]);

async function loadHistory() {
  try {
    const { data } = await api.get('/messaging/messages');
    history.value = data;
  } catch (error) {
    console.error("Failed to load message history:", error);
  }
}

onMounted(loadHistory);
</script>
