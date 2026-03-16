<template>
  <div class="min-h-screen flex items-center justify-center px-4" style="background: linear-gradient(135deg, #1A2980, #26D0CE)">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-[#1A2980] to-[#26D0CE] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-network-wired text-white text-3xl"></i>
        </div>
        <h1 class="text-2xl font-bold text-secondary">ISP ERP System</h1>
        <p class="text-gray-400 text-sm mt-1">نظام إدارة شركة الإنترنت</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
        {{ error }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">
            <i class="fas fa-user ml-1"></i> البريد الإلكتروني أو اسم المستخدم
          </label>
          <input
            v-model="email"
            type="text"
            required
            placeholder="admin@company.com أو اسم المستخدم"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-600 mb-2">
            <i class="fas fa-lock ml-1"></i> كلمة المرور
          </label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPass ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
            />
            <button type="button" @click="showPass = !showPass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <i :class="showPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sign-in-alt"></i>
          {{ loading ? 'جاري الدخول...' : 'تسجيل الدخول' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const showPass = ref(false);
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push('/select-system');
  } catch (e: any) {
    error.value = e.response?.data?.message || 'خطأ في البريد الإلكتروني أو كلمة المرور';
  } finally {
    loading.value = false;
  }
}
</script>
