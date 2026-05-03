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
          <p style="font-size:15px;color:#777;margin-bottom:30px;">{{ formatRupiah(product.price) }}</p>

          <!-- Colors -->
          <div class="mb-4">
            <p style="font-size:13px;color:#555;margin-bottom:10px;">Colors</p>
            <div class="d-flex gap-2 flex-wrap">
              <div
                v-for="c in swatchColors"
                :key="c"
                class="filter-color-swatch"
                :class="{ active: activeColor === c }"
                :style="{ backgroundColor: c, width:'22px', height:'22px', borderRadius:'50%', border:'1px solid #ccc', cursor:'pointer', boxShadow: activeColor === c ? '0 0 0 2px #fff, 0 0 0 3px #111' : '' }"
                @click="activeColor = c"
              ></div>
            </div>
          </div>

          <!-- Sizes -->
          <div class="mb-4 pt-2">
            <div class="d-flex justify-content-between align-items-end mb-2">
              <span style="font-size:13px;color:#555;">Size:</span>
              <a href="#" class="text-muted text-decoration-underline" style="font-size:11px;">Panduan Size</a>
            </div>
            <div class="d-flex gap-2 flex-wrap">
              <button
                v-for="sz in ['S','M','L','XL','XXL']"
                :key="sz"
                class="btn btn-outline-secondary rounded-0 font-b612"
                :class="activeSize === sz ? 'border-dark text-dark fw-bold' : 'text-muted'"
                :style="{ width:'45px', height:'40px', fontSize:'13px', borderColor: activeSize === sz ? '#222' : '#ddd' }"
                @click="activeSize = sz"
              >{{ sz }}</button>
            </div>
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
            <button class="btn w-100 rounded-0 fw-bold pb-3 pt-3 font-b612" @click="addToCart" style="background-color:#ff0000;color:white;font-size:13px;letter-spacing:1.5px;">
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

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const product = ref(null)
const loading = ref(true)
const error = ref(false)
const activeImg = ref(0)
const activeColor = ref('#000000')
const activeSize = ref('S')
const qty = ref(1)

const swatchColors = ['#000', '#1abc9c', '#3498db', '#e74c3c', '#7f8c8d', '#f5deb3', '#fff']

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
    if (!product.value) error.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})

async function addToCart() {
  if (!auth.token) {
    router.push('/login')
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ product_id: product.value.id, quantity: qty.value })
    })
    const result = await res.json()
    if (res.ok) toast.success('Berhasil', 'Produk ditambahkan ke keranjang!')
    else toast.error('Gagal', result.message || 'Stok mungkin tidak mencukupi.')
  } catch { toast.error('Error', 'Terjadi kesalahan koneksi.') }
}
</script>
