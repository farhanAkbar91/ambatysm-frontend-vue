<template>
  <div class="bg-light min-vh-100">
    <!-- NAVBAR -->
    <nav class="navbar bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid px-4 d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-4">
          <button class="btn p-0 border-0 bg-transparent text-dark d-flex align-items-center gap-2" @click="showMenu = true">
            <i class="bi bi-list fs-3"></i>
            <span class="d-none d-md-inline" style="font-size: 15px;">Menu</span>
          </button>
        </div>
        <router-link to="/admin" class="navbar-brand position-absolute top-50 start-50 translate-middle m-0">
          <span class="text-uppercase font-italiana" style="letter-spacing: 2.5px; font-size: 26px; color: black;">Ambatysm</span>
        </router-link>
        <div class="d-flex align-items-center gap-4">
          <button class="btn p-0 border-0 bg-transparent text-dark" @click="showSearch = true">
            <i class="bi bi-search fs-5"></i>
          </button>
          <router-link to="/admin/pesanan" class="text-dark text-decoration-none">
            <i class="bi bi-cart3 fs-4"></i>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- OFFCANVAS MENU KIRI -->
    <div v-if="showMenu" class="offcanvas-backdrop fade show" @click="showMenu = false"></div>
    <div :class="['offcanvas offcanvas-start', { show: showMenu }]" style="width: 400px; max-width: 100vw; visibility: visible;">
      <div class="offcanvas-header p-4">
        <button class="btn text-dark d-flex align-items-center gap-2 bg-transparent border-0 p-0" @click="showMenu = false">
          <i class="bi bi-x fs-3"></i>
          <span style="font-size: 15px;">Close</span>
        </button>
      </div>
      <div class="offcanvas-body p-4 pt-2">
        <div class="d-flex flex-column gap-4 mb-5">
          <router-link to="/admin/dashboard" class="text-dark text-decoration-none fs-5 fw-bold text-uppercase" style="letter-spacing: 1px;" @click="showMenu = false">Dashboard Analitik</router-link>
          <router-link to="/admin" class="text-dark text-decoration-none fs-5 fw-bold text-uppercase" style="letter-spacing: 1px;" @click="showMenu = false">Produk</router-link>
          <router-link to="/admin/tambah-produk" class="text-dark text-decoration-none fs-5 fw-bold text-uppercase" style="letter-spacing: 1px;" @click="showMenu = false">Tambah Produk Baru</router-link>
          <router-link to="/admin/pesanan" class="text-dark text-decoration-none fs-5 fw-bold text-uppercase" style="letter-spacing: 1px;" @click="showMenu = false">Pesanan</router-link>
          <a href="#" class="text-dark text-decoration-none fs-5 fw-bold text-uppercase" style="letter-spacing: 1px;" @click.prevent="doLogout">Logout</a>
        </div>
      </div>
    </div>

    <!-- OFFCANVAS SEARCH -->
    <div v-if="showSearch" class="offcanvas-backdrop fade show" @click="showSearch = false"></div>
    <div v-if="showSearch" class="offcanvas offcanvas-top h-100 show" style="visibility: visible;">
      <div class="offcanvas-header p-4 d-flex justify-content-between align-items-center">
        <button class="btn-close m-0" @click="showSearch = false"></button>
        <span class="text-uppercase mx-auto font-italiana" style="letter-spacing: 2.5px; font-size: 26px; color: black;">Ambatysm</span>
        <div style="width: 32px;"></div>
      </div>
      <div class="offcanvas-body px-0">
        <div class="container mt-2">
          <div class="row justify-content-center">
            <div class="col-md-8 d-flex align-items-center gap-3">
              <div class="position-relative flex-grow-1">
                <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-secondary"></i>
                <input type="text" v-model="searchQuery" class="form-control rounded-pill py-3 border-dark w-100" placeholder="Cari produk..." style="font-size: 15px; padding-left: 50px;" @keyup.enter="doSearch">
              </div>
              <span class="text-danger fw-bold text-uppercase" style="cursor: pointer; font-size: 14px; letter-spacing: 1px;" @click="doSearch">Search</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ACTION BAR -->
    <div class="admin-action-bar" style="max-width: 600px; margin: 0 auto; left: 0; right: 0;">
      <button class="admin-action-bar__filter" @click="toggleFilter">
        <i class="bi bi-sliders"></i> PRODUK
      </button>
      <router-link to="/admin/tambah-produk" class="admin-action-bar__add">
        <i class="bi bi-plus-lg"></i> PRODUK BARU
      </router-link>
    </div>

    <!-- KONTEN UTAMA -->
    <main class="container pb-5" style="max-width: 600px;">
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-dark" role="status"></div>
      </div>
      <div v-else-if="products.length === 0" class="seller-product-empty text-center py-5">
        <i class="bi bi-box-seam fs-1 text-secondary"></i>
        <p class="mt-3 text-secondary">Belum ada produk. Tambahkan produk pertamamu!</p>
      </div>
      <div v-else class="row px-3 pt-5 mt-4">
        <div class="col-6 mb-4" v-for="product in filteredProducts" :key="product.id">
          <div class="card border-0 h-100 shadow-sm pb-2">
            <router-link :to="`/product/${product.id}`">
              <img :src="getImageUrl(product.image)" :alt="product.name" class="card-img-top d-block w-100" style="object-fit: cover; aspect-ratio: 3/4;">
            </router-link>
            <div class="card-body text-center font-b612 d-flex flex-column justify-content-between p-2">
              <div>
                <p class="card-text mb-1 text-uppercase fw-bold" style="font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ product.name }}</p>
                <p class="card-text text-uppercase text-secondary mb-1" style="font-size: 11px;">Stok: {{ product.stock || 0 }}</p>
                <p class="card-text text-uppercase" style="font-size: 12px; color: #b12a2a; font-weight: bold;">{{ formatRupiah(product.price) }}</p>
              </div>
              <div class="d-flex gap-2 mt-2">
                <router-link :to="`/admin/tambah-produk?id=${product.id}`" class="btn btn-outline-dark btn-sm w-50 font-b612" style="font-size: 11px; letter-spacing: 1px;">
                  <i class="bi bi-pencil"></i> EDIT
                </router-link>
                <button class="btn btn-outline-danger btn-sm w-50 font-b612" style="font-size: 11px; letter-spacing: 1px;" @click="deleteProduct(product.id)">
                  <i class="bi bi-trash"></i> HAPUS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AdminBottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AdminBottomNav from '../../components/AdminBottomNav.vue'
import { apiGetProducts, getImageUrl, formatRupiah, BASE_URL } from '../../composables/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()
const products = ref([])
const loading = ref(true)

const showMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')
const searchFilter = ref('')

onMounted(async () => {
  products.value = await apiGetProducts()
  loading.value = false
})

const filteredProducts = computed(() => {
  if (!searchFilter.value) return products.value
  const q = searchFilter.value.toLowerCase()
  return products.value.filter(p => p.name.toLowerCase().includes(q))
})

function doSearch() {
  searchFilter.value = searchQuery.value
  showSearch.value = false
}

function toggleFilter() {
  // Simple filter toggle (in real app, might show categories)
  searchFilter.value = ''
  searchQuery.value = ''
}

async function deleteProduct(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${auth.token}`, Accept: 'application/json' }
    })
    if (res.ok) {
      toast.success('Berhasil', 'Produk berhasil dihapus.')
      products.value = products.value.filter(p => p.id !== id)
    } else {
      const result = await res.json()
      toast.error('Gagal', result.message || 'Gagal menghapus produk.')
    }
  } catch {
    toast.error('Error', 'Terjadi kesalahan sistem.')
  }
}

function doLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-action-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 70px;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.admin-action-bar__filter {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px;
  font-weight: 600;
  font-size: 13px;
  border-right: 1px solid #e0e0e0;
  color: #333;
}
.admin-action-bar__add {
  flex: 1;
  text-align: center;
  padding: 12px;
  font-weight: 600;
  font-size: 13px;
  color: #fff;
  background-color: #000;
  text-decoration: none;
}
.seller-product-empty {
  color: #888;
  font-size: 14px;
}
</style>