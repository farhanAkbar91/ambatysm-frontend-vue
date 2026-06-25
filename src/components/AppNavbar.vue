<template>
  <!-- Header -->
  <header class="livehaf-nav-container shadow-sm border-bottom-0">
    <div class="livehaf-nav-top position-relative d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center">
        <button
          class="btn text-dark d-md-none me-3 p-0 border-0 bg-transparent"
          @click="showMobileMenu = true"
        >
          <i class="bi bi-list fs-3"></i>
        </button>
      </div>

      <router-link to="/" class="brand-logo-ambatysm position-absolute top-50 start-50 translate-middle">
        AMBATYSM
      </router-link>

      <div class="d-flex align-items-center gap-3 gap-md-4">
        <button class="btn text-dark text-decoration-none p-0 border-0 bg-transparent" @click="showSearch = true">
          <i class="bi bi-search fs-5"></i>
        </button>
        <template v-if="isLoggedIn">
          <router-link to="/cart" class="text-dark text-decoration-none position-relative d-inline-block">
            <i class="bi bi-cart3 fs-4"></i>
            <span
              v-if="cartCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size: 0.65rem; padding: 0.35em 0.5em; min-width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center;"
            >
              {{ cartCount }}
            </span>
          </router-link>
          <router-link to="/profil" class="text-dark text-decoration-none">
            <i class="bi bi-person fs-4"></i>
          </router-link>
        </template>
        <template v-else>
          <router-link to="/login" class="text-dark text-decoration-none">
            <i class="bi bi-person fs-4"></i>
          </router-link>
        </template>
      </div>
    </div>

    <div class="d-none d-md-block border-top" style="border-color: #f0f0f0 !important;">
      <ul class="livehaf-nav">
        <li class="livehaf-nav__wrapper">
          <router-link to="/category?type=new" class="livehaf-nav__item">NEW ARRIVALS</router-link>
        </li>
        <li class="livehaf-nav__wrapper">
          <router-link to="/category?type=tops" class="livehaf-nav__item">TOPS</router-link>
          <div class="livehaf-dropdown">
            <router-link to="/category?type=tops" class="livehaf-dropdown__item">All</router-link>
            <router-link to="/category?type=t-shirts" class="livehaf-dropdown__item">T-Shirts</router-link>
            <router-link to="/category?type=shirts" class="livehaf-dropdown__item">Shirts</router-link>
            <router-link to="/category?type=outerwear" class="livehaf-dropdown__item">Outerwear</router-link>
          </div>
        </li>
        <li class="livehaf-nav__wrapper">
          <router-link to="/category?type=bottoms" class="livehaf-nav__item">BOTTOMS</router-link>
          <div class="livehaf-dropdown">
            <router-link to="/category?type=bottoms" class="livehaf-dropdown__item">All</router-link>
            <router-link to="/category?type=pants" class="livehaf-dropdown__item">Pants</router-link>
            <router-link to="/category?type=shorts" class="livehaf-dropdown__item">Shorts</router-link>
          </div>
        </li>
        <li class="livehaf-nav__wrapper">
          <router-link to="/category?type=custom" class="livehaf-nav__item text-danger">CUSTOM</router-link>
        </li>
      </ul>
    </div>
  </header>

  <!-- Mobile Offcanvas Menu -->
  <div v-if="showMobileMenu" class="offcanvas-backdrop fade show" @click="showMobileMenu = false"></div>
  <div :class="['offcanvas offcanvas-start', { show: showMobileMenu }]" style="width: 400px; max-width: 100vw; visibility: visible;">
    <div class="offcanvas-header p-4">
      <button class="btn text-dark d-flex align-items-center gap-2 bg-transparent border-0 p-0" @click="showMobileMenu = false">
        <i class="bi bi-x fs-3"></i>
        <span style="font-size:15px;">Close</span>
      </button>
    </div>
    <div class="offcanvas-body p-4 pt-2">
      <div class="d-flex flex-column gap-3 mb-5">
        <router-link to="/category?type=new" class="text-dark text-decoration-none fs-5" @click="showMobileMenu = false">Brand New</router-link>
        <router-link to="/category?type=tops" class="text-dark text-decoration-none fs-5" @click="showMobileMenu = false">Tops</router-link>
        <router-link to="/category?type=bottoms" class="text-dark text-decoration-none fs-5" @click="showMobileMenu = false">Bottoms</router-link>
        <router-link to="/category?type=custom" class="text-dark text-decoration-none fs-5 text-danger" @click="showMobileMenu = false">Custom</router-link>
      </div>
      <hr class="text-secondary opacity-25">
      <div class="mt-4 mb-5">
        <p class="text-dark mb-2" style="font-size:14px;">Can we help you? Call Us</p>
        <p class="text-dark" style="font-size:14px;">0018 0301 2888</p>
      </div>
    </div>
  </div>

  <!-- Search Overlay -->
  <div v-if="showSearch" class="offcanvas offcanvas-top h-100 show" style="visibility:visible;">
    <div class="offcanvas-header p-4 d-flex justify-content-between align-items-center">
      <button class="btn-close m-0" @click="showSearch = false"></button>
      <span class="text-uppercase mx-auto font-italiana" style="letter-spacing:2.5px;font-size:26px;color:black;">Ambatysm</span>
      <div style="width:32px;"></div>
    </div>
    <div class="offcanvas-body px-0">
      <div class="container mt-2">
        <div class="row justify-content-center">
          <div class="col-md-8 d-flex align-items-center gap-3">
            <div class="position-relative flex-grow-1">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-4 text-secondary"></i>
              <input
                v-model="searchQuery"
                type="text"
                class="form-control rounded-pill py-3 border-dark w-100"
                placeholder="Search for 'Gifts'"
                style="font-size:15px;padding-left:50px;"
                @keyup.enter="doSearch"
              >
            </div>
            <span class="text-danger fw-bold text-uppercase" style="cursor:pointer;font-size:14px;letter-spacing:1px;" @click="doSearch">Search</span>
          </div>
        </div>
        <div class="row justify-content-center mt-4">
          <div class="col-md-10 d-flex flex-wrap justify-content-center align-items-center gap-4">
            <span class="text-uppercase" style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#777;">Trending Searches</span>
            <a href="#" class="text-dark text-decoration-none" style="font-size:14px;" @click.prevent="searchQuery = 'kemeja'">kemeja</a>
            <a href="#" class="text-dark text-decoration-none" style="font-size:14px;" @click.prevent="searchQuery = 'jaket'">jaket</a>
            <a href="#" class="text-dark text-decoration-none" style="font-size:14px;" @click.prevent="searchQuery = 'jeans'">jeans</a>
            <a href="#" class="text-dark text-decoration-none" style="font-size:14px;" @click.prevent="searchQuery = 'kaos'">kaos</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showSearch" class="offcanvas-backdrop fade show" @click="showSearch = false"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { storeToRefs } from 'pinia'

const auth = useAuthStore()
const { isLoggedIn } = storeToRefs(auth)
const cartStore = useCartStore()
const { cartCount } = storeToRefs(cartStore)
const router = useRouter()

const showMobileMenu = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push(`/category?search=${encodeURIComponent(searchQuery.value)}`)
    showSearch.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    cartStore.fetchCart()
  }
})

watch(isLoggedIn, (newVal) => {
  if (newVal) {
    cartStore.fetchCart()
  } else {
    cartStore.items = []
  }
})
</script>
