<template>
  <div>
    <!-- Toast -->
    <div
      v-if="toast.show"
      :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-50 text-white px-6 py-3 rounded-xl shadow-lg text-sm font-medium transition"
    >
      {{ toast.message }}
    </div>

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">المدراء</h2>
      <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
        <i class="fas fa-plus"></i> إضافة مدير
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input
        v-model="search"
        placeholder="بحث بالاسم أو الهاتف أو المنصب..."
        class="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.size > 0 && paginatedManagers.every(m => selectedIds.has(m.id))"
                  :indeterminate="selectedIds.size > 0 && !paginatedManagers.every(m => selectedIds.has(m.id))"
                  @change="toggleSelectAll" />
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">#</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('username')">
                <span class="inline-flex items-center gap-1">اسم الدخول<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='username'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='username'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('name')">
                <span class="inline-flex items-center gap-1">الاسم الكامل<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='name'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='name'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('balance')">
                <span class="inline-flex items-center gap-1">الرصيد<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='balance'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='balance'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('loans')">
                <span class="inline-flex items-center gap-1">القروض<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='loans'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='loans'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الصلاحيات</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">تابع الى</th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('subscriberCount')">
                <span class="inline-flex items-center gap-1">عدد المشتركين<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='subscriberCount'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='subscriberCount'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs cursor-pointer select-none hover:text-primary" @click="setSort('points')">
                <span class="inline-flex items-center gap-1">النقاط<span class="inline-flex flex-col leading-none text-[9px]"><span :class="sortKey==='points'&&sortDir==='asc'?'text-primary':'text-gray-300'">▲</span><span :class="sortKey==='points'&&sortDir==='desc'?'text-primary':'text-gray-300'">▼</span></span></span>
              </th>
              <th class="text-right px-3 py-3 font-semibold text-gray-500 text-xs">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredManagers.length === 0">
              <td colspan="11" class="text-center py-12 text-gray-400">لا يوجد مدراء</td>
            </tr>
            <tr
              v-for="(m, index) in paginatedManagers"
              :key="m.id"
              :class="selectedIds.has(m.id) ? 'bg-primary/5' : 'hover:bg-gray-50'"
              class="border-b border-gray-50 transition"
            >
              <td class="px-3 py-3">
                <input type="checkbox" class="w-4 h-4 accent-primary rounded cursor-pointer"
                  :checked="selectedIds.has(m.id)"
                  @change="toggleSelect(m.id)" />
              </td>
              <td class="px-3 py-3 text-gray-400">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-3 py-3 font-mono text-indigo-700 font-semibold">{{ m.username || '—' }}</td>
              <td class="px-3 py-3 font-medium text-secondary">{{ m.name }}</td>
              <td class="px-3 py-3 text-green-700 font-semibold">{{ fmtNum(m.balance) }}</td>
              <td class="px-3 py-3 text-red-600 font-semibold">{{ fmtNum(m.loans) }}</td>
              <td class="px-3 py-3 text-gray-600 max-w-[140px] truncate" :title="m.permissions || ''">{{ m.permissions || '—' }}</td>
              <td class="px-3 py-3 text-gray-600">{{ getParentName(m.parentId) }}</td>
              <td class="px-3 py-3">
                <span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">{{ m.subscriberCount ?? 0 }}</span>
              </td>
              <td class="px-3 py-3 text-amber-600 font-semibold">{{ fmtNum(m.points) }}</td>
              <td class="px-3 py-3">
                <div class="flex gap-1">
                  <button @click="openEdit(m)" class="text-primary hover:bg-primary/10 px-2.5 py-1 rounded-lg text-xs transition">تعديل</button>
                  <button @click="remove(m.id)" class="text-danger hover:bg-danger/10 px-2.5 py-1 rounded-lg text-xs transition">حذف</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            ««
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            «
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage
                ? 'bg-primary border-primary text-white shadow-sm shadow-primary/30'
                : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »»
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button v-for="size in [5, 10, 50, 100, 500]" :key="size"
            @click="pageSize = size; currentPage = 1"
            class="w-10 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
            :class="pageSize === size
              ? 'bg-gray-200 border-gray-300 text-gray-600'
              : 'border-gray-200 text-gray-400 hover:border-primary hover:text-primary'">
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl" dir="rtl">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-base text-secondary flex items-center gap-2">
            <i class="fas fa-user-shield text-primary text-sm"></i>
            {{ editingId ? 'تعديل مدير' : 'إضافة مدير جديد' }}
          </h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
            <i class="fas fa-times text-xs"></i>
          </button>
        </div>

        <div class="overflow-y-auto" style="max-height:72vh">
          <!-- ── قسم 1: معلومات عامة ─────────────────────────────── -->
          <div class="px-6 pt-5 pb-2">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="flex-1 border-t border-gray-100"></span>
              معلومات عامة
              <span class="flex-1 border-t border-gray-100"></span>
            </p>
            <div class="grid grid-cols-2 gap-x-5 gap-y-4">

              <!-- اسم الدخول -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  اسم الدخول <span class="text-red-400">*</span>
                </label>
                <input v-model="form.username"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  placeholder="اسم الدخول" />
                <p v-if="formErrors.username" class="text-red-500 text-[11px] mt-0.5">{{ formErrors.username }}</p>
              </div>

              <!-- فعال toggle -->
              <div class="flex items-center gap-3 pt-6">
                <button type="button"
                  @click="form.active = !form.active"
                  :class="form.active ? 'bg-primary' : 'bg-gray-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition flex-shrink-0">
                  <span :class="form.active ? 'translate-x-5' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition"></span>
                </button>
                <span class="text-sm text-gray-600 font-medium">فعال</span>
              </div>

              <!-- كلمة الدخول -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  كلمة الدخول <span v-if="!editingId" class="text-red-400">*</span>
                  <span v-else class="text-xs text-gray-400 font-normal">(اتركها فارغة للإبقاء)</span>
                </label>
                <input v-model="form.password" type="password"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="كلمة الدخول" />
              </div>

              <!-- تأكيد كلمة الدخول -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  تأكيد كلمة الدخول <span v-if="!editingId" class="text-red-400">*</span>
                </label>
                <input v-model="form.confirmPassword" type="password"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  :class="form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-300 ring-1 ring-red-300' : ''"
                  placeholder="تأكيد كلمة الدخول" />
                <p v-if="form.confirmPassword && form.password !== form.confirmPassword" class="text-red-500 text-[11px] mt-0.5">كلمتا الدخول غير متطابقتين</p>
              </div>

              <!-- المجموعة (security group) -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  المجموعة <span class="text-red-400">*</span>
                  <span v-if="selectedGroupPerms.length" class="mr-2 text-[11px] font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {{ selectedGroupPerms.length }} صلاحية
                  </span>
                </label>
                <select v-model="form.groupId"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option :value="null">— اختر المجموعة —</option>
                  <option v-for="g in securityGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
                </select>
                <p v-if="formErrors.groupId" class="text-red-500 text-[11px] mt-0.5">{{ formErrors.groupId }}</p>

                <!-- Permissions Preview from selected group -->
                <div v-if="form.groupId && selectedGroupPerms.length" class="mt-2 border border-gray-100 rounded-lg bg-gray-50 overflow-hidden">
                  <div class="flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200">
                    <span class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">الصلاحيات الممنوحة من هذه المجموعة</span>
                    <button type="button" @click="showGroupPerms = !showGroupPerms"
                      class="text-[11px] text-primary hover:underline">
                      {{ showGroupPerms ? 'إخفاء' : 'عرض' }}
                    </button>
                  </div>
                  <div v-if="showGroupPerms" class="max-h-48 overflow-y-auto px-3 py-2">
                    <template v-for="cat in selectedGroupPermCats" :key="cat">
                      <p class="text-[10px] font-bold text-gray-400 uppercase mt-2 mb-1">{{ cat }}</p>
                      <div class="flex flex-wrap gap-1">
                        <span v-for="pk in selectedGroupPermsInCat(cat)" :key="pk"
                          class="inline-flex items-center gap-1 text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                          <i class="fas fa-check text-green-500 text-[9px]"></i>
                          {{ permLabel(pk) }}
                        </span>
                      </div>
                    </template>
                  </div>
                  <div v-else class="px-3 py-1.5 flex flex-wrap gap-1">
                    <span v-for="pk in selectedGroupPerms.slice(0,8)" :key="pk"
                      class="text-[11px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                      {{ permLabel(pk) }}
                    </span>
                    <span v-if="selectedGroupPerms.length > 8"
                      class="text-[11px] text-gray-400 px-1 py-0.5">+{{ selectedGroupPerms.length - 8 }} أخرى</span>
                  </div>
                </div>
                <div v-else-if="form.groupId && !selectedGroupPerms.length" class="mt-1.5 text-[11px] text-amber-500 flex items-center gap-1">
                  <i class="fas fa-exclamation-triangle text-[10px]"></i>
                  هذه المجموعة لا تحتوي على صلاحيات بعد — يمكنك تعيينها من صفحة الصلاحيات
                </div>
              </div>

              <!-- تابع الى -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">
                  تابع الى <span class="text-red-400">*</span>
                </label>
                <select v-model="form.parentId"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option :value="null">— بدون —</option>
                  <option v-for="mgr in managers.filter(mg => mg.id !== editingId)" :key="mgr.id" :value="mgr.id">
                    {{ mgr.name }}{{ mgr.username ? ` (${mgr.username})` : '' }}
                  </option>
                </select>
                <p v-if="formErrors.parentId" class="text-red-500 text-[11px] mt-0.5">{{ formErrors.parentId }}</p>
              </div>

            </div>
          </div>

          <!-- ── قسم 2: معلومات شخصية ────────────────────────────── -->
          <div class="px-6 pt-4 pb-2">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="flex-1 border-t border-gray-100"></span>
              معلومات شخصية
              <span class="flex-1 border-t border-gray-100"></span>
            </p>
            <div class="grid grid-cols-2 gap-x-5 gap-y-4">

              <!-- الاسم الكامل -->
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">الاسم الكامل</label>
                <input v-model="form.name"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="الاسم الكامل" />
              </div>

              <!-- الهاتف -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">الهاتف</label>
                <input v-model="form.phone" type="tel"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+964 7XX XXX XXXX" />
              </div>

              <!-- البريد -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">البريد الإلكتروني</label>
                <input v-model="form.email" type="email"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="email@example.com" />
              </div>

            </div>
          </div>

          <!-- ── قسم 3: معلومات مالية ────────────────────────────── -->
          <div class="px-6 pt-4 pb-5">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span class="flex-1 border-t border-gray-100"></span>
              معلومات مالية
              <span class="flex-1 border-t border-gray-100"></span>
            </p>
            <div class="grid grid-cols-3 gap-x-5 gap-y-4">

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">الرصيد</label>
                <input v-model.number="form.balance" type="number" step="0.01"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">القروض</label>
                <input v-model.number="form.loans" type="number" step="0.01"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">النقاط</label>
                <input v-model.number="form.points" type="number" step="0.01"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-600 mb-1">المنصب</label>
                <input v-model="form.position"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="مثال: موزع" />
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">ملاحظات</label>
                <textarea v-model="form.notes" rows="1"
                  class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
              </div>

            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <span v-if="formErrors.general" class="text-red-500 text-xs">{{ formErrors.general }}</span>
          <span v-else></span>
          <div class="flex gap-2">
            <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">إلغاء</button>
            <button
              @click="save"
              :disabled="saving"
              class="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-60"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              حفظ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { logActivity } from '../../utils/activityLog';

const managers = ref<any[]>([]);
const groups   = ref<any[]>([]);
// All groups are shown — user picks the one configured with permissions in PermissionsView
const securityGroups = computed(() => groups.value);
const showModal = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const search = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const toast = ref({ show: false, message: '', type: 'success' });
const selectedIds = ref<Set<number>>(new Set());

const form = ref({
  username: '', name: '', balance: 0, loans: 0,
  permissions: '', groupId: null as number | null, parentId: null as number | null,
  points: 0, phone: '', email: '', position: '', notes: '', active: true,
  password: '', confirmPassword: '',
});

const formErrors = ref<Record<string, string>>({});

// ── Permission labels (matches PermissionsView ALL_PERMS) ─────────────────────
const PERM_LABELS: Record<string, string> = {
  'prm_managers_sub_sysadmin':'prm_managers_sub_sysadmin','managers.sysadmin':'مدراء - مدير نظام','managers.edit':'مدراء - تعديل','managers.edit_personal':'مدراء - تعديل المعلومات الشخصية','managers.withdraw':'مدراء - سحب نقود','managers.2fa':'مدراء - استخدام المصادقة الثنائية','managers.change_password':'مدراء - تغيير كلمة السر','managers.add':'مدراء - اضافة','managers.delete':'مدراء - حذف','managers.deposit':'مدراء - ايداع نقود','managers.export':'مدراء - تصدير الى اكسل','managers.view':'مدراء - عرض','managers.index':'Managers - Index (All Managers)','managers.invoices':'مدراء - عرض الفواتير','managers.journal':'مدراء - عرض السجل المالي','prm_managers_journal_comment':'prm_managers_journal_comment','managers.login_as':'مدراء - الدخول بأسم مدير ثاني (خطر)','managers.ppp_lock':'ppp service - قفل مدير على الاتصالات','managers.connections':'مدراء - عرض الاتصالات','managers.rename':'مدراء - تغيير الاسم',
  'users.add':'العملاء - اضافة','users.delete':'العملاء - حذف','users.delete_active':'العملاء - حذف العملاء الفعاليين','users.enable':'العملاء - تفعيل','users.enable_card':'العملاء - تفعيل بالبطاقة','users.enable_mgr_bal':'العملاء - تفعيل برصيد المدير','users.enable_usr_bal':'العملاء - تفعيل برصيد المشترك','users.vas':'شراء خدمات القيمة المضافة','users.deposit':'العملاء - ايداع نقود','users.withdraw':'العملاء - سحب الاموال','users.disconnect':'العملاء - قطع الاتصال','users.export':'العملاء - تصدير الى اكسل','users.extend':'العملاء - تمديد الاشتراك','users.cancel':'العملاء - الغاء الاشتراك','users.cancel_profile':'العملاء - الغاء طلب تغيير البروفايل','users.view':'العملاء - عرض','users.view_all':'العملاء - عرض الجميع','users.list_group':'Users - List All Group Users','users.add_data':'العملاء - اضافة بيانات','users.update_data':'العملاء - تحديث البيانات','users.edit_sensitive':'العملاء - تعديل البيانات الحساسة (خطر)','users.change_manager':'العملاء - تغيير المدير','users.change_profile':'العملاء - تغيير البروفايل','users.change_profile_active':'العملاء - تغيير البروفايل للمستخدمين الفعاليين','users.toggle_autorenew':'العملاء - ايقاف وتشغيل التجديد التلقائي','users.rename':'العملاء - تغيير اسم الدخول','users.mac':'العملاء - تعديل الماك','users.mac_lock':'العملاء - قفل على الماك','users.ping':'العملاء - Ping','users.pos':'العملاء - نقطة بيع','users.free_zone':'العملاء - اظهار بيانات استهلاك المنطقة الحرة','users.operations_log':'العملاء - اظهار سجل العمليات','users.invoices':'العملاء - اضهار الفواتير','users.journal':'العملاء - اضهار السجل المالي','users.monitor':'العملاء - مراقبة الاستهلاك الحالي','users.sessions':'العملاء - اضهار الجلسات','users.show_password':'العملاء - اظهار كلمة السر','users.reset_quota':'العملاء - تصفير الكوتا اليومية','users.points_system':'العملاء - نظام انقاط التشجيعية','users.compensate':'العملاء - تعويض','users.approve_comp':'العملاء - الموافقة على التعويضات','users.upload_comp':'Users - Upload Compensations File','prm_users_support_admin':'prm_users_support_admin','users.support':'العملاء - رسائل الدعم الفني',
};
function permLabel(key: string): string { return PERM_LABELS[key] ?? key; }
function permCat(key: string): string {
  if (key.startsWith('managers.') || key === 'prm_managers_sub_sysadmin' || key === 'prm_managers_journal_comment') return 'managers';
  if (key.startsWith('users.') || key === 'prm_users_support_admin') return 'users';
  return 'أخرى';
}

const showGroupPerms = ref(false);
const selectedGroupPerms = computed<string[]>(() => {
  if (!form.value.groupId) return [];
  const g = groups.value.find(x => x.id === form.value.groupId);
  if (!g?.permissions) return [];
  try { const arr = JSON.parse(g.permissions); return Array.isArray(arr) ? arr : []; } catch { return []; }
});
const selectedGroupPermCats = computed(() => [...new Set(selectedGroupPerms.value.map(permCat))]);
function selectedGroupPermsInCat(cat: string) { return selectedGroupPerms.value.filter(k => permCat(k) === cat); }

function fmtNum(v: any): string {
  const n = parseFloat(v);
  if (!v && v !== 0) return '—';
  if (isNaN(n)) return '—';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}

function getParentName(parentId: number | null): string {
  if (!parentId) return '—';
  const p = managers.value.find(m => m.id === parentId);
  return p ? (p.name + (p.username ? ` (${p.username})` : '')) : '—';
}

function toggleSelect(id: number) {
  const s = new Set(selectedIds.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedIds.value = s;
}

function toggleSelectAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  const s = new Set(selectedIds.value);
  for (const m of paginatedManagers.value) {
    checked ? s.add(m.id) : s.delete(m.id);
  }
  selectedIds.value = s;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

const sortKey = ref<string>('');
const sortDir = ref<'asc' | 'desc'>('asc');

function setSort(key: string) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
  currentPage.value = 1;
}

const filteredManagers = computed(() => {
  const q = search.value.trim().toLowerCase();
  let list = q
    ? managers.value.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q) ||
        m.position?.toLowerCase().includes(q)
      )
    : [...managers.value];

  if (sortKey.value) {
    const key = sortKey.value;
    const dir = sortDir.value === 'asc' ? 1 : -1;
    list = list.slice().sort((a, b) => {
      const av = a[key] ?? '';
      const bv = b[key] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'ar') * dir;
    });
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredManagers.value.length / pageSize.value)));

const paginatedManagers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredManagers.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

async function loadData() {
  try {
    const [mgr, grp] = await Promise.all([api.get('/managers'), api.get('/groups')]);
    managers.value = mgr.data;
    groups.value   = grp.data;
  } catch {}
}

function openAdd() {
  editingId.value = null;
  formErrors.value = {};
  showGroupPerms.value = false;
  form.value = { username: '', name: '', balance: 0, loans: 0, permissions: '', groupId: null, parentId: null, points: 0, phone: '', email: '', position: '', notes: '', active: true, password: '', confirmPassword: '' };
  showModal.value = true;
}

function openEdit(m: any) {
  editingId.value = m.id;
  formErrors.value = {};
  showGroupPerms.value = false;
  form.value = {
    username: m.username || '',
    name: m.name || '',
    balance: parseFloat(m.balance) || 0,
    loans: parseFloat(m.loans) || 0,
    permissions: m.permissions || '',
    groupId: m.groupId || null,
    parentId: m.parentId || null,
    points: parseFloat(m.points) || 0,
    phone: m.phone || '',
    email: m.email || '',
    position: m.position || '',
    notes: m.notes || '',
    active: m.active !== false,
    password: '', confirmPassword: '',
  };
  showModal.value = true;
}

async function save() {
  formErrors.value = {};
  // Validation
  if (!form.value.username.trim()) { formErrors.value.username = 'اسم الدخول is required'; }
  if (!form.value.groupId)         { formErrors.value.groupId  = 'المجموعة is required'; }
  if (!editingId.value && !form.value.password) { formErrors.value.general = 'كلمة الدخول مطلوبة'; }
  if (form.value.password && form.value.password !== form.value.confirmPassword) {
    formErrors.value.general = 'كلمتا الدخول غير متطابقتين';
  }
  if (Object.keys(formErrors.value).length) return;

  saving.value = true;
  try {
    const { confirmPassword, ...rest } = form.value;
    const payload: any = { ...rest };
    if (!payload.password) delete payload.password;
    if (editingId.value) {
      await api.patch(`/managers/${editingId.value}`, payload);
      logActivity({ action: 'edit_manager', module: 'manager', subscriberName: form.value.name, details: `تعديل بيانات المدير: ${form.value.name}` });
      showToast('تم تعديل المدير بنجاح');
    } else {
      await api.post('/managers', payload);
      logActivity({ action: 'add_manager', module: 'manager', subscriberName: form.value.name, details: `إضافة مدير جديد: ${form.value.name}` });
      showToast('تم إضافة المدير بنجاح');
    }
    showModal.value = false;
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    formErrors.value.general = Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ');
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المدير؟')) return;
  const mgr = managers.value.find(m => m.id === id);
  try {
    await api.delete(`/managers/${id}`);
    if (mgr) logActivity({ action: 'delete_manager', module: 'manager', subscriberName: mgr.name, details: `حذف المدير: ${mgr.name}` });
    showToast('تم حذف المدير بنجاح');
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ'), 'error');
  }
}

onMounted(loadData);
</script>
