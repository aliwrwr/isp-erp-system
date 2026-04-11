<template>
  <transition name="modal-fade">
    <div
      v-if="show && subscriber"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">

        <!-- ===== Header ===== -->
        <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold text-white shadow-inner flex-shrink-0">
              {{ subscriber?.name ? subscriber.name.charAt(0) : '؟' }}
            </div>
            <div>
              <h3 class="text-xl font-bold text-white leading-tight">{{ subscriber?.name }}</h3>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <code class="inline-block px-2 py-0.5 bg-white/20 text-white/90 rounded-lg text-xs font-mono tracking-wide">
                  {{ subscriber?.username || '—' }}
                </code>
                <!-- Status Badge -->
                <span :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
                  subscriber?.status === 'active' ? 'bg-emerald-400/30 text-emerald-100' : 'bg-red-400/30 text-red-100'
                ]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="subscriber?.status === 'active' ? 'bg-emerald-300' : 'bg-red-300'"></span>
                  {{ subscriber?.status === 'active' ? 'نشط' : 'غير نشط' }}
                </span>
              </div>
            </div>
          </div>
          <button @click="close" class="w-9 h-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <!-- ===== Body ===== -->
        <div class="overflow-y-auto flex-1">

          <!-- Quick Stats Row -->
          <div class="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100 border-b border-gray-100">
            <div class="px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-wallet text-emerald-500 text-sm"></i>
              </div>
              <div>
                <p class="text-[11px] text-gray-400">الرصيد</p>
                <p class="text-base font-bold text-emerald-600">{{ Number(subscriber?.balance || 0).toLocaleString('ar-IQ') }} <span class="text-xs font-normal text-gray-400">د.ع</span></p>
              </div>
            </div>
            <div class="px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-file-invoice-dollar text-red-400 text-sm"></i>
              </div>
              <div>
                <p class="text-[11px] text-gray-400">الديون</p>
                <p class="text-base font-bold text-red-500">{{ Number(subscriber?.debt || 0).toLocaleString('ar-IQ') }} <span class="text-xs font-normal text-gray-400">د.ع</span></p>
              </div>
            </div>
            <div class="px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-hourglass-half text-amber-500 text-sm"></i>
              </div>
              <div>
                <p class="text-[11px] text-gray-400">الأيام المتبقية</p>
                <p class="text-base font-bold" :class="remainingDays > 7 ? 'text-emerald-600' : remainingDays > 0 ? 'text-amber-600' : 'text-red-500'">
                  {{ remainingDays > 0 ? remainingDays + ' يوم' : 'منتهٍ' }}
                </p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">

            <!-- ===== Section: المعلومات الأساسية ===== -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fas fa-user text-gray-300 text-xs"></i>
                المعلومات الأساسية
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-user text-indigo-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">الاسم الكامل</p>
                    <p class="text-sm font-semibold text-gray-800 truncate">{{ subscriber?.name || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-phone text-blue-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">رقم الهاتف</p>
                    <p class="text-sm font-semibold text-gray-800 font-mono" dir="ltr">{{ subscriber?.phone || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 sm:col-span-2">
                  <i class="fas fa-map-marker-alt text-rose-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">العنوان</p>
                    <p class="text-sm font-semibold text-gray-800">{{ subscriber?.address || '—' }}</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- ===== Section: بيانات الاشتراك ===== -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fas fa-wifi text-gray-300 text-xs"></i>
                بيانات الاشتراك
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-user-circle text-violet-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">اسم المستخدم (PPPoE)</p>
                    <code class="text-sm font-bold text-violet-700 break-all">{{ subscriber?.username || '—' }}</code>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-key text-amber-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">كلمة المرور (PPPoE)</p>
                    <div class="flex items-center gap-2">
                      <code class="text-sm font-bold text-amber-700 break-all" :class="showPassword ? '' : 'blur-[3px] select-none'">
                        {{ subscriber?.password || '—' }}
                      </code>
                      <button v-if="subscriber?.password" @click="showPassword = !showPassword"
                        class="text-gray-400 hover:text-gray-600 transition flex-shrink-0">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-xs"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-network-wired text-teal-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">عنوان IP</p>
                    <code class="text-sm font-bold text-teal-700 break-all" dir="ltr">{{ subscriber?.ipAddress || '—' }}</code>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-wifi text-sky-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">الباقة</p>
                    <p class="text-sm font-bold text-sky-700">{{ subscriber?.package?.name || '—' }}</p>
                    <p v-if="subscriber?.package?.price" class="text-[11px] text-gray-400 mt-0.5">
                      {{ Number(subscriber.package.price).toLocaleString('ar-IQ') }} د.ع / {{ subscriber.package.durationDays || '—' }} يوم
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-user-shield text-purple-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">تابع إلى (المدير)</p>
                    <p class="text-sm font-semibold text-purple-700">{{ subscriber?.manager?.name || subscriber?.manager?.username || subscriber?.manager?.position || '—' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-server text-indigo-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">الراوتر (MikroTik)</p>
                    <p class="text-sm font-semibold text-indigo-700">{{ subscriber?.router?.name || '—' }}</p>
                    <p v-if="subscriber?.router?.ipAddress" class="text-[11px] text-gray-400 font-mono mt-0.5" dir="ltr">{{ subscriber.router.ipAddress }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 sm:col-span-2">
                  <i class="fas fa-box-open text-orange-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div class="min-w-0">
                    <p class="text-[10px] text-gray-400 mb-0.5">الكابينة / السكتر</p>
                    <p class="text-sm font-semibold text-gray-800">{{ subscriber?.cabinetSector || '—' }}</p>
                  </div>
                </div>

              </div>
            </div>

            <!-- ===== Section: تواريخ الاشتراك ===== -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fas fa-calendar text-gray-300 text-xs"></i>
                تواريخ الاشتراك
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-calendar-plus text-emerald-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div>
                    <p class="text-[10px] text-gray-400 mb-0.5">تاريخ الإضافة</p>
                    <p class="text-sm font-semibold text-gray-800">{{ subscriber?.createdAt ? fmtDate(subscriber.createdAt) : '—' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <i class="fas fa-calendar-check text-blue-400 text-xs mt-0.5 w-4 text-center flex-shrink-0"></i>
                  <div>
                    <p class="text-[10px] text-gray-400 mb-0.5">تاريخ بدء الاشتراك</p>
                    <p class="text-sm font-semibold text-gray-800">{{ latestSub?.startDate ? fmtDate(latestSub.startDate) : '—' }}</p>
                  </div>
                </div>

                <div class="flex items-start gap-3 rounded-xl px-4 py-3" :class="remainingDays <= 0 ? 'bg-red-50' : remainingDays <= 7 ? 'bg-amber-50' : 'bg-gray-50'">
                  <i class="fas fa-calendar-times text-xs mt-0.5 w-4 text-center flex-shrink-0" :class="remainingDays <= 0 ? 'text-red-400' : remainingDays <= 7 ? 'text-amber-400' : 'text-gray-400'"></i>
                  <div>
                    <p class="text-[10px] text-gray-400 mb-0.5">تاريخ الانتهاء</p>
                    <p class="text-sm font-semibold" :class="remainingDays <= 0 ? 'text-red-600' : remainingDays <= 7 ? 'text-amber-600' : 'text-gray-800'">
                      {{ latestSub?.endDate ? fmtDate(latestSub.endDate) : subscriber?.expirationDate ? fmtDate(subscriber.expirationDate) : '—' }}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <!-- ===== Section: ملاحظات ===== -->
            <div v-if="subscriber?.notes">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fas fa-sticky-note text-gray-300 text-xs"></i>
                ملاحظات
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <p class="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">{{ subscriber.notes }}</p>
              </div>
            </div>

            <!-- ===== Section: سجل الاشتراكات ===== -->
            <div>
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fas fa-history text-gray-300 text-xs"></i>
                سجل الاشتراكات
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
                <span v-if="subscriber?.subscriptions?.length" class="text-[10px] font-normal text-gray-300 normal-case">
                  {{ subscriber.subscriptions.length }} اشتراك
                </span>
              </p>
              <div class="rounded-xl border border-gray-100 overflow-hidden">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th class="px-4 py-3 text-right text-[11px] font-bold text-gray-400">#</th>
                      <th class="px-4 py-3 text-right text-[11px] font-bold text-gray-400">الباقة</th>
                      <th class="px-4 py-3 text-right text-[11px] font-bold text-gray-400">تاريخ البدء</th>
                      <th class="px-4 py-3 text-right text-[11px] font-bold text-gray-400">تاريخ الانتهاء</th>
                      <th class="px-4 py-3 text-right text-[11px] font-bold text-gray-400">المبلغ</th>
                      <th class="px-4 py-3 text-center text-[11px] font-bold text-gray-400">الحالة</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-if="!subscriber?.subscriptions || subscriber.subscriptions.length === 0">
                      <td colspan="6" class="px-6 py-10 text-center">
                        <div class="flex flex-col items-center gap-2">
                          <i class="fas fa-history text-2xl text-gray-200"></i>
                          <p class="text-xs text-gray-400">لا يوجد سجل اشتراكات</p>
                        </div>
                      </td>
                    </tr>
                    <tr v-for="(sub, i) in sortedSubscriptions" :key="sub.id"
                      class="hover:bg-gray-50/70 transition-colors"
                      :class="i === 0 ? 'bg-indigo-50/40' : ''">
                      <td class="px-4 py-3 text-xs text-gray-400">{{ i + 1 }}</td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-1.5">
                          <i class="fas fa-wifi text-sky-400 text-[10px]"></i>
                          <span class="text-xs font-semibold text-gray-700">{{ sub.package?.name || '—' }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-xs text-gray-500">{{ sub.startDate ? fmtDate(sub.startDate) : '—' }}</td>
                      <td class="px-4 py-3 text-xs text-gray-500">{{ sub.endDate ? fmtDate(sub.endDate) : '—' }}</td>
                      <td class="px-4 py-3 text-xs font-semibold text-emerald-700">{{ sub.price != null ? Number(sub.price).toLocaleString('ar-IQ') + ' د.ع' : '—' }}</td>
                      <td class="px-4 py-3 text-center">
                        <span v-if="i === 0" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold">
                          <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                          الأحدث
                        </span>
                        <span v-else class="text-[10px] text-gray-400">سابق</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

        <!-- ===== Footer ===== -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-shrink-0 rounded-b-2xl">
          <p class="text-[11px] text-gray-400">
            آخر تحديث: {{ subscriber?.updatedAt ? fmtDate(subscriber.updatedAt) : '—' }}
          </p>
          <button
            @click="close"
            class="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition shadow-sm"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  subscriber: {
    type: Object,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['close'])
const close = () => emit('close')

const showPassword = ref(false)

function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

const sortedSubscriptions = computed(() => {
  const subs = props.subscriber?.subscriptions
  if (!subs?.length) return []
  return [...subs].sort((a, b) => new Date(b.startDate ?? 0).getTime() - new Date(a.startDate ?? 0).getTime())
})

const latestSub = computed(() => sortedSubscriptions.value[0] ?? null)

const remainingDays = computed(() => {
  const endDate = latestSub.value?.endDate ?? props.subscriber?.expirationDate
  if (!endDate) return 0
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / 86400000)
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
