<template>
  <div>
    <!-- Toast -->
    <div v-if="toast.show" :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition">
      {{ toast.message }}
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">الصلاحيات</h2>
      <div class="flex gap-2">
        <button @click="saveAll" :disabled="saving"
          class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 disabled:opacity-60">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          حفظ التغييرات
        </button>
      </div>
    </div>

    <!-- Filter -->
    <div class="mb-4 flex gap-3 flex-wrap">
      <input v-model="search" placeholder="بحث بالاسم..."
        class="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
      <select v-model="filterModule" class="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
        <option value="">كل الأنظمة</option>
        <option v-for="m in moduleList" :key="m.key" :value="m.key">{{ m.label }}</option>
      </select>
    </div>

    <!-- Legend -->
    <div class="mb-3 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
      <span class="flex items-center gap-1.5"><span class="w-4 h-4 rounded bg-green-100 inline-block border border-green-200"></span> لديه الصلاحية</span>
      <span class="flex items-center gap-1.5"><span class="w-4 h-4 rounded bg-gray-100 inline-block border border-gray-200"></span> لا يملك الصلاحية</span>
      <span class="text-gray-400 mr-auto">* يمكن التحديد بالضغط على المربعات ثم حفظ التغييرات</span>
    </div>

    <!-- Matrix Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="text-xs border-collapse w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="sticky right-0 bg-gray-50 z-10 text-right px-4 py-3 font-semibold text-gray-500 border-l border-gray-100 min-w-[160px]">الصلاحية</th>
              <th v-for="mgr in filteredManagers" :key="mgr.id"
                class="px-2 py-2 font-medium text-gray-600 text-center min-w-[90px] max-w-[90px]">
                <div class="flex flex-col items-center gap-0.5">
                  <div class="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {{ (mgr.name || '?')[0].toUpperCase() }}
                  </div>
                  <span class="truncate max-w-[80px] block text-center" :title="mgr.name">{{ mgr.name }}</span>
                  <span v-if="mgr.username" class="text-gray-400 font-mono truncate max-w-[80px]">{{ mgr.username }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(group, gi) in filteredPermGroups" :key="gi">
              <!-- Module Header Row -->
              <tr class="bg-indigo-50 border-y border-indigo-100">
                <td :colspan="filteredManagers.length + 1" class="px-4 py-1.5 font-semibold text-indigo-700 text-xs sticky right-0">
                  <i :class="group.icon" class="ml-1.5 text-indigo-500"></i>{{ group.label }}
                </td>
              </tr>
              <!-- Permission Rows -->
              <tr v-for="perm in group.perms" :key="perm.key"
                class="border-b border-gray-50 hover:bg-gray-50 transition">
                <td class="sticky right-0 bg-white z-10 px-4 py-2 text-gray-700 font-medium border-l border-gray-100 whitespace-nowrap">
                  <span class="font-mono text-gray-400 text-[10px] ml-1">{{ perm.key }}</span>
                  {{ perm.label }}
                </td>
                <td v-for="mgr in filteredManagers" :key="mgr.id" class="px-2 py-2 text-center">
                  <button @click="togglePermission(mgr.id, perm.key)"
                    class="w-6 h-6 rounded-md mx-auto flex items-center justify-center transition border"
                    :class="hasPermission(mgr.id, perm.key)
                      ? 'bg-green-100 border-green-300 text-green-600 hover:bg-green-200'
                      : 'bg-gray-50 border-gray-200 text-gray-300 hover:bg-gray-100'">
                    <i class="fas text-[10px]" :class="hasPermission(mgr.id, perm.key) ? 'fa-check' : 'fa-times'"></i>
                  </button>
                </td>
              </tr>
            </template>
            <tr v-if="filteredPermGroups.length === 0">
              <td :colspan="filteredManagers.length + 1" class="text-center py-12 text-gray-400">لا توجد نتائج</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

interface Manager { id: number; name: string; username?: string; permissions?: string; }

const managers = ref<Manager[]>([]);
const saving = ref(false);
const search = ref('');
const filterModule = ref('');
const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' });

// Local copy of permissions per manager (id -> Set<string>)
const permMap = ref<Map<number, Set<string>>>(new Map());
// Track which managers have unsaved changes
const dirty = ref<Set<number>>(new Set());

const permissionGroups = [
  { key: 'internet', label: 'الاشتراكات', icon: 'fas fa-wifi', perms: [
    { key: 'internet.subscribers', label: 'المشتركين' },
    { key: 'internet.connected', label: 'المتصلين' },
    { key: 'internet.packages', label: 'الباقات' },
    { key: 'internet.subscriptions', label: 'الاشتراكات' },
    { key: 'internet.routers', label: 'الراوترات' },
    { key: 'internet.reports', label: 'التقارير' },
    { key: 'internet.managers', label: 'المدراء' },
    { key: 'internet.groups', label: 'المجموعات' },
    { key: 'internet.permissions', label: 'الصلاحيات' },
    { key: 'internet.log', label: 'سجل العمليات' },
    { key: 'internet.settings', label: 'الإعدادات' },
    { key: 'internet.whatsapp', label: 'واتساب' },
  ]},
  { key: 'sales', label: 'المبيعات', icon: 'fas fa-cash-register', perms: [
    { key: 'sales.pos', label: 'نقطة البيع' },
    { key: 'sales.products', label: 'المنتجات' },
    { key: 'sales.categories', label: 'التصنيفات' },
    { key: 'sales.invoices', label: 'الفواتير' },
    { key: 'sales.expenses', label: 'المصروفات' },
    { key: 'sales.inventory', label: 'المخزون' },
    { key: 'sales.suppliers', label: 'الموردين' },
    { key: 'sales.customers', label: 'العملاء' },
  ]},
  { key: 'hr', label: 'الموظفين', icon: 'fas fa-users-cog', perms: [
    { key: 'hr.employees', label: 'الموظفين' },
    { key: 'hr.departments', label: 'الأقسام' },
    { key: 'hr.attendance', label: 'الحضور' },
    { key: 'hr.salaries', label: 'الرواتب' },
  ]},
  { key: 'support', label: 'الدعم الفني', icon: 'fas fa-headset', perms: [
    { key: 'support.tickets', label: 'التذاكر' },
    { key: 'support.technicians', label: 'الفنيين' },
  ]},
  { key: 'messaging', label: 'الرسائل', icon: 'fas fa-comment-dots', perms: [
    { key: 'messaging.whatsapp_internet', label: 'واتساب الاشتراكات' },
    { key: 'messaging.whatsapp_installments', label: 'واتساب الأقساط' },
    { key: 'messaging.whatsapp_support', label: 'واتساب الدعم' },
    { key: 'messaging.history', label: 'السجل' },
  ]},
  { key: 'restaurant', label: 'المطاعم', icon: 'fas fa-utensils', perms: [
    { key: 'restaurant.menu', label: 'قائمة الطعام' },
    { key: 'restaurant.orders', label: 'الطلبات' },
    { key: 'restaurant.kitchen', label: 'المطبخ' },
    { key: 'restaurant.reports', label: 'التقارير' },
    { key: 'restaurant.expenses', label: 'المصروفات' },
    { key: 'restaurant.settings', label: 'الإعدادات' },
  ]},
  { key: 'installments', label: 'الأقساط', icon: 'fas fa-hand-holding-usd', perms: [
    { key: 'installments.customers', label: 'العملاء' },
    { key: 'installments.contracts', label: 'العقود' },
    { key: 'installments.payments', label: 'الدفعات' },
    { key: 'installments.reports', label: 'التقارير' },
  ]},
];

const moduleList = permissionGroups.map(g => ({ key: g.key, label: g.label }));

const filteredManagers = computed(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return managers.value;
  return managers.value.filter(m =>
    m.name?.toLowerCase().includes(q) || m.username?.toLowerCase().includes(q)
  );
});

const filteredPermGroups = computed(() => {
  return permissionGroups.filter(g => !filterModule.value || g.key === filterModule.value);
});

function hasPermission(managerId: number, permKey: string): boolean {
  return permMap.value.get(managerId)?.has(permKey) ?? false;
}

function togglePermission(managerId: number, permKey: string) {
  const current = new Map(permMap.value);
  const perms = new Set(current.get(managerId) ?? []);
  perms.has(permKey) ? perms.delete(permKey) : perms.add(permKey);
  current.set(managerId, perms);
  permMap.value = current;
  const d = new Set(dirty.value);
  d.add(managerId);
  dirty.value = d;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

async function loadData() {
  try {
    const { data } = await api.get('/managers');
    managers.value = data;
    const map = new Map<number, Set<string>>();
    for (const m of data) {
      const perms = (m.permissions || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      map.set(m.id, new Set(perms));
    }
    permMap.value = map;
  } catch {}
}

async function saveAll() {
  if (dirty.value.size === 0) { showToast('لا توجد تغييرات للحفظ'); return; }
  saving.value = true;
  try {
    const promises = [...dirty.value].map(id => {
      const perms = [...(permMap.value.get(id) ?? [])].join(',');
      return api.patch(`/managers/${id}`, { permissions: perms });
    });
    await Promise.all(promises);
    dirty.value = new Set();
    showToast(`تم حفظ صلاحيات ${promises.length} مدير بنجاح`);
  } catch {
    showToast('حدث خطأ أثناء الحفظ', 'error');
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>
