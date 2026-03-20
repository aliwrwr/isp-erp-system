<template>
  <div class="min-h-screen flex" dir="rtl">
    <!-- Mobile Overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>

    <!-- Sidebar -->
    <aside
      :class="[sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0']"
      class="fixed lg:static inset-y-0 right-0 z-40 w-64 bg-sidebar text-white transition-transform duration-300 flex flex-col"
    >
      <!-- Sidebar Header -->
      <div class="p-4 border-b border-white/10 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center" :style="{ backgroundColor: currentSystemColor }">
          <i :class="currentSystemIcon" class="text-white"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="font-bold text-sm truncate">{{ currentSystemName }}</h2>
          <p class="text-xs text-gray-400">ISP ERP</p>
        </div>
        <button @click="sidebarOpen = false" class="lg:hidden text-gray-400 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 overflow-y-auto py-4">
        <router-link
          v-for="item in menuItems"
          :key="item.route"
          :to="item.route"
          @click="sidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 mx-2 rounded-xl text-sm transition-colors"
          :class="isActive(item.route) ? 'bg-white/15 text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'"
        >
          <i :class="item.icon" class="w-5 text-center"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Back to Systems -->
      <div class="p-4 border-t border-white/10">
        <router-link to="/select-system" class="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition">
          <i class="fas fa-th-large"></i>
          <span>تغيير النظام</span>
        </router-link>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Top Bar -->
      <header class="bg-white shadow-sm sticky top-0 z-20">
        <div class="flex items-center justify-between px-4 lg:px-6 py-3">
          <div class="flex items-center gap-3">
            <button @click="sidebarOpen = true" class="lg:hidden text-gray-500 hover:text-gray-700">
              <i class="fas fa-bars text-xl"></i>
            </button>
            <h1 class="text-lg font-bold text-secondary hidden sm:block">{{ pageTitle }}</h1>
          </div>
          <div class="flex items-center gap-4">
            <button class="relative text-gray-400 hover:text-gray-600">
              <i class="fas fa-bell text-lg"></i>
              <span class="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] rounded-full flex items-center justify-center">3</span>
            </button>
            <div class="flex items-center gap-2 text-sm text-gray-500">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <i class="fas fa-user text-primary text-xs"></i>
              </div>
              <span class="hidden sm:inline">{{ auth.userName || 'مدير' }}</span>
            </div>
            <button @click="handleLogout" class="text-gray-400 hover:text-danger transition" title="خروج">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-4 lg:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const sidebarOpen = ref(false);

const systemMenus: Record<string, { label: string; icon: string; route: string }[]> = {
  internet: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/internet' },
    { label: 'المشتركين', icon: 'fas fa-users', route: '/internet/subscribers' },
    { label: 'المتصلين', icon: 'fas fa-signal', route: '/internet/connected' },
    { label: 'الباقات', icon: 'fas fa-box', route: '/internet/packages' },
    { label: 'الاشتراكات', icon: 'fas fa-file-contract', route: '/internet/subscriptions' },
    { label: 'الراوترات', icon: 'fas fa-server', route: '/internet/routers' },
    { label: 'التقارير', icon: 'fas fa-chart-bar', route: '/internet/reports' },
    { label: 'المدراء', icon: 'fas fa-user-shield', route: '/internet/managers' },
    { label: 'سجل العمليات', icon: 'fas fa-history', route: '/internet/log' },
    { label: 'الإعدادات', icon: 'fas fa-cog', route: '/internet/settings' },
  ],
  sales: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/sales' },
    { label: 'نقطة البيع', icon: 'fas fa-cash-register', route: '/sales/pos' },
    { label: 'المنتجات', icon: 'fas fa-boxes', route: '/sales/products' },
    { label: 'العملاء', icon: 'fas fa-users', route: '/sales/customers' },
    { label: 'التصنيفات', icon: 'fas fa-tags', route: '/sales/categories' },
    { label: 'الفواتير', icon: 'fas fa-file-invoice-dollar', route: '/sales/invoices' },
    { label: 'الصندوق', icon: 'fas fa-cash-register', route: '/sales/cashbox' },
    { label: 'المصروفات', icon: 'fas fa-hand-holding-usd', route: '/sales/expenses' },
    { label: 'المخزون', icon: 'fas fa-warehouse', route: '/sales/inventory' },
    { label: 'الموردين', icon: 'fas fa-truck', route: '/sales/suppliers' },
  ],
  hr: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/hr' },
    { label: 'الموظفين', icon: 'fas fa-user-tie', route: '/hr/employees' },
    { label: 'الأقسام', icon: 'fas fa-building', route: '/hr/departments' },
    { label: 'الحضور', icon: 'fas fa-clock', route: '/hr/attendance' },
    { label: 'الرواتب', icon: 'fas fa-money-check-alt', route: '/hr/salaries' },
  ],
  support: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/support' },
    { label: 'التذاكر', icon: 'fas fa-ticket-alt', route: '/support/tickets' },
    { label: 'الفنيين', icon: 'fas fa-hard-hat', route: '/support/technicians' },
  ],
  messaging: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/messaging' },
    { label: 'إرسال رسالة', icon: 'fas fa-paper-plane', route: '/messaging/send' },
    { label: 'القوالب', icon: 'fas fa-file-alt', route: '/messaging/templates' },
    { label: 'السجل', icon: 'fas fa-history', route: '/messaging/history' },
    { label: 'واتساب الاشتراكات', icon: 'fab fa-whatsapp', route: '/messaging/whatsapp-internet' },
    { label: 'واتساب الأقساط', icon: 'fab fa-whatsapp', route: '/messaging/whatsapp-installments' },
    { label: 'واتساب الدعم الفني', icon: 'fab fa-whatsapp', route: '/messaging/whatsapp-support' },
  ],
  restaurant: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/restaurant' },
    { label: 'نقطة البيع', icon: 'fas fa-cash-register', route: '/restaurant/pos' },
    { label: 'المصروفات', icon: 'fas fa-hand-holding-usd', route: '/restaurant/expenses' },
    { label: 'قائمة الطعام', icon: 'fas fa-utensils', route: '/restaurant/menu' },
    { label: 'التقارير', icon: 'fas fa-chart-bar', route: '/restaurant/reports' },
    { label: 'المطبخ', icon: 'fas fa-fire', route: '/restaurant/kitchen' },
    { label: 'الحجوزات', icon: 'fas fa-calendar-alt', route: '/restaurant/reservations' },
    { label: 'الطلبات', icon: 'fas fa-clipboard-list', route: '/restaurant/orders' },
    { label: 'الإعدادات', icon: 'fas fa-cog', route: '/restaurant/settings' },
  ],
  installments: [
    { label: 'لوحة التحكم', icon: 'fas fa-tachometer-alt', route: '/installments' },
    { label: 'العملاء', icon: 'fas fa-users', route: '/installments/customers' },
    { label: 'العقود', icon: 'fas fa-file-contract', route: '/installments/contracts' },
    { label: 'الدفعات', icon: 'fas fa-coins', route: '/installments/payments' },
    { label: 'التقارير', icon: 'fas fa-chart-bar', route: '/installments/reports' },
    { label: 'الإعدادات', icon: 'fas fa-cog', route: '/installments/settings' },
  ],
};

const systemMeta: Record<string, { name: string; icon: string; color: string }> = {
  internet: { name: 'نظام الاشتراكات', icon: 'fas fa-wifi', color: '#2980B9' },
  sales: { name: 'نظام المبيعات', icon: 'fas fa-cash-register', color: '#27AE60' },
  hr: { name: 'شؤون الموظفين', icon: 'fas fa-users-cog', color: '#8E44AD' },
  support: { name: 'الدعم الفني', icon: 'fas fa-headset', color: '#E67E22' },
  messaging: { name: 'نظام الرسائل', icon: 'fas fa-comment-dots', color: '#16A085' },
  restaurant: { name: 'نظام المطاعم', icon: 'fas fa-utensils', color: '#D35400' },
  installments: { name: 'نظام الأقساط', icon: 'fas fa-hand-holding-usd', color: '#6366F1' },
};

const currentSystem = computed(() => (route.meta.system as string) || 'internet');

// Permission mapping: route -> permission key
const routePermissions: Record<string, string> = {
  '/internet/subscribers': 'internet.subscribers',
  '/internet/connected': 'internet.connected',
  '/internet/packages': 'internet.packages',
  '/internet/subscriptions': 'internet.subscriptions',
  '/internet/routers': 'internet.routers',
  '/internet/reports': 'internet.reports',
  '/internet/managers': 'internet.managers',
  '/internet/log': 'internet.log',
  '/internet/settings': 'internet.settings',
  '/internet/whatsapp': 'internet.whatsapp',
  '/sales/pos': 'sales.pos',
  '/sales/products': 'sales.products',
  '/sales/customers': 'sales.customers',
  '/sales/categories': 'sales.categories',
  '/sales/invoices': 'sales.invoices',
  '/sales/cashbox': 'sales.expenses',
  '/sales/expenses': 'sales.expenses',
  '/sales/inventory': 'sales.inventory',
  '/sales/suppliers': 'sales.suppliers',
  '/hr/employees': 'hr.employees',
  '/hr/departments': 'hr.departments',
  '/hr/attendance': 'hr.attendance',
  '/hr/salaries': 'hr.salaries',
  '/support/tickets': 'support.tickets',
  '/support/technicians': 'support.technicians',
  '/messaging/send': 'messaging.send',
  '/messaging/templates': 'messaging.templates',
  '/messaging/history': 'messaging.history',
  '/messaging/whatsapp-internet': 'messaging.whatsapp_internet',
  '/messaging/whatsapp-installments': 'messaging.whatsapp_installments',
  '/messaging/whatsapp-support': 'messaging.whatsapp_support',
  '/restaurant/menu': 'restaurant.menu',
  '/restaurant/tables': 'restaurant.tables',
  '/restaurant/orders': 'restaurant.orders',
  '/restaurant/kitchen': 'restaurant.kitchen',
  '/restaurant/reservations': 'restaurant.reservations',
  '/restaurant/pos': 'restaurant.orders',
  '/restaurant/expenses': 'restaurant.expenses',
  '/restaurant/reports': 'restaurant.reports',
  '/restaurant/settings': 'restaurant.settings',
  '/installments/customers': 'installments.customers',
  '/installments/contracts': 'installments.contracts',
  '/installments/payments': 'installments.payments',
  '/installments/reports': 'installments.reports',
};

const menuItems = computed(() => {
  const items = systemMenus[currentSystem.value] || [];
  return items.filter(item => {
    // Dashboard is always visible if user has access to the system
    if (item.route === `/${currentSystem.value}`) return true;
    const perm = routePermissions[item.route];
    if (!perm) return true;
    return auth.hasPermission(perm);
  });
});
const currentSystemName = computed(() => systemMeta[currentSystem.value]?.name || '');
const currentSystemIcon = computed(() => systemMeta[currentSystem.value]?.icon || '');
const currentSystemColor = computed(() => systemMeta[currentSystem.value]?.color || '#3498DB');

const pageTitle = computed(() => {
  const item = menuItems.value.find(m => m.route === route.path);
  return item?.label || 'لوحة التحكم';
});

function isActive(path: string) {
  return route.path === path;
}

function handleLogout() {
  auth.logout();
  router.push('/login');
}
</script>
