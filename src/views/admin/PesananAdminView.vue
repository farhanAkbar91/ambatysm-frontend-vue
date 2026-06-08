<template>
  <div class="bg-light min-vh-100">
    <nav class="navbar navbar-expand-lg bg-white py-3 shadow-sm">
      <div class="container-fluid d-flex justify-content-center align-items-center">
        <router-link to="/admin" class="navbar-brand m-0">
          <span class="text-uppercase font-italiana" style="letter-spacing: 2.5px; font-size: 26px; color: black;">Ambatysm</span>
        </router-link>
      </div>
    </nav>

    <main class="container mt-0 p-0" style="max-width: 600px;">
      <ul class="nav nav-pills nav-fill bg-white border-bottom font-b612">
        <li class="nav-item">
          <button :class="['nav-link rounded-0 text-dark py-3 fw-bold', { active: tab === 'proses' }]" style="font-size: 15px;" @click="tab = 'proses'">Diproses</button>
        </li>
        <li class="nav-item">
          <button :class="['nav-link rounded-0 text-secondary py-3', { active: tab === 'riwayat' }]" style="font-size: 15px;" @click="tab = 'riwayat'">Riwayat Pesanan</button>
        </li>
      </ul>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>

      <div class="pb-5 pt-2">
        <OrderList v-if="tab === 'proses'" :orders="aktif" :isAdmin="true" @update-status="updateStatus" />
        <OrderList v-else :orders="riwayat" :isAdmin="true" @update-status="updateStatus" />
      </div>
    </main>

    <AdminBottomNav />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminBottomNav from '../../components/AdminBottomNav.vue'
import OrderList from '../../components/OrderList.vue'
import { BASE_URL } from '../../composables/api'
import { useToast } from '../../composables/useToast'
import { useAuthStore } from '../../stores/auth'

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
  fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    // Admin likely fetches all orders, assuming /admin/orders or /orders with admin token
    // For now we'll fetch /orders
    const res = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' }
    })
    const data = await res.json()
    orders.value = data.data || data || []
  } catch {
    toast.error('Gagal', 'Gagal memuat pesanan.')
  } finally {
    loading.value = false
  }
}

async function updateStatus(orderId, newStatus) {
  try {
    // Assuming endpoint to update order status
    const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    })
    if (res.ok) {
      toast.success('Berhasil', 'Status pesanan diperbarui.')
      fetchOrders()
    } else {
      toast.error('Gagal', 'Gagal memperbarui status pesanan.')
    }
  } catch (error) {
    toast.error('Gagal', 'Terjadi kesalahan jaringan.')
  }
}
</script>