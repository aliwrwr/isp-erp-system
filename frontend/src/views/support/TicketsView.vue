<template>
  <div class="space-y-5">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-secondary">تذاكر الدعم الفني</h2>
        <p class="text-sm text-gray-400 mt-0.5">إدارة ومتابعة جميع طلبات الدعم</p>
      </div>
      <button @click="openAdd"
        class="bg-support hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 shadow-sm">
        <i class="fas fa-plus"></i> تذكرة جديدة
      </button>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="s in statusFilters.slice(1)" :key="s.value"
        @click="selectedStatus = s.value"
        class="bg-white rounded-xl border px-4 py-3 cursor-pointer transition hover:shadow-md"
        :class="selectedStatus === s.value ? 'border-support shadow-sm' : 'border-gray-100'">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-medium" :class="selectedStatus === s.value ? 'text-support' : 'text-gray-500'">{{ s.label }}</span>
          <i class="text-xs" :class="[s.icon, selectedStatus === s.value ? 'text-support' : 'text-gray-300']"></i>
        </div>
        <div class="text-2xl font-bold" :class="selectedStatus === s.value ? 'text-support' : 'text-secondary'">{{ s.count }}</div>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-wrap items-center gap-3">
      <!-- All filter button -->
      <button @click="selectedStatus = 'all'"
        class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition"
        :class="selectedStatus === 'all' ? 'bg-support text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
        الكل ({{ ticketsData.length }})
      </button>
      <div class="w-px h-4 bg-gray-200"></div>
      <!-- Priority filter -->
      <select v-model="selectedPriority"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-support bg-white">
        <option value="">كل الأولويات</option>
        <option value="critical">حرج</option>
        <option value="high">عاجل</option>
        <option value="medium">متوسط</option>
        <option value="low">عادي</option>
      </select>
      <!-- Type filter -->
      <select v-model="selectedType"
        class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-support bg-white">
        <option value="">كل الأنواع</option>
        <option value="internet">انترنت</option>
        <option value="hardware">أجهزة</option>
        <option value="billing">فواتير</option>
        <option value="account">حساب</option>
        <option value="other">أخرى</option>
      </select>
      <!-- Search -->
      <div class="mr-auto relative">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
        <input v-model="searchQuery" type="text" placeholder="بحث بالموضوع أو المشترك..."
          class="pr-8 pl-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-support w-52" />
      </div>
      <!-- Clear filters -->
      <button v-if="hasActiveFilters" @click="clearFilters"
        class="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition">
        <i class="fas fa-times-circle"></i> مسح الفلاتر
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <h3 class="font-semibold text-secondary text-sm">
          قائمة التذاكر
          <span class="text-gray-400 font-normal mr-1">({{ filteredTickets.length }})</span>
        </h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide w-16">#</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">المشترك</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">الموضوع</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">النوع</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">الأولوية</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">الفني</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">الحالة</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide">التاريخ</th>
              <th class="px-5 py-3 text-right text-xs text-gray-400 font-semibold uppercase tracking-wide w-20">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center py-16 text-gray-400">
                <i class="fas fa-circle-notch fa-spin text-2xl mb-3 block text-support opacity-50"></i>
                جاري التحميل...
              </td>
            </tr>
            <tr v-else-if="paginatedTickets.length === 0">
              <td colspan="9" class="text-center py-16 text-gray-400">
                <i class="fas fa-ticket-alt text-4xl mb-3 block opacity-20"></i>
                لا توجد تذاكر تطابق البحث
              </td>
            </tr>
            <tr v-for="t in paginatedTickets" :key="t.id"
              class="border-t border-gray-50 hover:bg-gray-50/70 transition-colors group cursor-context-menu"
              @contextmenu.prevent="openCtxMenu($event, t)"
              @touchstart="onTouchStart($event, t)"
              @touchend="onTouchEnd"
              @touchmove="onTouchEnd">
              <td class="px-5 py-3.5 text-gray-400 text-xs font-mono">#{{ t.id }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-support/10 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user text-support text-xs"></i>
                  </div>
                  <span class="font-medium text-secondary text-xs">{{ t.subscriber?.name || '—' }}</span>
                </div>
              </td>
              <td class="px-5 py-3.5 max-w-[200px]">
                <p class="text-gray-700 text-xs font-medium truncate" :title="t.subject">{{ t.subject }}</p>
                <p v-if="t.description" class="text-gray-400 text-xs truncate mt-0.5" :title="t.description">{{ t.description }}</p>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  <i class="text-xs" :class="typeIcons[t.type] || 'fas fa-tag'"></i>
                  {{ typeMap[t.type] || t.type || '—' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                  :class="{
                    'bg-red-50 text-red-600 ring-1 ring-red-200': t.priority === 'critical',
                    'bg-orange-50 text-orange-600 ring-1 ring-orange-200': t.priority === 'high',
                    'bg-amber-50 text-amber-600 ring-1 ring-amber-200': t.priority === 'medium',
                    'bg-blue-50 text-blue-600 ring-1 ring-blue-200': t.priority === 'low'
                  }">
                  <span class="w-1.5 h-1.5 rounded-full"
                    :class="{
                      'bg-red-500': t.priority === 'critical',
                      'bg-orange-500': t.priority === 'high',
                      'bg-amber-500': t.priority === 'medium',
                      'bg-blue-500': t.priority === 'low'
                    }"></span>
                  {{ priorityMap[t.priority] || '—' }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs text-gray-500">
                <span v-if="t.assignedTo" class="flex items-center gap-1.5">
                  <div class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <i class="fas fa-hard-hat text-primary" style="font-size:8px"></i>
                  </div>
                  {{ t.assignedTo.name }}
                </span>
                <span v-else class="text-gray-300">—</span>
              </td>
              <td class="px-5 py-3.5">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-orange-50 text-orange-600': t.status === 'open',
                    'bg-blue-50 text-blue-600': t.status === 'in-progress',
                    'bg-emerald-50 text-emerald-600': t.status === 'resolved',
                    'bg-gray-100 text-gray-500': t.status === 'closed'
                  }">
                  <i class="text-xs" :class="{
                    'fas fa-folder-open': t.status === 'open',
                    'fas fa-spinner': t.status === 'in-progress',
                    'fas fa-check-circle': t.status === 'resolved',
                    'fas fa-lock': t.status === 'closed'
                  }"></i>
                  {{ statusMap[t.status] || '—' }}
                </span>
              </td>
              <td class="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">{{ formatDate(t.createdAt) }}</td>
              <td class="px-5 py-3.5">
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="openEdit(t)"
                    class="w-7 h-7 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition"
                    title=" تعديل">
                    <i class="fas fa-edit text-xs"></i>
                  </button>
                  <button @click="remove(t.id)"
                    class="w-7 h-7 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition"
                    title="حذف">
                    <i class="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Bar -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <!-- Page navigation -->
        <div class="flex items-center gap-1">
          <button @click="goToPage(1)" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs border transition"
            :class="currentPage === 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-500 border-gray-200 hover:bg-gray-50'">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs border transition"
            :class="currentPage === 1 ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-500 border-gray-200 hover:bg-gray-50'">
            <i class="fas fa-angle-right"></i>
          </button>

          <template v-for="p in visiblePages" :key="p">
            <span v-if="p === '...'" class="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">...</span>
            <button v-else @click="goToPage(p as number)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-xs border font-medium transition"
              :class="currentPage === p ? 'bg-support text-white border-support shadow-sm' : 'text-gray-600 border-gray-200 hover:bg-gray-50'">
              {{ p }}
            </button>
          </template>

          <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs border transition"
            :class="currentPage === totalPages ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-500 border-gray-200 hover:bg-gray-50'">
            <i class="fas fa-angle-left"></i>
          </button>
          <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-xs border transition"
            :class="currentPage === totalPages ? 'text-gray-300 border-gray-100 cursor-not-allowed' : 'text-gray-500 border-gray-200 hover:bg-gray-50'">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>

        <!-- Info + Page size -->
        <div class="flex items-center gap-3 text-xs text-gray-400">
          <span>{{ paginationInfo }}</span>
          <div class="flex items-center gap-1">
            <button v-for="size in pageSizes" :key="size" @click="setPageSize(size)"
              class="w-9 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
              :class="pageSize === size ? 'bg-support text-white border-support' : 'text-gray-500 border-gray-200 hover:bg-gray-50'">
              {{ size }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Context Menu -->
    <Teleport to="body">
      <div v-if="ctxMenu.show"
        class="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[200px]"
        :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }"
        @click.stop>
        <!-- Header -->
        <div class="px-4 py-2.5 border-b border-gray-50 mb-1">
          <p class="text-xs font-semibold text-secondary truncate">{{ ctxMenu.ticket?.subject }}</p>
          <p class="text-xs text-gray-400 mt-0.5">#{{ ctxMenu.ticket?.id }} · {{ ctxMenu.ticket?.subscriber?.name || 'بدون مشترك' }}</p>
        </div>

        <!-- عرض التفاصيل -->
        <button @click="ctxViewDetails"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-right">
          <div class="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-eye text-blue-500 text-xs"></i>
          </div>
          عرض التفاصيل
        </button>

        <!-- تغيير الحالة -->
        <div class="relative"
          @mouseenter="showSub('status')"
          @mouseleave="hideSub()">
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition text-right"
            :class="ctxSub === 'status' ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="ctxSub === 'status' ? 'bg-violet-100' : 'bg-violet-50'">
              <i class="fas fa-circle-dot text-violet-500 text-xs"></i>
            </div>
            <span class="flex-1">تغيير الحالة</span>
            <i class="fas fa-chevron-left text-xs" :class="ctxSub === 'status' ? 'text-violet-400' : 'text-gray-300'"></i>
          </button>
          <!-- Submenu -->
          <div v-show="ctxSub === 'status'"
            class="absolute top-0 right-full mr-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[180px] z-10"
            @mouseenter="showSub('status')"
            @mouseleave="hideSub()">
            <button v-for="s in statusCtxOptions" :key="s.value"
              @click="ctxChangeStatus(s.value)"
              class="w-full flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-gray-50 transition text-right"
              :class="ctxMenu.ticket?.status === s.value ? 'bg-gray-50 font-semibold' : ''">
              <span class="flex-shrink-0 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-medium" :class="s.badge">{{ s.label }}</span>
              <span class="flex-1 text-gray-500">{{ s.desc }}</span>
              <i v-if="ctxMenu.ticket?.status === s.value" class="fas fa-check text-support text-xs"></i>
            </button>
          </div>
        </div>

        <!-- تغيير الأولوية -->
        <div class="relative"
          @mouseenter="showSub('priority')"
          @mouseleave="hideSub()">
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition text-right"
            :class="ctxSub === 'priority' ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="ctxSub === 'priority' ? 'bg-amber-100' : 'bg-amber-50'">
              <i class="fas fa-flag text-amber-500 text-xs"></i>
            </div>
            <span class="flex-1">تغيير الأولوية</span>
            <i class="fas fa-chevron-left text-xs" :class="ctxSub === 'priority' ? 'text-amber-400' : 'text-gray-300'"></i>
          </button>
          <!-- Submenu -->
          <div v-show="ctxSub === 'priority'"
            class="absolute top-0 right-full mr-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[150px] z-10"
            @mouseenter="showSub('priority')"
            @mouseleave="hideSub()">
            <button v-for="p in priorityOptions" :key="p.value"
              @click="ctxChangePriority(p.value)"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition text-right"
              :class="ctxMenu.ticket?.priority === p.value ? 'bg-gray-50 font-semibold' : ''">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :class="p.dot"></span>
              <span class="flex-1" :class="p.color">{{ p.label }}</span>
              <i v-if="ctxMenu.ticket?.priority === p.value" class="fas fa-check text-support text-xs"></i>
            </button>
          </div>
        </div>

        <!-- الفني المسؤول -->
        <div class="relative"
          @mouseenter="showSub('tech')"
          @mouseleave="hideSub()">
          <button
            class="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition text-right"
            :class="ctxSub === 'tech' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="ctxSub === 'tech' ? 'bg-blue-100' : 'bg-primary/10'">
              <i class="fas fa-hard-hat text-primary text-xs"></i>
            </div>
            <span class="flex-1">الفني المسؤول</span>
            <i class="fas fa-chevron-left text-xs" :class="ctxSub === 'tech' ? 'text-blue-400' : 'text-gray-300'"></i>
          </button>
          <!-- Submenu -->
          <div v-show="ctxSub === 'tech'"
            class="absolute top-0 right-full mr-1 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 min-w-[180px] z-10 max-h-56 overflow-y-auto"
            @mouseenter="showSub('tech')"
            @mouseleave="hideSub()">
            <button @click="ctxAssignTech(null)"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition text-right"
              :class="!ctxMenu.ticket?.assignedTo ? 'bg-gray-50 font-semibold text-gray-600' : 'text-gray-400'">
              <span class="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-ban text-gray-300" style="font-size:8px"></i>
              </span>
              <span class="flex-1">بدون تعيين</span>
              <i v-if="!ctxMenu.ticket?.assignedTo" class="fas fa-check text-support text-xs"></i>
            </button>
            <div class="my-1 border-t border-gray-50"></div>
            <button v-for="e in employees" :key="e.id"
              @click="ctxAssignTech(e.id)"
              class="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-gray-50 transition text-right"
              :class="ctxMenu.ticket?.assignedTo?.id === e.id ? 'bg-gray-50 font-semibold' : ''">
              <div class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <i class="fas fa-user text-primary" style="font-size:8px"></i>
              </div>
              <span class="flex-1">{{ e.name }}</span>
              <i v-if="ctxMenu.ticket?.assignedTo?.id === e.id" class="fas fa-check text-support text-xs"></i>
            </button>
          </div>
        </div>

        <div class="my-1 border-t border-gray-50"></div>

        <!-- إرسال رسالة -->
        <button @click="openSendMessage"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-right">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <i class="fab fa-whatsapp text-emerald-500 text-xs"></i>
          </div>
          إرسال رسالة
        </button>

        <div class="my-1 border-t border-gray-50"></div>

        <!-- حذف -->
        <button @click="ctxDelete"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition text-right">
          <div class="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-trash text-red-400 text-xs"></i>
          </div>
          حذف التذكرة
        </button>
      </div>

      <!-- Overlay to close menu -->
      <div v-if="ctxMenu.show" class="fixed inset-0 z-[9998]" @click="closeCtxMenu" @contextmenu.prevent="closeCtxMenu"></div>
    </Teleport>

    <!-- Details Modal -->
    <div v-if="detailsModal.show" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="detailsModal.show = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-support/10 flex items-center justify-center">
              <i class="fas fa-ticket-alt text-support"></i>
            </div>
            <div>
              <h3 class="font-bold text-base text-secondary">تفاصيل التذكرة</h3>
              <p class="text-xs text-gray-400">#{{ detailsModal.ticket?.id }}</p>
            </div>
          </div>
          <button @click="detailsModal.show = false" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
        <div v-if="detailsModal.ticket" class="p-6 space-y-4">
          <div>
            <p class="text-xs text-gray-400 mb-1">الموضوع</p>
            <p class="font-semibold text-secondary">{{ detailsModal.ticket.subject }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">الوصف</p>
            <p class="text-sm text-gray-600 leading-relaxed">{{ detailsModal.ticket.description || '—' }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-400 mb-1">المشترك</p>
              <p class="text-sm font-medium text-secondary">{{ detailsModal.ticket.subscriber?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">الفني المسؤول</p>
              <p class="text-sm font-medium text-secondary">{{ detailsModal.ticket.assignedTo?.name || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">الأولوية</p>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold"
                :class="{
                  'bg-red-50 text-red-600': detailsModal.ticket.priority === 'critical',
                  'bg-orange-50 text-orange-600': detailsModal.ticket.priority === 'high',
                  'bg-amber-50 text-amber-600': detailsModal.ticket.priority === 'medium',
                  'bg-blue-50 text-blue-600': detailsModal.ticket.priority === 'low'
                }">
                {{ priorityMap[detailsModal.ticket.priority] || '—' }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">الحالة</p>
              <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-orange-50 text-orange-600': detailsModal.ticket.status === 'open',
                  'bg-blue-50 text-blue-600': detailsModal.ticket.status === 'in-progress',
                  'bg-emerald-50 text-emerald-600': detailsModal.ticket.status === 'resolved',
                  'bg-gray-100 text-gray-500': detailsModal.ticket.status === 'closed'
                }">
                {{ statusMap[detailsModal.ticket.status] || '—' }}
              </span>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">النوع</p>
              <p class="text-sm text-gray-600">{{ typeMap[detailsModal.ticket.type] || '—' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">تاريخ الفتح</p>
              <p class="text-sm text-gray-600">{{ formatDate(detailsModal.ticket.createdAt) }}</p>
            </div>
          </div>
          <div v-if="detailsModal.ticket.notes">
            <p class="text-xs text-gray-400 mb-1">ملاحظات</p>
            <p class="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{{ detailsModal.ticket.notes }}</p>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button @click="detailsModal.show = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إغلاق</button>
          <button @click="openEdit(detailsModal.ticket); detailsModal.show = false"
            class="px-5 py-2 bg-support text-white text-sm rounded-xl font-medium hover:opacity-90 transition">
            <i class="fas fa-edit ml-1"></i> تعديل
          </button>
        </div>
      </div>
    </div>

    <!-- Send Message Modal -->
    <transition name="modal">
      <div v-if="showSendMessageModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="!messageSending && (showSendMessageModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="fab fa-whatsapp text-green-500 text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">إرسال رسالة واتساب</h3>
                <p class="text-xs text-gray-400">{{ msgTarget?.subscriber?.name || '—' }} — {{ msgTarget?.subscriber?.phone || '—' }}</p>
              </div>
            </div>
            <button @click="showSendMessageModal = false" :disabled="messageSending"
              class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Ticket info badge -->
            <div class="flex items-center gap-2 bg-support/5 border border-support/20 rounded-xl px-4 py-2.5 text-xs text-support">
              <i class="fas fa-ticket-alt"></i>
              <span>تذكرة #{{ msgTarget?.id }} — {{ msgTarget?.subject }}</span>
            </div>

            <!-- Quick Templates -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-2">قوالب سريعة</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="tpl in msgTemplates" :key="tpl.label"
                  @click="applyMsgTemplate(tpl)"
                  class="text-[11px] px-3 py-1.5 bg-gray-100 hover:bg-green-50 hover:text-green-700 hover:border-green-200 border border-transparent text-gray-600 rounded-lg transition">
                  <i :class="tpl.icon" class="ml-1"></i>{{ tpl.label }}
                </button>
              </div>
            </div>

            <!-- Message Text -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">نص الرسالة</label>
              <textarea v-model="messageForm.text" rows="5"
                placeholder="اكتب رسالتك هنا... يمكنك استخدام {الاسم} و{الرقم} و{الموضوع}"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support resize-none"></textarea>
              <p class="text-[11px] text-gray-400 mt-1">المتغيرات: <span class="font-mono bg-gray-100 px-1 rounded">{الاسم}</span> <span class="font-mono bg-gray-100 px-1 rounded">{الرقم}</span> <span class="font-mono bg-gray-100 px-1 rounded">{الموضوع}</span></p>
            </div>

            <!-- WhatsApp status warning -->
            <div v-if="!whatsappConnected" class="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3">
              <i class="fas fa-exclamation-triangle"></i>
              واتساب غير متصل — سيتم فتح wa.me كبديل
            </div>
          </div>

          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showSendMessageModal = false" :disabled="messageSending"
              class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition disabled:opacity-40">إلغاء</button>
            <button @click="sendMessage" :disabled="messageSending || !messageForm.text.trim()"
              class="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i v-if="messageSending" class="fas fa-spinner fa-spin text-sm"></i>
              <i v-else class="fab fa-whatsapp text-sm"></i>
              {{ messageSending ? 'جاري الإرسال...' : 'إرسال' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-support/10 flex items-center justify-center">
              <i class="fas fa-ticket-alt text-support"></i>
            </div>
            <h3 class="font-bold text-base text-secondary">{{ editingId ? ' تعديل التذكرة' : 'تذكرة دعم جديدة' }}</h3>
          </div>
          <button @click="showModal = false" class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">الموضوع <span class="text-red-400">*</span></label>
            <input v-model="form.subject"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition"
              placeholder="وصف مختصر للمشكلة" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">الوصف <span class="text-red-400">*</span></label>
            <textarea v-model="form.description" rows="3"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition resize-none"
              placeholder="تفاصيل المشكلة..."></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">نوع المشكلة</label>
              <select v-model="form.type" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition bg-white">
                <option value="internet">🌐 انترنت</option>
                <option value="hardware">🖥️ أجهزة</option>
                <option value="billing">💳 فواتير</option>
                <option value="account">👤 حساب</option>
                <option value="other">📌 أخرى</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">الأولوية</label>
              <select v-model="form.priority" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition bg-white">
                <option value="low">🔵 عادي</option>
                <option value="medium">🟡 متوسط</option>
                <option value="high">🟠 عاجل</option>
                <option value="critical">🔴 حرج</option>
              </select>
            </div>
          </div>

          <div v-if="editingId">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">الحالة</label>
            <div class="grid grid-cols-4 gap-2">
              <button v-for="st in statusOptions" :key="st.value" @click="form.status = st.value"
                class="py-2 px-2 rounded-xl border text-xs font-medium transition text-center"
                :class="form.status === st.value ? st.activeClass : 'border-gray-200 text-gray-400 hover:border-gray-300'">
                <i :class="st.icon + ' block mb-1'"></i>
                {{ st.label }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">المشترك</label>
              <div class="relative">
                <input
                  type="text"
                  v-model="subscriberSearch"
                  @focus="showSubscriberDropdown = true"
                  @blur="hideSubscriberDropdown"
                  placeholder="ابحث بالاسم أو الهاتف..."
                  class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition"
                />
                <div v-if="showSubscriberDropdown" class="absolute z-10 mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 max-h-60 overflow-y-auto">
                  <div
                    v-for="s in filteredSubscribers"
                    :key="s.id"
                    @mousedown.prevent="selectSubscriber(s)"
                    class="px-4 py-2.5 text-sm cursor-pointer hover:bg-support/10"
                    :class="{ 'bg-support/10': form.subscriberId === s.id }"
                  >
                    <p class="font-medium text-gray-800">{{ s.name }}</p>
                    <p class="text-xs text-gray-400">{{ s.phone }}</p>
                  </div>
                  <div v-if="filteredSubscribers.length === 0" class="px-4 py-3 text-sm text-gray-400 text-center">
                    لا توجد نتائج
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">الفني المسؤول</label>
              <select v-model="form.assignedToId" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition bg-white">
                <option :value="null">— اختر فني —</option>
                <option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">ملاحظات</label>
            <textarea v-model="form.notes" rows="2"
              class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-support/30 focus:border-support transition resize-none"
              placeholder="ملاحظات إضافية..."></textarea>
          </div>

          <div v-if="errorMsg" class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMsg }}
          </div>
        </div>

        <div class="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
          <button @click="showModal = false" class="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition">إلغاء</button>
          <button @click="save" :disabled="saving"
            class="px-6 py-2 bg-support text-white text-sm rounded-xl font-medium transition shadow-sm hover:opacity-90 disabled:opacity-60 flex items-center gap-2">
            <i v-if="saving" class="fas fa-circle-notch fa-spin"></i>
            {{ saving ? 'جاري الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إنشاء التذكرة') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';

const ticketsData = ref<any[]>([]);
const subscribers = ref<any[]>([]);
const employees = ref<any[]>([]);
const selectedStatus = ref('all');
const selectedPriority = ref('');
const selectedType = ref('');
const searchQuery = ref('');
const showModal = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const loading = ref(true);
const errorMsg = ref('');
const currentPage = ref(1);
const pageSize = ref(10);
const pageSizes = [5, 10, 50, 100, 500];

const defaultForm = () => ({
  subject: '',
  description: '',
  priority: 'medium',
  status: 'open',
  type: 'internet',
  subscriberId: null as number | null,
  assignedToId: null as number | null,
  notes: '',
});
const form = ref(defaultForm());

// ── Context Menu ─────────────────────────────────────────
const ctxMenu = ref({ show: false, x: 0, y: 0, ticket: null as any });
const ctxSub = ref('');
const detailsModal = ref({ show: false, ticket: null as any });
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
let subTimer: ReturnType<typeof setTimeout> | null = null;

// Send Message
const showSendMessageModal = ref(false);
const messageSending = ref(false);
const whatsappConnected = ref(false);
const messageForm = ref({ text: '' });
const msgTarget = ref<any>(null);
const msgTemplates = [
  { label: 'استلام التذكرة',   icon: 'fas fa-ticket-alt',       text: 'عزيزي {الاسم}، تم استلام تذكرة الدعم رقم #{الرقم} بخصوص "{الموضوع}". سيتواصل معك فريقنا قريباً.' },
  { label: 'قيد المعالجة',     icon: 'fas fa-tools',            text: 'عزيزي {الاسم}، يعمل فريقنا حالياً على معالجة طلبك رقم #{الرقم}. سنُبلغك عند الانتهاء.' },
  { label: 'تم الحل',          icon: 'fas fa-check-circle',     text: 'عزيزي {الاسم}، يسعدنا إبلاغكم بأنه تم حل مشكلة تذكرة الدعم رقم #{الرقم}. نرجو أن تكون الخدمة عادت بشكل طبيعي.' },
  { label: 'طلب معلومات',      icon: 'fas fa-info-circle',      text: 'عزيزي {الاسم}، بخصوص تذكرتك رقم #{الرقم}، نحتاج منك بعض المعلومات الإضافية لنتمكن من المساعدة. يرجى التواصل معنا.' },
  { label: 'موعد الزيارة',     icon: 'fas fa-calendar-check',   text: 'عزيزي {الاسم}، تم تحديد موعد لزيارة فني لإصلاح خدمتكم. يرجى التواجد في المنزل خلال الموعد المحدد.' },
];

function showSub(name: string) {
  if (subTimer) { clearTimeout(subTimer); subTimer = null; }
  ctxSub.value = name;
}
function hideSub() {
  subTimer = setTimeout(() => { ctxSub.value = ''; subTimer = null; }, 150);
}

const priorityOptions = [
  { value: 'critical', label: 'حرج',   dot: 'bg-red-500',    color: 'text-red-600' },
  { value: 'high',     label: 'عاجل',  dot: 'bg-orange-500', color: 'text-orange-600' },
  { value: 'medium',   label: 'متوسط', dot: 'bg-amber-500',  color: 'text-amber-600' },
  { value: 'low',      label: 'عادي',  dot: 'bg-blue-500',   color: 'text-blue-600' },
];

const statusCtxOptions = [
  { value: 'open',        label: 'مفتوح',        badge: 'bg-blue-100 text-blue-700',    desc: 'تذكرة جديدة لم تُعالج بعد' },
  { value: 'in-progress', label: 'قيد المعالجة', badge: 'bg-amber-100 text-amber-700',  desc: 'يعمل الفني على حلها' },
  { value: 'resolved',    label: 'تم الحل',      badge: 'bg-green-100 text-green-700',  desc: 'تم حل المشكلة بنجاح' },
  { value: 'closed',      label: 'مغلقة',        badge: 'bg-gray-100 text-gray-500',    desc: 'أُغلقت ولا تقبل تعديلاً' },
];

function openCtxMenu(event: MouseEvent, ticket: any) {
  const margin = 8;
  let x = event.clientX;
  let y = event.clientY;
  // Keep within viewport
  if (x + 220 > window.innerWidth) x = window.innerWidth - 220 - margin;
  if (y + 360 > window.innerHeight) y = window.innerHeight - 360 - margin;
  ctxMenu.value = { show: true, x, y, ticket };
}

function closeCtxMenu() {
  ctxMenu.value.show = false;
  ctxSub.value = '';
  if (subTimer) { clearTimeout(subTimer); subTimer = null; }
}

function onTouchStart(event: TouchEvent, ticket: any) {
  longPressTimer = setTimeout(() => {
    const t = event.touches[0];
    openCtxMenu({ clientX: t.clientX, clientY: t.clientY } as MouseEvent, ticket);
  }, 600);
}

function onTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

function ctxViewDetails() {
  detailsModal.value = { show: true, ticket: ctxMenu.value.ticket };
  closeCtxMenu();
}

async function ctxChangePriority(priority: string) {
  const t = ctxMenu.value.ticket;
  closeCtxMenu();
  try {
    await api.patch(`/tickets/${t.id}`, { priority });
    await loadData();
  } catch { alert('تعذّر تغيير الأولوية'); }
}

async function ctxChangeStatus(status: string) {
  const t = ctxMenu.value.ticket;
  closeCtxMenu();
  try {
    await api.patch(`/tickets/${t.id}`, { status });
    await loadData();
  } catch { alert('تعذّر تغيير الحالة'); }
}

async function ctxAssignTech(assignedToId: number | null) {
  const t = ctxMenu.value.ticket;
  closeCtxMenu();
  try {
    const payload: any = {};
    if (assignedToId) payload.assignedToId = assignedToId;
    else payload.assignedToId = null;
    await api.patch(`/tickets/${t.id}`, payload);
    await loadData();
  } catch { alert('تعذّر تعيين الفني'); }
}

function ctxSendMessage() {}

async function openSendMessage() {
  const t = ctxMenu.value.ticket;
  if (!t.subscriber?.phone) {
    closeCtxMenu();
    alert('لا يوجد رقم هاتف للمشترك');
    return;
  }
  closeCtxMenu();
  msgTarget.value = t;
  messageForm.value = { text: '' };
  await checkWhatsappStatus();
  showSendMessageModal.value = true;
}

async function checkWhatsappStatus() {
  try {
    const res = await api.get('/whatsapp/status');
    whatsappConnected.value = res.data?.connected === true;
  } catch { whatsappConnected.value = false; }
}

function applyMsgTemplate(tpl: { label: string; icon: string; text: string }) {
  const t = msgTarget.value;
  messageForm.value.text = tpl.text
    .replace(/{الاسم}/g, t?.subscriber?.name || '')
    .replace(/{الرقم}/g, t?.id || '')
    .replace(/{الموضوع}/g, t?.subject || '');
}

async function sendMessage() {
  if (!messageForm.value.text.trim()) return;
  const t = msgTarget.value;
  const phone = t?.subscriber?.phone?.replace(/\D/g, '');
  if (!phone) return;

  if (whatsappConnected.value) {
    messageSending.value = true;
    try {
      const res = await api.post('/whatsapp/send-direct', { phone, message: messageForm.value.text });
      if (res.data?.success) {
        showSendMessageModal.value = false;
        alert('تم إرسال الرسالة عبر واتساب بنجاح ✅');
      } else {
        alert('فشل الإرسال: ' + (res.data?.message || ''));
      }
    } catch { alert('حدث خطأ أثناء الإرسال'); }
    finally { messageSending.value = false; }
  } else {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageForm.value.text)}`, '_blank');
    showSendMessageModal.value = false;
  }
}

async function ctxDelete() {
  const t = ctxMenu.value.ticket;
  closeCtxMenu();
  if (!confirm(`هل أنت متأكد من حذف التذكرة #${t.id}؟`)) return;
  try {
    await api.delete(`/tickets/${t.id}`);
    await loadData();
  } catch { alert('تعذّر حذف التذكرة'); }
}

onUnmounted(() => { if (longPressTimer) clearTimeout(longPressTimer); });
// ─────────────────────────────────────────────────────────

const priorityMap: Record<string, string> = { low: 'عادي', medium: 'متوسط', high: 'عاجل', critical: 'حرج' };
const statusMap: Record<string, string> = { open: 'مفتوحة', 'in-progress': 'قيد المعالجة', resolved: 'تم الحل', closed: 'مغلقة' };
const typeMap: Record<string, string> = { internet: 'انترنت', hardware: 'أجهزة', billing: 'فواتير', account: 'حساب', other: 'أخرى' };
const typeIcons: Record<string, string> = { internet: 'fas fa-wifi', hardware: 'fas fa-desktop', billing: 'fas fa-credit-card', account: 'fas fa-user-circle', other: 'fas fa-tag' };

const statusOptions = [
  { value: 'open', label: 'مفتوحة', icon: 'fas fa-folder-open', activeClass: 'border-orange-300 bg-orange-50 text-orange-600' },
  { value: 'in-progress', label: 'معالجة', icon: 'fas fa-spinner', activeClass: 'border-blue-300 bg-blue-50 text-blue-600' },
  { value: 'resolved', label: 'تم الحل', icon: 'fas fa-check-circle', activeClass: 'border-emerald-300 bg-emerald-50 text-emerald-600' },
  { value: 'closed', label: 'مغلقة', icon: 'fas fa-lock', activeClass: 'border-gray-300 bg-gray-100 text-gray-600' },
];

const statusFilters = computed(() => {
  const d = ticketsData.value;
  return [
    { value: 'all', label: 'الكل', count: d.length, icon: 'fas fa-list' },
    { value: 'open', label: 'مفتوحة', count: d.filter(t => t.status === 'open').length, icon: 'fas fa-folder-open' },
    { value: 'in-progress', label: 'قيد المعالجة', count: d.filter(t => t.status === 'in-progress').length, icon: 'fas fa-spinner' },
    { value: 'resolved', label: 'تم الحل', count: d.filter(t => t.status === 'resolved').length, icon: 'fas fa-check-circle' },
    { value: 'closed', label: 'مغلقة', count: d.filter(t => t.status === 'closed').length, icon: 'fas fa-lock' },
  ];
});

const hasActiveFilters = computed(() =>
  selectedStatus.value !== 'all' || selectedPriority.value || selectedType.value || searchQuery.value.trim()
);

const filteredTickets = computed(() => {
  let list = ticketsData.value;
  if (selectedStatus.value !== 'all') list = list.filter(t => t.status === selectedStatus.value);
  if (selectedPriority.value) list = list.filter(t => t.priority === selectedPriority.value);
  if (selectedType.value) list = list.filter(t => t.type === selectedType.value);
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase();
    list = list.filter(t =>
      t.subject?.toLowerCase().includes(q) ||
      t.subscriber?.name?.toLowerCase().includes(q) ||
      t.assignedTo?.name?.toLowerCase().includes(q)
    );
  }
  return list;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredTickets.value.length / pageSize.value)));

const paginatedTickets = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredTickets.value.slice(start, start + pageSize.value);
});

const paginationInfo = computed(() => {
  const total = filteredTickets.value.length;
  if (total === 0) return 'لا توجد نتائج';
  const start = (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(currentPage.value * pageSize.value, total);
  return `${start}–${end} من ${total}`;
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push('...');
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) pages.push(p);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

function goToPage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  currentPage.value = p;
}

function setPageSize(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
}

function clearFilters() {
  selectedStatus.value = 'all';
  selectedPriority.value = '';
  selectedType.value = '';
  searchQuery.value = '';
  currentPage.value = 1;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

async function loadData() {
  try {
    const [tickRes, subRes, empRes] = await Promise.all([
      api.get('/tickets'),
      api.get('/subscribers'),
      api.get('/employees'),
    ]);
    ticketsData.value = tickRes.data;
    subscribers.value = subRes.data;
    employees.value = empRes.data;
  } finally {
    loading.value = false;
  }
}

function openAdd() {
  editingId.value = null;
  form.value = defaultForm();
  subscriberSearch.value = '';
  errorMsg.value = '';
  showModal.value = true;
}

function openEdit(t: any) {
  editingId.value = t.id;
  form.value = {
    subject: t.subject || '',
    description: t.description || '',
    priority: t.priority || 'medium',
    status: t.status || 'open',
    type: t.type || 'other',
    subscriberId: t.subscriber?.id ?? null,
    assignedToId: t.assignedTo?.id ?? null,
    notes: t.notes || '',
  };
  const selected = subscribers.value.find(s => s.id === t.subscriber?.id);
  subscriberSearch.value = selected ? selected.name : '';
  errorMsg.value = '';
  showModal.value = true;
}

async function save() {
  errorMsg.value = '';
  if (!form.value.subject.trim()) { errorMsg.value = 'الموضوع مطلوب'; return; }
  if (!form.value.description.trim()) { errorMsg.value = 'الوصف مطلوب'; return; }
  saving.value = true;
  try {
    const payload: any = { ...form.value };
    if (!payload.subscriberId) delete payload.subscriberId;
    if (!payload.assignedToId) delete payload.assignedToId;
    if (editingId.value) {
      await api.patch(`/tickets/${editingId.value}`, payload);
    } else {
      await api.post('/tickets', payload);
    }
    showModal.value = false;
    await loadData();
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.message || 'حدث خطأ، يرجى المحاولة مجدداً';
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذه التذكرة؟')) return;
  try {
    await api.delete(`/tickets/${id}`);
    await loadData();
  } catch {
    alert('تعذّر حذف التذكرة');
  }
}

onMounted(loadData);
</script>

