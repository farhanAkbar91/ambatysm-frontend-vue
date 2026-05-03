<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid px-4 d-flex justify-content-between align-items-center">
        <router-link to="/" class="text-dark text-decoration-none d-flex align-items-center gap-2">
          <i class="bi bi-arrow-left fs-3"></i>
          <span class="d-none d-md-inline" style="font-size:15px;">Back</span>
        </router-link>
        <router-link to="/" class="brand-logo-ambatysm position-absolute top-50 start-50 translate-middle">AMBATYSM</router-link>
      </div>
    </nav>

    <main class="auth-page py-5">
      <h1 class="auth-page__title text-center">MASUK</h1>
      <p class="auth-page__subtitle text-center">Silahkan masukkan e-mail dan kata sandi anda:</p>

      <div class="auth-card mx-auto" style="max-width:400px;">
        <div v-if="errorMsg" class="alert alert-danger text-center" style="font-size:14px;padding:10px;">{{ errorMsg }}</div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="form-group mb-3">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" v-model="email" class="form-control" placeholder="Email" required>
          </div>
          <div class="form-group mb-4">
            <label for="loginPassword">Kata sandi</label>
            <div class="password-wrapper">
              <input :type="showPass ? 'text' : 'password'" id="loginPassword" v-model="password" class="form-control" placeholder="Kata sandi" required>
              <a class="form-group__forgot d-block text-end mt-1" style="cursor:pointer;font-size:12px;" @click="toast.info('Reset Password', 'Fitur reset password akan segera hadir!')">Lupa kata sandi?</a>
            </div>
          </div>
          <button type="submit" class="btn-primary" :class="{ loading: isLoading }" :disabled="isLoading">
            <span class="btn-text">{{ isLoading ? 'MEMPROSES...' : 'MASUK' }}</span>
          </button>
        </form>

        <div class="auth-switch text-center mt-3">
          Belum punya akun Ambatysm? <router-link to="/register">Daftar</router-link>
        </div>
      </div>

      <div class="social-divider text-center my-4">Atau Masuk Dengan</div>
      <div class="social-buttons">
        <button class="btn-social btn-social--facebook" @click="toast.info('Facebook', 'Daftar dengan Facebook akan segera tersedia!')">
          <svg class="btn-social__icon" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Daftar Dengan Facebook
        </button>
        <button class="btn-social btn-social--google" @click="toast.info('Google', 'Login dengan Google sedang dalam tahap pengembangan!')">
          <svg class="btn-social__icon" width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Daftar Dengan Google
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value.trim(), password: password.value, device_name: 'web_browser' })
    })
    const result = await res.json()
    if (res.ok) {
      auth.setToken(result.token)
      toast.success('Berhasil!', 'Login sukses. Memuat rute...')
      const user = await auth.fetchUser()
      setTimeout(() => {
        router.push(user?.role === 'admin' ? '/admin' : '/home')
      }, 1000)
    } else {
      errorMsg.value = result.message || 'Email atau kata sandi salah.'
      toast.error('Gagal Masuk', errorMsg.value)
    }
  } catch {
    errorMsg.value = 'Gagal terhubung ke server backend.'
    toast.error('Error', errorMsg.value)
  } finally {
    isLoading.value = false
  }
}
</script>
