<template>
  <div>
    <AppNavbar />

    <!-- Hero Carousel -->
    <div id="heroCarousel" class="carousel slide">
      <div class="carousel-indicators">
        <button v-for="(_, i) in slides" :key="i" type="button" data-bs-target="#heroCarousel" :data-bs-slide-to="i" :class="{ active: i === 0 }"></button>
      </div>
      <div class="carousel-inner">
        <div v-for="(slide, i) in slides" :key="i" :class="['carousel-item', { active: i === 0 }]">
          <img src="../assets/landpage.png" class="d-block w-100" :alt="slide.title">
          <div class="carousel-caption d-none d-md-block text-dark">
            <h5>{{ slide.title }}</h5>
            <p>{{ slide.subtitle }}</p>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon"></span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon"></span>
      </button>
    </div>

    <!-- Brand New Products -->
    <div class="container mt-5 mb-2">
      <h2 class="text-center text-uppercase font-b612" style="letter-spacing:2px;color:#333;font-size:28px;">Brand New</h2>
    </div>
    <div class="container mt-4 mb-5">
      <div class="row" v-if="loading">
        <div class="text-center py-5 w-100">
          <div class="spinner-border text-dark" role="status"></div>
        </div>
      </div>
      <div class="row" v-else>
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          @add-to-cart="addToCart"
        />
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import ProductCard from '../components/ProductCard.vue'
import { apiGetProducts, BASE_URL } from '../composables/api'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const products = ref([])
const loading = ref(true)

const slides = [
  { title: 'Koleksi Musim Panas', subtitle: 'Temukan gaya terbaikmu dengan koleksi terbaru kami.' },
  { title: 'Second slide label', subtitle: 'Some representative placeholder content for the second slide.' },
  { title: 'Third slide label', subtitle: 'Some representative placeholder content for the third slide.' },
]

onMounted(async () => {
  products.value = await apiGetProducts()
  loading.value = false
})

async function addToCart(productId) {
  if (!auth.token) {
    toast.error('Login Diperlukan', 'Silakan login terlebih dahulu untuk berbelanja.')
    router.push('/login')
    return
  }
  try {
    const res = await fetch(`${BASE_URL}/cart/add`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 })
    })
    const result = await res.json()
    if (res.ok) {
      toast.success('Berhasil', 'Produk ditambahkan ke keranjang!')
    } else {
      toast.error('Gagal', result.message || 'Stok mungkin tidak mencukupi.')
    }
  } catch {
    toast.error('Error', 'Terjadi kesalahan koneksi ke server.')
  }
}
</script>
