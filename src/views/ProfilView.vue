<template>
  <div class="bg-light">
    <nav class="navbar navbar-expand-lg bg-white py-3 sticky-top shadow-sm">
      <div class="container-fluid d-flex justify-content-center">
        <router-link to="/" class="brand-logo-ambatysm position-absolute top-50 start-50 translate-middle">AMBATYSM</router-link>
      </div>
    </nav>

    <main class="container mt-4 mb-5" style="max-width:600px;">
      <div class="bg-white p-4 rounded shadow-sm border mb-3 text-center position-relative">
        <a href="#" class="position-absolute top-0 end-0 m-3 text-secondary" @click.prevent="showEditModal = true">
          <i class="bi bi-pencil-square fs-5"></i>
        </a>
        <div class="position-relative d-inline-block mb-3 mt-2">
          <div class="bg-secondary rounded-circle d-flex align-items-center justify-content-center" style="width:100px;height:100px;opacity:0.2;">
            <i class="bi bi-person-fill text-dark" style="font-size:4rem;"></i>
          </div>
        </div>
        <h4 class="font-b612 fw-bold m-0">{{ user?.name || '' }}</h4>
      </div>

      <div class="bg-white p-4 rounded shadow-sm border mb-3">
        <div class="d-flex gap-3 mb-2">
          <i class="bi bi-geo-alt-fill fs-5"></i>
          <h6 class="font-b612 fw-bold mb-0 mt-1">Alamat</h6>
        </div>
        <p class="text-secondary ms-4 ps-2 mb-0" style="font-size:14px;">{{ user?.address || 'Alamat belum diatur. Klik icon pensil untuk mengubah.' }}</p>
      </div>

      <div class="bg-white p-4 rounded shadow-sm border">
        <div class="d-flex mb-3">
          <span class="text-secondary d-inline-block" style="width:70px;font-size:14px;">No. HP</span>
          <span style="font-size:14px;">: <span class="text-decoration-underline ms-1">{{ user?.phone || '-' }}</span></span>
        </div>
        <div class="d-flex mb-4">
          <span class="text-secondary d-inline-block" style="width:70px;font-size:14px;">Email</span>
          <span style="font-size:14px;">: <span class="text-decoration-underline ms-1">{{ user?.email || '-' }}</span></span>
        </div>
        <a href="#" class="text-secondary fw-bold text-decoration-underline" style="font-size:14px;" @click.prevent="handleLogout">Logout</a>
      </div>
    </main>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="modal fade show d-block" tabindex="-1" style="background:rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h5 class="modal-title font-b612 fw-bold">Edit Profil</h5>
            <button type="button" class="btn-close" @click="showEditModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size:13px;">Nama Lengkap</label>
              <input type="text" class="form-control" v-model="editForm.name">
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size:13px;">Alamat Lengkap</label>
              <textarea class="form-control" v-model="editForm.address" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size:13px;">No. Handphone</label>
              <input type="tel" class="form-control" v-model="editForm.phone">
            </div>
            <div class="mb-3">
              <label class="form-label font-b612 text-secondary" style="font-size:13px;">Email</label>
              <input type="email" class="form-control" v-model="editForm.email">
            </div>
          </div>
          <div class="modal-footer border-0 pb-4 px-4">
            <button class="btn btn-light font-b612 flex-grow-1" @click="showEditModal = false">Batal</button>
            <button class="btn btn-dark font-b612 flex-grow-1" @click="saveProfile">Simpan</button>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BottomNav from '../components/BottomNav.vue'
import AppFooter from '../components/AppFooter.vue'
import { useAuthStore } from '../stores/auth'
import { useToast } from '../composables/useToast'

const auth = useAuthStore()
const router = useRouter()
const toast = useToast()

const user = ref(null)
const showEditModal = ref(false)
const editForm = reactive({ name: '', address: '', phone: '', email: '' })

onMounted(async () => {
  user.value = await auth.fetchUser()
  if (!user.value) { router.push('/login'); return }
  Object.assign(editForm, {
    name: user.value.name || '',
    address: user.value.address || '',
    phone: user.value.phone || '',
    email: user.value.email || ''
  })
})

function saveProfile() {
  // Mirror values to user display (actual API call can be added)
  Object.assign(user.value, editForm)
  showEditModal.value = false
  toast.success('Berhasil', 'Profil diperbarui.')
}

async function handleLogout() {
  toast.info('Memproses', 'Sedang keluar dari akun...')
  await auth.logout()
  router.push('/login')
}
</script>
