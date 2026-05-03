<template>
  <div class="bg-light">
    <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid d-flex justify-content-center">
        <router-link to="/" class="brand-logo-ambatysm position-absolute top-50 start-50 translate-middle">AMBATYSM</router-link>
      </div>
    </nav>

    <main class="container mt-0 p-0" style="max-width:600px;">
      <ul class="nav nav-pills nav-fill bg-white border-bottom sticky-top font-b612" style="top:70px;z-index:99;">
        <li class="nav-item">
          <button :class="['nav-link rounded-0 text-dark py-3 fw-bold', { active: tab === 'proses' }]" style="font-size:15px;" @click="tab = 'proses'">Diproses</button>
        </li>
        <li class="nav-item">
          <button :class="['nav-link rounded-0 text-secondary py-3', { active: tab === 'riwayat' }]" style="font-size:15px;" @click="tab = 'riwayat'">Riwayat Pesanan</button>
        </li>
      </ul>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>

      <div class="pb-5">
        <OrderList v-if="tab === 'proses'" :orders="aktif" />
        <OrderList v-else :orders="riwayat" />
      </div>
    </main>

    <BottomNav />
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import AppFooter from '../components/AppFooter.vue'
import OrderList from '../components/OrderList.vue'
import { BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()
const tab = ref('proses')
const loading = ref(true)
const orders = ref([])

const aktif = computed(() => orders.value.filter(o => o.status !== 'cancelled' && o.status !== 'completed'))
const riwayat = computed(() => orders.value.filter(o => o.status === 'cancelled' || o.status === 'completed'))

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  try {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' }
    })
    const data = await res.json()
    orders.value = data.data || data
  } catch { toast.error('Gagal', 'Gagal memuat pesanan.') }
  finally { loading.value = false }
})
</script>
