<template>
  <div class="bg-light">
    <AppNavbar />

    <div class="container-fluid bg-white" style="min-height:80vh;">
      <div class="category-page">
        <!-- Sidebar Filters -->
        <aside class="category-sidebar">
          <div class="filter-section">
            <div class="filter-section__header">
              <span>Size</span>
              <i class="bi bi-dash"></i>
            </div>
            <div class="filter-size-grid">
              <div
                v-for="size in sizes"
                :key="size"
                :class="['filter-size-btn', { active: selectedSize === size }]"
                :data-size="size"
                @click="toggleSize(size)"
              >{{ size }}</div>
            </div>
          </div>

          <hr class="text-secondary opacity-25 my-4">

          <div class="filter-section">
            <div class="filter-section__header">
              <span>Color</span>
              <i class="bi bi-dash"></i>
            </div>
            <div class="filter-color-grid">
              <div
                v-for="color in colors"
                :key="color.name"
                :class="['filter-color-swatch', { active: selectedColor === color.name }]"
                :style="{ backgroundColor: color.hex }"
                @click="toggleColor(color.name)"
              ></div>
            </div>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="category-main">
          <h1 class="category-title">{{ categoryTitle }}</h1>

          <div v-if="loading" class="text-center py-5 w-100">
            <div class="spinner-border text-dark" role="status"></div>
          </div>

          <div v-else-if="filtered.length === 0" class="text-center py-5 w-100 text-muted">
            <i class="bi bi-search fs-1 d-block mb-3"></i>
            <p>Tidak ada produk yang cocok dengan filter Anda.</p>
            <button class="btn btn-outline-dark btn-sm mt-2" @click="resetFilters">Reset Filter</button>
          </div>

          <div class="row" v-else>
            <div v-for="product in filtered" :key="product.id" class="col-sm-6 col-md-4 col-lg-3 mb-4">
              <router-link :to="`/product/${product.id}`" class="text-decoration-none text-dark">
                <div class="card border-0 h-100 shadow-sm category-product-card">
                  <img :src="getImageUrl(product.image)" class="card-img-top w-100" style="object-fit:cover;aspect-ratio:3/4;" :alt="product.name">
                  <div class="card-body text-center mt-2 d-flex flex-column" style="padding:10px 0;">
                    <p class="card-title text-uppercase font-b612 text-muted mb-1" style="font-size:11px;letter-spacing:1px;">AMBATYSM</p>
                    <p class="card-text text-uppercase teks-judul" style="font-size:13px;font-weight:500;">{{ product.name }}</p>
                    <div class="d-flex align-items-center justify-content-center gap-1 mb-2">
                      <div class="text-warning" style="font-size: 11px;">
                        <i v-for="star in 5" :key="star" :class="getStarClass(product.reviews_avg_rating, star)"></i>
                      </div>
                      <span class="text-muted" style="font-size: 11px;">
                        ({{ product.reviews_count || 0 }})
                      </span>
                    </div>
                    <p class="card-text teks-harga mt-auto" style="font-size:13px;">{{ formatRupiah(product.price) }}</p>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
        </main>
      </div>
    </div>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '../components/AppNavbar.vue'
import AppFooter from '../components/AppFooter.vue'
import { apiGetProducts, getImageUrl, formatRupiah } from '../composables/api'

const route = useRoute()
const loading = ref(true)
const allProducts = ref([])
const selectedSize = ref(null)
const selectedColor = ref(null)

const sizes = ['S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34']
const colors = [
  { name: 'Hitam', hex: '#111111' },
  { name: 'Putih', hex: '#ffffff' },
  { name: 'Abu-abu', hex: '#888888' },
  { name: 'Navy', hex: '#1d2a44' },
  { name: 'Cream', hex: '#fffdd0' },
  { name: 'Sage Green', hex: '#b2ac88' },
  { name: 'Biru Muda', hex: '#add8e6' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Khaki', hex: '#c3b091' },
  { name: 'Hijau Army', hex: '#4b5320' },
  { name: 'Cokelat', hex: '#6f4e37' },
  { name: 'Biru Tua', hex: '#000080' },
  { name: 'Beige', hex: '#f5f5dc' },
  { name: 'Merah', hex: '#b12a2a' }
]

const titleMap = {
  new: 'NEW ARRIVALS', tops: 'TOPS', bottoms: 'BOTTOMS',
  sale: 'SALE', 't-shirts': 'T-SHIRTS', shirts: 'SHIRTS',
  outerwear: 'OUTERWEAR', pants: 'PANTS', shorts: 'SHORTS', all: 'ALL PRODUCTS'
}

const typeParam = computed(() => route.query.type || 'all')
const categoryTitle = computed(() => titleMap[typeParam.value?.toLowerCase()] || typeParam.value?.toUpperCase() || 'PRODUCTS')

const filtered = computed(() => {
  let list = [...allProducts.value]

  // Filter by category type parameter
  if (typeParam.value && typeParam.value !== 'all' && typeParam.value !== 'new' && typeParam.value !== 'sale') {
    const type = typeParam.value.toLowerCase()
    if (type === 'tops') {
      list = list.filter(p => ['t-shirts', 'shirts', 'outerwear'].includes(p.category?.toLowerCase()))
    } else if (type === 'bottoms') {
      list = list.filter(p => ['pants', 'shorts'].includes(p.category?.toLowerCase()))
    } else {
      // t-shirts, shirts, outerwear, pants, shorts
      list = list.filter(p => p.category?.toLowerCase() === type)
    }
  }

  // Filter by search query parameter
  const searchParam = route.query.search
  if (searchParam) {
    const query = searchParam.toLowerCase()
    list = list.filter(p => 
      p.name.toLowerCase().includes(query) || 
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    )
  }

  // Filter by selected size
  if (selectedSize.value) {
    list = list.filter(p => p.stocks && p.stocks.some(s => s.size === selectedSize.value && s.stock > 0))
  }

  // Filter by selected color
  if (selectedColor.value) {
    list = list.filter(p => p.stocks && p.stocks.some(s => s.color.toLowerCase() === selectedColor.value.toLowerCase() && s.stock > 0))
  }

  return list
})

function toggleSize(size) {
  selectedSize.value = selectedSize.value === size ? null : size
}
function toggleColor(color) {
  selectedColor.value = selectedColor.value === color ? null : color
}
function resetFilters() {
  selectedSize.value = null
  selectedColor.value = null
}

onMounted(async () => {
  allProducts.value = await apiGetProducts()
  loading.value = false
})

watch(typeParam, () => { selectedSize.value = null; selectedColor.value = null })

function getStarClass(rating, starIndex) {
  const r = parseFloat(rating) || 0;
  const diff = r - (starIndex - 1);
  if (diff >= 1) return 'bi bi-star-fill text-warning';
  if (diff >= 0.5) return 'bi bi-star-half text-warning';
  return 'bi bi-star text-muted';
}
</script>
