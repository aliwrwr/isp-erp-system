<template>
  <div class="p-4 md:p-6 space-y-6" dir="rtl">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-md">
          <i class="fab fa-whatsapp text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">نظام رسائل واتساب</h1>
          <p class="text-sm text-gray-500">إدارة الإشعارات التلقائية للمشتركين</p>
        </div>
      </div>
      <button @click="refresh" :disabled="loading"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition-colors">
        <i class="fas fa-sync-alt" :class="loading ? 'animate-spin' : ''"></i>
        تحديث
      </button>
    </div>

    <!-- Connection Status + QR -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <!-- Status Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 class="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
          <i class="fas fa-plug text-gray-400"></i>
          حالة الاتصال
        </h2>

        <!-- Connected -->
        <div v-if="status.connected" class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <i class="fab fa-whatsapp text-green-500 text-3xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <span class="font-semibold text-green-600">متصل</span>
            </div>
            <p v-if="status.phone" class="text-sm text-gray-500 mt-0.5">
              الرقم: +{{ status.phone }}
            </p>
          </div>
        </div>

        <!-- Initializing -->
        <div v-else-if="status.initializing" class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <i class="fas fa-circle-notch text-yellow-500 text-3xl animate-spin"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
              <span class="font-semibold text-yellow-600">جاري التهيئة...</span>
            </div>
            <p class="text-sm text-gray-500 mt-0.5">يرجى الانتظار</p>
          </div>
        </div>

        <!-- Disconnected -->
        <div v-else class="flex items-center gap-4 mb-5">
          <div class="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
            <i class="fab fa-whatsapp text-red-400 text-3xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span class="font-semibold text-red-500">غير متصل</span>
            </div>
            <p class="text-sm text-gray-500 mt-0.5">امسح رمز QR للاتصال</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 flex-wrap">
          <button v-if="!status.connected" @click="connect" :disabled="actionLoading"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <i class="fas fa-power-off text-xs"></i>
            اتصال
          </button>
          <button v-if="status.connected" @click="disconnect" :disabled="actionLoading"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <i class="fas fa-sign-out-alt text-xs"></i>
            قطع الاتصال
          </button>
          <button v-if="status.connected" @click="showTestModal = true"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
            <i class="fas fa-paper-plane text-xs"></i>
            رسالة تجريبية
          </button>
        </div>

        <!-- Info note -->
        <div class="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
          <i class="fas fa-info-circle ml-1"></i>
          بعد الضغط على "اتصال"، انتظر ظهور رمز QR في المربع المجاور ثم امسحه بتطبيق واتساب من
          <span class="font-semibold">الهاتف المخصص → الأجهزة المرتبطة → ربط جهاز</span>
        </div>
      </div>

      <!-- QR Code Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center min-h-[240px]">
        <h2 class="text-base font-bold text-gray-700 mb-4 w-full flex items-center gap-2">
          <i class="fas fa-qrcode text-gray-400"></i>
          رمز QR للاتصال
        </h2>

        <div v-if="status.connected" class="flex flex-col items-center gap-3 text-center py-4">
          <div class="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center">
            <i class="fas fa-check-circle text-green-500 text-4xl"></i>
          </div>
          <p class="text-green-600 font-semibold">تم الاتصال بنجاح</p>
          <p class="text-xs text-gray-500">لا حاجة لمسح رمز QR</p>
        </div>

        <div v-else-if="status.hasQR && status.qr" class="flex flex-col items-center gap-3">
          <img :src="status.qr" alt="QR Code" class="w-48 h-48 rounded-xl border-2 border-green-400 shadow-md" />
          <p class="text-xs text-gray-500 text-center">
            افتح واتساب على هاتفك ← الأجهزة المرتبطة ← ربط جهاز
          </p>
          <div class="flex items-center gap-1 text-xs text-orange-500">
            <i class="fas fa-clock"></i>
            يتجدد الرمز تلقائياً كل دقيقة
          </div>
        </div>

        <div v-else-if="status.initializing" class="flex flex-col items-center gap-3 py-4">
          <i class="fas fa-circle-notch text-green-400 text-5xl animate-spin"></i>
          <p class="text-sm text-gray-500">جاري تهيئة الاتصال...</p>
        </div>

        <div v-else class="flex flex-col items-center gap-3 py-4 text-center">
          <i class="fab fa-whatsapp text-gray-300 text-6xl"></i>
          <p class="text-sm text-gray-400">اضغط "اتصال" لتوليد رمز QR</p>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div class="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-bell text-gray-400"></i>
          إعدادات الإشعارات التلقائية
        </h2>
        <div class="flex gap-2">
          <button @click="saveSettings" :disabled="savingSettings"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <i class="fas fa-save text-xs"></i>
            {{ savingSettings ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
          </button>
          <button v-if="status.connected" @click="sendNow" :disabled="sendingNow"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors disabled:opacity-50">
            <i class="fas fa-rocket text-xs"></i>
            {{ sendingNow ? 'جاري الإرسال...' : 'إرسال الآن' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <!-- Activation Toggle -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.activationEnabled ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.activationEnabled = !settings.activationEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.activationEnabled ? 'bg-green-500' : 'bg-gray-300'">
              <i class="fas fa-user-check text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.activationEnabled ? 'bg-green-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.activationEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">رسالة التفعيل</p>
          <p class="text-xs text-gray-500 mt-1">عند تفعيل اشتراك جديد</p>
        </div>

        <!-- Expiry Warning Toggle -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.expiryWarningEnabled ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.expiryWarningEnabled = !settings.expiryWarningEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.expiryWarningEnabled ? 'bg-orange-500' : 'bg-gray-300'">
              <i class="fas fa-clock text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.expiryWarningEnabled ? 'bg-orange-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.expiryWarningEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">تحذير الانتهاء</p>
          <div class="flex items-center gap-1 mt-1">
            <p class="text-xs text-gray-500">قبل</p>
            <input v-model.number="settings.warningDays" type="number" min="1" max="30" @click.stop
              class="w-12 text-xs text-center border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-orange-400" />
            <p class="text-xs text-gray-500">أيام</p>
          </div>
        </div>

        <!-- Expiry Toggle -->
        <div class="p-4 rounded-xl border-2 transition-colors cursor-pointer"
          :class="settings.expiryEnabled ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'"
          @click="settings.expiryEnabled = !settings.expiryEnabled">
          <div class="flex items-center justify-between mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center"
              :class="settings.expiryEnabled ? 'bg-red-500' : 'bg-gray-300'">
              <i class="fas fa-calendar-times text-white text-sm"></i>
            </div>
            <div class="relative">
              <div class="w-12 h-6 rounded-full transition-colors"
                :class="settings.expiryEnabled ? 'bg-red-500' : 'bg-gray-300'">
                <div class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                  :class="settings.expiryEnabled ? 'right-1' : 'left-1'"></div>
              </div>
            </div>
          </div>
          <p class="text-sm font-semibold text-gray-700">إشعار الانتهاء</p>
          <p class="text-xs text-gray-500 mt-1">يوم انتهاء الاشتراك</p>
        </div>
      </div>

      <!-- Template Variables Help -->
      <div class="p-3 bg-gray-50 rounded-xl mb-5 text-xs text-gray-600">
        <p class="font-semibold mb-1.5"><i class="fas fa-code ml-1"></i>المتغيرات المتاحة في القوالب:</p>
        <div class="flex flex-wrap gap-2">
          <code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;name&#125;&#125;</code>
          <span class="text-gray-500">اسم المشترك</span>
          <code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;phone&#125;&#125;</code>
          <span class="text-gray-500">رقم الهاتف</span>
          <code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;endDate&#125;&#125;</code>
          <span class="text-gray-500">تاريخ الانتهاء</span>
          <code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;package&#125;&#125;</code>
          <span class="text-gray-500">اسم الباقة</span>
          <code class="bg-white border border-gray-200 rounded px-2 py-0.5">&#123;&#123;days&#125;&#125;</code>
          <span class="text-gray-500">عدد الأيام المتبقية (للتحذير فقط)</span>
        </div>
      </div>

      <!-- Templates Editors -->
      <div class="space-y-4">
        <!-- Activation Template -->
        <div v-if="settings.activationEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-user-check text-green-500 ml-1"></i>
            قالب رسالة التفعيل
          </label>
          <textarea v-model="settings.activationTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>

        <!-- Warning Template -->
        <div v-if="settings.expiryWarningEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-clock text-orange-500 ml-1"></i>
            قالب رسالة تحذير الانتهاء
          </label>
          <textarea v-model="settings.expiryWarningTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>

        <!-- Expiry Template -->
        <div v-if="settings.expiryEnabled">
          <label class="block text-sm font-semibold text-gray-700 mb-1.5">
            <i class="fas fa-calendar-times text-red-500 ml-1"></i>
            قالب رسالة انتهاء الاشتراك
          </label>
          <textarea v-model="settings.expiryTemplate" rows="4"
            class="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none font-mono"
            dir="rtl"></textarea>
        </div>
      </div>
    </div>

    <!-- Expiring Subscribers Table -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-calendar-alt text-gray-400"></i>
          المشتركون المقبلون على الانتهاء
          <span class="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">
            خلال {{ expiryDays }} أيام
          </span>
        </h2>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-600">عرض خلال:</label>
          <select v-model.number="expiryDays" @change="loadExpiring"
            class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option :value="3">3 أيام</option>
            <option :value="7">7 أيام</option>
            <option :value="14">14 يوم</option>
            <option :value="30">30 يوم</option>
          </select>
          <button @click="loadExpiring" class="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            <i class="fas fa-sync text-xs"></i>
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-right">
              <th class="px-4 py-3 font-semibold">#</th>
              <th class="px-4 py-3 font-semibold">المشترك</th>
              <th class="px-4 py-3 font-semibold">رقم الهاتف</th>
              <th class="px-4 py-3 font-semibold">الباقة</th>
              <th class="px-4 py-3 font-semibold">تاريخ الانتهاء</th>
              <th class="px-4 py-3 font-semibold text-center">الأيام المتبقية</th>
              <th class="px-4 py-3 font-semibold text-center">إرسال رسالة</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="expiring.length === 0">
              <td colspan="7" class="px-4 py-10 text-center text-gray-400">
                <i class="fas fa-check-circle text-4xl mb-2 text-green-300 block"></i>
                لا يوجد مشتركون مقبلون على الانتهاء خلال هذه الفترة
              </td>
            </tr>
            <tr v-for="(item, i) in expiring" :key="item.id"
              class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-500">{{ i + 1 }}</td>
              <td class="px-4 py-3 font-medium text-gray-800">{{ item.subscriberName }}</td>
              <td class="px-4 py-3 text-gray-600 font-mono" dir="ltr">{{ item.subscriberPhone }}</td>
              <td class="px-4 py-3">
                <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {{ item.package }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(item.endDate) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold"
                  :class="item.daysLeft <= 1 ? 'bg-red-100 text-red-600' : item.daysLeft <= 3 ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'">
                  {{ item.daysLeft === 0 ? 'اليوم' : item.daysLeft + ' يوم' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button v-if="item.subscriberPhone" @click="quickSend(item)"
                  :disabled="!status.connected || sendingTo === item.id"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  :class="status.connected ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'">
                  <i class="fab fa-whatsapp ml-1"></i>
                  {{ sendingTo === item.id ? 'جاري...' : 'إرسال' }}
                </button>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Message Log -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <h2 class="text-base font-bold text-gray-700 flex items-center gap-2">
          <i class="fas fa-history text-gray-400"></i>
          سجل رسائل واتساب
        </h2>
        <button @click="loadLogs" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm transition-colors">
          <i class="fas fa-sync text-xs" :class="loadingLogs ? 'animate-spin' : ''"></i>
          تحديث
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-right">
              <th class="px-4 py-3 font-semibold">التاريخ والوقت</th>
              <th class="px-4 py-3 font-semibold">النوع</th>
              <th class="px-4 py-3 font-semibold">المشترك</th>
              <th class="px-4 py-3 font-semibold">رقم الهاتف</th>
              <th class="px-4 py-3 font-semibold text-center">الحالة</th>
              <th class="px-4 py-3 font-semibold">الخطأ</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="logs.length === 0">
              <td colspan="6" class="px-4 py-10 text-center text-gray-400">
                <i class="fas fa-inbox text-4xl mb-2 text-gray-200 block"></i>
                لا توجد رسائل مسجلة بعد
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap" dir="ltr">
                {{ new Date(log.createdAt).toLocaleString('ar-IQ') }}
              </td>
              <td class="px-4 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-700': log.type === 'activation',
                    'bg-orange-100 text-orange-700': log.type === 'expiry_warning',
                    'bg-red-100 text-red-700': log.type === 'expiry',
                    'bg-blue-100 text-blue-700': log.type === 'manual',
                  }">
                  {{ logTypeLabel(log.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-gray-800 font-medium">{{ log.subscriberName || '—' }}</td>
              <td class="px-4 py-3 text-gray-600 font-mono" dir="ltr">{{ log.phone }}</td>
              <td class="px-4 py-3 text-center">
                <span v-if="log.success" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <i class="fas fa-check-circle text-xs"></i> نجح
                </span>
                <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                  <i class="fas fa-times-circle text-xs"></i> فشل
                </span>
              </td>
              <td class="px-4 py-3 text-xs text-red-500 max-w-xs truncate" :title="log.errorMessage ?? ''">
                {{ log.errorMessage || '' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <!-- Page navigation -->
        <div class="flex items-center gap-1" dir="ltr">
          <button @click="goToLogPage(1)" :disabled="logPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors"
            :class="logPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            «
          </button>
          <button @click="goToLogPage(logPage - 1)" :disabled="logPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors"
            :class="logPage === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            ‹
          </button>
          <button v-for="p in logVisiblePages" :key="p" @click="goToLogPage(p)"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors"
            :class="p === logPage ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            {{ p }}
          </button>
          <button @click="goToLogPage(logPage + 1)" :disabled="logPage === logTotalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors"
            :class="logPage === logTotalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            ›
          </button>
          <button @click="goToLogPage(logTotalPages)" :disabled="logPage === logTotalPages"
            class="w-8 h-8 flex items-center justify-center rounded-lg border text-xs transition-colors"
            :class="logPage === logTotalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            »
          </button>
        </div>
        <!-- Page size -->
        <div class="flex items-center gap-1" dir="ltr">
          <button v-for="size in logPageSizes" :key="size" @click="changeLogPageSize(size)"
            class="min-w-[36px] h-8 px-2 flex items-center justify-center rounded-lg border text-xs font-medium transition-colors"
            :class="size === logPageSize ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200 hover:bg-gray-100 text-gray-600'">
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Test Message Modal -->
    <Transition name="modal">
      <div v-if="showTestModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" @click.stop>
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i class="fab fa-whatsapp text-green-500"></i>
              إرسال رسالة تجريبية
            </h3>
            <button @click="showTestModal = false" class="text-gray-400 hover:text-gray-600 transition-colors">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">رقم الهاتف</label>
              <input v-model="testPhone" type="text" placeholder="07701234567"
                class="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-300"
                dir="ltr" />
              <p class="text-xs text-gray-500 mt-1">أدخل الرقم بالصيغة العراقية: 07XXXXXXXXX</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-1.5">نص الرسالة</label>
              <textarea v-model="testMessage" rows="4" placeholder="اكتب رسالتك هنا..."
                class="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-300 resize-none"
                dir="rtl"></textarea>
            </div>
          </div>
          <div class="flex gap-3 mt-5">
            <button @click="sendTestMessage" :disabled="!testPhone || !testMessage || sendingTest"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium text-sm transition-colors disabled:opacity-50">
              <i class="fab fa-whatsapp"></i>
              {{ sendingTest ? 'جاري الإرسال...' : 'إرسال' }}
            </button>
            <button @click="showTestModal = false"
              class="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import api from '../../api';

// ─── State ───────────────────────────────────────────────────────────────────
const loading = ref(false);
const actionLoading = ref(false);
const savingSettings = ref(false);
const sendingNow = ref(false);
const sendingTest = ref(false);
const showTestModal = ref(false);
const testPhone = ref('');
const testMessage = ref('مرحباً، هذه رسالة تجريبية من نظام إدارة الاشتراكات 👋');
const sendingTo = ref<number | null>(null);
const expiryDays = ref(7);
const logs = ref<any[]>([]);
const loadingLogs = ref(false);
const logPage = ref(1);
const logPageSize = ref(10);
const logTotal = ref(0);
const logTotalPages = computed(() => Math.max(1, Math.ceil(logTotal.value / logPageSize.value)));
const logPageSizes = [5, 10, 50, 100, 500];
const logVisiblePages = computed(() => {
  const total = logTotalPages.value;
  const cur = logPage.value;
  const pages: number[] = [];
  const start = Math.max(1, cur - 2);
  const end = Math.min(total, cur + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const status = reactive({
  connected: false,
  initializing: false,
  phone: null as string | null,
  hasQR: false,
  qr: null as string | null,
});

const settings = reactive({
  activationEnabled: false,
  expiryWarningEnabled: false,
  expiryEnabled: false,
  warningDays: 3,
  activationTemplate: '',
  expiryWarningTemplate: '',
  expiryTemplate: '',
});

const expiring = ref<any[]>([]);

const toast = reactive({ show: false, message: '', type: 'success' as 'success' | 'error' });
let toastTimer: ReturnType<typeof setTimeout> | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message;
  toast.type = type;
  toast.show = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.show = false), 3500);
}

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-IQ');
}

// ─── API Calls ────────────────────────────────────────────────────────────────
async function loadStatus() {
  try {
    const { data } = await api.get('/whatsapp/status');
    Object.assign(status, data);
  } catch (_) {
    // ignore
  }
}

async function loadSettings() {
  try {
    const { data } = await api.get('/whatsapp/settings');
    Object.assign(settings, data);
  } catch (_) {
    // ignore
  }
}

async function loadExpiring() {
  try {
    const { data } = await api.get(`/whatsapp/expiring?days=${expiryDays.value}`);
    expiring.value = data;
  } catch (_) {
    // ignore
  }
}

async function loadLogs() {
  loadingLogs.value = true;
  try {
    const { data } = await api.get(`/whatsapp/logs?page=${logPage.value}&limit=${logPageSize.value}`);
    logs.value = data.data;
    logTotal.value = data.total;
  } catch (_) {
    // ignore
  } finally {
    loadingLogs.value = false;
  }
}

function goToLogPage(page: number) {
  if (page < 1 || page > logTotalPages.value) return;
  logPage.value = page;
  loadLogs();
}

function changeLogPageSize(size: number) {
  logPageSize.value = size;
  logPage.value = 1;
  loadLogs();
}

async function refresh() {
  loading.value = true;
  await Promise.all([loadStatus(), loadSettings(), loadExpiring(), loadLogs()]);
  loading.value = false;
}

async function connect() {
  actionLoading.value = true;
  try {
    await api.post('/whatsapp/connect');
    showToast('جاري تهيئة الاتصال...', 'success');
    // Start polling for QR
    setTimeout(loadStatus, 2000);
  } catch (_) {
    showToast('حدث خطأ أثناء الاتصال', 'error');
  } finally {
    actionLoading.value = false;
  }
}

async function disconnect() {
  if (!confirm('هل تريد قطع اتصال واتساب؟')) return;
  actionLoading.value = true;
  try {
    await api.post('/whatsapp/disconnect');
    Object.assign(status, { connected: false, phone: null, hasQR: false, qr: null });
    showToast('تم قطع الاتصال', 'success');
  } catch (_) {
    showToast('حدث خطأ', 'error');
  } finally {
    actionLoading.value = false;
  }
}

async function saveSettings() {
  savingSettings.value = true;
  try {
    const { activationEnabled, expiryWarningEnabled, expiryEnabled, warningDays,
            activationTemplate, expiryWarningTemplate, expiryTemplate } = settings;
    await api.patch('/whatsapp/settings', {
      activationEnabled, expiryWarningEnabled, expiryEnabled, warningDays,
      activationTemplate, expiryWarningTemplate, expiryTemplate,
    });
    showToast('تم حفظ الإعدادات بنجاح ✅', 'success');
  } catch (_) {
    showToast('حدث خطأ أثناء الحفظ', 'error');
  } finally {
    savingSettings.value = false;
  }
}

async function sendNow() {
  if (!confirm('هل تريد إرسال الإشعارات الآن لجميع المشتركين المستحقين؟')) return;
  sendingNow.value = true;
  try {
    const { data } = await api.post('/whatsapp/send-now');
    showToast(`تم الإرسال: ${data.sent} نجح، ${data.failed} فشل`, data.failed === 0 ? 'success' : 'error');
  } catch (_) {
    showToast('حدث خطأ أثناء الإرسال', 'error');
  } finally {
    sendingNow.value = false;
  }
}

async function sendTestMessage() {
  sendingTest.value = true;
  try {
    const { data } = await api.post('/whatsapp/send-test', {
      phone: testPhone.value,
      message: testMessage.value,
    });
    if (data.success) {
      showToast('تم إرسال الرسالة التجريبية بنجاح ✅', 'success');
      showTestModal.value = false;
    } else {
      showToast(data.message || 'فشل الإرسال', 'error');
    }
  } catch (_) {
    showToast('حدث خطأ أثناء الإرسال', 'error');
  } finally {
    sendingTest.value = false;
  }
}

async function quickSend(item: any) {
  sendingTo.value = item.id;
  try {
    const message = settings.expiryWarningEnabled
      ? settings.expiryWarningTemplate
          .replaceAll('{{name}}', item.subscriberName ?? '')
          .replaceAll('{{phone}}', item.subscriberPhone ?? '')
          .replaceAll('{{endDate}}', formatDate(item.endDate))
          .replaceAll('{{package}}', item.package ?? '')
          .replaceAll('{{days}}', String(item.daysLeft))
      : `عزيزي ${item.subscriberName}، اشتراكك ينتهي خلال ${item.daysLeft} يوم (${formatDate(item.endDate)}). يرجى التجديد.`;

    const { data } = await api.post('/whatsapp/send-test', {
      phone: item.subscriberPhone,
      message,
    });
    showToast(data.success ? `تم الإرسال لـ ${item.subscriberName} ✅` : 'فشل الإرسال', data.success ? 'success' : 'error');
  } catch (_) {
    showToast('حدث خطأ', 'error');
  } finally {
    sendingTo.value = null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const logTypeLabels: Record<string, string> = {
  activation: 'تفعيل',
  expiry_warning: 'تحذير انتهاء',
  expiry: 'انتهاء',
  manual: 'يدوي',
};
function logTypeLabel(type: string): string {
  return logTypeLabels[type] ?? type;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await refresh();
  // Poll status every 5 seconds to detect QR and connection changes
  pollTimer = setInterval(loadStatus, 5000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (toastTimer) clearTimeout(toastTimer);
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
