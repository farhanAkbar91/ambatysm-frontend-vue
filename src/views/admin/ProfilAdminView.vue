<template>
  <div class="bg-light min-vh-100">
    <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid d-flex justify-content-center align-items-center">
        <router-link to="/admin" class="navbar-brand m-0">
          <span class="text-uppercase font-italiana" style="letter-spacing: 2.5px; font-size: 26px; color: black;">Ambatysm</span>
        </router-link>
      </div>
    </nav>

    <main class="container mt-4 mb-5" style="max-width: 600px;">
      <!-- Avatar & Nama Toko -->
      <div class="bg-white p-4 rounded shadow-sm border mb-3 text-center position-relative">
        <button class="btn btn-link position-absolute top-0 end-0 m-3 text-secondary" @click="showEditModal = true">
          <i class="bi bi-pencil-square fs-5"></i>
        </button>
        <div class="position-relative d-inline-block mb-3 mt-2">
          <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 90px; height: 90px; opacity: 0.2;">
            <i class="bi bi-shop text-dark" style="font-size: 3rem;"></i>
          </div>
        </div>
        <h4 class="font-b612 fw-bold m-0">{{ profile.storeName }}</h4>
      </div>

      <!-- Alamat Toko -->
      <div class="bg-white p-4 rounded shadow-sm border mb-3">
        <div class="d-flex gap-3 mb-2">
          <i class="bi bi-geo-alt-fill fs-5"></i>
          <h6 class="font-b612 fw-bold mb-0 mt-1">Alamat</h6>
        </div>
        <p class="text-secondary ms-4 ps-2 mb-0" style="font-size: 14px;">{{ profile.address || 'Belum diatur' }}</p>
      </div>

      <!-- Dompet -->
      <div class="bg-white p-4 rounded shadow-sm border mb-3">
        <div class="d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-wallet2 text-dark fs-5"></i>
          <span class="fw-bold font-b612 text-dark">Dompet</span>
        </div>
        <p class="fs-4 fw-bold text-dark mb-3">{{ formatRupiah(profile.walletBalance) }}</p>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-dark btn-sm flex-grow-1 font-b612">Tarik Dana</button>
          <button class="btn btn-outline-dark btn-sm flex-grow-1 font-b612">Riwayat</button>
        </div>
      </div>

      <!-- Kontak & Logout -->
      <div class="bg-white p-4 rounded shadow-sm border">
        <div class="d-flex mb-3">
          <span class="text-secondary d-inline-block" style="width: 70px; font-size: 14px;">No. HP</span>
          <span style="font-size: 14px;">: <span class="text-decoration-underline ms-1">{{ profile.phone || '-' }}</span></span>
        </div>
        <div class="d-flex mb-4">
          <span class="text-secondary d-inline-block" style="width: 70px; font-size: 14px;">Email</span>
          <span style="font-size: 14px;">: <span class="text-decoration-underline ms-1">{{ profile.email || auth.user?.email || '-' }}</span></span>
        </div>
        <button class="btn btn-link text-secondary fw-bold text-decoration-underline p-0" style="font-size: 14px;" @click="doLogout">Logout</button>
      </div>
    </main>

    <!-- MODAL EDIT PROFIL -->
    <div v-if="showEditModal" class="modal-backdrop fade show"></div>
    <div :class="['modal fade', { show: showEditModal }]" :style="{ display: showEditModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title font-b612 fw-bold">Edit Profil Toko</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Nama Toko</label>
              <input type="text" class="form-control" v-model="editForm.storeName">
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Alamat Lengkap</label>
              <textarea class="form-control" rows="3" v-model="editForm.address"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size: 13px;">No. Handphone</label>
              <input type="tel" class="form-control" v-model="editForm.phone">
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size: 13px;">Email</label>
              <input type="email" class="form-control" v-model="editForm.email">
            </div>
          </div>
          <div class="modal-footer border-0 pb-4 px-4">
            <button type="button" class="btn btn-light font-b612 flex-grow-1" @click="showEditModal = false">Batal</button>
            <button type="button" class="btn btn-dark font-b612 flex-grow-1" @click="saveProfile">Simpan</button>
          </div>
        </div>
      </div>
    </div>

    <AdminBottomNav />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import AdminBottomNav from '../../components/AdminBottomNav.vue'
import { formatRupiah } from '../../composables/api'
import { useAuthStore } from '../../stores/auth'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const profile = reactive({
  storeName: 'Ambatysm Official',
  address: 'Jl. Merdeka No. 123, Jakarta Selatan',
  phone: '081234567890',
  email: 'admin@ambatysm.com',
  walletBalance: 2500000
})

const showEditModal = ref(false)
const editForm = reactive({ ...profile })

onMounted(() => {
  // If backend supports fetching profile
  Object.assign(editForm, profile)
})

function saveProfile() {
  Object.assign(profile, editForm)
  toast.success('Berhasil', 'Profil toko berhasil diperbarui')
  showEditModal.value = false
}

function doLogout() {
  auth.logout()
  router.push('/login')
}
</script>