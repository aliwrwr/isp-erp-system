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
        <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 font-[Arial,sans-serif]" dir="rtl">
          <div class="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
            <template v-if="form.logo">
              <img :src="form.logo" class="w-16 h-16 object-contain mx-auto mb-2 rounded-lg" />
            </template>
            <template v-else>
              <div class="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                <i class="fas fa-hand-holding-usd text-2xl text-indigo-600"></i>
              </div>
            </template>
            <h2 class="text-base font-black text-gray-800">{{ form.shopName || 'اسم الشركة' }}</h2>
            <p class="text-xs text-gray-500 mt-0.5">{{ form.subtitle || 'نظام الأقساط' }}</p>
            <p v-if="form.phone" class="text-xs text-gray-400 mt-0.5" dir="ltr">{{ form.phone }}</p>
            <p v-if="form.address" class="text-xs text-gray-400">{{ form.address }}</p>
          </div>
          <div class="space-y-1.5 text-xs text-gray-500">
            <div class="flex justify-between border-b border-gray-100 pb-1"><span>رقم السند</span><span class="font-bold text-indigo-600 font-mono">#000001</span></div>
            <div class="flex justify-between border-b border-gray-100 pb-1"><span>العميل</span><span class="font-bold">محمد أحمد</span></div>
            <div class="flex justify-between border-b border-gray-100 pb-1"><span>المنتج</span><span class="font-bold">تلفاز سامسونج</span></div>
            <div class="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex justify-between my-2">
              <span class="text-green-700 font-bold">المبلغ المدفوع</span>
              <span class="font-black text-green-600">100,000 د.ع</span>
            </div>
            <div class="flex justify-between border-b border-gray-100 pb-1"><span>المتبقي</span><span class="font-bold text-red-500">500,000 د.ع</span></div>
          </div>
          <div class="mt-3 pt-3 border-t border-dashed border-gray-300 grid grid-cols-2 gap-3 text-center">
            <div><div class="h-7 border-b border-gray-300 mb-1"></div><p class="text-xs text-gray-400">توقيع المستلم</p></div>
            <div><div class="h-7 border-b border-gray-300 mb-1"></div><p class="text-xs text-gray-400">توقيع العميل</p></div>
          </div>
          <p class="text-center text-xs text-gray-400 mt-3">{{ form.footer || 'شكراً لتعاملكم' }}</p>
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
