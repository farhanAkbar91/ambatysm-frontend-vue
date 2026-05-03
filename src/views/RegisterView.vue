<template>
  <div>
    <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid px-4 d-flex justify-content-between align-items-center position-relative">
        <router-link to="/login" class="text-dark text-decoration-none d-flex align-items-center gap-2">
          <i class="bi bi-arrow-left fs-3"></i>
          <span class="d-none d-md-inline" style="font-size:15px;">Back</span>
        </router-link>
        <router-link to="/" class="brand-logo-ambatysm position-absolute top-50 start-50 translate-middle">AMBATYSM</router-link>
      </div>
    </nav>

    <main class="auth-page mt-4">
      <h1 class="auth-page__title">REGISTER</h1>
      <p class="auth-page__subtitle">Please fill in the information below:</p>

      <div class="auth-card">
        <form @submit.prevent="handleRegister" novalidate>
          <div class="form-group mb-3">
            <label for="regFullName">Nama Lengkap</label>
            <input type="text" id="regFullName" v-model="name" placeholder="Nama Lengkap" required>
          </div>
          <div class="form-group mb-3">
            <label for="regEmail">Email</label>
            <input type="email" id="regEmail" v-model="email" placeholder="Email" required>
          </div>
          <div class="form-group mb-3">
            <label for="regPassword">Password</label>
            <div class="password-wrapper">
              <input type="password" id="regPassword" v-model="password" placeholder="Password" required>
            </div>
          </div>
          <button type="submit" class="btn-primary" :class="{ loading: isLoading }" :disabled="isLoading">
            <span class="btn-text">{{ isLoading ? 'MEMPROSES...' : 'BUAT AKUN SAYA' }}</span>
          </button>
        </form>

        <div class="auth-switch">
          Sudah punya akun Ambatysm? <router-link to="/login">Masuk</router-link>
        </div>
      </div>

      <div class="social-divider">Atau daftar dengan</div>
      <div class="social-buttons">
        <button class="btn-social btn-social--facebook" @click="toast.info('Facebook', 'Segera hadir!')">
          <svg class="btn-social__icon" width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Daftar Dengan Facebook
        </button>
        <button class="btn-social btn-social--google" @click="toast.info('Google', 'Segera hadir!')">
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
import { BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'

const router = useRouter()
const toast = useToast()

const name = ref('')
const email = ref('')
const password = ref('')
const isLoading = ref(false)

async function handleRegister() {
  isLoading.value = true
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), email: email.value.trim(), password: password.value })
    })
    const result = await res.json()
    if (res.ok) {
      toast.success('Berhasil!', 'Akun terdaftar, silakan login.')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      toast.error('Gagal', result.message || 'Cek kembali data Anda.')
    }
  } catch {
    toast.error('Error', 'Gagal terhubung ke server backend.')
  } finally {
    isLoading.value = false
  }
}
</script>
