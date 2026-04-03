import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Permission mapping for routes
const routePermissions: Record<string, string> = {
  'ManagementReports': 'internet.management_reports',
  'Subscribers': 'internet.subscribers',
  'ConnectedUsers': 'internet.connected',
  'Packages': 'internet.packages',
  'Subscriptions': 'internet.subscriptions',
  'Routers': 'internet.routers',
  'InternetReports': 'internet.reports',
  'Managers': 'internet.managers',
  'InternetGroups': 'internet.groups',
  'InternetPermissions': 'internet.permissions',
  'InternetLog': 'internet.log',
  'InternetSettings': 'internet.settings',
  'InternetWhatsApp': 'internet.whatsapp',
  'POS': 'sales.pos',
  'Products': 'sales.products',
  'Categories': 'sales.categories',
  'Invoices': 'sales.invoices',
  'Cashbox': 'sales.expenses',
  'Expenses': 'sales.expenses',
  'Inventory': 'sales.inventory',
  'Suppliers': 'sales.suppliers',
  'Employees': 'hr.employees',
  'Departments': 'hr.departments',
  'Attendance': 'hr.attendance',
  'Salaries': 'hr.salaries',
  'Tickets': 'support.tickets',
  'Technicians': 'support.technicians',
  'MessagingWhatsAppInternet': 'messaging.whatsapp_internet',
  'MessagingWhatsAppInstallments': 'messaging.whatsapp_installments',
  'MessagingWhatsAppSupport': 'messaging.whatsapp_support',
  'SendMessage': 'messaging.send',
  'Templates': 'messaging.templates',
  'MessageHistory': 'messaging.history',
  'RestaurantMenu': 'restaurant.menu',
  'RestaurantTables': 'restaurant.tables',
  'RestaurantOrders': 'restaurant.orders',
  'RestaurantKitchen': 'restaurant.kitchen',
  'RestaurantReservations': 'restaurant.reservations',
  'RestaurantPOS': 'restaurant.orders',
  'RestaurantExpenses': 'restaurant.expenses',
  'RestaurantReports': 'restaurant.reports',
  'RestaurantSettings': 'restaurant.settings',
  'InstallmentsCustomers': 'installments.customers',
  'InstallmentsContracts': 'installments.contracts',
  'InstallmentsContractDetail': 'installments.contracts',
  'InstallmentsPayments': 'installments.payments',
  'InstallmentsReports': 'installments.reports',
};

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/select-system',
    name: 'SelectSystem',
    component: () => import('../views/SelectSystemView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/backup',
    name: 'Backup',
    component: () => import('../views/BackupView.vue'),
    meta: { requiresAuth: true, system: 'backup' },
  },
  {
    path: '/management',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'management' },
    children: [
      { path: 'reports', name: 'ManagementReports', component: () => import('../views/management/ReportsView.vue') },
    ],
  },
  {
    path: '/internet',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'internet' },
    children: [
      { path: '', name: 'InternetDashboard', component: () => import('../views/internet/DashboardView.vue') },
      { path: 'subscribers', name: 'Subscribers', component: () => import('../views/internet/SubscribersView.vue') },
      { path: 'connected', name: 'ConnectedUsers', component: () => import('../views/internet/ConnectedView.vue') },
      { path: 'packages', name: 'Packages', component: () => import('../views/internet/PackagesView.vue') },
      { path: 'subscriptions', name: 'Subscriptions', component: () => import('../views/internet/SubscriptionsView.vue') },
      { path: 'routers', name: 'Routers', component: () => import('../views/internet/RoutersView.vue') },
      { path: 'reports', name: 'InternetReports', component: () => import('../views/internet/ReportsView.vue') },
      { path: 'managers', name: 'Managers', component: () => import('../views/internet/ManagersView.vue') },
      { path: 'groups', name: 'InternetGroups', component: () => import('../views/internet/GroupsView.vue') },
      { path: 'permissions', name: 'InternetPermissions', component: () => import('../views/internet/PermissionsView.vue') },
      { path: 'log', name: 'InternetLog', component: () => import('../views/settings/ActivityLogView.vue') },
      { path: 'settings', name: 'InternetSettings', component: () => import('../views/internet/SettingsView.vue') },
      { path: 'whatsapp', name: 'InternetWhatsApp', component: () => import('../views/internet/WhatsAppView.vue') },
    ],
  },
  {
    path: '/sales',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'sales' },
    children: [
      { path: '', name: 'SalesDashboard', component: () => import('../views/sales/DashboardView.vue') },
      { path: 'pos', name: 'POS', component: () => import('../views/sales/POSView.vue') },
      { path: 'products', name: 'Products', component: () => import('../views/sales/ProductsView.vue') },
      { path: 'customers', name: 'SalesCustomers', component: () => import('../views/sales/CustomersView.vue') },
      { path: 'categories', name: 'Categories', component: () => import('../views/sales/CategoriesView.vue') },
      { path: 'invoices', name: 'Invoices', component: () => import('../views/sales/InvoicesView.vue') },
      { path: 'cashbox', name: 'Cashbox', component: () => import('../views/sales/CashboxView.vue') },
      { path: 'expenses', name: 'Expenses', component: () => import('../views/sales/ExpensesView.vue') },
      { path: 'inventory', name: 'Inventory', component: () => import('../views/sales/InventoryView.vue') },
      { path: 'suppliers', name: 'Suppliers', component: () => import('../views/sales/SuppliersView.vue') },
    ],
  },
  {
    path: '/hr',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'hr' },
    children: [
      { path: '', name: 'HRDashboard', component: () => import('../views/hr/DashboardView.vue') },
      { path: 'employees', name: 'Employees', component: () => import('../views/hr/EmployeesView.vue') },
      { path: 'departments', name: 'Departments', component: () => import('../views/hr/DepartmentsView.vue') },
      { path: 'attendance', name: 'Attendance', component: () => import('../views/hr/AttendanceView.vue') },
      { path: 'salaries', name: 'Salaries', component: () => import('../views/hr/SalariesView.vue') },
    ],
  },
  {
    path: '/support',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'support' },
    children: [
      { path: '', name: 'SupportDashboard', component: () => import('../views/support/DashboardView.vue') },
      { path: 'tickets', name: 'Tickets', component: () => import('../views/support/TicketsView.vue') },
      { path: 'technicians', name: 'Technicians', component: () => import('../views/support/TechniciansView.vue') },
    ],
  },
  {
    path: '/messaging',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'messaging' },
    children: [
      { path: '', name: 'MessagingDashboard', component: () => import('../views/messaging/DashboardView.vue') },
      { path: 'history', name: 'MessageHistory', component: () => import('../views/messaging/HistoryView.vue') },
      { path: 'whatsapp-internet', name: 'MessagingWhatsAppInternet', component: () => import('../views/messaging/WhatsAppInternetView.vue') },
      { path: 'whatsapp-installments', name: 'MessagingWhatsAppInstallments', component: () => import('../views/messaging/WhatsAppInstallmentsView.vue') },
      { path: 'whatsapp-support', name: 'MessagingWhatsAppSupport', component: () => import('../views/messaging/WhatsAppSupportView.vue') },
    ],
  },
  {
    path: '/restaurant',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'restaurant' },
    children: [
      { path: '', name: 'RestaurantDashboard', component: () => import('../views/restaurant/DashboardView.vue') },
      { path: 'menu', name: 'RestaurantMenu', component: () => import('../views/restaurant/MenuView.vue') },
      { path: 'tables', name: 'RestaurantTables', component: () => import('../views/restaurant/TablesView.vue') },
      { path: 'orders', name: 'RestaurantOrders', component: () => import('../views/restaurant/OrdersView.vue') },
      { path: 'kitchen', name: 'RestaurantKitchen', component: () => import('../views/restaurant/KitchenView.vue') },
      { path: 'reservations', name: 'RestaurantReservations', component: () => import('../views/restaurant/ReservationsView.vue') },
      { path: 'pos', name: 'RestaurantPOS', component: () => import('../views/restaurant/POSView.vue') },
      { path: 'expenses', name: 'RestaurantExpenses', component: () => import('../views/restaurant/ExpensesView.vue') },
      { path: 'reports', name: 'RestaurantReports', component: () => import('../views/restaurant/ReportsView.vue') },
      { path: 'settings', name: 'RestaurantSettings', component: () => import('../views/restaurant/RestaurantSettingsView.vue') },
    ],
  },
  {
    path: '/installments',
    component: () => import('../layouts/SystemLayout.vue'),
    meta: { requiresAuth: true, system: 'installments' },
    children: [
      { path: '', name: 'InstallmentsDashboard', component: () => import('../views/installments/DashboardView.vue') },
      { path: 'customers', name: 'InstallmentsCustomers', component: () => import('../views/installments/CustomersView.vue') },
      { path: 'contracts', name: 'InstallmentsContracts', component: () => import('../views/installments/ContractsView.vue') },
      { path: 'contracts/:id', name: 'InstallmentsContractDetail', component: () => import('../views/installments/ContractDetailView.vue') },
      { path: 'payments', name: 'InstallmentsPayments', component: () => import('../views/installments/PaymentsView.vue') },
      { path: 'reports', name: 'InstallmentsReports', component: () => import('../views/installments/ReportsView.vue') },
      { path: 'settings', name: 'InstallmentsSettings', component: () => import('../views/installments/SettingsView.vue') },
    ],
  },
  { path: '/', redirect: '/login' },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

// استخدام hash history في Electron (file://) وweb history في المتصفح
const router = createRouter({
  history: typeof window !== 'undefined' && window.location.protocol === 'file:'
    ? createWebHashHistory()
    : createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.name === 'Login' && token) {
    const auth = useAuthStore();
    next(auth.user?.type === 'manager' ? '/internet' : '/select-system');
  } else if (to.meta.requiresAuth && token && to.name) {
    const auth = useAuthStore();
    // Check permission for this route
    const requiredPerm = routePermissions[to.name as string];
    if (requiredPerm && !auth.hasPermission(requiredPerm)) {
      // Permissions may be stale — refresh from server before denying access
      await auth.refreshProfile();
      if (!auth.hasPermission(requiredPerm)) {
        const system = to.meta.system as string;
        next(system ? `/${system}` : '/select-system');
        return;
      }
    }
    // Check system-level access for non-dashboard pages
    if (to.meta.system && !auth.hasSystemAccess(to.meta.system as string)) {
      // Refresh profile once before denying system access
      await auth.refreshProfile();
      if (!auth.hasSystemAccess(to.meta.system as string)) {
        next('/select-system');
        return;
      }
    }
    next();
  } else {
    next();
  }
});

export default router;
