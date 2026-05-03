<template>
  <div class="col-sm-3 mb-4">
    <div class="card border-0 h-100 shadow-sm pb-2">
      <router-link :to="`/product/${product.id}`">
        <img :src="getImageUrl(product.image)" :alt="product.name" class="card-img-top d-block w-100" style="object-fit:cover;aspect-ratio:3/4;">
      </router-link>
      <div class="card-body text-center font-b612 d-flex flex-column justify-content-between">
        <div>
          <router-link :to="`/product/${product.id}`" class="text-decoration-none text-dark">
            <p class="card-text mb-2 text-uppercase teks-judul" style="font-weight:600;font-size:14px;">{{ product.name }}</p>
          </router-link>
          <p class="card-text text-uppercase teks-harga" style="font-size:13px;">{{ formatRupiah(product.price) }}</p>
        </div>
        <button class="btn btn-dark w-100 mt-3" @click="$emit('add-to-cart', product.id)" style="border-radius:0;font-size:13px;letter-spacing:1px;">
          <i class="bi bi-cart-plus"></i> TAMBAH
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl, formatRupiah } from '../composables/api'

defineProps({ product: Object })
defineEmits(['add-to-cart'])
</script>
