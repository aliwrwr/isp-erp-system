<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-xl font-bold text-secondary">إدارة الأقسام</h2>
        <p class="text-sm text-gray-400 mt-1">إجمالي الأقسام: {{ departments.length }}</p>
      </div>
      <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.departments.add')" @click="openAddModal" class="bg-hr hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 shadow-md shadow-purple-200">
        <i class="fas fa-plus-circle"></i> إضافة قسم جديد
      </button>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center"><i class="fas fa-building text-hr text-lg"></i></div>
        <div><p class="text-xs text-gray-400">الأقسام</p><p class="text-lg font-bold text-secondary">{{ departments.length }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"><i class="fas fa-users text-blue-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">إجمالي الموظفين</p><p class="text-lg font-bold text-secondary">{{ totalEmployees }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"><i class="fas fa-chart-bar text-green-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">أكبر قسم</p><p class="text-lg font-bold text-secondary">{{ largestDept }}</p></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center"><i class="fas fa-user-tie text-amber-600 text-lg"></i></div>
        <div><p class="text-xs text-gray-400">المتوسط/قسم</p><p class="text-lg font-bold text-secondary">{{ avgPerDept }}</p></div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <i class="fas fa-spinner fa-spin text-3xl text-hr mb-3 block"></i>
      <p class="text-gray-400 text-sm">جاري التحميل...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="departments.length === 0" class="text-center py-16 bg-white rounded-xl border border-gray-100">
      <i class="fas fa-folder-open text-4xl text-gray-200 mb-3 block"></i>
      <p class="text-gray-400">لا يوجد أقسام حالياً</p>
      <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.departments.add')" @click="openAddModal" class="mt-4 bg-hr text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition">إضافة أول قسم</button>
    </div>

    <!-- Department Cards -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="dept in departments" :key="dept.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:border-purple-100 transition-all duration-300 group">
        <!-- Card Header -->
        <div class="bg-gradient-to-l from-purple-50 to-white px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-hr to-purple-400 flex items-center justify-center text-white shadow-sm">
              <i :class="getDeptIcon(dept.name)" class="text-base"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary text-sm">{{ dept.name }}</h3>
              <p class="text-[11px] text-gray-400">{{ dept.employees?.length || 0 }} موظف</p>
            </div>
          </div>
            <div v-if="auth.isSuperAdmin || auth.hasPermission('hr.departments.edit') || auth.hasPermission('hr.departments.delete')" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.departments.edit')" @click="openEditModal(dept)" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition" title="تعديل">
                <i class="fas fa-pen text-xs"></i>
              </button>
              <button v-if="auth.isSuperAdmin || auth.hasPermission('hr.departments.delete')" @click="confirmDelete(dept)" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="px-5 py-4 space-y-3">
          <p class="text-sm text-gray-400 leading-relaxed min-h-[40px]">{{ dept.description || 'لا يوجد وصف' }}</p>

          <!-- Manager -->
          <div class="flex items-center gap-2">
            <i class="fas fa-user-shield text-xs text-hr"></i>
            <span class="text-xs text-gray-500">المدير:</span>
            <span class="text-xs font-semibold text-secondary">{{ dept.manager || 'غير محدد' }}</span>
          </div>

          <!-- Permissions -->
          <div v-if="dept.permissions?.length">
            <div class="flex items-center gap-1.5 mb-2">
              <i class="fas fa-shield-alt text-xs text-hr"></i>
              <span class="text-[11px] text-gray-500 font-semibold">الصلاحيات:</span>
              <span class="text-[10px] text-hr font-bold mr-auto">{{ dept.permissions.length }} صلاحية</span>
            </div>
            <div class="space-y-1">
              <div v-for="g in getDeptGroupSummary(dept)" :key="g.key"
                class="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <i :class="g.icon" class="text-[10px] shrink-0" :style="{ color: g.color }"></i>
                <span class="text-[11px] text-gray-600 font-medium flex-1 truncate">{{ g.label }}</span>
                <div class="flex items-center gap-0.5">
                  <span v-if="g.hasView"   title="اطلاع"  class="w-5 h-5 rounded flex items-center justify-center bg-blue-100"><i class="fas fa-eye text-blue-500 text-[8px]"></i></span>
                  <span v-if="g.hasAdd"    title="إضافة"  class="w-5 h-5 rounded flex items-center justify-center bg-green-100"><i class="fas fa-plus text-green-500 text-[8px]"></i></span>
                  <span v-if="g.hasEdit"   title="تعديل"  class="w-5 h-5 rounded flex items-center justify-center bg-amber-100"><i class="fas fa-pen text-amber-500 text-[8px]"></i></span>
                  <span v-if="g.hasDelete" title="حذف"    class="w-5 h-5 rounded flex items-center justify-center bg-red-100"><i class="fas fa-trash text-red-400 text-[8px]"></i></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Employee Count Bar -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="text-[11px] text-gray-400">عدد الموظفين</span>
              <span class="text-xs font-bold text-hr">{{ dept.employees?.length || 0 }}</span>
            </div>
            <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-l from-hr to-purple-400 rounded-full transition-all duration-500"
                :style="{ width: getBarWidth(dept.employees?.length || 0) + '%' }"></div>
            </div>
          </div>

          <!-- Employee Avatars -->
          <div v-if="dept.employees?.length" class="flex items-center gap-1 pt-1">
            <div v-for="(emp, i) in dept.employees.slice(0, 5)" :key="i"
              class="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-[9px] font-bold text-gray-500 -ml-1.5 first:ml-0 border-2 border-white"
              :title="emp.name">
              {{ emp.name?.charAt(0) }}
            </div>
            <span v-if="dept.employees.length > 5" class="text-[10px] text-gray-400 mr-1">+{{ dept.employees.length - 5 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col" @click.stop>
          <div class="bg-gradient-to-l from-hr to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-white font-bold text-base">{{ editingDept ? 'تعديل القسم' : 'إضافة قسم جديد' }}</h3>
            <button @click="showModal = false" class="text-white/70 hover:text-white transition"><i class="fas fa-times"></i></button>
          </div>
          <form @submit.prevent="saveDept" class="p-6 space-y-4 overflow-y-auto">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم القسم <span class="text-red-400">*</span></label>
              <input v-model="form.name" required class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" placeholder="مثال: قسم الشبكات" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">المدير المسؤول</label>
              <input v-model="form.manager" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr" placeholder="اسم المدير" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5">الوصف</label>
              <textarea v-model="form.description" rows="2" class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-hr/30 focus:border-hr resize-none" placeholder="وصف مختصر عن القسم ومهامه..."></textarea>
            </div>

            <!-- Permissions Section - Professional Matrix -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-semibold text-gray-600">
                  <i class="fas fa-shield-alt text-hr ml-1"></i> صلاحيات القسم
                </label>
                <div class="flex items-center gap-1.5">
                  <span class="text-[10px] text-gray-400 flex items-center gap-1">
                    <i class="fas fa-check-circle text-hr"></i>
                    {{ totalSelectedPerms }} صلاحية محددة
                  </span>
                  <button type="button" @click="selectAllPermissions"
                    class="text-[10px] bg-hr/10 text-hr hover:bg-hr hover:text-white px-2 py-1 rounded-lg font-bold transition">
                    تحديد الكل
                  </button>
                  <button type="button" @click="clearAllPermissions"
                    class="text-[10px] bg-red-50 text-red-400 hover:bg-red-100 px-2 py-1 rounded-lg font-bold transition">
                    مسح الكل
                  </button>
                </div>
              </div>

              <!-- System Tabs + Matrix -->
              <div class="border border-gray-200 rounded-xl overflow-hidden">
                <!-- Tabs -->
                <div class="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
                  <button v-for="group in permissionGroups" :key="group.key" type="button"
                    @click="activePermTab = group.key"
                    :class="activePermTab === group.key
                      ? 'bg-white border-b-2 border-hr text-hr font-bold'
                      : 'text-gray-400 hover:text-secondary hover:bg-gray-100'"
                    class="px-3 py-2.5 text-[11px] whitespace-nowrap transition flex items-center gap-1.5 relative -mb-px">
                    <i :class="group.icon" class="text-[10px]"></i>
                    {{ group.label }}
                    <span v-if="getGroupPermCount(group.key)"
                      class="bg-hr text-white rounded-full px-1.5 text-[9px] leading-4 font-bold">
                      {{ getGroupPermCount(group.key) }}
                    </span>
                  </button>
                </div>

                <!-- Matrix -->
                <div class="p-3 bg-white" v-if="activeGroup">
                  <!-- Column Headers -->
                  <div class="grid gap-1 mb-1" style="grid-template-columns: 1fr repeat(4, 58px)">
                    <div class="text-[10px] font-bold text-gray-400 pr-2">الصفحة / الوحدة</div>
                    <div v-for="action in actions" :key="action.key" class="text-center">
                      <button type="button" @click="toggleAllAction(activeGroup.key, action.key)"
                        class="flex flex-col items-center gap-0.5 w-full py-1.5 rounded-lg hover:bg-gray-50 transition group/col"
                        :class="isAllActionSelected(activeGroup.key, action.key) ? 'bg-hr/5' : ''">
                        <i :class="[action.icon, action.color,
                          isAllActionSelected(activeGroup.key, action.key) ? 'opacity-100' : 'opacity-35 group-hover/col:opacity-60']"
                          class="text-sm transition"></i>
                        <span :class="isAllActionSelected(activeGroup.key, action.key) ? 'text-secondary font-bold' : 'text-gray-400'"
                          class="text-[9px] leading-none transition">{{ action.label }}</span>
                      </button>
                    </div>
                  </div>
                  <div class="h-px bg-gray-100 mb-1"></div>

                  <!-- Page Rows -->
                  <div v-for="item in activeGroup.items" :key="item.key"
                    class="grid gap-1 py-1.5 px-1 rounded-lg hover:bg-gray-50/80 transition items-center"
                    :class="isRowAnySelected(activeGroup.key, item.key) ? 'bg-hr/5 hover:bg-hr/5' : ''"
                    style="grid-template-columns: 1fr repeat(4, 58px)">
                    <!-- Row label - static indicator only (no auto-select on click) -->
                    <div class="text-xs font-medium pr-1 text-right flex items-center gap-1.5"
                      :class="isRowAnySelected(activeGroup.key, item.key) ? 'text-hr font-bold' : 'text-gray-600'">
                      <i :class="isRowAllSelected(activeGroup.key, item.key)
                        ? 'fas fa-check-circle text-hr'
                        : isRowAnySelected(activeGroup.key, item.key)
                          ? 'fas fa-minus-circle text-amber-400'
                          : 'far fa-circle text-gray-200'"
                        class="text-xs shrink-0 transition"></i>
                      {{ item.label }}
                    </div>
                    <!-- Action checkboxes -->
                    <div v-for="action in actions" :key="action.key" class="flex justify-center">
                      <input type="checkbox"
                        :value="permKey(activeGroup.key, item.key, action.key)"
                        v-model="form.permissions"
                        class="w-4 h-4 rounded border-gray-300 text-hr focus:ring-hr/30 cursor-pointer" />
                    </div>
                  </div>

                  <!-- System Footer -->
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <button type="button" @click="selectAllSystem(activeGroup.key)"
                      class="text-[11px] text-hr hover:underline font-bold flex items-center gap-1">
                      <i class="fas fa-check-double text-[10px]"></i>
                      تحديد كل {{ activeGroup.label }}
                    </button>
                    <button type="button" @click="clearSystem(activeGroup.key)"
                      class="text-[11px] text-red-400 hover:underline font-bold flex items-center gap-1">
                      <i class="fas fa-times text-[10px]"></i>
                      إلغاء الكل
                    </button>
                  </div>
                </div>
              </div>
              <p class="text-[10px] text-gray-400 mt-1.5">
                <i class="fas fa-info-circle ml-1"></i>
                اضغط اسم الصفحة لتحديد كل صلاحياتها • اضغط العمود لتحديد جميع الصفحات
              </p>
            </div>
            <div class="flex gap-3 pt-2">
              <button type="submit" :disabled="saving" class="flex-1 bg-hr hover:bg-purple-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ editingDept ? 'حفظ التعديلات' : 'إضافة القسم' }}
              </button>
              <button type="button" @click="showModal = false" class="px-6 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50 transition">إلغاء</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showDeleteConfirm = false">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm relative z-10 p-6 text-center" @click.stop>
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
          </div>
          <h3 class="font-bold text-secondary text-base mb-2">تأكيد الحذف</h3>
          <p class="text-sm text-gray-400 mb-1">هل أنت متأكد من حذف قسم</p>
          <p class="font-bold text-secondary mb-1">{{ deletingDept?.name }}؟</p>
          <p v-if="deletingDept?.employees?.length" class="text-xs text-red-400 mb-4">
            <i class="fas fa-exclamation-circle"></i> يحتوي على {{ deletingDept.employees.length }} موظف
          </p>
          <div class="flex gap-3 mt-4">
            <button @click="deleteDept" :disabled="saving" class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60">
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-trash-alt"></i> حذف
            </button>
            <button @click="showDeleteConfirm = false" class="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">إلغاء</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { useAuthStore } from '../../stores/auth';

const auth = useAuthStore();

interface Employee { id: number; name: string; }
interface Department {
  id: number; name: string; description: string;
  manager: string; permissions: string[]; employees: Employee[];
}

const departments    = ref<Department[]>([]);
const loading        = ref(true);
const saving         = ref(false);
const showModal      = ref(false);
const showDeleteConfirm = ref(false);
const editingDept    = ref<Department | null>(null);
const deletingDept   = ref<Department | null>(null);
const activePermTab  = ref('internet');

const form = ref<{ name: string; description: string; manager: string; permissions: string[] }>({
  name: '', description: '', manager: '', permissions: [],
});

// ─── Action Types ───────────────────────────────────────────────
const actions = [
  { key: 'view',   label: 'اطلاع',  icon: 'fas fa-eye',   color: 'text-blue-500'  },
  { key: 'add',    label: 'إضافة',  icon: 'fas fa-plus',  color: 'text-green-500' },
  { key: 'edit',   label: 'تعديل',  icon: 'fas fa-pen',   color: 'text-amber-500' },
  { key: 'delete', label: 'حذف',    icon: 'fas fa-trash', color: 'text-red-500'   },
];

// ─── Permission Groups ──────────────────────────────────────────
const permissionGroups = [
  {
    key: 'internet', label: 'نظام الإنترنت', icon: 'fas fa-wifi', color: '#2980B9',
    items: [
      { key: 'subscribers',   label: 'المشتركين'     },
      { key: 'connected',     label: 'المتصلين'      },
      { key: 'packages',      label: 'الباقات'       },
      { key: 'subscriptions', label: 'الاشتراكات'    },
      { key: 'routers',       label: 'الراوترات'     },
      { key: 'payments',      label: 'المدفوعات'     },
      { key: 'reports',       label: 'التقارير'      },
      { key: 'managers',      label: 'المدراء'       },
      { key: 'log',           label: 'سجل العمليات'  },
      { key: 'whatsapp',      label: 'واتساب'        },
      { key: 'settings',      label: 'الإعدادات'     },
    ],
  },
  {
    key: 'sales', label: 'نظام المبيعات', icon: 'fas fa-cash-register', color: '#27AE60',
    items: [
      { key: 'pos',        label: 'نقطة البيع'  },
      { key: 'products',   label: 'المنتجات'   },
      { key: 'customers',  label: 'العملاء'    },
      { key: 'categories', label: 'التصنيفات'  },
      { key: 'invoices',   label: 'الفواتير'   },
      { key: 'expenses',   label: 'المصروفات'  },
      { key: 'inventory',  label: 'المخزون'    },
      { key: 'suppliers',  label: 'الموردين'   },
    ],
  },
  {
    key: 'hr', label: 'شؤون الموظفين', icon: 'fas fa-users', color: '#8E44AD',
    items: [
      { key: 'employees',   label: 'الموظفين' },
      { key: 'departments', label: 'الأقسام'  },
      { key: 'attendance',  label: 'الحضور'   },
      { key: 'salaries',    label: 'الرواتب'  },
    ],
  },
  {
    key: 'support', label: 'الدعم الفني', icon: 'fas fa-headset', color: '#E67E22',
    items: [
      { key: 'tickets',     label: 'التذاكر' },
      { key: 'technicians', label: 'الفنيين' },
    ],
  },
  {
    key: 'messaging', label: 'الرسائل', icon: 'fas fa-envelope', color: '#16A085',
    items: [
      { key: 'send',      label: 'إرسال رسائل' },
      { key: 'templates', label: 'القوالب'     },
      { key: 'history',   label: 'السجل'       },
    ],
  },
  {
    key: 'restaurant', label: 'نظام المطاعم', icon: 'fas fa-utensils', color: '#D35400',
    items: [
      { key: 'menu',         label: 'قائمة الطعام' },
      { key: 'tables',       label: 'الطاولات'     },
      { key: 'orders',       label: 'الطلبات'      },
      { key: 'kitchen',      label: 'المطبخ'       },
      { key: 'reservations', label: 'الحجوزات'     },
      { key: 'expenses',     label: 'المصروفات'    },
      { key: 'reports',      label: 'التقارير'     },
    ],
  },
  {
    key: 'installments', label: 'نظام الأقساط', icon: 'fas fa-hand-holding-usd', color: '#6366F1',
    items: [
      { key: 'customers', label: 'العملاء'  },
      { key: 'contracts', label: 'العقود'   },
      { key: 'payments',  label: 'الدفعات'  },
      { key: 'reports',   label: 'التقارير' },
    ],
  },
];

const activeGroup = computed(() => permissionGroups.find(g => g.key === activePermTab.value));
const totalSelectedPerms = computed(() => form.value.permissions.length);

// ─── Permission Key Builder ────────────────────────────────────
function permKey(sys: string, page: string, action: string) {
  return `${sys}.${page}.${action}`;
}

// ─── Group permission count (for tab badge) ───────────────────
function getGroupPermCount(groupKey: string) {
  return form.value.permissions.filter(p => p.startsWith(groupKey + '.')).length;
}

// ─── Row helpers ─────────────────────────────────────────────
function toggleAllRow(sys: string, page: string) {
  const all = actions.map(a => permKey(sys, page, a.key));
  const allSel = all.every(p => form.value.permissions.includes(p));
  if (allSel) {
    form.value.permissions = form.value.permissions.filter(p => !all.includes(p));
  } else {
    form.value.permissions = [...new Set([...form.value.permissions, ...all])];
  }
}
function isRowAllSelected(sys: string, page: string) {
  return actions.every(a => form.value.permissions.includes(permKey(sys, page, a.key)));
}
function isRowAnySelected(sys: string, page: string) {
  return actions.some(a => form.value.permissions.includes(permKey(sys, page, a.key)));
}

// ─── Column (action) toggle ───────────────────────────────────
function toggleAllAction(sys: string, action: string) {
  const group = permissionGroups.find(g => g.key === sys);
  if (!group) return;
  const all = group.items.map(i => permKey(sys, i.key, action));
  const allSel = all.every(p => form.value.permissions.includes(p));
  if (allSel) {
    form.value.permissions = form.value.permissions.filter(p => !all.includes(p));
  } else {
    form.value.permissions = [...new Set([...form.value.permissions, ...all])];
  }
}
function isAllActionSelected(sys: string, action: string) {
  const group = permissionGroups.find(g => g.key === sys);
  if (!group) return false;
  return group.items.every(i => form.value.permissions.includes(permKey(sys, i.key, action)));
}

// ─── System-level select/clear ────────────────────────────────
function selectAllSystem(sys: string) {
  const group = permissionGroups.find(g => g.key === sys);
  if (!group) return;
  const all = group.items.flatMap(i => actions.map(a => permKey(sys, i.key, a.key)));
  form.value.permissions = [...new Set([...form.value.permissions, ...all])];
}
function clearSystem(sys: string) {
  form.value.permissions = form.value.permissions.filter(p => !p.startsWith(sys + '.'));
}

// ─── Global select/clear ─────────────────────────────────────
function selectAllPermissions() {
  const all = permissionGroups.flatMap(g =>
    g.items.flatMap(i => actions.map(a => permKey(g.key, i.key, a.key)))
  );
  form.value.permissions = [...new Set(all)];
}
function clearAllPermissions() {
  form.value.permissions = [];
}

// ─── Card summary per department ─────────────────────────────
function getDeptGroupSummary(dept: Department) {
  return permissionGroups
    .filter(g => dept.permissions?.some(p => p.startsWith(g.key + '.')))
    .map(g => ({
      ...g,
      hasView:   dept.permissions.some(p => p.startsWith(g.key + '.') && p.endsWith('.view')),
      hasAdd:    dept.permissions.some(p => p.startsWith(g.key + '.') && p.endsWith('.add')),
      hasEdit:   dept.permissions.some(p => p.startsWith(g.key + '.') && p.endsWith('.edit')),
      hasDelete: dept.permissions.some(p => p.startsWith(g.key + '.') && p.endsWith('.delete')),
    }));
}

// ─── Stats ────────────────────────────────────────────────────
const totalEmployees = computed(() => departments.value.reduce((s, d) => s + (d.employees?.length || 0), 0));
const largestDept = computed(() => {
  if (!departments.value.length) return '—';
  return departments.value.reduce((a, b) => (a.employees?.length || 0) >= (b.employees?.length || 0) ? a : b).name;
});
const avgPerDept = computed(() => {
  if (!departments.value.length) return '0';
  return Math.round(totalEmployees.value / departments.value.length);
});
function getBarWidth(count: number) {
  const max = Math.max(...departments.value.map(d => d.employees?.length || 0), 1);
  return Math.round((count / max) * 100);
}

const deptIcons: Record<string, string> = {
  'الشبكات': 'fas fa-network-wired', 'المبيعات': 'fas fa-cash-register',
  'المحاسبة': 'fas fa-calculator',   'الدعم الفني': 'fas fa-headset',
  'الإدارة': 'fas fa-landmark',      'الموارد البشرية': 'fas fa-users-cog',
  'التسويق': 'fas fa-bullhorn',       'التطوير': 'fas fa-code',
};
function getDeptIcon(name: string) { return deptIcons[name] || 'fas fa-building'; }

// ─── Modal helpers ────────────────────────────────────────────
function resetForm() {
  form.value = { name: '', description: '', manager: '', permissions: [] };
  activePermTab.value = 'internet';
}
function openAddModal() {
  editingDept.value = null;
  resetForm();
  showModal.value = true;
}
function openEditModal(dept: Department) {
  editingDept.value = dept;
  form.value = {
    name: dept.name,
    description: dept.description || '',
    manager: dept.manager || '',
    permissions: dept.permissions ? [...dept.permissions] : [],
  };
  activePermTab.value = 'internet';
  showModal.value = true;
}
function confirmDelete(dept: Department) {
  deletingDept.value = dept;
  showDeleteConfirm.value = true;
}

// ─── API calls ────────────────────────────────────────────────
async function saveDept() {
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      description: form.value.description || undefined,
      manager: form.value.manager || undefined,
      permissions: form.value.permissions,
    };
    if (editingDept.value) {
      await api.patch(`/departments/${editingDept.value.id}`, payload);
    } else {
      await api.post('/departments', payload);
    }
    showModal.value = false;
    await fetchDepartments();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}
async function deleteDept() {
  if (!deletingDept.value) return;
  saving.value = true;
  try {
    await api.delete(`/departments/${deletingDept.value.id}`);
    showDeleteConfirm.value = false;
    await fetchDepartments();
  } catch (err: any) {
    alert(err.response?.data?.message || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}
async function fetchDepartments() {
  try {
    const res = await api.get('/departments');
    departments.value = res.data;
  } catch {
    departments.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDepartments);
</script>
