<template>
  <div class="space-y-6">

    <!-- Toast -->
    <transition name="fade">
      <div v-if="toast.show" :class="['fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium text-white', toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500']">
        <i :class="toast.type === 'error' ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-users text-blue-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-secondary">{{ subscribers.length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">إجمالي المشتركين</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-user-check text-emerald-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-secondary">{{ subscribers.filter(s => s.status === 'active').length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">مشترك نشط</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-user-times text-red-400 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-secondary">{{ subscribers.filter(s => s.status !== 'active').length }}</p>
          <p class="text-xs text-gray-400 mt-0.5">مشترك معلق</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
        <div class="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
          <i class="fas fa-exclamation-triangle text-amber-500 text-lg"></i>
        </div>
        <div>
          <p class="text-2xl font-bold text-secondary">{{ expiringCount }}</p>
          <p class="text-xs text-gray-400 mt-0.5">ينتهي خلال 7 أيام</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-indigo-300 shadow-sm overflow-hidden">
      <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex flex-wrap items-center gap-2.5">

        <!-- Search -->
        <div class="relative flex-1 min-w-[180px] sm:max-w-xs">
          <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs"></i>
          <input
            v-model="search"
            placeholder="بحث بالاسم أو الهاتف أو اسم الدخول..."
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition placeholder-white/60 text-white"
          />
        </div>

        <!-- Filter by status -->
        <div class="relative min-w-[150px]">
          <i class="fas fa-circle-dot absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <select
            v-model="filterStatus"
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white appearance-none"
          >
            <option value="" class="text-gray-800">كل الحالات</option>
            <option value="active" class="text-gray-800">فعال</option>
            <option value="expired" class="text-gray-800">منتهي الصلاحية</option>
            <option value="suspended" class="text-gray-800">معطل</option>
            <option value="expiring_soon" class="text-gray-800">ينتهي قريبا</option>
            <option value="expiring_today" class="text-gray-800">ينتهي اليوم</option>
          </select>
        </div>

        <!-- Filter by manager -->
        <div class="relative min-w-[140px]">
          <i class="fas fa-user-tie absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <select
            v-model="filterManager"
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white appearance-none"
          >
            <option value="" class="text-gray-800">كل المدراء</option>
            <option v-for="m in managers" :key="m.id" :value="m.id" class="text-gray-800">{{ m.username || m.name || m.position }}</option>
          </select>
        </div>

        <!-- Filter by package -->
        <div class="relative min-w-[140px]">
          <i class="fas fa-wifi absolute right-3 top-1/2 -translate-y-1/2 text-white/60 text-xs pointer-events-none"></i>
          <select
            v-model="filterPackage"
            class="w-full pr-8 pl-3 py-2 text-sm border border-white/30 rounded-xl bg-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition text-white appearance-none"
          >
            <option value="" class="text-gray-800">كل الباقات</option>
            <option v-for="p in packages" :key="p.id" :value="p.id" class="text-gray-800">{{ p.name }}</option>
          </select>
        </div>

        <!-- Spacer -->
        <div class="flex-1"></div>

        <!-- Add button -->
        <button
          @click="openAdd"
          class="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2 rounded-xl text-sm font-semibold transition shadow-sm whitespace-nowrap"
        >
          <i class="fas fa-plus text-xs"></i>
          إضافة مشترك
        </button>

      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- Table Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <i class="fas fa-list text-primary text-sm"></i>
          </div>
          <div>
            <h3 class="font-bold text-secondary text-sm">قائمة المشتركين</h3>
            <p class="text-xs text-gray-400">عرض {{ filteredSubs.length }} من {{ subscribers.length }} مشترك</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm whitespace-nowrap">
          <thead>
            <tr class="border-b border-gray-100" style="background: #f8fafc;">
              <th class="px-4 py-3.5 text-center w-10">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                />
              </th>
              <th class="px-4 py-3.5 text-center text-xs font-bold text-gray-400 w-10">#</th>
              <th class="px-4 py-3.5 text-center text-xs font-bold text-gray-400 w-12">الحالة</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">المشترك</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">اسم الدخول</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">رقم الهاتف</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">تابع إلى</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">الباقة</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">تاريخ الإضافة</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">تاريخ الانتهاء</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-400">الأيام المتبقية</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">العنوان</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-400">الملاحظات</th>
            </tr>
          </thead>
          <tbody>
            <!-- Empty State -->
            <tr v-if="filteredSubs.length === 0">
              <td colspan="14" class="py-20 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <i class="fas fa-users text-3xl text-gray-300"></i>
                  </div>
                  <p class="font-semibold text-gray-400">لا يوجد مشتركين</p>
                  <p class="text-xs text-gray-300">ابدأ بإضافة أول مشترك أو عدّل فلتر البحث</p>
                </div>
              </td>
            </tr>

            <!-- Data Rows -->
            <tr
              v-for="(sub, index) in pagedSubs"
              :key="sub.id"
              class="border-b border-gray-50 hover:bg-slate-50/70 transition-colors group cursor-pointer select-none"
              @contextmenu.prevent="showContextMenu($event, sub)"
              @mousedown="startLongPress($event, sub)"
              @mouseup="cancelLongPress"
              @mouseleave="cancelLongPress"
            >
              <!-- Checkbox -->
              <td class="px-4 py-3.5 text-center">
                <input
                  type="checkbox"
                  class="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                  :checked="selectedIds.includes(sub.id)"
                  @change="toggleRow(sub.id)"
                />
              </td>

              <!-- رقم التسلسل -->
              <td class="px-4 py-3.5 text-center">
                <span class="text-gray-500 text-xs font-semibold tabular-nums">{{ index + 1 }}</span>
              </td>

              <!-- الحالة -->
              <td class="px-4 py-3.5 text-center">
                <span
                  class="inline-block w-6 h-6 rounded-md"
                  :class="getStatusClass(sub)"
                  :title="getStatusTitle(sub)"
                ></span>
              </td>

              <!-- المشترك (الاسم) -->
              <td class="px-5 py-3.5">
                <p class="font-semibold text-gray-800 text-sm">{{ sub.name }}</p>
              </td>

              <!-- اسم الدخول -->
              <td class="px-5 py-3.5">
                <code class="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono tracking-wide border border-slate-200">
                  {{ sub.username || '—' }}
                </code>
              </td>

              <!-- رقم الهاتف -->
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-1.5 text-gray-600 text-xs font-mono">
                  <i class="fas fa-phone text-gray-300 text-[10px]"></i>
                  <span dir="ltr">{{ sub.phone || '—' }}</span>
                </div>
              </td>

              <!-- تابع إلى -->
              <td class="px-5 py-3.5">
                <div v-if="sub.manager" class="flex items-center gap-1.5">
                  <div class="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-user-shield text-violet-500 text-[10px]"></i>
                  </div>
                  <span class="text-xs text-violet-700 font-medium">{{ sub.manager.name || sub.manager.position }}</span>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- الباقة -->
              <td class="px-5 py-3.5">
                <div v-if="sub.package" class="flex items-center gap-1.5">
                  <div class="w-6 h-6 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-wifi text-sky-500 text-[10px]"></i>
                  </div>
                  <span class="text-xs text-sky-700 font-semibold">{{ sub.package.name }}</span>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- تاريخ الإضافة -->
              <td class="px-5 py-3.5">
                <div v-if="sub.createdAt" class="text-xs text-gray-500">
                  <p class="font-medium">{{ formatDate(sub.createdAt) }}</p>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- تاريخ الانتهاء -->
              <td class="px-5 py-3.5">
                <div v-if="getLatestSub(sub)" class="text-xs">
                  <p class="font-medium" :class="remainingDays(getLatestSub(sub).endDate) <= 0 ? 'text-red-500' : remainingDays(getLatestSub(sub).endDate) <= 7 ? 'text-amber-600' : 'text-gray-500'">
                    {{ formatDate(getLatestSub(sub).endDate) }}
                  </p>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- الأيام المتبقية -->
              <td class="px-5 py-3.5 text-center">
                <template v-if="getLatestSub(sub)?.endDate">
                  <div class="flex flex-col items-center gap-0.5">
                    <span
                      class="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold min-w-[60px]"
                      :class="getDaysClass(remainingDays(getLatestSub(sub).endDate))"
                    >
                      <template v-if="remainingDays(getLatestSub(sub).endDate) > 0">
                        {{ remainingDays(getLatestSub(sub).endDate) }}
                        <span class="mr-0.5 font-normal">يوم</span>
                      </template>
                      <template v-else>منتهٍ</template>
                    </span>
                  </div>
                </template>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- العنوان -->
              <td class="px-5 py-3.5 max-w-[160px]">
                <div v-if="sub.address" class="flex items-start gap-1">
                  <i class="fas fa-map-marker-alt text-gray-300 text-[10px] mt-0.5 flex-shrink-0"></i>
                  <span :title="sub.address" class="text-xs text-gray-500 truncate block max-w-[130px]">{{ sub.address }}</span>
                </div>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

              <!-- الملاحظات -->
              <td class="px-5 py-3.5 max-w-[150px]">
                <span v-if="sub.notes" :title="sub.notes" class="text-xs text-gray-400 italic truncate block max-w-[130px]">
                  {{ sub.notes }}
                </span>
                <span v-else class="text-gray-300 text-xs">—</span>
              </td>

            </tr>
          </tbody>
        </table>
      </div>

      <!-- Table Footer -->
      <div v-if="filteredSubs.length > 0" class="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <p class="text-xs text-gray-400">
          إجمالي النتائج: <span class="font-bold text-gray-600">{{ filteredSubs.length }}</span> مشترك
        </p>
        <div class="flex items-center gap-4 text-xs">
          <span class="flex items-center gap-1.5 text-emerald-600">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            {{ filteredSubs.filter(s => s.status === 'active').length }} نشط
          </span>
          <span class="flex items-center gap-1.5 text-red-500">
            <span class="w-2 h-2 rounded-full bg-red-400"></span>
            {{ filteredSubs.filter(s => s.status !== 'active').length }} معلق
          </span>
        </div>
      </div>

      <!-- Pagination Bar -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <!-- Page Buttons -->
        <div class="flex items-center gap-1" dir="ltr">
          <!-- First -->
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            ««
          </button>
          <!-- Prev -->
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            «
          </button>
          <!-- Page numbers -->
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-semibold transition"
              :class="p === currentPage
                ? 'bg-primary border-primary text-white shadow-sm shadow-primary/30'
                : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
              {{ p }}
            </button>
          </template>
          <!-- Next -->
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »
          </button>
          <!-- Last -->
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition"
            :class="currentPage === totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'">
            »»
          </button>
        </div>

        <!-- Page Size -->
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
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center" :class="editingId ? 'bg-amber-50' : 'bg-primary/10'">
                <i :class="editingId ? 'fas fa-pen text-amber-500' : 'fas fa-user-plus text-primary'" class="text-sm"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">{{ editingId ? ' تعديل بيانات المشترك' : 'إضافة مشترك جديد' }}</h3>
                <p class="text-xs text-gray-400">{{ editingId ? 'قم بتعديل البيانات المطلوبة' : 'أدخل بيانات المشترك الجديد' }}</p>
              </div>
            </div>
            <button @click="showModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-5">

            <!-- Section: المعلومات الأساسية -->
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-200 inline-block"></span>
                المعلومات الأساسية
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">الاسم الكامل <span class="text-red-500">*</span></label>
                  <input v-model="form.name" placeholder="أدخل الاسم الكامل" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">رقم الهاتف <span class="text-red-500">*</span></label>
                  <input v-model="form.phone" placeholder="07xxxxxxxxx" dir="ltr" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">العنوان <span class="text-red-500">*</span></label>
                  <input v-model="form.address" placeholder="المنطقة، الشارع، رقم المنزل" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
              </div>
            </div>

            <!-- Section: بيانات الاشتراك -->
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-200 inline-block"></span>
                بيانات الاشتراك
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">اسم المستخدم (PPPoE) <span class="text-red-500">*</span></label>
                  <input v-model="form.username" placeholder="username" dir="ltr" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">كلمة المرور (PPPoE) <span class="text-red-500">*</span></label>
                  <div class="relative">
                    <input v-model="form.password" type="text" dir="ltr"
                      :placeholder="editingId ? 'اتركه فارغًا للإبقاء كما هو' : 'password'"
                      class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                    <p v-if="!editingId && !form.password" class="text-[11px] text-amber-500 mt-1">يُنصح باستخدام كلمة مرور مختلفة عن اسم المستخدم</p>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">عنوان IP</label>
                  <input v-model="form.ipAddress" placeholder="192.168.1.x" dir="ltr" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">الباقة</label>
                  <select v-model="form.packageId" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition cursor-pointer">
                    <option :value="null">— اختر الباقة —</option>
                    <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">تابع إلى (المدير)</label>
                  <select v-model="form.managerId" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition cursor-pointer">
                    <option :value="null">— اختر المدير —</option>
                    <option v-for="m in managers" :key="m.id" :value="m.id">{{ m.username || m.name || m.position }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">الراوتر (MikroTik)</label>
                  <select v-model="form.routerId" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition cursor-pointer">
                    <option :value="null">— بدون راوتر —</option>
                    <option v-for="r in routers" :key="r.id" :value="r.id">{{ r.name }} ({{ r.ipAddress }})</option>
                  </select>
                  <p v-if="form.routerId" class="text-[11px] text-teal-600 mt-1">⚡ سيتم إنشاء الـ PPPoE secret تلقائياً في المايكروتك</p>
                </div>
                <div class="sm:col-span-2">
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">اسم الكابينة / السكتر</label>
                  <input v-model="form.cabinetSector" placeholder="مثال: كابينة A — سكتر 3" class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition" />
                </div>
              </div>
            </div>

            <!-- Section: تفاصيل الاشتراك - for new subscribers only -->
            <div v-if="!editingId">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span class="w-4 h-px bg-gray-200 inline-block"></span>
                تفاصيل الاشتراك
                <span class="flex-1 h-px bg-gray-100 inline-block"></span>
                <span class="text-[10px] font-normal text-gray-300 normal-case">(اختياري)</span>
              </p>

              <!-- Hint when no package selected -->
              <div v-if="!form.packageId" class="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl mb-4">
                <i class="fas fa-info-circle text-amber-400 text-sm flex-shrink-0"></i>
                <p class="text-xs text-amber-700">اختر الباقة أولاً لاحتساب تاريخ الانتهاء تلقائياً</p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Start Date -->
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                    <i class="fas fa-calendar-plus text-emerald-400 ml-1 text-[10px]"></i>
                    تاريخ بدء الاشتراك
                  </label>
                  <input
                    v-model="form.subStartDate"
                    type="date"
                    class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50 focus:bg-white transition"
                  />
                  <p v-if="form.packageId && form.subStartDate" class="text-[11px] text-emerald-600 mt-1">
                    ⚡ سيتم احتساب تاريخ الانتهاء من مدة الباقة ({{ subFormPackageDuration }} يوم)
                  </p>
                  <p v-else class="text-[11px] text-gray-400 mt-1">اتركه فارغاً لتفعيل الاشتراك لاحقاً</p>
                </div>

                <!-- End Date: auto-preview or manual -->
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                    <i class="fas fa-calendar-times text-red-400 ml-1 text-[10px]"></i>
                    تاريخ انتهاء الاشتراك
                  </label>
                  <!-- Auto-calculated preview -->
                  <div v-if="form.subStartDate && form.packageId && subFormEndDatePreview"
                    class="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <i class="fas fa-calendar-check text-emerald-500 text-xs flex-shrink-0"></i>
                    <span class="text-sm font-semibold text-emerald-700">
                      {{ new Date(subFormEndDatePreview).toLocaleDateString('ar-IQ') }}
                    </span>
                    <span class="text-[10px] text-emerald-500 mr-auto">محتسب تلقائياً</span>
                  </div>
                  <!-- Manual input -->
                  <input
                    v-else
                    v-model="form.subEndDate"
                    type="date"
                    class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition"
                    placeholder="أو أدخل التاريخ يدوياً"
                  />
                  <p class="text-[11px] text-gray-400 mt-1">يمكنك تعديله يدوياً إذا أردت</p>
                </div>
              </div>

              <!-- Remaining Days Preview -->
              <div v-if="subFormRemainingDays !== null" class="mt-3 flex items-center gap-3 px-4 py-3 rounded-xl border"
                :class="subFormRemainingDays > 7 ? 'bg-emerald-50 border-emerald-100' : subFormRemainingDays > 0 ? 'bg-amber-50 border-amber-100' : 'bg-red-50 border-red-100'">
                <i class="fas fa-hourglass-half text-sm flex-shrink-0"
                  :class="subFormRemainingDays > 7 ? 'text-emerald-400' : subFormRemainingDays > 0 ? 'text-amber-400' : 'text-red-400'"></i>
                <div>
                  <p class="text-[10px] text-gray-400">الأيام المتبقية بعد التفعيل</p>
                  <p class="text-sm font-bold"
                    :class="subFormRemainingDays > 7 ? 'text-emerald-600' : subFormRemainingDays > 0 ? 'text-amber-600' : 'text-red-600'">
                    {{ subFormRemainingDays }} يوم
                  </p>
                </div>
              </div>

              <!-- Manual end date override (shown only when auto-calculated) -->
              <div v-if="form.subStartDate && form.packageId && subFormEndDatePreview" class="mt-3">
                <button
                  type="button"
                  @click="subManualEndDate = !subManualEndDate"
                  class="text-xs text-indigo-500 hover:text-indigo-700 transition flex items-center gap-1"
                >
                  <i :class="subManualEndDate ? 'fas fa-times-circle' : 'fas fa-pen'" class="text-[10px]"></i>
                  {{ subManualEndDate ? 'إلغاء التعديل اليدوي' : 'تعديل تاريخ الانتهاء يدوياً' }}
                </button>
                <input
                  v-if="subManualEndDate"
                  v-model="form.subEndDate"
                  type="date"
                  class="mt-2 w-full px-3.5 py-2.5 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 transition"
                />
              </div>
            </div>

            <!-- Section: ملاحظات -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">ملاحظات</label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="أي ملاحظات إضافية..."
                class="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition resize-none"
              ></textarea>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
            <button @click="showModal = false" class="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition">
              إلغاء
            </button>
            <button
              @click="save"
              :disabled="saving"
              class="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-sm shadow-primary/30"
            >
              <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-save text-xs"></i>
              {{ saving ? 'جاري الحفظ...' : 'حفظ البيانات' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== Context Menu ===== -->
    <teleport to="body">
      <div v-if="contextMenu.show" class="fixed inset-0 z-[300]" @click="closeContextMenu" @contextmenu.prevent>
        <div
          class="absolute bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-52 overflow-hidden"
          :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
          @click.stop
        >
          <!-- Subscriber name header -->
          <div class="px-4 py-2.5 border-b border-gray-100 bg-gray-50/80">
            <p class="text-xs font-bold text-gray-700 truncate">{{ contextMenuSub?.name }}</p>
            <p class="text-[10px] text-gray-400 font-mono">{{ contextMenuSub?.username }}</p>
          </div>

          <div class="py-1">
            <!-- تفعيل -->
            <button @click="openActivateModal" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors">
              <i class="fas fa-check-circle w-4 text-center"></i>
              <span>تفعيل</span>
            </button>
            <!-- الغاء -->
            <button @click="suspendSub" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-orange-500 hover:bg-orange-50 transition-colors">
              <i class="fas fa-pause-circle w-4 text-center"></i>
              <span>إلغاء الاشتراك</span>
            </button>
            <!-- تعطيل / إلغاء التعطيل -->
            <button @click="toggleEnabled" class="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors"
              :class="contextMenuSub?.isEnabled !== false ? 'text-red-600 hover:bg-red-50' : 'text-teal-600 hover:bg-teal-50'">
              <i class="w-4 text-center" :class="contextMenuSub?.isEnabled !== false ? 'fas fa-ban' : 'fas fa-check-circle'"></i>
              <span>{{ contextMenuSub?.isEnabled !== false ? 'تعطيل' : 'إلغاء التعطيل' }}</span>
            </button>
            <!-- مزامنة مع الراوتر -->
            <button v-if="hasSubscriberPermission('sync')" @click="syncToRouter" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
              :title="!contextMenuSub?.router ? 'لم يُحدد راوتر لهذا المشترك' : ''">
              <i class="fas fa-sync-alt w-4 text-center"></i>
              <span>مزامنة مع الراوتر</span>
            </button>

            <div class="my-1 border-t border-gray-100"></div>

            <!-- عرض التفاصيل -->
            <button @click="openDetailsFromMenu" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-info-circle w-4 text-center text-indigo-400"></i>
              <span>عرض التفاصيل</span>
            </button>
            <!-- تعديل -->
            <button @click="openEditFromMenu" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-pen w-4 text-center text-blue-400"></i>
              <span>تعديل</span>
            </button>
            <!-- تغيير الباقة -->
            <button @click="openChangePackage" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-exchange-alt w-4 text-center text-sky-400"></i>
              <span>تغيير الباقة</span>
            </button>
            <!-- تمديد -->
            <button @click="openExtend" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-calendar-plus w-4 text-center text-teal-500"></i>
              <span>تمديد</span>
            </button>
            <!-- تسديد ديون -->
            <button v-if="hasSubscriberPermission('pay_debt')" @click="openPayDebt" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-money-bill-wave w-4 text-center text-green-500"></i>
              <span>تسديد ديون</span>
            </button>
            <!-- إضافة دين -->
            <button v-if="hasSubscriberPermission('add_debt')" @click="openAddDebt" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-file-invoice-dollar w-4 text-center text-red-400"></i>
              <span>إضافة دين</span>
            </button>

            <div class="my-1 border-t border-gray-100"></div>

            <!-- طباعة فاتورة -->
            <button v-if="hasSubscriberPermission('print_invoice')" @click="printInvoice" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fas fa-print w-4 text-center text-gray-400"></i>
              <span>طباعة فاتورة</span>
            </button>
            <!-- إرسال رسالة -->
            <button v-if="hasSubscriberPermission('send_message')" @click="openSendMessage" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              <i class="fab fa-whatsapp w-4 text-center text-green-500"></i>
              <span>إرسال رسالة</span>
            </button>

            <div class="my-1 border-t border-gray-100"></div>

            <!-- حذف -->
            <button @click="deleteFromMenu" class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
              <i class="fas fa-trash w-4 text-center"></i>
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ===== Subscriber Details Modal ===== -->
    <SubscriberDetailsModal :show="showDetailsModal" :subscriber="detailSub" @close="closeDetailsModal" />

    <!-- ===== Activate Subscriber Modal ===== -->
    <transition name="modal">
      <div v-if="showActivateModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="showActivateModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-l from-emerald-500 to-teal-500 px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-bolt text-white text-base"></i>
              </div>
              <div>
                <h3 class="font-bold text-white text-base">تفعيل المشترك</h3>
                <p class="text-xs text-emerald-100">{{ contextMenuSub?.name }}</p>
              </div>
            </div>
            <button @click="showActivateModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <div class="p-6 space-y-5">

            <!-- Subscriber Info Card -->
            <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">بيانات المشترك</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <i class="fas fa-user text-emerald-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">الاسم</p>
                    <p class="text-sm font-semibold text-secondary">{{ contextMenuSub?.name }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-phone text-blue-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">الهاتف</p>
                    <p class="text-sm font-semibold text-secondary">{{ contextMenuSub?.phone || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-user-circle text-purple-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">اسم الدخول</p>
                    <p class="text-sm font-semibold text-secondary font-mono">{{ contextMenuSub?.username || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-box text-amber-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">الباقة</p>
                    <p class="text-sm font-semibold text-secondary">{{ activatePackage?.name || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Package price highlight -->
              <div v-if="activatePackage" class="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                <span class="text-xs text-gray-500">سعر الباقة</span>
                <span class="text-base font-bold text-emerald-600">{{ Number(activatePackage.price).toLocaleString('ar-IQ') }} <span class="text-xs font-normal text-gray-500">د.ع</span></span>
              </div>
            </div>

            <!-- Payment Method -->
            <div>
              <p class="text-xs font-bold text-gray-600 mb-2.5">طريقة الدفع</p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  @click="activateForm.paymentMethod = 'cash'"
                  :class="['flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition font-semibold text-xs', activateForm.paymentMethod === 'cash' ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50/50']"
                >
                  <i class="fas fa-money-bill-wave text-base"></i>
                  نقداً
                </button>
                <button
                  @click="activateForm.paymentMethod = 'credit'"
                  :class="['flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition font-semibold text-xs', activateForm.paymentMethod === 'credit' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:bg-blue-50/50']"
                >
                  <i class="fas fa-clock text-base"></i>
                  آجل
                </button>
                <button
                  @click="activateForm.paymentMethod = 'partial'"
                  :class="['flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition font-semibold text-xs', activateForm.paymentMethod === 'partial' ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:bg-orange-50/50']"
                >
                  <i class="fas fa-coins text-base"></i>
                  جزئي
                </button>
              </div>
            </div>

            <!-- Cash info -->
            <div v-if="activateForm.paymentMethod === 'cash'" class="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3">
              <i class="fas fa-check-circle text-emerald-500 text-lg flex-shrink-0"></i>
              <div>
                <p class="text-sm font-semibold text-emerald-700">الدفع الكامل نقداً</p>
                <p class="text-xs text-emerald-600 mt-0.5">المبلغ المستحق: <strong>{{ Number(activatePackage?.price || 0).toLocaleString('ar-IQ') }} د.ع</strong></p>
              </div>
            </div>

            <!-- Credit info -->
            <div v-if="activateForm.paymentMethod === 'credit'" class="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-center gap-3">
              <i class="fas fa-info-circle text-blue-500 text-lg flex-shrink-0"></i>
              <div>
                <p class="text-sm font-semibold text-blue-700">الدفع بالآجل</p>
                <p class="text-xs text-blue-600 mt-0.5">يُسجّل كامل المبلغ <strong>{{ Number(activatePackage?.price || 0).toLocaleString('ar-IQ') }} د.ع</strong> كدين على المشترك</p>
              </div>
            </div>

            <!-- Partial payment -->
            <div v-if="activateForm.paymentMethod === 'partial'" class="space-y-3">
              <div class="bg-orange-50 border border-orange-100 rounded-xl p-3.5">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-semibold text-orange-600">سعر الباقة الكاملة</span>
                  <span class="text-sm font-bold text-orange-700">{{ Number(activatePackage?.price || 0).toLocaleString('ar-IQ') }} د.ع</span>
                </div>
                <div>
                  <label class="block text-xs font-semibold text-gray-600 mb-1.5">المبلغ المدفوع جزئياً</label>
                  <div class="relative">
                    <input
                      type="number"
                      v-model="activateForm.partialAmount"
                      :max="Number(activatePackage?.price || 0)"
                      min="0"
                      placeholder="0"
                      class="w-full pl-16 pr-4 py-2.5 bg-white border border-orange-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-orange-200 flex items-center justify-between">
                  <span class="text-xs font-semibold text-red-600">المبلغ المتبقي (دين)</span>
                  <span class="text-base font-bold text-red-600">{{ activatePartialRemaining.toLocaleString('ar-IQ') }} د.ع</span>
                </div>
              </div>
            </div>

            <!-- Start date -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">تاريخ بدء الاشتراك</label>
                <input type="date" v-model="activateForm.startDate" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">تاريخ الانتهاء (محتسب)</label>
                <div class="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <i class="fas fa-calendar-check text-emerald-400 text-xs"></i>
                  <span class="text-sm font-semibold text-emerald-700">{{ activateEndDatePreview ? new Date(activateEndDatePreview).toLocaleDateString('ar-IQ') : '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Days remaining preview -->
            <div v-if="activateRemainingPreview !== null" class="flex items-center gap-3 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
              <i class="fas fa-hourglass-half text-sky-400 text-sm"></i>
              <div>
                <p class="text-xs text-gray-500">الأيام المتبقية بعد التفعيل</p>
                <p class="text-sm font-bold" :class="activateRemainingPreview > 7 ? 'text-emerald-600' : activateRemainingPreview > 0 ? 'text-amber-600' : 'text-red-600'">{{ activateRemainingPreview }} يوم</p>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">ملاحظات</label>
              <textarea v-model="activateForm.notes" rows="2" placeholder="أي ملاحظات إضافية على عملية التفعيل..." class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"></textarea>
            </div>

          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <button @click="showActivateModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="saveActivate" :disabled="saving" class="px-6 py-2.5 bg-gradient-to-l from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-emerald-200">
              <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-bolt text-xs"></i>
              {{ saving ? 'جاري التفعيل...' : 'تفعيل الاشتراك' }}
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ===== Change Package Modal ===== -->
    <transition name="modal">
      <div v-if="showChangePackageModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="showChangePackageModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                <i class="fas fa-exchange-alt text-sky-500 text-sm"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">تغيير الباقة</h3>
                <p class="text-xs text-gray-400">{{ contextMenuSub?.name }}</p>
              </div>
            </div>
            <button @click="showChangePackageModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">الباقة الجديدة</label>
              <select v-model="changePackageForm.packageId" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">-- اختر باقة --</option>
                <option v-for="p in packages" :key="p.id" :value="p.id">{{ p.name }} — {{ p.price }} د.ع</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">تاريخ بدء الاشتراك</label>
              <input type="date" v-model="changePackageForm.startDate" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              <p class="text-[11px] text-gray-400 mt-1">سيتم احتساب تاريخ الانتهاء تلقائياً من مدة الباقة</p>
            </div>
          </div>
          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showChangePackageModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="saveChangePackage" :disabled="saving" class="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-check text-xs"></i>
              تأكيد التغيير
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== Add Debt Modal ===== -->
    <transition name="modal">
      <div v-if="showAddDebtModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="showAddDebtModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <i class="fas fa-file-invoice-dollar text-red-400 text-sm"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">إضافة دين</h3>
                <p class="text-xs text-gray-400">{{ contextMenuSub?.name }}</p>
              </div>
            </div>
            <button @click="showAddDebtModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="subscriberSubs.length > 1">
              <label class="block text-xs font-semibold text-gray-600 mb-2">الاشتراك</label>
              <select v-model="addDebtSubId" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option :value="null" disabled>— اختر اشتراكاً —</option>
                <option v-for="sub in subscriberSubs" :key="sub.id" :value="sub.id">{{ sub.package?.name || '—' }} ({{ formatDateShort(sub.startDate) }})</option>
              </select>
            </div>
            <div v-else-if="subscriberSubs.length === 0" class="text-sm text-gray-400">لا توجد اشتراكات لهذا المشترك</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">مبلغ الدين (د.ع)</label>
              <input type="number" v-model="addDebtForm.amount" placeholder="0" min="0" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">سبب الدين</label>
              <input type="text" v-model="addDebtForm.reason" placeholder="مثال: اشتراك شهر مارس..." class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showAddDebtModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="saveAddDebt" class="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i class="fas fa-plus text-xs"></i>
              تسجيل الدين
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== Pay Debt Modal ===== -->
    <transition name="modal">
      <div v-if="showPayDebtModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="showPayDebtModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="fas fa-money-bill-wave text-green-500 text-sm"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">تسديد ديون</h3>
                <p class="text-xs text-gray-400">{{ contextMenuSub?.name }}</p>
              </div>
            </div>
            <button @click="showPayDebtModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div v-if="subscriberSubs.length > 1">
              <label class="block text-xs font-semibold text-gray-600 mb-2">الاشتراك</label>
              <select v-model="payDebtSubId" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option :value="null" disabled>— اختر اشتراكاً —</option>
                <option v-for="sub in subscriberSubs" :key="sub.id" :value="sub.id">{{ sub.package?.name || '—' }} ({{ formatDateShort(sub.startDate) }})</option>
              </select>
            </div>
            <div v-else-if="subscriberSubs.length === 0" class="text-sm text-gray-400">لا توجد اشتراكات لهذا المشترك</div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">المبلغ المدفوع (د.ع)</label>
              <input type="number" v-model="payDebtForm.amount" placeholder="0" min="0" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">ملاحظات</label>
              <input type="text" v-model="payDebtForm.notes" placeholder="سبب الدفع أو أي ملاحظة..." class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showPayDebtModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="savePayDebt" class="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i class="fas fa-check text-xs"></i>
              تأكيد الدفع
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== Extend Modal ===== -->
    <transition name="modal">
      <div v-if="showExtendModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="showExtendModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

          <!-- Header -->
          <div class="bg-gradient-to-l from-teal-500 to-emerald-500 px-6 py-5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-calendar-plus text-white text-base"></i>
              </div>
              <div>
                <h3 class="font-bold text-white text-base">تمديد الاشتراك</h3>
                <p class="text-xs text-teal-100">{{ contextMenuSub?.name }}</p>
              </div>
            </div>
            <button @click="showExtendModal = false" class="w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <div class="p-6 space-y-5">

            <!-- Current expiry info -->
            <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p class="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">الاشتراك الحالي</p>
              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-2">
                  <i class="fas fa-user text-teal-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">المشترك</p>
                    <p class="text-sm font-semibold text-secondary">{{ contextMenuSub?.name }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-wifi text-sky-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">الباقة</p>
                    <p class="text-sm font-semibold text-secondary">{{ contextMenuSub?.package?.name || '—' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-calendar-times text-red-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">تاريخ الانتهاء الحالي</p>
                    <p class="text-sm font-semibold text-secondary">
                      {{ extendCurrentEndDate ? new Date(extendCurrentEndDate).toLocaleDateString('ar-IQ') : 'لا يوجد اشتراك' }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-hourglass-half text-amber-400 text-xs w-4 text-center"></i>
                  <div>
                    <p class="text-[10px] text-gray-400">الأيام المتبقية</p>
                    <p class="text-sm font-semibold" :class="extendCurrentRemainingDays > 7 ? 'text-emerald-600' : extendCurrentRemainingDays > 0 ? 'text-amber-600' : 'text-red-500'">
                      {{ extendCurrentRemainingDays > 0 ? extendCurrentRemainingDays + ' يوم' : 'منتهٍ' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Days input -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">
                عدد أيام التمديد <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-2">
                <button @click="extendForm.days = Math.max(1, Number(extendForm.days) - 1)"
                  class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-lg font-bold flex-shrink-0">−</button>
                <input
                  type="number"
                  v-model="extendForm.days"
                  min="1"
                  max="3650"
                  class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button @click="extendForm.days = Number(extendForm.days) + 1"
                  class="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition text-lg font-bold flex-shrink-0">+</button>
              </div>
              <!-- Quick select -->
              <div class="flex gap-2 mt-2 flex-wrap">
                <button v-for="d in [7, 15, 30, 60, 90]" :key="d"
                  @click="extendForm.days = d"
                  :class="['px-3 py-1 rounded-lg text-xs font-semibold transition border', Number(extendForm.days) === d ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600']"
                >{{ d }} يوم</button>
              </div>
            </div>

            <!-- New expiry preview -->
            <div v-if="extendNewEndDate" class="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
              <i class="fas fa-calendar-check text-teal-500 text-sm flex-shrink-0"></i>
              <div>
                <p class="text-[10px] text-gray-400">تاريخ الانتهاء الجديد بعد التمديد</p>
                <p class="text-base font-bold text-teal-700">{{ new Date(extendNewEndDate).toLocaleDateString('ar-IQ') }}</p>
              </div>
              <div class="mr-auto text-right">
                <p class="text-[10px] text-gray-400">مدة إضافية</p>
                <p class="text-sm font-bold text-teal-600">+ {{ extendForm.days }} يوم</p>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">سبب التمديد / ملاحظة</label>
              <input
                type="text"
                v-model="extendForm.notes"
                placeholder="مثال: هدية / تعويض انقطاع / ..."
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <button @click="showExtendModal = false" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
            <button @click="saveExtend" :disabled="saving || !extendForm.days || Number(extendForm.days) < 1"
              class="px-6 py-2.5 bg-gradient-to-l from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-teal-200">
              <i v-if="saving" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-calendar-plus text-xs"></i>
              {{ saving ? 'جاري التمديد...' : 'تأكيد التمديد' }}
            </button>
          </div>

        </div>
      </div>
    </transition>

    <!-- ===== Send Message Modal ===== -->
    <transition name="modal">
      <div v-if="showSendMessageModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4" @click.self="!messageSending && (showSendMessageModal = false)">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
          <!-- Header -->
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <i class="fab fa-whatsapp text-green-500 text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary">إرسال رسالة واتساب</h3>
                <p class="text-xs text-gray-400">{{ contextMenuSub?.name }} — {{ contextMenuSub?.phone }}</p>
              </div>
            </div>
            <button @click="showSendMessageModal = false" :disabled="messageSending" class="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- Quick Templates -->
            <div>
              <p class="text-xs font-semibold text-gray-500 mb-2">قوالب سريعة</p>
              <div class="flex flex-wrap gap-2">
                <button v-for="tpl in messageTemplates" :key="tpl.label"
                  @click="applyTemplate(tpl)"
                  class="text-[11px] px-3 py-1.5 bg-gray-100 hover:bg-green-50 hover:text-green-700 hover:border-green-200 border border-transparent text-gray-600 rounded-lg transition">
                  <i :class="tpl.icon" class="mr-1"></i>{{ tpl.label }}
                </button>
              </div>
            </div>

            <!-- Message Text -->
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-2">نص الرسالة</label>
              <textarea v-model="messageForm.text" rows="5"
                placeholder="اكتب رسالتك هنا... يمكنك استخدام {الاسم} و{الرقم} و{تاريخ_الانتهاء}"
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"></textarea>
              <p class="text-[11px] text-gray-400 mt-1">المتغيرات: <span class="font-mono bg-gray-100 px-1 rounded">{الاسم}</span> <span class="font-mono bg-gray-100 px-1 rounded">{الرقم}</span> <span class="font-mono bg-gray-100 px-1 rounded">{تاريخ_الانتهاء}</span></p>
            </div>

            <!-- WhatsApp status warning -->
            <div v-if="!whatsappConnected" class="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-xl px-4 py-3">
              <i class="fas fa-exclamation-triangle"></i>
              واتساب غير متصل — سيتم فتح wa.me كبديل
            </div>
          </div>

          <div class="px-6 pb-5 flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button @click="showSendMessageModal = false" :disabled="messageSending" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition disabled:opacity-40">إلغاء</button>
            <button @click="sendMessage" :disabled="messageSending || !messageForm.text.trim()" class="px-6 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition flex items-center gap-2">
              <i v-if="messageSending" class="fas fa-spinner fa-spin text-sm"></i>
              <i v-else class="fab fa-whatsapp text-sm"></i>
              {{ messageSending ? 'جاري الإرسال...' : 'إرسال' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirm Modal -->
    <transition name="fade">
      <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" @click.self="showDeleteConfirmModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-red-600 to-red-800 px-6 py-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-trash text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-white font-bold text-lg">حذف المشترك نهائياً</h3>
              <p class="text-red-200 text-xs mt-0.5">يرجى قراءة التحذير قبل المتابعة</p>
            </div>
            <button @click="showDeleteConfirmModal = false" class="mr-auto w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6">
            <div class="flex items-start gap-4 mb-5 p-4 bg-red-50 border border-red-200 rounded-xl">
              <i class="fas fa-exclamation-circle text-red-500 text-xl mt-0.5 flex-shrink-0"></i>
              <div>
                <p class="font-bold text-red-800 text-sm mb-1">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
                <p class="text-red-700 text-xs leading-relaxed">سيتم حذف المشترك <strong>{{ deleteTargetSub?.name }}</strong> وجميع بياناته بشكل نهائي من النظام.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-2 mb-5">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-times-circle text-red-400 w-4"></i>
                <span>حذف بيانات المشترك نهائياً</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-times-circle text-red-400 w-4"></i>
                <span>حذف جميع سجلات الاشتراكات المرتبطة</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-times-circle text-red-400 w-4"></i>
                <span>لا يمكن استعادة البيانات بعد الحذف</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="showDeleteConfirmModal = false" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
              <button @click="confirmDelete" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white text-sm font-bold rounded-xl transition shadow-sm">
                <i class="fas fa-trash ml-2"></i>تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Suspend Confirm Modal -->
    <transition name="fade">
      <div v-if="showSuspendConfirmModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4" @click.self="showSuspendConfirmModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <!-- Header -->
          <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5 flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-ban text-white text-xl"></i>
            </div>
            <div>
              <h3 class="text-white font-bold text-lg">إلغاء / إيقاف الاشتراك</h3>
              <p class="text-orange-100 text-xs mt-0.5">يرجى قراءة التحذير قبل المتابعة</p>
            </div>
            <button @click="showSuspendConfirmModal = false" class="mr-auto w-8 h-8 flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
          <!-- Body -->
          <div class="p-6">
            <div class="flex items-start gap-4 mb-5 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <i class="fas fa-exclamation-triangle text-orange-500 text-xl mt-0.5 flex-shrink-0"></i>
              <div>
                <p class="font-bold text-orange-800 text-sm mb-1">تحذير: هذه العملية لا يمكن التراجع عنها</p>
                <p class="text-orange-700 text-xs leading-relaxed">سيتم إلغاء اشتراك المشترك <strong>{{ suspendTargetSub?.name }}</strong> وحذف جميع سجلات اشتراكاته، مما يؤدي إلى تصفير تاريخ الانتهاء والأيام المتبقية.</p>
              </div>
            </div>
            <div class="grid grid-cols-1 gap-2 mb-5">
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-check-circle text-red-400 w-4"></i>
                <span>تغيير حالة المشترك إلى <strong class="text-red-600">موقوف</strong></span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-check-circle text-red-400 w-4"></i>
                <span>حذف جميع سجلات الاشتراكات المرتبطة</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <i class="fas fa-check-circle text-red-400 w-4"></i>
                <span>تصفير تاريخ الانتهاء والأيام المتبقية</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button @click="showSuspendConfirmModal = false" class="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition">إلغاء</button>
              <button @click="confirmSuspend" class="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-bold rounded-xl transition shadow-sm">
                <i class="fas fa-ban ml-2"></i>تأكيد الإيقاف
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../api';
import { logActivity } from '../../utils/activityLog';
import { useAuthStore } from '../../stores/auth';

const search = ref('');
const filterStatus = ref('');
const filterManager = ref<number | ''>('');
const filterPackage = ref<number | ''>('');
const currentPage = ref(1);
const pageSize = ref(10);
const showModal = ref(false);
const showSuspendConfirmModal = ref(false);
const suspendTargetSub = ref<any>(null);
const showDeleteConfirmModal = ref(false);
const deleteTargetSub = ref<any>(null);
const selectedIds = ref<number[]>([]);

const allSelected = computed(() =>
  filteredSubs.value.length > 0 && filteredSubs.value.every(s => selectedIds.value.includes(s.id))
);

const someSelected = computed(() =>
  selectedIds.value.length > 0 && !allSelected.value
);

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = filteredSubs.value.map(s => s.id);
  }
}

function toggleRow(id: number) {
  const idx = selectedIds.value.indexOf(id);
  if (idx === -1) selectedIds.value.push(id);
  else selectedIds.value.splice(idx, 1);
}
const saving = ref(false);
const subscribers = ref<any[]>([]);
const packages = ref<any[]>([]);
const managers = ref<any[]>([]);
const routers = ref<any[]>([]);
const editingId = ref<number | null>(null);
const toast = ref({ show: false, message: '', type: 'success' });

import SubscriberDetailsModal from './components/SubscriberDetailsModal.vue';
const auth = useAuthStore();

function hasSubscriberPermission(action: string) {
  return auth.hasPermission(`internet.subscribers.${action}`);
}

const form = ref({
  name: '', phone: '', address: '', username: '', password: '',
  ipAddress: '', cabinetSector: '', packageId: null as number | null,
  managerId: null as number | null, routerId: null as number | null,
  notes: '', subStartDate: '', subEndDate: ''
});

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3000);
}

const filteredSubs = computed(() =>
  subscribers.value.filter(s => {
    const matchSearch = !search.value ||
      s.name?.includes(search.value) ||
      s.phone?.includes(search.value) ||
      s.username?.includes(search.value);
    const matchManager = !filterManager.value || s.manager?.id === filterManager.value;
    const matchPackage = !filterPackage.value || s.package?.id === filterPackage.value;
    let matchStatus = true;
    if (filterStatus.value) {
      const sub = getLatestSub(s);
      const days = sub?.endDate ? remainingDays(sub.endDate) : null;
      if (filterStatus.value === 'active') matchStatus = s.status === 'active' && (days === null || days > 0);
      else if (filterStatus.value === 'suspended') matchStatus = s.status === 'suspended';
      else if (filterStatus.value === 'expired') matchStatus = days !== null && days < 0;
      else if (filterStatus.value === 'expiring_today') matchStatus = days !== null && days === 0;
      else if (filterStatus.value === 'expiring_soon') matchStatus = days !== null && days > 0 && days <= 7;
    }
    return matchSearch && matchStatus && matchManager && matchPackage;
  })
);

const totalPages = computed(() => Math.max(1, Math.ceil(filteredSubs.value.length / pageSize.value)));

const pagedSubs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredSubs.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const delta = 2;
  const pages: number[] = [];
  for (let i = Math.max(1, cur - delta); i <= Math.min(total, cur + delta); i++) pages.push(i);
  return pages;
});

// Reset page on filter change
function resetPage() { currentPage.value = 1; }
watch([search, filterStatus, filterManager, filterPackage], resetPage);

// Auto-fill subscription end date based on package duration
watch(() => [form.value.subStartDate, form.value.packageId] as const, ([date, pkgId]) => {
  subManualEndDate.value = false;
  if (date && pkgId) {
    const pkg = packages.value.find((p: any) => p.id === Number(pkgId));
    if (pkg?.duration) {
      const d = new Date(date);
      d.setDate(d.getDate() + pkg.duration);
      form.value.subEndDate = d.toISOString().split('T')[0];
    }
  } else {
    form.value.subEndDate = '';
  }
});

// Toggle for manual end date override
const subManualEndDate = ref(false);

// Computed: end date preview for the form subscription section
const subFormEndDatePreview = computed(() => {
  const { subStartDate, packageId } = form.value;
  if (!subStartDate || !packageId) return null;
  const pkg = packages.value.find((p: any) => p.id === Number(packageId));
  if (!pkg?.duration) return null;
  const d = new Date(subStartDate);
  d.setDate(d.getDate() + pkg.duration);
  return d.toISOString().split('T')[0];
});

// Computed: package duration for label
const subFormPackageDuration = computed(() => {
  if (!form.value.packageId) return 0;
  const pkg = packages.value.find((p: any) => p.id === Number(form.value.packageId));
  return pkg?.duration ?? 0;
});

// Computed: remaining days preview
const subFormRemainingDays = computed(() => {
  const endDate = subManualEndDate.value ? form.value.subEndDate : subFormEndDatePreview.value;
  if (!endDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86400000);
});

const expiringCount = computed(() =>
  subscribers.value.filter(s => {
    const sub = getLatestSub(s);
    if (!sub?.endDate) return false;
    const d = remainingDays(sub.endDate);
    return d >= 0 && d <= 7;
  }).length
);

function avatarColor(name: string): string {
  const colors = ['#6366f1','#8b5cf6','#ec4899','#f97316','#10b981','#3b82f6','#14b8a6','#f59e0b'];
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

async function loadData() {
  try {
    const [subRes, pkgRes, mgrRes, rtrRes] = await Promise.allSettled([
      api.get('/subscribers'), api.get('/packages'), api.get('/managers'), api.get('/routers')
    ]);
    if (subRes.status === 'fulfilled') subscribers.value = subRes.value.data;
    else showToast('فشل تحميل بيانات المشتركين', 'error');
    if (pkgRes.status === 'fulfilled') packages.value = pkgRes.value.data;
    if (mgrRes.status === 'fulfilled') managers.value = mgrRes.value.data;
    if (rtrRes.status === 'fulfilled') routers.value = rtrRes.value.data;
  } catch {
    showToast('فشل تحميل البيانات', 'error');
  }
}

function openAdd() {
  editingId.value = null;
  subManualEndDate.value = false;
  const today = new Date().toISOString().split('T')[0];
  form.value = { name: '', phone: '', address: '', username: '', password: '', ipAddress: '', cabinetSector: '', packageId: null, managerId: null, routerId: null, notes: '', subStartDate: today, subEndDate: '' };
  showModal.value = true;
}

function openEdit(sub: any) {
  editingId.value = sub.id;
  subManualEndDate.value = false;
  form.value = {
    name: sub.name,
    phone: sub.phone || '',
    address: sub.address || '',
    username: sub.username || '',
    password: '',  // leave blank = keep current password
    ipAddress: sub.ipAddress || '',
    cabinetSector: sub.cabinetSector || '',
    packageId: sub.package?.id ?? null,
    managerId: sub.manager?.id ?? null,
    routerId: sub.router?.id ?? null,
    notes: sub.notes || '',
    subStartDate: '',
    subEndDate: ''
  };
  showModal.value = true;
}

async function save() {
  if (!form.value.name.trim()) return showToast('يرجى إدخال الاسم', 'error');
  if (!form.value.phone.trim()) return showToast('يرجى إدخال رقم الهاتف', 'error');
  if (!form.value.address.trim()) return showToast('يرجى إدخال العنوان', 'error');
  if (!form.value.username.trim()) return showToast('يرجى إدخال اسم المستخدم', 'error');

  saving.value = true;
  try {
    const payload: any = {
      name: form.value.name.trim(),
      phone: form.value.phone.trim(),
      address: form.value.address.trim(),
      username: form.value.username.trim(),
      notes: form.value.notes.trim() || undefined,
    };
    if (form.value.password?.trim()) payload.password = form.value.password.trim();
    if (form.value.routerId) payload.routerId = Number(form.value.routerId);
    if (form.value.ipAddress?.trim()) payload.ipAddress = form.value.ipAddress.trim();
    if (form.value.cabinetSector?.trim()) payload.cabinetSector = form.value.cabinetSector.trim();
    if (form.value.packageId) payload.packageId = Number(form.value.packageId);
    if (form.value.managerId) payload.managerId = Number(form.value.managerId);
    if (!editingId.value && form.value.subStartDate) {
      // Attach current time so endDate is calculated with same time-of-day
      const [y, m, d] = form.value.subStartDate.split('-').map(Number);
      const now = new Date();
      const startDt = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
      payload.subStartDate = startDt.toISOString();
      // Use manual override if present, otherwise use auto-calculated end date
      const effectiveEndDate = subManualEndDate.value ? form.value.subEndDate : (subFormEndDatePreview.value || form.value.subEndDate);
      if (effectiveEndDate) {
        const [ey, em, ed] = effectiveEndDate.split('-').map(Number);
        const endDt = new Date(ey, em - 1, ed, now.getHours(), now.getMinutes(), now.getSeconds());
        payload.subEndDate = endDt.toISOString();
      }
    }

    if (editingId.value) {
      await api.patch(`/subscribers/${editingId.value}`, payload);
      logActivity({
        action: 'update',
        module: 'subscribers',
        details: ` تعديل بيانات المشترك: ${form.value.name} (${form.value.username})`
      });
      showToast('تم تعديل المشترك بنجاح');
    } else {
      const response = await api.post('/subscribers', payload);
      logActivity({
        action: 'create',
        module: 'subscribers',
        details: `إضافة مشترك جديد: ${form.value.name} (${form.value.username})`
      });
      // If a subscription was created, log that too
      if (response.data.subscription) {
        logActivity({
          action: 'create',
          module: 'subscriptions',
          details: `إنشاء اشتراك تلقائي للمشترك الجديد: ${form.value.name}`
        });
      }
      showToast('تم إضافة المشترك بنجاح');
    }
    showModal.value = false;
    await loadData();
  } catch (err: any) {
    const msg = err?.response?.data?.message;
    showToast(Array.isArray(msg) ? msg[0] : (msg || 'حدث خطأ أثناء الحفظ'), 'error');
  } finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا المشترك؟')) return;
  try {
    await api.delete(`/subscribers/${id}`);
    showToast('تم حذف المشترك');
    await loadData();
  } catch {
    showToast('فشل حذف المشترك', 'error');
  }
}

function getLatestSub(sub: any) {
  if (!sub.subscriptions || sub.subscriptions.length === 0) return null;
  return [...sub.subscriptions].sort((a: any, b: any) =>
    new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
  )[0];
}

function getEffectiveStatus(sub: any): 'active' | 'expired' | 'suspended' | 'disabled' {
  if (sub.status === 'suspended') return 'suspended';
  if (sub.isEnabled === false) return 'disabled';
  const latest = getLatestSub(sub);
  if (!latest) return 'expired';
  if (latest?.endDate) {
    const days = remainingDays(latest.endDate);
    if (days < 0) return 'expired';
  }
  return 'active';
}

function getStatusClass(sub: any): string {
  const s = getEffectiveStatus(sub);
  if (s === 'active') return 'bg-emerald-400';
  if (s === 'expired') return 'bg-red-400';
  if (s === 'disabled') return 'bg-gray-400';
  return 'bg-orange-400';
}

function getStatusTitle(sub: any): string {
  const s = getEffectiveStatus(sub);
  if (s === 'active') return 'فعال';
  if (s === 'expired') return 'منتهي الصلاحية';
  if (s === 'disabled') return 'معطّل (محظور من الاتصال)';
  return 'موقوف';
}

function remainingDays(endDate: string | Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysClass(days: number): string {
  if (days > 7)  return 'bg-green-100 text-green-700';
  if (days > 0)  return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-600';
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = new Date(date);
  const datePart = d.toLocaleDateString('ar-IQ', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const timePart = d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${datePart} ${timePart}`;
}

onMounted(loadData);

// ===================== CONTEXT MENU =====================
const contextMenu = ref({ show: false, x: 0, y: 0 });
const contextMenuSub = ref<any>(null);
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

function showContextMenu(event: MouseEvent, sub: any) {
  event.preventDefault();
  contextMenuSub.value = sub;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = event.clientX;
  let y = event.clientY;
  if (x + 220 > vw) x = vw - 230;
  if (y + 420 > vh) y = Math.max(8, vh - 430);
  contextMenu.value = { show: true, x, y };
}

function startLongPress(event: MouseEvent, sub: any) {
  if (event.button !== 0) return;
  longPressTimer = setTimeout(() => {
    showContextMenu(event, sub);
  }, 700);
}

function cancelLongPress() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

function closeContextMenu() {
  contextMenu.value.show = false;
}

// ===================== ACTIVATE MODAL =====================
const showActivateModal = ref(false);
const activateForm = ref({
  paymentMethod: 'cash' as 'cash' | 'credit' | 'partial',
  partialAmount: '' as string | number,
  notes: '',
  startDate: '',
});
const activateResult = ref<{ endDate: string; remainingDays: number } | null>(null);

const activatePackage = computed(() => {
  const sub = contextMenuSub.value;
  if (!sub) return null;
  if (sub.package?.id) return packages.value.find((p: any) => p.id === sub.package.id) || sub.package;
  return null;
});

const activateEndDatePreview = computed(() => {
  if (!activateForm.value.startDate) return null;
  const pkg = activatePackage.value;
  if (!pkg?.duration) return null;
  const d = new Date(activateForm.value.startDate);
  d.setDate(d.getDate() + pkg.duration);
  return d.toISOString().split('T')[0];
});

const activateRemainingPreview = computed(() => {
  if (!activateEndDatePreview.value) return null;
  return remainingDays(activateEndDatePreview.value);
});

const activatePartialRemaining = computed(() => {
  const pkg = activatePackage.value;
  const price = Number(pkg?.price || 0);
  const partial = Number(activateForm.value.partialAmount || 0);
  return Math.max(0, price - partial);
});

function openActivateModal() {
  const sub = contextMenuSub.value;
  closeContextMenu();
  if (!sub) return;
  activateForm.value = {
    paymentMethod: 'cash',
    partialAmount: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  };
  activateResult.value = null;
  showActivateModal.value = true;
}

async function saveActivate() {
  const sub = contextMenuSub.value;
  if (!sub) return;
  saving.value = true;
  try {
    // Attach current time so endDate is calculated with same time-of-day
    const [y, m, d] = activateForm.value.startDate.split('-').map(Number);
    const now = new Date();
    const startDt = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
    const payload: any = {
      status: 'active',
      isEnabled: true,
      subStartDate: startDt.toISOString(),
      paymentMethod: activateForm.value.paymentMethod,
    };
    if (sub.package?.id) payload.packageId = sub.package.id;
    if (activateForm.value.notes.trim()) payload.notes = activateForm.value.notes.trim();
    if (activateForm.value.paymentMethod === 'partial' && activateForm.value.partialAmount) {
      payload.partialAmount = Number(activateForm.value.partialAmount);
    }
    await api.patch(`/subscribers/${sub.id}`, payload);
    activateResult.value = activateEndDatePreview.value
      ? { endDate: activateEndDatePreview.value, remainingDays: activateRemainingPreview.value ?? 0 }
      : null;
    logActivity({
      action: 'activate',
      module: 'subscriptions',
      details: `تفعيل اشتراك للمشترك ${contextMenuSub.value.name} بباقة ${activatePackage.value?.name || ''} وطريقة دفع ${payload.paymentMethod}`
    });
    showToast('تم تفعيل الاشتراك بنجاح!');
    showActivateModal.value = false;
    await loadData();
  } catch { showToast('فشل تفعيل المشترك', 'error'); }
  finally { saving.value = false; }
}

async function suspendSub() {
  if (!contextMenuSub.value) return;
  try {
    await api.patch(`/subscribers/${contextMenuSub.value.id}/suspend`);
    logActivity({
      action: 'suspend',
      module: 'subscribers',
      details: `إلغاء اشتراك للمشترك: ${contextMenuSub.value.name}`
    });
    showToast('تم إلغاء الاشتراك بنجاح');
    loadData();
  } catch (error) {
    showToast('فشل إلغاء الاشتراك', 'error');
  }
}

function openEditFromMenu() {
  const sub = contextMenuSub.value;
  closeContextMenu();
  if (sub) openEdit(sub);
}

async function deleteFromMenu() {
  if (!contextMenuSub.value) return;
  try {
    await api.delete(`/subscribers/${contextMenuSub.value.id}`);
    logActivity({
      action: 'delete',
      module: 'subscribers',
      details: `حذف المشترك: ${contextMenuSub.value.name} (${contextMenuSub.value.username})`
    });
    showToast('تم حذف المشترك بنجاح');
    loadData();
  } catch (error) {
    showToast('فشل حذف المشترك', 'error');
  }
}

async function toggleEnabled() {
  if (!contextMenuSub.value) return;
  const newVal = contextMenuSub.value.isEnabled !== false;
  try {
    await api.patch(`/subscribers/${contextMenuSub.value.id}/toggle-enabled`, { isEnabled: !newVal });
    const actionText = !newVal ? 'إلغاء تعطيل' : 'تعطيل';
    logActivity({
      action: 'toggle_enabled',
      module: 'subscribers',
      details: `${actionText} المشترك: ${contextMenuSub.value.name}`
    });
    showToast(`تم ${actionText} المشترك بنجاح`);
    loadData();
  } catch (error) {
    showToast('فشل تغيير حالة الراوتر', 'error');
  }
}

async function syncToRouter() {
  if (!contextMenuSub.value || !contextMenuSub.value.router) {
    showToast('لم يحدد راوتر لهذا المشترك', 'error');
    return;
  }
  try {
    await api.post(`/subscribers/${contextMenuSub.value.id}/sync`);
    logActivity({
      action: 'sync',
      module: 'subscribers',
      details: `مزامنة المشترك مع الراوتر: ${contextMenuSub.value.name}`
    });
    showToast('تمت المزامنة مع الراوتر بنجاح');
  } catch (error) {
    showToast('فشلت المزامنة', 'error');
  }
}

async function confirmDelete() {
  const sub = deleteTargetSub.value;
  if (!sub) return;
  showDeleteConfirmModal.value = false;
  try {
    await api.delete(`/subscribers/${sub.id}`);
    logActivity({
      action: 'delete',
      module: 'subscribers',
      details: `حذف المشترك: ${sub.name} (${sub.username})`
    });
    showToast('تم حذف المشترك نهائياً');
    await loadData();
  } catch {
    showToast('فشل حذف المشترك', 'error');
  }
}

// ===================== CHANGE PACKAGE MODAL =====================
const showChangePackageModal = ref(false);
const changePackageForm = ref({ packageId: '' as any, startDate: '' });

// DETAILS MODAL - عرض التفاصيل
const showDetailsModal = ref(false);
const detailSub = ref<any>(null);

function openDetailsFromMenu() {
  const sub = contextMenuSub.value;
  closeContextMenu();
  if (!sub) return;
  detailSub.value = sub;
  showDetailsModal.value = true;
}

function closeDetailsModal() {
  showDetailsModal.value = false;
}

function openChangePackage() {
  const sub = contextMenuSub.value;
  closeContextMenu();
  if (!sub) return;
  changePackageForm.value = {
    packageId: sub.package?.id ?? '',
    startDate: new Date().toISOString().split('T')[0],
  };
  showChangePackageModal.value = true;
}

async function saveChangePackage() {
  const sub = contextMenuSub.value;
  if (!sub) return;
  if (!changePackageForm.value.packageId) return showToast('يرجى اختيار باقة', 'error');
  saving.value = true;
  try {
    let subStartDate: string | undefined;
    if (changePackageForm.value.startDate) {
      // Attach current time so endDate is calculated with same time-of-day
      const [y, m, d] = changePackageForm.value.startDate.split('-').map(Number);
      const now = new Date();
      subStartDate = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds()).toISOString();
    }
    await api.patch(`/subscribers/${sub.id}`, {
      packageId: Number(changePackageForm.value.packageId),
      subStartDate: subStartDate,
    });
    logActivity({
      action: 'change_package',
      module: 'subscriber',
      details: `تغيير باقة المشترك ${contextMenuSub.value.name} إلى ${packages.value.find(p => p.id === changePackageForm.value.packageId)?.name || 'غير معروف'}`
    });
    showToast('تم تغيير الباقة بنجاح');
    showChangePackageModal.value = false;
    await loadData();
  } catch { showToast('فشل تغيير الباقة', 'error'); }
  finally { saving.value = false; }
}

// ===================== ADD DEBT MODAL =====================
const showAddDebtModal = ref(false);
const addDebtForm = ref({ amount: '', reason: '' });
const subscriberSubs = ref<any[]>([]);
const addDebtSubId = ref<number | null>(null);
const payDebtSubId = ref<number | null>(null);

async function loadSubscriberSubs(subscriberId: number) {
  try {
    const { data } = await api.get('/subscriptions');
    subscriberSubs.value = data.filter((s: any) => s.subscriber?.id === subscriberId);
    return subscriberSubs.value;
  } catch {
    subscriberSubs.value = [];
    return [];
  }
}

function formatDateShort(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('ar-IQ', { month: 'short', year: 'numeric' });
}

async function openAddDebt() {
  closeContextMenu();
  addDebtForm.value = { amount: '', reason: '' };
  addDebtSubId.value = null;
  const subs = await loadSubscriberSubs(contextMenuSub.value?.id);
  if (subs.length === 1) addDebtSubId.value = subs[0].id;
  showAddDebtModal.value = true;
}

async function openAddDebtFor(sub: any) {
  contextMenuSub.value = sub;
  await openAddDebt();
}

async function saveAddDebt() {
  if (!addDebtForm.value.amount || isNaN(Number(addDebtForm.value.amount)))
    return showToast('يرجى إدخال مبلغ صحيح', 'error');
  if (!addDebtSubId.value && subscriberSubs.value.length > 0)
    return showToast('يرجى اختيار الاشتراك', 'error');
  const subId = addDebtSubId.value || (subscriberSubs.value[0]?.id);
  if (!subId) return showToast('لا يوجد اشتراك', 'error');
  saving.value = true;
  try {
    await api.post(`/subscriptions/${subId}/debt`, { amount: Number(addDebtForm.value.amount), notes: addDebtForm.value.reason });
    logActivity({
      action: 'add_debt',
      module: 'subscriptions',
      details: `إضافة دين بمبلغ ${addDebtForm.value.amount} على اشتراك المشترك ${contextMenuSub.value.name}`
    });
    showToast(`تم تسجيل دين ${Number(addDebtForm.value.amount).toLocaleString('ar-IQ')} د.ع على ${contextMenuSub.value.name}`);
    showAddDebtModal.value = false;
  } catch { showToast('فشل تسجيل الدين', 'error'); }
  finally { saving.value = false; }
}

// ===================== EXTEND (تمديد) MODAL =====================
const showExtendModal = ref(false);
const extendCurrentSubId = ref<number | null>(null);
const extendCurrentEndDate = ref<string | null>(null);
const extendForm = ref({ days: 30, notes: '' });

const extendCurrentRemainingDays = computed(() => {
  if (!extendCurrentEndDate.value) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(extendCurrentEndDate.value);
  end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / 86400000);
});

const extendNewEndDate = computed(() => {
  const days = Number(extendForm.value.days);
  if (!days || days < 1) return null;
  // Extend from current end date (or today if expired)
  const base = extendCurrentEndDate.value
    ? new Date(Math.max(new Date(extendCurrentEndDate.value).getTime(), Date.now()))
    : new Date();
  base.setDate(base.getDate() + days);
  return base.toISOString().split('T')[0];
});

function openExtend() {
  closeContextMenu();
  const sub = contextMenuSub.value;
  if (!sub) return;
  const latest = getLatestSub(sub);
  extendCurrentSubId.value = latest?.id ?? null;
  extendCurrentEndDate.value = latest?.endDate ?? null;
  extendForm.value = { days: 30, notes: '' };
  showExtendModal.value = true;
}

async function saveExtend() {
  const days = Number(extendForm.value.days);
  if (!days || days < 1) return showToast('يرجى إدخال عدد أيام صحيح', 'error');
  if (!extendNewEndDate.value) return;

  const sub = contextMenuSub.value;
  if (!sub) return;

  saving.value = true;
  try {
    const newEndIso = new Date(extendNewEndDate.value).toISOString();

    if (extendCurrentSubId.value) {
      // مشترك لديه اشتراك حالي — فقط تحديث تاريخ الانتهاء دون أي اثر مالي
      await api.patch(`/subscriptions/${extendCurrentSubId.value}`, { endDate: newEndIso });
    } else {
      // لا يوجد اشتراك — ننشئ اشتراكاً بسعر 0 (بدون أي قيمة مالية)
      const startIso = new Date().toISOString();
      const body: any = {
        subscriber: { id: sub.id },
        startDate: startIso,
        endDate: newEndIso,
        price: 0,
        paidAmount: 0,
        paymentMethod: 'free',
        status: 'active',
      };
      if (sub.package?.id) body.package = { id: sub.package.id };
      await api.post('/subscriptions', body);
    }

    logActivity({
      action: 'extend',
      module: 'subscriptions',
      details: `تمديد اشتراك المشترك ${sub?.name} (${sub?.username}) لمدة ${days} يوم — تاريخ الانتهاء الجديد: ${new Date(extendNewEndDate.value).toLocaleDateString('ar-IQ')}${ extendForm.value.notes ? ' — السبب: ' + extendForm.value.notes : ''}`
    });

    showToast(`تم تمديد اشتراك ${sub?.name} بنجاح لمدة ${days} يوم`);
    showExtendModal.value = false;
    await loadData();
  } catch {
    showToast('فشل تمديد الاشتراك', 'error');
  } finally {
    saving.value = false;
  }
}

// ===================== PAY DEBT MODAL =====================
const showPayDebtModal = ref(false);
const payDebtForm = ref({ amount: '', notes: '' });

async function openPayDebt() {
  closeContextMenu();
  payDebtForm.value = { amount: '', notes: '' };
  payDebtSubId.value = null;
  const subs = await loadSubscriberSubs(contextMenuSub.value?.id);
  if (subs.length === 1) payDebtSubId.value = subs[0].id;
  showPayDebtModal.value = true;
}

async function openPayDebtFor(sub: any) {
  contextMenuSub.value = sub;
  await openPayDebt();
}

async function savePayDebt() {
  if (!payDebtForm.value.amount || isNaN(Number(payDebtForm.value.amount)))
    return showToast('يرجى إدخال مبلغ صحيح', 'error');
  if (!payDebtSubId.value && subscriberSubs.value.length > 0)
    return showToast('يرجى اختيار الاشتراك', 'error');
  const subId = payDebtSubId.value || (subscriberSubs.value[0]?.id);
  if (!subId) return showToast('لا يوجد اشتراك', 'error');
  saving.value = true;
  try {
    await api.post(`/subscriptions/${subId}/pay`, { amount: Number(payDebtForm.value.amount), notes: payDebtForm.value.notes });
    logActivity({
      action: 'pay_debt',
      module: 'subscriptions',
      details: `تسديد دين بمبلغ ${payDebtForm.value.amount} على اشتراك المشترك ${contextMenuSub.value.name}`
    });
    showToast(`تم تسديد الدين بنجاح`);
    showPayDebtModal.value = false;
  } catch { showToast('فشل تسجيل الدفع', 'error'); }
  finally { saving.value = false; }
}

// ===================== PRINT INVOICE =====================
async function printInvoice() {
  const sub = contextMenuSub.value;
  closeContextMenu();
  if (!sub) return;
  const latest = getLatestSub(sub);
  const pkg = sub.package || latest?.package;

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

  // Payment info
  const payLabels: Record<string, string> = { cash: 'نقداً', credit: 'آجل', partial: 'دفع جزئي' };
  const pm = latest?.paymentMethod || '';
  const paid = Number(latest?.paidAmount ?? 0);
  const debt = Number(latest?.debtAmount ?? 0);
  const price = Number(latest?.price ?? pkg?.price ?? 0);
  const total = price + debt;
  const remaining = total - paid;

  // Invoice number: INV-{subId}-{YYYYMMDD}
  const now = new Date();
  const invNum = `INV-${sub.id}-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;

  // Paper size selector (stored in sessionStorage per window)
  const win = window.open('', '_blank', 'width=700,height=820');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>فاتورة اشتراك - ${sub.name}</title>
<style>
/* ── Reset ── */
*{box-sizing:border-box;margin:0;padding:0}

/* ── Screen base ── */
body{
  font-family:'Segoe UI',Tahoma,Arial,sans-serif;
  background:#f1f5f9;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:24px 12px;
}

/* ── Paper size toolbar (screen only) ── */
.controls{
  display:flex;
  gap:8px;
  margin-bottom:16px;
  flex-wrap:wrap;
  justify-content:center;
}
.controls button{
  padding:7px 16px;
  border-radius:8px;
  border:2px solid #c7d2fe;
  background:#fff;
  color:#4338ca;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
  transition:all .15s;
}
.controls button:hover,.controls button.active{
  background:#4338ca;
  color:#fff;
  border-color:#4338ca;
}
.controls .print-btn{
  background:#16a34a;
  color:#fff;
  border-color:#16a34a;
  padding:7px 22px;
}
.controls .print-btn:hover{background:#15803d}

/* ── Invoice card ── */
.invoice{
  background:#fff;
  width:var(--inv-width, 210mm);
  max-width:100%;
  border-radius:10px;
  box-shadow:0 4px 24px rgba(0,0,0,.10);
  overflow:hidden;
  font-size:var(--inv-font, 13px);
  padding-bottom:4px;
}

/* ── Header band ── */
.inv-header{
  background:linear-gradient(135deg,#1e40af 0%,#2563eb 60%,#3b82f6 100%);
  padding:20px 22px 16px;
  text-align:center;
  color:#fff;
}
.inv-header .logo-img{
  max-height:60px;
  max-width:160px;
  object-fit:contain;
  margin-bottom:8px;
  border-radius:6px;
  background:#fff;
  padding:4px 8px;
}
.inv-header .co-name{font-size:1.25em;font-weight:800;letter-spacing:.5px;margin-bottom:2px}
.inv-header .co-meta{font-size:.8em;opacity:.85;line-height:1.7}
.inv-header .inv-title{
  font-size:1.05em;
  font-weight:700;
  margin-top:10px;
  background:rgba(255,255,255,.18);
  border-radius:6px;
  display:inline-block;
  padding:3px 16px;
  letter-spacing:.5px;
 }

/* ── Dividers ── */
.divider-solid{border:none;border-top:2.5px solid #1e40af;margin:0}
.divider-dashed{border:none;border-top:1.5px dashed #c7d2fe;margin:4px 18px}

/* ── Invoice meta strip ── */
.inv-meta{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px 22px;
  background:#eff6ff;
  flex-wrap:wrap;
  gap:6px;
}
.inv-meta .meta-item{font-size:.82em;color:#1e40af}
.inv-meta .meta-item strong{display:block;font-size:1em;color:#1e3a8a}

/* ── Body ── */
.inv-body{padding:14px 22px 10px}

/* ── Section label ── */
.sec-label{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:.72em;
  font-weight:800;
  text-transform:uppercase;
  letter-spacing:.8px;
  color:#6366f1;
  margin-bottom:8px;
  padding-bottom:5px;
  border-bottom:1.5px solid #e0e7ff;
}
.sec-label .dot{
  width:6px;height:6px;border-radius:50%;background:#6366f1;flex-shrink:0;
}

/* ── Data rows ── */
.data-table{width:100%;border-collapse:collapse;font-size:.95em}
.data-table tr td{padding:5px 2px;vertical-align:top}
.data-table tr td:first-child{color:#64748b;width:42%;white-space:nowrap}
.data-table tr td:last-child{font-weight:600;color:#1e293b;text-align:left}
.data-table tr:not(:last-child) td{border-bottom:1px dashed #f1f5f9}

/* ── Payment box ── */
.pay-box{
  border-radius:10px;
  padding:12px 14px;
  margin-top:4px;
}
.pay-box.cash{background:#f0fdf4;border:1.5px solid #bbf7d0}
.pay-box.credit{background:#eff6ff;border:1.5px solid #bfdbfe}
.pay-box.partial{background:#fff7ed;border:1.5px solid #fed7aa}
.pay-box.default{background:#f8fafc;border:1.5px solid #e2e8f0}
.pay-method-badge{
  display:inline-flex;align-items:center;gap:5px;
  padding:4px 12px;border-radius:999px;font-weight:700;font-size:.85em;
  margin-bottom:8px;
}
.pay-method-badge.cash{background:#dcfce7;color:#15803d}
.pay-method-badge.credit{background:#dbeafe;color:#1d4ed8}
.pay-method-badge.partial{background:#ffedd5;color:#c2410c}
.pay-row{display:flex;justify-content:space-between;font-size:.9em;padding:3px 0}
.pay-row .pl{color:#64748b}
.pay-row .pv{font-weight:700}
.pay-row .pv.green{color:#16a34a}
.pay-row .pv.red{color:#dc2626}
.pay-total{
  display:flex;justify-content:space-between;
  font-size:1em;font-weight:800;
  padding:7px 0 3px;
  border-top:2px solid currentColor;
  margin-top:6px;
 }

/* ── End date highlight ── */
.end-date-box{
  background:#fef2f2;border:1.5px solid #fecaca;border-radius:8px;
  padding:8px 14px;display:flex;align-items:center;justify-content:space-between;
  margin-top:10px;
}
.end-date-box.active{background:#f0fdf4;border-color:#bbf7d0}
.end-date-box .edt-label{font-size:.8em;color:#64748b}
.end-date-box .edt-val{font-size:1.05em;font-weight:800;color:#dc2626}
.end-date-box.active .edt-val{color:#16a34a}

/* ── Footer ── */
.inv-footer{
  text-align:center;
  padding:14px 22px 16px;
  background:linear-gradient(135deg,#f8fafc,#eff6ff);
  border-top:2.5px solid #1e40af;
}
.inv-footer .closing{font-size:1em;font-weight:700;color:#1e40af;margin-bottom:4px}
.inv-footer .sub-closing{font-size:.78em;color:#94a3b8}

/* ══════════════════════════════════════
   PRINT STYLES
══════════════════════════════════════ */
@media print{
  body{background:#fff;padding:0;display:block}
  .controls{display:none!important}
  .invoice{
    box-shadow:none;
    border-radius:0;
    width:100%!important;
    max-width:100%!important;
  }
 }

/* ── Thermal 80mm ── */
@media print and (max-width:80mm){
  :root{--inv-font:10px}
  .inv-header{padding:10px 10px 8px}
  .inv-header .logo-img{max-height:36px;max-width:90px}
  .inv-header .co-name{font-size:1.1em}
  .inv-meta{padding:6px 10px}
  .inv-body{padding:8px 10px 6px}
  .pay-box{padding:8px 10px}
  .inv-footer{padding:8px 10px 10px}
  .end-date-box{padding:6px 10px}
 }

/* ── Thermal 58mm ── */
@media print and (max-width:58mm){
  :root{--inv-font:9px}
  .inv-header{padding:8px 8px 6px}
  .inv-header .logo-img{max-height:28px;max-width:70px}
  .inv-header .co-name{font-size:1em}
  .inv-header .co-meta{display:none}
  .inv-meta{padding:5px 8px;flex-direction:column;gap:2px}
  .inv-body{padding:6px 8px 4px}
  .pay-box{padding:6px 8px}
  .inv-footer{padding:6px 8px 8px}
  .end-date-box{padding:5px 8px}
  .sec-label{font-size:.68em}
 }

/* ── A5 ── */
@page{margin:8mm}
@page :size A5{margin:10mm}
</style>
</head>
<body>

<!-- ── Paper controls (screen only) ── -->
<div class="controls" id="ctrl">
  <span style="font-size:12px;color:#64748b;align-self:center;font-weight:600;">حجم الورق:</span>
  <button class="active" onclick="setPaper('a5')">A5</button>
  <button onclick="setPaper('80mm')">حراري 80mm</button>
  <button onclick="setPaper('58mm')">حراري 58mm</button>
  <button class="print-btn" onclick="window.print()">🖨 طباعة</button>
</div>

<!-- ── Invoice ── -->
<div class="invoice" id="inv">

  <!-- Header -->
  <div class="inv-header">
    ${logo ? `<img class="logo-img" src="${logo}" alt="شعار"/>` : ''}
    ${co.companyName ? `<div class="co-name">${co.companyName}</div>` : ''}
    ${(co.companyPhone || co.companyEmail || co.companyAddress) ? `
      <div class="co-meta">
        ${co.companyPhone ? `📞 ${co.companyPhone}` : ''}
        ${co.companyEmail ? ` &nbsp;|&nbsp; ✉ ${co.companyEmail}` : ''}
        ${co.companyAddress ? `<br/>${co.companyAddress}` : ''}
      </div>` : ''}
    <div class="inv-title">🧾 فاتورة اشتراك انترنت</div>
  </div>

  <hr class="divider-solid"/>

  <!-- Invoice meta -->
  <div class="inv-meta">
    <div class="meta-item">
      <strong>${invNum}</strong>
      رقم الفاتورة
    </div>
    <div class="meta-item" style="text-align:center">
      <strong>${latest?.startDate ? new Date(latest.startDate).toLocaleDateString('ar-IQ') : now.toLocaleDateString('ar-IQ')}</strong>
      تاريخ الاشتراك
    </div>
    <div class="meta-item" style="text-align:left">
      <strong>${now.toLocaleDateString('ar-IQ')}</strong>
      تاريخ الطباعة
    </div>
  </div>

  <hr class="divider-solid"/>

  <div class="inv-body">

    <!-- Subscriber info -->
    <div class="sec-label"><span class="dot"></span>بيانات المشترك</div>
    <table class="data-table">
      <tr><td>الاسم الكامل</td><td>${sub.name}</td></tr>
      <tr><td>اسم الدخول</td><td>${sub.username || '—'}</td></tr>
      <tr><td>رقم الهاتف</td><td>${sub.phone || '—'}</td></tr>
      <tr><td>العنوان</td><td>${sub.address || '—'}</td></tr>
      ${pkg ? `<tr><td>الباقة</td><td>${pkg.name || '—'}</td></tr>` : ''}
    </table>

    <div style="height:12px"></div>
    <hr class="divider-dashed"/>
    <div style="height:10px"></div>

    <!-- Payment -->
    <div class="sec-label"><span class="dot"></span>تفاصيل الدفع</div>
    <div class="pay-box ${pm || 'default'}">
      ${pm ? `<div class="pay-method-badge ${pm}">
        ${pm === 'cash' ? '💵 نقداً' : pm === 'credit' ? '📋 آجل' : '🔄 دفع جزئي'}
      </div>` : ''}
      ${price > 0 ? `<div class="pay-row"><span class="pl">سعر الباقة</span><span class="pv">${price.toLocaleString('ar-IQ')} د.ع</span></div>` : ''}
      ${debt > 0 ? `<div class="pay-row"><span class="pl">دين مضاف</span><span class="pv red">+ ${debt.toLocaleString('ar-IQ')} د.ع</span></div>` : ''}
      ${(debt > 0 && price > 0) ? `<div class="pay-row" style="border-top:1px dashed #c7d2fe;padding-top:4px;margin-top:2px"><span class="pl">الإجمالي</span><span class="pv">${total.toLocaleString('ar-IQ')} د.ع</span></div>` : ''}
      ${paid > 0 ? `<div class="pay-row"><span class="pl">المدفوع</span><span class="pv green">✓ ${paid.toLocaleString('ar-IQ')} د.ع</span></div>` : ''}
      ${(total > 0 && pm !== 'cash') || remaining > 0 ? `
        <div class="pay-total" style="color:${remaining > 0 ? '#dc2626' : '#16a34a'}">
          <span>المتبقّي</span>
          <span>${remaining.toLocaleString('ar-IQ')} د.ع</span>
        </div>` : ''}
    </div>

    <!-- End date -->
    ${latest?.endDate ? (() => {
      const daysLeft = Math.ceil((new Date(latest.endDate).getTime() - Date.now()) / 86400000);
      const isActive = daysLeft >= 0;
      return `<div class="end-date-box ${isActive ? 'active' : ''}">
        <div>
          <div class="edt-label">تاريخ انتهاء الاشتراك</div>
          <div class="edt-val">${new Date(latest.endDate).toLocaleDateString('ar-IQ', { year:'numeric',month:'long',day:'numeric' })}</div>
        </div>
        <div style="text-align:center;font-size:.8em;font-weight:700;color:${isActive ? '#16a34a' : '#dc2626'}">
          ${isActive ? `متبقي\n${daysLeft} يوم` : 'منتهي'}
        </div>
      </div>`;
    })() : ''}

  </div>

  <!-- Footer -->
  <div class="inv-footer">
    <div class="closing">✨ شكراً لثقتكم بخدماتنا ✨</div>
    <div class="sub-closing">نتطلع دائماً لتقديم أفضل خدمة اتصالات — يسعدنا خدمتكم في أي وقت</div>
  </div>

</div>

<script>
var sizes={a5:'210mm',t80:'80mm',t58:'58mm'};
var cur='a5';
function setPaper(s){
  cur=s;
  var inv=document.getElementById('inv');
  var btns=document.querySelectorAll('.controls button:not(.print-btn)');
  btns.forEach(function(b){b.classList.remove('active')});
  event.target.classList.add('active');
  if(s==='a5'){inv.style.width='210mm';inv.style.fontSize='13px';}
  else if(s==='80mm'){inv.style.width='76mm';inv.style.fontSize='11px';}
  else if(s==='58mm'){inv.style.width='54mm';inv.style.fontSize='9.5px';}
}
<\/script>
</body></html>`);

  win.document.close();
  win.focus();
}

// ===================== SEND MESSAGE MODAL =====================
const showSendMessageModal = ref(false);
const messageSending = ref(false);
const whatsappConnected = ref(false);
const messageForm = ref({ text: '' });

const messageTemplates = [
  { label: 'تجديد الاشتراك', icon: 'fas fa-sync-alt', text: 'عزيزي {الاسم}، نود إعلامكم بأن اشتراككم على وشك الانتهاء في {تاريخ_الانتهاء}. يرجى التواصل معنا لتجديد الاشتراك.' },
  { label: 'انتهاء الاشتراك', icon: 'fas fa-clock', text: 'عزيزي {الاسم}، لقد انتهى اشتراككم. يرجى التجديد لاستمرار الخدمة. للتواصل اتصل بنا.' },
  { label: 'تسديد الدين', icon: 'fas fa-money-bill', text: 'عزيزي {الاسم}، نود تذكيركم بسداد المبلغ المستحق عليكم. يرجى التواصل معنا في أقرب وقت.' },
  { label: 'انقطاع الخدمة', icon: 'fas fa-wifi', text: 'عزيزي {الاسم}، تم إيقاف خدمة الإنترنت مؤقتاً بسبب انتهاء الاشتراك. للتجديد يرجى التواصل معنا.' },
  { label: 'ترحيب', icon: 'fas fa-hand-wave', text: 'مرحباً {الاسم}! نرحب بكم في خدمة الإنترنت. تم تفعيل اشتراككم بنجاح. رقم حسابكم: {الرقم}' },
  { label: 'عرض خاص', icon: 'fas fa-tag', text: 'عزيزي {الاسم}، لدينا عرض خاص حصري لكم! تواصل معنا لمعرفة التفاصيل.' },
];

async function checkWhatsappStatus() {
  try {
    const res = await api.get('/whatsapp/status');
    whatsappConnected.value = res.data?.connected === true;
  } catch {
    whatsappConnected.value = false;
  }
}

function applyTemplate(tpl: { label: string; icon: string; text: string }) {
  const sub = contextMenuSub.value;
  const expiry = sub?.subscriptions?.[0]?.endDate
    ? new Date(sub.subscriptions[0].endDate).toLocaleDateString('ar-IQ')
    : 'غير محدد';
  messageForm.value.text = tpl.text
    .replace(/{الاسم}/g, sub?.name || '')
    .replace(/{الرقم}/g, sub?.phone || '')
    .replace(/{تاريخ_الانتهاء}/g, expiry);
}

function openSendMessage() {
  closeContextMenu();
  messageForm.value = { text: '' };
  checkWhatsappStatus();
  showSendMessageModal.value = true;
}

async function sendMessage() {
  if (!messageForm.value.text.trim()) return showToast('يرجى كتابة الرسالة', 'error');
  const sub = contextMenuSub.value;
  const phone = sub?.phone?.replace(/\D/g, '');
  if (!phone) return showToast('لا يوجد رقم هاتف لهذا المشترك', 'error');

  // If WhatsApp is connected, send via backend
  if (whatsappConnected.value) {
    messageSending.value = true;
    try {
      const res = await api.post('/whatsapp/send-direct', {
        phone,
        message: messageForm.value.text,
      });
      if (res.data?.success) {
        showToast('تم إرسال الرسالة عبر واتساب بنجاح', 'success');
        showSendMessageModal.value = false;
      } else {
        showToast(res.data?.message || 'فشل الإرسال', 'error');
      }
    } catch {
      showToast('حدث خطأ أثناء الإرسال', 'error');
    } finally {
      messageSending.value = false;
    }
  } else {
    // Fallback: open wa.me
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(messageForm.value.text)}`, '_blank');
    showToast('تم فتح واتساب');
    showSendMessageModal.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s, transform .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-8px) translateX(-50%) !important; }
.modal-enter-active, .modal-leave-active { transition: opacity .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-active .bg-white, .modal-leave-active .bg-white { transition: transform .2s; }
.modal-enter-from .bg-white { transform: scale(.95); }
</style>