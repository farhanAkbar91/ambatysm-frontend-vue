<template>
  <div class="bg-light min-vh-100">
    <div class="shop-header sticky-top">
      <router-link to="/admin/pesanan" class="shop-header__btn"><i class="bi bi-arrow-left"></i></router-link>
      <h1 class="shop-header__title">DETAIL PESANAN (ADMIN)</h1>
      <div style="width:40px;"></div>
    </div>

    <main class="container mt-0 p-0" style="max-width:600px;">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>
      
      <div v-else-if="!order" class="text-center py-5">
        <p class="text-muted">Pesanan tidak ditemukan.</p>
        <router-link to="/admin/pesanan" class="btn btn-dark btn-sm rounded-0 font-b612">Kembali</router-link>
      </div>

      <div v-else class="pb-5">
        <!-- Admin Status Update Actions -->
        <div class="bg-white p-3 mb-2 shadow-sm font-b612 border-bottom border-dark border-3">
          <h6 class="fw-bold mb-3" style="font-size:14px;"><i class="bi bi-sliders"></i> Kelola Status Pesanan</h6>
          <div class="d-flex gap-2">
            <select v-model="selectedStatus" class="form-select form-select-sm rounded-0" style="font-size: 13px;">
              <option value="pending">Pending (Menunggu Pembayaran)</option>
              <option value="waiting_confirmation">Waiting Confirmation</option>
              <option value="paid">Paid (Sudah Dibayar)</option>
              <option value="processing">Processing (Sedang Diproses)</option>
              <option value="shipped">Shipped (Sedang Dikirim)</option>
              <option value="completed">Completed (Selesai)</option>
              <option value="cancelled">Cancelled (Dibatalkan)</option>
            </select>
            <button class="btn btn-dark btn-sm rounded-0" style="font-size: 13px;" @click="updateStatus">
              Simpan
            </button>
          </div>
        </div>

        <!-- Status Tracker -->
        <div class="bg-white p-4 mb-2 shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="font-b612 text-secondary" style="font-size:13px;">Status Pesanan Saat Ini</span>
            <span :class="`badge ${badgeClass(order.status)}`" style="letter-spacing:1px;font-size:11px;">
              {{ order.status.toUpperCase() }}
            </span>
          </div>
          
          <div class="timeline-tracker mt-4">
            <div class="timeline-step" :class="{ active: stepIndex >= 0 }">
              <div class="timeline-icon"><i class="bi bi-wallet2"></i></div>
              <div class="timeline-label">Pending</div>
            </div>
            <div class="timeline-line" :class="{ active: stepIndex >= 1 }"></div>
            
            <div class="timeline-step" :class="{ active: stepIndex >= 1 }">
              <div class="timeline-icon"><i class="bi bi-check-circle"></i></div>
              <div class="timeline-label">Dibayar</div>
            </div>
            <div class="timeline-line" :class="{ active: stepIndex >= 2 }"></div>
            
            <div class="timeline-step" :class="{ active: stepIndex >= 2 }">
              <div class="timeline-icon"><i class="bi bi-box-seam"></i></div>
              <div class="timeline-label">Diproses</div>
            </div>
            <div class="timeline-line" :class="{ active: stepIndex >= 3 }"></div>
            
            <div class="timeline-step" :class="{ active: stepIndex >= 3 }">
              <div class="timeline-icon"><i class="bi bi-truck"></i></div>
              <div class="timeline-label">Dikirim</div>
            </div>
            <div class="timeline-line" :class="{ active: stepIndex >= 4 }"></div>
            
            <div class="timeline-step" :class="{ active: stepIndex >= 4 }">
              <div class="timeline-icon"><i class="bi bi-house-check"></i></div>
              <div class="timeline-label">Selesai</div>
            </div>
          </div>
        </div>

        <!-- Order Info -->
        <div class="bg-white p-3 mb-2 shadow-sm font-b612">
          <h6 class="fw-bold mb-3" style="font-size:14px;"><i class="bi bi-receipt"></i> Informasi Pesanan</h6>
          <div class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">No. Pesanan</span>
            <span class="fw-bold">#{{ order.id }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">Tanggal Pembelian</span>
            <span>{{ formatDate(order.created_at) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">Kurir</span>
            <span>{{ order.courier ? order.courier.toUpperCase() : '-' }}</span>
          </div>
          <div v-if="order.tracking_number" class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">No. Resi</span>
            <span class="fw-bold text-primary">{{ order.tracking_number }}</span>
          </div>
        </div>

        <!-- Address Info -->
        <div v-if="order.shipping_address" class="bg-white p-3 mb-2 shadow-sm font-b612">
          <h6 class="fw-bold mb-2" style="font-size:14px;"><i class="bi bi-geo-alt"></i> Alamat Pengiriman</h6>
          <p class="mb-0 text-secondary" style="font-size:13px;line-height:1.6;">
            {{ order.shipping_address }}
          </p>
        </div>

        <!-- Products List -->
        <div class="bg-white p-3 mb-2 shadow-sm">
          <h6 class="fw-bold mb-3 font-b612" style="font-size:14px;"><i class="bi bi-bag-check"></i> Daftar Produk</h6>
          <div v-for="item in (order.items || [])" :key="item.id" class="d-flex gap-3 mb-3 pb-3 border-bottom">
            <img :src="getImageUrl(item.product?.image || item.image)" style="width:60px;height:75px;object-fit:cover;border-radius:6px;border:1px solid #eee;">
            <div class="flex-grow-1 font-b612">
              <p class="mb-1 fw-bold" style="font-size:14px;">{{ item.product?.name || item.name || 'Produk' }}</p>
              
              <!-- Size and Color Display -->
              <div v-if="item.size || item.color" class="d-flex align-items-center gap-2 mb-1" style="font-size:12px;color:#666;">
                <span v-if="item.size">Size: {{ item.size }}</span>
                <span v-if="item.size && item.color">|</span>
                <span v-if="item.color" class="d-flex align-items-center gap-1">
                  Warna: <span :style="{ backgroundColor: getColorCss(item.color), width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }"></span>
                  <span class="text-uppercase ms-1" style="font-size: 11px;">({{ item.color }})</span>
                </span>
              </div>
              
              <p class="mb-0 text-muted" style="font-size:12px;">{{ item.quantity }} x {{ formatRupiah(item.price || item.product?.price || 0) }}</p>
            </div>
            <div class="fw-bold font-b612" style="font-size:13px;">
              {{ formatRupiah((item.price || item.product?.price || 0) * item.quantity) }}
            </div>
          </div>
        </div>

        <!-- Payment Summary -->
        <div class="bg-white p-3 shadow-sm font-b612">
          <h6 class="fw-bold mb-3" style="font-size:14px;"><i class="bi bi-cash-coin"></i> Rincian Pembayaran</h6>
          <div class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">Subtotal Produk</span>
            <span>{{ formatRupiah(calcSubtotal(order)) }}</span>
          </div>
          <div class="d-flex justify-content-between mb-2" style="font-size:13px;">
            <span class="text-secondary">Ongkos Kirim</span>
            <span>{{ formatRupiah(order.shipping_cost || 0) }}</span>
          </div>
          <hr class="my-2 text-muted">
          <div class="d-flex justify-content-between mt-2">
            <span class="fw-bold" style="font-size:14px;">Total Belanja</span>
            <span class="fw-bold text-danger" style="font-size:15px;">{{ formatRupiah(calcTotal(order)) }}</span>
          </div>
        </div>

        <!-- Review Section (Read Only for Admin) -->
        <div v-if="order.review" class="bg-white p-3 mt-2 shadow-sm font-b612">
          <h6 class="fw-bold mb-3" style="font-size:14px;"><i class="bi bi-star"></i> Ulasan dari Customer</h6>
          <div class="d-flex align-items-center mb-2">
            <i v-for="n in 5" :key="n" class="bi" :class="n <= order.review.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'" style="font-size:16px;margin-right:2px;"></i>
          </div>
          <p class="mb-0 text-secondary" style="font-size:13px;">{{ order.review.comment || 'Tidak ada komentar' }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BASE_URL, getImageUrl, formatRupiah } from '../../composables/api'
import { useToast } from '../../composables/useToast'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const order = ref(null)
const loading = ref(true)
const selectedStatus = ref('')

const stepIndex = computed(() => {
  if (!order.value) return -1
  const s = order.value.status.toLowerCase()
  if (s === 'cancelled') return -1
  if (s === 'completed') return 4
  if (s === 'shipped') return 3
  if (s === 'processing') return 2
  if (s === 'paid') return 1
  return 0 // pending
})

onMounted(async () => {
  if (!auth.token || auth.user?.role !== 'admin') { 
    router.push('/login'); 
    return 
  }
  fetchOrderDetail()
})

async function fetchOrderDetail() {
  loading.value = true
  const id = route.params.id
  try {
    // Admin fetches all orders
    const res = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' }
    })
    const data = await res.json()
    const orders = data.data || data
    order.value = orders.find(o => o.id == id)
    if (order.value) {
        selectedStatus.value = order.value.status
    }
  } catch { 
    toast.error('Gagal', 'Gagal memuat detail pesanan.') 
  } finally { 
    loading.value = false 
  }
}

async function updateStatus() {
  if (!order.value || !selectedStatus.value) return
  
  try {
    const res = await fetch(`${BASE_URL}/admin/orders/${order.value.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json'
      },
      body: JSON.stringify({ status: selectedStatus.value })
    })
    
    if (res.ok) {
      toast.success('Berhasil', 'Status pesanan berhasil diperbarui.')
      order.value.status = selectedStatus.value
    } else {
      const data = await res.json()
      toast.error('Gagal', data.message || 'Gagal memperbarui status pesanan.')
    }
  } catch (error) {
    toast.error('Gagal', 'Terjadi kesalahan jaringan.')
  }
}

function formatDate(dt) {
  if (!dt) return '-'
  return new Date(dt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })
}

function badgeClass(status) {
  const s = status.toLowerCase()
  if (s === 'paid' || s === 'completed' || s === 'shipped') return 'bg-success'
  if (s === 'cancelled') return 'bg-danger'
  if (s === 'pending') return 'bg-warning text-dark'
  return 'bg-primary'
}

function calcSubtotal(orderData) {
  if (!orderData.items) return 0
  return orderData.items.reduce((s, i) => {
    const p = i.price || i.product?.price || 0
    return s + (p * i.quantity)
  }, 0)
}

function calcTotal(orderData) {
  let total = orderData.total_amount || orderData.total_price || 0
  if (total === 0) {
    total = calcSubtotal(orderData) + (orderData.shipping_cost || 0)
  }
  return total
}

function getColorCss(colorName) {
  const map = {
    'hitam': '#111111',
    'putih': '#ffffff',
    'abu-abu': '#888888',
    'merah': '#b12a2a',
    'biru': '#1d4ed8',
    'hijau': '#15803d',
    'kuning': '#eab308',
    'default': '#cccccc'
  }
  const key = String(colorName).toLowerCase();
  return map[key] || key;
}
</script>

<style scoped>
.timeline-tracker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
}
.timeline-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}
.timeline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f1f1f1;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 8px;
  transition: all 0.3s;
}
.timeline-label {
  font-size: 10px;
  color: #aaa;
  font-family: 'B612', sans-serif;
  text-align: center;
}
.timeline-step.active .timeline-icon {
  background-color: #222;
  color: #fff;
  box-shadow: 0 0 0 3px rgba(34,34,34,0.2);
}
.timeline-step.active .timeline-label {
  color: #222;
  font-weight: bold;
}
.timeline-line {
  flex: 1;
  height: 2px;
  background-color: #f1f1f1;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
  min-width: 15px;
}
.timeline-line.active {
  background-color: #222;
}
</style>
