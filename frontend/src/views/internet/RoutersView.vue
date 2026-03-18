<template>
  <div>
    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg text-sm font-medium"
        :class="toast.online ? 'bg-green-500 text-white' : 'bg-red-500 text-white'">
        <i :class="toast.online ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        <span>{{ toast.name }} — {{ toast.online ? 'الاتصال ناجح ✅' : 'لا يوجد اتصال ❌' }}</span>
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-bold text-secondary">الراوترات</h2>
        <p class="text-xs text-gray-400 mt-0.5">{{ onlineCount }} متصل من أصل {{ routers.length }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="checkAllStatus" :disabled="checkingAll" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-primary border border-gray-200 hover:border-primary rounded-xl transition">
          <i class="fas fa-sync-alt text-xs" :class="{ 'fa-spin': checkingAll }"></i> فحص الحالة
        </button>
        <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
          <i class="fas fa-plus"></i> إضافة راوتر
        </button>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="r in routers" :key="r.id"
        class="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
        :class="statusOf(r.id) === 'online' ? 'border-green-100' : statusOf(r.id) === 'offline' ? 'border-red-100' : 'border-gray-100'"
        @click="openDetails(r)">

        <!-- Card Header -->
        <div class="p-5 pb-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl flex items-center justify-center"
                :class="statusOf(r.id) === 'online' ? 'bg-green-50' : statusOf(r.id) === 'offline' ? 'bg-red-50' : 'bg-gray-50'">
                <i class="fas fa-server text-lg"
                  :class="statusOf(r.id) === 'online' ? 'text-green-500' : statusOf(r.id) === 'offline' ? 'text-red-400' : 'text-gray-400'"></i>
              </div>
              <div>
                <h3 class="font-bold text-secondary text-sm">{{ r.name }}</h3>
                <p class="text-xs text-gray-400 mt-0.5 font-mono">{{ r.ipAddress }}:{{ r.port }}</p>
              </div>
            </div>
            <!-- Status Badge -->
            <div class="flex flex-col items-end gap-1">
              <span v-if="statusOf(r.id) === 'checking'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                <i class="fas fa-circle-notch fa-spin text-[9px]"></i> جاري الفحص
              </span>
              <span v-else-if="statusOf(r.id) === 'online'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> متصل
              </span>
              <span v-else-if="statusOf(r.id) === 'offline'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600 font-medium">
                <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> غير متصل
              </span>
              <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-400">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span> غير معروف
              </span>
              <span class="text-[10px] text-gray-400">{{ r.connectionType || 'API' }}</span>
            </div>
          </div>

          <!-- Location / Description -->
          <div v-if="r.location || r.description" class="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <i class="fas fa-map-marker-alt text-[10px]"></i>
            <span>{{ r.location || r.description }}</span>
          </div>
        </div>

        <!-- Live Stats (online only) -->
        <div v-if="statusOf(r.id) === 'online' && statusDataOf(r.id)" class="px-5 pb-3 space-y-2">
          <div class="flex items-center gap-2 text-xs">
            <span class="text-gray-400 w-8">CPU</span>
            <div class="flex-1 bg-gray-100 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all"
                :class="statusDataOf(r.id).cpu > 80 ? 'bg-red-400' : statusDataOf(r.id).cpu > 50 ? 'bg-yellow-400' : 'bg-green-400'"
                :style="`width:${statusDataOf(r.id).cpu}%`"></div>
            </div>
            <span class="text-gray-500 w-8 text-right">{{ statusDataOf(r.id).cpu }}%</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-gray-400 w-8">RAM</span>
            <div class="flex-1 bg-gray-100 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all"
                :class="ramPct(r.id) > 80 ? 'bg-red-400' : ramPct(r.id) > 50 ? 'bg-yellow-400' : 'bg-blue-400'"
                :style="`width:${ramPct(r.id)}%`"></div>
            </div>
            <span class="text-gray-500 w-8 text-right">{{ ramPct(r.id) }}%</span>
          </div>
          <div class="flex items-center justify-between text-xs text-gray-400 pt-1">
            <span><i class="fas fa-clock text-[10px] mr-0.5"></i> {{ statusDataOf(r.id).uptime }}</span>
            <span><i class="fas fa-microchip text-[10px] mr-0.5"></i> {{ statusDataOf(r.id).version }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="px-5 py-3 border-t border-gray-50 flex gap-1" @click.stop>
          <button @click="openDetails(r)"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-internet hover:bg-internet/5 rounded-lg transition font-medium">
            <i class="fas fa-chart-line text-[10px]"></i> تفاصيل
          </button>
          <button @click="pingRouter(r)"
            :disabled="pingingId === r.id"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-500 hover:bg-blue-50 rounded-lg transition">
            <i class="fas fa-wifi text-[10px]" :class="{ 'fa-spin': pingingId === r.id }"></i> اختبار
          </button>
          <button @click="openEdit(r)"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-primary hover:bg-primary/5 rounded-lg transition">
            <i class="fas fa-pen text-[10px]"></i> تعديل
          </button>
          <button @click="remove(r.id)"
            class="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-danger hover:bg-danger/5 rounded-lg transition">
            <i class="fas fa-trash text-[10px]"></i> حذف
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!routers.length" class="col-span-full text-center py-16 text-gray-400">
        <i class="fas fa-server text-4xl mb-3 block opacity-20"></i>
        <p class="text-sm">لا توجد راوترات مضافة بعد</p>
      </div>
    </div>

    <!-- ═══════════ DETAILS MODAL ═══════════ -->
    <div v-if="showDetails" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" @click.self="showDetails = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">

        <!-- Details Header -->
        <div class="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center"
              :class="statusOf(detailRouter?.id) === 'online' ? 'bg-green-50' : 'bg-red-50'">
              <i class="fas fa-server" :class="statusOf(detailRouter?.id) === 'online' ? 'text-green-500' : 'text-red-400'"></i>
            </div>
            <div>
              <h3 class="font-bold text-secondary">{{ detailRouter?.name }}</h3>
              <p class="text-xs text-gray-400 font-mono">{{ detailRouter?.ipAddress }}:{{ detailRouter?.port }}</p>
            </div>
            <span v-if="statusOf(detailRouter?.id) === 'online'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> متصل
            </span>
            <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">
              <span class="w-1.5 h-1.5 rounded-full bg-red-400"></span> غير متصل
            </span>
          </div>
          <button @click="showDetails = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-100 flex-shrink-0">
          <div class="flex px-5 gap-1">
            <button v-for="tab in detailTabs" :key="tab.key" @click="activeTab = tab.key"
              class="px-4 py-3 text-sm font-medium border-b-2 transition"
              :class="activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'">
              <i :class="tab.icon" class="mr-1.5 text-xs"></i>{{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-5">

          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'">
            <div v-if="detailLoading" class="flex items-center justify-center py-12 text-gray-400">
              <i class="fas fa-circle-notch fa-spin text-2xl mr-3"></i> جاري التحميل...
            </div>
            <div v-else-if="!detailStatus" class="text-center py-12 text-gray-400">
              <i class="fas fa-exclamation-circle text-3xl mb-2 block text-red-300"></i>
              تعذر الاتصال بالراوتر
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">الهوية</p>
                <p class="font-bold text-secondary text-sm">{{ detailStatus.identity }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">الإصدار</p>
                <p class="font-bold text-secondary text-sm">{{ detailStatus.version }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">وقت التشغيل</p>
                <p class="font-bold text-secondary text-sm">{{ detailStatus.uptime }}</p>
              </div>
              <div class="bg-gray-50 rounded-xl p-4 text-center">
                <p class="text-xs text-gray-400 mb-1">النموذج</p>
                <p class="font-bold text-secondary text-sm truncate">{{ detailStatus.boardName }}</p>
              </div>

              <!-- CPU & RAM -->
              <div class="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-3 font-medium">المعالج (CPU)</p>
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-100 rounded-full h-3">
                    <div class="h-3 rounded-full transition-all"
                      :class="detailStatus.cpu > 80 ? 'bg-red-400' : detailStatus.cpu > 50 ? 'bg-yellow-400' : 'bg-green-400'"
                      :style="`width:${detailStatus.cpu}%`"></div>
                  </div>
                  <span class="font-bold text-lg w-12 text-right"
                    :class="detailStatus.cpu > 80 ? 'text-red-500' : detailStatus.cpu > 50 ? 'text-yellow-500' : 'text-green-600'">
                    {{ detailStatus.cpu }}%
                  </span>
                </div>
              </div>

              <div class="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-3 font-medium">الذاكرة (RAM)</p>
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-3">
                    <div class="h-3 rounded-full bg-blue-400 transition-all"
                      :style="`width:${Math.round((detailStatus.totalMemory - detailStatus.freeMemory) / detailStatus.totalMemory * 100)}%`"></div>
                  </div>
                  <span class="font-bold text-lg w-12 text-right text-blue-600">
                    {{ Math.round((detailStatus.totalMemory - detailStatus.freeMemory) / detailStatus.totalMemory * 100) }}%
                  </span>
                </div>
                <p class="text-xs text-gray-400">
                  {{ formatBytes(detailStatus.totalMemory - detailStatus.freeMemory) }} مستخدم من
                  {{ formatBytes(detailStatus.totalMemory) }}
                </p>
              </div>

              <!-- HDD -->
              <div class="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-3 font-medium">التخزين (HDD/Flash)</p>
                <div class="flex items-center gap-3 mb-2">
                  <div class="flex-1 bg-gray-100 rounded-full h-3">
                    <div class="h-3 rounded-full bg-purple-400 transition-all"
                      :style="`width:${Math.round((detailStatus.totalHdd - detailStatus.freeHdd) / detailStatus.totalHdd * 100)}%`"></div>
                  </div>
                  <span class="font-bold text-lg w-12 text-right text-purple-600">
                    {{ Math.round((detailStatus.totalHdd - detailStatus.freeHdd) / detailStatus.totalHdd * 100) }}%
                  </span>
                </div>
                <p class="text-xs text-gray-400">
                  {{ formatBytes(detailStatus.totalHdd - detailStatus.freeHdd) }} مستخدم من
                  {{ formatBytes(detailStatus.totalHdd) }}
                </p>
              </div>

              <div class="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
                <p class="text-xs text-gray-500 mb-2 font-medium">معلومات إضافية</p>
                <div class="space-y-1.5 text-xs text-gray-600">
                  <div class="flex justify-between"><span class="text-gray-400">الرقم التسلسلي</span><span class="font-mono">{{ detailStatus.serialNumber || '—' }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-400">عنوان IP</span><span class="font-mono">{{ detailRouter?.ipAddress }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-400">الموقع</span><span>{{ detailRouter?.location || '—' }}</span></div>
                  <div class="flex justify-between"><span class="text-gray-400">نوع الاتصال</span><span>{{ detailRouter?.connectionType || 'API' }}</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Interfaces Tab -->
          <div v-if="activeTab === 'interfaces'">
            <div v-if="detailLoading" class="text-center py-12 text-gray-400">
              <i class="fas fa-circle-notch fa-spin text-2xl"></i>
            </div>
            <div v-else-if="!detailInterfaces.length" class="text-center py-12 text-gray-400">لا توجد واجهات</div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-xs text-gray-500">
                    <th class="px-4 py-2.5 text-right font-medium rounded-r-lg">الاسم</th>
                    <th class="px-4 py-2.5 text-right font-medium">النوع</th>
                    <th class="px-4 py-2.5 text-right font-medium">MAC</th>
                    <th class="px-4 py-2.5 text-center font-medium">الحالة</th>
                    <th class="px-4 py-2.5 text-right font-medium">سرعة الإرسال</th>
                    <th class="px-4 py-2.5 text-right font-medium rounded-l-lg">سرعة الاستقبال</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="iface in detailInterfaces" :key="iface.name" class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 font-medium text-secondary">{{ iface.name }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ iface.type }}</td>
                    <td class="px-4 py-3 text-gray-400 font-mono text-xs">{{ iface.macAddress || '—' }}</td>
                    <td class="px-4 py-3 text-center">
                      <span v-if="!iface.disabled && iface.running" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> يعمل
                      </span>
                      <span v-else-if="iface.disabled" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span> متوقف
                      </span>
                      <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-600">
                        <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> غير نشط
                      </span>
                    </td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ formatBps(iface.txBps) }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ formatBps(iface.rxBps) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Active Connections Tab -->
          <div v-if="activeTab === 'connections'">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm text-gray-500">جلسات PPPoE النشطة: <span class="font-bold text-secondary">{{ detailConnections.length }}</span></p>
              <button @click="loadDetailTab('connections')" class="text-xs text-primary hover:underline flex items-center gap-1">
                <i class="fas fa-sync-alt text-[10px]"></i> تحديث
              </button>
            </div>
            <div v-if="detailLoading" class="text-center py-12 text-gray-400">
              <i class="fas fa-circle-notch fa-spin text-2xl"></i>
            </div>
            <div v-else-if="!detailConnections.length" class="text-center py-12 text-gray-400">لا توجد اتصالات نشطة</div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-xs text-gray-500">
                    <th class="px-4 py-2.5 text-right font-medium rounded-r-lg">المستخدم</th>
                    <th class="px-4 py-2.5 text-right font-medium">الخدمة</th>
                    <th class="px-4 py-2.5 text-right font-medium">عنوان IP</th>
                    <th class="px-4 py-2.5 text-right font-medium">مدة الاتصال</th>
                    <th class="px-4 py-2.5 text-right font-medium">رُفع</th>
                    <th class="px-4 py-2.5 text-right font-medium rounded-l-lg">نُزِّل</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="conn in detailConnections" :key="conn.name" class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 font-medium text-secondary">{{ conn.name }}</td>
                    <td class="px-4 py-3 text-gray-500">{{ conn.service || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ conn.address || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ conn.uptime || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ formatBytes(conn.bytesOut) }}</td>
                    <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ formatBytes(conn.bytesIn) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- IP Addresses Tab -->
          <div v-if="activeTab === 'ipaddresses'">
            <div v-if="detailLoading" class="text-center py-12 text-gray-400">
              <i class="fas fa-circle-notch fa-spin text-2xl"></i>
            </div>
            <div v-else-if="!detailIpAddresses.length" class="text-center py-12 text-gray-400">لا توجد عناوين IP</div>
            <div v-else class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-gray-50 text-xs text-gray-500">
                    <th class="px-4 py-2.5 text-right font-medium rounded-r-lg">العنوان</th>
                    <th class="px-4 py-2.5 text-right font-medium">الشبكة</th>
                    <th class="px-4 py-2.5 text-right font-medium">الواجهة</th>
                    <th class="px-4 py-2.5 text-center font-medium rounded-l-lg">الحالة</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr v-for="ip in detailIpAddresses" :key="ip.address" class="hover:bg-gray-50/50">
                    <td class="px-4 py-3 font-mono text-sm text-secondary font-medium">{{ ip.address }}</td>
                    <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ ip.network || '—' }}</td>
                    <td class="px-4 py-3 text-gray-600">{{ ip.interface }}</td>
                    <td class="px-4 py-3 text-center">
                      <span v-if="!ip.disabled" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">نشط</span>
                      <span v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">متوقف</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════ ADD/EDIT MODAL ═══════════ -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-lg text-secondary">{{ editingId ? 'تعديل راوتر' : 'إضافة راوتر جديد' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">اسم الراوتر <span class="text-danger">*</span></label>
              <input v-model="form.name" placeholder="مثال: MikroTik-Main" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">عنوان IP <span class="text-danger">*</span></label>
              <input v-model="form.ipAddress" placeholder="192.168.1.1" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">المنفذ</label>
              <input v-model="form.port" type="number" placeholder="8728" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">اسم المستخدم</label>
              <input v-model="form.username" placeholder="admin" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">كلمة المرور</label>
              <input v-model="form.password" type="password" placeholder="••••••••" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">الموقع</label>
              <input v-model="form.location" placeholder="مثال: مركز البيانات" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">نوع الاتصال</label>
              <select v-model="form.connectionType" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                <option value="API">API (8728)</option>
                <option value="API-SSL">API-SSL (8729)</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 mb-1">وصف</label>
              <input v-model="form.description" placeholder="وصف اختياري..." class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button @click="showModal = false" class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">إلغاء</button>
          <button @click="save" :disabled="saving" class="px-6 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg font-medium transition flex items-center gap-2">
            <i v-if="saving" class="fas fa-circle-notch fa-spin text-xs"></i> حفظ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '../../api';

// ── Types ─────────────────────────────────────────────────────────
interface RouterStatus {
  identity: string;
  version: string;
  uptime: string;
  boardName: string;
  serialNumber: string;
  cpu: number;
  freeMemory: number;
  totalMemory: number;
  freeHdd: number;
  totalHdd: number;
  online: boolean;
}

interface RouterIface {
  name: string;
  type: string;
  macAddress: string;
  running: boolean;
  disabled: boolean;
  txBps: number;
  rxBps: number;
}

interface ActiveConn {
  name: string;
  service: string;
  address: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
}

// ── State ─────────────────────────────────────────────────────────
const routers = ref<any[]>([]);
const statuses = ref<Record<number, 'checking' | 'online' | 'offline' | 'unknown'>>({});
const statusData = ref<Record<number, RouterStatus>>({});
const checkingAll = ref(false);
const pingingId = ref<number | null>(null);
const saving = ref(false);

// Toast notification
const toast = ref<{ show: boolean; online: boolean; name: string }>({ show: false, online: false, name: '' });
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(name: string, online: boolean) {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, online, name };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
}

// Add/Edit modal
const showModal = ref(false);
const editingId = ref<number | null>(null);
const form = ref({
  name: '', ipAddress: '', port: 8728, username: '', password: '',
  location: '', description: '', connectionType: 'API'
});

// Details modal
const showDetails = ref(false);
const detailRouter = ref<any>(null);
const activeTab = ref('overview');
const detailLoading = ref(false);
const detailStatus = ref<RouterStatus | null>(null);
const detailInterfaces = ref<RouterIface[]>([]);
const detailConnections = ref<ActiveConn[]>([]);
const detailIpAddresses = ref<any[]>([]);

const detailTabs = [
  { key: 'overview', label: 'نظرة عامة', icon: 'fas fa-tachometer-alt' },
  { key: 'interfaces', label: 'الواجهات', icon: 'fas fa-ethernet' },
  { key: 'connections', label: 'الاتصالات النشطة', icon: 'fas fa-users' },
  { key: 'ipaddresses', label: 'عناوين IP', icon: 'fas fa-network-wired' },
];

// ── Computed ──────────────────────────────────────────────────────
const onlineCount = computed(() => Object.values(statuses.value).filter(s => s === 'online').length);

function statusOf(id: number | undefined): string {
  if (id == null) return 'unknown';
  return statuses.value[id] || 'unknown';
}

function statusDataOf(id: number): RouterStatus | null {
  return statusData.value[id] || null;
}

function ramPct(id: number): number {
  const d = statusData.value[id];
  if (!d || !d.totalMemory) return 0;
  return Math.round((d.totalMemory - d.freeMemory) / d.totalMemory * 100);
}

// ── Helpers ───────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  if (bytes > 1024 ** 3) return (bytes / 1024 ** 3).toFixed(1) + ' GB';
  if (bytes > 1024 ** 2) return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function formatBps(bps: number): string {
  if (!bps) return '0 bps';
  if (bps > 1024 ** 2) return (bps / 1024 ** 2).toFixed(1) + ' Mbps';
  if (bps > 1024) return (bps / 1024).toFixed(0) + ' Kbps';
  return bps + ' bps';
}

// ── Data Loading ──────────────────────────────────────────────────
async function loadData() {
  try {
    const { data } = await api.get('/routers');
    routers.value = data;
  } catch {}
}

async function checkStatus(router: any) {
  statuses.value[router.id] = 'checking';
  try {
    const { data } = await api.get(`/routers/${router.id}/status`);
    if (data?.online === false || !data?.identity) {
      statuses.value[router.id] = 'offline';
    } else {
      statuses.value[router.id] = 'online';
      statusData.value[router.id] = data;
    }
  } catch {
    statuses.value[router.id] = 'offline';
  }
}

async function checkAllStatus() {
  checkingAll.value = true;
  await Promise.all(routers.value.map(r => checkStatus(r)));
  checkingAll.value = false;
}

async function pingRouter(r: any) {
  pingingId.value = r.id;
  try {
    const { data } = await api.post(`/routers/${r.id}/ping`);
    statuses.value[r.id] = data.online ? 'online' : 'offline';
    if (data.online) await checkStatus(r);
    showToast(r.name, data.online);
  } catch {
    statuses.value[r.id] = 'offline';
    showToast(r.name, false);
  } finally {
    pingingId.value = null;
  }
}

// ── Details Modal ─────────────────────────────────────────────────
async function openDetails(r: any) {
  detailRouter.value = r;
  activeTab.value = 'overview';
  detailStatus.value = null;
  detailInterfaces.value = [];
  detailConnections.value = [];
  detailIpAddresses.value = [];
  showDetails.value = true;
  await loadDetailTab('overview');
}

async function loadDetailTab(tab: string) {
  if (!detailRouter.value) return;
  detailLoading.value = true;
  const id = detailRouter.value.id;
  try {
    if (tab === 'overview') {
      const { data } = await api.get(`/routers/${id}/status`);
      detailStatus.value = (data?.online !== false && data?.identity) ? data : null;
      if (detailStatus.value) {
        statuses.value[id] = 'online';
        statusData.value[id] = detailStatus.value;
      } else {
        statuses.value[id] = 'offline';
      }
    } else if (tab === 'interfaces') {
      const { data } = await api.get(`/routers/${id}/interfaces`);
      detailInterfaces.value = Array.isArray(data) ? data : [];
    } else if (tab === 'connections') {
      const { data } = await api.get(`/routers/${id}/active-connections`);
      detailConnections.value = Array.isArray(data) ? data : [];
    } else if (tab === 'ipaddresses') {
      const { data } = await api.get(`/routers/${id}/ip-addresses`);
      detailIpAddresses.value = Array.isArray(data) ? data : [];
    }
  } catch {
    if (tab === 'overview') detailStatus.value = null;
  } finally {
    detailLoading.value = false;
  }
}

watch(activeTab, (tab) => {
  loadDetailTab(tab);
});

// ── CRUD ──────────────────────────────────────────────────────────
function openAdd() {
  editingId.value = null;
  form.value = { name: '', ipAddress: '', port: 8728, username: '', password: '', location: '', description: '', connectionType: 'API' };
  showModal.value = true;
}

function openEdit(r: any) {
  editingId.value = r.id;
  form.value = {
    name: r.name, ipAddress: r.ipAddress, port: r.port || 8728,
    username: r.username || '', password: '',
    location: r.location || '', description: r.description || '',
    connectionType: r.connectionType || 'API'
  };
  showModal.value = true;
}

async function save() {
  saving.value = true;
  try {
    const payload: any = { ...form.value, port: Number(form.value.port) };
    if (!payload.password) delete payload.password;
    if (editingId.value) {
      await api.patch(`/routers/${editingId.value}`, payload);
    } else {
      await api.post('/routers', payload);
    }
    showModal.value = false;
    await loadData();
    await checkAllStatus();
  } catch {} finally {
    saving.value = false;
  }
}

async function remove(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذا الراوتر؟')) return;
  try {
    await api.delete(`/routers/${id}`);
    delete statuses.value[id];
    delete statusData.value[id];
    await loadData();
  } catch {}
}

onMounted(async () => {
  await loadData();
  checkAllStatus();
});
</script>

<style scoped>
.toast-enter-active { transition: all 0.3s ease; }
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-16px); }
</style>
