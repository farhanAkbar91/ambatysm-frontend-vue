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

const sizes = ['S', 'M', 'L', 'XL', 'XXL', '40', '41', '42', '43', '44']
const colors = [
  { name: 'black', hex: 'black' }, { name: 'blue', hex: 'blue' },
  { name: 'darkred', hex: 'darkred' }, { name: 'grey', hex: 'grey' },
  { name: 'green', hex: 'green' }, { name: 'red', hex: 'red' },
  { name: 'white', hex: 'white' }
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

  if (typeParam.value && typeParam.value !== 'all' && typeParam.value !== 'new' && typeParam.value !== 'sale') {
    const keyword = typeParam.value.replace('-', '')
    list = list.filter(p => p.name.toLowerCase().includes(keyword) || p.name.toLowerCase().includes('shirt') || p.name.toLowerCase().includes('kaos'))
    if (list.length === 0) list = allProducts.value.slice(0, 4)
  }

  if (selectedSize.value) {
    list = list.filter(p => (p.id * selectedSize.value.charCodeAt(0)) % 3 !== 0)
  }

  if (selectedColor.value) {
    list = list.filter(p => (p.id * selectedColor.value.charCodeAt(0)) % 2 !== 0)
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
</script>
