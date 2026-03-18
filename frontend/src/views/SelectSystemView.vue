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
          <!-- Update button -->
          <button @click="showUpdateModal = true"
            class="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition border border-indigo-100">
            <i class="fas fa-sync-alt" :class="updateRunning ? 'fa-spin' : ''"></i>
            تحديث النظام
          </button>
          <button @click="handleLogout" class="text-danger hover:text-danger-dark transition text-sm">
            <i class="fas fa-sign-out-alt ml-1"></i> خروج
          </button>
        </div>
      </div>
    </header>

    <!-- Update Modal -->
    <transition name="modal">
      <div v-if="showUpdateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="showUpdateModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl" dir="rtl">

          <!-- Modal header -->
          <div class="bg-gradient-to-l from-indigo-600 to-violet-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <h3 class="font-bold text-white flex items-center gap-2">
              <i class="fas fa-sync-alt" :class="updateRunning ? 'fa-spin' : ''"></i>
              تحديث النظام
            </h3>
            <button @click="showUpdateModal = false" class="text-white/70 hover:text-white transition">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">

            <!-- Status row -->
            <div class="flex items-center justify-between rounded-xl px-4 py-3 text-sm transition"
              :class="updateRunning ? 'bg-amber-50' : updateDone === 'success' ? 'bg-emerald-50' : updateDone === 'error' ? 'bg-red-50' : 'bg-gray-50'">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full"
                  :class="updateRunning ? 'bg-amber-400 animate-pulse' : updateDone === 'success' ? 'bg-emerald-500' : updateDone === 'error' ? 'bg-red-500' : 'bg-gray-300'">
                </span>
                <span class="font-bold text-sm"
                  :class="updateRunning ? 'text-amber-700' : updateDone === 'success' ? 'text-emerald-700' : updateDone === 'error' ? 'text-red-600' : 'text-gray-500'">
                  {{ updateRunning ? 'جار التحديث...' : updateDone === 'success' ? '✓ اكتمل التحديث بنجاح!' : updateDone === 'error' ? '✗ فشل التحديث' : 'جاهز للتحديث' }}
                </span>
              </div>
              <span v-if="updateStartedAt" class="text-xs text-gray-400">بدأ في: {{ updateStartedAt }}</span>
            </div>

            <!-- Final result banner -->
            <transition name="modal">
              <div v-if="updateDone" class="rounded-xl px-5 py-4 flex items-start gap-3 text-sm font-semibold"
                :class="updateDone === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'">
                <i class="fas mt-0.5 text-base" :class="updateDone === 'success' ? 'fa-check-circle' : 'fa-times-circle'"></i>
                <div>
                  <p class="font-bold text-base">{{ updateDone === 'success' ? 'تم التحديث بنجاح ✓' : 'فشل التحديث ✗' }}</p>
                  <p class="opacity-90 text-xs mt-0.5 font-normal">
                    {{ updateDone === 'success'
                      ? `النظام يعمل الآن بأحدث إصدار. سيتم تحديث الصفحة خلال ${reloadCountdown} ثانية...`
                      : 'حدث خطأ أثناء التحديث — راجع السجل أدناه لمعرفة التفاصيل.' }}
                  </p>
                </div>
              </div>
            </transition>

            <!-- Info box -->
            <div class="bg-indigo-50 rounded-xl px-4 py-3 text-xs text-indigo-700 space-y-1">
              <p class="font-bold mb-1">ماذا يفعل هذا الزر؟</p>
              <p><i class="fas fa-check-circle ml-1 text-indigo-400"></i>يجلب آخر التحديثات من GitHub</p>
              <p><i class="fas fa-check-circle ml-1 text-indigo-400"></i>يبني الـ Backend والـ Frontend</p>
              <p><i class="fas fa-check-circle ml-1 text-indigo-400"></i>يعيد تشغيل جميع الخدمات تلقائياً</p>
              <p><i class="fas fa-exclamation-circle ml-1 text-amber-500"></i>سيتوقف النظام لثوانٍ أثناء إعادة التشغيل</p>
            </div>

            <!-- Trigger button -->
            <button @click="triggerUpdate" :disabled="updateRunning"
              class="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
              :class="updateRunning
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'">
              <i class="fas" :class="updateRunning ? 'fa-spinner fa-spin' : 'fa-rocket'"></i>
              {{ updateRunning ? 'جار التحديث...' : 'تحديث الآن' }}
            </button>



            <!-- Log terminal -->
            <div class="bg-gray-900 rounded-xl p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <i class="fas fa-terminal text-green-400"></i> سجل التحديث
                </span>
                <div class="flex items-center gap-2">
                  <button @click="fetchUpdateLog"
                    class="text-[11px] text-gray-400 hover:text-gray-200 px-2 py-0.5 border border-gray-700 rounded-lg transition">
                    <i class="fas fa-refresh ml-1"></i>تحديث السجل
                  </button>
                  <button @click="updateLog = ''" class="text-[11px] text-gray-500 hover:text-gray-300 transition">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div ref="logBox"
                class="text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed overflow-y-auto min-h-[140px] max-h-[300px]">
                <span v-if="!updateLog" class="text-gray-600">لا يوجد سجل بعد — اضغط "تحديث الآن" للبدء</span>
                <span v-else>{{ updateLog }}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </transition>

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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import api from '../api';

const router = useRouter();
const auth = useAuthStore();

// ── System update ─────────────────────────────────────────────────────
const showUpdateModal  = ref(false);
const updateRunning    = ref(false);
const updateMsg        = ref('');
const updateError      = ref(false);
const updateDone       = ref<null | 'success' | 'error'>(null);
const updateLog        = ref('');
const updateStartedAt  = ref('');
const logBox           = ref<HTMLElement | null>(null);
let   pollInterval: ReturnType<typeof setInterval> | null = null;
const reloadCountdown  = ref(0);
let   reloadTimer: ReturnType<typeof setInterval> | null = null;

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

async function fetchUpdateLog() {
  try {
    const res = await api.get('/deploy/admin/logs');
    updateLog.value = res.data.log || '';
    await new Promise(r => setTimeout(r, 50));
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
    const log = updateLog.value;
    if (/Update completed successfully/i.test(log)) {
      updateRunning.value = false;
      updateDone.value = 'success';
      stopPolling();
      // Auto-reload the page after 5 seconds so new JS/CSS is fetched
      reloadCountdown.value = 5;
      reloadTimer = setInterval(() => {
        reloadCountdown.value--;
        if (reloadCountdown.value <= 0) {
          clearInterval(reloadTimer!);
          window.location.reload();
        }
      }, 1000);
    } else if (/^ERROR:/m.test(log) || /Backend build failed|Frontend build failed|git pull failed/i.test(log)) {
      updateRunning.value = false;
      updateDone.value = 'error';
      stopPolling();
    }
  } catch {}
}

async function triggerUpdate() {
  if (updateRunning.value) return;
  updateRunning.value   = true;
  updateMsg.value       = '';
  updateError.value     = false;
  updateDone.value      = null;
  updateLog.value       = '';
  updateStartedAt.value = new Date().toLocaleTimeString('ar-IQ');
  try {
    const res = await api.post('/deploy/admin');
    updateMsg.value = res.data.message || 'بدأ التحديث';
    pollInterval = setInterval(fetchUpdateLog, 3000);
    setTimeout(() => { updateRunning.value = false; stopPolling(); }, 300_000);
  } catch (e: any) {
    updateRunning.value = false;
    updateMsg.value = e?.response?.data?.message || 'فشل الاتصال بالخادم';
    updateError.value = true;
  }
}

// ── Systems ───────────────────────────────────────────────────────────

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

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.97); }
</style>
