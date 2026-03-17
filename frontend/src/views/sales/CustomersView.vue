<template>
  <div class="flex flex-col gap-4" dir="rtl">

    <!-- ══ Stats Cards ══ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" :class="stat.bg">
          <i :class="['fas', stat.icon, 'text-base', stat.color]"></i>
        </div>
        <div>
          <p class="text-xs text-gray-400 font-medium">{{ stat.label }}</p>
          <p class="text-lg font-black" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- ══ Main Panel ══ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- ─ Toolbar ─ -->
      <div class="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
            <i class="fas fa-users text-teal-600 text-sm"></i>
          </div>
          <div>
            <h2 class="font-black text-secondary text-sm">عملاء المبيعات</h2>
            <p class="text-[11px] text-gray-400">{{ filtered.length }} عميل</p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 flex-1 sm:max-w-xl items-center">
          <!-- Search -->
          <div class="relative flex-1 min-w-[180px]">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input v-model="searchQ" placeholder="بحث بالاسم أو الهاتف..."
              class="w-full pr-8 pl-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-50 focus:bg-white transition" />
            <button v-if="searchQ" @click="searchQ = ''" class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
          <!-- Add button -->
          <button @click="openAdd"
            class="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition shadow-sm">
            <i class="fas fa-plus"></i> إضافة عميل
          </button>
        </div>
      </div>

      <!-- ─ Table ─ -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-teal-600 text-white text-xs">
              <th class="px-4 py-3 text-center w-10">#</th>
              <th class="px-4 py-3 text-right cursor-pointer select-none" @click="setSort('name')">
                العميل <i :class="sortIcon('name')"></i>
              </th>
              <th class="px-4 py-3 text-center">الهاتف</th>
              <th class="px-4 py-3 text-right">العنوان</th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('invoiceCount')">
                الفواتير <i :class="sortIcon('invoiceCount')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('totalSales')">
                إجمالي المشتريات <i :class="sortIcon('totalSales')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('totalDebt')">
                الرصيد المتبقي <i :class="sortIcon('totalDebt')"></i>
              </th>
              <th class="px-4 py-3 text-center cursor-pointer select-none" @click="setSort('createdAt')">
                تاريخ الإضافة <i :class="sortIcon('createdAt')"></i>
              </th>
              <th class="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="py-12 text-center text-gray-300">
                <i class="fas fa-spinner fa-spin text-2xl mb-2 block text-teal-400"></i>
                <p class="text-xs">جاري التحميل...</p>
              </td>
            </tr>
            <tr v-else-if="paginated.length === 0">
              <td colspan="9" class="py-12 text-center text-gray-300">
                <i class="fas fa-users text-3xl mb-2 block"></i>
                <p class="text-xs">لا يوجد عملاء</p>
              </td>
            </tr>
            <tr v-for="(c, i) in paginated" :key="c.id"
              class="border-b border-gray-50 hover:bg-teal-50/40 transition group cursor-pointer select-none"
              @contextmenu.prevent="openCtx($event, c)"
              @touchstart.passive="onTouchStart($event, c)"
              @touchend="onTouchEnd"
              @touchcancel="onTouchEnd"
              @touchmove="onTouchEnd">
              <!-- # -->
              <td class="px-4 py-3 text-center text-[11px] text-gray-300 font-mono">
                {{ (page - 1) * perPage + i + 1 }}
              </td>
              <!-- Name -->
              <td class="px-4 py-3">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 flex-shrink-0 text-xs font-black">
                    {{ c.name[0] }}
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-secondary">{{ c.name }}</p>
                    <p v-if="c.notes" class="text-[10px] text-gray-400 truncate max-w-[140px]">{{ c.notes }}</p>
                  </div>
                </div>
              </td>
              <!-- Phone -->
              <td class="px-4 py-3 text-center">
                <span v-if="c.phone" class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{{ c.phone }}</span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>
              <!-- Address -->
              <td class="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                {{ c.address || '—' }}
              </td>
              <!-- Invoice count -->
              <td class="px-4 py-3 text-center">
                <span class="text-xs bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5 font-bold">
                  {{ c.invoiceCount }} فاتورة
                </span>
              </td>
              <!-- Total sales -->
              <td class="px-4 py-3 text-center">
                <p class="text-sm font-black text-teal-700">{{ Number(c.totalSales).toLocaleString() }}</p>
                <p class="text-[10px] text-gray-400">د.ع</p>
              </td>
              <!-- Debt -->
              <td class="px-4 py-3 text-center">
                <span v-if="c.totalDebt > 0"
                  class="text-xs font-bold px-2 py-1 rounded-lg bg-red-100 text-red-600">
                  {{ Number(c.totalDebt).toLocaleString() }} د.ع
                </span>
                <span v-else class="text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-lg">
                  <i class="fas fa-check text-[9px] ml-0.5"></i> مسدد
                </span>
              </td>
              <!-- Date -->
              <td class="px-4 py-3 text-center text-xs text-gray-400">
                {{ formatDate(c.createdAt) }}
              </td>
              <!-- Actions -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <!-- Use in POS -->
                  <button @click.stop="useInPOS(c)" title="استخدام في نقطة البيع"
                    class="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition">
                    <i class="fas fa-cash-register text-[10px]"></i>
                  </button>
                  <!-- Edit -->
                  <button @click.stop="openEdit(c)" title="تعديل"
                    class="w-7 h-7 rounded-lg bg-teal-50 text-teal-500 hover:bg-teal-100 flex items-center justify-center transition">
                    <i class="fas fa-pen text-[10px]"></i>
                  </button>
                  <!-- Context menu trigger -->
                  <button @click.stop="openCtx($event, c)" title="المزيد"
                    class="w-7 h-7 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition">
                    <i class="fas fa-ellipsis-v text-[10px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ─ Pagination ─ -->
      <div class="px-5 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-400">
            عرض {{ Math.min((page - 1) * perPage + 1, filtered.length) }}–{{ Math.min(page * perPage, filtered.length) }} من {{ filtered.length }}
          </span>
          <select v-model.number="perPage" @change="page = 1"
            class="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none">
            <option :value="10">10 / صفحة</option>
            <option :value="25">25 / صفحة</option>
            <option :value="50">50 / صفحة</option>
          </select>
        </div>
        <div class="flex items-center gap-1">
          <button @click="page = 1" :disabled="page === 1"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-double-right"></i>
          </button>
          <button @click="page--" :disabled="page === 1"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-right"></i>
          </button>
          <template v-for="p in pageRange" :key="p">
            <button v-if="p !== '...'" @click="page = p as number"
              class="w-7 h-7 rounded-lg text-xs font-bold transition"
              :class="page === p ? 'bg-teal-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-100'">
              {{ p }}
            </button>
            <span v-else class="w-7 text-center text-gray-300 text-xs">…</span>
          </template>
          <button @click="page++" :disabled="page === totalPages"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-left"></i>
          </button>
          <button @click="page = totalPages" :disabled="page === totalPages"
            class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition text-xs">
            <i class="fas fa-angle-double-left"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ══ Add / Edit Modal ══ -->
    <transition name="modal">
      <div v-if="formModal.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="formModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" dir="rtl">
          <!-- Header -->
          <div class="bg-gradient-to-l from-teal-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i :class="formModal.isEdit ? 'fas fa-pen' : 'fas fa-user-plus'"></i>
              {{ formModal.isEdit ? 'تعديل بيانات العميل' : 'إضافة عميل جديد' }}
            </h3>
            <button @click="formModal.visible = false" class="text-white/70 hover:text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <form @submit.prevent="submitForm" class="p-6 space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-user ml-1 text-teal-500"></i> اسم العميل *
              </label>
              <input v-model="form.name" placeholder="أدخل اسم العميل" required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Phone -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-phone ml-1 text-teal-500"></i> رقم الهاتف
              </label>
              <input v-model="form.phone" placeholder="07xxxxxxxx" type="tel" dir="ltr"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Address -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-map-marker-alt ml-1 text-teal-500"></i> العنوان
              </label>
              <input v-model="form.address" placeholder="المحلة، الشارع..."
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition" />
            </div>
            <!-- Notes -->
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">
                <i class="fas fa-sticky-note ml-1 text-teal-500"></i> ملاحظات
              </label>
              <textarea v-model="form.notes" placeholder="ملاحظات إضافية..." rows="2"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"></textarea>
            </div>
            <!-- Actions -->
            <div class="flex gap-3 pt-1">
              <button type="button" @click="formModal.visible = false"
                class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
                إلغاء
              </button>
              <button type="submit" :disabled="saving"
                class="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                <i v-else :class="formModal.isEdit ? 'fas fa-save' : 'fas fa-plus'"></i>
                {{ formModal.isEdit ? 'حفظ التعديلات' : 'إضافة العميل' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- ══ Confirm Delete Modal ══ -->
    <transition name="modal">
      <div v-if="confirmModal.visible"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="confirmModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
          <div class="px-6 pt-6 pb-4 flex flex-col items-center text-center gap-3">
            <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <i class="fas fa-trash-alt text-2xl text-red-500"></i>
            </div>
            <div>
              <h3 class="text-base font-black text-secondary">حذف العميل</h3>
              <p class="text-xs text-gray-400 mt-1 leading-relaxed">
                هل أنت متأكد من حذف العميل <strong class="text-secondary">{{ confirmModal.customerName }}</strong>؟<br/>
                لن يتم حذف فواتيره السابقة.
              </p>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-3">
            <button @click="confirmModal.visible = false"
              class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
              إلغاء
            </button>
            <button @click="confirmDelete"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition">
              <i class="fas fa-trash-alt ml-1"></i> حذف
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold"
        :class="toastType === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'">
        <i :class="toastType === 'error' ? 'fas fa-times-circle text-lg' : 'fas fa-check-circle text-lg'"></i>
        {{ toastMsg }}
      </div>
    </transition>

    <!-- ══ Context Menu ══ -->
    <transition name="ctx">
      <div v-if="ctx.visible" ref="ctxMenu"
        :style="{ top: ctx.y + 'px', left: ctx.x + 'px' }"
        class="fixed z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-52 overflow-hidden"
        @mouseleave="closeCtx">

        <!-- Customer header -->
        <div class="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2.5 mb-1">
          <div class="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-black flex-shrink-0">
            {{ ctx.customer?.name?.[0] }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold text-gray-700 truncate">{{ ctx.customer?.name }}</p>
            <p class="text-[10px] text-gray-400">{{ ctx.customer?.phone || 'بدون هاتف' }}</p>
          </div>
        </div>

        <button @click="ctxAction('details')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-id-card text-[11px]"></i>
          </span>
          عرض التفاصيل
        </button>

        <button @click="ctxAction('edit')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-pen text-[11px]"></i>
          </span>
          تعديل البيانات
        </button>

        <div class="mx-3 my-1 border-t border-gray-100"></div>

        <button @click="ctxAction('pay')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-hand-holding-usd text-[11px]"></i>
          </span>
          تسديد دين
          <span v-if="ctx.customer?.totalDebt > 0"
            class="mr-auto text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-lg">
            {{ Number(ctx.customer?.totalDebt).toLocaleString() }}
          </span>
        </button>

        <button @click="ctxAction('charge')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-plus-circle text-[11px]"></i>
          </span>
          إضافة دين
        </button>

        <div class="mx-3 my-1 border-t border-gray-100"></div>

        <button @click="ctxAction('receipt')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-violet-50 hover:text-violet-700 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-file-invoice text-[11px]"></i>
          </span>
          طباعة سند قبض
        </button>

        <div class="mx-3 my-1 border-t border-gray-100"></div>

        <button @click="ctxAction('delete')"
          class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition text-right">
          <span class="w-7 h-7 rounded-xl bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
            <i class="fas fa-trash-alt text-[11px]"></i>
          </span>
          حذف العميل
        </button>
      </div>
    </transition>

    <!-- Ctx backdrop -->
    <div v-if="ctx.visible" class="fixed inset-0 z-[199]" @click="closeCtx" @contextmenu.prevent="closeCtx"></div>

    <!-- ══ Details Modal ══ -->
    <transition name="modal">
      <div v-if="detailsModal.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="detailsModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" dir="rtl">
          <div class="bg-gradient-to-l from-teal-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-lg">
                {{ detailsModal.customer?.name?.[0] }}
              </div>
              <div>
                <h3 class="font-black text-white text-sm">{{ detailsModal.customer?.name }}</h3>
                <p class="text-teal-100 text-xs">{{ detailsModal.customer?.phone || 'بدون هاتف' }}</p>
              </div>
            </div>
            <button @click="detailsModal.visible = false" class="text-white/70 hover:text-white">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="p-6 space-y-5">
            <!-- Stats row -->
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-indigo-50 rounded-xl p-3 text-center">
                <p class="text-xl font-black text-indigo-700">{{ detailsModal.customer?.invoiceCount }}</p>
                <p class="text-[10px] text-indigo-400 font-semibold">فاتورة</p>
              </div>
              <div class="bg-teal-50 rounded-xl p-3 text-center">
                <p class="text-lg font-black text-teal-700">{{ Number(detailsModal.customer?.totalSales || 0).toLocaleString() }}</p>
                <p class="text-[10px] text-teal-400 font-semibold">إجمالي د.ع</p>
              </div>
              <div :class="detailsModal.customer?.totalDebt > 0 ? 'bg-red-50' : 'bg-emerald-50'" class="rounded-xl p-3 text-center">
                <p class="text-lg font-black" :class="detailsModal.customer?.totalDebt > 0 ? 'text-red-600' : 'text-emerald-600'">
                  {{ detailsModal.customer?.totalDebt > 0 ? Number(detailsModal.customer?.totalDebt).toLocaleString() : '✓' }}
                </p>
                <p class="text-[10px] font-semibold" :class="detailsModal.customer?.totalDebt > 0 ? 'text-red-400' : 'text-emerald-400'">
                  {{ detailsModal.customer?.totalDebt > 0 ? 'دين د.ع' : 'مسدد' }}
                </p>
              </div>
            </div>

            <!-- Info -->
            <div class="space-y-2.5">
              <div v-if="detailsModal.customer?.address" class="flex items-start gap-3 text-sm">
                <i class="fas fa-map-marker-alt text-teal-400 mt-0.5 w-4 text-center flex-shrink-0"></i>
                <span class="text-gray-600">{{ detailsModal.customer?.address }}</span>
              </div>
              <div v-if="detailsModal.customer?.notes" class="flex items-start gap-3 text-sm">
                <i class="fas fa-sticky-note text-amber-400 mt-0.5 w-4 text-center flex-shrink-0"></i>
                <span class="text-gray-500 italic">{{ detailsModal.customer?.notes }}</span>
              </div>
              <div class="flex items-center gap-3 text-sm">
                <i class="fas fa-calendar-alt text-gray-300 w-4 text-center flex-shrink-0"></i>
                <span class="text-gray-400">تاريخ الإضافة: {{ formatDate(detailsModal.customer?.createdAt) }}</span>
              </div>
            </div>

            <!-- Recent invoices -->
            <div v-if="detailsModal.invoices.length">
              <p class="text-xs font-bold text-gray-500 mb-2"><i class="fas fa-file-invoice ml-1 text-indigo-400"></i>آخر الفواتير</p>
              <div class="space-y-1.5 max-h-44 overflow-y-auto">
                <div v-for="inv in detailsModal.invoices.slice(0, 8)" :key="inv.id"
                  class="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
                  <span class="font-mono text-gray-400">{{ inv.invoiceNumber }}</span>
                  <span class="text-gray-600 font-bold">{{ Number(inv.total).toLocaleString() }} د.ع</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    :class="inv.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'">
                    {{ inv.paymentStatus === 'paid' ? 'مسدد' : 'دين' }}
                  </span>
                  <span class="text-gray-300">{{ formatDate(inv.date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="px-6 pb-5 flex gap-2 border-t border-gray-100 pt-4">
            <button @click="detailsModal.visible = false; openEdit(detailsModal.customer)"
              class="flex-1 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              <i class="fas fa-pen"></i> تعديل
            </button>
            <button @click="detailsModal.visible = false; openPayModal(detailsModal.customer)"
              class="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              <i class="fas fa-hand-holding-usd"></i> تسديد
            </button>
            <button @click="detailsModal.visible = false; printReceipt(detailsModal.customer)"
              class="flex-1 py-2.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5">
              <i class="fas fa-print"></i> طباعة
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ Pay Debt Modal ══ -->
    <transition name="modal">
      <div v-if="payModal.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="payModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
          <div class="bg-gradient-to-l from-emerald-600 to-teal-500 px-6 py-4 flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fas fa-hand-holding-usd"></i> تسديد دين
            </h3>
            <button @click="payModal.visible = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 space-y-4">
            <div class="bg-red-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <span class="text-xs text-gray-500 font-semibold">الدين الحالي:</span>
              <span class="text-lg font-black text-red-600">{{ Number(payModal.customer?.totalDebt || 0).toLocaleString() }} د.ع</span>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">مبلغ التسديد</label>
              <div class="relative">
                <input v-model.number="payModal.amount" type="number" min="1" placeholder="0"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400 transition text-left" dir="ltr" />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
              </div>
            </div>
            <button @click="payModal.amount = payModal.customer?.totalDebt"
              class="w-full py-2 border border-dashed border-emerald-300 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition">
              <i class="fas fa-check-double ml-1"></i> تسديد كامل المبلغ ({{ Number(payModal.customer?.totalDebt || 0).toLocaleString() }})
            </button>
          </div>
          <div class="px-6 pb-5 flex gap-3">
            <button @click="payModal.visible = false" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">إلغاء</button>
            <button @click="submitPayment" :disabled="!payModal.amount || payModal.loading"
              class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
              <i v-if="payModal.loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              تأكيد التسديد
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ Add Charge Modal ══ -->
    <transition name="modal">
      <div v-if="chargeModal.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="chargeModal.visible = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
          <div class="bg-gradient-to-l from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fas fa-plus-circle"></i> إضافة دين
            </h3>
            <button @click="chargeModal.visible = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">مبلغ الدين</label>
              <div class="relative">
                <input v-model.number="chargeModal.amount" type="number" min="1" placeholder="0"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 transition text-left" dir="ltr" />
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-1.5">ملاحظة / سبب الدين</label>
              <input v-model="chargeModal.note" placeholder="مثال: بضاعة بالآجل..." 
                class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition" />
            </div>
          </div>
          <div class="px-6 pb-5 flex gap-3">
            <button @click="chargeModal.visible = false" class="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition">إلغاء</button>
            <button @click="submitCharge" :disabled="!chargeModal.amount || chargeModal.loading"
              class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
              <i v-if="chargeModal.loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-plus"></i>
              إضافة الدين
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();
const customers = ref<any[]>([]);
const loading = ref(true);
const saving = ref(false);

// ─── Search & Sort ───────────────────────────────────────────
const searchQ = ref('');
const sortKey = ref('createdAt');
const sortDir = ref<'asc' | 'desc'>('desc');

function setSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'desc'; }
}
function sortIcon(key: string) {
  if (sortKey.value !== key) return 'fas fa-sort text-white/40 text-[9px]';
  return sortDir.value === 'asc' ? 'fas fa-sort-up text-yellow-300 text-[9px]' : 'fas fa-sort-down text-yellow-300 text-[9px]';
}

const filtered = computed(() => {
  const q = searchQ.value.toLowerCase().trim();
  let list = q
    ? customers.value.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.address || '').toLowerCase().includes(q)
      )
    : [...customers.value];

  list.sort((a, b) => {
    let av = a[sortKey.value] ?? 0, bv = b[sortKey.value] ?? 0;
    if (sortKey.value === 'createdAt') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
    else { av = typeof av === 'string' ? av.toLowerCase() : Number(av); bv = typeof bv === 'string' ? bv.toLowerCase() : Number(bv); }
    return sortDir.value === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
  return list;
});

// ─── Pagination ──────────────────────────────────────────────
const page = ref(1);
const perPage = ref(25);
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)));
const paginated = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filtered.value.slice(start, start + perPage.value);
});
const pageRange = computed(() => {
  const total = totalPages.value, cur = page.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (cur > 3) pages.push('...');
  for (let i = Math.max(2, cur - 1); i <= Math.min(total - 1, cur + 1); i++) pages.push(i);
  if (cur < total - 2) pages.push('...');
  pages.push(total);
  return pages;
});

// ─── Stats ───────────────────────────────────────────────────
const stats = computed(() => {
  const all = customers.value;
  const totalSales = all.reduce((s, c) => s + Number(c.totalSales || 0), 0);
  const debtors = all.filter(c => c.totalDebt > 0).length;
  const totalDebt = all.reduce((s, c) => s + Number(c.totalDebt || 0), 0);
  return [
    { label: 'إجمالي العملاء', value: all.length, icon: 'fa-users', bg: 'bg-teal-100', color: 'text-teal-600' },
    { label: 'إجمالي المبيعات', value: totalSales.toLocaleString() + ' د.ع', icon: 'fa-coins', bg: 'bg-emerald-100', color: 'text-emerald-600' },
    { label: 'عملاء لديهم دين', value: debtors, icon: 'fa-exclamation-circle', bg: 'bg-red-100', color: 'text-red-500' },
    { label: 'إجمالي الديون', value: totalDebt.toLocaleString() + ' د.ع', icon: 'fa-hand-holding-usd', bg: 'bg-amber-100', color: 'text-amber-600' },
  ];
});

// ─── Toast ───────────────────────────────────────────────────
const toastMsg = ref('');
const toastType = ref<'success' | 'error'>('success');
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value = msg; toastType.value = type;
  setTimeout(() => toastMsg.value = '', 3500);
}

// ─── Context Menu ─────────────────────────────────────────────
const ctxMenu = ref<HTMLElement | null>(null);
const ctx = ref({ visible: false, x: 0, y: 0, customer: null as any });

function openCtx(e: MouseEvent | PointerEvent, c: any) {
  e.preventDefault();
  const margin = 8;
  let x = e.clientX + margin;
  let y = e.clientY + margin;
  // Clamp to viewport (approximate menu size 208x320)
  if (x + 220 > window.innerWidth)  x = e.clientX - 220;
  if (y + 340 > window.innerHeight) y = e.clientY - 340;
  ctx.value = { visible: true, x, y, customer: c };
}
function closeCtx() { ctx.value.visible = false; }

function ctxAction(action: string) {
  const c = ctx.value.customer;
  closeCtx();
  if (action === 'details')  openDetailsModal(c);
  if (action === 'edit')     openEdit(c);
  if (action === 'pay')      openPayModal(c);
  if (action === 'charge')   openChargeModal(c);
  if (action === 'receipt')  printReceipt(c);
  if (action === 'delete')   doDelete(c);
}

// Long-press support for touch devices
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
function onTouchStart(e: TouchEvent, c: any) {
  longPressTimer = setTimeout(() => {
    const t = e.touches[0];
    openCtx({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => {} } as any, c);
  }, 600);
}
function onTouchEnd() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}
onUnmounted(() => { if (longPressTimer) clearTimeout(longPressTimer); });

// ─── Details Modal ────────────────────────────────────────────
const detailsModal = ref({ visible: false, customer: null as any, invoices: [] as any[] });

async function openDetailsModal(c: any) {
  detailsModal.value = { visible: true, customer: c, invoices: [] };
  try {
    const { data } = await api.get(`/sales-customers/${c.id}/invoices`);
    detailsModal.value.invoices = data;
  } catch {}
}

// ─── Pay Debt Modal ───────────────────────────────────────────
const payModal = ref({ visible: false, customer: null as any, amount: 0, loading: false });

function openPayModal(c: any) {
  payModal.value = { visible: true, customer: c, amount: 0, loading: false };
}

async function submitPayment() {
  if (!payModal.value.amount) return;
  payModal.value.loading = true;
  try {
    await api.post(`/sales-customers/${payModal.value.customer.id}/payment`, {
      amount: payModal.value.amount,
    });
    showToast(`✓ تم تسجيل تسديد ${payModal.value.amount.toLocaleString()} د.ع`);
    payModal.value.visible = false;
    await loadCustomers();
  } catch {
    showToast('فشل تسجيل التسديد', 'error');
  } finally {
    payModal.value.loading = false;
  }
}

// ─── Charge Modal ─────────────────────────────────────────────
const chargeModal = ref({ visible: false, customer: null as any, amount: 0, note: '', loading: false });

function openChargeModal(c: any) {
  chargeModal.value = { visible: true, customer: c, amount: 0, note: '', loading: false };
}

async function submitCharge() {
  if (!chargeModal.value.amount) return;
  chargeModal.value.loading = true;
  try {
    await api.post(`/sales-customers/${chargeModal.value.customer.id}/charge`, {
      amount: chargeModal.value.amount,
      note: chargeModal.value.note,
    });
    showToast(`✓ تم إضافة دين ${chargeModal.value.amount.toLocaleString()} د.ع`);
    chargeModal.value.visible = false;
    await loadCustomers();
  } catch {
    showToast('فشل إضافة الدين', 'error');
  } finally {
    chargeModal.value.loading = false;
  }
}

// ─── Print Receipt ────────────────────────────────────────────
function printReceipt(c: any) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: '2-digit' });
  const timeStr = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
  const debt = Number(c.totalDebt || 0);

  const win = window.open('', '_blank', 'width=400,height=560')!;
  win.document.write(`<!DOCTYPE html><html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>سند قبض - ${c.name}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', Arial, sans-serif; }
  body { background:#f5f5f5; display:flex; justify-content:center; align-items:flex-start; padding:20px; }
  .receipt { background:#fff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,.12); width:340px; overflow:hidden; }
  .header { background:linear-gradient(135deg,#0d9488,#059669); padding:20px; text-align:center; color:#fff; }
  .header h1 { font-size:18px; font-weight:900; }
  .header p { font-size:11px; opacity:.8; margin-top:2px; }
  .badge { display:inline-block; background:rgba(255,255,255,.2); border-radius:20px; padding:4px 14px; font-size:12px; margin-top:8px; }
  .body { padding:20px; }
  .row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed #f0f0f0; }
  .row:last-child { border-bottom:none; }
  .label { font-size:11px; color:#888; font-weight:600; }
  .value { font-size:12px; color:#333; font-weight:700; }
  .amount-box { background:#f0fdf4; border:2px dashed #86efac; border-radius:10px; padding:14px; text-align:center; margin:14px 0; }
  .amount-box .big { font-size:26px; font-weight:900; color:#16a34a; }
  .amount-box .sub { font-size:11px; color:#86efac; margin-top:2px; }
  .debt-box { background:#fff7ed; border:2px dashed #fed7aa; border-radius:10px; padding:10px 14px; text-align:center; margin:10px 0; }
  .debt-box span { font-size:13px; font-weight:800; color:#ea580c; }
  .footer { background:#f9fafb; border-top:1px solid #f0f0f0; padding:14px 20px; text-align:center; }
  .footer p { font-size:10px; color:#aaa; }
  .print-btn { display:block; width:100%; margin-top:10px; padding:10px; background:#0d9488; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }
  @media print { body { background:#fff; padding:0; } .receipt { box-shadow:none; border-radius:0; width:100%; } .print-btn { display:none; } }
</style></head>
<body>
<div class="receipt">
  <div class="header">
    <h1>سند قبض</h1>
    <p>${dateStr} — ${timeStr}</p>
    <span class="badge">رقم: RCP-${Date.now().toString().slice(-6)}</span>
  </div>
  <div class="body">
    <div class="row"><span class="label">العميل</span><span class="value">${c.name}</span></div>
    ${c.phone ? `<div class="row"><span class="label">الهاتف</span><span class="value" style="direction:ltr">${c.phone}</span></div>` : ''}
    ${c.address ? `<div class="row"><span class="label">العنوان</span><span class="value">${c.address}</span></div>` : ''}
    <div class="row"><span class="label">إجمالي الفواتير</span><span class="value">${c.invoiceCount} فاتورة</span></div>
    <div class="row"><span class="label">إجمالي المشتريات</span><span class="value">${Number(c.totalSales).toLocaleString()} د.ع</span></div>

    <div class="amount-box">
      <div class="big">${Number(c.totalSales).toLocaleString()}</div>
      <div class="sub">دينار عراقي — إجمالي المشتريات</div>
    </div>

    ${debt > 0 ? `<div class="debt-box"><span>الرصيد المتبقي (الدين): ${debt.toLocaleString()} د.ع</span></div>` : `<div class="debt-box" style="background:#f0fdf4;border-color:#86efac"><span style="color:#16a34a">✓ الحساب مسدد بالكامل</span></div>`}
  </div>
  <div class="footer">
    <p>توقيع المستلم: ___________________</p>
    <p style="margin-top:6px">طُبع من نظام ISP ERP</p>
    <button class="print-btn" onclick="window.print()">🖨 طباعة</button>
  </div>
</div>
</body></html>`);
  win.document.close();
}

// ─── Form Modal ──────────────────────────────────────────────
const formModal = ref({ visible: false, isEdit: false, editId: 0 });
const form = ref({ name: '', phone: '', address: '', notes: '' });

function openAdd() {
  form.value = { name: '', phone: '', address: '', notes: '' };
  formModal.value = { visible: true, isEdit: false, editId: 0 };
}
function openEdit(c: any) {
  form.value = { name: c.name, phone: c.phone || '', address: c.address || '', notes: c.notes || '' };
  formModal.value = { visible: true, isEdit: true, editId: c.id };
}
async function submitForm() {
  if (!form.value.name.trim()) return;
  saving.value = true;
  try {
    if (formModal.value.isEdit) {
      const { data } = await api.patch(`/sales-customers/${formModal.value.editId}`, form.value);
      const idx = customers.value.findIndex(c => c.id === formModal.value.editId);
      if (idx !== -1) customers.value[idx] = { ...customers.value[idx], ...data };
      showToast('✓ تم تعديل بيانات العميل');
    } else {
      await api.post('/sales-customers', form.value);
      await loadCustomers();
      showToast('✓ تم إضافة العميل بنجاح');
    }
    formModal.value.visible = false;
  } catch {
    showToast('حدث خطأ، حاول مرة أخرى', 'error');
  } finally {
    saving.value = false;
  }
}

// ─── Delete ──────────────────────────────────────────────────
const confirmModal = ref({ visible: false, customerId: 0, customerName: '' });

function doDelete(c: any) {
  confirmModal.value = { visible: true, customerId: c.id, customerName: c.name };
}
async function confirmDelete() {
  confirmModal.value.visible = false;
  try {
    await api.delete(`/sales-customers/${confirmModal.value.customerId}`);
    customers.value = customers.value.filter(c => c.id !== confirmModal.value.customerId);
    showToast('✓ تم حذف العميل');
  } catch {
    showToast('فشل الحذف، حاول مرة أخرى', 'error');
  }
}

// ─── Use in POS ──────────────────────────────────────────────
function useInPOS(c: any) {
  localStorage.setItem('pos_prefill_customer', JSON.stringify({
    name: c.name, phone: c.phone || '', address: c.address || '',
  }));
  router.push('/sales/pos');
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: '2-digit' });
}

// ─── Load ────────────────────────────────────────────────────
async function loadCustomers() {
  try {
    const { data } = await api.get('/sales-customers');
    customers.value = data;
  } finally {
    loading.value = false;
  }
}
onMounted(loadCustomers);
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(16px); }
</style>
