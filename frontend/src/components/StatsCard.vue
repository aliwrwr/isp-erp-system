<template>
  <div class="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-gray-400 mb-1">{{ title }}</p>
        <p class="text-2xl font-bold text-secondary">{{ value }}</p>
        <p v-if="subtitle" class="text-xs mt-1" :class="subtitleColor">{{ subtitle }}</p>
      </div>
      <div class="w-12 h-12 rounded-xl flex items-center justify-center" :style="{ backgroundColor: color + '15' }">
        <i :class="icon" class="text-xl" :style="{ color }"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
  subtitleColor?: string;
}>();
</script>
