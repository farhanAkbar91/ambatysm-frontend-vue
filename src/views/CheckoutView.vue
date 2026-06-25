<template>
  <div>
    <div class="shop-header">
      <router-link to="/cart" class="shop-header__btn"><i class="bi bi-arrow-left"></i></router-link>
      <h1 class="shop-header__title">CHECKOUT</h1>
      <div style="width:40px;"></div>
    </div>

    <div class="checkout-container">
      <!-- Address -->
      <div class="checkout-section checkout-recipient">
        <div class="checkout-recipient__header">
          <i class="bi bi-geo-alt-fill checkout-recipient__icon"></i>
          <span class="checkout-recipient__label">Penerima & Alamat</span>
        </div>
        <div class="checkout-recipient__details">
          <input type="text" v-model="address" class="form-control mb-2" placeholder="Masukkan Alamat Lengkap" required style="font-family:'B612',sans-serif;font-size:14px;">
          <select v-model="selectedProvince" class="form-select mb-2" style="font-family:'B612',sans-serif;font-size:14px;" @change="onProvinceChange">
            <option value="">-- Pilih Provinsi Tujuan --</option>
            <option v-for="prov in provinces" :key="prov.id" :value="prov.id">
              {{ prov.name }}
            </option>
          </select>
          <select v-model="selectedCity" class="form-select" style="font-family:'B612',sans-serif;font-size:14px;" :disabled="!selectedProvince" @change="checkShipping">
            <option value="">-- Pilih Kota/Kabupaten Tujuan --</option>
            <option v-for="city in cities" :key="city.city_id" :value="city.city_id">
              {{ city.type }} {{ city.city_name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Products -->
      <div v-if="loadingItems" class="text-center py-4">
        <div class="spinner-border text-secondary" role="status" style="width:1.5rem;height:1.5rem;"></div>
        <p class="mt-2 text-muted" style="font-size:13px;">Memvalidasi harga dan stok terbaru...</p>
      </div>
      <div v-else>
        <div v-for="item in checkoutItems" :key="item.id" class="checkout-product px-3 py-2 border-bottom">
          <div class="d-flex gap-3">
            <img :src="getImageUrl(item.product.image)" style="width:60px;height:75px;object-fit:cover;border-radius:6px;">
            <div class="flex-grow-1">
              <p class="mb-1 fw-bold" style="font-size:14px;">{{ item.product.name }}</p>
              <div v-if="item.size || item.color" class="d-flex align-items-center gap-2 mb-1" style="font-size:12px;color:#666;">
                <span v-if="item.size">Size: {{ item.size }}</span>
                <span v-if="item.size && item.color">|</span>
                <span v-if="item.color" class="d-flex align-items-center gap-1">
                  Warna: <span :style="{ backgroundColor: getColorCss(item.color), width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }"></span>
                  <span class="text-uppercase ms-1" style="font-size: 11px;">({{ item.color }})</span>
                </span>
              </div>
              <p class="mb-0 text-muted" style="font-size:13px;">{{ formatRupiah(item.product.price) }} x {{ item.quantity }}</p>
            </div>
            <div class="fw-bold" style="font-size:14px;">{{ formatRupiah(item.product.price * item.quantity) }}</div>
          </div>
        </div>
      </div>

      <!-- Custom Design -->
      <div v-if="hasCustomProduct" class="checkout-section">
        <h3 class="checkout-section__title">Design Custom:</h3>
        <p class="text-muted mb-2" style="font-size:13px;">Silakan unggah desain Anda (format .png, maks 10MB).</p>
        <input type="file" class="form-control" ref="customFileRef" accept="image/png" style="font-family:'B612',sans-serif;font-size:14px;">
      </div>

      <!-- Message -->
      <div class="checkout-section">
        <h3 class="checkout-section__title">Pesan untuk Penjual:</h3>
        <input type="text" class="checkout-message-input" v-model="sellerMessage" placeholder="Tulis pesan (opsional)...">
      </div>

      <!-- Shipping -->
      <div class="checkout-section">
        <h3 class="checkout-section__title">Opsi Pengiriman:</h3>
        <div class="checkout-shipping">
          <p v-if="!selectedCity" class="text-muted mb-0" style="font-size:13px;"><i class="bi bi-info-circle"></i> Pilih kota tujuan untuk melihat ongkos kirim.</p>
          <p v-else-if="loadingShipping" class="text-muted mb-0"><i class="bi bi-hourglass-split"></i> Menghitung ongkos kirim...</p>
          <p v-else-if="shippingOptions.length === 0" class="text-danger mb-0">Kurir tidak tersedia ke kota ini.</p>
          <label v-for="(opt, i) in shippingOptions" :key="i" class="checkout-shipping__option mt-2 d-block">
            <input type="radio" name="shipping" :value="opt.price" v-model="selectedShipping" @change="updateTotals">
            <div :class="['checkout-shipping__card', { 'checkout-shipping__card--active': selectedShipping == opt.price }]">
              <div class="checkout-shipping__info">
                <span class="checkout-shipping__name">{{ opt.label }} (Estimasi: {{ opt.etd }} Hari)</span>
              </div>
              <span class="checkout-shipping__price text-danger">{{ formatRupiah(opt.price) }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="checkout-section">
        <h3 class="checkout-section__title">Metode Pembayaran</h3>
        <div class="checkout-payment-methods">
          <label v-for="m in paymentMethods" :key="m" class="checkout-payment__option">
            <input type="radio" name="payment" :value="m" v-model="selectedPayment">
            <div class="checkout-payment__card">
              <span class="checkout-payment__name">{{ m }}</span>
              <span class="checkout-payment__check"><i class="bi bi-check-lg"></i></span>
            </div>
          </label>
        </div>
      </div>

      <!-- Summary -->
      <div class="checkout-section checkout-summary">
        <h3 class="checkout-section__title">Detail Pembayaran</h3>
        <div class="checkout-summary__row">
          <span>Subtotal Pesanan</span>
          <span>{{ formatRupiah(subtotal) }}</span>
        </div>
        <div class="checkout-summary__row">
          <span>Subtotal Pengiriman</span>
          <span>{{ formatRupiah(shippingCost) }}</span>
        </div>
        <div class="checkout-summary__divider"></div>
        <div class="checkout-summary__row checkout-summary__row--total">
          <span>Total Pembayaran</span>
          <span>{{ formatRupiah(grandTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="cart-bottom">
      <div class="cart-bottom__total">
        <span class="cart-bottom__label">TOTAL :</span>
        <span class="cart-bottom__price">{{ formatRupiah(grandTotal) }}</span>
      </div>
      <a href="#" class="cart-bottom__checkout cart-bottom__checkout--order" @click.prevent="submitOrder" :style="{ opacity: submitting ? 0.7 : 1 }">
        {{ submitting ? 'MEMPROSES...' : 'BUAT PESANAN' }}
      </a>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppFooter from '../components/AppFooter.vue'
import { getImageUrl, formatRupiah, BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const address = ref('')
const selectedProvince = ref('')
const selectedCity = ref('')
const provinces = ref([])
const cities = ref([])
const shippingOptions = ref([])
const selectedShipping = ref(null)
const selectedPayment = ref('QRIS')
const sellerMessage = ref('')
const checkoutItems = ref([])
const loadingItems = ref(true)
const loadingShipping = ref(false)
const submitting = ref(false)
const customFileRef = ref(null)

const paymentMethods = ['QRIS', 'COD', 'Transfer Bank', 'E-Wallet']

const subtotal = computed(() => checkoutItems.value.reduce((s, i) => s + i.product.price * i.quantity, 0))
const shippingCost = computed(() => selectedShipping.value ? Number(selectedShipping.value) : 0)
const grandTotal = computed(() => subtotal.value + shippingCost.value)

const hasCustomProduct = computed(() =>
  checkoutItems.value.some(i =>
    (i.product.category?.toLowerCase() === 'custom') || i.product.name?.toLowerCase().includes('custom')
  )
)

onMounted(async () => {
  const saved = localStorage.getItem('ambatysm_checkout')
  const localItems = saved ? JSON.parse(saved) : []
  if (localItems.length === 0) { router.push('/cart'); return }

  // Validate with fresh cart
  const freshCart = await fetchFreshCart()
  checkoutItems.value = localItems.map(li => freshCart.find(fc => fc.id === li.id)).filter(Boolean)
  if (checkoutItems.value.length === 0) { toast.error('Keranjang Berubah', 'Produk tidak tersedia.'); router.push('/cart'); return }

  loadingItems.value = false
  await loadProvinces()
})

async function fetchFreshCart() {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` }
    })
    const data = await res.json()
    return data.data || []
  } catch { return [] }
}

async function loadProvinces() {
  try {
    const res = await fetch(`${BASE_URL}/shipping/provinces`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const data = await res.json()
    if (data.data) provinces.value = data.data
  } catch {}
}

async function loadCities(provinceId) {
  try {
    const url = provinceId
      ? `${BASE_URL}/shipping/cities?province_id=${provinceId}`
      : `${BASE_URL}/shipping/cities`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${auth.token}` }
    })
    const data = await res.json()
    if (data.data) cities.value = data.data
  } catch {}
}

async function onProvinceChange() {
  selectedCity.value = ''
  cities.value = []
  shippingOptions.value = []
  selectedShipping.value = null
  if (selectedProvince.value) {
    await loadCities(selectedProvince.value)
  }
}

async function checkShipping() {
  if (!selectedCity.value) { shippingOptions.value = []; return }
  loadingShipping.value = true
  try {
    const res = await fetch(`${BASE_URL}/shipping/cost`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ destination: selectedCity.value, weight: 1000, courier: 'jne' })
    })
    const data = await res.json()
    const costs = data.rajaongkir?.results?.[0]?.costs || []
    shippingOptions.value = costs.map(c => ({
      label: `JNE ${c.service}`,
      price: c.cost[0].value,
      etd: c.cost[0].etd
    }))
    if (shippingOptions.value.length > 0) selectedShipping.value = shippingOptions.value[0].price
  } catch { shippingOptions.value = [] }
  finally { loadingShipping.value = false }
}

function updateTotals() {}

async function submitOrder() {
  if (!address.value || !selectedCity.value) { toast.error('Peringatan', 'Isi alamat dan pilih kota!'); return }
  if (hasCustomProduct.value && customFileRef.value?.files.length === 0) {
    toast.error('Peringatan', 'Harap unggah desain custom Anda!'); return
  }

  submitting.value = true
  localStorage.setItem('ambatysm_payment_total', grandTotal.value.toString())
  localStorage.setItem('ambatysm_payment_method', selectedPayment.value)

  const formData = new FormData()
  formData.append('shipping_address', address.value)
  formData.append('city_id', selectedCity.value)
  formData.append('courier', `JNE`)
  formData.append('shipping_cost', shippingCost.value)
  formData.append('message', sellerMessage.value)
  if (hasCustomProduct.value && customFileRef.value?.files[0]) {
    formData.append('custom_design', customFileRef.value.files[0])
  }

  try {
    const res = await fetch(`${BASE_URL}/checkout`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
      body: formData
    })
    const responseText = await res.text()
    const jsonStart = responseText.indexOf('{')
    const cleanText = jsonStart !== -1 ? responseText.substring(jsonStart) : responseText

    let result = {}
    try {
      result = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Response is not valid JSON:', responseText)
      toast.error('Server Error', `Server returned invalid JSON (Status ${res.status}).`)
      return
    }

    if (res.ok) {
      toast.success('Berhasil!', 'Pesanan berhasil dibuat!')
      localStorage.removeItem('ambatysm_checkout')
      setTimeout(() => router.push('/payment'), 1500)
    } else {
      toast.error('Checkout Gagal', result.message || 'Cek kembali data pesanan.')
    }
  } catch (error) {
    console.error('Checkout failed:', error)
    toast.error('Error', 'Terjadi kesalahan sistem: ' + error.message)
  }
  finally { submitting.value = false }
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
