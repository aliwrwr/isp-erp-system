<template>
  <transition name="modal-fade">
    <div
      v-if="show && subscriber"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-800">
            تفاصيل المشترك
          </h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-8 overflow-y-auto">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Basic Info -->
            <div class="lg:col-span-2 space-y-6">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-primary">
                  {{ subscriber?.name ? subscriber.name.charAt(0) : '' }}
                </div>
                <div>
                  <h4 class="text-2xl font-bold text-gray-900">{{ subscriber?.name }}</h4>
                  <p class="text-gray-500">{{ subscriber?.username }}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <div class="flex items-start gap-3">
                  <i class="fas fa-phone text-gray-400 mt-1"></i>
                  <div>
                    <p class="text-sm text-gray-500">الهاتف</p>
                    <p class="font-semibold text-gray-800">{{ subscriber?.phone || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="fas fa-map-marker-alt text-gray-400 mt-1"></i>
                  <div>
                    <p class="text-sm text-gray-500">العنوان</p>
                    <p class="font-semibold text-gray-800">{{ subscriber?.address || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="fas fa-box text-gray-400 mt-1"></i>
                  <div>
                    <p class="text-sm text-gray-500">الباقة</p>
                    <p class="font-semibold text-gray-800">{{ subscriber?.package?.name || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <i class="fas fa-calendar-alt text-gray-400 mt-1"></i>
                  <div>
                    <p class="text-sm text-gray-500">تاريخ الانتهاء</p>
                    <p class="font-semibold text-gray-800">{{ subscriber?.expirationDate ? new Date(subscriber.expirationDate).toLocaleDateString() : '—' }}</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Financial Info -->
            <div class="space-y-4 bg-gray-50 p-6 rounded-xl">
              <h5 class="text-lg font-bold text-gray-800 border-b pb-3 mb-3">الوضع المالي</h5>
              <div class="flex justify-between items-center">
                <p class="text-gray-600">الرصيد</p>
                <p class="font-bold text-green-600 text-lg">{{ subscriber?.balance ? subscriber.balance.toLocaleString() + ' د.ع' : '0 د.ع' }}</p>
              </div>
              <div class="flex justify-between items-center">
                <p class="text-gray-600">الديون</p>
                <p class="font-bold text-red-600 text-lg">{{ subscriber?.debt ? subscriber.debt.toLocaleString() + ' د.ع' : '0 د.ع' }}</p>
              </div>
              <div class="flex justify-between items-center pt-3 border-t">
                <p class="text-gray-600">الحالة</p>
                <span :class="['px-3 py-1 rounded-full text-xs font-semibold', subscriber?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                  {{ subscriber?.status === 'active' ? 'نشط' : 'غير نشط' }}
                </span>
              </div>
            </div>
          </div>
          <!-- Subscription History -->
          <div class="mt-8">
            <h5 class="text-lg font-bold text-gray-800 mb-4">سجل الاشتراكات</h5>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الباقة</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ البدء</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاريخ الانتهاء</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="!subscriber?.subscriptions || subscriber.subscriptions.length === 0">
                    <td colspan="4" class="px-6 py-12 text-center text-gray-500">لا يوجد سجل اشتراكات</td>
                  </tr>
                  <tr v-for="sub in subscriber?.subscriptions" :key="sub.id">
                    <td class="px-6 py-4 whitespace-nowrap">{{ sub.package?.name || '—' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ new Date(sub.startDate).toLocaleDateString() }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ new Date(sub.endDate).toLocaleDateString() }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">{{ sub.price?.toLocaleString?.() || '—' }} د.ع</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="p-4 bg-gray-50 border-t rounded-b-2xl">
          <button
            @click="close"
            class="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  subscriber: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
</style>
