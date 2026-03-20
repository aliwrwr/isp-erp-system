<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <div class="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center">
        <i class="fas fa-cog text-indigo-600 text-lg"></i>
      </div>
      <div>
        <h1 class="text-xl font-black text-gray-800">إعدادات النظام</h1>
        <p class="text-xs text-gray-400">المعلومات التي تظهر على سند القبض</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <!-- Form -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">

        <!-- Logo upload -->
        <div>
          <label class="text-xs font-bold text-gray-500 mb-2 block">شعار النظام</label>
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-indigo-400 transition" @click="triggerLogoUpload">
              <img v-if="form.logo" :src="form.logo" class="w-full h-full object-contain p-1" />
              <i v-else class="fas fa-image text-2xl text-indigo-300"></i>
            </div>
            <div class="flex-1 space-y-2">
              <button @click="triggerLogoUpload" type="button" class="w-full flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl py-2 hover:bg-indigo-50 transition">
                <i class="fas fa-upload text-xs"></i> رفع شعار
              </button>
              <button v-if="form.logo" @click="form.logo = ''" type="button" class="w-full flex items-center justify-center gap-2 border border-red-200 text-red-400 text-sm rounded-xl py-2 hover:bg-red-50 transition">
                <i class="fas fa-trash text-xs"></i> حذف
              </button>
            </div>
          </div>
          <input ref="logoInput" type="file" accept="image/*" class="hidden" @change="onLogoChange" />
          <p class="text-xs text-gray-400 mt-1">PNG أو JPG، يفضل مربع، حجم صغير</p>
        </div>

        <hr class="border-gray-100" />

        <!-- Fields -->
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1 block">اسم الشركة / المتجر <span class="text-red-400">*</span></label>
          <input v-model="form.shopName" class="input-field" placeholder="مثال: شركة الأمل للأقساط" />
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1 block">النص الفرعي</label>
          <input v-model="form.subtitle" class="input-field" placeholder="مثال: نظام الأقساط" />
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1 block">رقم الهاتف</label>
          <input v-model="form.phone" class="input-field" dir="ltr" placeholder="07XXXXXXXXX" />
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1 block">العنوان</label>
          <input v-model="form.address" class="input-field" placeholder="مثال: بغداد، شارع الرشيد" />
        </div>
        <div>
          <label class="text-xs font-bold text-gray-500 mb-1 block">نص التذييل (أسفل السند)</label>
          <input v-model="form.footer" class="input-field" placeholder="مثال: شكراً لتعاملكم معنا" />
        </div>

        <!-- Save -->
        <button @click="save" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
          <i class="fas fa-check"></i> حفظ الإعدادات
        </button>
        <p v-if="saved" class="text-center text-green-600 text-sm font-bold flex items-center justify-center gap-2">
          <i class="fas fa-check-circle"></i> تم الحفظ بنجاح
        </p>
      </div>

      <!-- Live Preview -->
      <div>
        <p class="text-xs font-bold text-gray-400 mb-2 text-center">معاينة رأس السند</p>
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 font-[Arial,sans-serif] text-sm" dir="rtl">
          <!-- Header centered -->
          <div class="text-center mb-2">
            <template v-if="form.logo">
              <img :src="form.logo" class="w-12 h-12 object-contain mx-auto mb-1 rounded-lg" />
            </template>
            <template v-else>
              <div class="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-1">
                <i class="fas fa-hand-holding-usd text-lg text-indigo-600"></i>
              </div>
            </template>
            <p class="font-black text-gray-800">{{ form.shopName || 'اسم الشركة' }}</p>
            <p v-if="form.address" class="text-xs text-gray-500 mt-0.5">{{ form.address }}</p>
            <p v-if="form.phone" class="text-xs text-gray-400 mt-0.5" dir="ltr">{{ form.phone }}</p>
          </div>
          <!-- سند قبض row -->
          <div class="flex items-center justify-between border-t-2 border-b-2 border-dashed border-gray-300 py-1 mb-2.5">
            <span class="text-gray-400 text-xs">20/3/2026 – 09:30</span>
            <span class="text-indigo-600 font-black text-sm">سند قبض</span>
          </div>
          <!-- 3-col grid -->
          <div class="grid grid-cols-3 gap-1 mb-2 text-xs">
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">رقم السند</p><p class="font-black text-indigo-600 font-mono">#000001</p></div>
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">رقم العقد</p><p class="font-bold font-mono">INST-00001</p></div>
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">اسم العميل</p><p class="font-bold truncate">محمد أحمد</p></div>
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">هاتف العميل</p><p class="font-bold font-mono" dir="ltr">07701234567</p></div>
            <div class="bg-red-50 rounded px-1.5 py-1"><p class="text-gray-400">المتبقي</p><p class="font-bold text-red-500">500,000 د.ع</p></div>
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">استلم بواسطة</p><p class="font-bold">علي</p></div>
          </div>
          <!-- Product + installment -->
          <div class="grid grid-cols-2 gap-1 mb-2 text-xs">
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">المنتج</p><p class="font-bold">تلفاز سامسونج</p></div>
            <div class="bg-gray-50 rounded px-1.5 py-1"><p class="text-gray-400">رقم القسط</p><p class="font-bold">3 / 12</p></div>
          </div>
          <!-- Amount -->
          <div class="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex justify-between items-center">
            <span class="text-green-700 font-bold text-xs">المبلغ المدفوع</span>
            <span class="font-black text-green-600 text-sm">100,000 د.ع</span>
          </div>
          <p class="text-center text-xs text-gray-400 pt-2 mt-2 border-t border-dashed border-gray-200">{{ form.footer || 'شكراً لتعاملكم' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'inst_settings';

const defaultForm = () => ({
  shopName : 'نظام الأقساط',
  subtitle : 'سند قبض',
  phone    : '',
  address  : '',
  footer   : 'شكراً لتعاملكم معنا',
  logo     : '',
});

const form      = ref(defaultForm());
const saved     = ref(false);
const logoInput = ref<HTMLInputElement | null>(null);

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { Object.assign(form.value, JSON.parse(stored)); } catch {}
  }
});

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(form.value));
  saved.value = true;
  setTimeout(() => (saved.value = false), 3000);
}

function triggerLogoUpload() {
  logoInput.value?.click();
}

function onLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    form.value.logo = ev.target?.result as string;
  };
  reader.readAsDataURL(file);
  // reset input so same file can be re-selected
  (e.target as HTMLInputElement).value = '';
}
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition; }
</style>
