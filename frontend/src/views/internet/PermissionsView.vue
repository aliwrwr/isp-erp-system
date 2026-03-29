<template>
  <div class="-m-4 lg:-m-6 flex flex-col bg-gray-50 overflow-hidden" style="height:calc(100vh - 56px)" dir="rtl">

    <!-- â•گâ•گ Top Bar â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ -->
    <div class="bg-[#1e293b] text-white px-4 py-2 flex items-center justify-between flex-shrink-0 select-none">
      <div class="flex items-center gap-3 text-sm">
        <i class="fas fa-shield-alt text-blue-400"></i>
        <span class="font-semibold tracking-wide">Security Groups</span>
        <span class="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">{{ securityGroups.length }} ظ…ط¬ظ…ظˆط¹ط©</span>
      </div>
      <button @click="loadGroups" class="text-gray-400 hover:text-white transition text-sm" title="طھط­ط¯ظٹط«">
        <i class="fas fa-sync" :class="loading ? 'fa-spin' : ''"></i>
      </button>
    </div>

    <!-- â•گâ•گ Body â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ -->
    <div class="flex flex-1 overflow-hidden">

      <!-- â”€â”€ Left Panel: Groups List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <div class="w-64 flex flex-col bg-white border-l border-gray-200 flex-shrink-0 overflow-hidden">
        <!-- Search + Add -->
        <div class="p-3 border-b border-gray-100 flex gap-2">
          <div class="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5">
            <i class="fas fa-search text-gray-400 text-xs"></i>
            <input v-model="search" class="bg-transparent outline-none text-sm flex-1 min-w-0" placeholder="ط¨ط­ط«..." />
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
            ظ„ط§ طھظˆط¬ط¯ ظ…ط¬ظ…ظˆط¹ط§طھ
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
                  <span class="text-gray-400">{{ permCount(g) }} طµظ„ط§ط­ظٹط©</span>
                  <template v-if="g.dashboardId && dashboardGroups.find(d => d.id === g.dashboardId)">
                    <span class="text-gray-300">آ·</span>
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

      <!-- â”€â”€ Right Panel: Permission Matrix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ -->
      <div class="flex-1 flex flex-col overflow-hidden">

        <!-- Empty state -->
        <div v-if="!selectedGroup" class="flex-1 flex items-center justify-center">
          <div class="text-center text-gray-300">
            <i class="fas fa-hand-pointer text-5xl mb-3 block"></i>
            <p class="text-sm">ط§ط®طھط± ظ…ط¬ظ…ظˆط¹ط© ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ظ„طھط¹ط¯ظٹظ„ طµظ„ط§ط­ظٹط§طھظ‡ط§</p>
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
                  <p class="text-[11px] text-gray-400">{{ givenPerms.length }} طµظ„ط§ط­ظٹط© ظ…ط­ط¯ط¯ط©</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click="givenPerms = []"
                  class="text-xs text-red-500 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                  <i class="fas fa-times text-[10px]"></i>ظ…ط³ط­ ط§ظ„ظƒظ„
                </button>
                <button @click="selectAll"
                  class="text-xs text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5">
                  <i class="fas fa-check-double text-[10px]"></i>طھط­ط¯ظٹط¯ ط§ظ„ظƒظ„
                </button>
                <button @click="savePermissions" :disabled="saving"
                  class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 disabled:opacity-60 transition">
                  <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-save"></i>
                  ط­ظپط¸
                </button>
              </div>
            </div>
            <!-- Dashboard Selector Row -->
            <div class="mt-2.5 flex items-center gap-2.5 pt-2.5 border-t border-gray-100">
              <i class="fas fa-columns text-indigo-400 text-sm flex-shrink-0"></i>
              <span class="text-xs font-semibold text-gray-500 whitespace-nowrap">ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…:</span>
              <select v-model="selectedDashId"
                class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 max-w-xs">
                <option :value="null">&mdash; ط¨ط¯ظˆظ† ظ„ظˆط­ط© &mdash;</option>
                <option v-for="d in dashboardGroups" :key="d.id" :value="d.id">{{ d.name }}</option>
              </select>
              <span v-if="selectedDashId && dashboardGroups.find(d => d.id === selectedDashId)"
                class="text-[11px] text-indigo-600 flex items-center gap-1 whitespace-nowrap">
                <i class="fas fa-link text-[10px]"></i>
                {{ dashboardGroups.find(d => d.id === selectedDashId)?.name }}
              </span>
              <span v-else-if="!dashboardGroups.length" class="text-[10px] text-amber-500">
                ظ„ط§ طھظˆط¬ط¯ ظ„ظˆط­ط§طھ
              </span>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button @click="selectedSection = 'all'"
                :class="selectedSection === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                ط§ظ„ظƒظ„
              </button>
              <button v-for="page in internetPages" :key="page.key" @click="selectedSection = page.key"
                :class="selectedSection === page.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold transition">
                {{ page.label }}
              </button>
            </div>
          </div>

          <!-- Matrix Body -->
          <div class="flex-1 overflow-y-auto p-4">
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">

              <!-- Column Headers -->
              <div class="grid bg-gray-50 border-b border-gray-200 px-4 py-2"
                style="grid-template-columns: 1fr repeat(4, 76px)">
                <div class="text-xs font-bold text-gray-500 text-right">ط§ظ„طµظپط­ط© / ط§ظ„ظˆط­ط¯ط©</div>
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
              <div v-for="(item, idx) in displayedPages" :key="item.key"
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
                  ط§ط¶ط؛ط· ط§ط³ظ… ط§ظ„طµظپط­ط© ظ„طھط­ط¯ظٹط¯ ظƒظ„ طµظ„ط§ط­ظٹط§طھظ‡ط§ آ· ط§ط¶ط؛ط· ط§ظ„ط¹ظ…ظˆط¯ ظ„طھط­ط¯ظٹط¯ ط¬ظ…ظٹط¹ ط§ظ„طµظپط­ط§طھ
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

    <!-- â•گâ•گ New Group Modal â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="showAddModal = false">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-96" dir="rtl">
        <h3 class="font-bold text-base text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-folder-plus text-blue-500 text-sm"></i>
          ظ…ط¬ظ…ظˆط¹ط© ط£ظ…ط§ظ† ط¬ط¯ظٹط¯ط©
        </h3>
        <label class="block text-xs font-semibold text-gray-500 mb-1.5">ط§ط³ظ… ط§ظ„ظ…ط¬ظ…ظˆط¹ط© <span class="text-red-400">*</span></label>
        <input v-model="newName" @keyup.enter="createGroup" ref="newNameRef"
          class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          placeholder="ظ…ط«ط§ظ„: ظ…ط¯ظٹط± ط§ظ„ظ†ط¸ط§ظ…" />

        <!-- Dashboard Group Selector -->
        <div class="mt-3">
          <label class="block text-xs font-semibold text-gray-500 mb-1.5 flex items-center gap-1.5">
            <i class="fas fa-columns text-indigo-400 text-[11px]"></i>
            ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… (ط§ط®طھظٹط§ط±ظٹط©)
          </label>
          <select v-model="newDashboardId"
            class="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400">
            <option :value="null">&mdash; ط¨ط¯ظˆظ† ظ„ظˆط­ط© &mdash;</option>
            <option v-for="d in dashboardGroups" :key="d.id" :value="d.id">
              {{ d.name }}
            </option>
          </select>
          <p v-if="!dashboardGroups.length" class="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
            <i class="fas fa-info-circle"></i>
            ظ„ط§ طھظˆط¬ط¯ ظ„ظˆط­ط§طھ ظ…ط­ظپظˆط¸ط©. ط§ظ†ط´ط¦ ظ„ظˆط­ط© ط£ظˆظ„ط§ظ‹ ظ…ظ† طµظپط­ط© ط§ظ„ظ…ط¬ظ…ظˆط¹ط§طھ.
          </p>
        </div>
        <div class="flex gap-2 mt-5">
          <button @click="createGroup" :disabled="!newName.trim() || saving"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-1.5 transition">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-check"></i>
            ط¥ظ†ط´ط§ط،
          </button>
          <button @click="showAddModal = false"
            class="flex-1 border border-gray-200 text-gray-500 hover:bg-gray-50 py-2.5 rounded-xl text-sm transition">
            ط¥ظ„ط؛ط§ط،
          </button>
        </div>
      </div>
    </div>

    <!-- â•گâ•گ Delete Confirmation â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ -->
    <div v-if="deleteTarget" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      @click.self="deleteTarget = null">
      <div class="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center" dir="rtl">
        <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-exclamation-triangle text-red-500 text-xl"></i>
        </div>
        <h3 class="font-bold text-gray-800 mb-1">طھط£ظƒظٹط¯ ط§ظ„ط­ط°ظپ</h3>
        <p class="text-sm text-gray-400 mb-4">ظ‡ظ„ طھط±ظٹط¯ ط­ط°ظپ ظ…ط¬ظ…ظˆط¹ط© <strong class="text-gray-700">{{ deleteTarget.name }}</strong>طں</p>
        <div class="flex gap-3">
          <button @click="deleteGroup" :disabled="saving"
            class="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 transition">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-trash-alt"></i> ط­ط°ظپ
          </button>
          <button @click="deleteTarget = null"
            class="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition">ط¥ظ„ط؛ط§ط،</button>
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

// â”€â”€ Internet System Pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const internetPages = [
    { key: 'management_reports', label: 'التقارير الشاملة (للإدارة)' },
  { key: 'subscribers',   label: 'ط§ظ„ظ…ط´طھط±ظƒظٹظ†'       },
  { key: 'connected',     label: 'ط§ظ„ظ…طھطµظ„ظٹظ†'        },
  { key: 'packages',      label: 'ط§ظ„ط¨ط§ظ‚ط§طھ'         },
  { key: 'subscriptions', label: 'ط§ظ„ط§ط´طھط±ط§ظƒط§طھ'      },
  { key: 'routers',       label: 'ط§ظ„ط±ط§ظˆطھط±ط§طھ'       },
  { key: 'payments',      label: 'ط§ظ„ظ…ط¯ظپظˆط¹ط§طھ'       },
  { key: 'reports',       label: 'ط§ظ„طھظ‚ط§ط±ظٹط±'        },
  { key: 'managers',      label: 'ط§ظ„ظ…ط¯ط±ط§ط،'         },
  { key: 'log',           label: 'ط³ط¬ظ„ ط§ظ„ط¹ظ…ظ„ظٹط§طھ'    },
  { key: 'whatsapp',      label: 'ظˆط§طھط³ط§ط¨'          },
  { key: 'settings',      label: 'ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ'       },
  { key: 'dashboard',     label: 'ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ…'     },
  { key: 'permissions',   label: 'ظ…ط¬ظ…ظˆط¹ط§طھ ط§ظ„ط£ظ…ط§ظ†'  },
  { key: 'kassier',       label: 'ط§ظ„ظƒط§ط´ظٹط±'         },
];

// â”€â”€ Management System Pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const managementPages = [
  { key: 'reports', label: 'ط§ظ„طھظ‚ط§ط±ظٹط± ط§ظ„ط´ط§ظ…ظ„ط©' }
];

// â”€â”€ Action Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const actions = [
  { key: 'view',            label: 'ط§ط·ظ„ط§ط¹', icon: 'fas fa-eye',           color: 'text-blue-500'  },
  { key: 'add',             label: 'ط¥ط¶ط§ظپط©', icon: 'fas fa-plus',          color: 'text-green-500' },
  { key: 'edit',            label: 'طھط¹ط¯ظٹظ„', icon: 'fas fa-pen',           color: 'text-amber-500' },
  { key: 'delete',          label: 'ط­ط°ظپ',   icon: 'fas fa-trash',         color: 'text-red-500'   },
  { key: 'sync',            label: 'ظ…ط²ط§ظ…ظ†ط©', icon: 'fas fa-sync-alt',      color: 'text-indigo-500' },
  { key: 'add_debt',        label: 'ط¥ط¶ط§ظپط© ط¯ظٹظˆظ†', icon: 'fas fa-file-invoice-dollar', color: 'text-rose-500' },
  { key: 'pay_debt',        label: 'طھط³ط¯ظٹط¯ ط¯ظٹظˆظ†', icon: 'fas fa-money-bill-wave',    color: 'text-green-500' },
  { key: 'print_invoice',   label: 'ط·ط¨ط§ط¹ط© ظپط§طھظˆط±ط©', icon: 'fas fa-print',      color: 'text-gray-500'  },
  { key: 'send_message',    label: 'ط¥ط±ط³ط§ظ„ ط±ط³ط§ظ„ط©', icon: 'fas fa-envelope',       color: 'text-teal-500'  },
];

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface Group { id: number; name: string; permissions?: string; dashboardId?: number | null; layout?: string | null; }

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Security groups only (no layout) â€” these are the ones that can be assigned to managers
const securityGroups = computed(() => groups.value.filter(g => !g.layout || g.layout === '[]' || g.layout === 'null'));

const sortedGroups = computed(() => {
  const q = search.value.trim().toLowerCase();
  return securityGroups.value
    .filter(g => !q || g.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const selectedSection = ref('all');
const displayedPages = computed(() => {
  return selectedSection.value === 'all'
    ? internetPages
    : internetPages.filter((p) => p.key === selectedSection.value);
});

// â”€â”€ Permission Key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function permKey(page: string, action: string) {
  return `internet.${page}.${action}`;
}

// â”€â”€ Permission Count on Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function permCount(g: Group): number {
  try {
    const arr = JSON.parse(g.permissions || '[]');
    return Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string' && x.startsWith('internet.')).length : 0;
  } catch { return 0; }
}

// â”€â”€ Row Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Column Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€ Global â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function selectAll() {
  givenPerms.value = [...new Set(internetPages.flatMap(p => actions.map(a => permKey(p.key, a.key))))];
}

// â”€â”€ Select Group â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function selectGroup(g: Group) {
  selectedGroup.value = g;
  selectedDashId.value = g.dashboardId ?? null;
  try {
    const arr = JSON.parse(g.permissions || '[]');
    givenPerms.value = Array.isArray(arr) ? arr.filter((x: any) => typeof x === 'string') : [];
  } catch { givenPerms.value = []; }
}

// â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function showToast(msg: string, ok = true) {
  toast.value = { show: true, msg, ok };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

// â”€â”€ API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    showToast('طھظ… ط¥ظ†ط´ط§ط، ط§ظ„ظ…ط¬ظ…ظˆط¹ط© ط¨ظ†ط¬ط§ط­');
  } catch (e: any) {
    showToast(e?.response?.data?.message || 'ط­ط¯ط« ط®ط·ط£', false);
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
    showToast('طھظ… ط­ط°ظپ ط§ظ„ظ…ط¬ظ…ظˆط¹ط©');
    deleteTarget.value = null;
  } catch {
    showToast('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط­ط°ظپ', false);
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
    showToast(`طھظ… ط­ظپط¸ ${givenPerms.value.length} طµظ„ط§ط­ظٹط© ط¨ظ†ط¬ط§ط­`);
  } catch {
    showToast('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط­ظپط¸', false);
  } finally { saving.value = false; }
}

loadGroups();
</script>

