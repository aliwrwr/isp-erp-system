<template>
  <div>
    <h2 class="text-lg font-bold text-secondary mb-6">إرسال رسالة</h2>
    <div class="max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">نوع الإرسال</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="sendType" value="single" class="text-messaging" /> رسالة فردية</label>
            <label class="flex items-center gap-2 text-sm"><input type="radio" v-model="sendType" value="bulk" class="text-messaging" /> رسالة جماعية</label>
          </div>
        </div>
        <div v-if="sendType === 'single'">
          <label class="block text-sm font-medium text-gray-600 mb-1">المستلم</label>
          <select v-model="recipientId" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="">اختر مشترك...</option>
            <option v-for="s in subscribers" :key="s.id" :value="s.id">{{ s.name || s.username }}</option>
          </select>
        </div>
        <div v-else>
          <label class="block text-sm font-medium text-gray-600 mb-1">المجموعة</label>
          <select v-model="bulkGroup" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="all">جميع المشتركين</option>
            <option value="active">المشتركين النشطين</option>
            <option value="expired">منتهي الصلاحية</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">القالب (اختياري)</label>
          <select v-model="templateId" @change="applyTemplate" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="">بدون قالب</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">نوع الرسالة</label>
          <select v-model="msgType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging">
            <option value="sms">SMS</option><option value="whatsapp">WhatsApp</option><option value="email">Email</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">نص الرسالة</label>
          <textarea v-model="content" rows="5" placeholder="اكتب رسالتك هنا..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-messaging"></textarea>
        </div>
        <button @click="send" :disabled="sending" class="px-6 py-2.5 bg-messaging hover:opacity-90 text-white font-medium rounded-xl transition flex items-center gap-2"><i class="fas fa-paper-plane"></i> {{ sending ? 'جاري الإرسال...' : 'إرسال الرسالة' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const subscribers = ref<any[]>([]);
const templates = ref<any[]>([]);
const sendType = ref('single');
const recipientId = ref('');
const bulkGroup = ref('all');
const templateId = ref('');
const msgType = ref('sms');
const content = ref('');
const sending = ref(false);

function applyTemplate() {
  const t = templates.value.find(t => t.id === Number(templateId.value));
  if (t) content.value = t.content;
}

async function send() {
  if (!content.value) return;
  sending.value = true;
  try {
    if (sendType.value === 'single') {
      const sub = subscribers.value.find(s => s.id === Number(recipientId.value));
      if (!sub) return;
      await api.post('/messaging/messages', { recipient: sub.name || sub.username, type: msgType.value, content: content.value, templateName: templateId.value ? templates.value.find(t => t.id === Number(templateId.value))?.name : undefined });
    } else {
      const targets = bulkGroup.value === 'active' ? subscribers.value.filter(s => s.status === 'active') : bulkGroup.value === 'expired' ? subscribers.value.filter(s => s.status !== 'active') : subscribers.value;
      for (const s of targets) {
        await api.post('/messaging/messages', { recipient: s.name || s.username, type: msgType.value, content: content.value });
      }
    }
    alert('تم إرسال الرسالة بنجاح');
    content.value = '';
    recipientId.value = '';
    templateId.value = '';
  } catch {
    alert('حدث خطأ أثناء الإرسال');
  } finally {
    sending.value = false;
  }
}

onMounted(async () => {
  try {
    const [sRes, tRes] = await Promise.all([
      api.get('/subscribers'),
      api.get('/messaging/templates'),
    ]);
    subscribers.value = sRes.data;
    templates.value = tRes.data;
  } catch {}
});
</script>
