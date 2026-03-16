<template>
  <div class="min-h-screen bg-bg">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-[#1A2980] to-[#26D0CE] rounded-xl flex items-center justify-center">
            <i class="fas fa-network-wired text-white"></i>
          </div>
          <div>
            <h1 class="text-lg font-bold text-secondary">ISP ERP System</h1>
            <p class="text-xs text-gray-400">اختر النظام للمتابعة</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">
            <i class="fas fa-user ml-1"></i> {{ auth.userName || 'مدير النظام' }}
          </span>
          <button @click="handleLogout" class="text-danger hover:text-danger-dark transition text-sm">
            <i class="fas fa-sign-out-alt ml-1"></i> خروج
          </button>
        </div>
      </div>
    </header>

    <!-- Systems Grid -->
    <main class="max-w-5xl mx-auto px-6 py-12">
      <h2 class="text-2xl font-bold text-center text-secondary mb-2">مرحباً بك في نظام الإدارة</h2>
      <p class="text-center text-gray-400 mb-10">اختر النظام الذي تريد الدخول إليه</p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="system in systems"
          :key="system.id"
          @click="selectSystem(system)"
          class="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 hover:border-transparent"
        >
          <div class="p-6">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
              :style="{ backgroundColor: system.color + '15' }"
            >
              <i :class="system.icon" class="text-2xl" :style="{ color: system.color }"></i>
            </div>
            <h3 class="text-lg font-bold text-secondary mb-1">{{ system.nameAr }}</h3>
            <p class="text-sm text-gray-400">{{ system.desc }}</p>
          </div>
          <div class="h-1 transition-all duration-300 group-hover:h-1.5" :style="{ backgroundColor: system.color }"></div>
        </div>
      </div>

      <!-- No permissions message -->
      <div v-if="systems.length === 0" class="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-lock text-gray-300 text-3xl"></i>
        </div>
        <h3 class="text-lg font-bold text-secondary mb-2">لا توجد صلاحيات</h3>
        <p class="text-sm text-gray-400">لم يتم تعيين صلاحيات لحسابك بعد. تواصل مع مدير النظام.</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const allSystems = [
  { id: 'internet', nameAr: 'نظام الاشتراكات', desc: 'إدارة اشتراكات الإنترنت والمشتركين', icon: 'fas fa-wifi', color: '#2980B9', route: '/internet' },
  { id: 'sales', nameAr: 'نظام المبيعات', desc: 'نقاط البيع والفواتير والمخزون', icon: 'fas fa-cash-register', color: '#27AE60', route: '/sales' },
  { id: 'hr', nameAr: 'شؤون الموظفين', desc: 'إدارة الموظفين والحضور والرواتب', icon: 'fas fa-users-cog', color: '#8E44AD', route: '/hr' },
  { id: 'support', nameAr: 'الدعم الفني', desc: 'تذاكر الدعم والصيانة', icon: 'fas fa-headset', color: '#E67E22', route: '/support' },
  { id: 'messaging', nameAr: 'نظام الرسائل', desc: 'إرسال رسائل وإشعارات للمشتركين', icon: 'fas fa-comment-dots', color: '#16A085', route: '/messaging' },
  { id: 'restaurant', nameAr: 'نظام المطاعم', desc: 'إدارة المطعم والطلبات والحجوزات', icon: 'fas fa-utensils', color: '#D35400', route: '/restaurant' },
];

const systems = computed(() => {
  return allSystems.filter(s => auth.hasSystemAccess(s.id));
});

function selectSystem(system: typeof allSystems[0]) {
  auth.setSystem(system.id);
  router.push(system.route);
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
