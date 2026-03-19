<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-secondary">قائمة الطعام</h2>
      <div class="flex gap-3">
        <button @click="openAddCat"
          class="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                 border-2 border-restaurant/30 text-restaurant bg-restaurant/5
                 hover:bg-restaurant hover:text-white hover:border-restaurant hover:shadow-lg hover:shadow-restaurant/25 hover:scale-105
                 focus:outline-none active:scale-95">
          <span class="w-7 h-7 rounded-lg bg-restaurant/10 group-hover:bg-white/20 flex items-center justify-center transition-all duration-200">
            <i class="fas fa-folder-plus text-sm"></i>
          </span>
          تصنيف جديد
        </button>
        <button @click="openAddItem"
          class="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                 bg-restaurant text-white shadow-md shadow-restaurant/30
                 hover:opacity-90 hover:shadow-lg hover:shadow-restaurant/40 hover:scale-105
                 focus:outline-none active:scale-95">
          <span class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <i class="fas fa-plus text-sm"></i>
          </span>
          صنف جديد
        </button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="relative mb-8">
      <div class="flex gap-3 overflow-x-auto pb-3 pt-3 px-3 bg-white rounded-2xl shadow-md border border-gray-100 custom-scrollbar min-h-[100px] items-center">
        <!-- "الكل" button -->
        <button @click="activeCategory = null"
          :class="!activeCategory
            ? 'bg-restaurant text-white shadow-lg scale-105 ring-2 ring-restaurant/30'
            : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-restaurant/40 hover:text-restaurant hover:bg-restaurant/5'"
          class="flex flex-col items-center justify-center min-w-[90px] px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 focus:outline-none shrink-0">
          <div :class="!activeCategory ? 'bg-white/20' : 'bg-restaurant/10'" class="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5">
            <i class="fas fa-layer-group text-lg" :class="!activeCategory ? 'text-white' : 'text-restaurant'"></i>
          </div>
          <span class="text-xs font-bold">الكل</span>
          <span :class="!activeCategory ? 'bg-white/25 text-white' : 'bg-restaurant/10 text-restaurant'" class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">{{ items.length }}</span>
        </button>

        <!-- Divider -->
        <div class="w-px h-14 bg-gray-200 shrink-0"></div>

        <!-- Category buttons -->
        <div v-for="c in categories" :key="c.id" class="flex flex-col items-center shrink-0">
          <div class="relative group/cat">
            <button @click="activeCategory = c.id"
              :class="activeCategory === c.id
                ? 'bg-restaurant text-white shadow-lg scale-105 ring-2 ring-restaurant/30'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-restaurant/40 hover:text-restaurant hover:bg-restaurant/5'"
              class="flex flex-col items-center justify-center min-w-[90px] px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-200 focus:outline-none">
              <div :class="activeCategory === c.id ? 'bg-white/20' : 'bg-restaurant/10'" class="w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 overflow-hidden">
                <img v-if="c.image" :src="c.image" class="w-full h-full object-cover" />
                <i v-else :class="[c.icon || 'fas fa-utensils', activeCategory === c.id ? 'text-white' : 'text-restaurant']" class="text-lg"></i>
              </div>
              <span class="text-xs font-bold max-w-[80px] truncate">{{ c.name }}</span>
              <span :class="activeCategory === c.id ? 'bg-white/25 text-white' : 'bg-restaurant/10 text-restaurant'" class="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">{{ items.filter(i => i.categoryId === c.id || i.category?.id === c.id).length }}</span>
            </button>
            <!-- Edit/Delete on hover -->
            <div class="absolute -top-2 -right-2 hidden group-hover/cat:flex flex-col gap-1 z-20">
              <button @click.stop="openEditCat(c)" class="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600 transition" title="تعديل"><i class="fas fa-edit text-xs"></i></button>
              <button @click.stop="removeCat(c.id)" class="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition" title="حذف"><i class="fas fa-trash text-xs"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div v-for="item in filteredItems" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
        <div class="h-36 bg-gradient-to-br from-restaurant/10 to-restaurant/5 flex items-center justify-center overflow-hidden relative">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
          <i v-else class="fas fa-utensils text-4xl text-restaurant/30"></i>
          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button @click="openEditItem(item)" class="w-7 h-7 rounded-lg bg-white/90 shadow text-gray-600 hover:text-primary flex items-center justify-center"><i class="fas fa-edit text-xs"></i></button>
            <button @click="removeItem(item.id)" class="w-7 h-7 rounded-lg bg-white/90 shadow text-gray-600 hover:text-red-500 flex items-center justify-center"><i class="fas fa-trash text-xs"></i></button>
          </div>
        </div>
        <div class="p-4">
          <div class="flex items-start justify-between mb-1">
            <h3 class="font-bold text-secondary text-sm">{{ item.name }}</h3>
            <span class="text-restaurant font-bold text-sm">{{  Number(item.price).toFixed(2)  }} د.ع</span>
          </div>
          <p class="text-xs text-gray-400 mb-2 line-clamp-2">{{ item.description || 'بدون وصف' }}</p>
          <div class="flex items-center justify-between">
            <span class="text-[10px] px-2 py-1 rounded-full" :class="item.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">{{ item.available ? 'متوفر' : 'غير متوفر' }}</span>
            <span v-if="item.category" class="text-[10px] px-2 py-1 rounded-full bg-restaurant/10 text-restaurant">{{ item.category.name }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="filteredItems.length === 0" class="text-center text-gray-400 py-12"><i class="fas fa-utensils text-4xl mb-3"></i><p>لا توجد أصناف</p></div>

    <!-- Item Modal -->
    <div v-if="showItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showItemModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-secondary">{{ editingItem ? 'تعديل صنف' : 'إضافة صنف جديد' }}</h3>
            <button @click="showItemModal = false" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400"><i class="fas fa-times text-sm"></i></button>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 mb-2">صورة الصنف</label>
            <div class="relative">
              <div v-if="itemForm.image" class="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 mb-2">
                <img :src="itemForm.image" class="w-full h-full object-cover" />
                <button @click="itemForm.image = ''" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow"><i class="fas fa-times text-xs"></i></button>
              </div>
              <label class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition text-sm text-gray-500">
                <i class="fas fa-camera text-restaurant"></i> {{ itemForm.image ? 'تغيير الصورة' : 'اختر صورة' }}
                <input type="file" accept="image/*" class="hidden" @change="handleItemImage" />
              </label>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">اسم الصنف *</label>
              <input v-model="itemForm.name" placeholder="مثال: برغر كلاسيك" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">الوصف</label>
              <textarea v-model="itemForm.description" placeholder="وصف الصنف..." rows="2" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">السعر ($) *</label>
                <input v-model.number="itemForm.price" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">التكلفة ($)</label>
                <input v-model.number="itemForm.cost" type="number" step="0.01" min="0" placeholder="0.00" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">التصنيف</label>
              <select v-model="itemForm.categoryId" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant">
                <option value="">بدون تصنيف</option>
                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">وقت التحضير (دقيقة)</label>
                <input v-model.number="itemForm.preparationTime" type="number" min="0" placeholder="0" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 text-sm cursor-pointer">
                  <div @click="itemForm.available = !itemForm.available" class="relative w-10 h-5 rounded-full transition-colors" :class="itemForm.available ? 'bg-green-500' : 'bg-gray-300'">
                    <div class="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform" :class="itemForm.available ? 'translate-x-5' : 'translate-x-0.5'"></div>
                  </div>
                  <span :class="itemForm.available ? 'text-green-600 font-medium' : 'text-gray-400'">{{ itemForm.available ? 'متوفر' : 'غير متوفر' }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-5">
            <button @click="saveItem" :disabled="!itemForm.name || !itemForm.price" class="flex-1 py-2.5 bg-restaurant text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition">
              <i class="fas fa-save ml-1"></i> {{ editingItem ? 'حفظ التعديلات' : 'إضافة الصنف' }}
            </button>
            <button @click="showItemModal = false" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">إلغاء</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCatModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showCatModal = false">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-secondary">{{ editingCat ? 'تعديل تصنيف' : 'إضافة تصنيف جديد' }}</h3>
            <button @click="showCatModal = false" class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400"><i class="fas fa-times text-sm"></i></button>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 mb-2">صورة التصنيف</label>
            <div v-if="catForm.image" class="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 mb-2">
              <img :src="catForm.image" class="w-full h-full object-cover" />
              <button @click="catForm.image = ''" class="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow"><i class="fas fa-times text-xs"></i></button>
            </div>
            <label class="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 transition text-sm text-gray-500">
              <i class="fas fa-image text-restaurant"></i> {{ catForm.image ? 'تغيير الصورة' : 'اختر صورة للتصنيف' }}
              <input type="file" accept="image/*" class="hidden" @change="handleCatImage" />
            </label>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">اسم التصنيف *</label>
              <input v-model="catForm.name" placeholder="مثال: المشويات" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">الوصف</label>
              <input v-model="catForm.description" placeholder="وصف التصنيف..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">أيقونة (FontAwesome class)</label>
              <div class="flex gap-2">
                <input v-model="catForm.icon" placeholder="fas fa-fire" class="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-restaurant" />
                <div class="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500">
                  <i :class="catForm.icon || 'fas fa-folder'" class="text-lg text-restaurant"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-5">
            <button @click="saveCat" :disabled="!catForm.name" class="flex-1 py-2.5 bg-restaurant text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:opacity-90 transition">
              <i class="fas fa-save ml-1"></i> {{ editingCat ? 'حفظ التعديلات' : 'إضافة التصنيف' }}
            </button>
            <button @click="showCatModal = false" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '../../api';

const categories = ref<any[]>([]);
const items = ref<any[]>([]);
const activeCategory = ref<number | null>(null);
const showItemModal = ref(false);
const showCatModal = ref(false);
const editingItem = ref<any>(null);
const editingCat = ref<any>(null);

const itemForm = ref({ name: '', description: '', price: 0 as number, cost: 0 as number, categoryId: '' as any, preparationTime: 0, available: true, image: '' });
const catForm = ref({ name: '', description: '', icon: '', image: '' });

const filteredItems = computed(() => !activeCategory.value ? items.value : items.value.filter(i => i.category?.id === activeCategory.value));

async function loadData() {
  const [cRes, iRes] = await Promise.all([api.get('/restaurant/categories'), api.get('/restaurant/menu')]);
  categories.value = cRes.data;
  items.value = iRes.data;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(file);
  });
}

async function handleItemImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) itemForm.value.image = await fileToBase64(file);
}

async function handleCatImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) catForm.value.image = await fileToBase64(file);
}

function openAddItem() {
  editingItem.value = null;
  itemForm.value = { name: '', description: '', price: 0, cost: 0, categoryId: '', preparationTime: 0, available: true, image: '' };
  showItemModal.value = true;
}
function openEditItem(i: any) {
  editingItem.value = i;
  itemForm.value = { name: i.name, description: i.description || '', price: i.price, cost: i.cost || 0, categoryId: i.category?.id || '', preparationTime: i.preparationTime || 0, available: i.available, image: i.image || '' };
  showItemModal.value = true;
}
function openAddCat() {
  editingCat.value = null;
  catForm.value = { name: '', description: '', icon: '', image: '' };
  showCatModal.value = true;
}
function openEditCat(c: any) {
  editingCat.value = c;
  catForm.value = { name: c.name, description: c.description || '', icon: c.icon || '', image: c.image || '' };
  showCatModal.value = true;
}

async function saveItem() {
  const body: any = { ...itemForm.value };
  if (body.categoryId) body.category = { id: body.categoryId };
  delete body.categoryId;
  if (!body.image) delete body.image;
  if (editingItem.value) await api.patch(`/restaurant/menu/${editingItem.value.id}`, body);
  else await api.post('/restaurant/menu', body);
  showItemModal.value = false;
  await loadData();
}

async function saveCat() {
  const body: any = { ...catForm.value };
  if (!body.image) delete body.image;
  if (!body.icon) delete body.icon;
  if (editingCat.value) await api.patch(`/restaurant/categories/${editingCat.value.id}`, body);
  else await api.post('/restaurant/categories', body);
  showCatModal.value = false;
  await loadData();
}

async function removeItem(id: number) {
  if (!confirm('هل تريد حذف هذا الصنف؟')) return;
  await api.delete(`/restaurant/menu/${id}`);
  await loadData();
}

async function removeCat(id: number) {
  if (!confirm('هل تريد حذف هذا التصنيف؟ ستظل الأصناف المرتبطة به موجودة بدون تصنيف.')) return;
  await api.delete(`/restaurant/categories/${id}`);
  if (activeCategory.value === id) activeCategory.value = null;
  await loadData();
}

onMounted(loadData);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 7px;
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 8px;
}
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb #fff;
}
</style>
