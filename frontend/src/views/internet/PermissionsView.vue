<template>
  <div class="-m-4 lg:-m-6 flex flex-col bg-gray-50 overflow-hidden" style="height:calc(100vh - 56px)" dir="rtl">

    <!-- ══ Top Bar ══════════════════════════════════════════════════════════ -->
    <div class="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between flex-shrink-0 select-none">
      <div class="flex items-center gap-3 text-sm">
        <i class="fas fa-shield-alt text-blue-400"></i>
        <span class="font-semibold tracking-wide">Security Groups</span>
        <span class="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{{ groups.length }} مجموعة</span>
      </div>
      <button @click="loadGroups" class="text-gray-400 hover:text-white transition text-sm" title="تحديث">
        <i class="fas fa-sync" :class="loading ? 'fa-spin' : ''"></i>
      </button>
    </div>

    <!-- ══ Body ═════════════════════════════════════════════════════════════ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- ── Left Panel: Groups List ──────────────────────────────────────── -->
      <div class="w-64 flex flex-col bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden">
        <!-- Search + Add -->
        <div class="p-3 border-b border-gray-100 flex gap-2">
          <div class="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <i class="fas fa-search text-gray-400 text-xs"></i>
            <input v-model="search" class="bg-transparent outline-none text-sm flex-1 min-w-0" placeholder="بحث..." />
          </div>
          <button @click="openAdd"
            class="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 text-sm font-bold transition flex items-center">
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>

        <!-- Groups -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="!sortedGroups.length" class="text-center py-10 text-gray-400 text-sm">
            <i class="fas fa-folder-open text-2xl mb-2 block text-gray-200"></i>
            لا توجد مجموعات
          </div>
          <div v-for="g in sortedGroups" :key="g.id"
            @click="selectGroup(g)"
            class="flex items-center justify-between px-3 py-2.5 border-b border-gray-50 cursor-pointer transition group"
            :class="selectedGroup?.id === g.id
              ? 'bg-blue-50 border-r-4 border-r-blue-500'
              : 'hover:bg-gray-50'">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                :class="selectedGroup?.id === g.id ? 'bg-blue-500' : 'bg-slate-400'">
                {{ g.name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-sm font-semibold truncate"
                  :class="selectedGroup?.id === g.id ? 'text-blue-700' : 'text-gray-700'">{{ g.name }}</div>
                <div class="text-[10px] flex items-center gap-1 mt-0.5">
                  <span class="text-gray-400">{{ permCount(g) }} صلاحية</span>
                  <template v-if="g.dashboardId && dashboardGroups.find(d => d.id === g.dashboardId)">
                    <span class="text-gray-300">·</span>
                    <i class="fas fa-columns text-indigo-400 text-[9px]"></i>
                    <span class="text-indigo-500 truncate">{{ dashboardGroups.find(d => d.id === g.dashboardId)?.name }}</span>
                  </template>
                </div>
              </div>
            </div>
            <button @click.stop="confirmDelete(g)"
              class="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition text-xs w-6 h-6 flex items-center justify-center rounded hover:bg-red-50">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Right Panel: Permission Matrix ──────────────────────────────── -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- Empty state -->
        <div v-if="!selectedGroup" class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-300">
            <i class="fas fa-hand-pointer text-5xl mb-3 block"></i>
            <p class="text-sm">اختر مجموعة من القائمة لتعديل صلاحياتها</p>
          </div>
        </div>

        <!-- Matrix Panel -->
        <template v-else>
          <!-- Panel Header -->
          <div class="bg-white border-b border-gray-200 px-5 py-3 flex-shrink-0">
            <!-- Top row: group info + action buttons -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                  {{ selectedGroup.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-800 text-sm">{{ selectedGroup.name }}</h3>
                  <p class="text-[11px] text-gray-400">{{ givenPerms.length }} صلاحية محددة</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click="givenPerms = []"
                  class="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                  <i class="fas fa-times text-[10px]"></i>مسح الكل
                </button>
                <button @click="selectAll"
                  class="text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                  <i class="fas fa-check-double text-[10px]"></i>تحديد الكل
                </button>
                <button @click="savePermissions" :disabled="saving"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-60 transition">
                  <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-save"></i>
                  حفظ
                </button>
              </div>
            </div>
            <!-- Dashboard Selector Row -->
            <div class="mt-2.5 flex items-center gap-2.5 pt-2.5 border-t border-gray-100">
              <i class="fas fa-columns text-indigo-400 text-sm flex-shrink-0"></i>
              <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">لوحة التحكم:</span>
              <select v-model="selectedDashId"
                class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 max-w-xs">
                <option :value="null">&mdash; بدون لوحة &mdash;</option>
                <option v-for="d in dashboardGroups" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
              <span v-if="selectedDashId && dashboardGroups.find(d => d.id === selectedDashId)"
                class="text-[11px] text-indigo-600 flex items-center gap-1 whitespace-nowrap">
                <i class="fas fa-link text-[10px]"></i>
                {{ dashboardGroups.find(d => d.id === selectedDashId)?.name }}
              </span>
              <span v-else-if="!dashboardGroups.length" class="text-[10px] text-amber-500">
                لا توجد لوحات
              </span>
            </div>
          </div>

          <!-- Matrix Body -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">

              <!-- Column Headers -->
              <div class="grid bg-gray-50 border-b border-gray-200 px-4 py-2"
                style="grid-template-columns: 1fr repeat(4, 76px)">
                <div class="text-xs font-bold text-gray-500 text-right">الصفحة / الوحدة</div>
                <div v-for="action in actions" :key="action.key" class="text-center">
                  <button @click="toggleAllAction(action.key)"
                    class="flex flex-col items-center gap-0.5 w-full py-1.5 rounded-lg hover:bg-gray-100 transition group/col"
                    :class="isAllActionSelected(action.key) ? 'bg-blue-50' : ''">
                    <i :class="[action.icon, action.color,
                      isAllActionSelected(action.key) ? 'opacity-100' : 'opacity-35 group-hover/col:opacity-65']"
                      class="text-sm transition"></i>
                    <span class="text-[9px] font-semibold transition"
                      :class="isAllActionSelected(action.key) ? 'text-blue-600' : 'text-gray-400'">
                      {{ action.label }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Page Rows -->
              <div v-for="(item, idx) in internetPages" :key="item.key"
                class="grid px-4 py-2 border-b border-gray-50 hover:bg-blue-50/30 transition items-center"
                :class="isRowAny(item.key) ? 'bg-blue-50/50 hover:bg-blue-50/70' : (idx % 2 === 1 ? 'bg-gray-50/50' : '')"
                style="grid-template-columns: 1fr repeat(4, 76px)">

                <!-- Row label (click = toggle all) -->
                <div class="flex items-center gap-2 pr-1 cursor-pointer select-none" @click="toggleRow(item.key)">
                  <i :class="isRowAll(item.key)
                      ? 'fas fa-check-circle text-blue-500'
                      : isRowAny(item.key)
                        ? 'fas fa-minus-circle text-amber-400'
                        : 'far fa-circle text-gray-200'"
                    class="text-sm transition shrink-0"></i>
                  <span class="text-sm"
                    :class="isRowAny(item.key) ? 'text-blue-700 font-bold' : 'text-gray-700 font-medium'">
                    {{ item.label }}
                  </span>
                </div>

                <!-- Action checkboxes -->
                <div v-for="action in actions" :key="action.key" class="flex justify-center">
                  <input type="checkbox"
                    :value="permKey(item.key, action.key)"
                    v-model="givenPerms"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer" />
                </div>
              </div>

              <!-- Footer -->
              <div class="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <span class="text-xs text-gray-400">
                  <i class="fas fa-info-circle ml-1"></i>
                  اضغط اسم الصفحة لتحديد كل صلاحياتها · اضغط العمود لتحديد جميع الصفحات
                </span>
                <span class="text-xs font-bold text-blue-600">
                  {{ givenPerms.length }} / {{ internetPages.length * actions.length }}
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ══ New Group Modal ═══════════════════════════════════════════════════ -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="showAddModal = false">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-96" dir="rtl">
        <h3 class="font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-folder-plus text-blue-500 text-sm"></i>
          مجموعة أمان جديدة
        </h3>
        <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم المجموعة <span class="text-red-400">*</span></label>
        <input v-model="newName" @keyup.enter="createGroup" ref="newNameRef"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          placeholder="مثال: مدير النظام" />

        <!-- Dashboard Group Selector -->
        <div class="mt-3">
          <label class="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
            <i class="fas fa-columns text-indigo-400 text-[11px]"></i>
            لوحة التحكم (اختيارية)
          </label>
          <select v-model="newDashboardId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400">
            <option :value="null">&mdash; بدون لوحة &mdash;</option>
            <option v-for="d in dashboardGroups" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
          <p v-if="!dashboardGroups.length" class="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
            <i class="fas fa-info-circle"></i>
            لا توجد لوحات محفوظة. انشئ لوحة أولاً من صفحة المجموعات.
          </p>
        </div>
        <div class="flex gap-2 mt-5">
          <button @click="createGroup" :disabled="!newName.trim() || saving"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5 transition">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            إنشاء
          </button>
          <button @click="showAddModal = false"
            class="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition">
            إلغاء
          </button>
        </div>
      </div>
    </div>

    <!-- ══ Delete Confirmation ═══════════════════════════════════════════════ -->
    <div v-if="deleteTarget" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="deleteTarget = null">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center" dir="rtl">
        <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <h3 class="font-bold text-gray-800 mb-1">تأكيد الحذف</h3>
        <p class="text-sm text-gray-400 mb-4">هل تريد حذف مجموعة <strong class="text-gray-700">{{ deleteTarget.name }}</strong>؟</p>
        <div class="flex gap-3">
          <button @click="deleteGroup" :disabled="saving"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash-alt"></i> حذف
          </button>
          <button @click="deleteTarget = null"
            class="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">إلغاء</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" :class="toast.ok ? 'bg-green-500' : 'bg-red-500'"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium z-50">
      {{ toast.msg }}
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import api from '../../api';

// ── Internet System Pages ────────────────────────────────────────────────────
const internetPages = [
  { key: 'subscribers',   label: 'المشتركين'       },
  { key: 'connected',     label: 'المتصلين'        },
  { key: 'packages',      label: 'الباقات'         },
  { key: 'subscriptions', label: 'الاشتراكات'      },
  { key: 'routers',       label: 'الراوترات'       },
  { key: 'payments',      label: 'المدفوعات'       },
  { key: 'reports',       label: 'التقارير'        },
  { key: 'managers',      label: 'المدراء'         },
  { key: 'log',           label: 'سجل العمليات'    },
  { key: 'whatsapp',      label: 'واتساب'          },
  { key: 'settings',      label: 'الإعدادات'       },
  { key: 'dashboard',     label: 'لوحة التحكم'     },
  { key: 'permissions',   label: 'مجموعات الأمان'  },
  { key: 'kassier',       label: 'الكاشير'         },
];

// ── Action Types ─────────────────────────────────────────────────────────────
const actions = [
  { key: 'view',   label: 'اطلاع', icon: 'fas fa-eye',   color: 'text-blue-500'  },
  { key: 'add',    label: 'إضافة', icon: 'fas fa-plus',  color: 'text-green-500' },
  { key: 'edit',   label: 'تعديل', icon: 'fas fa-pen',   color: 'text-amber-500' },
  { key: 'delete', label: 'حذف',   icon: 'fas fa-trash', color: 'text-red-500'   },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface Group { id: number; name: string; permissions?: string; dashboardId?: number | null; layout?: string | null; }

// ── State ────────────────────────────────────────────────────────────────────
const groups           = ref<Group[]>([]);
const selectedGroup    = ref<Group | null>(null);
const selectedDashId   = ref<number | null>(null); // dashboardId for selected security group
const givenPerms       = ref<string[]>([]);
const search           = ref('');
const loading          = ref(false);
const saving           = ref(false);
const showAddModal     = ref(false);
const newName          = ref('');
const newDashboardId   = ref<number | null>(null);
const newNameRef       = ref<HTMLInputElement | null>(null);
const deleteTarget     = ref<Group | null>(null);
const toast            = ref({ show: false, msg: '', ok: true });

// Dashboard groups = groups that have a saved layout
const dashboardGroups = computed(() => groups.value.filter(g => g.layout && g.layout !== '[]' && g.layout !== 'null'));

// ── Computed ─────────────────────────────────────────────────────────────────
const sortedGroups = computed(() => {
  const q = search.value.trim().toLowerCase();
  return groups.value
    .filter(g => !q || g.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// ── Permission Key ────────────────────────────────────────────────────────────
function permKey(page: string, action: string) {
  return `internet.${page}.${action}`;
}

// ── Permission Count on Card ──────────────────────────────────────────────────
function permCount(g: Group): number {
  try {
    const arr = JSON.parse(g.permissions || '[]');
    return Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string' && x.startsWith('internet.')).length : 0;
  } catch { return 0; }
}

// ── Row Helpers ───────────────────────────────────────────────────────────────
function isRowAll(page: string) {
  return actions.every(a => givenPerms.value.includes(permKey(page, a.key)));
}
function isRowAny(page: string) {
  return actions.some(a => givenPerms.value.includes(permKey(page, a.key)));
}
function toggleRow(page: string) {
  const all = actions.map(a => permKey(page, a.key));
  if (isRowAll(page)) {
    givenPerms.value = givenPerms.value.filter(p => !all.includes(p));
  } else {
    givenPerms.value = [...new Set([...givenPerms.value, ...all])];
  }
}

// ── Column Helpers ────────────────────────────────────────────────────────────
function isAllActionSelected(action: string) {
  return internetPages.every(p => givenPerms.value.includes(permKey(p.key, action)));
}
function toggleAllAction(action: string) {
  const all = internetPages.map(p => permKey(p.key, action));
  if (isAllActionSelected(action)) {
    givenPerms.value = givenPerms.value.filter(p => !all.includes(p));
  } else {
    givenPerms.value = [...new Set([...givenPerms.value, ...all])];
  }
}

// ── Global ────────────────────────────────────────────────────────────────────
function selectAll() {
  givenPerms.value = [...new Set(internetPages.flatMap(p => actions.map(a => permKey(p.key, a.key))))];
}

// ── Select Group ──────────────────────────────────────────────────────────────
function selectGroup(g: Group) {
  selectedGroup.value = g;
  selectedDashId.value = g.dashboardId ?? null;
  try {
    const arr = JSON.parse(g.permissions || '[]');
    givenPerms.value = Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string') : [];
  } catch { givenPerms.value = []; }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg: string, ok = true) {
  toast.value = { show: true, msg, ok };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

// ── API ───────────────────────────────────────────────────────────────────────
async function loadGroups() {
  loading.value = true;
  try {
    const { data } = await api.get('/groups');
    groups.value = data;
  } catch {
    // silent
  } finally { loading.value = false; }
}

function openAdd() {
  newName.value = '';
  newDashboardId.value = null;
  showAddModal.value = true;
  nextTick(() => newNameRef.value?.focus());
}

async function createGroup() {
  if (!newName.value.trim()) return;
  saving.value = true;
  try {
    const payload: any = { name: newName.value.trim(), permissions: '[]' };
    if (newDashboardId.value) payload.dashboardId = newDashboardId.value;
    const { data } = await api.post('/groups', payload);
    groups.value.push(data);
    groups.value.sort((a, b) => a.name.localeCompare(b.name));
    showAddModal.value = false;
    selectGroup(data);
    showToast('تم إنشاء المجموعة بنجاح');
  } catch (e: any) {
    showToast(e?.response?.data?.message || 'حدث خطأ', false);
  } finally { saving.value = false; }
}

function confirmDelete(g: Group) { deleteTarget.value = g; }

async function deleteGroup() {
  if (!deleteTarget.value) return;
  saving.value = true;
  try {
    await api.delete(`/groups/${deleteTarget.value.id}`);
    groups.value = groups.value.filter(g => g.id !== deleteTarget.value!.id);
    if (selectedGroup.value?.id === deleteTarget.value.id) {
      selectedGroup.value = null;
      givenPerms.value = [];
    }
    showToast('تم حذف المجموعة');
    deleteTarget.value = null;
  } catch {
    showToast('حدث خطأ أثناء الحذف', false);
  } finally { saving.value = false; }
}

async function savePermissions() {
  if (!selectedGroup.value) return;
  saving.value = true;
  try {
    const payload: any = { permissions: JSON.stringify(givenPerms.value) };
    if (selectedDashId.value !== undefined) payload.dashboardId = selectedDashId.value ?? null;
    await api.patch(`/groups/${selectedGroup.value.id}`, payload);
    const g = groups.value.find(x => x.id === selectedGroup.value!.id);
    if (g) { g.permissions = JSON.stringify(givenPerms.value); g.dashboardId = selectedDashId.value; }
    showToast(`تم حفظ ${givenPerms.value.length} صلاحية بنجاح`);
  } catch {
    showToast('حدث خطأ أثناء الحفظ', false);
  } finally { saving.value = false; }
}

loadGroups();
</script>
