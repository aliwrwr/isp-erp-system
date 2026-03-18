<template>
  <div class="p-6 space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">الصندوق</h1>
        <p class="text-sm text-gray-500 mt-1">دفتر اليومية — جميع الحركات المالية</p>
      </div>
      <button
        @click="openAddManual"
        class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
      >
        <span>+</span> إضافة حركة يدوية
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in statsCards" :key="card.label"
        class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
        <div :class="`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${card.bg}`">
          {{ card.icon }}
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ card.label }}</p>
          <p class="text-xl font-bold" :class="card.color">{{ card.value }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div class="flex flex-wrap gap-3">
        <input
          v-model="search"
          @input="debouncedSearch"
          type="text"
          placeholder="بحث في الوصف..."
          class="flex-1 min-w-[200px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
        />
        <select v-model="filterType" @change="onFilterChange"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">كل الأنواع</option>
          <option value="in">وارد (داخل)</option>
          <option value="out">صادر (خارج)</option>
        </select>
        <select v-model="filterSource" @change="onFilterChange"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300">
          <option value="">كل المصادر</option>
          <option value="invoice">فواتير</option>
          <option value="expense">مصروفات</option>
          <option value="manual">يدوي</option>
        </select>
        <input v-model="dateFrom" @change="onFilterChange" type="date"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          title="من تاريخ" />
        <input v-model="dateTo" @change="onFilterChange" type="date"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
          title="إلى تاريخ" />
        <button v-if="search || filterType || filterSource || dateFrom || dateTo"
          @click="clearFilters"
          class="border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm transition">
          ✕ مسح
        </button>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-100">
            <tr>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">#</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">التاريخ</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">النوع</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">الوصف</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">المصدر</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">المرجع</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600">المبلغ</th>
              <th class="text-right px-4 py-3 font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" class="text-center">
              <td colspan="8" class="py-12 text-gray-400">
                <div class="flex flex-col items-center gap-2">
                  <div class="w-8 h-8 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin"></div>
                  <span>جاري التحميل...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="items.length === 0">
              <td colspan="8" class="py-12 text-center text-gray-400">لا توجد حركات</td>
            </tr>
            <tr v-for="(item, index) in items" :key="`${item.source}-${item.sourceId}`"
              class="border-b border-gray-50 hover:bg-gray-50 transition">
              <td class="px-4 py-3 text-gray-400 text-xs">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td class="px-4 py-3 text-gray-600 text-xs">{{ item.date }}</td>
              <td class="px-4 py-3">
                <span :class="`px-2 py-0.5 rounded-full text-xs font-semibold ${item.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`">
                  {{ item.type === 'in' ? '▲ وارد' : '▼ صادر' }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-700 max-w-[220px] truncate" :title="item.description">{{ item.description }}</td>
              <td class="px-4 py-3">
                <span :class="`px-2 py-0.5 rounded-full text-xs font-medium ${sourceClass(item.source)}`">
                  {{ sourceLabel(item.source) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-400 text-xs font-mono">{{ item.reference || '—' }}</td>
              <td class="px-4 py-3 font-bold text-base" :class="item.type === 'in' ? 'text-green-600' : 'text-red-500'">
                {{ item.type === 'in' ? '+' : '-' }}{{ Number(item.amount).toLocaleString() }} <span class="text-xs font-normal text-gray-400">د.ع</span>
              </td>
              <td class="px-4 py-3">
                <button v-if="Number(item.deletable) === 1"
                  @click="confirmDelete(item)"
                  class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition" title="حذف">
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <span class="text-sm text-gray-500">
          إجمالي {{ totalItems }} حركة | صفحة {{ currentPage }} من {{ totalPages }}
        </span>
        <div class="flex items-center gap-2">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1"
            class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            السابق
          </button>
          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
            التالي
          </button>
        </div>
      </div>
    </div>

    <!-- Add Manual Modal -->
    <div v-if="showModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-800">إضافة حركة يدوية</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div class="p-5 space-y-4">
          <!-- Type Toggle -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">نوع الحركة *</label>
            <div class="flex rounded-lg overflow-hidden border border-gray-200">
              <button @click="form.type = 'in'"
                :class="`flex-1 py-2 text-sm font-medium transition ${form.type === 'in' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`">
                ▲ وارد (إيداع)
              </button>
              <button @click="form.type = 'out'"
                :class="`flex-1 py-2 text-sm font-medium transition ${form.type === 'out' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`">
                ▼ صادر (سحب)
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">الوصف *</label>
            <input v-model="form.description" type="text" placeholder="وصف الحركة"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">المبلغ (د.ع) *</label>
              <input v-model.number="form.amount" type="number" min="0" placeholder="0"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">التاريخ *</label>
              <input v-model="form.date" type="date"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">المرجع (اختياري)</label>
              <input v-model="form.reference" type="text" placeholder="رقم المرجع"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الوقت</label>
              <input v-model="form.time" type="time"
                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
            </div>
          </div>
          <div v-if="formError" class="text-red-500 text-sm bg-red-50 rounded-lg p-2">{{ formError }}</div>
        </div>
        <div class="flex gap-3 p-5 border-t border-gray-100">
          <button @click="saveManual" :disabled="saving"
            :class="`flex-1 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition ${form.type === 'in' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`">
            {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
          </button>
          <button @click="showModal = false"
            class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition">
            إلغاء
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirm -->
    <div v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div class="text-4xl mb-3">🗑️</div>
        <h3 class="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
        <p class="text-gray-500 text-sm mb-5">هل تريد حذف الحركة <span class="font-semibold text-gray-700">{{ deletingItem?.description }}</span>؟</p>
        <div class="flex gap-3">
          <button @click="deleteManual" :disabled="saving"
            class="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition">
            {{ saving ? 'جاري الحذف...' : 'حذف' }}
          </button>
          <button @click="showDeleteConfirm = false"
            class="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-medium transition">
            إلغاء
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../api'

interface LedgerItem {
  source: string
  sourceId: string
  type: string
  amount: number
  description: string
  date: string
  reference: string
  deletable: number
}

// State
const items       = ref<LedgerItem[]>([])
const loading     = ref(false)
const search      = ref('')
const filterType   = ref('')
const filterSource = ref('')
const dateFrom    = ref('')
const dateTo      = ref('')
const currentPage = ref(1)
const totalItems  = ref(0)
const totalPages  = ref(1)
const pageSize    = 20

const showModal   = ref(false)
const saving      = ref(false)
const formError   = ref('')
const form        = ref({ type: 'in', description: '', amount: 0, date: '', reference: '', time: '' })

const showDeleteConfirm = ref(false)
const deletingItem      = ref<LedgerItem | null>(null)

const statsCards = ref([
  { label: 'رصيد الصندوق',      value: '0 د.ع', icon: '🏦', bg: 'bg-emerald-50', color: 'text-emerald-700' },
  { label: 'وارد هذا الشهر',    value: '0 د.ع', icon: '📥', bg: 'bg-green-50',   color: 'text-green-700' },
  { label: 'صادر هذا الشهر',    value: '0 د.ع', icon: '📤', bg: 'bg-red-50',     color: 'text-red-600' },
  { label: 'حركات هذا الشهر',   value: '0',      icon: '🔄', bg: 'bg-blue-50',   color: 'text-blue-700' },
])

let searchTimer: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { currentPage.value = 1; loadLedger() }, 400)
}
function onFilterChange() { currentPage.value = 1; loadLedger() }
function clearFilters() {
  search.value = ''; filterType.value = ''; filterSource.value = ''
  dateFrom.value = ''; dateTo.value = ''
  currentPage.value = 1; loadLedger()
}

async function loadLedger() {
  loading.value = true
  try {
    const res = await api.get('/cashbox/ledger', {
      params: {
        search: search.value,
        type: filterType.value,
        source: filterSource.value,
        dateFrom: dateFrom.value,
        dateTo: dateTo.value,
        page: currentPage.value,
        limit: pageSize,
      }
    })
    items.value      = res.data.data
    totalItems.value = res.data.total
    totalPages.value = res.data.pages
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

async function loadSummary() {
  try {
    const res = await api.get('/cashbox/summary')
    const s = res.data
    statsCards.value[0].value = Number(s.balance).toLocaleString() + ' د.ع'
    statsCards.value[1].value = Number(s.monthIn).toLocaleString() + ' د.ع'
    statsCards.value[2].value = Number(s.monthOut).toLocaleString() + ' د.ع'
    statsCards.value[3].value = Number(s.monthCount).toLocaleString()
  } catch (e) { console.error(e) }
}

function changePage(p: number) {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
  loadLedger()
}

function todayDate() { return new Date().toISOString().split('T')[0] }

function openAddManual() {
  form.value = { type: 'in', description: '', amount: 0, date: todayDate(), reference: '', time: '' }
  formError.value = ''
  showModal.value = true
}

async function saveManual() {
  if (!form.value.description.trim()) { formError.value = 'الوصف مطلوب'; return }
  if (!form.value.amount || form.value.amount <= 0) { formError.value = 'المبلغ يجب أن يكون أكبر من صفر'; return }
  if (!form.value.date) { formError.value = 'التاريخ مطلوب'; return }
  saving.value = true; formError.value = ''
  try {
    await api.post('/cashbox/manual', form.value)
    showModal.value = false
    loadLedger(); loadSummary()
  } catch (e: any) {
    formError.value = e?.response?.data?.message || 'حدث خطأ'
  } finally { saving.value = false }
}

function confirmDelete(item: LedgerItem) {
  deletingItem.value = item
  showDeleteConfirm.value = true
}

async function deleteManual() {
  if (!deletingItem.value) return
  saving.value = true
  try {
    await api.delete(`/cashbox/manual/${deletingItem.value.sourceId}`)
    showDeleteConfirm.value = false
    loadLedger(); loadSummary()
  } catch (e) { console.error(e) }
  finally { saving.value = false }
}

function sourceLabel(s: string) {
  const map: Record<string, string> = { invoice: 'فاتورة', expense: 'مصروف', manual: 'يدوي' }
  return map[s] || s
}
function sourceClass(s: string) {
  const map: Record<string, string> = {
    invoice: 'bg-blue-100 text-blue-700',
    expense: 'bg-orange-100 text-orange-700',
    manual:  'bg-purple-100 text-purple-700',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

onMounted(() => { loadLedger(); loadSummary() })
</script>
