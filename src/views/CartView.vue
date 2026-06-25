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
              Warna: <span :style="{ backgroundColor: getColorCss(item.color), width: '12px', height: '12px', borderRadius: '50%', display: 'inline-block', border: '1px solid #ddd' }"></span>
              <span class="text-uppercase ms-1" style="font-size: 11px;">({{ item.color }})</span>
            </span>
          </div>
          <p class="cart-item__price">{{ formatRupiah(item.product.price) }}</p>
          <div class="d-flex gap-3">
            <button class="btn btn-sm text-secondary mt-2 p-0" @click="openEditModal(item)" style="font-size:12px;font-family:'B612',sans-serif;">
              <i class="bi bi-pencil-square"></i> Edit
            </button>
            <button class="btn btn-sm text-danger mt-2 p-0" @click="removeItem(item.id, i)" style="font-size:12px;font-family:'B612',sans-serif;">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </div>
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

    <!-- Edit Cart Item Modal -->
    <div v-if="showEditModal" class="modal-overlay d-flex align-items-center justify-content-center" @click.self="showEditModal = false">
      <div class="modal-card bg-white p-4 rounded shadow-lg border" style="width: 100%; max-width: 450px; position: relative; z-index: 1050; animation: fadeIn 0.3s ease;">
        <button class="btn-close position-absolute top-0 end-0 m-3" @click="showEditModal = false"></button>
        <h4 class="text-uppercase font-b612 fw-bold mb-4 text-center" style="font-size: 16px; letter-spacing: 1.5px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Ubah Pilihan</h4>
        
        <!-- Product Quick Info -->
        <div class="d-flex gap-3 mb-4 border-bottom pb-3">
          <img :src="getImageUrl(editForm.product.image)" class="rounded shadow-sm" style="width: 70px; height: 90px; object-fit: cover;">
          <div class="d-flex flex-column justify-content-center">
            <h5 class="font-b612 text-uppercase mb-1" style="font-size: 14px; font-weight: 600; color: #333;">{{ editForm.product.name }}</h5>
            <p class="text-secondary fw-medium mb-0" style="font-size: 13px;">{{ formatRupiah(editForm.product.price) }}</p>
          </div>
        </div>

        <!-- Color Options -->
        <div class="mb-3">
          <p style="font-size:12px;color:#555;margin-bottom:10px;">Pilihan Warna: <span class="fw-bold text-dark text-uppercase font-b612 ms-1">{{ editForm.color }}</span></p>
          <div class="d-flex gap-2 flex-wrap align-items-center">
            <div
              v-for="c in editSwatchColors"
              :key="c"
              class="filter-color-swatch"
              :class="{ active: editForm.color === c }"
              :style="{ backgroundColor: getColorCss(c), width:'24px', height:'24px', borderRadius:'50%', border:'1px solid #ccc', cursor:'pointer', boxShadow: editForm.color === c ? '0 0 0 2px #fff, 0 0 0 3px #111' : '' }"
              @click="editSelectColor(c)"
            ></div>
          </div>
        </div>

        <!-- Size Options -->
        <div class="mb-3">
          <p style="font-size:12px;color:#555;margin-bottom:10px;">Pilihan Ukuran:</p>
          <div class="d-flex gap-2 flex-wrap">
            <button
              v-for="sz in editAvailableSizes"
              :key="sz"
              class="btn btn-outline-secondary rounded-0 font-b612 btn-sm"
              :class="editForm.size === sz ? 'border-dark text-dark fw-bold' : 'text-muted'"
              :style="{ minWidth:'40px', height:'35px', fontSize:'12px', borderColor: editForm.size === sz ? '#222' : '#ddd' }"
              @click="editForm.size = sz"
            >{{ sz }}</button>
            <div v-if="!editAvailableSizes.length" class="text-danger small font-b612 mt-1">Stok untuk warna ini habis</div>
          </div>
        </div>

        <!-- Stock Info -->
        <div class="mb-3 font-b612" style="font-size: 12px; color: #555;">
          <span>Stok Tersedia: </span>
          <span class="fw-bold" :class="editVariantStock > 0 ? 'text-success' : 'text-danger'">
            {{ editVariantStock > 0 ? editVariantStock + ' pcs' : 'Habis' }}
          </span>
        </div>

        <!-- Quantity Options -->
        <div class="mb-4">
          <p style="font-size:12px;color:#555;margin-bottom:10px;">Jumlah:</p>
          <div>
            <div class="d-inline-flex align-items-center border" style="border-color:#ddd !important;">
              <button class="btn btn-sm text-muted rounded-0 border-0" style="width:35px;" @click="editForm.quantity > 1 && editForm.quantity--"><i class="bi bi-dash"></i></button>
              <input type="text" :value="editForm.quantity" class="form-control form-control-sm text-center border-0 rounded-0" style="width:40px; padding:0; height: 30px;" readonly>
              <button class="btn btn-sm text-muted rounded-0 border-0" style="width:35px;" @click="editForm.quantity < editVariantStock && editForm.quantity++"><i class="bi bi-plus"></i></button>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn btn-dark w-100 rounded-0 py-2 font-b612 mt-2" :disabled="editVariantStock <= 0 || editForm.quantity > editVariantStock" @click="saveCartItemEdit" style="font-size: 13px; letter-spacing: 1.5px; height: 45px;">
          SIMPAN PERUBAHAN
        </button>
      </div>
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

const showEditModal = ref(false)
const editForm = ref({
  id: null,
  product: null,
  size: '',
  color: '',
  quantity: 1
})

const editSwatchColors = computed(() => {
  if (!editForm.value.product || !editForm.value.product.stocks) return []
  const colors = editForm.value.product.stocks.map(s => s.color)
  return [...new Set(colors)]
})

const editAvailableSizes = computed(() => {
  if (!editForm.value.product || !editForm.value.product.stocks) return []
  const sizes = editForm.value.product.stocks
    .filter(s => s.color === editForm.value.color)
    .map(s => s.size)
  return [...new Set(sizes)]
})

const editVariantStock = computed(() => {
  if (!editForm.value.product || !editForm.value.product.stocks) return 0
  const stockRecord = editForm.value.product.stocks.find(
    s => s.color === editForm.value.color && s.size === editForm.value.size
  )
  return stockRecord ? stockRecord.stock : 0
})

function editSelectColor(colorName) {
  editForm.value.color = colorName
  const sizesForColor = editForm.value.product.stocks
    .filter(s => s.color === colorName && s.stock > 0)
    .map(s => s.size)
  if (sizesForColor.length) {
    editForm.value.size = sizesForColor[0]
  } else {
    editForm.value.size = ''
  }
}

function openEditModal(item) {
  editForm.value = {
    id: item.id,
    product: item.product,
    size: item.size || '',
    color: item.color || '',
    quantity: item.quantity || 1
  }
  showEditModal.value = true
}

async function saveCartItemEdit() {
  if (!editForm.value.size || !editForm.value.color) {
    toast.error('Pilihan Kosong', 'Harap pilih ukuran dan warna terlebih dahulu.')
    return
  }
  if (editForm.value.quantity > editVariantStock.value) {
    toast.error('Stok Kurang', 'Kuantitas melebihi stok yang tersedia.')
    return
  }

  try {
    const res = await fetch(`${BASE_URL}/cart/update/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        quantity: editForm.value.quantity,
        size: editForm.value.size,
        color: editForm.value.color
      })
    })

    const result = await res.json()

    if (res.ok) {
      toast.success('Berhasil', 'Pilihan pesanan berhasil diubah!')
      showEditModal.value = false
      loading.value = true
      items.value = await fetchCart()
      loading.value = false
    } else {
      toast.error('Gagal', result.message || 'Gagal menyimpan perubahan.')
    }
  } catch (error) {
    console.error(error)
    toast.error('Error', 'Terjadi kesalahan koneksi.')
  }
}

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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1040;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-card {
  width: 100%;
  max-width: 440px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: modalFadeIn 0.25s ease-out;
}
@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
