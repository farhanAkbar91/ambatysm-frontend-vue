<template>
  <div>
    <div class="shop-header">
      <router-link to="/home" class="shop-header__btn"><i class="bi bi-x-lg"></i></router-link>
      <h1 class="shop-header__title">KERANJANG BELANJA</h1>
      <router-link to="/category" class="shop-header__btn"><i class="bi bi-search"></i></router-link>
    </div>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border text-dark" role="status"></div>
      <p class="mt-2 text-muted">Memuat keranjang Anda...</p>
    </div>

    <!-- Cart Items -->
    <div class="cart-container" v-if="!loading && items.length > 0">
      <div v-for="(item, i) in items" :key="item.id" class="cart-item" :data-index="i">
        <div class="cart-item__checkbox">
          <input type="checkbox" :id="`check${i}`" v-model="item.checked">
        </div>
        <div class="cart-item__image">
          <img :src="getImageUrl(item.product.image)" :alt="item.product.name">
        </div>
        <div class="cart-item__details">
          <p class="cart-item__name mb-1" style="font-size:14px;font-weight:600;">{{ item.product.name }}</p>
          <div v-if="item.size || item.color" class="d-flex align-items-center gap-2 mb-1" style="font-size:12px;color:#666;">
            <span v-if="item.size">Size: {{ item.size }}</span>
            <span v-if="item.size && item.color">|</span>
            <span v-if="item.color" class="d-flex align-items-center gap-1">
              Warna: <span :style="{ backgroundColor: item.color, width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }"></span>
            </span>
          </div>
          <p class="cart-item__price">{{ formatRupiah(item.product.price) }}</p>
          <button class="btn btn-sm text-danger mt-2 p-0" @click="removeItem(item.id, i)" style="font-size:12px;font-family:'B612',sans-serif;">
            <i class="bi bi-trash"></i> Hapus
          </button>
        </div>
        <div class="cart-item__right d-flex flex-column align-items-end justify-content-between">
          <div class="cart-item__qty d-flex align-items-center gap-2 mb-2">
            <button class="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center" style="width:24px;height:24px;padding:0;" @click="updateQty(i, -1)">
              <i class="bi bi-dash"></i>
            </button>
            <span class="cart-item__qty-value border bg-light text-center" style="width:30px;font-size:13px;">{{ item.quantity }}</span>
            <button class="btn btn-sm btn-outline-dark d-flex align-items-center justify-content-center" style="width:24px;height:24px;padding:0;" @click="updateQty(i, 1)">
              <i class="bi bi-plus"></i>
            </button>
          </div>
          <span class="cart-item__subtotal fw-bold" style="font-size:14px;">{{ formatRupiah(item.product.price * item.quantity) }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div class="cart-empty" v-if="!loading && items.length === 0">
      <i class="bi bi-cart-x"></i>
      <h3>Keranjang Kosong</h3>
      <p>Belum ada produk di keranjang belanja kamu</p>
      <router-link to="/home" class="cart-empty__btn">Mulai Belanja</router-link>
    </div>

    <!-- Bottom Bar -->
    <div class="cart-bottom" v-if="!loading && items.length > 0">
      <div class="cart-bottom__total">
        <span class="cart-bottom__label">TOTAL :</span>
        <span class="cart-bottom__price">{{ formatRupiah(total) }}</span>
      </div>
      <a href="#" class="cart-bottom__checkout" @click.prevent="goToCheckout">CHECKOUT</a>
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

const items = ref([])
const loading = ref(true)

const total = computed(() =>
  items.value.filter(i => i.checked).reduce((sum, i) => sum + i.product.price * i.quantity, 0)
)

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  items.value = await fetchCart()
  loading.value = false
})

async function fetchCart() {
  try {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` }
    })
    if (res.status === 401) { auth.logout(); router.push('/login'); return [] }
    const data = await res.json()
    return (data.data || []).map(i => ({ ...i, checked: true }))
  } catch { return [] }
}

async function updateQty(index, change) {
  const item = items.value[index]
  const newQty = item.quantity + change
  if (newQty < 1) return
  if (item.product.stock && newQty > item.product.stock) {
    toast.info('Stok Terbatas', `Maksimal ${item.product.stock} pcs.`)
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/update/${item.id}`, {
      method: 'PUT',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ quantity: newQty })
    })
    if (res.ok) item.quantity = newQty
    else toast.error('Gagal', 'Gagal mengupdate jumlah.')
  } catch { toast.error('Error', 'Terjadi kesalahan jaringan.') }
}

async function removeItem(cartId, index) {
  try {
    const res = await fetch(`${BASE_URL}/cart/remove/${cartId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` }
    })
    if (res.ok) {
      toast.success('Berhasil', 'Produk dihapus dari keranjang.')
      items.value.splice(index, 1)
    }
  } catch { toast.error('Gagal', 'Terjadi kesalahan saat menghapus.') }
}

function goToCheckout() {
  const selected = items.value.filter(i => i.checked)
  if (selected.length === 0) { alert('Pilih minimal 1 produk untuk checkout.'); return }
  localStorage.setItem('ambatysm_checkout', JSON.stringify(selected))
  router.push('/checkout')
}
</script>
