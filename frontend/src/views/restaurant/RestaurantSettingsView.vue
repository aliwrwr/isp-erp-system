<template>
  <div class="flex flex-col gap-6">

    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-secondary">إعدادات المطعم</h2>
        <p class="text-sm text-gray-400 mt-0.5">معلومات المطعم وإعدادات الفاتورة</p>
      </div>
      <button @click="saveAll" :disabled="saving"
        class="flex items-center gap-2 bg-gradient-to-l from-orange-600 to-amber-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow hover:shadow-md transition disabled:opacity-60">
        <i class="fas fa-save"></i>
        {{ saving ? 'جاري الحفظ...' : 'حفظ الإعدادات' }}
      </button>
    </div>

    <!-- Success notice -->
    <transition name="fade">
      <div v-if="savedNotice" class="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
        <i class="fas fa-check-circle"></i>
        تم حفظ إعدادات المطعم بنجاح
      </div>
    </transition>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Logo -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-orange-600 to-amber-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-image text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">شعار المطعم</h3>
          <span class="mr-auto text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
            يظهر في رأس الفاتورة الحرارية
          </span>
        </div>
        <div class="p-5">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div class="w-32 h-32 rounded-2xl border-2 border-dashed flex items-center justify-center flex-shrink-0 overflow-hidden transition"
              :class="logoPreview ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200 bg-gray-50'">
              <img v-if="logoPreview" :src="logoPreview" alt="شعار" class="w-full h-full object-contain p-1" />
              <div v-else class="flex flex-col items-center gap-2 text-gray-300">
                <i class="fas fa-utensils text-3xl"></i>
                <span class="text-xs">لا يوجد شعار</span>
              </div>
            </div>
            <div class="flex flex-col gap-3 flex-1">
              <p class="text-sm text-gray-500">يظهر الشعار في رأس الفاتورة الحرارية عند الطباعة من نقطة البيع</p>
              <div class="flex flex-wrap gap-2">
                <label class="cursor-pointer inline-flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                  <i class="fas fa-upload"></i>
                  {{ logoPreview ? 'تغيير الشعار' : 'رفع الشعار' }}
                  <input type="file" accept="image/*" @change="onLogoChange" class="hidden" />
                </label>
                <button v-if="logoPreview" @click="logoPreview = null"
                  class="inline-flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-semibold transition">
                  <i class="fas fa-trash"></i>
                  حذف الشعار
                </button>
              </div>
              <p class="text-xs text-gray-400">الصيغ المدعومة: PNG، JPG، SVG — الحجم الأقصى: 2 ميغابايت</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Restaurant Info -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-orange-600 to-amber-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-store text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">معلومات المطعم</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">اسم المطعم</label>
            <input v-model="settings.restaurantName" type="text" placeholder="مطعم ..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">رقم الهاتف</label>
            <input v-model="settings.restaurantPhone" type="text" placeholder="07XXXXXXXXX"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العنوان</label>
            <textarea v-model="settings.restaurantAddress" rows="3" placeholder="العنوان التفصيلي..."
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"></textarea>
          </div>
        </div>
      </div>

      <!-- Receipt Settings -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-orange-600 to-amber-500 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-receipt text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">إعدادات الفاتورة</h3>
        </div>
        <div class="p-5 flex flex-col gap-4">

          <!-- Paper size -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-2">حجم ورق الطباعة</label>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="size in ['80mm','58mm']" :key="size"
                class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition"
                :class="settings.receiptPaperSize === size
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'">
                <input type="radio" v-model="settings.receiptPaperSize" :value="size" class="accent-orange-500" />
                <div>
                  <p class="text-sm font-bold" :class="settings.receiptPaperSize === size ? 'text-orange-700' : 'text-gray-700'">{{ size }}</p>
                  <p class="text-xs text-gray-400">{{ size === '80mm' ? 'عرض أوسع — الأكثر شيوعاً' : 'عرض ضيق — طابعات صغيرة' }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Currency -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">العملة</label>
            <input v-model="settings.receiptCurrency" type="text" placeholder="د.ع"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>

          <!-- Tax -->
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-semibold text-gray-700">تفعيل الضريبة</p>
              <p class="text-xs text-gray-400 mt-0.5">إضافة نسبة ضريبة على الفاتورة</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.taxEnabled" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>

          <div v-if="settings.taxEnabled">
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">نسبة الضريبة (%)</label>
            <input v-model.number="settings.taxRate" type="number" min="0" max="100" step="0.5" placeholder="15"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>

          <!-- Footer text -->
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1.5">نص ذيل الفاتورة</label>
            <input v-model="settings.receiptFooter" type="text" placeholder="شكراً لزيارتكم 🙏"
              class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      <!-- Receipt Preview -->
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-5 py-4 bg-gradient-to-l from-gray-700 to-gray-600 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-eye text-white text-sm"></i>
          </div>
          <h3 class="font-bold text-white text-sm">معاينة الفاتورة</h3>
          <span class="mr-auto text-xs bg-white/20 text-white border border-white/30 px-2.5 py-1 rounded-full">
            ورق {{ settings.receiptPaperSize }}
          </span>
        </div>
        <div class="p-6 flex justify-center bg-gray-100">
          <div class="bg-white shadow-lg font-mono text-black"
            :style="settings.receiptPaperSize === '80mm' ? 'width:280px;padding:14px 12px;font-size:11px;' : 'width:200px;padding:10px 8px;font-size:10px;'">
            <!-- Logo preview -->
            <div class="text-center mb-2">
              <img v-if="logoPreview" :src="logoPreview" class="mx-auto mb-1" style="max-height:50px;max-width:80%;object-fit:contain;" />
              <div class="font-black text-base">{{ settings.restaurantName || 'اسم المطعم' }}</div>
              <div v-if="settings.restaurantAddress" class="text-gray-500" style="font-size:9px;">{{ settings.restaurantAddress }}</div>
              <div v-if="settings.restaurantPhone" style="font-size:9px;">📞 {{ settings.restaurantPhone }}</div>
            </div>
            <div style="border-top:2px solid #000;border-bottom:2px solid #000;text-align:center;padding:3px 0;font-weight:900;margin:6px 0;letter-spacing:1px;">★ فاتورة ★</div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
              <thead>
                <tr style="border-bottom:1px solid #000;">
                  <th style="text-align:right;padding:2px;">الصنف</th>
                  <th style="text-align:center;padding:2px;">كمية</th>
                  <th style="text-align:left;padding:2px;">إجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style="padding:2px;">برغر كلاسيك</td><td style="text-align:center;">2</td><td style="text-align:left;">10,000</td></tr>
                <tr style="background:#f7f7f7;"><td style="padding:2px;">عصير برتقال</td><td style="text-align:center;">1</td><td style="text-align:left;">3,500</td></tr>
              </tbody>
            </table>
            <div style="border-top:1px solid #000;padding-top:4px;">
              <div style="display:flex;justify-content:space-between;"><span>المجموع</span><span>13,500 {{ settings.receiptCurrency }}</span></div>
              <div v-if="settings.taxEnabled" style="display:flex;justify-content:space-between;color:#555;">
                <span>ضريبة {{ settings.taxRate }}%</span>
                <span>{{ Math.round(13500 * settings.taxRate / 100).toLocaleString() }} {{ settings.receiptCurrency }}</span>
              </div>
              <div style="display:flex;justify-content:space-between;font-weight:900;font-size:1.1em;border-top:1px solid #000;margin-top:4px;padding-top:4px;">
                <span>▶ الإجمالي</span>
                <span>{{ settings.taxEnabled ? Math.round(13500*(1+settings.taxRate/100)).toLocaleString() : '13,500' }} {{ settings.receiptCurrency }}</span>
              </div>
            </div>
            <div style="text-align:center;margin-top:8px;color:#666;font-size:9px;border-top:1px dashed #ccc;padding-top:6px;">
              {{ settings.receiptFooter || 'شكراً لزيارتكم 🙏' }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../../api';

const saving = ref(false);
const savedNotice = ref(false);
const logoPreview = ref<string | null>(null);

const settings = ref({
  restaurantName: '',
  restaurantPhone: '',
  restaurantAddress: '',
  receiptPaperSize: '80mm',
  receiptCurrency: 'د.ع',
  taxEnabled: false,
  taxRate: 0,
  receiptFooter: 'شكراً لزيارتكم 🙏',
});

onMounted(async () => {
  try {
    const { data } = await api.get('/system-settings');
    settings.value.restaurantName    = data.restaurantName    || '';
    settings.value.restaurantPhone   = data.restaurantPhone   || '';
    settings.value.restaurantAddress = data.restaurantAddress || '';
    settings.value.receiptPaperSize  = data.receiptPaperSize  || '80mm';
    settings.value.receiptCurrency   = data.receiptCurrency   || 'د.ع';
    settings.value.taxEnabled        = data.taxEnabled        ?? false;
    settings.value.taxRate           = data.taxRate           ?? 0;
    settings.value.receiptFooter     = data.receiptFooter     || 'شكراً لزيارتكم 🙏';
    if (data.restaurantLogoBase64) logoPreview.value = data.restaurantLogoBase64;
  } catch {}
});

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { alert('حجم الصورة يتجاوز 2 ميغابايت'); return; }
  const reader = new FileReader();
  reader.onload = () => { logoPreview.value = reader.result as string; };
  reader.readAsDataURL(file);
}

async function saveAll() {
  saving.value = true;
  try {
    await api.post('/system-settings', {
      ...settings.value,
      restaurantLogoBase64: logoPreview.value ?? '',
    });
    savedNotice.value = true;
    setTimeout(() => { savedNotice.value = false; }, 3000);
  } catch {
    alert('فشل في حفظ الإعدادات');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
