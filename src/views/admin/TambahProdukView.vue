<template>
  <div class="bg-light min-vh-100">
    <!-- HEADER -->
    <nav class="navbar bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid px-3 d-flex justify-content-between align-items-center">
        <router-link to="/admin" class="text-dark text-decoration-none">
          <i class="bi bi-arrow-left fs-2"></i>
        </router-link>
        <router-link to="/admin" class="navbar-brand position-absolute top-50 start-50 translate-middle m-0">
          <span class="text-uppercase font-italiana" style="letter-spacing: 2.5px; font-size: 24px; color: black;">Ambatysm</span>
        </router-link>
        <div style="width: 32px;"></div>
      </div>
    </nav>

    <!-- KONTEN UTAMA -->
    <main class="container py-4 pb-5" style="max-width: 560px;">
      <h2 class="text-uppercase font-b612 fw-bold text-center mb-4" style="letter-spacing: 2px; font-size: 1.1rem;">
        {{ isEdit ? 'UBAH PRODUK' : 'PRODUK BARU' }}
      </h2>

      <!-- SECTION FOTO -->
      <div class="mb-4 bg-white p-3 rounded shadow-sm border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="font-b612 fw-bold text-dark" style="font-size: 14px;">Foto Produk</span>
          <span class="text-secondary" style="font-size: 12px;">Maks. 3 foto · JPG / PNG / WEBP · 2MB per foto</span>
        </div>

        <div class="d-flex gap-2 mb-2">
          <div v-for="(img, index) in previewImages" :key="index" class="position-relative border rounded bg-light d-flex align-items-center justify-content-center" style="width: 80px; height: 80px; overflow: hidden;">
            <img v-if="img" :src="img" class="w-100 h-100" style="object-fit: cover;">
            <div v-else class="text-secondary d-flex flex-column align-items-center">
              <i class="bi bi-camera fs-4"></i>
            </div>
            <button v-if="img" @click.prevent="removeImage(index)" class="btn btn-danger btn-sm position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center" style="width: 20px; height: 20px; border-radius: 50%; font-size: 10px; margin: 2px;">
              <i class="bi bi-x"></i>
            </button>
            <input type="file" class="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer" accept="image/jpeg,image/png,image/webp" @change="handleImageUpload($event, index)" v-if="!img">
          </div>
        </div>
      </div>

      <!-- FORM FIELDS -->
      <div class="bg-white p-3 rounded shadow-sm border">
        <div class="mb-3">
          <label class="form-label font-b612 text-secondary" style="font-size: 13px;">ID Produk</label>
          <input type="text" class="form-control" v-model="form.productCode" placeholder="Kosongkan untuk auto-generate">
        </div>

        <div class="mb-3">
          <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Jenis Produk</label>
          <select class="form-select" v-model="form.category">
            <option value="">— Pilih Jenis —</option>
            <option value="T-Shirts">T-Shirts</option>
            <option value="Shirts">Shirts</option>
            <option value="Outerwear">Outerwear</option>
            <option value="Pants">Pants</option>
            <option value="Shorts">Shorts</option>
          </select>
        </div>

        <div class="mb-3">
          <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Nama Produk</label>
          <input type="text" class="form-control" v-model="form.name" placeholder="Contoh: Kemeja Putih Basic">
        </div>

        <div class="mb-3">
          <div class="d-flex justify-content-between mb-2">
            <label class="form-label font-b612 text-secondary mb-0" style="font-size: 13px;">Detail Ukuran, Warna & Stok</label>
          </div>
          <div v-for="(variantObj, i) in form.variants" :key="i" class="d-flex gap-2 mb-2">
            <input type="text" class="form-control" v-model="variantObj.size" placeholder="Size (cth: M)" style="width: 30%;">
            <input type="text" class="form-control" v-model="variantObj.color" placeholder="Warna (cth: Hitam)" style="width: 30%;">
            <input type="number" class="form-control" v-model="variantObj.stock" placeholder="Stok" min="0" style="width: 25%;">
            <button class="btn btn-outline-danger" style="width: 15%;" @click="removeVariant(i)"><i class="bi bi-trash"></i></button>
          </div>
          <button class="btn btn-outline-dark btn-sm w-100 mt-1 font-b612" @click="addVariant">+ Tambah Detail Varian</button>
        </div>

        <div class="mb-4">
          <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Harga (Rp)</label>
          <input type="number" class="form-control" v-model="form.price" placeholder="0" min="0" step="1000">
        </div>

        <button class="btn btn-dark w-100 py-2 font-b612" style="font-size: 14px; letter-spacing: 1px;" @click="saveProduct">
          {{ isEdit ? 'SIMPAN PERUBAHAN' : 'SIMPAN PRODUK' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { apiGetProductDetail, BASE_URL } from '../../composables/api'
import { useToast } from '../../composables/useToast'
import { useAuthStore } from '../../stores/auth'
import { ASSET_URL } from '../../composables/api'

const router = useRouter()
const route = useRoute()
const toast = useToast()
const auth = useAuthStore()

const productId = computed(() => route.query.id)
const isEdit = computed(() => !!productId.value)

const previewImages = ref([null, null, null])
const imageFiles = ref([null, null, null]) // To store actual File objects
const form = reactive({
  productCode: '',
  category: '',
  name: '',
  price: '',
  variants: [{ size: '', color: '', stock: 0 }]
})

onMounted(async () => {
  if (!auth.token) { router.push('/login'); return }
  if (isEdit.value) {
    const product = await apiGetProductDetail(productId.value)
    if (product) {
      form.productCode = product.code || product.id
      form.category = product.category || 'T-Shirts'
      form.name = product.name
      form.price = product.price
      if (product.stocks && product.stocks.length) {
        form.variants = product.stocks.map(s => ({ size: s.size, color: s.color, stock: s.stock }))
      } else {
        form.variants = [{ size: 'All Size', color: 'Default', stock: product.stock || 0 }]
      }
      previewImages.value[0] = product.image ? (product.image.startsWith('http') ? product.image : `${ASSET_URL}${product.image}`) : null
    }
  }
})

function handleImageUpload(event, index) {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran File Besar', 'Maksimal ukuran foto adalah 2MB')
      return
    }
    imageFiles.value[index] = file
    const reader = new FileReader()
    reader.onload = e => {
      previewImages.value[index] = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function removeImage(index) {
  previewImages.value[index] = null
  imageFiles.value[index] = null
}

function addVariant() {
  form.variants.push({ size: '', color: '', stock: 0 })
}

function removeVariant(index) {
  form.variants.splice(index, 1)
}

async function saveProduct() {
  if (!form.name || !form.price || !form.category) {
    toast.error('Data Tidak Lengkap', 'Harap isi nama, harga, dan jenis produk.')
    return
  }
  
  if (!isEdit.value && !imageFiles.value[0]) {
    toast.error('Gambar Kurang', 'Harap masukkan minimal 1 foto produk (slot pertama).')
    return
  }

  const formData = new FormData()
  formData.append('name', form.name)
  formData.append('price', form.price)
  formData.append('variants', JSON.stringify(form.variants))
  
  if (imageFiles.value[0]) {
    formData.append('image', imageFiles.value[0])
  }

  if (isEdit.value) {
    formData.append('_method', 'PUT') // Laravel PUT request via POST + _method
  }

  const endpoint = isEdit.value ? `${BASE_URL}/products/${productId.value}` : `${BASE_URL}/products`

  try {
    const res = await fetch(endpoint, {
      method: 'POST', // always POST for FormData with file (use _method=PUT for update)
      headers: {
        Authorization: `Bearer ${auth.token}`,
        Accept: 'application/json'
      },
      body: formData
    })
    
    const responseText = await res.text()
    const jsonStart = responseText.indexOf('{')
    const cleanText = jsonStart !== -1 ? responseText.substring(jsonStart) : responseText

    let result = {}
    try {
      result = JSON.parse(cleanText)
    } catch (parseError) {
      console.error('Response is not valid JSON:', responseText)
      toast.error('Server Error', `Server returned invalid JSON (Status ${res.status}).`)
      return
    }

    if (res.ok) {
      toast.success('Berhasil', isEdit.value ? 'Produk berhasil diubah' : 'Produk berhasil ditambahkan')
      router.push('/admin')
    } else {
      toast.error('Gagal', result.message || 'Gagal menyimpan produk')
    }
  } catch (error) {
    console.error('Save product request failed:', error)
    toast.error('Error', 'Terjadi kesalahan jaringan: ' + error.message)
  }
}
</script>