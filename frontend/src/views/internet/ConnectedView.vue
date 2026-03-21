<template>
  <div class="flex flex-col h-full" dir="rtl">

    <!-- ── Status Legend Bar ── -->
    <div class="flex items-center justify-between px-5 py-2 bg-gray-800 text-xs text-white flex-wrap gap-2 select-none">
      <div class="flex items-center gap-5">
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-green-500 inline-block"></span> متصل الصلاحية
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-red-500 inline-block"></span> معطل
        </span>
        <span class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-sm bg-gray-400 inline-block"></span> متصل غير معروف
        </span>
      </div>
      <span class="text-gray-300">
        <i class="fas fa-users ml-1"></i>
        المشتركون المتصلون
        <strong class="text-white mx-1">{{ filteredConnections.length }}</strong>
        أعلى على
        <strong class="text-white mx-1">{{ connections.length }}</strong>
        قيد
      </span>
    </div>

    <!-- ── Toolbar ── -->
    <div class="flex items-center gap-1 px-3 py-2 bg-gray-700 border-b border-gray-600">
      <!-- Disconnect selected -->
      <button @click="disconnectSelected" :disabled="!selectedIds.size || disconnecting"
        title="قطع اتصال المحدد"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600 disabled:opacity-30 transition">
        <i class="fas fa-user-slash text-xs"></i>
      </button>
      <div class="w-px h-5 bg-gray-600 mx-1"></div>
      <!-- Filter toggle -->
      <button @click="showFilter = !showFilter" :title="showFilter ? 'إخفاء التصفية' : 'تصفية'"
        :class="showFilter ? 'text-blue-300 bg-gray-600' : 'text-white/70'"
        class="w-8 h-8 rounded flex items-center justify-center hover:text-white hover:bg-gray-600 transition">
        <i class="fas fa-filter text-xs"></i>
      </button>
      <!-- Export CSV -->
      <button @click="exportCSV" title="تصدير CSV"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-gray-600 transition">
        <i class="fas fa-file-export text-xs"></i>
      </button>
      <!-- Refresh -->
      <button @click="loadConnections" :disabled="loading" title="تحديث"
        class="w-8 h-8 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-gray-600 disabled:opacity-50 transition">
        <i class="fas fa-sync-alt text-xs" :class="loading ? 'fa-spin' : ''"></i>
      </button>
      <!-- Auto-refresh indicator -->
      <div class="mr-auto flex items-center gap-2 text-xs text-gray-400">
        <template v-if="autoRefresh">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>
          تحديث تلقائي كل 30 ث
        </template>
        <button @click="autoRefresh = !autoRefresh"
          class="px-2 py-0.5 rounded border border-gray-600 hover:border-gray-400 transition text-gray-400 hover:text-white">
          {{ autoRefresh ? 'إيقاف' : 'تحديث تلقائي' }}
        </button>
        <span v-if="lastFetch" class="text-gray-500">آخر تحديث: {{ lastFetch }}</span>
      </div>
    </div>

    <!-- ── Filter Row ── -->
    <Transition name="slide-down">
      <div v-if="showFilter" class="flex items-center gap-3 px-5 py-2.5 bg-gray-800 border-b border-gray-700 flex-wrap">
        <select v-model="filterRouter"
          class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">كل الراوترات</option>
          <option v-for="r in routers" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select v-model="filterStatus"
          class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
          <option value="">كل الحالات</option>
          <option value="active">متصل الصلاحية</option>
          <option value="disabled">معطل</option>
          <option value="unknown">متصل غير معروف</option>
        </select>
        <div class="relative">
          <i class="fas fa-search absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]"></i>
          <input v-model="searchTerm" placeholder="بحث باسم المشترك أو اسم الدخول أو IP..."
            class="text-xs border border-gray-600 bg-gray-700 text-white rounded-lg pr-7 pl-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder-gray-500" />
        </div>
        <button @click="filterRouter = ''; filterStatus = ''; searchTerm = ''"
          class="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-700 transition flex items-center gap-1">
          <i class="fas fa-times text-[10px]"></i> مسح التصفية
        </button>
      </div>
    </Transition>

    <!-- ── Main Content ── -->
    <div class="flex-1 overflow-hidden flex flex-col bg-white">

      <!-- Loading state -->
      <div v-if="loading && !connections.length" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fas fa-circle-notch fa-spin text-4xl text-blue-400 mb-3 block"></i>
          <p class="text-sm">جاري جلب المتصلين من الراوترات...</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && !connections.length" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <i class="fas fa-wifi text-5xl opacity-20 mb-3 block"></i>
          <p class="text-sm font-medium">لا يوجد متصلون حالياً</p>
          <p class="text-xs text-gray-400 mt-1">تأكد من أن الراوترات متصلة وتم تهيئتها</p>
          <button @click="loadConnections" class="mt-3 text-xs text-blue-500 hover:text-blue-700 underline">تحديث</button>
        </div>
      </div>

      <!-- Table -->
      <div v-else class="flex-1 overflow-auto">
        <table class="w-full text-xs border-collapse min-w-[900px]">
          <thead class="sticky top-0 z-10">
            <tr class="bg-gray-800 text-white text-right">
              <!-- Checkbox all -->
              <th class="w-8 px-2 py-2.5 text-center">
                <input type="checkbox"
                  :checked="selectedIds.size === pagedConnections.length && pagedConnections.length > 0"
                  :indeterminate="selectedIds.size > 0 && selectedIds.size < pagedConnections.length"
                  @change="toggleAll"
                  class="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              </th>
              <!-- # -->
              <th class="w-10 px-2 py-2.5 text-center text-gray-300">#</th>
              <!-- Status -->
              <th class="w-10 px-2 py-2.5 text-center">
                <span class="text-gray-300">الحالة</span>
              </th>
              <!-- Sortable columns -->
              <th v-for="col in columns" :key="col.key"
                @click="toggleSort(col.key)"
                class="px-3 py-2.5 cursor-pointer hover:bg-gray-700 transition select-none whitespace-nowrap"
                :class="col.center ? 'text-center' : 'text-right'">
                <span class="flex items-center gap-1" :class="col.center ? 'justify-center' : 'justify-start'">
                  {{ col.label }}
                  <span class="text-[9px] opacity-50">
                    <i v-if="sortKey === col.key" :class="sortDir === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'"></i>
                    <i v-else class="fas fa-sort opacity-30"></i>
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(conn, i) in pagedConnections" :key="conn.id + conn.routerId"
              class="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer select-none"
              :class="selectedIds.has(conn.id + '_' + conn.routerId) ? 'bg-blue-50' : ''"
              @contextmenu.prevent="openContextMenu($event, conn)"
              @mousedown="startLongPress($event, conn)"
              @mouseup="cancelLongPress"
              @mouseleave="cancelLongPress">
              <!-- Checkbox -->
              <td class="px-2 py-2 text-center">
                <input type="checkbox"
                  :checked="selectedIds.has(conn.id + '_' + conn.routerId)"
                  @change="toggleSelect(conn)"
                  class="w-3.5 h-3.5 accent-blue-500 cursor-pointer" />
              </td>
              <!-- # -->
              <td class="px-2 py-2 text-center text-gray-400 font-mono">
                {{ (currentPage - 1) * pageSize + i + 1 }}
              </td>
              <!-- Status indicator -->
              <td class="px-2 py-2 text-center">
                <span class="inline-block w-3.5 h-3.5 rounded-sm"
                  :class="statusColor(conn.subscriberStatus)"></span>
              </td>
              <!-- Username -->
              <td class="px-3 py-2 font-mono text-blue-600 font-medium">{{ conn.name }}</td>
              <!-- Full name -->
              <td class="px-3 py-2 font-medium text-gray-700">{{ conn.subscriberName || '—' }}</td>
              <!-- Download -->
              <td class="px-3 py-2 text-center font-mono">
                <div class="text-green-700 font-semibold">{{ fmtBytes(conn.bytesIn) }}</div>
                <div v-if="getSpeed(conn)" class="mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-semibold">
                  ⬇ {{ fmtSpeed(getSpeed(conn)!.down) }}
                </div>
              </td>
              <!-- Upload -->
              <td class="px-3 py-2 text-center font-mono">
                <div class="text-orange-600 font-semibold">{{ fmtBytes(conn.bytesOut) }}</div>
                <div v-if="getSpeed(conn)" class="mt-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-orange-50 text-orange-500 text-[10px] font-semibold">
                  ⬆ {{ fmtSpeed(getSpeed(conn)!.up) }}
                </div>
              </td>
              <!-- Package -->
              <td class="px-3 py-2">
                <span v-if="conn.packageName" class="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                  {{ conn.packageName }}
                </span>
                <span v-else class="text-gray-400">—</span>
              </td>
              <!-- IP -->
              <td class="px-3 py-2 font-mono">
                <a v-if="conn.address"
                  :href="`http://${conn.address}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 w-fit"
                  title="فتح صفحة الجهاز في المتصفح">
                  {{ conn.address }}
                  <i class="fas fa-external-link-alt text-[9px] opacity-60"></i>
                </a>
                <span v-else class="text-gray-400">—</span>
              </td>
              <!-- MAC -->
              <td class="px-3 py-2 font-mono text-gray-500 text-[11px]">{{ conn.macAddress || '—' }}</td>
              <!-- Uptime -->
              <td class="px-3 py-2 text-gray-500 whitespace-nowrap">{{ formatUptime(conn.uptime) }}</td>
              <!-- Router -->
              <td class="px-3 py-2">
                <span class="flex items-center gap-1 text-gray-500">
                  <i class="fas fa-server text-[9px] text-gray-400"></i>
                  {{ conn.routerName }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Footer: Pagination ── -->
      <div v-if="filteredConnections.length > 0"
        class="flex items-center justify-between px-5 py-2.5 border-t border-gray-100 bg-gray-50 flex-wrap gap-2">
        <!-- Page navigation -->
        <div class="flex items-center gap-1 text-xs">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-double-right text-[10px]"></i>
          </button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-right text-[10px]"></i>
          </button>
          <template v-for="p in visiblePages" :key="p">
            <button @click="currentPage = p"
              class="w-7 h-7 rounded border text-[11px] transition"
              :class="p === currentPage ? 'bg-blue-600 border-blue-600 text-white font-bold' : 'border-gray-300 hover:bg-gray-200 text-gray-600'">
              {{ p }}
            </button>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-left text-[10px]"></i>
          </button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-7 h-7 rounded border border-gray-300 flex items-center justify-center disabled:opacity-40 hover:bg-gray-200 transition">
            <i class="fas fa-angle-double-left text-[10px]"></i>
          </button>
        </div>

        <!-- Per-page sizes -->
        <div class="flex items-center gap-1 text-xs">
          <span class="text-gray-400 ml-1">عدد الصفوف:</span>
          <button v-for="s in [5, 10, 50, 100, 500]" :key="s"
            @click="pageSize = s; currentPage = 1"
            class="w-9 h-7 rounded border text-[11px] transition"
            :class="pageSize === s ? 'bg-gray-700 border-gray-700 text-white font-bold' : 'border-gray-300 hover:bg-gray-200 text-gray-600'">
            {{ s }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Toast ── -->
    <Transition name="toast">
      <div v-if="toast.show"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2"
        :class="toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
        <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ── Context Menu ── -->
    <Teleport to="body">
      <div v-if="ctxMenu.visible"
        class="fixed z-[200] bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-52 text-sm overflow-hidden"
        :style="{ top: ctxMenu.y + 'px', left: ctxMenu.x + 'px' }"
        @click.stop>
        <!-- Header -->
        <div class="px-3 py-2 border-b border-gray-100 mb-1">
          <p class="font-semibold text-gray-800 text-xs truncate">{{ ctxMenu.conn?.name }}</p>
          <p class="text-[10px] text-gray-400 font-mono">{{ ctxMenu.conn?.address }}</p>
        </div>
        <!-- Items -->
        <button @click="openFlow(ctxMenu.conn!); ctxMenu.visible = false"
          class="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition text-xs">
          <span class="w-6 text-center text-blue-500"><i class="fas fa-tachometer-alt"></i></span>
          تدفق البيانات
        </button>
        <button @click="openDetails(ctxMenu.conn!); ctxMenu.visible = false"
          class="w-full flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition text-xs">
          <span class="w-6 text-center text-indigo-500"><i class="fas fa-info-circle"></i></span>
          عرض التفاصيل
        </button>
        <button @click="openPing(ctxMenu.conn!); ctxMenu.visible = false"
          class="w-full flex items-center gap-3 px-4 py-2 hover:bg-green-50 text-gray-700 hover:text-green-700 transition text-xs">
          <span class="w-6 text-center text-green-500"><i class="fas fa-satellite-dish"></i></span>
          Ping
        </button>
        <div class="border-t border-gray-100 mt-1 pt-1"></div>
        <button @click="disconnectOne(ctxMenu.conn!); ctxMenu.visible = false"
          class="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 hover:text-red-700 transition text-xs">
          <span class="w-6 text-center"><i class="fas fa-sign-out-alt"></i></span>
          قطع الاتصال
        </button>
      </div>
      <!-- Backdrop -->
      <div v-if="ctxMenu.visible" class="fixed inset-0 z-[199]" @click="ctxMenu.visible = false" @contextmenu.prevent="ctxMenu.visible = false"></div>
    </Teleport>

    <!-- ── Details Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detailsModal.visible" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="detailsModal.visible = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" dir="rtl">

            <!-- Gradient Header -->
            <div class="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 px-5 pt-5 pb-8 overflow-hidden">
              <!-- Decorative circles -->
              <div class="absolute -top-6 -left-6 w-28 h-28 bg-white/10 rounded-full"></div>
              <div class="absolute -bottom-8 -right-4 w-36 h-36 bg-white/10 rounded-full"></div>
              <div class="absolute top-2 right-16 w-12 h-12 bg-white/5 rounded-full"></div>
              <!-- Close button -->
              <button @click="detailsModal.visible = false"
                class="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition z-10">
                <i class="fas fa-times text-xs"></i>
              </button>
              <!-- Avatar + Info -->
              <div v-if="detailsModal.conn" class="relative flex items-center gap-4 z-10">
                <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg select-none">
                  {{ (detailsModal.conn.subscriberName || detailsModal.conn.name || '?')[0].toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-white font-bold text-base leading-tight truncate">{{ detailsModal.conn.subscriberName || detailsModal.conn.name }}</div>
                  <div class="text-indigo-200 text-xs mt-0.5 font-mono">{{ detailsModal.conn.name }}</div>
                  <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                    <!-- Status badge -->
                    <span class="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs text-white">
                      <span class="w-1.5 h-1.5 rounded-full animate-pulse"
                        :class="detailsModal.conn.subscriberStatus === 'active' ? 'bg-green-300' : detailsModal.conn.subscriberStatus === 'disabled' ? 'bg-gray-300' : 'bg-yellow-300'">
                      </span>
                      {{ detailsModal.conn.subscriberStatus === 'active' ? 'متصل' : detailsModal.conn.subscriberStatus === 'disabled' ? 'معطّل' : 'غير معروف' }}
                    </span>
                    <!-- Package badge -->
                    <span v-if="detailsModal.conn.packageName" class="bg-white/20 rounded-full px-2 py-0.5 text-xs text-indigo-100">
                      <i class="fas fa-box text-indigo-200 ml-1"></i>{{ detailsModal.conn.packageName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div v-if="detailsModal.conn" class="px-5 py-4 space-y-4 -mt-4">

              <!-- Traffic Stats Cards -->
              <div class="grid grid-cols-2 gap-3">
                <!-- Download total -->
                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-arrow-down text-green-600 text-xs"></i>
                    </div>
                    <span class="text-xs text-green-700 font-medium">تحميل إجمالي</span>
                  </div>
                  <div class="text-green-800 font-bold text-sm font-mono">{{ fmtBytes(detailsModal.conn.bytesIn) }}</div>
                </div>
                <!-- Upload total -->
                <div class="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-100">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-arrow-up text-orange-600 text-xs"></i>
                    </div>
                    <span class="text-xs text-orange-700 font-medium">رفع إجمالي</span>
                  </div>
                  <div class="text-orange-800 font-bold text-sm font-mono">{{ fmtBytes(detailsModal.conn.bytesOut) }}</div>
                </div>
                <!-- Download speed -->
                <div class="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 border border-blue-100">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-tachometer-alt text-blue-600 text-xs"></i>
                    </div>
                    <span class="text-xs text-blue-700 font-medium">سرعة تحميل</span>
                  </div>
                  <div class="text-blue-800 font-bold text-sm font-mono">
                    {{ getSpeed(detailsModal.conn) ? fmtSpeed(getSpeed(detailsModal.conn)!.down) : '—' }}
                  </div>
                </div>
                <!-- Upload speed -->
                <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 border border-purple-100">
                  <div class="flex items-center gap-2 mb-1">
                    <div class="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-upload text-purple-600 text-xs"></i>
                    </div>
                    <span class="text-xs text-purple-700 font-medium">سرعة رفع</span>
                  </div>
                  <div class="text-purple-800 font-bold text-sm font-mono">
                    {{ getSpeed(detailsModal.conn) ? fmtSpeed(getSpeed(detailsModal.conn)!.up) : '—' }}
                  </div>
                </div>
              </div>

              <!-- Network Info -->
              <div class="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div class="bg-gray-100 px-3 py-2 flex items-center gap-2">
                  <i class="fas fa-network-wired text-gray-500 text-xs"></i>
                  <span class="text-xs font-semibold text-gray-600">معلومات الشبكة</span>
                </div>
                <div class="divide-y divide-gray-100">
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1.5"><i class="fas fa-globe w-3 text-center text-gray-400"></i>عنوان IP</span>
                    <span class="text-xs font-mono font-semibold text-gray-700">{{ detailsModal.conn.address || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1.5"><i class="fas fa-ethernet w-3 text-center text-gray-400"></i>عنوان MAC</span>
                    <span class="text-xs font-mono font-semibold text-gray-700">{{ detailsModal.conn.macAddress || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1.5"><i class="fas fa-clock w-3 text-center text-gray-400"></i>مدة الاتصال</span>
                    <span class="text-xs font-mono font-semibold text-indigo-700">{{ detailsModal.conn.uptime || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Service Info -->
              <div class="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                <div class="bg-gray-100 px-3 py-2 flex items-center gap-2">
                  <i class="fas fa-server text-gray-500 text-xs"></i>
                  <span class="text-xs font-semibold text-gray-600">معلومات الخدمة</span>
                </div>
                <div class="divide-y divide-gray-100">
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1.5"><i class="fas fa-box w-3 text-center text-gray-400"></i>الباقة</span>
                    <span class="text-xs font-semibold text-gray-700">{{ detailsModal.conn.packageName || '—' }}</span>
                  </div>
                  <div class="flex items-center justify-between px-3 py-2">
                    <span class="text-xs text-gray-500 flex items-center gap-1.5"><i class="fas fa-router w-3 text-center text-gray-400"></i>الراوتر</span>
                    <span class="text-xs font-semibold text-gray-700">{{ detailsModal.conn.routerName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-2 justify-end">
              <button @click="openFlow(detailsModal.conn!); detailsModal.visible = false"
                class="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm">
                <i class="fas fa-tachometer-alt"></i> تدفق البيانات
              </button>
              <button @click="openPing(detailsModal.conn!); detailsModal.visible = false"
                class="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm">
                <i class="fas fa-satellite-dish"></i> Ping
              </button>
              <button @click="disconnectOne(detailsModal.conn!); detailsModal.visible = false"
                class="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-medium transition flex items-center gap-1.5 shadow-sm">
                <i class="fas fa-sign-out-alt"></i> قطع الاتصال
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Data Flow Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="flowModal.visible" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeFlow"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm" dir="rtl">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-tachometer-alt text-blue-500"></i>
                تدفق البيانات
              </h3>
              <button @click="closeFlow" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div class="px-5 py-5" v-if="flowModal.conn">
              <p class="text-xs font-semibold text-gray-500 mb-4 font-mono">{{ flowModal.conn.name }} — {{ flowModal.conn.address }}</p>
              <!-- Live speed gauges -->
              <div class="grid grid-cols-2 gap-4 mb-5">
                <div class="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                  <i class="fas fa-arrow-down text-green-500 text-lg mb-1"></i>
                  <p class="text-[10px] text-green-600 font-medium mb-0.5">تحميل</p>
                  <p class="text-xl font-bold text-green-700">{{ flowModal.speed ? fmtSpeedShort(flowModal.speed.down) : '...' }}</p>
                  <p class="text-[10px] text-gray-400 mt-1">{{ fmtBytes(flowModal.conn.bytesIn) }} إجمالي</p>
                </div>
                <div class="bg-orange-50 rounded-xl p-4 text-center border border-orange-100">
                  <i class="fas fa-arrow-up text-orange-500 text-lg mb-1"></i>
                  <p class="text-[10px] text-orange-600 font-medium mb-0.5">رفع</p>
                  <p class="text-xl font-bold text-orange-700">{{ flowModal.speed ? fmtSpeedShort(flowModal.speed.up) : '...' }}</p>
                  <p class="text-[10px] text-gray-400 mt-1">{{ fmtBytes(flowModal.conn.bytesOut) }} إجمالي</p>
                </div>
              </div>
              <!-- Speed history bars -->
              <div class="space-y-2">
                <div>
                  <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>⬇ تاريخ التحميل</span>
                    <span class="text-green-600 font-medium">{{ flowModal.history.down.length ? fmtSpeedShort(flowModal.history.down.at(-1)!) : '—' }}</span>
                  </div>
                  <div class="flex items-end gap-0.5 h-10 bg-gray-50 rounded-lg px-2 py-1">
                    <div v-for="(v, idx) in flowModal.history.down" :key="idx"
                      class="flex-1 bg-green-400 rounded-sm transition-all"
                      :style="{ height: (flowModal.maxDown > 0 ? Math.max(4, v / flowModal.maxDown * 100) : 4) + '%' }"></div>
                    <div v-for="n in Math.max(0, 20 - flowModal.history.down.length)" :key="'e'+n" class="flex-1 bg-gray-200 rounded-sm h-1"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>⬆ تاريخ الرفع</span>
                    <span class="text-orange-500 font-medium">{{ flowModal.history.up.length ? fmtSpeedShort(flowModal.history.up.at(-1)!) : '—' }}</span>
                  </div>
                  <div class="flex items-end gap-0.5 h-10 bg-gray-50 rounded-lg px-2 py-1">
                    <div v-for="(v, idx) in flowModal.history.up" :key="idx"
                      class="flex-1 bg-orange-400 rounded-sm transition-all"
                      :style="{ height: (flowModal.maxUp > 0 ? Math.max(4, v / flowModal.maxUp * 100) : 4) + '%' }"></div>
                    <div v-for="n in Math.max(0, 20 - flowModal.history.up.length)" :key="'e'+n" class="flex-1 bg-gray-200 rounded-sm h-1"></div>
                  </div>
                </div>
              </div>
              <p class="text-[10px] text-gray-400 text-center mt-3">
                <span class="inline-flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  تحديث لحظي — كل ثانية
                </span>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Ping Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="pingModal.visible" class="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="pingModal.visible = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm" dir="rtl">
            <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 class="font-bold text-gray-800 flex items-center gap-2">
                <i class="fas fa-satellite-dish text-green-500"></i>
                Ping — {{ pingModal.host }}
              </h3>
              <button @click="pingModal.visible = false" class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
            <div class="px-5 py-4">
              <div v-if="pingModal.loading" class="flex items-center justify-center gap-3 py-6 text-gray-500 text-sm">
                <i class="fas fa-circle-notch fa-spin text-blue-400"></i> جاري إرسال الـ ping...
              </div>
              <div v-else-if="pingModal.results.length">
                <div class="space-y-1.5 mb-4">
                  <div v-for="r in pingModal.results" :key="r.seq"
                    class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono"
                    :class="r.status === 'reply' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
                    <span class="flex items-center gap-2">
                      <i :class="r.status === 'reply' ? 'fas fa-check-circle text-green-500' : 'fas fa-times-circle text-red-400'"></i>
                      seq={{ r.seq }}
                    </span>
                    <span v-if="r.status === 'reply'">ttl={{ r.ttl }} &nbsp; time={{ r.time.toFixed(1) }}ms</span>
                    <span v-else>timeout</span>
                  </div>
                </div>
                <!-- Summary -->
                <div class="bg-gray-50 rounded-xl px-4 py-3 text-xs grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p class="text-gray-400">مُرسَل</p>
                    <p class="font-bold text-gray-700">{{ pingModal.results.length }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400">وصل</p>
                    <p class="font-bold text-green-600">{{ pingModal.results.filter(r => r.status === 'reply').length }}</p>
                  </div>
                  <div>
                    <p class="text-gray-400">متوسط</p>
                    <p class="font-bold text-blue-600">{{ pingAvg }}ms</p>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 text-gray-400 text-sm">لا توجد نتائج</div>
              <button @click="runPing(pingModal.routerId, pingModal.host)" :disabled="pingModal.loading"
                class="mt-4 w-full py-2 rounded-xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold transition flex items-center justify-center gap-2">
                <i class="fas fa-redo"></i> إعادة الـ Ping
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── Confirm Disconnect Modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="confirmModal.visible" class="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="confirmModal.visible = false"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" dir="rtl">
            <!-- Red header -->
            <div class="bg-gradient-to-br from-red-500 to-red-700 px-6 py-6 text-white text-center">
              <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 ring-4 ring-white/10">
                <i class="fas fa-sign-out-alt text-2xl"></i>
              </div>
              <h3 class="font-bold text-lg tracking-wide">{{ confirmModal.title }}</h3>
            </div>
            <!-- Body -->
            <div class="px-6 py-5 text-center">
              <p class="text-gray-700 font-semibold text-sm">{{ confirmModal.message }}</p>
              <p v-if="confirmModal.submessage" class="text-gray-400 text-xs mt-1.5 font-mono">{{ confirmModal.submessage }}</p>
              <div class="flex items-center gap-2 justify-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mt-4">
                <i class="fas fa-exclamation-triangle text-amber-500"></i>
                <span>سيتم قطع الاتصال فوراً ولا يمكن التراجع</span>
              </div>
            </div>
            <!-- Footer -->
            <div class="px-6 pb-6 flex gap-3">
              <button @click="confirmModal.visible = false"
                class="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition">
                <i class="fas fa-times ml-1.5"></i> إلغاء
              </button>
              <button @click="confirmModal.onConfirm()"
                class="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white text-sm font-bold transition flex items-center justify-center gap-2">
                <i class="fas fa-sign-out-alt"></i> قطع الاتصال
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Connection {
  id: string;
  name: string;
  service: string;
  address: string;
  macAddress: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  routerId: number;
  routerName: string;
  subscriberId: number | null;
  subscriberName: string;
  packageName: string;
  subscriberStatus: 'active' | 'disabled' | 'unknown';
}

// ── State ─────────────────────────────────────────────────────────────────────
const connections = ref<Connection[]>([]);
const routers = ref<{ id: number; name: string }[]>([]);
const loading = ref(false);
const disconnecting = ref(false);
const disconnectingId = ref('');

const searchTerm = ref('');
const filterRouter = ref<number | ''>('');
const filterStatus = ref('');
const showFilter = ref(false);

const sortKey = ref('name');
const sortDir = ref<'asc' | 'desc'>('asc');

const currentPage = ref(1);
const pageSize = ref(10);

const selectedIds = ref<Set<string>>(new Set());

const autoRefresh = ref(false);
let refreshTimer: ReturnType<typeof setInterval> | null = null;
const lastFetch = ref('');

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const confirmModal = ref<{
  visible: boolean;
  title: string;
  message: string;
  submessage: string;
  onConfirm: () => void;
}>({ visible: false, title: '', message: '', submessage: '', onConfirm: () => {} });

// ── Speed tracking (delta between polls) ─────────────────────────────────────
interface SpeedEntry { bytesIn: number; bytesOut: number; ts: number; }
const prevSnapshot = ref<Map<string, SpeedEntry>>(new Map());
const speedMap = ref<Map<string, { down: number; up: number }>>(new Map());

const toast = ref({ show: false, message: '', type: 'success' as 'success' | 'error' });
let toastTimer: ReturnType<typeof setTimeout> | null = null;

// ── Context Menu ──────────────────────────────────────────────────────────────
const ctxMenu = ref<{ visible: boolean; x: number; y: number; conn: Connection | null }>({ visible: false, x: 0, y: 0, conn: null });
let longPressTimer: ReturnType<typeof setTimeout> | null = null;

function openContextMenu(e: MouseEvent, conn: Connection) {
  const margin = 8;
  const menuW = 208, menuH = 200;
  let x = e.clientX + margin;
  let y = e.clientY + margin;
  if (x + menuW > window.innerWidth)  x = e.clientX - menuW - margin;
  if (y + menuH > window.innerHeight) y = e.clientY - menuH - margin;
  ctxMenu.value = { visible: true, x, y, conn };
}
function startLongPress(e: MouseEvent, conn: Connection) {
  if (e.button !== 0) return;
  longPressTimer = setTimeout(() => openContextMenu(e, conn), 600);
}
function cancelLongPress() {
  if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
}

// ── Details Modal ─────────────────────────────────────────────────────────────
const detailsModal = ref<{ visible: boolean; conn: Connection | null }>({ visible: false, conn: null });
function openDetails(conn: Connection) { detailsModal.value = { visible: true, conn }; }
function detailsRows(conn: Connection) {
  const speed = getSpeed(conn);
  return [
    { label: 'اسم الدخول',    value: conn.name },
    { label: 'الاسم الكامل',  value: conn.subscriberName || '—' },
    { label: 'IP',            value: conn.address || '—' },
    { label: 'MAC',           value: conn.macAddress || '—' },
    { label: 'الباقة',        value: conn.packageName || '—' },
    { label: 'الراوتر',       value: conn.routerName },
    { label: 'مدة الاتصال',   value: conn.uptime || '—' },
    { label: 'تحميل إجمالي',  value: fmtBytes(conn.bytesIn) },
    { label: 'رفع إجمالي',    value: fmtBytes(conn.bytesOut) },
    { label: 'سرعة التحميل',  value: speed ? fmtSpeed(speed.down) : '—' },
    { label: 'سرعة الرفع',    value: speed ? fmtSpeed(speed.up) : '—' },
    { label: 'الحالة',        value: conn.subscriberStatus === 'active' ? 'متصل الصلاحية' : conn.subscriberStatus === 'disabled' ? 'معطل' : 'غير معروف' },
  ];
}

// ── Data Flow Modal ───────────────────────────────────────────────────────────
const flowModal = ref<{
  visible: boolean; conn: Connection | null;
  speed: { down: number; up: number } | null;
  history: { down: number[]; up: number[] };
  maxDown: number; maxUp: number; interval: number;
}>({ visible: false, conn: null, speed: null, history: { down: [], up: [] }, maxDown: 0, maxUp: 0, interval: 1 });
let flowTimer: ReturnType<typeof setInterval> | null = null;

// Last sample for delta calculation
let _flowPrev: { bytesIn: number; bytesOut: number; ts: number } | null = null;

function openFlow(conn: Connection) {
  _flowPrev = null;
  flowModal.value = { visible: true, conn, speed: null, history: { down: [], up: [] }, maxDown: 0, maxUp: 0, interval: 1 };
  if (flowTimer) clearInterval(flowTimer);
  flowTimer = setInterval(async () => {
    if (!flowModal.value.visible || !flowModal.value.conn) return;
    const c = flowModal.value.conn;
    try {
      const res = await api.get(`/routers/${c.routerId}/connection/${encodeURIComponent(c.name)}`);
      const data = res.data as { bytesIn: number; bytesOut: number; uptime: string; address: string } | null;
      if (!data) return;
      const now = Date.now();
      // Update conn bytes for display
      flowModal.value.conn = { ...c, bytesIn: data.bytesIn, bytesOut: data.bytesOut, uptime: data.uptime };
      // Calculate speed from delta
      if (_flowPrev) {
        const dt = (now - _flowPrev.ts) / 1000; // seconds
        if (dt > 0) {
          const down = Math.max(0, (data.bytesIn  - _flowPrev.bytesIn)  / dt) * 8;
          const up   = Math.max(0, (data.bytesOut - _flowPrev.bytesOut) / dt) * 8;
          const s = { down, up };
          flowModal.value.speed = s;
          const hd = [...flowModal.value.history.down, s.down].slice(-60);
          const hu = [...flowModal.value.history.up,   s.up  ].slice(-60);
          flowModal.value.history = { down: hd, up: hu };
          flowModal.value.maxDown = Math.max(...hd, 1);
          flowModal.value.maxUp   = Math.max(...hu, 1);
        }
      }
      _flowPrev = { bytesIn: data.bytesIn, bytesOut: data.bytesOut, ts: now };
    } catch { /* silent */ }
  }, 1000);
}
function closeFlow() {
  flowModal.value.visible = false;
  if (flowTimer) { clearInterval(flowTimer); flowTimer = null; }
}
function fmtSpeedShort(bps: number): string {
  if (!bps) return '0';
  if (bps < 1_000_000)     return (bps / 1_000).toFixed(1) + ' K';
  if (bps < 1_000_000_000) return (bps / 1_000_000).toFixed(2) + ' M';
  return (bps / 1_000_000_000).toFixed(2) + ' G';
}

// ── Ping Modal ────────────────────────────────────────────────────────────────
const pingModal = ref<{
  visible: boolean; host: string; routerId: number;
  loading: boolean; results: { seq: number; ttl: number; time: number; status: string }[];
}>({ visible: false, host: '', routerId: 0, loading: false, results: [] });

const pingAvg = computed(() => {
  const replies = pingModal.value.results.filter(r => r.status === 'reply');
  if (!replies.length) return '—';
  return (replies.reduce((s, r) => s + r.time, 0) / replies.length).toFixed(1);
});

function openPing(conn: Connection) {
  pingModal.value = { visible: true, host: conn.address, routerId: conn.routerId, loading: false, results: [] };
  runPing(conn.routerId, conn.address);
}
async function runPing(routerId: number, host: string) {
  pingModal.value.loading = true;
  pingModal.value.results = [];
  try {
    const { data } = await api.post(`/routers/${routerId}/ping-host`, { host });
    pingModal.value.results = data.results ?? [];
  } catch {
    showToast('فشل إرسال الـ Ping', 'error');
  } finally {
    pingModal.value.loading = false;
  }
}

// ── Table columns ─────────────────────────────────────────────────────────────
const columns = [
  { key: 'name',            label: 'اسم الدخول',    center: false },
  { key: 'subscriberName',  label: 'الاسم الكامل',   center: false },
  { key: 'bytesIn',        label: 'التحميل',        center: true  },
  { key: 'bytesOut',       label: 'الرفع',          center: true  },
  { key: 'packageName',    label: 'الباقة',         center: false },
  { key: 'address',        label: 'IP',             center: false },
  { key: 'macAddress',     label: 'MAC',            center: false },
  { key: 'uptime',         label: 'مدة الاتصال',    center: false },
  { key: 'routerName',     label: 'DEVICE',         center: false },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  if (s === 'active')   return 'bg-green-500';
  if (s === 'disabled') return 'bg-red-500';
  return 'bg-gray-400';
}

function fmtBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024)           return bytes + ' B';
  if (bytes < 1024 * 1024)    return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 ** 3)      return (bytes / 1024 ** 2).toFixed(2) + ' MB';
  return (bytes / 1024 ** 3).toFixed(2) + ' GB';
}

function fmtSpeed(bps: number): string {
  if (!bps || bps < 0) return '—';
  if (bps < 1_000)         return bps.toFixed(0) + ' bps';
  if (bps < 1_000_000)     return (bps / 1_000).toFixed(1) + ' Kbps';
  if (bps < 1_000_000_000) return (bps / 1_000_000).toFixed(2) + ' Mbps';
  return (bps / 1_000_000_000).toFixed(2) + ' Gbps';
}

function getSpeed(conn: Connection) {
  return speedMap.value.get(connKey(conn)) ?? null;
}

function formatUptime(uptime: string): string {
  if (!uptime) return '—';
  // MikroTik format: 2d3h45m12s → 2d 3h 45m
  return uptime.replace(/(\d+)w/, '$1w ').replace(/(\d+)d/, '$1d ').replace(/(\d+)h/, '$1h ').replace(/(\d+)m/, '$1m ').replace(/(\d+)s.*/, '').trim() || uptime;
}

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type };
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value.show = false), 3500);
}

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredConnections = computed(() => {
  let list = connections.value;
  if (filterRouter.value !== '') list = list.filter(c => c.routerId === filterRouter.value);
  if (filterStatus.value)        list = list.filter(c => c.subscriberStatus === filterStatus.value);
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.subscriberName.toLowerCase().includes(q) ||
      c.address.includes(q) ||
      c.macAddress.toLowerCase().includes(q) ||
      c.packageName.toLowerCase().includes(q),
    );
  }
  // Sort
  return [...list].sort((a, b) => {
    const av = (a as any)[sortKey.value] ?? '';
    const bv = (b as any)[sortKey.value] ?? '';
    const cmp = typeof av === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv), 'ar');
    return sortDir.value === 'asc' ? cmp : -cmp;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredConnections.value.length / pageSize.value)));

const pagedConnections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredConnections.value.slice(start, start + pageSize.value);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const cur = currentPage.value;
  const pages: number[] = [];
  for (let i = Math.max(1, cur - 2); i <= Math.min(total, cur + 2); i++) pages.push(i);
  return pages;
});

// Reset page when filter changes
watch([searchTerm, filterRouter, filterStatus, pageSize], () => { currentPage.value = 1; });

// ── Selection ─────────────────────────────────────────────────────────────────
function connKey(c: Connection) { return c.id + '_' + c.routerId; }

function toggleSelect(c: Connection) {
  const k = connKey(c);
  const s = new Set(selectedIds.value);
  s.has(k) ? s.delete(k) : s.add(k);
  selectedIds.value = s;
}

function toggleAll(e: Event) {
  const checked = (e.target as HTMLInputElement).checked;
  if (checked) {
    selectedIds.value = new Set(pagedConnections.value.map(connKey));
  } else {
    selectedIds.value = new Set();
  }
}

// ── Sort ──────────────────────────────────────────────────────────────────────
function toggleSort(key: string) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  else { sortKey.value = key; sortDir.value = 'asc'; }
}

// ── API ───────────────────────────────────────────────────────────────────────
async function loadConnections() {
  loading.value = true;
  try {
    const [connRes, routersRes] = await Promise.all([
      api.get('/routers/connections'),
      api.get('/routers'),
    ]);
    const now = Date.now();
    const newConns: Connection[] = connRes.data;

    // DEBUG: print raw fields of first connection
    if (newConns.length > 0) console.log('RAW CONNECTION:', JSON.stringify((newConns[0] as any)._raw));

    // Compute delta-based speeds
    const newSpeedMap = new Map<string, { down: number; up: number }>();
    const newSnapshot = new Map<string, SpeedEntry>();
    for (const c of newConns) {
      const k = connKey(c);
      const prev = prevSnapshot.value.get(k);
      if (prev && now > prev.ts) {
        const elapsedSec = (now - prev.ts) / 1000;
        const downBps = Math.max(0, (c.bytesIn - prev.bytesIn) / elapsedSec) * 8;
        const upBps   = Math.max(0, (c.bytesOut - prev.bytesOut) / elapsedSec) * 8;
        newSpeedMap.set(k, { down: downBps, up: upBps });
      }
      newSnapshot.set(k, { bytesIn: c.bytesIn, bytesOut: c.bytesOut, ts: now });
    }
    prevSnapshot.value = newSnapshot;
    speedMap.value = newSpeedMap;

    connections.value = newConns;
    routers.value = routersRes.data;
    lastFetch.value = new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (_) {
    showToast('فشل جلب بيانات المتصلين', 'error');
  } finally {
    loading.value = false;
  }
}

function disconnectOne(conn: Connection) {
  confirmModal.value = {
    visible: true,
    title: 'قطع الاتصال',
    message: `هل تريد قطع اتصال "${conn.name}"؟`,
    submessage: `IP: ${conn.address}`,
    onConfirm: () => doDisconnectOne(conn),
  };
}

async function doDisconnectOne(conn: Connection) {
  confirmModal.value.visible = false;
  const key = connKey(conn);
  disconnectingId.value = key;
  try {
    const { data } = await api.post(`/routers/${conn.routerId}/disconnect-session`, { sessionId: conn.id });
    showToast(data.message || 'تم قطع الاتصال', data.success ? 'success' : 'error');
    if (data.success) {
      connections.value = connections.value.filter(c => connKey(c) !== key);
      selectedIds.value.delete(key);
    }
  } catch (_) {
    showToast('حدث خطأ أثناء قطع الاتصال', 'error');
  } finally {
    disconnectingId.value = '';
  }
}

function disconnectSelected() {
  if (!selectedIds.value.size) return;
  const count = selectedIds.value.size;
  confirmModal.value = {
    visible: true,
    title: 'قطع اتصال متعدد',
    message: `هل تريد قطع اتصال ${count} مشترك محدد؟`,
    submessage: `سيتم قطع ${count} اتصال في آنٍ واحد`,
    onConfirm: () => doDisconnectSelected(),
  };
}

async function doDisconnectSelected() {
  confirmModal.value.visible = false;
  const count = selectedIds.value.size;
  disconnecting.value = true;
  let success = 0;
  for (const key of Array.from(selectedIds.value)) {
    const conn = connections.value.find(c => connKey(c) === key);
    if (!conn) continue;
    try {
      const { data } = await api.post(`/routers/${conn.routerId}/disconnect-session`, { sessionId: conn.id });
      if (data.success) { success++; connections.value = connections.value.filter(c => connKey(c) !== key); }
    } catch (_) {}
  }
  selectedIds.value = new Set();
  disconnecting.value = false;
  showToast(`تم قطع الاتصال لـ ${success} من ${count}`, success === count ? 'success' : 'error');
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function exportCSV() {
  const headers = ['اسم الدخول', 'الاسم الكامل', 'التحميل', 'الرفع', 'الباقة', 'IP', 'MAC', 'مدة الاتصال', 'الراوتر', 'الحالة'];
  const rows = filteredConnections.value.map(c => [
    c.name, c.subscriberName,
    fmtBytes(c.bytesIn), fmtBytes(c.bytesOut),
    c.packageName, c.address, c.macAddress,
    c.uptime, c.routerName,
    c.subscriberStatus === 'active' ? 'متصل الصلاحية' : c.subscriberStatus === 'disabled' ? 'معطل' : 'غير معروف',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `connected-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

// ── Auto-refresh ──────────────────────────────────────────────────────────────
watch(autoRefresh, (v) => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (v) refreshTimer = setInterval(loadConnections, 30_000);
});

onMounted(() => loadConnections());
onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (toastTimer) clearTimeout(toastTimer);
  if (flowTimer) clearInterval(flowTimer);
  if (longPressTimer) clearTimeout(longPressTimer);
});
</script>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.97); }
</style>
