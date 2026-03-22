<template>
  <div class="-m-4 lg:-m-6 flex flex-col bg-gray-100 overflow-hidden" style="height:calc(100vh - 56px)" dir="rtl">

    <!-- ══ Top Toolbar ══════════════════════════════════════════════════════ -->
    <div class="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between flex-shrink-0 select-none">
      <div class="flex items-center gap-3 text-gray-400 text-sm">
        <i class="fas fa-cog hover:text-white cursor-pointer transition"></i>
        <i class="fas fa-list hover:text-white cursor-pointer transition"></i>
        <div class="w-px h-4 bg-gray-700"></div>
        <i class="fas fa-columns hover:text-white cursor-pointer transition"></i>
        <div class="w-px h-4 bg-gray-700"></div>
        <i class="fas fa-bell hover:text-white cursor-pointer transition"></i>
        <i class="fas fa-sync hover:text-white cursor-pointer transition" @click="loadGroups"></i>
      </div>
      <div class="flex items-center gap-2 text-sm">
        <i class="fas fa-folder-open text-gray-400 text-xs"></i>
        <span class="font-semibold tracking-wide">Security Groups</span>
        <i class="fas fa-sign-out-alt text-gray-500 text-xs cursor-pointer hover:text-white ml-1"></i>
      </div>
    </div>

    <!-- ══ Search + Add ══════════════════════════════════════════════════════ -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
      <div class="flex items-center gap-2 border border-gray-300 rounded px-2.5 py-1.5 bg-white">
        <i class="fas fa-search text-gray-400 text-xs"></i>
        <input v-model="search" class="outline-none bg-transparent text-sm w-44" placeholder="بحث..." />
        <button v-if="search" @click="search = ''" class="text-gray-400 hover:text-gray-600 text-xs">مسح</button>
      </div>
      <button @click="showNewModal = true"
        class="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded flex items-center gap-1.5">
        <i class="fas fa-plus text-xs"></i>
        + سجلات
      </button>
    </div>

    <!-- ══ Main Area ═════════════════════════════════════════════════════════ -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Groups Table -->
      <div class="bg-white flex-shrink-0 overflow-y-auto border-b border-gray-300"
        :style="selectedGroup ? 'max-height:36%' : 'flex:1'">
        <table class="w-full text-sm select-none">
          <thead class="bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th class="w-8 px-3 py-2 text-center"><input type="checkbox" class="accent-blue-500" /></th>
              <th class="px-3 py-2 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-200" @click="doSort('name')">
                GROUP <i :class="sortIcon('name')" class="ml-1 text-[11px] text-gray-400"></i>
              </th>
              <th class="px-3 py-2 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-200" @click="doSort('description')">
                DASHBOARD <i :class="sortIcon('description')" class="ml-1 text-[11px] text-gray-400"></i>
              </th>
              <th class="px-3 py-2 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-200" @click="doSort('count')">
                PERMISSIONS <i :class="sortIcon('count')" class="ml-1 text-[11px] text-gray-400"></i>
              </th>
              <th class="w-8 px-3 py-2 text-center"><input type="checkbox" class="accent-blue-500" /></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in sortedGroups" :key="g.id"
              class="border-b border-gray-100 cursor-pointer transition"
              :class="selectedGroup?.id === g.id ? 'bg-blue-100' : 'hover:bg-blue-50'"
              @click="selectGroup(g)">
              <td class="px-3 py-1.5 text-center">
                <input type="checkbox" class="accent-blue-500" :checked="selectedGroup?.id === g.id" @click.stop />
              </td>
              <td class="px-3 py-1.5 text-blue-600 font-medium">{{ g.name }}</td>
              <td class="px-3 py-1.5 text-xs">
                <span v-if="dashboardNameOf(g)" class="inline-flex items-center gap-1 text-indigo-600">
                  <i class="fas fa-columns text-[10px]"></i>
                  {{ dashboardNameOf(g) }}
                </span>
                <span v-else class="text-gray-400">&mdash;</span>
              </td>
              <td class="px-3 py-1.5 text-gray-700 font-medium">{{ permCount(g) }}</td>
              <td class="px-3 py-1.5 text-center">
                <input type="checkbox" class="accent-blue-500" :checked="selectedGroup?.id === g.id" @click.stop />
              </td>
            </tr>
            <tr v-if="!sortedGroups.length">
              <td colspan="5" class="text-center py-10 text-gray-400 text-sm">لا توجد مجموعات أمان</td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination -->
        <div class="flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs text-gray-500 bg-white sticky bottom-0">
          <div class="flex items-center gap-1">
            <button class="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-100">|◄</button>
            <button class="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-100">◄</button>
            <span class="px-2 py-0.5 bg-blue-500 text-white rounded text-[11px]">1</span>
            <button class="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-100">►</button>
            <button class="px-1.5 py-0.5 border border-gray-200 rounded hover:bg-gray-100">►|</button>
          </div>
          <div class="flex items-center gap-2">
            <span>{{ sortedGroups.length }} سجل</span>
            <select class="border border-gray-200 rounded px-1 py-0.5 text-xs bg-white">
              <option>500</option><option>100</option><option>50</option><option selected>10</option>
            </select>
          </div>
        </div>
      </div>

      <!-- ══ Permission Transfer Panel ══════════════════════════════════════ -->
      <div v-if="selectedGroup" class="flex flex-col overflow-hidden min-h-0" style="flex:1">

        <!-- Dashboard Selector Bar -->
        <div class="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
          <i class="fas fa-columns text-gray-400 text-sm"></i>
          <span class="text-xs font-semibold text-gray-600 whitespace-nowrap">لوحة التحكم:</span>
          <select v-model="selectedDashboardId"
            class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary max-w-xs">
            <option :value="null">&mdash; بدون لوحة &mdash;</option>
            <option v-for="d in dashboardGroups" :key="d.id" :value="d.id">{{ d.name }}</option>
          </select>
          <span v-if="selectedDashboardId" class="text-[11px] text-indigo-500 flex items-center gap-1">
            <i class="fas fa-link text-[10px]"></i>
            {{ dashboardGroups.find(d => d.id === selectedDashboardId)?.name }}
          </span>
        </div>

        <!-- Three-column transfer -->
        <div class="flex-1 flex overflow-hidden min-h-0">

        <!-- Available Permissions (right in RTL) -->
        <div class="flex-1 flex flex-col overflow-hidden bg-white border-l border-gray-200">
          <div class="bg-[#2d3748] text-white px-3 py-1.5 flex items-center justify-between flex-shrink-0">
            <i class="fas fa-clipboard-list text-gray-400 text-xs"></i>
            <span class="text-xs font-semibold">Available Permissions</span>
            <span class="text-[10px] text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded-full">{{ availPerms.length }}</span>
          </div>
          <!-- Scroll up indicator -->
          <div class="flex justify-center py-0.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 text-[10px] leading-none px-3">▲</button>
          </div>
          <div class="flex-1 overflow-y-auto text-xs">
            <template v-for="cat in availCats" :key="cat">
              <div class="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 sticky top-0 z-10">
                <i class="fas fa-clipboard text-gray-300 text-[10px] cursor-pointer" @click.stop="copyText(cat)"></i>
                <span class="flex-1 text-right pr-1">{{ catLabel(cat) }}</span>
                <i class="fas fa-chevron-left text-gray-400 text-[10px]"></i>
              </div>
              <div v-for="p in availInCat(cat)" :key="p.key"
                class="flex items-center justify-between px-3 py-1 border-b border-gray-50 cursor-pointer hover:bg-blue-50 transition"
                :class="selAvail.has(p.key) ? 'bg-blue-100 text-blue-800' : 'text-gray-700'"
                @click="toggleAvail(p.key)"
                @dblclick="addPerm(p.key)">
                <i class="fas fa-clipboard text-gray-200 hover:text-gray-400 text-[10px] cursor-pointer" @click.stop="copyText(p.key)"></i>
                <span class="flex-1 text-right px-2">{{ p.label }}</span>
                <i class="fas fa-ban text-gray-300 text-[10px]"></i>
              </div>
            </template>
            <div v-if="!availPerms.length" class="text-center py-8 text-gray-400">كل الصلاحيات ممنوحة ✓</div>
          </div>
          <div class="flex justify-center py-0.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 text-[10px] leading-none px-3">▼</button>
          </div>
        </div>

        <!-- Transfer Arrows -->
        <div class="w-24 flex flex-col items-center justify-center gap-3 bg-gray-50 border-x border-gray-200 flex-shrink-0">
          <button @click="moveToGiven" title="أضف الصلاحيات المحددة"
            class="w-16 py-2.5 bg-[#4db6e8] hover:bg-[#30a4d6] active:bg-[#0e90c8] text-white rounded text-xl font-bold shadow transition flex items-center justify-center">
            ‹
          </button>
          <button @click="moveToAvail" title="أزل الصلاحيات المحددة"
            class="w-16 py-2.5 bg-[#4db6e8] hover:bg-[#30a4d6] active:bg-[#0e90c8] text-white rounded text-xl font-bold shadow transition flex items-center justify-center">
            ›
          </button>
        </div>

        <!-- Given Permissions (left in RTL) -->
        <div class="flex-1 flex flex-col overflow-hidden bg-white">
          <div class="bg-[#2d3748] text-white px-3 py-1.5 flex items-center justify-between flex-shrink-0">
            <i class="fas fa-user-shield text-gray-400 text-xs"></i>
            <span class="text-xs font-semibold">Given Permissions</span>
            <span class="text-[10px] text-gray-400 bg-gray-600 px-1.5 py-0.5 rounded-full">{{ givenPerms.length }}</span>
          </div>
          <div class="flex justify-center py-0.5 border-b border-gray-100 bg-gray-50 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 text-[10px] leading-none px-3">▲</button>
          </div>
          <div class="flex-1 overflow-y-auto text-xs">
            <template v-for="cat in givenCats" :key="cat">
              <div class="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 sticky top-0 z-10">
                <i class="fas fa-clipboard text-gray-300 text-[10px] cursor-pointer" @click.stop="copyText(cat)"></i>
                <span class="flex-1 text-right pr-1">{{ catLabel(cat) }}</span>
                <i class="fas fa-chevron-left text-gray-400 text-[10px]"></i>
              </div>
              <div v-for="p in givenInCat(cat)" :key="p.key"
                class="flex items-center justify-between px-3 py-1 border-b border-gray-50 cursor-pointer hover:bg-red-50 transition"
                :class="selGiven.has(p.key) ? 'bg-red-100 text-red-800' : 'text-gray-700'"
                @click="toggleGiven(p.key)"
                @dblclick="removePerm(p.key)">
                <i class="fas fa-clipboard text-gray-200 hover:text-gray-400 text-[10px] cursor-pointer" @click.stop="copyText(p.key)"></i>
                <span class="flex-1 text-right px-2">{{ p.label }}</span>
                <i class="fas fa-ban text-gray-300 text-[10px]"></i>
              </div>
            </template>
            <div v-if="!givenPerms.length" class="text-center py-8 text-gray-400">لا توجد صلاحيات ممنوحة</div>
          </div>
          <div class="flex justify-center py-0.5 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button class="text-gray-400 hover:text-gray-600 text-[10px] leading-none px-3">▼</button>
          </div>
        </div>

        </div><!-- end Three-column transfer -->
      </div><!-- end Permission Transfer Panel -->

    </div>

    <!-- ══ Save Bar ══════════════════════════════════════════════════════════ -->
    <div v-if="selectedGroup" class="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
      <span class="text-xs text-gray-500">
        تحرير صلاحيات:
        <strong class="text-gray-800">{{ selectedGroup.name }}</strong>
        <span class="ml-2 text-gray-400">({{ givenPerms.length }} صلاحية)</span>
      </span>
      <button @click="savePermissions" :disabled="saving"
        class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-1.5 rounded font-semibold flex items-center gap-1.5 disabled:opacity-60 transition">
        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
        <i v-else class="fas fa-save"></i>
        حفظ الصلاحيات
      </button>
    </div>

    <!-- ══ New Group Modal ═══════════════════════════════════════════════════ -->
    <div v-if="showNewModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" @click.self="showNewModal = false">
      <div class="bg-white rounded-xl shadow-2xl p-6 w-96" dir="rtl">
        <h3 class="font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-folder-plus text-primary text-sm"></i>
          مجموعة أمان جديدة
        </h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">اسم المجموعة *</label>
            <input v-model="newForm.name"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثال: Administrator" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">لوحة التحكم (Dashboard)</label>
            <input v-model="newForm.description"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثال: Professional Dashboard" />
          </div>
        </div>
        <div class="flex gap-2 mt-5">
          <button @click="createGroup" :disabled="!newForm.name.trim() || saving"
            class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 rounded-lg text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-1.5">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            إنشاء
          </button>
          <button @click="showNewModal = false"
            class="flex-1 border border-gray-300 hover:bg-gray-50 py-2 rounded-lg text-sm">
            إلغاء
          </button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" :class="toast.ok ? 'bg-green-500' : 'bg-red-500'"
      class="fixed bottom-14 left-1/2 -translate-x-1/2 text-white px-5 py-2.5 rounded-xl shadow-lg text-sm font-medium z-50">
      {{ toast.msg }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

// ── Permission Definitions ──────────────────────────────────────────────────
interface Perm { key: string; label: string; cat: string; }

const ALL_PERMS: Perm[] = [
  // ─── managers ───────────────────────────────────────────────────────────
  { key: 'prm_managers_sub_sysadmin',    label: 'prm_managers_sub_sysadmin',                           cat: 'managers' },
  { key: 'managers.sysadmin',            label: 'مدراء - مدير نظام',                                   cat: 'managers' },
  { key: 'managers.edit',                label: 'مدراء - تعديل',                                       cat: 'managers' },
  { key: 'managers.edit_personal',       label: 'مدراء - تعديل المعلومات الشخصية',                     cat: 'managers' },
  { key: 'managers.withdraw',            label: 'مدراء - سحب نقود',                                    cat: 'managers' },
  { key: 'managers.2fa',                 label: 'مدراء - استخدام المصادقة الثنائية',                   cat: 'managers' },
  { key: 'managers.change_password',     label: 'مدراء - تغيير كلمة السر',                             cat: 'managers' },
  { key: 'managers.add',                 label: 'مدراء - اضافة',                                       cat: 'managers' },
  { key: 'managers.delete',              label: 'مدراء - حذف',                                         cat: 'managers' },
  { key: 'managers.deposit',             label: 'مدراء - ايداع نقود',                                  cat: 'managers' },
  { key: 'managers.export',              label: 'مدراء - تصدير الى اكسل',                              cat: 'managers' },
  { key: 'managers.view',                label: 'مدراء - عرض',                                         cat: 'managers' },
  { key: 'managers.index',               label: 'Managers - Index (All Managers)',                     cat: 'managers' },
  { key: 'managers.invoices',            label: 'مدراء - عرض الفواتير',                                cat: 'managers' },
  { key: 'managers.journal',             label: 'مدراء - عرض السجل المالي',                            cat: 'managers' },
  { key: 'prm_managers_journal_comment', label: 'prm_managers_journal_comment',                        cat: 'managers' },
  { key: 'managers.login_as',            label: 'مدراء - الدخول بأسم مدير ثاني (خطر)',                 cat: 'managers' },
  { key: 'managers.ppp_lock',            label: 'ppp service - قفل مدير على الاتصالات',                cat: 'managers' },
  { key: 'managers.connections',         label: 'مدراء - عرض الاتصالات',                               cat: 'managers' },
  { key: 'managers.rename',              label: 'مدراء - تغيير الاسم',                                 cat: 'managers' },
  // ─── users / العملاء ───────────────────────────────────────────────────
  { key: 'users.add',                    label: 'العملاء - اضافة',                                     cat: 'users' },
  { key: 'users.delete',                 label: 'العملاء - حذف',                                       cat: 'users' },
  { key: 'users.delete_active',          label: 'العملاء - حذف العملاء الفعاليين',                    cat: 'users' },
  { key: 'users.enable',                 label: 'العملاء - تفعيل',                                     cat: 'users' },
  { key: 'users.enable_card',            label: 'العملاء - تفعيل بالبطاقة',                            cat: 'users' },
  { key: 'users.enable_mgr_bal',         label: 'العملاء - تفعيل برصيد المدير',                       cat: 'users' },
  { key: 'users.enable_usr_bal',         label: 'العملاء - تفعيل برصيد المشترك',                      cat: 'users' },
  { key: 'users.vas',                    label: 'شراء خدمات القيمة المضافة',                           cat: 'users' },
  { key: 'users.deposit',                label: 'العملاء - ايداع نقود',                                cat: 'users' },
  { key: 'users.withdraw',               label: 'العملاء - سحب الاموال',                               cat: 'users' },
  { key: 'users.disconnect',             label: 'العملاء - قطع الاتصال',                               cat: 'users' },
  { key: 'users.export',                 label: 'العملاء - تصدير الى اكسل',                            cat: 'users' },
  { key: 'users.extend',                 label: 'العملاء - تمديد الاشتراك',                            cat: 'users' },
  { key: 'users.cancel',                 label: 'العملاء - الغاء الاشتراك',                            cat: 'users' },
  { key: 'users.cancel_profile',         label: 'العملاء - الغاء طلب تغيير البروفايل',                 cat: 'users' },
  { key: 'users.view',                   label: 'العملاء - عرض',                                       cat: 'users' },
  { key: 'users.view_all',               label: 'العملاء - عرض الجميع (حتى الغير تابعيين للمدير)',    cat: 'users' },
  { key: 'users.list_group',             label: 'Users - List All Group Users',                        cat: 'users' },
  { key: 'users.add_data',               label: 'العملاء - اضافة بيانات',                              cat: 'users' },
  { key: 'users.update_data',            label: 'العملاء - تحديث البيانات',                            cat: 'users' },
  { key: 'users.edit_sensitive',         label: 'العملاء - تعديل البيانات الحساسة (خطر)',              cat: 'users' },
  { key: 'users.change_manager',         label: 'العملاء - تغيير المدير',                              cat: 'users' },
  { key: 'users.change_profile',         label: 'العملاء - تغيير البروفايل',                           cat: 'users' },
  { key: 'users.change_profile_active',  label: 'العملاء - تغيير البروفايل للمستخدمين الفعاليين',    cat: 'users' },
  { key: 'users.toggle_autorenew',       label: 'العملاء - ايقاف وتشغيل التجديد التلقائي',            cat: 'users' },
  { key: 'users.rename',                 label: 'العملاء - تغيير اسم الدخول',                          cat: 'users' },
  { key: 'users.mac',                    label: 'العملاء - تعديل الماك',                               cat: 'users' },
  { key: 'users.mac_lock',               label: 'العملاء - قفل على الماك',                             cat: 'users' },
  { key: 'users.ping',                   label: 'العملاء - Ping',                                      cat: 'users' },
  { key: 'users.pos',                    label: 'العملاء - نقطة بيع',                                  cat: 'users' },
  { key: 'users.free_zone',              label: 'العملاء - اظهار بيانات استهلاك المنطقة الحرة',       cat: 'users' },
  { key: 'users.operations_log',         label: 'العملاء - اظهار سجل العمليات',                        cat: 'users' },
  { key: 'users.invoices',               label: 'العملاء - اضهار الفواتير',                            cat: 'users' },
  { key: 'users.journal',                label: 'العملاء - اضهار السجل المالي',                        cat: 'users' },
  { key: 'users.monitor',                label: 'العملاء - مراقبة الاستهلاك الحالي',                   cat: 'users' },
  { key: 'users.sessions',               label: 'العملاء - اضهار الجلسات',                             cat: 'users' },
  { key: 'users.show_password',          label: 'العملاء - اظهار كلمة السر',                           cat: 'users' },
  { key: 'users.reset_quota',            label: 'العملاء - تصفير الكوتا اليومية',                     cat: 'users' },
  { key: 'users.points_system',          label: 'العملاء - نظام انقاط التشجيعية',                     cat: 'users' },
  { key: 'users.compensate',             label: 'العملاء - تعويض',                                    cat: 'users' },
  { key: 'users.approve_comp',           label: 'العملاء - الموافقة على التعويضات',                    cat: 'users' },
  { key: 'users.upload_comp',            label: 'Users - Upload Compensations File',                   cat: 'users' },
  { key: 'prm_users_support_admin',      label: 'prm_users_support_admin',                            cat: 'users' },
  { key: 'users.support',               label: 'العملاء - رسائل الدعم الفني',                         cat: 'users' },
];

const CAT_LABELS: Record<string, string> = {
  managers: 'managers',
  users: 'users',
};
function catLabel(cat: string): string { return CAT_LABELS[cat] ?? cat; }
function defOf(key: string): Perm | undefined { return ALL_PERMS.find(p => p.key === key); }

// ── Group Types ──────────────────────────────────────────────────────────────
interface Group { id: number; name: string; description?: string; permissions?: string; dashboardId?: number; layout?: string; }

// ── State ────────────────────────────────────────────────────────────────────
const groups           = ref<Group[]>([]);
const dashboardGroups  = computed(() => groups.value.filter(g => g.layout && g.layout !== '[]'));
const selectedGroup    = ref<Group | null>(null);
const selectedDashboardId = ref<number | null>(null);
const search       = ref('');
const sortField    = ref<'name' | 'description' | 'count'>('name');
const sortDir      = ref<1 | -1>(1);
const saving       = ref(false);
const toast        = ref({ show: false, msg: '', ok: true });

function dashboardNameOf(g: Group): string | null {
  if (!g.dashboardId) return null;
  return groups.value.find(x => x.id === g.dashboardId)?.name ?? null;
}

// permissions transfer state
const givenPerms = ref<string[]>([]);
const selAvail   = ref<Set<string>>(new Set());
const selGiven   = ref<Set<string>>(new Set());

// new group modal
const showNewModal = ref(false);
const newForm      = ref({ name: '', description: '' });

// ── Computed ─────────────────────────────────────────────────────────────────
const sortedGroups = computed(() => {
  let list = [...groups.value];
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    list = list.filter(g =>
      g.name.toLowerCase().includes(q) ||
      (g.description ?? '').toLowerCase().includes(q),
    );
  }
  return list.sort((a, b) => {
    let av: any, bv: any;
    if (sortField.value === 'name')        { av = a.name;          bv = b.name; }
    else if (sortField.value === 'description') { av = a.description ?? ''; bv = b.description ?? ''; }
    else                                  { av = permCount(a);     bv = permCount(b); }
    return sortDir.value * (av < bv ? -1 : av > bv ? 1 : 0);
  });
});

const availPerms = computed(() => {
  const given = new Set(givenPerms.value);
  return ALL_PERMS.filter(p => !given.has(p.key));
});
const availCats = computed(() => [...new Set(availPerms.value.map(p => p.cat))]);
const givenCats = computed(() => {
  const cats: string[] = [];
  givenPerms.value.forEach(k => {
    const cat = defOf(k)?.cat ?? 'other';
    if (!cats.includes(cat)) cats.push(cat);
  });
  return cats;
});

function availInCat(cat: string): Perm[] { return availPerms.value.filter(p => p.cat === cat); }
function givenInCat(cat: string): Perm[] {
  return givenPerms.value
    .map(k => defOf(k))
    .filter((p): p is Perm => !!p && p.cat === cat);
}

function permCount(g: Group): number {
  try {
    const arr = JSON.parse(g.permissions || '[]');
    return Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string').length : 0;
  } catch { return 0; }
}

// ── Sorting ───────────────────────────────────────────────────────────────────
function doSort(f: typeof sortField.value) {
  if (sortField.value === f) sortDir.value = sortDir.value === 1 ? -1 : 1;
  else { sortField.value = f; sortDir.value = 1; }
}
function sortIcon(f: string): string {
  if (sortField.value !== f) return 'fas fa-sort text-gray-300';
  return sortDir.value === 1 ? 'fas fa-sort-up text-blue-400' : 'fas fa-sort-down text-blue-400';
}

// ── Select Group ──────────────────────────────────────────────────────────────
function selectGroup(g: Group) {
  selectedGroup.value = g;
  selectedDashboardId.value = g.dashboardId ?? null;
  try {
    const arr = JSON.parse(g.permissions || '[]');
    givenPerms.value = Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string') : [];
  } catch { givenPerms.value = []; }
  selAvail.value = new Set();
  selGiven.value = new Set();
}

// ── Toggle Selection ──────────────────────────────────────────────────────────
function toggleAvail(key: string) {
  const s = new Set(selAvail.value);
  s.has(key) ? s.delete(key) : s.add(key);
  selAvail.value = s;
}
function toggleGiven(key: string) {
  const s = new Set(selGiven.value);
  s.has(key) ? s.delete(key) : s.add(key);
  selGiven.value = s;
}

// ── Move Permissions ──────────────────────────────────────────────────────────
function moveToGiven() {
  if (!selAvail.value.size) return;
  givenPerms.value = [...new Set([...givenPerms.value, ...selAvail.value])];
  selAvail.value = new Set();
}
function moveToAvail() {
  if (!selGiven.value.size) return;
  const removing = new Set(selGiven.value);
  givenPerms.value = givenPerms.value.filter(k => !removing.has(k));
  selGiven.value = new Set();
}
function addPerm(key: string)    { if (!givenPerms.value.includes(key)) givenPerms.value = [...givenPerms.value, key]; }
function removePerm(key: string) { givenPerms.value = givenPerms.value.filter(k => k !== key); }

// ── Clipboard ─────────────────────────────────────────────────────────────────
function copyText(text: string) { navigator.clipboard?.writeText(text).catch(() => {}); }

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(msg: string, ok = true) {
  toast.value = { show: true, msg, ok };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

// ── API ───────────────────────────────────────────────────────────────────────
async function loadGroups() {
  try {
    const { data } = await api.get('/groups');
    groups.value = data;
  } catch {}
}

async function createGroup() {
  if (!newForm.value.name.trim()) return;
  saving.value = true;
  try {
    const { data } = await api.post('/groups', {
      name: newForm.value.name.trim(),
      description: newForm.value.description.trim() || undefined,
      permissions: '[]',
    });
    groups.value.push(data);
    showNewModal.value = false;
    newForm.value = { name: '', description: '' };
    selectGroup(data);
    showToast('تم إنشاء المجموعة بنجاح');
  } catch { showToast('حدث خطأ أثناء الإنشاء', false); }
  saving.value = false;
}

async function savePermissions() {
  if (!selectedGroup.value) return;
  saving.value = true;
  try {
    const payload: any = {
      permissions: JSON.stringify(givenPerms.value),
      dashboardId: selectedDashboardId.value ?? undefined,
    };
    await api.patch(`/groups/${selectedGroup.value.id}`, payload);
    const g = groups.value.find(x => x.id === selectedGroup.value!.id);
    if (g) { g.permissions = payload.permissions; g.dashboardId = selectedDashboardId.value ?? undefined; }
    showToast(`تم حفظ ${givenPerms.value.length} صلاحية بنجاح`);
  } catch { showToast('حدث خطأ أثناء الحفظ', false); }
  saving.value = false;
}

onMounted(loadGroups);
</script>

