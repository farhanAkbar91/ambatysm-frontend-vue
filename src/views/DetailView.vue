<template>
  <div class="bg-white">
    <AppNavbar />

    <main class="container-fluid px-md-5 mt-4 mb-5" style="max-width:1200px;">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>

      <div v-else-if="error" class="text-center w-100">
        <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
        <p class="mt-2 text-danger">Gagal memuat detail produk.</p>
        <router-link to="/home" class="btn btn-outline-dark mt-3 rounded-0 font-b612 text-uppercase" style="letter-spacing:1px;">Kembali ke Beranda</router-link>
      </div>

      <div v-else-if="product" class="row gx-md-5">
        <!-- Left: Images -->
        <div class="col-md-7 d-flex flex-column flex-md-row gap-3 mb-4 mb-md-0">
          <!-- Desktop Thumbnails -->
          <div class="d-none d-md-flex flex-column gap-2" style="width:80px;max-height:600px;overflow-y:auto;scrollbar-width:none;">
            <div
              v-for="(img, i) in images"
              :key="i"
              class="thumbnail-item"
              :style="{ cursor:'pointer', border: activeImg === i ? '1px solid black' : '1px solid transparent', opacity: activeImg === i ? '1' : '0.6' }"
              @click="activeImg = i"
            >
              <img :src="img" class="img-fluid w-100" style="object-fit:cover;aspect-ratio:3/4;">
            </div>
          </div>

          <!-- Main Image Carousel -->
          <div class="flex-grow-1 bg-light position-relative">
            <div id="productCarousel" class="carousel slide h-100" data-bs-ride="false">
              <div class="carousel-inner h-100">
                <div v-for="(img, i) in images" :key="i" :class="['carousel-item h-100', { active: activeImg === i }]">
                  <img :src="img" class="d-block w-100 h-100" style="object-fit:cover;aspect-ratio:3/4;" :alt="product.name">
                </div>
              </div>
              <button class="carousel-control-prev d-md-none" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" style="filter:invert(1);"></span>
              </button>
              <button class="carousel-control-next d-md-none" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                <span class="carousel-control-next-icon" style="filter:invert(1);"></span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Product Info -->
        <div class="col-md-5">
          <h1 class="text-uppercase" style="font-family:'B612',sans-serif;font-size:20px;font-weight:400;color:#444;margin-bottom:20px;letter-spacing:1px;">{{ product.name }}</h1>
          <p style="font-size:15px;color:#777;margin-bottom:15px;">{{ formatRupiah(product.price) }}</p>
          <div class="d-flex align-items-center gap-2 mb-4">
            <div class="text-warning" style="font-size: 14px;">
              <i v-for="star in 5" :key="star" :class="getStarClass(product.reviews_avg_rating, star)"></i>
            </div>
            <span class="fw-bold text-dark font-b612" style="font-size: 13px;">{{ formatRating(product.reviews_avg_rating) }} / 5.0</span>
            <span class="text-muted font-b612" style="font-size: 12px;">| {{ product.reviews_count || 0 }} Ulasan</span>
          </div>

          <!-- Colors -->
          <div class="mb-4">
            <p style="font-size:13px;color:#555;margin-bottom:10px;">Pilihan Warna: <span class="fw-bold text-dark text-uppercase font-b612">{{ activeColor }}</span></p>
            <div class="d-flex gap-2 flex-wrap align-items-center">
              <div
                v-for="c in swatchColors"
                :key="c"
                class="filter-color-swatch"
                :class="{ active: activeColor === c }"
                :style="{ backgroundColor: getColorCss(c), width:'28px', height:'28px', borderRadius:'50%', border:'1px solid #ccc', cursor:'pointer', boxShadow: activeColor === c ? '0 0 0 2px #fff, 0 0 0 3px #111' : '' }"
                @click="selectColor(c)"
              ></div>
            </div>
          </div>

          <!-- Sizes -->
          <div class="mb-4 pt-2">
            <div class="d-flex justify-content-between align-items-end mb-2">
              <span style="font-size:13px;color:#555;">Pilihan Ukuran:</span>
              <a href="#" class="text-muted text-decoration-underline" style="font-size:11px;">Panduan Size</a>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button
                v-for="sz in availableSizes"
                :key="sz"
                class="btn btn-outline-secondary rounded-0 font-b612"
                :class="activeSize === sz ? 'border-dark text-dark fw-bold' : 'text-muted'"
                :style="{ width:'45px', height:'40px', fontSize:'13px', borderColor: activeSize === sz ? '#222' : '#ddd' }"
                @click="activeSize = sz"
              >{{ sz }}</button>
              <div v-if="!availableSizes.length" class="text-danger small font-b612 mt-1">Stok untuk warna ini habis</div>
            </div>
          </div>

          <!-- Stock Info -->
          <div class="mb-4 font-b612" style="font-size: 13px; color: #555;">
            <span>Stok Tersedia: </span>
            <span class="fw-bold" :class="selectedVariantStock > 0 ? 'text-success' : 'text-danger'">
              {{ selectedVariantStock > 0 ? selectedVariantStock + ' pcs' : 'Habis' }}
            </span>
          </div>

          <!-- Quantity -->
          <div class="mb-4 pt-2">
            <p style="font-size:13px;color:#555;margin-bottom:8px;">Jumlah:</p>
            <div class="d-inline-flex align-items-center border" style="border-color:#ddd !important;">
              <button class="btn btn-sm text-muted rounded-0 border-0" style="width:40px;" @click="qty > 1 && qty--"><i class="bi bi-dash"></i></button>
              <input type="text" :value="qty" class="form-control form-control-sm text-center border-0 rounded-0" style="width:40px;" readonly>
              <button class="btn btn-sm text-muted rounded-0 border-0" style="width:40px;" @click="qty++"><i class="bi bi-plus"></i></button>
            </div>
          </div>

          <!-- Add to Cart -->
          <div class="mb-4 pt-3">
            <button class="btn w-100 rounded-0 fw-bold pb-3 pt-3 font-b612" @click="addToCart" style="background-color:#111111;color:white;font-size:13px;letter-spacing:1.5px;">
              TAMBAH KE KERANJANG
            </button>
          </div>

          <!-- Description Accordion -->
          <div class="accordion accordion-flush" style="border:1px solid #eee;">
            <div class="accordion-item border-0">
              <h2 class="accordion-header">
                <button class="accordion-button rounded-0" type="button" data-bs-toggle="collapse" data-bs-target="#descCollapse" style="background-color:#000;color:#fff;font-size:12px;letter-spacing:2px;padding:15px;border-radius:0;">
                  DESKRIPSI BARANG
                </button>
              </h2>
              <div id="descCollapse" class="accordion-collapse collapse show">
                <div class="accordion-body p-4" style="font-size:13px;color:#666;line-height:1.8;" v-html="description"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Customer Reviews List -->
        <div class="mt-5 border-top pt-5">
          <h3 class="text-uppercase font-b612 mb-4" style="font-size: 16px; letter-spacing: 1.5px; font-weight: 700; color: #111;">Ulasan Pelanggan</h3>
          
          <div v-if="!product.reviews || product.reviews.length === 0" class="text-muted py-4 font-b612 text-center" style="font-size: 13px;">
            <i class="bi bi-chat-left-text d-block fs-3 mb-2 text-secondary"></i>
            Belum ada ulasan untuk produk ini.
          </div>
          
          <div v-else class="row">
            <div class="col-12">
              <div class="row row-cols-1 row-cols-md-2 g-3">
                <div v-for="review in product.reviews" :key="review.id" class="col">
                  <div class="card h-100 border-0 bg-light p-3 shadow-sm" style="border-radius: 0;">
                    <div class="d-flex justify-content-between align-items-center mb-2 font-b612">
                      <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold text-dark" style="font-size: 13px;">{{ review.user ? review.user.name : 'Pelanggan' }}</span>
                        <span class="text-muted" style="font-size: 10px;">{{ formatDate(review.created_at) }}</span>
                      </div>
                      <div class="text-warning" style="font-size: 11px;">
                        <i v-for="n in 5" :key="n" class="bi" :class="n <= review.rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                      </div>
                    </div>
                    <p class="mb-0 text-secondary font-b612" style="font-size: 12px; line-height: 1.6; font-style: italic;">
                      "{{ review.comment || 'Tidak ada komentar.' }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { apiGetProductDetail, getImageUrl, formatRupiah, BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref(false)
const activeImg = ref(0)
const activeColor = ref('')
const activeSize = ref('')
const qty = ref(1)

const swatchColors = computed(() => {
  if (!product.value || !product.value.stocks) return []
  const colors = product.value.stocks.map(s => s.color)
  return [...new Set(colors)]
})

const availableSizes = computed(() => {
  if (!product.value || !product.value.stocks) return []
  const sizes = product.value.stocks
    .filter(s => s.color === activeColor.value)
    .map(s => s.size)
  return [...new Set(sizes)]
})

const selectedVariantStock = computed(() => {
  if (!product.value || !product.value.stocks) return 0
  const stockRecord = product.value.stocks.find(
    s => s.color === activeColor.value && s.size === activeSize.value
  )
  return stockRecord ? stockRecord.stock : 0
})

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

function selectColor(colorName) {
  activeColor.value = colorName
  const sizesForColor = product.value.stocks
    .filter(s => s.color === colorName && s.stock > 0)
    .map(s => s.size)
  if (sizesForColor.length) {
    activeSize.value = sizesForColor[0]
  } else {
    activeSize.value = ''
  }
}

const images = computed(() => {
  if (!product.value) return []
  return [
    getImageUrl(product.value.image),
    'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=500&q=80',
    'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&q=80',
    'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&q=80',
  ]
})

const description = computed(() => {
  const desc = product.value?.description || 'Barang berkualitas premium dengan bahan yang nyaman dipakai sehari-hari. Desain clean dan timeless memudahkan untuk dipadukan dengan berbagai outfit.<br><br><b>Perawatan:</b><br>- Cuci dengan air dingin<br>- Jangan gunakan pemutih<br>- Setrika suhu rendah'
  return desc.replace(/\n/g, '<br>')
})

onMounted(async () => {
  const id = route.params.id
  try {
    product.value = await apiGetProductDetail(id)
    if (!product.value) {
      error.value = true
    } else {
      if (product.value.stocks && product.value.stocks.length) {
        const firstStockWithQty = product.value.stocks.find(s => s.stock > 0) || product.value.stocks[0]
        activeColor.value = firstStockWithQty.color
        activeSize.value = firstStockWithQty.size
      }
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!auth.token) {
    toast.error('Login Diperlukan', 'Silakan login terlebih dahulu untuk menambahkan barang ke keranjang.')
    router.push('/login')
    return
  }
  if (!activeSize.value || !activeColor.value) {
    toast.error('Pilihan Kosong', 'Harap pilih ukuran dan warna terlebih dahulu.')
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ product_id: product.value.id, quantity: qty.value, size: activeSize.value, color: activeColor.value })
    })
    const result = await res.json()
    if (res.ok) {
      toast.success('Berhasil', 'Produk ditambahkan ke keranjang!')
      cartStore.fetchCart()
    } else {
      toast.error('Gagal', result.message || 'Stok mungkin tidak mencukupi.')
    }
  } catch { toast.error('Error', 'Terjadi kesalahan koneksi.') }
}

function getStarClass(rating, starIndex) {
  const r = parseFloat(rating) || 0;
  const diff = r - (starIndex - 1);
  if (diff >= 1) return 'bi bi-star-fill text-warning';
  if (diff >= 0.5) return 'bi bi-star-half text-warning';
  return 'bi bi-star text-muted';
}

function formatRating(rating) {
  const r = parseFloat(rating) || 0;
  return r > 0 ? r.toFixed(1) : '0';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>
