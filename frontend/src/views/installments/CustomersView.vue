<template>
  <div>
    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm"></i>
        <input v-model="search" type="text" placeholder="بحث بالاسم أو الهاتف أو الهوية..."
          class="w-full pr-9 pl-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition" />
      </div>
      <select v-model="filterStatus" class="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px]">
        <option value="">جميع الحالات</option>
        <option value="active">نشط</option>
        <option value="blocked">محظور</option>
      </select>
      <button @click="openAdd"
        class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-md shadow-indigo-200 shrink-0">
        <i class="fas fa-user-plus"></i> عميل جديد
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gradient-to-l from-indigo-50 to-gray-50 border-b border-gray-100">
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">#</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">الهوية</th>
              <th class="px-5 py-3.5 text-right text-xs font-bold text-gray-500">العنوان</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-500">الحالة</th>
              <th class="px-5 py-3.5 text-center text-xs font-bold text-gray-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-if="loading"><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-spinner fa-spin text-2xl text-indigo-400 mb-2 block"></i>جاري التحميل...</td></tr>
            <tr v-else-if="filtered.length === 0"><td colspan="7" class="text-center py-12 text-gray-400"><i class="fas fa-users-slash text-3xl mb-2 block"></i>لا يوجد عملاء</td></tr>
            <tr v-for="(c, i) in filtered" :key="c.id"
              class="hover:bg-indigo-50/30 group transition cursor-pointer select-none"
              @contextmenu.prevent="openCtx($event, c)"
              @touchstart="onTouchStart($event, c)"
              @touchend="onTouchEnd"
              @touchmove="onTouchEnd">
              <td class="px-5 py-3.5 text-gray-400 font-mono text-xs">{{ i+1 }}</td>
              <td class="px-5 py-3.5">
                <div class="flex items-center gap-2.5">
                  <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-400 flex items-center justify-center text-white font-bold text-xs shrink-0">{{ c.name?.charAt(0) }}</div>
                  <div>
                    <p class="font-bold text-secondary">{{ c.name }}</p>
                    <p v-if="c.phone2" class="text-xs text-gray-400">{{ c.phone2 }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-3.5 text-gray-600 font-mono" dir="ltr">{{ c.phone || '—' }}</td>
              <td class="px-5 py-3.5 text-gray-500 font-mono text-xs">{{ c.nationalId || '—' }}</td>
              <td class="px-5 py-3.5 text-gray-500 text-xs max-w-[160px] truncate">{{ c.address || '—' }}</td>
              <td class="px-5 py-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                  :class="c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <span class="w-1.5 h-1.5 rounded-full inline-block ml-1"
                    :class="c.status === 'active' ? 'bg-green-500' : 'bg-red-500'"></span>
                  {{ c.status === 'active' ? 'نشط' : 'محظور' }}
                </span>
              </td>
              <td class="px-5 py-3.5">
                <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition">
                  <button @click="openEdit(c)" class="w-8 h-8 rounded-lg hover:bg-blue-50 text-blue-500 flex items-center justify-center transition" title="تعديل">
                    <i class="fas fa-pen text-xs"></i>
                  </button>
                  <button @click="deleteTarget = c" class="w-8 h-8 rounded-lg hover:bg-red-50 text-red-400 flex items-center justify-center transition" title="حذف">
                    <i class="fas fa-trash-alt text-xs"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="showModal = false">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-6 py-4 flex items-center justify-between">
              <h3 class="text-white font-bold text-base flex items-center gap-2">
                <i class="fas fa-user-plus"></i>
                {{ editing ? 'تعديل العميل' : 'إضافة عميل جديد' }}
              </h3>
              <button @click="showModal = false" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="save" class="p-6 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">الاسم الكامل <span class="text-red-400">*</span></label>
                  <input v-model="form.name" required class="input-field" placeholder="محمد أحمد" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">رقم الهاتف</label>
                  <input v-model="form.phone" class="input-field" dir="ltr" placeholder="07X XXXX XXXX" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">هاتف بديل</label>
                  <input v-model="form.phone2" class="input-field" dir="ltr" placeholder="07X XXXX XXXX" />
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-500 mb-1 block">رقم الهوية</label>
                  <input v-model="form.nationalId" class="input-field" placeholder="رقم الهوية" />
                </div>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">العنوان</label>
                <input v-model="form.address" class="input-field" placeholder="المدينة، الحي، الشارع" />
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">ملاحظات</label>
                <textarea v-model="form.notes" rows="2" class="input-field resize-none" placeholder="..."></textarea>
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-500 mb-1 block">الحالة</label>
                <select v-model="form.status" class="input-field">
                  <option value="active">نشط</option>
                  <option value="blocked">محظور</option>
                </select>
              </div>
              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="saving ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ saving ? 'جاري الحفظ...' : (editing ? 'حفظ التعديلات' : 'إضافة') }}
                </button>
                <button type="button" @click="showModal = false" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="deleteTarget = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="bg-gradient-to-l from-red-600 to-red-500 px-6 py-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-user-times text-white"></i>
              </div>
              <div>
                <h3 class="text-white font-black text-base">تأكيد الحذف</h3>
                <p class="text-red-100 text-xs">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <div class="px-6 py-5">
              <p class="text-sm text-gray-600 mb-3">هل تريد حذف العميل:</p>
              <div class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm shrink-0">{{ deleteTarget.name?.charAt(0) }}</div>
                <div>
                  <p class="font-black text-secondary text-sm">{{ deleteTarget.name }}</p>
                  <p class="text-xs text-gray-500">{{ deleteTarget.phone }}</p>
                </div>
              </div>
            </div>
            <div class="flex gap-3 px-6 pb-5">
              <button @click="confirmDelete" :disabled="deleting"
                class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                <i :class="deleting ? 'fas fa-spinner fa-spin' : 'fas fa-trash'"></i>
                {{ deleting ? 'جاري الحذف...' : 'نعم، احذف' }}
              </button>
              <button @click="deleteTarget = null" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition">إلغاء</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Context Menu -->
    <Teleport to="body">
      <Transition name="ctx-fade">
        <div v-if="ctx.show" class="fixed inset-0 z-[200]" @click="closeCtx" @contextmenu.prevent="closeCtx">
          <div class="absolute bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-52 py-1" :style="ctxStyle" @click.stop>
            <button @click="ctxAction('detail')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 transition">
              <div class="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0"><i class="fas fa-eye text-indigo-600 text-xs"></i></div>
              <span class="font-medium">عرض التفاصيل</span>
            </button>
            <button @click="ctxAction('edit')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition">
              <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><i class="fas fa-pen text-blue-600 text-xs"></i></div>
              <span class="font-medium">تعديل</span>
            </button>
            <button @click="ctxAction('pay')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition">
              <div class="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0"><i class="fas fa-coins text-green-600 text-xs"></i></div>
              <span class="font-medium">تسجيل دفعة</span>
            </button>
            <button @click="ctxAction('print')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition">
              <div class="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><i class="fas fa-print text-gray-500 text-xs"></i></div>
              <span class="font-medium">طباعة سند قبض</span>
            </button>
            <div class="mx-3 my-1 border-t border-gray-100"></div>
            <button @click="ctxAction('delete')" class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition">
              <div class="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0"><i class="fas fa-trash-alt text-red-500 text-xs"></i></div>
              <span class="font-medium">حذف</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Customer Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detailCustomer" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="detailCustomer = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div class="bg-gradient-to-l from-indigo-600 to-blue-500 px-6 py-4 flex items-center gap-4 shrink-0">
              <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl">{{ detailCustomer.name?.charAt(0) }}</div>
              <div class="flex-1 min-w-0">
                <h3 class="text-white font-black text-base truncate">{{ detailCustomer.name }}</h3>
                <p class="text-blue-100 text-sm font-mono" dir="ltr">{{ detailCustomer.phone }}</p>
              </div>
              <button @click="detailCustomer = null" class="text-white/70 hover:text-white shrink-0"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-5 overflow-y-auto space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">رقم الهاتف</p><p class="font-bold text-sm font-mono text-gray-700" dir="ltr">{{ detailCustomer.phone || '—' }}</p></div>
                <div class="bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">هاتف بديل</p><p class="font-bold text-sm font-mono text-gray-700" dir="ltr">{{ detailCustomer.phone2 || '—' }}</p></div>
                <div class="bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">رقم الهوية</p><p class="font-bold text-sm text-gray-700">{{ detailCustomer.nationalId || '—' }}</p></div>
                <div class="bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">الحالة</p><span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="detailCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">{{ detailCustomer.status === 'active' ? 'نشط' : 'محظور' }}</span></div>
                <div v-if="detailCustomer.address" class="col-span-2 bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">العنوان</p><p class="font-medium text-sm text-gray-700">{{ detailCustomer.address }}</p></div>
                <div v-if="detailCustomer.notes" class="col-span-2 bg-gray-50 rounded-xl p-3"><p class="text-xs text-gray-400 mb-0.5">ملاحظات</p><p class="text-sm text-gray-600">{{ detailCustomer.notes }}</p></div>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5"><i class="fas fa-file-contract text-indigo-400"></i> العقود</p>
                <div v-if="loadingDetail" class="text-center py-4 text-gray-400 text-sm"><i class="fas fa-spinner fa-spin ml-2"></i>جاري التحميل...</div>
                <div v-else-if="!detailContracts.length" class="text-center py-4 text-gray-400 text-sm bg-gray-50 rounded-xl">لا توجد عقود لهذا العميل</div>
                <div v-else class="space-y-2">
                  <router-link v-for="ct in detailContracts" :key="ct.id" :to="`/installments/contracts/${ct.id}`" @click="detailCustomer = null"
                    class="flex items-center justify-between p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl transition border border-transparent hover:border-indigo-200 group">
                    <div>
                      <p class="font-mono font-bold text-indigo-600 text-xs">{{ ct.contractNumber }}</p>
                      <p class="text-sm text-gray-700 font-medium">{{ ct.productName }}</p>
                      <p class="text-xs text-gray-400">{{ ct.paidCount }}/{{ ct.installmentCount }} قسط</p>
                    </div>
                    <div class="text-left ml-2">
                      <span class="px-2 py-0.5 rounded-full text-xs font-semibold block mb-1 text-center"
                        :class="({ active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700', late: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' } as any)[ct.status] || 'bg-gray-100 text-gray-500'">
                        {{ ({ active: 'نشط', completed: 'مكتمل', late: 'متأخر', cancelled: 'ملغي' } as any)[ct.status] || ct.status }}
                      </span>
                      <p class="text-xs text-red-500 font-bold">{{ Number(ct.remainingAmount || 0).toLocaleString('ar-IQ') }} د.ع</p>
                    </div>
                  </router-link>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button @click="openEdit(detailCustomer); detailCustomer = null"
                class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2">
                <i class="fas fa-pen"></i> تعديل
              </button>
              <button @click="detailCustomer = null" class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition">إغلاق</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Contract Picker (customer has multiple active contracts) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="ctxPayContracts.length > 0" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="ctxPayContracts = []">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div class="bg-gradient-to-l from-green-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
              <h3 class="text-white font-bold flex items-center gap-2"><i class="fas fa-file-contract"></i> اختر العقد للسداد</h3>
              <button @click="ctxPayContracts = []" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-4 space-y-2">
              <button v-for="ct in ctxPayContracts" :key="ct.id" @click="pickContractForPay(ct)"
                class="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-green-50 rounded-xl border border-transparent hover:border-green-200 transition text-right">
                <div>
                  <p class="font-mono font-bold text-indigo-600 text-xs">{{ ct.contractNumber }}</p>
                  <p class="text-sm font-medium text-gray-700">{{ ct.productName }}</p>
                </div>
                <div>
                  <p class="font-bold text-indigo-600 text-sm">{{ Number(ct.installmentAmount || 0).toLocaleString('ar-IQ') }} د.ع</p>
                  <p class="text-xs text-red-400">متبقي: {{ Number(ct.remainingAmount || 0).toLocaleString('ar-IQ') }}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Quick Pay from Context -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="ctxPayTarget" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="ctxPayTarget = null">
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div class="bg-gradient-to-l from-green-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 class="text-white font-bold flex items-center gap-2"><i class="fas fa-coins"></i> تسجيل دفعة</h3>
                <p class="text-green-100 text-xs mt-0.5">{{ ctxPayTarget.contractNumber }} — {{ ctxPayTarget.customer?.name }}</p>
              </div>
              <button @click="ctxPayTarget = null" class="text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
            </div>
            <form @submit.prevent="ctxPaySave" class="p-5 space-y-3">
              <div class="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3 text-center">
                <div><p class="text-xs text-gray-400 mb-0.5">مبلغ القسط</p><p class="font-black text-indigo-600 text-sm">{{ Number(ctxPayTarget.installmentAmount || 0).toLocaleString('ar-IQ') }} د.ع</p></div>
                <div><p class="text-xs text-gray-400 mb-0.5">المتبقي</p><p class="font-black text-red-500 text-sm">{{ Number(ctxPayTarget.remainingAmount || 0).toLocaleString('ar-IQ') }} د.ع</p></div>
                <div><p class="text-xs text-gray-400 mb-0.5">الأقساط</p><p class="font-black text-gray-600 text-sm">{{ ctxPayTarget.paidCount }}/{{ ctxPayTarget.installmentCount }}</p></div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="text-xs font-semibold text-gray-500 mb-1 block">المبلغ <span class="text-red-400">*</span></label><input v-model.number="ctxPayForm.amount" required type="number" min="1" class="input-field" /></div>
                <div><label class="text-xs font-semibold text-gray-500 mb-1 block">التاريخ <span class="text-red-400">*</span></label><input v-model="ctxPayForm.date" required type="date" class="input-field" /></div>
              </div>
              <div><label class="text-xs font-semibold text-gray-500 mb-1 block">استلم بواسطة</label><input v-model="ctxPayForm.receivedBy" class="input-field" placeholder="اسم الموظف" /></div>
              <div><label class="text-xs font-semibold text-gray-500 mb-1 block">ملاحظات</label><input v-model="ctxPayForm.notes" class="input-field" placeholder="..." /></div>
              <div class="flex gap-3 pt-1">
                <button type="submit" :disabled="ctxPaying"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl text-sm font-black transition flex items-center justify-center gap-2 disabled:opacity-60">
                  <i :class="ctxPaying ? 'fas fa-spinner fa-spin' : 'fas fa-check'"></i>
                  {{ ctxPaying ? '...' : 'تسجيل الدفعة' }}
                </button>
                <button type="button" @click="ctxPayTarget = null" class="px-5 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-medium hover:bg-gray-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../../api';

const customers    = ref<any[]>([]);
const loading      = ref(true);
const saving       = ref(false);
const deleting     = ref(false);
const showModal    = ref(false);
const editing      = ref<any>(null);
const deleteTarget = ref<any>(null);
const search       = ref('');
const filterStatus = ref('');

const emptyForm = () => ({ name: '', phone: '', phone2: '', nationalId: '', address: '', notes: '', status: 'active' });
const form = ref(emptyForm());

const filtered = computed(() => customers.value.filter(c => {
  const s = search.value.toLowerCase();
  const matchSearch = !s || c.name?.toLowerCase().includes(s) || c.phone?.includes(s) || c.nationalId?.includes(s);
  const matchStatus = !filterStatus.value || c.status === filterStatus.value;
  return matchSearch && matchStatus;
}));

function openAdd() { editing.value = null; form.value = emptyForm(); showModal.value = true; }
function openEdit(c: any) { editing.value = c; form.value = { ...c }; showModal.value = true; }

async function save() {
  saving.value = true;
  try {
    if (editing.value) {
      await api.patch(`/installments/customers/${editing.value.id}`, form.value);
    } else {
      await api.post('/installments/customers', form.value);
    }
    showModal.value = false;
    await load();
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { saving.value = false; }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await api.delete(`/installments/customers/${deleteTarget.value.id}`);
    deleteTarget.value = null;
    await load();
  } finally { deleting.value = false; }
}

async function load() {
  try {
    const r = await api.get('/installments/customers');
    customers.value = r.data;
  } finally { loading.value = false; }
}
// ─── Context Menu ─────────────────────────────────────────────────
const router = useRouter();
const ctx = reactive({ show: false, x: 0, y: 0, target: null as any });
let longPressTimer: ReturnType<typeof setTimeout> | null = null;
const ctxStyle = computed(() => {
  const W = 210, H = 245;
  const x = ctx.x + W > window.innerWidth ? ctx.x - W : ctx.x;
  const y = ctx.y + H > window.innerHeight ? ctx.y - H : ctx.y;
  return { left: `${x}px`, top: `${y}px` };
});
function openCtx(event: MouseEvent, item: any) { ctx.x = event.clientX; ctx.y = event.clientY; ctx.target = item; ctx.show = true; }
function closeCtx() { ctx.show = false; }
function onTouchStart(event: TouchEvent, item: any) {
  longPressTimer = setTimeout(() => {
    const t = event.touches[0];
    openCtx({ clientX: t.clientX, clientY: t.clientY } as MouseEvent, item);
  }, 600);
}
function onTouchEnd() { if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; } }

// ─── Customer Detail Modal ─────────────────────────────────────────
const detailCustomer = ref<any>(null);
const detailContracts = ref<any[]>([]);
const loadingDetail = ref(false);
async function loadDetailCustomer(c: any) {
  detailCustomer.value = c;
  loadingDetail.value = true;
  detailContracts.value = [];
  try {
    const { data } = await api.get('/installments/contracts');
    detailContracts.value = data.filter((ct: any) => ct.customer?.id === c.id);
  } catch {} finally { loadingDetail.value = false; }
}

// ─── Quick Pay from Customer Context ──────────────────────────────
const ctxPayContracts = ref<any[]>([]);
const ctxPayTarget = ref<any>(null);
const ctxPayForm = ref({ amount: 0, date: new Date().toISOString().split('T')[0], receivedBy: '', notes: '' });
const ctxPaying = ref(false);
async function openCtxPayForCustomer(c: any) {
  try {
    const { data } = await api.get('/installments/contracts');
    const active = data.filter((ct: any) => ct.customer?.id === c.id && (ct.status === 'active' || ct.status === 'late'));
    if (!active.length) { alert('لا توجد عقود نشطة لهذا العميل'); return; }
    if (active.length === 1) {
      ctxPayTarget.value = active[0];
      ctxPayForm.value = { amount: active[0].installmentAmount, date: new Date().toISOString().split('T')[0], receivedBy: '', notes: '' };
    } else { ctxPayContracts.value = active; }
  } catch {}
}
function pickContractForPay(ct: any) {
  ctxPayContracts.value = [];
  ctxPayTarget.value = ct;
  ctxPayForm.value = { amount: ct.installmentAmount, date: new Date().toISOString().split('T')[0], receivedBy: '', notes: '' };
}
async function ctxPaySave() {
  if (!ctxPayTarget.value) return;
  ctxPaying.value = true;
  try {
    await api.post(`/installments/contracts/${ctxPayTarget.value.id}/payments`, ctxPayForm.value);
    ctxPayTarget.value = null;
    await load();
  } catch (e: any) { alert(e.response?.data?.message || 'حدث خطأ'); }
  finally { ctxPaying.value = false; }
}
async function navToLatestContract(c: any) {
  try {
    const { data } = await api.get('/installments/contracts');
    const all = data.filter((ct: any) => ct.customer?.id === c.id);
    if (!all.length) { alert('لا توجد عقود لهذا العميل'); return; }
    const latest = all.reduce((a: any, b: any) => (a.id > b.id ? a : b));
    router.push(`/installments/contracts/${latest.id}`);
  } catch {}
}
async function ctxAction(action: string) {
  const c = ctx.target; closeCtx(); if (!c) return;
  if (action === 'detail')      await loadDetailCustomer(c);
  else if (action === 'edit')   openEdit(c);
  else if (action === 'pay')    await openCtxPayForCustomer(c);
  else if (action === 'print')  await navToLatestContract(c);
  else if (action === 'delete') deleteTarget.value = c;
}

onMounted(load);
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.ctx-fade-enter-active, .ctx-fade-leave-active { transition: opacity .12s, transform .12s; }
.ctx-fade-enter-from, .ctx-fade-leave-to { opacity: 0; transform: scale(.96); }
</style>
