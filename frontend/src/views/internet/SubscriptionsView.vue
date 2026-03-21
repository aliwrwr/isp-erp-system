<template>
  <div class="flex flex-col gap-4">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-secondary">الاشتراكات</h2>
        <p class="text-sm text-gray-400 mt-0.5">إجمالي {{ totalItems }} اشتراك</p>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      <!-- Top Toolbar -->
      <div class="px-5 py-4 border-b border-indigo-300 bg-gradient-to-l from-indigo-600 to-blue-500">
        <div class="flex flex-wrap items-center gap-2.5">

          <!-- Search by name/phone -->
          <div class="relative flex-1 min-w-[160px] max-w-xs">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs"></i>
            <input
              v-model="search"
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
              class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition placeholder-white/60 text-white"
            />
          </div>

          <!-- Filter by package -->
          <div class="relative min-w-[150px]">
            <i class="fas fa-wifi absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
            <select v-model="filterPackage" class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white appearance-none">
              <option value="" class="text-gray-800">كل الباقات</option>
              <option v-for="pkg in uniquePackages" :key="pkg" :value="pkg" class="text-gray-800">{{ pkg }}</option>
            </select>
          </div>

          <!-- Filter by payment method -->
          <div class="relative min-w-[140px]">
            <i class="fas fa-money-bill-wave absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
            <select v-model="filterPayment" class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white appearance-none">
              <option value="" class="text-gray-800">كل طرق الدفع</option>
              <option value="cash" class="text-gray-800">نقداً</option>
              <option value="credit" class="text-gray-800">آجل</option>
              <option value="partial" class="text-gray-800">جزئي</option>
            </select>
          </div>

          <!-- Filter by start date -->
          <div class="relative min-w-[165px]">
            <i class="fas fa-calendar-alt absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
            <input
              v-model="filterDate"
              type="date"
              title="تصفية بتاريخ الاشتراك"
              class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white"
            />
          </div>

          <!-- Spacer -->
          <div class="flex-1"></div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <span v-if="selected.length > 0" class="text-xs text-white bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg font-medium">
              {{ selected.length }} محدد
            </span>
            <button v-if="selected.length > 0" class="text-sm text-white border border-white/30 hover:bg-white/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5">
              <i class="fas fa-trash text-xs"></i> حذف المحدد
            </button>
            <button @click="loadData" class="text-sm text-white border border-white/30 hover:bg-white/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5">
              <i class="fas fa-sync-alt text-xs" :class="{'animate-spin': loading}"></i> تحديث
            </button>
            <button class="text-sm text-white border border-white/30 hover:bg-white/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5">
              <i class="fas fa-file-export text-xs"></i> تصدير
            </button>
          </div>

        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-4 py-3 text-center w-10">
                <input type="checkbox" @change="toggleAll" :checked="allSelected" class="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer" />
              </th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">اسم المشترك</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الباقة</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">رقم الهاتف</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">طريقة الدفع</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">المبلغ</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">تاريخ الاشتراك</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">انتهاء الاشتراك</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">الملاحظات</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <!-- Loading -->
            <tr v-if="loading">
              <td colspan="11" class="px-4 py-12 text-center">
                <div class="flex flex-col items-center gap-2 text-gray-400">
                  <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
                  <span class="text-sm">جاري التحميل...</span>
                </div>
              </td>
            </tr>
            <!-- Rows -->
            <tr
              v-else
              v-for="(s, i) in paginatedRows"
              :key="s.id"
              class="hover:bg-blue-50/30 transition-colors duration-100 group select-none"
              :class="{ 'bg-blue-50/20': selected.includes(s.id) }"
              @contextmenu.prevent="openContextMenu($event, s)"
              @touchstart.passive="startLongPress($event, s)"
              @touchend="cancelLongPress"
              @touchmove="cancelLongPress"
            >
              <td class="px-4 py-3 text-center">
                <input type="checkbox" v-model="selected" :value="s.id" class="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer" />
              </td>
              <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ (currentPage - 1) * pageSize + i + 1 }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {{ s.subscriberName.charAt(0) }}
                  </div>
                  <span class="font-semibold text-gray-800">{{ s.subscriberName }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                  <i class="fas fa-box text-xs"></i>
                  {{ s.packageName }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ s.phone || '—' }}</td>
              <td class="px-4 py-3">
                <span class="text-xs font-medium"
                  :class="{
                    'text-green-700': s.paymentMethod === 'cash',
                    'text-orange-600': s.paymentMethod === 'credit',
                    'text-blue-600': s.paymentMethod === 'partial',
                    'text-gray-400': !s.paymentMethod,
                  }">
                  <i class="fas fa-circle text-[6px] mr-1"></i>
                  {{ { cash: 'نقداً', credit: 'آجل', partial: 'جزئي' }[s.paymentMethod] || '—' }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-col gap-0.5">
                  <template v-if="Number(s.debtAmount) > 0">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700">
                      <span class="font-mono">{{ Number(s.price).toLocaleString('ar-IQ') }}</span>
                      <span class="opacity-60">+</span>
                      <span class="font-mono">{{ Number(s.debtAmount).toLocaleString('ar-IQ') }}</span>
                      <span class="opacity-70">| إضافة دين</span>
                    </span>
                  </template>
                  <template v-else>
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold"
                      :class="getAmountInfo(s).colorClass">
                      <span v-if="getAmountInfo(s).amount !== null" class="font-mono">{{ Number(getAmountInfo(s).amount).toLocaleString('ar-IQ') }}</span>
                      {{ getAmountInfo(s).label }}
                    </span>
                  </template>
                </div>
              </td>
              <td class="px-4 py-3 text-gray-500 text-xs">{{ formatDate(s.startDate) }}</td>
              <td class="px-4 py-3">
                <span class="text-xs" :class="isExpiringSoon(s.endDate) ? 'text-red-600 font-semibold' : 'text-gray-500'">
                  {{ formatDate(s.endDate) }}
                  <span v-if="isExpiringSoon(s.endDate)" class="mr-1 text-red-500"><i class="fas fa-exclamation-circle"></i></span>
                </span>
              </td>
              <td class="px-4 py-3 max-w-[180px]">
                <span v-if="s.notes" class="text-xs text-gray-500 whitespace-pre-line line-clamp-3" :title="s.notes">{{ s.notes }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openView(s)" title="عرض التفاصيل" class="w-7 h-7 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition flex items-center justify-center">
                    <i class="fas fa-eye text-xs"></i>
                  </button>
                  <button @click="printSubscription(s)" title="طباعة" class="w-7 h-7 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 transition flex items-center justify-center">
                    <i class="fas fa-print text-xs"></i>
                  </button>
                  <button @click="confirmDelete(s)" title="حذف" class="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition flex items-center justify-center">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
            <!-- Empty -->
            <tr v-if="!loading && filteredRows.length === 0">
              <td colspan="11" class="px-4 py-16 text-center">
                <div class="flex flex-col items-center gap-2 text-gray-400">
                  <i class="fas fa-inbox text-4xl mb-2 opacity-30"></i>
                  <span class="text-sm font-medium">لا توجد اشتراكات</span>
                  <span class="text-xs">جرب تغيير فلتر البحث</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Bottom Pagination Bar -->
      <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
        <!-- Pagination Buttons -->
        <div class="flex items-center gap-1">
          <button @click="goToPage(1)" :disabled="currentPage === 1"
            class="w-8 h-8 rounded-lg text-xs border flex items-center justify-center transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-white hover:border-primary hover:text-primary'">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="w-8 h-8 rounded-lg text-xs border flex items-center justify-center transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-white hover:border-primary hover:text-primary'">
            <i class="fas fa-angle-right"></i>
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="goToPage(p)"
              class="w-8 h-8 rounded-lg text-xs border font-medium transition"
              :class="p === currentPage
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'border-gray-200 text-gray-600 hover:bg-white hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="w-8 h-8 rounded-lg text-xs border flex items-center justify-center transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-white hover:border-primary hover:text-primary'">
            <i class="fas fa-angle-left"></i>
          </button>
          <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
            class="w-8 h-8 rounded-lg text-xs border flex items-center justify-center transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-white hover:border-primary hover:text-primary'">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>

        <!-- Page Size Selector -->
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-gray-400">عرض:</span>
          <div class="flex items-center gap-1">
            <button
              v-for="size in [5, 10, 50, 100, 500]"
              :key="size"
              @click="setPageSize(size)"
              class="w-10 h-8 rounded-lg text-xs border font-medium transition"
              :class="pageSize === size
                ? 'bg-gray-200 text-gray-700 border-gray-300'
                : 'border-gray-200 text-gray-400 hover:bg-white hover:border-primary hover:text-primary'">
              {{ size }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Context Menu Backdrop -->
  <div v-if="showContextMenu" class="fixed inset-0 z-[299]" @click="closeContextMenu" @contextmenu.prevent="closeContextMenu"></div>

  <!-- Context Menu -->
  <transition name="ctx">
    <div v-if="showContextMenu"
      class="fixed z-[300] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-52"
      :style="{ top: contextMenuPos.y + 'px', left: contextMenuPos.x + 'px' }"
      @click.stop>
      <!-- Header -->
      <div class="bg-gradient-to-l from-indigo-700 to-blue-500 px-4 py-3">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ contextMenuSub?.subscriberName?.charAt(0) || '؟' }}
          </div>
          <div class="min-w-0">
            <p class="text-white font-semibold text-sm truncate">{{ contextMenuSub?.subscriberName }}</p>
            <p class="text-blue-200 text-xs truncate">{{ contextMenuSub?.packageName }}</p>
          </div>
        </div>
      </div>
      <!-- Actions -->
      <div class="py-1">
        <button @click="ctxViewDetails" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-right">
          <i class="fas fa-eye w-4 text-blue-500 text-center"></i>
          <span>عرض التفاصيل</span>
        </button>
        <div class="mx-3 border-t border-gray-100"></div>
        <button @click="ctxAddDebt" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition text-right">
          <i class="fas fa-plus-circle w-4 text-orange-500 text-center"></i>
          <span>اضافة دين</span>
        </button>
        <button @click="ctxPayDebt" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-right">
          <i class="fas fa-hand-holding-usd w-4 text-emerald-500 text-center"></i>
          <span>تسديد دين</span>
        </button>
        <div class="mx-3 border-t border-gray-100"></div>
        <button @click="ctxPrint" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition text-right">
          <i class="fas fa-print w-4 text-green-500 text-center"></i>
          <span>طباعة</span>
        </button>
        <div class="mx-3 border-t border-gray-100"></div>
        <button @click="ctxDelete" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition text-right">
          <i class="fas fa-trash w-4 text-red-500 text-center"></i>
          <span>حذف</span>
        </button>
      </div>
    </div>
  </transition>

  <!-- Toast -->
  <transition name="fade">
    <div v-if="toast.show"
      class="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium"
      :class="toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'">
      <i :class="toast.type === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
      {{ toast.message }}
    </div>
  </transition>

  <!-- View Modal -->
  <transition name="modal">
    <div v-if="showViewModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showViewModal = false">
      <div v-if="selectedSub" class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]" dir="rtl">

        <!-- ═══ HEADER ═══ -->
        <div class="relative bg-gradient-to-bl from-indigo-700 via-blue-600 to-cyan-500 px-6 pt-5 pb-6 overflow-hidden">
          <!-- decorative circles -->
          <div class="absolute -top-8 -left-8 w-40 h-40 bg-white/10 rounded-full"></div>
          <div class="absolute top-4 left-20 w-16 h-16 bg-white/5 rounded-full"></div>
          <div class="absolute -bottom-6 right-8 w-28 h-28 bg-white/10 rounded-full"></div>

          <button @click="showViewModal = false"
            class="absolute top-4 left-4 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition z-10">
            <i class="fas fa-times text-xs"></i>
          </button>

          <div class="relative z-10 flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-16 h-16 rounded-2xl bg-white/25 ring-4 ring-white/20 flex items-center justify-center text-white text-2xl font-bold shrink-0 shadow-lg">
              {{ selectedSub.subscriberName?.charAt(0) || '؟' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white/60 text-[11px] font-medium mb-0.5 tracking-wider uppercase">اشتراك إنترنت</p>
              <h3 class="text-white text-xl font-bold leading-tight truncate">{{ selectedSub.subscriberName }}</h3>
              <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                <!-- Status badge -->
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  :class="{
                    'bg-emerald-400/25 text-emerald-100 ring-1 ring-emerald-300/30': selectedSub.status === 'active',
                    'bg-red-400/25 text-red-100 ring-1 ring-red-300/30': selectedSub.status === 'expired',
                    'bg-amber-400/25 text-amber-100 ring-1 ring-amber-300/30': selectedSub.status === 'pending',
                  }">
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse"
                    :class="{
                      'bg-emerald-300': selectedSub.status === 'active',
                      'bg-red-300': selectedSub.status === 'expired',
                      'bg-amber-300': selectedSub.status === 'pending',
                    }"></span>
                  {{ { active: 'نشط', expired: 'منتهي', pending: 'معلق' }[selectedSub.status] || selectedSub.status }}
                </span>
                <!-- Package badge -->
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white/90">
                  <i class="fas fa-wifi text-[9px]"></i>
                  {{ selectedSub.packageName }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ SCROLLABLE CONTENT ═══ -->
        <div class="overflow-y-auto flex-1">
          <div class="px-5 pt-4 pb-5 space-y-3">

            <!-- ── Stats row ── -->
            <div class="grid grid-cols-3 gap-2">
              <!-- Days remaining -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 text-center">
                <div class="text-2xl font-black leading-none"
                  :class="{
                    'text-emerald-500': remainingDaysCount(selectedSub.endDate) > 7,
                    'text-amber-500': remainingDaysCount(selectedSub.endDate) > 0 && remainingDaysCount(selectedSub.endDate) <= 7,
                    'text-red-500': remainingDaysCount(selectedSub.endDate) <= 0,
                  }">
                  {{ Math.max(0, remainingDaysCount(selectedSub.endDate)) }}
                </div>
                <p class="text-[10px] text-gray-400 mt-1 font-medium">أيام متبقية</p>
              </div>
              <!-- Start date -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 text-center">
                <div class="text-xs font-bold text-indigo-600 leading-tight">{{ formatDate(selectedSub.startDate) }}</div>
                <p class="text-[10px] text-gray-400 mt-1 font-medium">تاريخ البدء</p>
              </div>
              <!-- End date -->
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 text-center"
                :class="remainingDaysCount(selectedSub.endDate) <= 0 ? 'border-red-200 bg-red-50' : ''">
                <div class="text-xs font-bold leading-tight"
                  :class="remainingDaysCount(selectedSub.endDate) <= 0 ? 'text-red-600' : 'text-gray-700'">
                  {{ formatDate(selectedSub.endDate) }}
                </div>
                <p class="text-[10px] mt-1 font-medium"
                  :class="remainingDaysCount(selectedSub.endDate) <= 0 ? 'text-red-400' : 'text-gray-400'">
                  {{ remainingDaysCount(selectedSub.endDate) <= 0 ? 'منتهي' : 'تاريخ الانتهاء' }}
                </p>
              </div>
            </div>

            <!-- ── Progress bar (days used) ── -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5">
              <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-semibold text-gray-600">تقدم الاشتراك</span>
                <span class="text-xs font-bold"
                  :class="{
                    'text-emerald-600': subscriptionProgress(selectedSub) < 80,
                    'text-amber-600': subscriptionProgress(selectedSub) >= 80 && subscriptionProgress(selectedSub) < 100,
                    'text-red-600': subscriptionProgress(selectedSub) >= 100,
                  }">
                  {{ subscriptionProgress(selectedSub) }}%
                </span>
              </div>
              <div class="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                  :class="{
                    'bg-emerald-400': subscriptionProgress(selectedSub) < 80,
                    'bg-amber-400': subscriptionProgress(selectedSub) >= 80 && subscriptionProgress(selectedSub) < 100,
                    'bg-red-500': subscriptionProgress(selectedSub) >= 100,
                  }"
                  :style="{ width: Math.min(100, subscriptionProgress(selectedSub)) + '%' }">
                </div>
              </div>
              <div class="flex justify-between mt-1.5 text-[10px] text-gray-400">
                <span>بدأ</span>
                <span>انتهى</span>
              </div>
            </div>

            <!-- ── Subscriber info ── -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-4 py-2.5 bg-gradient-to-l from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center gap-2">
                <div class="w-5 h-5 rounded-lg bg-blue-500 flex items-center justify-center">
                  <i class="fas fa-user text-white text-[9px]"></i>
                </div>
                <span class="text-xs font-bold text-gray-700">بيانات المشترك</span>
              </div>
              <div class="flex items-center justify-between px-4 py-3 gap-3">
                <div class="flex items-center gap-2">
                  <i class="fas fa-phone text-blue-400 text-xs"></i>
                  <span class="text-[11px] text-gray-500">رقم الهاتف</span>
                  <span class="font-mono text-gray-800 font-semibold text-sm" dir="ltr">{{ selectedSub.phone || '—' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-wallet text-gray-400 text-xs"></i>
                  <span class="text-[11px] text-gray-500">الدفع</span>
                  <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    :class="{
                      'bg-green-100 text-green-700': selectedSub.paymentMethod === 'cash',
                      'bg-orange-100 text-orange-700': selectedSub.paymentMethod === 'credit',
                      'bg-blue-100 text-blue-700': selectedSub.paymentMethod === 'partial',
                    }">
                    <i class="fas text-[9px]"
                      :class="{
                        'fa-money-bill-wave': selectedSub.paymentMethod === 'cash',
                        'fa-clock': selectedSub.paymentMethod === 'credit',
                        'fa-percentage': selectedSub.paymentMethod === 'partial',
                      }"></i>
                    {{ { cash: 'نقداً', credit: 'آجل', partial: 'جزئي' }[selectedSub.paymentMethod] || selectedSub.paymentMethod }}
                  </span>
                </div>
              </div>
            </div>

            <!-- ── Financial breakdown ── -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div class="px-4 py-2.5 bg-gradient-to-l from-amber-50 to-yellow-50 border-b border-gray-100 flex items-center gap-2">
                <div class="w-5 h-5 rounded-lg bg-amber-500 flex items-center justify-center">
                  <i class="fas fa-coins text-white text-[9px]"></i>
                </div>
                <span class="text-xs font-bold text-gray-700">التفاصيل المالية</span>
              </div>
              <div class="p-4 space-y-2.5">
                <!-- Price row -->
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-500 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block"></span>
                    سعر الباقة
                  </span>
                  <span class="font-mono font-semibold text-gray-800 text-sm">{{ Number(selectedSub.price || 0).toLocaleString('ar-IQ') }} <span class="text-[10px] text-gray-400">د.ع</span></span>
                </div>
                <!-- Debt row (if any) -->
                <div v-if="Number(selectedSub.debtAmount || 0) > 0" class="flex items-center justify-between">
                  <span class="text-xs text-orange-500 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block"></span>
                    دين مضاف
                  </span>
                  <span class="font-mono font-semibold text-orange-500 text-sm">+ {{ Number(selectedSub.debtAmount).toLocaleString('ar-IQ') }} <span class="text-[10px]">د.ع</span></span>
                </div>
                <!-- Divider + total when debt exists -->
                <div v-if="Number(selectedSub.debtAmount || 0) > 0" class="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between">
                  <span class="text-xs text-gray-600 font-semibold flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block"></span>
                    الإجمالي
                  </span>
                  <span class="font-mono font-bold text-gray-800 text-sm">
                    {{ (Number(selectedSub.price || 0) + Number(selectedSub.debtAmount || 0)).toLocaleString('ar-IQ') }}
                    <span class="text-[10px] text-gray-400">د.ع</span>
                  </span>
                </div>
                <!-- Paid row -->
                <div v-if="Number(selectedSub.paidAmount || 0) > 0" class="flex items-center justify-between">
                  <span class="text-xs text-emerald-600 flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    المدفوع
                  </span>
                  <span class="font-mono font-semibold text-emerald-600 text-sm">{{ Number(selectedSub.paidAmount).toLocaleString('ar-IQ') }} <span class="text-[10px]">د.ع</span></span>
                </div>

                <!-- Remaining / paid-in-full pill -->
                <div class="mt-1">
                  <div class="flex items-center justify-between px-4 py-3 rounded-2xl"
                    :class="(Number(selectedSub.price||0) + Number(selectedSub.debtAmount||0) - Number(selectedSub.paidAmount||0)) <= 0
                      ? 'bg-gradient-to-l from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-l from-red-500 to-rose-500'">
                    <span class="text-white text-sm font-bold flex items-center gap-2">
                      <i class="fas"
                        :class="(Number(selectedSub.price||0) + Number(selectedSub.debtAmount||0) - Number(selectedSub.paidAmount||0)) <= 0
                          ? 'fa-check-double'
                          : 'fa-exclamation-circle'"></i>
                      {{ (Number(selectedSub.price||0) + Number(selectedSub.debtAmount||0) - Number(selectedSub.paidAmount||0)) <= 0 ? 'تم التسديد بالكامل' : 'المبلغ المتبقي' }}
                    </span>
                    <span class="text-white font-black text-base font-mono">
                      {{ Math.max(0, Number(selectedSub.price||0) + Number(selectedSub.debtAmount||0) - Number(selectedSub.paidAmount||0)).toLocaleString('ar-IQ') }}
                      <span class="text-xs font-normal opacity-80">د.ع</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Notes ── -->
            <div v-if="selectedSub.notes" class="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5 flex gap-3">
              <i class="fas fa-sticky-note text-amber-400 mt-0.5 shrink-0"></i>
              <p class="text-sm text-amber-800 leading-relaxed whitespace-pre-line">{{ selectedSub.notes }}</p>
            </div>

          </div>
        </div>

        <!-- ═══ FOOTER ═══ -->
        <div class="px-5 py-4 border-t border-gray-100 bg-gray-50 flex gap-2">
          <button @click="printSubscription(selectedSub)"
            class="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-2xl transition shadow-sm shadow-emerald-200">
            <i class="fas fa-print"></i> طباعة
          </button>
          <button @click="showViewModal = false"
            class="px-5 py-2.5 text-sm font-semibold border border-gray-200 rounded-2xl hover:bg-gray-100 transition text-gray-600">
            إغلاق
          </button>
        </div>

      </div>
    </div>
  </transition>

  <!-- Edit Modal -->
  <transition name="modal">
    <div v-if="showEditModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showEditModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h3 class="text-base font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-edit text-amber-500"></i> تعديل الاشتراك
          </h3>
          <button @click="showEditModal = false" class="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">طريقة الدفع</label>
            <select v-model="editForm.paymentMethod" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition">
              <option value="cash">نقداً</option>
              <option value="credit">آجل</option>
              <option value="partial">جزئي</option>
            </select>
          </div>
          <div v-if="editForm.paymentMethod === 'partial' || editForm.paymentMethod === 'credit'">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">المبلغ المدفوع</label>
            <input type="number" v-model.number="editForm.paidAmount" min="0" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" placeholder="0" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">تاريخ الاشتراك</label>
              <input type="date" v-model="editForm.startDate" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">تاريخ الانتهاء</label>
              <input type="date" v-model="editForm.endDate" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">الملاحظات</label>
            <textarea v-model="editForm.notes" rows="3" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none" placeholder="أضف ملاحظات..."></textarea>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
          <button @click="showEditModal = false" class="px-5 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600">إلغاء</button>
          <button @click="saveEdit" :disabled="saving"
            class="px-5 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            حفظ التعديلات
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Delete Confirm Modal -->
  <transition name="modal">
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showDeleteConfirm = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="p-6 text-center space-y-3">
          <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <i class="fas fa-trash-alt text-xl text-red-500"></i>
          </div>
          <h3 class="text-base font-bold text-gray-800">تأكيد الحذف</h3>
          <p class="text-sm text-gray-500">هل أنت متأكد من حذف اشتراك <span class="font-semibold text-gray-700">{{ selectedSub?.subscriberName }}</span>؟<br>لا يمكن التراجع عن هذا الإجراء.</p>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-center gap-3 rounded-b-2xl">
          <button @click="showDeleteConfirm = false" class="px-5 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600">إلغاء</button>
          <button @click="deleteRow" :disabled="saving"
            class="px-5 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition shadow-sm disabled:opacity-50 flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            نعم، احذف
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Add Debt Modal -->
  <transition name="modal">
    <div v-if="showAddDebtModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showAddDebtModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="bg-gradient-to-l from-orange-600 to-amber-500 px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-plus-circle text-white text-lg"></i>
            </div>
            <div>
              <h3 class="text-white font-bold text-base">اضافة دين</h3>
              <p class="text-orange-100 text-xs mt-0.5 truncate max-w-[180px]">{{ contextMenuSub?.subscriberName }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div class="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-800 flex items-start gap-2">
            <i class="fas fa-info-circle text-orange-400 mt-0.5 flex-shrink-0"></i>
            <span>سيتم إضافة المبلغ المدخل إلى الدين الحالي للاشتراك</span>
          </div>
          <div v-if="contextMenuSub && Number(contextMenuSub.debtAmount) > 0" class="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl text-sm">
            <span class="text-gray-500">الدين الحالي</span>
            <span class="font-semibold text-orange-600 font-mono">{{ Number(contextMenuSub.debtAmount).toLocaleString('ar-IQ') }} د.ع</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">مبلغ الدين الإضافي (د.ع)</label>
            <input type="number" v-model.number="addDebtAmount" min="1"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition font-mono"
              placeholder="0" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button @click="showAddDebtModal = false" class="px-5 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600">إلغاء</button>
          <button @click="saveAddDebt" :disabled="saving || !addDebtAmount || addDebtAmount <= 0"
            class="px-5 py-2 text-sm font-medium bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            <i v-else class="fas fa-plus text-xs"></i>
            إضافة الدين
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Pay Debt Modal -->
  <transition name="modal">
    <div v-if="showPayDebtModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showPayDebtModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="bg-gradient-to-l from-emerald-600 to-teal-500 px-6 py-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-hand-holding-usd text-white text-lg"></i>
            </div>
            <div>
              <h3 class="text-white font-bold text-base">تسديد دين</h3>
              <p class="text-emerald-100 text-xs mt-0.5 truncate max-w-[180px]">{{ contextMenuSub?.subscriberName }}</p>
            </div>
          </div>
        </div>
        <div class="p-6 space-y-4">
          <div v-if="contextMenuSub" class="grid grid-cols-3 gap-2">
            <div class="bg-gray-50 rounded-xl p-3 text-center">
              <p class="text-xs text-gray-400 mb-1">سعر الباقة</p>
              <p class="text-sm font-bold text-gray-700 font-mono">{{ Number(contextMenuSub.price||0).toLocaleString('ar-IQ') }}</p>
            </div>
            <div class="bg-orange-50 rounded-xl p-3 text-center">
              <p class="text-xs text-orange-400 mb-1">الدين</p>
              <p class="text-sm font-bold text-orange-700 font-mono">{{ Number(contextMenuSub.debtAmount||0).toLocaleString('ar-IQ') }}</p>
            </div>
            <div class="bg-emerald-50 rounded-xl p-3 text-center">
              <p class="text-xs text-emerald-400 mb-1">مدفوع</p>
              <p class="text-sm font-bold text-emerald-700 font-mono">{{ Number(contextMenuSub.paidAmount||0).toLocaleString('ar-IQ') }}</p>
            </div>
          </div>
          <div v-if="contextMenuSub" class="flex items-center justify-between px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl">
            <span class="text-sm text-red-600 font-medium flex items-center gap-2">
              <i class="fas fa-exclamation-circle text-xs"></i>
              المبلغ المتبقي
            </span>
            <span class="font-mono font-bold text-red-700 text-sm">
              {{ Math.max(0, Number(contextMenuSub.price||0) + Number(contextMenuSub.debtAmount||0) - Number(contextMenuSub.paidAmount||0)).toLocaleString('ar-IQ') }} د.ع
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">المبلغ المسدَّد الآن (د.ع)</label>
            <input type="number" v-model.number="payDebtAmount" min="1"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition font-mono"
              placeholder="0" />
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
          <button @click="showPayDebtModal = false" class="px-5 py-2 text-sm font-medium border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600">إلغاء</button>
          <button @click="savePayDebt" :disabled="saving || !payDebtAmount || payDebtAmount <= 0"
            class="px-5 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition shadow-sm flex items-center gap-2">
            <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
            <i v-else class="fas fa-check text-xs"></i>
            تأكيد التسديد
          </button>
        </div>
      </div>
    </div>
  </transition>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';
import { logActivity } from '../../utils/activityLog';

const allSubscriptions = ref<any[]>([]);
const selected = ref<number[]>([]);
const loading = ref(false);
const search = ref('');
const filterPackage = ref('');
const filterPayment = ref('');
const filterDate = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

// Modal state
const showViewModal = ref(false);
const showEditModal = ref(false);
const showDeleteConfirm = ref(false);
const selectedSub = ref<any>(null);
const saving = ref(false);
const editForm = ref({ paymentMethod: '', startDate: '', endDate: '', paidAmount: 0, debtAmount: 0, notes: '' });
const toast = ref({ show: false, message: '', type: 'success' });

// Context menu state
const showContextMenu = ref(false);
const contextMenuSub = ref<any>(null);
const contextMenuPos = ref({ x: 0, y: 0 });
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

// Add Debt modal state
const showAddDebtModal = ref(false);
const addDebtAmount = ref(0);

// Pay Debt modal state
const showPayDebtModal = ref(false);
const payDebtAmount = ref(0);

const totalItems = computed(() => allSubscriptions.value.length);

const uniquePackages = computed(() =>
  [...new Set(allSubscriptions.value.map((s: any) => s.packageName).filter(Boolean))].sort()
);

const filteredRows = computed(() => {
  let rows = allSubscriptions.value;
  if (search.value.trim()) {
    const q = search.value.trim().toLowerCase();
    rows = rows.filter((s: any) =>
      s.subscriberName.toLowerCase().includes(q) ||
      s.packageName.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  }
  if (filterPackage.value) rows = rows.filter((s: any) => s.packageName === filterPackage.value);
  if (filterPayment.value) rows = rows.filter((s: any) => s.paymentMethod === filterPayment.value);
  if (filterDate.value) rows = rows.filter((s: any) => s.startDate && s.startDate.startsWith(filterDate.value));
  return rows;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const delta = 2;
  const pages: number[] = [];
  for (let p = Math.max(1, cur - delta); p <= Math.min(total, cur + delta); p++) {
    pages.push(p);
  }
  return pages;
});

const allSelected = computed(() =>
  paginatedRows.value.length > 0 && paginatedRows.value.every(s => selected.value.includes(s.id))
);

function toggleAll(e: Event) {
  const ids = paginatedRows.value.map(s => s.id);
  if ((e.target as HTMLInputElement).checked) {
    selected.value = [...new Set([...selected.value, ...ids])];
  } else {
    selected.value = selected.value.filter(id => !ids.includes(id));
  }
}

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
}

function setPageSize(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ar-IQ');
}

function remainingDaysCount(dateStr: string): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function subscriptionProgress(s: any): number {
  if (!s.startDate || !s.endDate) return 0;
  const start = new Date(s.startDate).getTime();
  const end = new Date(s.endDate).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  return Math.min(100, Math.round(((now - start) / (end - start)) * 100));
}

function isExpiringSoon(dateStr: string) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const days = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 7;
}

function getAmountInfo(s: any) {
  const price = Number(s.price || 0);
  const paid = Number(s.paidAmount || 0);
  const debt = Number(s.debtAmount || 0);
  const total = price + debt;
  const remaining = total - paid;
  if (s.paymentMethod === 'cash' && debt === 0) {
    return { amount: price, label: 'نقداً', colorClass: 'bg-green-50 text-green-700' };
  }
  if (paid >= total && total > 0) {
    return { amount: null, label: 'تم التسديد', colorClass: 'bg-emerald-50 text-emerald-700' };
  }
  if (s.paymentMethod === 'credit') {
    if (paid === 0 && debt === 0) {
      return { amount: price, label: 'آجل', colorClass: 'bg-orange-50 text-orange-700' };
    }
    return { amount: remaining, label: 'جزئي', colorClass: 'bg-blue-50 text-blue-700' };
  }
  return { amount: remaining, label: 'جزئي', colorClass: 'bg-blue-50 text-blue-700' };
}

async function loadData() {
  loading.value = true;
  try {
    const { data } = await api.get('/subscriptions');
    allSubscriptions.value = data.map((s: any) => ({
      id: s.id,
      subscriberName: s.subscriber?.name || '—',
      packageName: s.package?.name || '—',
      phone: s.subscriber?.phone || '',
      paymentMethod: s.paymentMethod || '',
      startDate: s.startDate,
      endDate: s.endDate,
      status: s.status || 'active',
      price: Number(s.price || 0),
      paidAmount: Number(s.paidAmount || 0),
      debtAmount: Number(s.debtAmount || 0),
      notes: s.notes || ''
    }));
  } catch {
    allSubscriptions.value = [];
  } finally {
    loading.value = false;
  }
}

function openContextMenu(event: MouseEvent | TouchEvent, s: any) {
  contextMenuSub.value = s;
  let x: number, y: number;
  if ('touches' in event) {
    const touch = (event as TouchEvent).changedTouches[0] || (event as TouchEvent).touches[0];
    x = touch.clientX;
    y = touch.clientY;
  } else {
    x = (event as MouseEvent).clientX;
    y = (event as MouseEvent).clientY;
  }
  // Keep menu inside viewport
  x = Math.min(x, window.innerWidth - 220);
  y = Math.min(y, window.innerHeight - 280);
  contextMenuPos.value = { x: Math.max(4, x), y: Math.max(4, y) };
  showContextMenu.value = true;
}

function closeContextMenu() {
  showContextMenu.value = false;
}

function startLongPress(event: TouchEvent, s: any) {
  longPressTimer = setTimeout(() => {
    openContextMenu(event, s);
  }, 600);
}

function cancelLongPress() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

function ctxViewDetails() { openView(contextMenuSub.value); closeContextMenu(); }
function ctxAddDebt() { addDebtAmount.value = 0; showAddDebtModal.value = true; closeContextMenu(); }
function ctxPayDebt() { payDebtAmount.value = 0; showPayDebtModal.value = true; closeContextMenu(); }
function ctxPrint() { printSubscription(contextMenuSub.value); closeContextMenu(); }
function ctxDelete() { confirmDelete(contextMenuSub.value); closeContextMenu(); }

async function saveAddDebt() {
  const sub = contextMenuSub.value;
  if (!sub || !addDebtAmount.value || addDebtAmount.value <= 0) return;
  saving.value = true;
  try {
    const updated = await api.patch(`/subscriptions/${sub.id}/debt`, { amount: addDebtAmount.value });
    const idx = allSubscriptions.value.findIndex(s => s.id === sub.id);
    if (idx !== -1) {
      allSubscriptions.value[idx] = {
        ...allSubscriptions.value[idx],
        debtAmount: Number(updated.data?.debtAmount ?? (Number(sub.debtAmount || 0) + addDebtAmount.value)),
        notes: updated.data?.notes ?? allSubscriptions.value[idx].notes,
      };
      contextMenuSub.value = allSubscriptions.value[idx];
    }
    showAddDebtModal.value = false;
    logActivity({ action: 'add_debt', module: 'subscription', subscriberName: sub.subscriberName, details: `إضافة دين على اشتراك: ${sub.subscriberName}`, amount: addDebtAmount.value });
    showToast('تمت إضافة الدين بنجاح');
  } catch {
    showToast('فشل إضافة الدين', 'error');
  } finally {
    saving.value = false;
  }
}

async function savePayDebt() {
  const sub = contextMenuSub.value;
  if (!sub || !payDebtAmount.value || payDebtAmount.value <= 0) return;
  saving.value = true;
  try {
    const updated = await api.patch(`/subscriptions/${sub.id}/pay`, { amount: payDebtAmount.value });
    const idx = allSubscriptions.value.findIndex(s => s.id === sub.id);
    if (idx !== -1) {
      allSubscriptions.value[idx] = {
        ...allSubscriptions.value[idx],
        paidAmount: Number(updated.data?.paidAmount ?? (Number(sub.paidAmount || 0) + payDebtAmount.value)),
        notes: updated.data?.notes ?? allSubscriptions.value[idx].notes,
      };
      contextMenuSub.value = allSubscriptions.value[idx];
    }
    showPayDebtModal.value = false;
    logActivity({ action: 'pay_debt', module: 'subscription', subscriberName: sub.subscriberName, details: `تسديد دين لاشتراك: ${sub.subscriberName}`, amount: payDebtAmount.value });
    showToast('تم تسديد الدين بنجاح');
  } catch {
    showToast('فشل تسديد الدين', 'error');
  } finally {
    saving.value = false;
  }
}

function openView(s: any) {
  selectedSub.value = s;
  showViewModal.value = true;
}

function openEdit(s: any) {
  selectedSub.value = s;
  editForm.value = {
    paymentMethod: s.paymentMethod,
    startDate: s.startDate ? s.startDate.split('T')[0] : '',
    endDate: s.endDate ? s.endDate.split('T')[0] : '',
    paidAmount: Number(s.paidAmount || 0),
    debtAmount: Number(s.debtAmount || 0),
    notes: s.notes || '',
  };
  showEditModal.value = true;
}

function confirmDelete(s: any) {
  selectedSub.value = s;
  showDeleteConfirm.value = true;
}

async function saveEdit() {
  if (!selectedSub.value) return;
  saving.value = true;
  try {
    await api.patch(`/subscriptions/${selectedSub.value.id}`, editForm.value);
    const idx = allSubscriptions.value.findIndex(s => s.id === selectedSub.value.id);
    if (idx !== -1) {
      allSubscriptions.value[idx] = {
        ...allSubscriptions.value[idx],
        paymentMethod: editForm.value.paymentMethod,
        startDate: editForm.value.startDate,
        endDate: editForm.value.endDate,
        paidAmount: Number(editForm.value.paidAmount || 0),
        debtAmount: Number(editForm.value.debtAmount || 0),
        notes: editForm.value.notes,
      };
    }
    showEditModal.value = false;
    logActivity({ action: 'edit_subscription', module: 'subscription', subscriberName: selectedSub.value.subscriberName, details: `تعديل اشتراك: ${selectedSub.value.subscriberName}` });
    showToast('تم تحديث الاشتراك بنجاح');
  } catch {
    showToast('فشل تحديث الاشتراك', 'error');
  } finally {
    saving.value = false;
  }
}

async function deleteRow() {
  if (!selectedSub.value) return;
  saving.value = true;
  try {
    await api.delete(`/subscriptions/${selectedSub.value.id}`);
    allSubscriptions.value = allSubscriptions.value.filter(s => s.id !== selectedSub.value.id);
    selected.value = selected.value.filter(id => id !== selectedSub.value.id);
    showDeleteConfirm.value = false;
    logActivity({ action: 'delete_subscription', module: 'subscription', subscriberName: selectedSub.value.subscriberName, details: `حذف اشتراك: ${selectedSub.value.subscriberName}` });
    showToast('تم حذف الاشتراك بنجاح');
  } catch {
    showToast('فشل حذف الاشتراك', 'error');
  } finally {
    saving.value = false;
  }
}

function showToast(message: string, type = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

async function printSubscription(s: any) {
  const paid   = Number(s.paidAmount  || 0);
  const debt   = Number(s.debtAmount  || 0);
  const price  = Number(s.price       || 0);
  const total  = price + debt;
  const remaining = total - paid;
  const now    = new Date();
  const dateStr = now.toLocaleDateString('ar-IQ');
  const pad    = (n: number) => String(n).padStart(2, '0');
  const recNum = `REC-${s.id}-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
  const startStr = s.startDate ? new Date(s.startDate).toLocaleDateString('ar-IQ') : '—';
  const endStr   = s.endDate   ? new Date(s.endDate).toLocaleDateString('ar-IQ')   : '—';

  // payment type styling
  const pmStyles: Record<string, { bg: string; border: string; badge: string; label: string; icon: string }> = {
    cash:    { bg:'#f0fdf4', border:'#86efac', badge:'#16a34a', label:'نقداً',     icon:'💵' },
    credit:  { bg:'#eff6ff', border:'#93c5fd', badge:'#1d4ed8', label:'آجل',       icon:'📋' },
    partial: { bg:'#fff7ed', border:'#fdba74', badge:'#c2410c', label:'دفع جزئي',  icon:'🔄' },
  };
  const pm = pmStyles[s.paymentMethod] || pmStyles.cash;

  // is it a debt clearance receipt?
  const isClearance = debt > 0 && remaining === 0;
  const isPartialPay = s.paymentMethod === 'partial' || (debt > 0 && remaining > 0);

  // Load company settings & logo from API (fallback to localStorage)
  let co = { companyName: '', companyPhone: '', companyEmail: '', companyAddress: '' };
  let logo = '';
  try {
    const { data: sysData } = await api.get('/system-settings');
    Object.assign(co, {
      companyName: sysData.companyName || '',
      companyPhone: sysData.companyPhone || '',
      companyEmail: sysData.companyEmail || '',
      companyAddress: sysData.companyAddress || '',
    });
    logo = sysData.logoBase64 || '';
  } catch {
    try { Object.assign(co, JSON.parse(localStorage.getItem('isp_internet_settings') || '{}')); } catch {}
    logo = localStorage.getItem('isp_internet_logo') || '';
  }

  const win = window.open('', '_blank', 'width=680,height=820');
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>سند قبض</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;background:#f1f5f9;display:flex;flex-direction:column;align-items:center;padding:24px 16px;min-height:100vh}
/* paper size buttons */
.size-btns{display:flex;gap:8px;margin-bottom:16px}
.size-btn{padding:6px 16px;border:2px solid #cbd5e1;border-radius:8px;background:#fff;font-size:13px;cursor:pointer;color:#475569;font-weight:600;transition:all .15s}
.size-btn.active,.size-btn:hover{border-color:#2563eb;color:#2563eb;background:#eff6ff}
/* receipt card */
.rec{background:#fff;border-radius:16px;box-shadow:0 4px 24px #0002;overflow:hidden;width:210mm;font-size:13px}
/* ══ A5 HEADER: horizontal layout ══ */
.hdr{background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);padding:20px 26px;display:flex;align-items:center;gap:16px}
.hdr-logo{width:66px;height:66px;border-radius:12px;background:#fff3;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0}
.hdr-logo img{width:100%;height:100%;object-fit:contain}
.hdr-logo .ico{font-size:26px;color:#fff}
.hdr-info{flex:1;min-width:0}
.hdr-co{font-size:16px;font-weight:800;color:#fff;line-height:1.3}
.hdr-meta{font-size:11px;color:#bfdbfe;margin-top:4px;line-height:1.8}
.hdr-meta .co-sep{opacity:.6}
/* A5: title on left side */
.hdr-title{text-align:left;color:#fff;flex-shrink:0}
.hdr-title .t-lbl{font-size:10px;color:#bfdbfe;letter-spacing:.5px}
.hdr-title .t-val{font-size:19px;font-weight:900;margin-top:2px;white-space:nowrap}
.hdr-title .badge-type{display:inline-block;margin-top:6px;padding:3px 11px;border-radius:20px;font-size:11px;font-weight:700;background:#fff2;color:#fff;border:1px solid #fff4}
/* thermal title band (hidden on A5, shown on p80/p58) */
.hdr-thermal{display:none;background:#1e3a8a;border-top:1px solid #2563eb55;padding:8px 12px;align-items:center;justify-content:space-between}
.hdr-thermal .t-val{font-size:14px;font-weight:900;color:#fff}
.hdr-thermal .badge-type{display:inline-block;padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:#fff2;color:#fff;border:1px solid #fff4}
/* meta strip */
.meta-strip{background:#f8fafc;border-bottom:2px solid #e2e8f0;padding:7px 26px;display:flex;justify-content:flex-end;align-items:center;gap:8px}
.meta-item{text-align:right}
.meta-item .mi-lbl{font-size:9px;color:#94a3b8;font-weight:600;letter-spacing:.3px}
.meta-item .mi-val{font-size:11px;font-weight:700;color:#1e293b;margin-top:1px}
.meta-sep{width:1px;height:28px;background:#e2e8f0;flex-shrink:0}
/* body */
.body{padding:18px 26px}
.sec-title{font-size:10px;font-weight:700;color:#64748b;letter-spacing:.5px;text-transform:uppercase;margin-bottom:8px;display:flex;align-items:center;gap:5px}
.sec-title::before{content:'';display:block;width:3px;height:13px;background:#2563eb;border-radius:2px}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:16px}
.info-cell{background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;padding:9px 12px}
.info-cell .ic-lbl{font-size:9.5px;color:#94a3b8;font-weight:600}
.info-cell .ic-val{font-size:12.5px;font-weight:700;color:#1e293b;margin-top:2px}
.div-dash{border:none;border-top:2px dashed #e2e8f0;margin:14px 0}
.pay-box{border-radius:11px;padding:14px 16px;margin-bottom:16px}
.pay-box .pay-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.pm-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;color:#fff}
.pay-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:12.5px;border-bottom:1px dashed}
.pay-row:last-child{border-bottom:none}
.pay-row .pl{color:#475569}
.pay-row .pv{font-weight:700}
.paid-big{background:linear-gradient(135deg,#052e16,#166534);border-radius:7px;padding:6px 10px;margin-bottom:9px;color:#fff}
.paid-big .pb-lbl{font-size:12px;color:#86efac;font-weight:700}
.paid-big .pb-val{font-size:17px;font-weight:900;line-height:1.1}
.paid-big .pb-currency{font-size:10px;font-weight:500;color:#bbf7d0;margin-right:3px}
.remain-box{border-radius:9px;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;margin-top:10px}
.notes-box{background:#fefce8;border:1px solid #fef08a;border-radius:7px;padding:5px 8px;font-size:10px;color:#713f12;line-height:1.5;margin-bottom:10px;white-space:pre-line}
.notes-title{font-size:9.5px;font-weight:700;color:#a16207;margin-bottom:3px;letter-spacing:.4px}
.ftr{background:linear-gradient(135deg,#1e3a8a,#2563eb);text-align:center;padding:12px;color:#fff}
.ftr .ftr-main{font-size:13px;font-weight:700}
.ftr .ftr-sub{font-size:9.5px;color:#bfdbfe;margin-top:3px}

/* ══ THERMAL 80mm ══ */
.rec.p80{font-size:11px}
.rec.p80 .hdr{flex-direction:column;align-items:center;text-align:center;padding:14px 12px;gap:6px}
.rec.p80 .hdr-logo{width:50px;height:50px;border-radius:10px}
.rec.p80 .hdr-info{text-align:center}
.rec.p80 .hdr-co{font-size:13px}
.rec.p80 .hdr-meta{font-size:9.5px;margin-top:3px}
.rec.p80 .hdr-title{display:none}
.rec.p80 .hdr-thermal{display:flex}
.rec.p80 .meta-strip{flex-direction:column;padding:0;gap:0}
.rec.p80 .meta-sep{display:none}
.rec.p80 .meta-item{text-align:right;flex:none;display:flex;justify-content:space-between;align-items:center;padding:4px 12px;border-bottom:1px dashed #e2e8f0}
.rec.p80 .meta-item .mi-lbl{font-size:9px}
.rec.p80 .meta-item .mi-val{font-size:10.5px}
.rec.p80 .body{padding:10px 12px}
.rec.p80 .sec-title{font-size:9px;margin-bottom:6px}
.rec.p80 .info-grid{grid-template-columns:1fr;gap:5px;margin-bottom:12px}
.rec.p80 .info-cell{padding:6px 10px;border-radius:7px}
.rec.p80 .info-cell .ic-lbl{font-size:8.5px}
.rec.p80 .info-cell .ic-val{font-size:10.5px;margin-top:1px}
.rec.p80 .div-dash{margin:10px 0}
.rec.p80 .pay-box{padding:10px 12px;border-radius:9px;margin-bottom:12px}
.rec.p80 .pay-box .pay-header{margin-bottom:8px}
.rec.p80 .pm-badge{font-size:9.5px;padding:2px 9px}
.rec.p80 .pay-row{font-size:10.5px;padding:5px 0}
.rec.p80 .paid-big{padding:10px;border-radius:9px;margin-bottom:10px}
.rec.p80 .paid-big .pb-lbl{font-size:9px}
.rec.p80 .paid-big .pb-val{font-size:20px}
.rec.p80 .paid-big .pb-currency{font-size:11px}
.rec.p80 .remain-box{padding:8px 10px;border-radius:7px}
.rec.p80 .ftr{padding:9px}
.rec.p80 .ftr .ftr-main{font-size:11px}
.rec.p80 .ftr .ftr-sub{font-size:8.5px}

/* ══ THERMAL 58mm ══ */
.rec.p58{font-size:9.5px}
.rec.p58 .hdr{flex-direction:column;align-items:center;text-align:center;padding:10px 8px;gap:4px}
.rec.p58 .hdr-logo{width:38px;height:38px;border-radius:7px}
.rec.p58 .hdr-logo .ico{font-size:16px}
.rec.p58 .hdr-info{text-align:center}
.rec.p58 .hdr-co{font-size:11px}
.rec.p58 .hdr-meta{font-size:8.5px;margin-top:2px}
.rec.p58 .hdr-meta .co-email,.rec.p58 .hdr-meta .co-sep-e,.rec.p58 .hdr-meta .co-addr{display:none}
.rec.p58 .hdr-title{display:none}
.rec.p58 .hdr-thermal{display:flex;padding:6px 8px}
.rec.p58 .hdr-thermal .t-val{font-size:12px}
.rec.p58 .hdr-thermal .badge-type{font-size:8.5px;padding:2px 7px}
.rec.p58 .meta-strip{flex-direction:column;padding:0;gap:0}
.rec.p58 .meta-sep{display:none}
.rec.p58 .meta-item{text-align:right;flex:none;display:flex;justify-content:space-between;align-items:center;padding:3px 8px;border-bottom:1px dashed #e2e8f0}
.rec.p58 .meta-item .mi-lbl{font-size:8px}
.rec.p58 .meta-item .mi-val{font-size:9px}
.rec.p58 .body{padding:8px}
.rec.p58 .sec-title{font-size:8px;margin-bottom:5px}
.rec.p58 .info-grid{grid-template-columns:1fr;gap:4px;margin-bottom:10px}
.rec.p58 .info-cell{padding:5px 7px;border-radius:6px}
.rec.p58 .info-cell .ic-lbl{font-size:7.5px}
.rec.p58 .info-cell .ic-val{font-size:9px;margin-top:1px}
.rec.p58 .div-dash{margin:8px 0}
.rec.p58 .pay-box{padding:8px;border-radius:7px;margin-bottom:9px}
.rec.p58 .pay-box .pay-header{margin-bottom:6px}
.rec.p58 .pm-badge{font-size:8.5px;padding:2px 7px}
.rec.p58 .pay-row{font-size:9px;padding:4px 0}
.rec.p58 .paid-big{padding:8px;border-radius:7px;margin-bottom:8px}
.rec.p58 .paid-big .pb-lbl{font-size:8px}
.rec.p58 .paid-big .pb-val{font-size:16px}
.rec.p58 .paid-big .pb-currency{font-size:9px}
.rec.p58 .remain-box{padding:6px 8px;border-radius:6px}
.rec.p58 .ftr{padding:7px}
.rec.p58 .ftr .ftr-main{font-size:9.5px}
.rec.p58 .ftr .ftr-sub{display:none}

/* print base */
@media print{
  body{background:#fff;padding:0}
  .size-btns{display:none}
  .rec{box-shadow:none;border-radius:0;width:100%}
}
@page{size:A5;margin:8mm}
</style>
</head>
<body>
<div class="size-btns">
  <button class="size-btn active" onclick="setPaper('a5')">A5</button>
  <button class="size-btn" onclick="setPaper('80mm')">80mm</button>
  <button class="size-btn" onclick="setPaper('58mm')">58mm</button>
  <button class="size-btn" onclick="window.print()" style="background:#2563eb;color:#fff;border-color:#2563eb">🖨 طباعة</button>
</div>
<div class="rec" id="rec">
  <!-- HEADER -->
  <div class="hdr">
    <div class="hdr-logo">
      ${logo ? `<img src="${logo}" alt="logo"/>` : `<span class="ico">🌐</span>`}
    </div>
    <div class="hdr-info">
      <div class="hdr-co">${co.companyName || 'خدمات الانترنت'}</div>
      <div class="hdr-meta">
        ${co.companyPhone ? `<span class="co-phone">📞 ${co.companyPhone}</span>` : ''}
        ${co.companyPhone && co.companyEmail ? `<span class="co-sep co-sep-e"> | </span>` : ''}
        ${co.companyEmail ? `<span class="co-email">✉ ${co.companyEmail}</span>` : ''}
        ${co.companyAddress ? `<br/><span class="co-addr">📍 ${co.companyAddress}</span>` : ''}
      </div>
    </div>
    <!-- A5: title on side; hidden on thermal (replaced by hdr-thermal band) -->
    <div class="hdr-title">
      <div class="t-lbl">RECEIPT</div>
      <div class="t-val">سند قبض <span style="font-size:10px;font-weight:500;opacity:.8;margin-right:6px">${recNum}</span></div>
      <div class="badge-type">${pm.icon} ${pm.label}</div>
    </div>
  </div>
  <!-- Thermal title band (shown on p80 / p58) -->
  <div class="hdr-thermal">
    <div class="t-val">🧾 سند قبض <span style="font-size:9px;font-weight:400;opacity:.8;margin-right:4px">${recNum}</span></div>
    <div class="badge-type">${pm.icon} ${pm.label}</div>
  </div>

  <!-- META STRIP -->
  <div class="meta-strip">
    <div class="meta-item">
      <div class="mi-lbl">تاريخ الإصدار</div>
      <div class="mi-val">${dateStr}</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">

    <!-- Subscriber info -->
    <div class="sec-title">بيانات المشترك</div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="ic-lbl">اسم المشترك</div>
        <div class="ic-val">${s.subscriberName || '—'}</div>
      </div>
      <div class="info-cell">
        <div class="ic-lbl">رقم الهاتف</div>
        <div class="ic-val" style="direction:ltr;text-align:right">${s.phone || '—'}</div>
      </div>
    </div>

    <hr class="div-dash"/>

    <!-- Payment box -->
    <div class="sec-title">تفاصيل سند القبض</div>
    <div class="pay-box" style="background:${pm.bg};border:1.5px solid ${pm.border}">
      <div class="pay-header">
        <span style="font-size:12px;font-weight:700;color:#374151">التفاصيل المالية</span>
        <span class="pm-badge" style="background:${pm.badge}">${pm.icon} ${pm.label}</span>
      </div>
      <div class="pay-row" style="border-color:${pm.border}">
        <span class="pl">سعر الباقة</span>
        <span class="pv">${price.toLocaleString('ar-IQ')} <small style="font-weight:500;color:#64748b">د.ع</small></span>
      </div>
      ${debt > 0 ? `
      <div class="pay-row" style="border-color:${pm.border}">
        <span class="pl">دين سابق مضاف</span>
        <span class="pv" style="color:#dc2626">+ ${debt.toLocaleString('ar-IQ')} <small style="font-weight:500;color:#64748b">د.ع</small></span>
      </div>
      <div class="pay-row" style="border-color:${pm.border}">
        <span class="pl">إجمالي المستحق</span>
        <span class="pv">${total.toLocaleString('ar-IQ')} <small style="font-weight:500;color:#64748b">د.ع</small></span>
      </div>` : ''}
    </div>

    <!-- Big paid amount -->
    <div class="paid-big">
      <div style="display:flex;align-items:center;gap:6px">
        <span class="pb-lbl">المبلغ المقبوض :</span>
        <span class="pb-val">${paid.toLocaleString('ar-IQ')} <span class="pb-currency">د.ع</span></span>
      </div>
    </div>

    <!-- Remaining -->
    ${remaining > 0 ? `
    <div class="remain-box" style="background:#fef2f2;border:1.5px solid #fca5a5">
      <span style="font-size:13px;font-weight:700;color:#991b1b">المبلغ المتبقي (دين)</span>
      <span style="font-size:16px;font-weight:900;color:#dc2626">${remaining.toLocaleString('ar-IQ')} <span style="font-size:12px;font-weight:500">د.ع</span></span>
    </div>` : `
    <div class="remain-box" style="background:#f0fdf4;border:1.5px solid #86efac">
      <span style="font-size:13px;font-weight:700;color:#166534">✅ تمت التسوية الكاملة</span>
      <span style="font-size:13px;font-weight:700;color:#16a34a">لا يوجد متبقي</span>
    </div>`}


  </div><!-- /body -->

  <!-- FOOTER -->
  <div class="ftr">
    <div class="ftr-main">✨ شكراً لثقتكم بخدماتنا ✨</div>
    <div class="ftr-sub">هذا السند وثيقة رسمية تثبت استلام المبلغ المذكور أعلاه</div>
  </div>
</div><!-- /rec -->

<script>
function setPaper(size){
  var r=document.getElementById('rec');
  r.classList.remove('p80','p58');
  var btns=document.querySelectorAll('.size-btn');
  btns.forEach(function(b){b.classList.remove('active')});
  event.target.classList.add('active');
  if(size==='a5'){r.style.width='210mm'}
  else if(size==='80mm'){r.style.width='76mm';r.classList.add('p80')}
  else if(size==='58mm'){r.style.width='54mm';r.classList.add('p58')}
}
<\/script>
</body>
</html>`);
  win.document.close();
  win.focus();
}

onMounted(loadData);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.97); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.ctx-enter-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.ctx-leave-active { transition: opacity 0.08s ease; }
.ctx-enter-from { opacity: 0; transform: scale(0.95) translateY(-4px); }
.ctx-leave-to { opacity: 0; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
