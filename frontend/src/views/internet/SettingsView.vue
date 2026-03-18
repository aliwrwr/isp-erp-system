<template>
  <div class="flex flex-col gap-6">

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-secondary">الإعدادات</h2>
        <p class="text-sm text-gray-400 mt-0.5">إعدادات نظام الاشتراكات</p>
      </div>
      <button
        v-if="activeTab === 'general'"
        @click="saveAll"
        :disabled="saving"
        class="flex items-center gap-2 bg-gradient-to-l from-indigo-600 to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-60"
      >
        <i class="fas fa-save"></i>
        {{ saving ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
      </button>
    </div>

    <!-- Saved notification -->
    <transition name="fade">
      <div v-if="savedNotice" class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
        <i class="fas fa-check-circle"></i>
        تم حفظ الإعدادات بنجاح
      </div>
    </transition>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="[
          'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition',
          activeTab === tab.key
            ? 'bg-white text-indigo-700 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        ]"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
      </button>
    </div>

    <!-- ===== GENERAL SETTINGS TAB ===== -->
    <template v-if="activeTab === 'general'">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-image text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">شعار الشركة</h3>
        </div>
        <span class="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
          <i class="fas fa-info-circle ml-1"></i>يُستخدم في الاشتراكات والفواتير فقط
        </span>
      </div>
      <div class="p-5">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <!-- Preview -->
          <div
            class="w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition"
            :class="logoPreview ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-200 bg-gray-50'"
          >
            <img v-if="logoPreview" :src="logoPreview" alt="شعار" class="w-full h-full object-contain p-1" />
            <div v-else class="flex flex-col items-center gap-2 text-gray-300">
              <i class="fas fa-image text-3xl"></i>
              <span class="text-xs">لا يوجد شعار</span>
            </div>
          </div>
          <!-- Controls -->
          <div class="flex flex-col gap-3 flex-1">
            <p class="text-sm text-gray-500">سيظهر الشعار في رأس الفواتير المطبوعة لنظام الاشتراكات</p>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                <i class="fas fa-upload"></i>
                {{ logoPreview ? 'تغيير الشعار' : 'رفع الشعار' }}
                <input type="file" accept="image/*" @change="onLogoChange" class="hidden" />
              </label>
              <button
                v-if="logoPreview"
                @click="removeLogo"
                class="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition"
              >
                <i class="fas fa-trash"></i>
                حذف الشعار
              </button>
            </div>
            <p class="text-xs text-gray-400">الصيغ المدعومة: PNG، JPG، SVG — الحجم الأقصى: 2 ميغابايت</p>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Company Info -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-building text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">معلومات الشركة</h3>
          <span class="mr-auto text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
            <i class="fas fa-info-circle ml-1"></i>تُستخدم في الاشتراكات فقط
          </span>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم الشركة</label>
            <input v-model="settings.companyName" type="text" placeholder="اسم الشركة..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف</label>
            <input v-model="settings.companyPhone" type="text" placeholder="07XXXXXXXXX"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">البريد الإلكتروني</label>
            <input v-model="settings.companyEmail" type="email" placeholder="info@company.com"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العنوان</label>
            <textarea v-model="settings.companyAddress" rows="2" placeholder="العنوان التفصيلي..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Subscription Defaults -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-file-contract text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">إعدادات الاشتراكات</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">مدة الاشتراك الافتراضية (بالأيام)</label>
            <input v-model.number="settings.defaultDuration" type="number" min="1" placeholder="30"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">تنبيه انتهاء الاشتراك قبل (بالأيام)</label>
            <input v-model.number="settings.expiryWarningDays" type="number" min="1" placeholder="5"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العملة المستخدمة</label>
            <select v-model="settings.currency" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option value="IQD">دينار عراقي (د.ع)</option>
              <option value="USD">دولار أمريكي ($)</option>
            </select>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">تجديد تلقائي للاشتراكات</p>
              <p class="text-xs text-gray-400 mt-0.5">تجديد الاشتراك تلقائياً عند انتهاء المدة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.autoRenew" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Notifications Settings -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-bell text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">إعدادات الإشعارات</h3>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار انتهاء الاشتراك</p>
              <p class="text-xs text-gray-400 mt-0.5">إرسال تنبيه عند اقتراب انتهاء الاشتراك</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyExpiry" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار الاشتراك الجديد</p>
              <p class="text-xs text-gray-400 mt-0.5">إشعار عند إضافة اشتراك جديد</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyNewSub" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إشعار الديون المتراكمة</p>
              <p class="text-xs text-gray-400 mt-0.5">تنبيه عند وجود ديون غير مسددة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.notifyDebt" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Display Preferences -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-indigo-600 to-blue-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-sliders-h text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">تفضيلات العرض</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">عدد السجلات في الصفحة</label>
            <select v-model.number="settings.pageSize" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option :value="10">10 سجلات</option>
              <option :value="25">25 سجل</option>
              <option :value="50">50 سجل</option>
              <option :value="100">100 سجل</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">تنسيق التاريخ</label>
            <select v-model="settings.dateFormat" class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition">
              <option value="YYYY-MM-DD">2026-03-15</option>
              <option value="DD/MM/YYYY">15/03/2026</option>
              <option value="DD-MM-YYYY">15-03-2026</option>
            </select>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">إظهار الاشتراكات المنتهية</p>
              <p class="text-xs text-gray-400 mt-0.5">عرض الاشتراكات المنتهية في القوائم</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.showExpired" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

    </div>
    </template>

    <!-- ===== BACKUP TAB ===== -->
    <template v-if="activeTab === 'backup'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Manual Backup -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-l from-emerald-600 to-teal-500 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <i class="fas fa-download text-white text-sm"></i>
            </div>
            <h3 class="font-bold text-white text-sm">النسخ الاحتياطي اليدوي</h3>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div v-if="backupStatus" class="grid grid-cols-2 gap-3">
              <div class="p-3 bg-gray-50 rounded-xl text-center">
                <p class="text-xs text-gray-400 mb-1">حجم قاعدة البيانات</p>
                <p class="text-base font-bold text-gray-700">{{ backupStatus.dbSizeKb }} KB</p>
              </div>
              <div class="p-3 bg-gray-50 rounded-xl text-center">
                <p class="text-xs text-gray-400 mb-1">آخر تعديل</p>
                <p class="text-xs font-semibold text-gray-700">{{ formatDate(backupStatus.dbModified) }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-500">تحميل نسخة احتياطية كاملة من قاعدة البيانات بصيغة <span class="font-mono text-indigo-600">.sqlite</span></p>
            <button
              @click="downloadWithAuth"
              class="inline-flex items-center justify-center gap-2 bg-gradient-to-l from-emerald-600 to-teal-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow hover:shadow-md transition"
            >
              <i class="fas fa-download"></i>
              تحميل نسخة احتياطية
            </button>
            <p class="text-xs text-gray-400">
              <i class="fas fa-info-circle ml-1"></i>
              احتفظ بالنسخة الاحتياطية في مكان آمن. يمكنك استخدامها لاستعادة البيانات عند الحاجة.
            </p>
          </div>
        </div>

        <!-- Restore Backup -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 bg-gradient-to-l from-orange-500 to-amber-500 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <i class="fas fa-upload text-white text-sm"></i>
            </div>
            <h3 class="font-bold text-white text-sm">استعادة نسخة احتياطية</h3>
          </div>
          <div class="p-5 flex flex-col gap-4">
            <div class="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              <i class="fas fa-exclamation-triangle mt-0.5 flex-shrink-0"></i>
              <span>تحذير: ستؤدي الاستعادة إلى <strong>استبدال جميع البيانات الحالية</strong> بالبيانات الموجودة في الملف المختار. هذه العملية لا يمكن التراجع عنها.</span>
            </div>
            <div
              class="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer"
              :class="restoreFile ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50 hover:border-orange-300'"
              @click="restoreInput?.click()"
              @dragover.prevent
              @drop.prevent="onRestoreDrop"
            >
              <i class="fas fa-database text-3xl mb-2" :class="restoreFile ? 'text-orange-500' : 'text-gray-300'"></i>
              <p v-if="!restoreFile" class="text-sm text-gray-400">اضغط أو اسحب ملف <span class="font-mono font-semibold">.sqlite</span> هنا</p>
              <p v-else class="text-sm font-semibold text-orange-700">{{ restoreFile.name }}</p>
              <p v-if="restoreFile" class="text-xs text-gray-400 mt-1">{{ (restoreFile.size / 1024).toFixed(0) }} KB</p>
              <input ref="restoreInput" type="file" accept=".sqlite" class="hidden" @change="onRestoreFileChange" />
            </div>
            <button
              :disabled="!restoreFile || restoring"
              @click="confirmRestore"
              class="inline-flex items-center justify-center gap-2 bg-gradient-to-l from-orange-500 to-amber-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-upload"></i>
              {{ restoring ? 'جاري الاستعادة...' : 'استعادة البيانات' }}
            </button>
          </div>
        </div>

      </div>

      <!-- Google Drive Auto Backup -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-blue-600 to-indigo-600 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <i class="fab fa-google-drive text-white text-sm"></i>
            </div>
            <h3 class="font-bold text-white text-sm">النسخ التلقائي على Google Drive</h3>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="backupStatus?.enabled" class="text-xs bg-green-400/30 text-green-100 border border-green-300/40 px-2.5 py-1 rounded-full font-semibold">
              <i class="fas fa-circle text-xs ml-1"></i>مُفعَّل — كل 6 ساعات
            </span>
            <span v-else-if="backupStatus?.configured" class="text-xs bg-yellow-400/30 text-yellow-100 border border-yellow-300/40 px-2.5 py-1 rounded-full font-semibold">
              <i class="fas fa-pause-circle text-xs ml-1"></i>متصل — غير مُفعَّل
            </span>
            <span v-else class="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
              <i class="fas fa-times-circle text-xs ml-1"></i>غير متصل
            </span>
          </div>
        </div>
        <div class="p-6 flex flex-col gap-6">

          <div v-if="backupStatus?.configured" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-3 bg-gray-50 rounded-xl">
              <p class="text-xs text-gray-400 mb-1">الحالة</p>
              <p class="text-sm font-semibold" :class="backupStatus.enabled ? 'text-green-600' : 'text-gray-500'">
                {{ backupStatus.enabled ? 'تلقائي نشط' : 'تلقائي موقوف' }}
              </p>
            </div>
            <div class="p-3 bg-gray-50 rounded-xl">
              <p class="text-xs text-gray-400 mb-1">آخر نسخة</p>
              <p class="text-xs font-semibold text-gray-700">{{ formatDate(backupStatus.lastBackup) || '—' }}</p>
            </div>
            <div class="p-3 bg-gray-50 rounded-xl" v-if="backupStatus.lastError">
              <p class="text-xs text-gray-400 mb-1">آخر خطأ</p>
              <p class="text-xs text-red-600 truncate" :title="backupStatus.lastError">{{ backupStatus.lastError }}</p>
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex flex-col gap-2">
            <p class="font-semibold flex items-center gap-2"><i class="fas fa-info-circle"></i>كيفية الإعداد:</p>
            <ol class="list-decimal list-inside flex flex-col gap-1 text-xs leading-relaxed">
              <li>افتح <strong>Google Cloud Console</strong> وأنشئ مشروعاً جديداً</li>
              <li>فعّل <strong>Google Drive API</strong> من قائمة APIs &amp; Services</li>
              <li>أنشئ <strong>Service Account</strong> وانزل ملف JSON الخاص به</li>
              <li>في Google Drive، أنشئ مجلداً وشاركه مع البريد الإلكتروني لـ Service Account</li>
              <li>انسخ معرّف المجلد من رابط Drive وأدخله أدناه</li>
            </ol>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="flex flex-col gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                  ملف Service Account (JSON) <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="driveForm.serviceAccountJson"
                  rows="8"
                  placeholder='{ "type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..." }'
                  dir="ltr"
                  class="w-full px-3 py-2.5 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none bg-gray-50"
                ></textarea>
                <label class="mt-2 cursor-pointer inline-flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-800 font-semibold">
                  <i class="fas fa-file-import"></i>
                  أو اختر ملف JSON مباشرة
                  <input type="file" accept=".json" @change="onServiceAccountFile" class="hidden" />
                </label>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 mb-1.5">معرّف مجلد Drive (اختياري)</label>
                <input
                  v-model="driveForm.folderId"
                  type="text"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs"
                  dir="ltr"
                  class="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <p class="text-xs text-gray-400 mt-1">آخر جزء من رابط المجلد على Drive. إذا تُرك فارغاً يُحفظ في My Drive.</p>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div>
                  <p class="text-sm font-semibold text-gray-700">نسخ تلقائي كل 6 ساعات</p>
                  <p class="text-xs text-gray-400 mt-0.5">يرفع نسخة احتياطية تلقائياً إلى Drive</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="driveForm.enabled" class="sr-only peer" />
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              <button
                @click="saveDriveConfig"
                :disabled="savingDrive || !driveForm.serviceAccountJson.trim()"
                class="flex items-center justify-center gap-2 bg-gradient-to-l from-blue-600 to-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fas fa-save"></i>
                {{ savingDrive ? 'جاري الحفظ...' : 'حفظ إعدادات Drive' }}
              </button>

              <button
                v-if="backupStatus?.configured"
                @click="backupNow"
                :disabled="backingUpNow"
                class="flex items-center justify-center gap-2 bg-gradient-to-l from-green-600 to-emerald-500 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-50"
              >
                <i :class="backingUpNow ? 'fas fa-spinner fa-spin' : 'fas fa-cloud-upload-alt'"></i>
                {{ backingUpNow ? 'جاري الرفع...' : 'نسخ الآن على Drive' }}
              </button>

              <button
                v-if="backupStatus?.configured"
                @click="disableDrive"
                class="flex items-center justify-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              >
                <i class="fas fa-unlink"></i>
                إلغاء ربط Drive
              </button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="driveMessage" :class="[
              'flex items-center gap-2 px-4 py-3 rounded-xl text-sm',
              driveMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
            ]">
              <i :class="driveMessage.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
              {{ driveMessage.text }}
            </div>
          </transition>

        </div>
      </div>
    </template>

    <!-- Confirm Restore Dialog -->
    <transition name="fade">
      <div v-if="showRestoreConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">تأكيد الاستعادة</h3>
              <p class="text-sm text-gray-500">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          <p class="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
            سيتم استبدال <strong>جميع البيانات الحالية</strong> بمحتوى الملف:
            <br /><span class="font-mono text-indigo-700 text-xs">{{ restoreFile?.name }}</span>
            <br /><br />هل أنت متأكد من المتابعة؟
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="showRestoreConfirm = false" class="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              إلغاء
            </button>
            <button @click="doRestore" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition">
              نعم، استعادة البيانات
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ===== UPDATE TAB ===== -->
    <template v-if="activeTab === 'update'">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Trigger card -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <i class="fas fa-sync-alt text-indigo-500"></i>
            </div>
            <div>
              <h3 class="font-bold text-gray-800">تحديث النظام</h3>
              <p class="text-xs text-gray-400">جلب آخر الإصدارات من GitHub وإعادة تشغيل الخدمات</p>
            </div>
          </div>

          <div class="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1 font-mono">
            <p><span class="text-gray-400">الحالة:</span>
              <span :class="updateRunning ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'">
                {{ updateRunning ? 'جار التحديث...' : 'جاهز' }}
              </span>
            </p>
            <p v-if="updateStartedAt"><span class="text-gray-400">بدأ في:</span> {{ updateStartedAt }}</p>
          </div>

          <button @click="showUpdateConfirm = true" :disabled="updateRunning"
            class="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            :class="updateRunning
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'">
            <i class="fas" :class="updateRunning ? 'fa-spinner fa-spin' : 'fa-rocket'"></i>
            {{ updateRunning ? 'جار التحديث...' : 'تحديث النظام الآن' }}
          </button>

          <button @click="fetchUpdateLog" :disabled="updateRunning"
            class="w-full py-2.5 rounded-xl font-semibold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-2">
            <i class="fas fa-file-alt text-gray-400"></i>
            تحديث السجل
          </button>

          <div v-if="updateMsg" class="rounded-xl px-4 py-3 text-sm font-semibold flex items-center gap-2"
            :class="updateError ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'">
            <i class="fas" :class="updateError ? 'fa-times-circle' : 'fa-check-circle'"></i>
            {{ updateMsg }}
          </div>
        </div>

        <!-- Log card -->
        <div class="bg-gray-900 rounded-2xl border border-gray-700 shadow-sm p-5 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-gray-200 text-sm flex items-center gap-2">
              <i class="fas fa-terminal text-green-400"></i>
              سجل التحديث
            </h3>
            <button @click="updateLog = ''" class="text-gray-500 hover:text-gray-300 text-xs transition">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
          <div ref="logBox"
            class="flex-1 overflow-y-auto text-xs font-mono text-green-300 whitespace-pre-wrap leading-relaxed bg-black/30 rounded-xl p-3 min-h-[260px] max-h-[420px]">
            <span v-if="!updateLog" class="text-gray-600">لا يوجد سجل بعد — اضغط "تحديث النظام الآن" للبدء</span>
            <span v-else>{{ updateLog }}</span>
          </div>
        </div>

      </div>
    </template>

  </div>

  <!-- Update Confirm Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showUpdateConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click.self="showUpdateConfirm = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md" dir="rtl">

          <!-- Header -->
          <div class="bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-5 rounded-t-2xl">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
                <i class="fas fa-rocket text-white text-lg"></i>
              </div>
              <div>
                <h3 class="font-bold text-white text-base">تحديث النظام</h3>
                <p class="text-white/70 text-xs">تأكيد تشغيل عملية التحديث</p>
              </div>
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4">
            <div class="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
              <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
              <div class="text-sm text-amber-800 space-y-1">
                <p class="font-bold">تنبيه: سيتوقف النظام لثوانٍ أثناء التحديث</p>
                <p class="text-xs text-amber-700 opacity-90">يُنصح بعدم تشغيل هذا أثناء وقت ذروة الاستخدام</p>
              </div>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <p class="font-semibold text-gray-700 mb-2">سيقوم التحديث بالخطوات التالية:</p>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-indigo-400 w-4"></i><span>جلب آخر التحديثات من GitHub</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-indigo-400 w-4"></i><span>بناء Backend و Frontend</span></div>
              <div class="flex items-center gap-2"><i class="fas fa-check-circle text-indigo-400 w-4"></i><span>إعادة تشغيل جميع الخدمات تلقائياً</span></div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 pb-6 flex gap-3 justify-end">
            <button @click="showUpdateConfirm = false"
              class="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
              إلغاء
            </button>
            <button @click="showUpdateConfirm = false; triggerUpdate()"
              class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center gap-2 transition shadow-md shadow-indigo-200">
              <i class="fas fa-rocket text-xs"></i>
              تأكيد التحديث
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api/index';

const saving = ref(false);
const savedNotice = ref(false);
const logoPreview = ref<string | null>(null);
const activeTab = ref<'general' | 'backup' | 'update'>('general');

const tabs = [
  { key: 'general', label: 'الإعدادات العامة', icon: 'fas fa-cog' },
  { key: 'backup', label: 'النسخ الاحتياطي', icon: 'fas fa-database' },
  { key: 'update', label: 'تحديث النظام', icon: 'fas fa-sync-alt' },
];

const showUpdateConfirm = ref(false);

// ── System update ──────────────────────────────────────────────────
const updateRunning   = ref(false);
const updateMsg       = ref('');
const updateError     = ref(false);
const updateLog       = ref('');
const updateStartedAt = ref('');
const logBox          = ref<HTMLElement | null>(null);
let   pollInterval: ReturnType<typeof setInterval> | null = null;

function stopPolling() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

async function fetchUpdateLog() {
  try {
    const res = await api.get('/deploy/admin/logs');
    updateLog.value = res.data.log || '';
    // Auto-scroll to bottom
    await new Promise(r => setTimeout(r, 50));
    if (logBox.value) logBox.value.scrollTop = logBox.value.scrollHeight;
    // If log contains a "done" marker, stop polling
    if (/completed|Update completed|اكتمل|تم التحديث|error|failed|خطأ|Exit Code/i.test(updateLog.value)) {
      updateRunning.value = false;
      stopPolling();
    }
  } catch {}
}

async function triggerUpdate() {
  if (updateRunning.value) return;
  updateRunning.value  = true;
  updateMsg.value      = '';
  updateError.value    = false;
  updateLog.value      = '';
  updateStartedAt.value = new Date().toLocaleTimeString('ar-IQ');
  try {
    const res = await api.post('/deploy/admin');
    updateMsg.value = res.data.message || 'بدأ التحديث';
    // Poll log every 3 seconds
    pollInterval = setInterval(fetchUpdateLog, 3000);
    // Auto-stop after 5 minutes
    setTimeout(() => { updateRunning.value = false; stopPolling(); }, 300_000);
  } catch (e: any) {
    updateRunning.value = false;
    updateMsg.value = e?.response?.data?.message || 'فشل التحديث';
    updateError.value = true;
  }
}

const LOGO_KEY = 'isp_internet_logo';
const STORAGE_KEY = 'isp_internet_settings';

const settings = ref({
  companyName: '',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',
  defaultDuration: 30,
  expiryWarningDays: 5,
  currency: 'IQD',
  autoRenew: false,
  notifyExpiry: true,
  notifyNewSub: true,
  notifyDebt: true,
  pageSize: 25,
  dateFormat: 'YYYY-MM-DD',
  showExpired: true,
});

// ── Backup tab state ──────────────────────────────────────────
const backupStatus = ref<any>(null);
const restoreFile = ref<File | null>(null);
const restoreInput = ref<HTMLInputElement | null>(null);
const restoring = ref(false);
const showRestoreConfirm = ref(false);
const backingUpNow = ref(false);
const savingDrive = ref(false);
const driveMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null);

const driveForm = ref({
  serviceAccountJson: '',
  folderId: '',
  enabled: false,
});

const today = new Date().toISOString().slice(0, 10);

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('ar-IQ', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

async function loadBackupStatus() {
  try {
    const { data } = await api.get('/backup/gdrive-status');
    backupStatus.value = data;
    if (data.configured) {
      driveForm.value.enabled = data.enabled;
      driveForm.value.folderId = data.folderId || '';
    }
  } catch {}
}

function downloadWithAuth() {
  api.get('/backup/download', { responseType: 'blob' }).then(({ data }) => {
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `isp-erp-backup-${today}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }).catch(() => alert('فشل في تحميل النسخة الاحتياطية'));
}

function onRestoreFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) restoreFile.value = file;
}

function onRestoreDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.name.toLowerCase().endsWith('.sqlite')) restoreFile.value = file;
}

function confirmRestore() {
  showRestoreConfirm.value = true;
}

async function doRestore() {
  showRestoreConfirm.value = false;
  if (!restoreFile.value) return;
  restoring.value = true;
  try {
    const formData = new FormData();
    formData.append('file', restoreFile.value);
    await api.post('/backup/restore', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    alert('تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تحميل الصفحة.');
    window.location.reload();
  } catch (e: any) {
    alert('فشل في الاستعادة: ' + (e.response?.data?.message || e.message));
  } finally {
    restoring.value = false;
    restoreFile.value = null;
  }
}

function onServiceAccountFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    driveForm.value.serviceAccountJson = reader.result as string;
  };
  reader.readAsText(file);
}

async function saveDriveConfig() {
  savingDrive.value = true;
  driveMessage.value = null;
  try {
    await api.post('/backup/gdrive-config', {
      serviceAccountJson: driveForm.value.serviceAccountJson.trim(),
      folderId: driveForm.value.folderId.trim(),
      enabled: driveForm.value.enabled,
    });
    await loadBackupStatus();
    driveMessage.value = { type: 'success', text: 'تم حفظ إعدادات Google Drive بنجاح' };
  } catch (e: any) {
    driveMessage.value = { type: 'error', text: e.response?.data?.message || 'فشل في حفظ الإعدادات' };
  } finally {
    savingDrive.value = false;
    setTimeout(() => { driveMessage.value = null; }, 5000);
  }
}

async function backupNow() {
  backingUpNow.value = true;
  driveMessage.value = null;
  try {
    const { data } = await api.post('/backup/gdrive-now');
    if (data.success) {
      await loadBackupStatus();
      driveMessage.value = { type: 'success', text: 'تم رفع النسخة الاحتياطية على Google Drive بنجاح ✓' };
    } else {
      driveMessage.value = { type: 'error', text: 'فشل الرفع: ' + data.error };
    }
  } catch (e: any) {
    driveMessage.value = { type: 'error', text: e.response?.data?.message || 'فشل في الاتصال بـ Google Drive' };
  } finally {
    backingUpNow.value = false;
    setTimeout(() => { driveMessage.value = null; }, 6000);
  }
}

async function disableDrive() {
  if (!confirm('هل تريد إلغاء ربط Google Drive وحذف إعدادات الحساب؟')) return;
  try {
    await api.post('/backup/gdrive-disable');
    driveForm.value.serviceAccountJson = '';
    driveForm.value.folderId = '';
    driveForm.value.enabled = false;
    await loadBackupStatus();
    driveMessage.value = { type: 'success', text: 'تم إلغاء ربط Google Drive' };
    setTimeout(() => { driveMessage.value = null; }, 4000);
  } catch {}
}

// ── General settings ──────────────────────────────────────────
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { Object.assign(settings.value, JSON.parse(saved)); } catch {}
  }
  logoPreview.value = localStorage.getItem(LOGO_KEY) || null;
  loadBackupStatus();
});

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    alert('حجم الصورة يتجاوز 2 ميغابايت');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    logoPreview.value = reader.result as string;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  logoPreview.value = null;
}

async function saveAll() {
  saving.value = true;
  await new Promise(r => setTimeout(r, 300));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
  if (logoPreview.value) {
    localStorage.setItem(LOGO_KEY, logoPreview.value);
  } else {
    localStorage.removeItem(LOGO_KEY);
  }
  saving.value = false;
  savedNotice.value = true;
  setTimeout(() => { savedNotice.value = false; }, 3000);
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
