<template>
  <div class="max-w-5xl mx-auto flex flex-col gap-4" dir="rtl">

    <!-- ══════════════════════════════════════════════
         Invoice Document
    ══════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" id="invoice-doc">

      <!-- ─── Header Banner ─── -->
      <div class="bg-gradient-to-l from-indigo-600 to-purple-700 px-8 py-5 flex items-center justify-between">
        <div class="text-right">
          <h1 class="text-2xl font-black text-white flex items-center gap-2">
            <i class="fas fa-file-invoice text-white/80"></i>
            فاتورة مبيعات
          </h1>
          <p class="text-indigo-200 text-sm mt-0.5 tracking-wider">SALES INVOICE</p>
          <p class="text-indigo-300 text-xs mt-1">
            <i class="fas fa-cog text-[10px] ml-1"></i>
            تم تطبيق إعدادات الفاتورة المخصصة
          </p>
        </div>
        <div class="text-left">
          <div class="flex items-center gap-4">
            <!-- Company Logo -->
            <div v-if="companyLogo" class="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30">
              <img :src="companyLogo" class="w-full h-full object-cover" />
            </div>
            <div v-else class="w-16 h-16 rounded-xl bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <i class="fas fa-building text-white/50 text-2xl"></i>
            </div>
            <div class="text-left text-white">
              <p class="text-lg font-black">{{ company.name || 'اسم الشركة' }}</p>
              <p class="text-xs text-indigo-200 mt-0.5">{{ company.address || 'العنوان: عنوان الشركة' }}</p>
              <p class="text-xs text-indigo-200">الهاتف: {{ company.phone || '+964 xxx xxxx xx' }}</p>
              <p class="text-xs text-indigo-200">الإيميل: {{ company.email || 'info@company.com' }}</p>
            </div>
          </div>
          <p v-if="company.website" class="text-xs text-indigo-300 mt-2 text-left">
            الموقع: {{ company.website }}
          </p>
        </div>
      </div>

      <!-- ─── Invoice Meta ─── -->
      <div class="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
        <div class="grid grid-cols-3 gap-4">
          <!-- Customer Name -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">
              اسم العميل <span class="text-red-400">*</span>
            </label>
            <input v-model="customer.name" placeholder="أدخل اسم العميل"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
          <!-- Invoice Date -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">
              تاريخ الفاتورة <span class="text-red-400">*</span>
            </label>
            <input v-model="invoiceDate" type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
          <!-- Due Date -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">تاريخ الاستحقاق</label>
            <input v-model="dueDate" type="date"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
          <!-- Phone -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">رقم الهاتف</label>
            <input v-model="customer.phone" placeholder="07xxxxxxxxxx" dir="ltr"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
          <!-- Address -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">العنوان</label>
            <input v-model="customer.address" placeholder="عنوان العميل"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
          <!-- Payment Method -->
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">شروط الدفع</label>
            <div class="flex gap-1">
              <button v-for="m in paymentMethods" :key="m.value" @click="paymentMethod = m.value"
                class="flex-1 py-2 rounded-xl border-2 text-xs font-bold transition"
                :class="paymentMethod === m.value
                  ? 'border-indigo-500 bg-indigo-500 text-white'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'">
                <i :class="['fas', m.icon, 'ml-1 text-[10px]']"></i>
                {{ m.label }}
              </button>
            </div>
          </div>
          <!-- Notes -->
          <div class="col-span-3">
            <label class="text-xs font-bold text-gray-500 mb-1.5 block">ملاحظات</label>
            <input v-model="notes" placeholder="شكراً للتعامل معنا"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white transition" />
          </div>
        </div>

        <!-- Partial payment row -->
        <div v-if="paymentMethod === 'partial'" class="mt-3 flex items-center gap-4 bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
          <div class="flex-1">
            <label class="text-xs font-bold text-amber-700 mb-1 block">المبلغ المدفوع الآن</label>
            <div class="relative">
              <input v-model.number="paidAmount" type="number" min="0" :max="grandTotal" placeholder="0"
                class="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">د.ع</span>
            </div>
          </div>
          <div class="text-center px-4">
            <p class="text-xs text-amber-600">المتبقي</p>
            <p class="text-xl font-black" :class="remaining > 0 ? 'text-amber-600' : 'text-emerald-600'">
              {{ remaining.toLocaleString() }} <span class="text-xs font-normal">د.ع</span>
            </p>
          </div>
        </div>
        <div v-if="paymentMethod === 'deferred'" class="mt-3 flex items-center gap-2 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
          <i class="fas fa-exclamation-circle text-red-400"></i>
          <span class="text-sm text-red-600 font-medium">ستُسجَّل كدين كامل على العميل</span>
        </div>
      </div>

      <!-- ─── Items Table ─── -->
      <div class="px-8 py-5">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-indigo-600 text-white">
              <th class="px-3 py-3 text-center rounded-r-xl w-10">#</th>
              <th class="px-3 py-3 text-right">الوصف</th>
              <th class="px-3 py-3 text-center w-24">الوحدة</th>
              <th class="px-3 py-3 text-center w-24">الكمية</th>
              <th class="px-3 py-3 text-center w-28">السعر</th>
              <th class="px-3 py-3 text-center w-20">خصم %</th>
              <th class="px-3 py-3 text-center w-28">الإجمالي</th>
              <th class="px-3 py-3 text-center rounded-l-xl w-14">حذف</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in cart" :key="i"
              class="border-b border-gray-100 hover:bg-indigo-50/30 transition group">
              <td class="px-3 py-3 text-center text-gray-400 text-xs font-mono">{{ i + 1 }}</td>
              <!-- Description with search -->
              <td class="px-3 py-2 relative">
                <div class="relative">
                  <input
                    v-model="item.searchQuery"
                    @input="onItemSearch(i, item.searchQuery)"
                    @focus="activeSearchRow = i; onItemSearch(i, item.searchQuery)"
                    @blur="closeSearch(i)"
                    :placeholder="item.name || 'ابحث بالاسم أو الباركود...'"
                    class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition"
                  />
                  <!-- Search dropdown -->
                  <div v-if="activeSearchRow === i && itemSuggestions.length > 0"
                    class="absolute top-full right-0 left-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                    <button
                      v-for="prod in itemSuggestions" :key="prod.id"
                      @mousedown.prevent="selectProduct(i, prod)"
                      class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 text-right transition border-b border-gray-50 last:border-0">
                      <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-box text-indigo-500 text-xs"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-gray-700 truncate">{{ prod.name }}</p>
                        <p class="text-[10px] text-gray-400">{{ prod.category }} | مخزون: {{ prod.stock }}</p>
                      </div>
                      <span class="text-xs font-bold text-indigo-600 flex-shrink-0">{{ prod.price.toLocaleString() }} د.ع</span>
                    </button>
                  </div>
                </div>
              </td>
              <!-- Unit -->
              <td class="px-3 py-2">
                <input v-model="item.unit"
                  class="w-full text-center px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition" />
              </td>
              <!-- Qty -->
              <td class="px-3 py-2">
                <div class="flex items-center justify-center gap-1">
                  <button @click="item.qty > 1 ? item.qty-- : removeRow(i)"
                    class="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition text-[10px]">
                    <i class="fas fa-minus"></i>
                  </button>
                  <input v-model.number="item.qty" type="number" min="1"
                    class="w-10 text-center text-sm font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 py-1"
                    @focus="($event.target as HTMLInputElement).select()" />
                  <button @click="item.qty++"
                    class="w-6 h-6 rounded-lg border border-indigo-200 bg-indigo-50 flex items-center justify-center text-indigo-500 hover:bg-indigo-100 transition text-[10px]">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </td>
              <!-- Price -->
              <td class="px-3 py-2">
                <input v-model.number="item.price" type="number" min="0"
                  class="w-full text-center px-2 py-2 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition"
                  @focus="($event.target as HTMLInputElement).select()" />
              </td>
              <!-- Discount % -->
              <td class="px-3 py-2">
                <input v-model.number="item.discountPct" type="number" min="0" max="100" placeholder="."
                  class="w-full text-center px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition"
                  @focus="($event.target as HTMLInputElement).select()" />
              </td>
              <!-- Row Total -->
              <td class="px-3 py-2 text-center">
                <span class="text-sm font-black text-gray-700">{{ rowTotal(item).toLocaleString() }}</span>
                <span class="text-[10px] text-gray-400 block">د.ع</span>
              </td>
              <!-- Delete -->
              <td class="px-3 py-2 text-center">
                <button @click="removeRow(i)"
                  class="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center mx-auto transition">
                  <i class="fas fa-trash-alt text-xs"></i>
                </button>
              </td>
            </tr>

            <!-- Empty row placeholder -->
            <tr v-if="cart.length === 0">
              <td colspan="8" class="py-8 text-center text-gray-300">
                <i class="fas fa-plus-circle text-3xl mb-2 block"></i>
                <p class="text-sm">اضغط "إضافة سطر" لإضافة منتج</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Add Row Button -->
        <button @click="addRow"
          class="mt-3 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold hover:bg-indigo-50 px-4 py-2 rounded-xl transition">
          <i class="fas fa-plus-circle"></i>
          إضافة سطر
        </button>
      </div>

      <!-- ─── Summary Section ─── -->
      <div class="px-8 pb-5">
        <div class="flex justify-end">
          <div class="w-72 space-y-2">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-gray-500">المجموع الفرعي:</span>
              <span class="text-sm font-bold text-gray-700">IQD {{ subtotal.toLocaleString() }}</span>
            </div>
            <div v-if="totalDiscountAmount > 0" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-emerald-600">الخصم:</span>
              <span class="text-sm font-bold text-emerald-600">- IQD {{ totalDiscountAmount.toLocaleString() }}</span>
            </div>
            <div v-if="globalDiscountAmount > 0" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-emerald-600">خصم إضافي:</span>
              <span class="text-sm font-bold text-emerald-600">- IQD {{ globalDiscountAmount.toLocaleString() }}</span>
            </div>
            <div v-if="taxAmount > 0" class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm text-amber-500">ضريبة ({{ taxPercent }}%):</span>
              <span class="text-sm font-bold text-amber-500">+ IQD {{ taxAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center py-3 bg-indigo-50 rounded-xl px-3 mt-2">
              <span class="text-base font-black text-secondary">الإجمالي:</span>
              <span class="text-xl font-black text-indigo-600">IQD {{ grandTotal.toLocaleString() }}</span>
            </div>
            <!-- Extra discount + tax controls -->
            <div class="flex gap-2 pt-1">
              <div class="flex-1">
                <label class="text-[10px] text-gray-400 mb-1 block">خصم إضافي</label>
                <div class="flex items-center gap-1">
                  <input v-model.number="globalDiscount" type="number" min="0" placeholder="0"
                    class="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  <div class="flex rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                    <button @click="globalDiscountType = 'fixed'"
                      class="px-2 py-1.5 text-[10px] font-bold transition"
                      :class="globalDiscountType === 'fixed' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-400'">د.ع</button>
                    <button @click="globalDiscountType = 'percent'"
                      class="px-2 py-1.5 text-[10px] font-bold transition"
                      :class="globalDiscountType === 'percent' ? 'bg-indigo-500 text-white' : 'bg-white text-gray-400'">%</button>
                  </div>
                </div>
              </div>
              <div class="flex-1">
                <label class="text-[10px] text-gray-400 mb-1 block">ضريبة %</label>
                <input v-model.number="taxPercent" type="number" min="0" max="100" placeholder="0"
                  class="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Info Bar ─── -->
      <div class="mx-8 mb-5 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
        <i class="fas fa-info-circle text-blue-400 text-sm"></i>
        <span class="text-xs text-blue-600">سيتم تحويلك تلقائياً إلى صفحة قائمة الفواتير بعد حفظ الفاتورة</span>
      </div>

      <!-- ─── Action Buttons ─── -->
      <div class="px-8 pb-6 flex flex-wrap items-center justify-between gap-3">
        <div class="flex gap-2">
          <button @click="checkout" :disabled="cart.length === 0 || saving"
            class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            :class="cart.length > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200' : 'bg-gray-100 text-gray-400'">
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? 'جاري الحفظ...' : 'حفظ الفاتورة' }}
          </button>
          <button @click="printInvoice" :disabled="cart.length === 0"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-amber-400 hover:bg-amber-500 text-white transition disabled:opacity-50 shadow-sm shadow-amber-200">
            <i class="fas fa-print"></i>
            طباعة
          </button>
        </div>
        <div class="flex gap-2">
          <button @click="clearAll"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-red-400 hover:bg-red-500 text-white transition">
            <i class="fas fa-broom"></i>
            مسح الكل
          </button>
          <button @click="showSettings = true"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-purple-500 hover:bg-purple-600 text-white transition">
            <i class="fas fa-cog"></i>
            إعدادات الفاتورة
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════
         Product Quick-Browse Panel (collapsible)
    ══════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button @click="showProducts = !showProducts"
        class="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition">
        <span class="font-bold text-secondary flex items-center gap-2">
          <i class="fas fa-boxes text-indigo-500"></i>
          تصفح المنتجات السريع
          <span class="text-xs text-gray-400 font-normal">({{ products.length }} منتج)</span>
        </span>
        <i class="fas text-gray-400 text-sm transition-transform"
          :class="showProducts ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
      </button>
      <div v-show="showProducts" class="border-t border-gray-100">
        <!-- Search + Category filter -->
        <div class="p-4 space-y-3 border-b border-gray-100">
          <div class="relative">
            <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
            <input v-model="browseSearch" placeholder="بحث بالاسم أو الباركود..." dir="rtl"
              class="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50 focus:bg-white transition" />
          </div>
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button v-for="cat in categoryPills" :key="cat" @click="selectedCat = cat"
              class="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex-shrink-0"
              :class="selectedCat === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
              {{ cat }}
            </button>
          </div>
        </div>
        <!-- Products Grid -->
        <div class="p-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-64 overflow-y-auto">
          <button v-for="product in browsedProducts" :key="product.id"
            @click="addProductToCart(product)"
            :disabled="product.stock <= 0"
            class="relative group bg-gray-50 hover:bg-indigo-50 border-2 border-transparent hover:border-indigo-200 rounded-2xl p-3 text-center transition disabled:opacity-50 disabled:cursor-not-allowed">
            <div v-if="product.stock <= 0"
              class="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center z-10">
              <span class="text-[9px] font-bold text-red-400 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-lg">نفد</span>
            </div>
            <div class="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-indigo-200 transition">
              <i class="fas fa-box text-indigo-500 text-sm"></i>
            </div>
            <p class="text-[11px] font-semibold text-secondary truncate">{{ product.name }}</p>
            <p class="text-xs font-black text-indigo-600 mt-0.5">{{ product.price.toLocaleString() }}</p>
            <p class="text-[9px] text-gray-300">د.ع</p>
            <span class="absolute top-1.5 left-1.5 text-[9px] font-bold px-1 py-0.5 rounded-full"
              :class="product.stock < 5 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'">
              {{ product.stock }}
            </span>
          </button>
        </div>
      </div>
    </div>

  </div>

  <!-- ══════════════════════════════════════════════
       Invoice Settings Modal
  ══════════════════════════════════════════════ -->
  <transition name="modal">
    <div v-if="showSettings" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">
        <div class="bg-gradient-to-l from-purple-600 to-indigo-600 px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h3 class="font-bold text-white flex items-center gap-2">
            <i class="fas fa-cog"></i> إعدادات الفاتورة
          </h3>
          <button @click="showSettings = false" class="text-white/70 hover:text-white">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1 block">اسم الشركة</label>
            <input v-model="company.name" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1 block">العنوان</label>
            <input v-model="company.address" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold text-gray-500 mb-1 block">الهاتف</label>
              <input v-model="company.phone" dir="ltr" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
            <div>
              <label class="text-xs font-bold text-gray-500 mb-1 block">الإيميل</label>
              <input v-model="company.email" dir="ltr" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1 block">الموقع الإلكتروني</label>
            <input v-model="company.website" dir="ltr" placeholder="www.company.com" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
          </div>
          <div>
            <label class="text-xs font-bold text-gray-500 mb-1 block">شعار الشركة</label>
            <input type="file" accept="image/*" @change="onLogoChange"
              class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-gray-50" />
            <div v-if="companyLogo" class="mt-2 flex items-center gap-2">
              <img :src="companyLogo" class="w-12 h-12 rounded-xl object-cover border border-gray-200" />
              <button @click="removeLogo" class="text-xs text-red-400 hover:text-red-600">حذف الشعار</button>
            </div>
          </div>
        </div>
        <div class="px-6 pb-5 flex gap-2">
          <button @click="saveSettings"
            class="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition">
            <i class="fas fa-save ml-1"></i> حفظ الإعدادات
          </button>
          <button @click="showSettings = false"
            class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
            إلغاء
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Toast -->
  <transition name="toast">
    <div v-if="toastMsg"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold">
      <i class="fas fa-check-circle text-lg"></i>
      {{ toastMsg }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

// ─── Company Info ─────────────────────────────────────────
const company = ref({ name: '', address: '', phone: '', email: '', website: '' });
const companyLogo = ref('');
const showSettings = ref(false);

function loadCompanySettings() {
  try {
    const saved = JSON.parse(localStorage.getItem('pos_company_settings') || '{}');
    Object.assign(company.value, saved);
    companyLogo.value = localStorage.getItem('pos_company_logo') || '';
  } catch {}
}

function saveSettings() {
  localStorage.setItem('pos_company_settings', JSON.stringify(company.value));
  showSettings.value = false;
  showToast('تم حفظ إعدادات الفاتورة');
}

function removeLogo() {
  companyLogo.value = '';
  localStorage.removeItem('pos_company_logo');
}

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    companyLogo.value = ev.target?.result as string;
    localStorage.setItem('pos_company_logo', companyLogo.value);
  };
  reader.readAsDataURL(file);
}

// ─── Products ─────────────────────────────────────────────
const productsData = ref<any[]>([]);
const categoriesData = ref<any[]>([]);
const browseSearch = ref('');
const selectedCat = ref('الكل');
const showProducts = ref(false);

const products = computed(() => productsData.value.map((p: any) => ({
  id: p.id,
  name: p.name,
  price: Number(p.price),
  category: p.category?.name || '—',
  stock: p.stock,
  barcode: p.barcode || '',
  unit: p.unit || 'قطعة',
})));

const categoryPills = computed(() => ['الكل', ...categoriesData.value.map((c: any) => c.name)]);

const browsedProducts = computed(() => products.value.filter(p => {
  const q = browseSearch.value.toLowerCase();
  const matchCat = selectedCat.value === 'الكل' || p.category === selectedCat.value;
  return matchCat && (!q || p.name.toLowerCase().includes(q) || p.barcode.includes(q));
}));

// ─── Invoice Header ───────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const invoiceDate = ref(today);
const dueDate = ref(today);
const customer = ref({ name: '', phone: '', address: '' });
const notes = ref('شكراً للتعامل معنا');
const paymentMethod = ref('cash');
const paidAmount = ref(0);
const taxPercent = ref(0);
const globalDiscount = ref(0);
const globalDiscountType = ref<'fixed' | 'percent'>('fixed');

const paymentMethods = [
  { value: 'cash',     label: 'نقداً',  icon: 'fa-money-bill-wave' },
  { value: 'deferred', label: 'آجل',    icon: 'fa-clock' },
  { value: 'partial',  label: 'جزئي',   icon: 'fa-hand-holding-usd' },
];

// ─── Cart ─────────────────────────────────────────────────
interface CartRow {
  id: number;
  name: string;
  unit: string;
  qty: number;
  price: number;
  discountPct: number;
  searchQuery: string;
}

const cart = ref<CartRow[]>([]);
const activeSearchRow = ref<number | null>(null);
const itemSuggestions = ref<any[]>([]);

function addRow() {
  cart.value.push({ id: 0, name: '', unit: 'قطعة', qty: 1, price: 0, discountPct: 0, searchQuery: '' });
}

function removeRow(i: number) {
  cart.value.splice(i, 1);
}

function onItemSearch(rowIdx: number, q: string) {
  if (!q || q.length < 1) { itemSuggestions.value = []; return; }
  const lq = q.toLowerCase();
  itemSuggestions.value = products.value.filter(p =>
    p.name.toLowerCase().includes(lq) || p.barcode.includes(lq)
  ).slice(0, 8);
}

function selectProduct(rowIdx: number, prod: any) {
  const row = cart.value[rowIdx];
  row.id = prod.id;
  row.name = prod.name;
  row.price = prod.price;
  row.unit = prod.unit || 'قطعة';
  row.searchQuery = prod.name;
  itemSuggestions.value = [];
  activeSearchRow.value = null;
  // إضافة سطر جديد تلقائياً إذا كان هذا هو آخر سطر
  if (rowIdx === cart.value.length - 1) {
    addRow();
  }
}

function closeSearch(rowIdx: number) {
  setTimeout(() => {
    if (activeSearchRow.value === rowIdx) {
      activeSearchRow.value = null;
      itemSuggestions.value = [];
    }
  }, 200);
}

function addProductToCart(prod: any) {
  const existing = cart.value.find(r => r.id === prod.id);
  if (existing) { existing.qty++; return; }
  const emptyRow = cart.value.find(r => r.id === 0 && !r.name);
  if (emptyRow) {
    emptyRow.id = prod.id; emptyRow.name = prod.name;
    emptyRow.price = prod.price; emptyRow.unit = prod.unit || 'قطعة';
    emptyRow.searchQuery = prod.name;
  } else {
    cart.value.push({ id: prod.id, name: prod.name, unit: prod.unit || 'قطعة', qty: 1, price: prod.price, discountPct: 0, searchQuery: prod.name });
  }
}

// ─── Totals ───────────────────────────────────────────────
function rowTotal(item: CartRow): number {
  const base = item.price * item.qty;
  if (item.discountPct > 0) return Math.round(base * (1 - item.discountPct / 100));
  return base;
}

const subtotal = computed(() => cart.value.reduce((s, i) => s + i.price * i.qty, 0));

const totalDiscountAmount = computed(() =>
  cart.value.reduce((s, i) => {
    if (!i.discountPct) return s;
    return s + Math.round(i.price * i.qty * i.discountPct / 100);
  }, 0)
);

const globalDiscountAmount = computed(() => {
  if (!globalDiscount.value || globalDiscount.value <= 0) return 0;
  const afterItemDiscount = subtotal.value - totalDiscountAmount.value;
  return globalDiscountType.value === 'percent'
    ? Math.round(afterItemDiscount * globalDiscount.value / 100)
    : Math.min(globalDiscount.value, afterItemDiscount);
});

const taxBase = computed(() => subtotal.value - totalDiscountAmount.value - globalDiscountAmount.value);
const taxAmount = computed(() => taxPercent.value > 0 ? Math.round(taxBase.value * taxPercent.value / 100) : 0);
const grandTotal = computed(() => taxBase.value + taxAmount.value);
const remaining = computed(() => grandTotal.value - (paidAmount.value || 0));

// ─── Actions ──────────────────────────────────────────────
const saving = ref(false);
const toastMsg = ref('');

function clearAll(silent = false) {
  if (!silent && cart.value.length === 0 && !customer.value.name) return;
  if (!silent && !confirm('هل تريد مسح جميع بيانات الفاتورة؟')) return;
  cart.value = [];
  customer.value = { name: '', phone: '', address: '' };
  notes.value = 'شكراً للتعامل معنا';
  paymentMethod.value = 'cash';
  paidAmount.value = 0;
  taxPercent.value = 0;
  globalDiscount.value = 0;
  invoiceDate.value = new Date().toISOString().slice(0, 10);
  dueDate.value = invoiceDate.value;
}

async function checkout() {
  if (cart.value.length === 0) return;
  const validRows = cart.value.filter(r => r.name && r.qty > 0 && r.price >= 0);
  if (validRows.length === 0) return;

  saving.value = true;
  try {
    const actualPaid = paymentMethod.value === 'cash' ? grandTotal.value
      : paymentMethod.value === 'deferred' ? 0
      : paidAmount.value;

    const payStatus = paymentMethod.value === 'cash' ? 'paid'
      : paymentMethod.value === 'deferred' ? 'deferred'
      : remaining.value <= 0 ? 'paid' : 'partial';

    await api.post('/invoices', {
      customerName: customer.value.name || 'مبيعات مباشر',
      customerPhone: customer.value.phone || undefined,
      customerAddress: customer.value.address || undefined,
      items: validRows.map(i => ({ ...(i.id ? { productId: i.id } : {}), name: i.name, quantity: i.qty, price: i.price })),
      total: grandTotal.value,
      discount: totalDiscountAmount.value + globalDiscountAmount.value,
      tax: taxAmount.value,
      paymentMethod: paymentMethod.value,
      paymentStatus: payStatus,
      paidAmount: actualPaid,
      notes: notes.value || undefined,
    });

    // Refresh product stock
    const { data } = await api.get('/products');
    productsData.value = data;

    clearAll(true);
    showToast('✓ تم حفظ الفاتورة بنجاح');
  } catch (e: any) {
    alert(e?.response?.data?.message || 'حدث خطأ أثناء حفظ الفاتورة');
  } finally {
    saving.value = false;
  }
}

function printInvoice() {
  if (cart.value.length === 0) return;
  const validRows = cart.value.filter(r => r.name);
  const rows = validRows.map((item, idx) => `
    <tr>
      <td style="text-align:center;color:#888">${idx + 1}</td>
      <td>${item.name}</td>
      <td style="text-align:center">${item.unit}</td>
      <td style="text-align:center">${item.qty}</td>
      <td style="text-align:center">${item.price.toLocaleString()}</td>
      <td style="text-align:center">${item.discountPct || '.'}</td>
      <td style="text-align:center;font-weight:700;color:#4f46e5">${rowTotal(item).toLocaleString()}</td>
    </tr>`).join('');

  const co = company.value;
  const logo = companyLogo.value;
  const win = window.open('', '_blank', 'width=850,height=1000');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>فاتورة مبيعات</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:'Segoe UI',Tahoma,Arial,sans-serif}
body{background:#fff;color:#222;font-size:13px;padding:30px}
.banner{background:linear-gradient(to left,#4f46e5,#7c3aed);color:#fff;border-radius:12px;padding:20px 28px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.banner-title{font-size:22px;font-weight:900}
.banner-sub{font-size:11px;opacity:.7;margin-top:2px}
.co-info{text-align:left;font-size:12px;line-height:1.7}
.co-name{font-size:16px;font-weight:900}
.co-logo{width:56px;height:56px;border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,.3)}
.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:#f8f9ff;border-radius:10px;padding:16px;margin-bottom:20px}
.meta-label{font-size:10px;color:#888;font-weight:700;margin-bottom:3px}
.meta-val{font-size:13px;font-weight:600;color:#333}
table{width:100%;border-collapse:collapse;margin-bottom:16px}
thead tr{background:#4f46e5;color:#fff}
th{padding:10px 12px;font-size:11px;font-weight:700}
td{padding:9px 12px;border-bottom:1px solid #f0f0f0;font-size:12px}
.totals{display:flex;justify-content:flex-end}
.totals-box{width:240px}
.tot-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#555}
.grand{font-size:15px;font-weight:900;color:#4f46e5;padding:10px;background:#f0f0ff;border-radius:8px;margin-top:6px;display:flex;justify-content:space-between}
.footer{text-align:center;margin-top:24px;font-size:11px;color:#bbb;border-top:1px dashed #eee;padding-top:14px}
.noprint{text-align:center;margin-top:16px}
.btn{padding:10px 28px;background:#4f46e5;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px}
@media print{.noprint{display:none}body{padding:10px}}
</style>
</head>
<body>
<div class="banner">
  <div>
    <div class="banner-title">فاتورة مبيعات</div>
    <div class="banner-sub">SALES INVOICE</div>
  </div>
  <div style="display:flex;align-items:center;gap:14px">
    ${logo ? `<img src="${logo}" class="co-logo"/>` : ''}
    <div class="co-info">
      <div class="co-name">${co.name || 'اسم الشركة'}</div>
      ${co.address ? `<div>${co.address}</div>` : ''}
      ${co.phone ? `<div>${co.phone}</div>` : ''}
      ${co.email ? `<div>${co.email}</div>` : ''}
    </div>
  </div>
</div>
<div class="meta">
  <div><div class="meta-label">اسم العميل</div><div class="meta-val">${customer.value.name || '—'}</div></div>
  <div><div class="meta-label">تاريخ الفاتورة</div><div class="meta-val">${invoiceDate.value}</div></div>
  <div><div class="meta-label">تاريخ الاستحقاق</div><div class="meta-val">${dueDate.value}</div></div>
  ${customer.value.phone ? `<div><div class="meta-label">الهاتف</div><div class="meta-val">${customer.value.phone}</div></div>` : ''}
  <div><div class="meta-label">طريقة الدفع</div><div class="meta-val">${{ cash: 'نقداً', deferred: 'آجل', partial: 'جزئي' }[paymentMethod.value] || paymentMethod.value}</div></div>
  ${notes.value ? `<div><div class="meta-label">ملاحظات</div><div class="meta-val">${notes.value}</div></div>` : ''}
</div>
<table>
  <thead>
    <tr>
      <th style="text-align:center;width:36px">#</th>
      <th>الوصف</th>
      <th style="text-align:center">الوحدة</th>
      <th style="text-align:center">الكمية</th>
      <th style="text-align:center">السعر</th>
      <th style="text-align:center">خصم %</th>
      <th style="text-align:center">الإجمالي</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div class="totals-box">
    <div class="tot-row"><span>المجموع الفرعي:</span><span>IQD ${subtotal.value.toLocaleString()}</span></div>
    ${totalDiscountAmount.value > 0 ? `<div class="tot-row" style="color:#10b981"><span>الخصم:</span><span>- IQD ${totalDiscountAmount.value.toLocaleString()}</span></div>` : ''}
    ${globalDiscountAmount.value > 0 ? `<div class="tot-row" style="color:#10b981"><span>خصم إضافي:</span><span>- IQD ${globalDiscountAmount.value.toLocaleString()}</span></div>` : ''}
    ${taxAmount.value > 0 ? `<div class="tot-row" style="color:#f59e0b"><span>ضريبة (${taxPercent.value}%):</span><span>+ IQD ${taxAmount.value.toLocaleString()}</span></div>` : ''}
    <div class="grand"><span>الإجمالي:</span><span>IQD ${grandTotal.value.toLocaleString()}</span></div>
  </div>
</div>
<div class="footer">${co.website ? `${co.website} — ` : ''}شكراً لتعاملكم معنا</div>
<div class="noprint"><button class="btn" onclick="window.print()">طباعة الفاتورة</button></div>
</body>
</html>`);
  win.document.close();
}

function showToast(msg: string) {
  toastMsg.value = msg;
  setTimeout(() => { toastMsg.value = ''; }, 3000);
}

onMounted(async () => {
  loadCompanySettings();
  // Load prefilled customer from invoices page
  try {
    const prefill = localStorage.getItem('pos_prefill_customer');
    if (prefill) {
      const c = JSON.parse(prefill);
      customer.value = { name: c.name || '', phone: c.phone || '', address: c.address || '' };
      localStorage.removeItem('pos_prefill_customer');
    }
  } catch {}
  addRow();
  try {
    const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
    productsData.value = prodRes.data;
    categoriesData.value = catRes.data;
  } catch {}
});
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .35s cubic-bezier(.4,0,.2,1); }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
.scrollbar-hide::-webkit-scrollbar { display: none; }
</style>
