<template>
  <div class="max-w-7xl mx-auto flex flex-col gap-5" dir="rtl">

    <!-- ═══ Header ═══ -->
    <div class="bg-gradient-to-l from-teal-600 to-emerald-700 rounded-2xl px-8 py-6 flex items-center justify-between shadow-lg shadow-teal-100">
      <div>
        <h1 class="text-2xl font-black text-white flex items-center gap-3">
          <i class="fas fa-warehouse"></i>
          إدارة المخزون
        </h1>
        <p class="text-teal-200 text-sm mt-1">جرد ومتابعة المواد المخزونة بشكل كامل</p>
        <p class="text-teal-300 text-xs mt-1.5 flex items-center gap-1.5">
          <i class="fas fa-link"></i>
          المنتجات مرتبطة تلقائياً — أي منتج تضيفه في
          <router-link to="/sales/products" class="underline underline-offset-2 hover:text-white font-semibold">صفحة المنتجات</router-link>
          يظهر هنا فوراً
        </p>
      </div>
      <div class="flex items-center gap-2">
        <router-link to="/sales/products"
          class="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition border border-white/20">
          <i class="fas fa-boxes text-base"></i>
          إدارة المنتجات
        </router-link>
        <button @click="openAdd()"
          class="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition border border-white/30">
          <i class="fas fa-plus-circle text-base"></i>
          إضافة حركة مخزون
        </button>
      </div>
    </div>

    <!-- ═══ Stats Cards ═══ -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">إجمالي المنتجات</span>
        <span class="text-2xl font-black text-gray-700">{{ stats.total }}</span>
        <span class="text-[11px] text-indigo-500 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-boxes"></i> منتج مسجّل
        </span>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">متوفر في المخزون</span>
        <span class="text-2xl font-black text-emerald-600">{{ stats.inStock }}</span>
        <span class="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-check-circle"></i> مخزون جيد
        </span>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">مخزون منخفض</span>
        <span class="text-2xl font-black text-amber-500">{{ stats.lowStock }}</span>
        <span class="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-exclamation-triangle"></i> يحتاج تعبئة
        </span>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">منتهي من المخزون</span>
        <span class="text-2xl font-black text-red-500">{{ stats.outOfStock }}</span>
        <span class="text-[11px] text-red-400 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-times-circle"></i> نفد المخزون
        </span>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">قيمة التكلفة</span>
        <span class="text-xl font-black text-teal-600">{{ fmt(stats.totalCostValue) }}</span>
        <span class="text-[11px] text-teal-400 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-tag"></i> سعر الشراء
        </span>
      </div>
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-1">
        <span class="text-xs text-gray-400 font-semibold">قيمة البيع</span>
        <span class="text-xl font-black text-purple-600">{{ fmt(stats.totalRetailValue) }}</span>
        <span class="text-[11px] text-purple-400 font-semibold flex items-center gap-1 mt-0.5">
          <i class="fas fa-dollar-sign"></i> سعر البيع
        </span>
      </div>
    </div>

    <!-- ═══ Main Card ═══ -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      <!-- Tabs -->
      <div class="flex border-b border-gray-100 px-6 pt-4 gap-1">
        <button @click="activeTab = 'stock'"
          class="flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-semibold text-sm transition"
          :class="activeTab === 'stock' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'text-gray-400 hover:text-gray-600'">
          <i class="fas fa-boxes"></i>
          ملخص المخزون
          <span class="bg-teal-100 text-teal-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ stockSummary.length }}</span>
        </button>
        <button @click="activeTab = 'movements'"
          class="flex items-center gap-2 px-5 py-2.5 rounded-t-xl font-semibold text-sm transition"
          :class="activeTab === 'movements' ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-500' : 'text-gray-400 hover:text-gray-600'">
          <i class="fas fa-exchange-alt"></i>
          سجل الحركات
          <span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ movements.length }}</span>
        </button>
      </div>

      <!-- ─── Tab: Stock Summary ─── -->
      <div v-if="activeTab === 'stock'" class="p-6">
        <!-- Toolbar -->
        <div class="flex flex-wrap gap-3 mb-5 items-center justify-between">
          <div class="flex gap-2 flex-wrap">
            <button v-for="f in statusFilters" :key="f.value"
              @click="filterStatus = f.value"
              class="text-xs font-bold px-3 py-1.5 rounded-xl transition border"
              :class="filterStatus === f.value ? f.activeClass : 'border-gray-200 text-gray-500 hover:border-gray-300'">
              <i :class="f.icon" class="ml-1"></i>{{ f.label }}
              <span class="mr-1">({{ f.count }})</span>
            </button>
          </div>
          <div class="relative">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input v-model="searchStock" placeholder="بحث بالاسم أو الباركود..."
              class="pr-8 pl-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 w-56" />
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs font-bold">
                <th class="px-4 py-3 text-right">#</th>
                <th class="px-4 py-3 text-right">المنتج</th>
                <th class="px-4 py-3 text-center">التصنيف</th>
                <th class="px-4 py-3 text-center">المورد</th>
                <th class="px-4 py-3 text-center">الحالة</th>
                <th class="px-4 py-3 text-center">المخزون</th>
                <th class="px-4 py-3 text-center">المبيعات</th>
                <th class="px-4 py-3 text-center">سعر التكلفة</th>
                <th class="px-4 py-3 text-center">سعر البيع</th>
                <th class="px-4 py-3 text-center">قيمة المخزون</th>
                <th class="px-4 py-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="text-center text-gray-400">
                <td colspan="11" class="py-12">
                  <i class="fas fa-spinner fa-spin text-2xl text-teal-400"></i>
                  <p class="mt-2 text-sm">جاري التحميل...</p>
                </td>
              </tr>
              <tr v-else-if="filteredStock.length === 0" class="text-center text-gray-400">
                <td colspan="11" class="py-12">
                  <i class="fas fa-box-open text-4xl text-gray-200"></i>
                  <p class="mt-2 text-sm">لا توجد منتجات</p>
                </td>
              </tr>
              <tr v-for="(item, idx) in filteredStock" :key="item.id"
                class="border-t border-gray-50 hover:bg-gray-50/50 transition group">
                <td class="px-4 py-3 text-gray-400 text-xs font-mono">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <router-link :to="'/sales/products'" class="group/name">
                    <p class="font-bold text-gray-700 text-sm group-hover/name:text-teal-600 transition">{{ item.name }}</p>
                    <p v-if="item.barcode" class="text-[11px] text-gray-400 font-mono mt-0.5">{{ item.barcode }}</p>
                  </router-link>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{{ item.category || '—' }}</span>
                </td>
                <td class="px-4 py-3 text-center text-xs text-gray-500">{{ item.supplier || '—' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="{
                    'bg-emerald-100 text-emerald-700': item.stockStatus === 'ok',
                    'bg-amber-100 text-amber-700': item.stockStatus === 'low',
                    'bg-red-100 text-red-600': item.stockStatus === 'out',
                  }">
                    <i class="ml-1 fas" :class="{
                      'fa-check-circle': item.stockStatus === 'ok',
                      'fa-exclamation-triangle': item.stockStatus === 'low',
                      'fa-times-circle': item.stockStatus === 'out',
                    }"></i>
                    {{ item.stockStatus === 'ok' ? 'متوفر' : item.stockStatus === 'low' ? 'منخفض' : 'منتهي' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-base font-black" :class="{
                    'text-emerald-600': item.stockStatus === 'ok',
                    'text-amber-500': item.stockStatus === 'low',
                    'text-red-500': item.stockStatus === 'out',
                  }">{{ item.stock }}</span>
                  <span class="text-gray-400 text-xs mr-1">وحدة</span>
                </td>
                <td class="px-4 py-3 text-center text-sm font-semibold text-indigo-600">{{ item.totalSold }}</td>
                <td class="px-4 py-3 text-center text-xs text-gray-500">
                  {{ item.cost ? fmt(item.cost) : '—' }}
                </td>
                <td class="px-4 py-3 text-center text-xs font-semibold text-gray-700">{{ fmt(item.price) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="text-sm font-bold text-teal-700">{{ fmt(item.stockRetailValue) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 justify-center">
                    <button @click="openAdd(item.id)"
                      class="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1" title="إضافة حركة">
                      <i class="fas fa-plus-circle"></i> حركة
                    </button>
                    <router-link :to="'/sales/products'"
                      class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold px-2.5 py-1.5 rounded-lg transition flex items-center gap-1" title="إدارة المنتج">
                      <i class="fas fa-external-link-alt"></i>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
            <tfoot v-if="filteredStock.length > 0">
              <tr class="bg-teal-50 font-bold text-sm border-t border-teal-100">
                <td colspan="5" class="px-4 py-3 text-teal-700">المجموع</td>
                <td class="px-4 py-3 text-center text-teal-700">{{ filteredStock.reduce((s,i)=>s+i.stock, 0) }}</td>
                <td class="px-4 py-3 text-center text-indigo-700">{{ filteredStock.reduce((s,i)=>s+i.totalSold, 0) }}</td>
                <td colspan="2" class="px-4 py-3"></td>
                <td class="px-4 py-3 text-center text-teal-700">{{ fmt(filteredStock.reduce((s,i)=>s+i.stockRetailValue, 0)) }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ─── Tab: Movements Log ─── -->
      <div v-if="activeTab === 'movements'" class="p-6">
        <div class="flex justify-between items-center mb-5">
          <div class="flex gap-2">
            <button v-for="t in movTypeFilters" :key="t.value" @click="filterType = t.value"
              class="text-xs font-bold px-3 py-1.5 rounded-xl transition border"
              :class="filterType === t.value ? t.activeClass : 'border-gray-200 text-gray-500 hover:border-gray-300'">
              <i :class="t.icon" class="ml-1"></i>{{ t.label }}
            </button>
          </div>
          <div class="relative">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs"></i>
            <input v-model="searchMov" placeholder="بحث بالمنتج أو المرجع..."
              class="pr-8 pl-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 w-56" />
          </div>
        </div>

        <div class="overflow-x-auto rounded-xl border border-gray-100">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-50 text-gray-500 text-xs font-bold">
                <th class="px-4 py-3 text-right">#</th>
                <th class="px-4 py-3 text-right">المنتج</th>
                <th class="px-4 py-3 text-center">نوع الحركة</th>
                <th class="px-4 py-3 text-center">الكمية</th>
                <th class="px-4 py-3 text-right">المرجع</th>
                <th class="px-4 py-3 text-right">الملاحظات</th>
                <th class="px-4 py-3 text-center">التاريخ</th>
                <th class="px-4 py-3 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loadingMov" class="text-center text-gray-400">
                <td colspan="8" class="py-12">
                  <i class="fas fa-spinner fa-spin text-2xl text-teal-400"></i>
                </td>
              </tr>
              <tr v-else-if="filteredMovements.length === 0" class="text-center text-gray-400">
                <td colspan="8" class="py-12">
                  <i class="fas fa-history text-4xl text-gray-200"></i>
                  <p class="mt-2 text-sm">لا توجد حركات مسجّلة</p>
                </td>
              </tr>
              <tr v-for="(mv, idx) in filteredMovements" :key="mv.id"
                class="border-t border-gray-50 hover:bg-gray-50/50 transition">
                <td class="px-4 py-3 text-gray-400 text-xs font-mono">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <router-link v-if="mv.product" :to="'/sales/products'" class="font-semibold text-gray-700 hover:text-teal-600 transition flex items-center gap-1">
                    {{ mv.product.name }}
                    <i class="fas fa-external-link-alt text-[10px] text-gray-300"></i>
                  </router-link>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="text-xs font-bold px-2.5 py-1 rounded-full" :class="{
                    'bg-emerald-100 text-emerald-700': mv.type === 'in',
                    'bg-red-100 text-red-600': mv.type === 'out',
                    'bg-blue-100 text-blue-700': mv.type === 'adjustment',
                  }">
                    <i class="ml-1 fas" :class="{
                      'fa-arrow-down': mv.type === 'in',
                      'fa-arrow-up': mv.type === 'out',
                      'fa-sliders-h': mv.type === 'adjustment',
                    }"></i>
                    {{ mv.type === 'in' ? 'وارد' : mv.type === 'out' ? 'صادر' : 'تعديل' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-black" :class="{
                  'text-emerald-600': mv.type === 'in',
                  'text-red-500': mv.type === 'out',
                  'text-blue-600': mv.type === 'adjustment',
                }">
                  {{ mv.type === 'in' ? '+' : mv.type === 'out' ? '-' : '=' }}{{ mv.quantity }}
                </td>
                <td class="px-4 py-3 text-xs text-gray-500 font-mono">{{ mv.reference || '—' }}</td>
                <td class="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{{ mv.notes || '—' }}</td>
                <td class="px-4 py-3 text-center text-xs text-gray-500 font-mono">
                  {{ new Date(mv.date).toLocaleDateString('ar-IQ') }}<br/>
                  <span class="text-gray-300">{{ new Date(mv.date).toLocaleTimeString('ar-IQ', {hour:'2-digit',minute:'2-digit'}) }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button @click="confirmDelete(mv)"
                    class="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition text-xs">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══ Add Movement Modal ═══ -->
    <transition name="modal">
      <div v-if="showAdd" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="showAdd = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
          <div class="bg-gradient-to-l from-teal-600 to-emerald-700 px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <h3 class="font-bold text-white text-sm flex items-center gap-2">
              <i class="fas fa-exchange-alt"></i> إضافة حركة مخزون
            </h3>
            <button @click="showAdd = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 space-y-4">
            <!-- Product select -->
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">المنتج <span class="text-red-400">*</span></label>
              <div class="relative">
                <input v-model="addForm.productSearch" @input="filterProductSearch" @focus="showProductDrop = true"
                  placeholder="ابحث عن منتج..."
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                  autocomplete="off" />
                <div v-if="showProductDrop && productSearchResults.length > 0"
                  class="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  <div v-for="p in productSearchResults" :key="p.id"
                    @mousedown.prevent="selectProduct(p)"
                    class="px-3 py-2.5 hover:bg-teal-50 cursor-pointer flex items-center gap-2 text-sm">
                    <i class="fas fa-cube text-teal-400 text-xs"></i>
                    <span class="font-semibold text-gray-700">{{ p.name }}</span>
                    <span class="text-gray-400 text-xs mr-auto">مخزون: {{ p.stock }}</span>
                  </div>
                </div>
              </div>
              <p v-if="addForm.selectedProduct" class="mt-1 text-xs text-teal-600 font-semibold">
                <i class="fas fa-check-circle ml-1"></i>{{ addForm.selectedProduct.name }}
                — المخزون الحالي: <strong>{{ addForm.selectedProduct.stock }}</strong>
              </p>
            </div>

            <!-- Type -->
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">نوع الحركة <span class="text-red-400">*</span></label>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="t in movTypes" :key="t.value" @click="addForm.type = t.value"
                  class="py-2.5 rounded-xl text-xs font-bold border-2 transition flex flex-col items-center gap-1"
                  :class="addForm.type === t.value ? t.activeClass : 'border-gray-200 text-gray-400 hover:border-gray-300'">
                  <i :class="t.icon" class="text-base"></i>
                  {{ t.label }}
                </button>
              </div>
            </div>

            <!-- Quantity -->
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">
                {{ addForm.type === 'adjustment' ? 'الكمية الجديدة' : 'الكمية' }}
                <span class="text-red-400">*</span>
              </label>
              <input v-model.number="addForm.quantity" type="number" min="0" placeholder="0"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
              <p v-if="addForm.type === 'adjustment' && addForm.selectedProduct" class="mt-1 text-xs text-blue-500">
                سيتم ضبط المخزون من {{ addForm.selectedProduct.stock }} إلى {{ addForm.quantity || 0 }}
              </p>
            </div>

            <!-- Reference -->
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">المرجع (اختياري)</label>
              <input v-model="addForm.reference" placeholder="مثال: فاتورة #123 / أمر شراء..."
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400" />
            </div>

            <!-- Notes -->
            <div>
              <label class="text-xs font-bold text-gray-600 block mb-1.5">ملاحظات (اختياري)</label>
              <textarea v-model="addForm.notes" rows="2" placeholder="أي ملاحظات إضافية..."
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"></textarea>
            </div>
          </div>
          <div class="px-6 pb-6 flex gap-2 justify-end">
            <button @click="showAdd = false"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition">إلغاء</button>
            <button @click="submitMovement" :disabled="saving || !addForm.selectedProduct || !addForm.quantity"
              class="px-6 py-2 text-sm font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition disabled:opacity-50">
              <i v-if="saving" class="fas fa-spinner fa-spin ml-1"></i>
              حفظ الحركة
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ Delete Confirm Modal ═══ -->
    <transition name="modal">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="showDeleteModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm" dir="rtl">
          <div class="p-6 text-center">
            <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-trash-alt text-red-500 text-xl"></i>
            </div>
            <h3 class="font-bold text-gray-700 mb-1">حذف الحركة</h3>
            <p class="text-sm text-gray-400 mb-5">هل أنت متأكد من حذف هذه الحركة؟ لن يتم التراجع عن تغيير المخزون تلقائياً.</p>
            <div class="flex gap-2 justify-center">
              <button @click="showDeleteModal = false"
                class="px-5 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition">إلغاء</button>
              <button @click="doDelete" :disabled="deleting"
                class="px-5 py-2 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition disabled:opacity-50">
                <i v-if="deleting" class="fas fa-spinner fa-spin ml-1"></i>
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toastMsg" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold text-white"
        :class="toastError ? 'bg-red-500' : 'bg-emerald-500'">
        <i class="fas text-lg" :class="toastError ? 'fa-times-circle' : 'fa-check-circle'"></i>
        {{ toastMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const router = useRouter();

// ─── State ──────────────────────────────────────────────────────
const activeTab = ref<'stock' | 'movements'>('stock');
const loading    = ref(false);
const loadingMov = ref(false);
const saving     = ref(false);
const deleting   = ref(false);

const stats          = ref({ total: 0, inStock: 0, lowStock: 0, outOfStock: 0, totalCostValue: 0, totalRetailValue: 0 });
const stockSummary   = ref<any[]>([]);
const movements      = ref<any[]>([]);

// filters
const filterStatus = ref('all');
const searchStock  = ref('');
const filterType   = ref('all');
const searchMov    = ref('');

// modals
const showAdd         = ref(false);
const showDeleteModal = ref(false);
const toastMsg        = ref('');
const toastError      = ref(false);
const deletingItem    = ref<any>(null);

// add form
const addForm = ref({
  selectedProduct: null as any,
  productSearch: '',
  type: 'in',
  quantity: null as any,
  reference: '',
  notes: '',
});
const showProductDrop = ref(false);

// ─── Constants ─────────────────────────────────────────────────
const movTypes = [
  { value: 'in',         label: 'وارد',      icon: 'fas fa-arrow-down',  activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'out',        label: 'صادر',      icon: 'fas fa-arrow-up',    activeClass: 'border-red-500 bg-red-50 text-red-600' },
  { value: 'adjustment', label: 'تعديل',     icon: 'fas fa-sliders-h',   activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
];
const movTypeFilters = [
  { value: 'all',        label: 'الكل',     icon: 'fas fa-list',         activeClass: 'border-gray-600 bg-gray-600 text-white' },
  { value: 'in',         label: 'وارد',     icon: 'fas fa-arrow-down',   activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'out',        label: 'صادر',     icon: 'fas fa-arrow-up',     activeClass: 'border-red-500 bg-red-50 text-red-600' },
  { value: 'adjustment', label: 'تعديل',    icon: 'fas fa-sliders-h',    activeClass: 'border-blue-500 bg-blue-50 text-blue-700' },
];

// ─── Computed ──────────────────────────────────────────────────
const statusFilters = computed(() => [
  { value: 'all', label: 'الكل',     icon: 'fas fa-list',            count: stockSummary.value.length,                                           activeClass: 'border-gray-600 bg-gray-600 text-white' },
  { value: 'ok',  label: 'متوفر',    icon: 'fas fa-check-circle',    count: stockSummary.value.filter(i => i.stockStatus === 'ok').length,        activeClass: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'low', label: 'منخفض',   icon: 'fas fa-exclamation-triangle', count: stockSummary.value.filter(i => i.stockStatus === 'low').length,   activeClass: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'out', label: 'منتهي',   icon: 'fas fa-times-circle',     count: stockSummary.value.filter(i => i.stockStatus === 'out').length,       activeClass: 'border-red-500 bg-red-50 text-red-600' },
]);

const filteredStock = computed(() => {
  let list = stockSummary.value;
  if (filterStatus.value !== 'all') list = list.filter(i => i.stockStatus === filterStatus.value);
  if (searchStock.value.trim()) {
    const q = searchStock.value.trim().toLowerCase();
    list = list.filter(i => i.name.toLowerCase().includes(q) || (i.barcode || '').toLowerCase().includes(q));
  }
  return list;
});

const filteredMovements = computed(() => {
  let list = movements.value;
  if (filterType.value !== 'all') list = list.filter(m => m.type === filterType.value);
  if (searchMov.value.trim()) {
    const q = searchMov.value.trim().toLowerCase();
    list = list.filter(m => (m.product?.name || '').toLowerCase().includes(q) || (m.reference || '').toLowerCase().includes(q));
  }
  return list;
});

// productSearchResults يستخدم stockSummary مباشرة — مصدر واحد موحّد من جدول المنتجات
const productSearchResults = computed(() => {
  const q = addForm.value.productSearch.trim().toLowerCase();
  if (!q) return stockSummary.value.slice(0, 10);
  return stockSummary.value.filter(p => p.name.toLowerCase().includes(q) || (p.barcode || '').includes(q)).slice(0, 10);
});

// ─── Utils ─────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('ar-IQ', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function showToast(msg: string, error = false) {
  toastMsg.value = msg;
  toastError.value = error;
  setTimeout(() => { toastMsg.value = ''; }, 3000);
}

// ─── Data Loading ───────────────────────────────────────────────
async function loadStats() {
  const { data } = await api.get('/inventory/stats');
  stats.value = data;
}
async function loadStock() {
  loading.value = true;
  try {
    const { data } = await api.get('/inventory/stock');
    stockSummary.value = data;
  } finally {
    loading.value = false;
  }
}
async function loadMovements() {
  loadingMov.value = true;
  try {
    const { data } = await api.get('/inventory');
    movements.value = data;
  } finally {
    loadingMov.value = false;
  }
}

// ─── Add Movement ───────────────────────────────────────────────
function openAdd(productId?: number) {
  addForm.value = { selectedProduct: null, productSearch: '', type: 'in', quantity: null, reference: '', notes: '' };
  if (productId) {
    const p = stockSummary.value.find(s => s.id === productId);
    if (p) {
      addForm.value.selectedProduct = p;
      addForm.value.productSearch = p.name;
    }
  }
  showAdd.value = true;
}
function filterProductSearch() {
  showProductDrop.value = true;
}
function selectProduct(p: any) {
  addForm.value.selectedProduct = p;
  addForm.value.productSearch = p.name;
  showProductDrop.value = false;
}
async function submitMovement() {
  if (!addForm.value.selectedProduct || !addForm.value.quantity) return;
  saving.value = true;
  try {
    await api.post('/inventory', {
      product: { id: addForm.value.selectedProduct.id },
      type: addForm.value.type,
      quantity: Number(addForm.value.quantity),
      reference: addForm.value.reference || undefined,
      notes: addForm.value.notes || undefined,
    });
    showAdd.value = false;
    showToast('تم حفظ الحركة بنجاح ✓');
    await Promise.all([loadStats(), loadStock(), loadMovements()]);
  } catch {
    showToast('حدث خطأ أثناء الحفظ', true);
  } finally {
    saving.value = false;
  }
}

// ─── Delete ──────────────────────────────────────────────────────
function confirmDelete(mv: any) {
  deletingItem.value = mv;
  showDeleteModal.value = true;
}
async function doDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await api.delete(`/inventory/${deletingItem.value.id}`);
    showDeleteModal.value = false;
    showToast('تم حذف الحركة');
    await Promise.all([loadStats(), loadStock(), loadMovements()]);
  } catch {
    showToast('فشل الحذف', true);
  } finally {
    deleting.value = false;
  }
}

// ─── Lifecycle ──────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadStats(), loadStock(), loadMovements()]);
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
