<template>
  <div>
    <div class="shop-header">
      <router-link to="/checkout" class="shop-header__btn"><i class="bi bi-arrow-left"></i></router-link>
      <h1 class="shop-header__title">PEMBAYARAN</h1>
      <div style="width:40px;"></div>
    </div>

    <div class="payment-container">
      <div class="payment-method-badge">
        <i :class="`bi ${methodIcon}`"></i>
        <span>{{ paymentMethod }}</span>
      </div>

      <!-- QR Code -->
      <div class="payment-qr">
        <div class="payment-qr__box">
          <div class="payment-qr__placeholder">
            <i class="bi bi-qr-code-scan"></i>
            <span>Scan QR Code</span>
          </div>
          <div class="payment-qr__pulse"></div>
        </div>
      </div>

      <!-- Countdown -->
      <div class="payment-timer">
        <p class="payment-timer__text">Selesaikan Pembayaran Sebelum</p>
        <div class="payment-timer__countdown">
          <span class="payment-timer__digits">{{ minutes }}</span>
          <span class="payment-timer__separator">:</span>
          <span class="payment-timer__digits">{{ seconds }}</span>
        </div>
        <div class="payment-timer__bar">
          <div class="payment-timer__progress" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>

      <!-- Total -->
      <div class="payment-amount">
        <span class="payment-amount__label">Total Pembayaran</span>
        <span class="payment-amount__value">{{ formatRupiah(total) }}</span>
      </div>

      <!-- Upload Proof -->
      <div class="payment-proof">
        <p class="payment-proof__label">Upload Bukti Pembayaran</p>
        <div class="payment-proof__dropzone" @click="$refs.proofInput.click()">
          <img v-if="proofPreview" :src="proofPreview" class="payment-proof__preview" alt="Bukti">
          <div v-else class="payment-proof__placeholder">
            <i class="bi bi-cloud-arrow-up"></i>
            <span class="payment-proof__placeholder-text">Ketuk untuk upload foto</span>
            <span class="payment-proof__placeholder-sub">JPG, PNG, atau WEBP · Maks. 5MB</span>
          </div>
          <button v-if="proofPreview" type="button" class="payment-proof__change-btn" @click.stop="$refs.proofInput.click()">
            <i class="bi bi-pencil"></i> Ganti Foto
          </button>
        </div>
        <input type="file" ref="proofInput" accept="image/jpeg,image/png,image/webp" style="display:none;" @change="handleProofUpload">
        <p v-if="proofError" class="payment-proof__error">{{ proofError }}</p>
      </div>

      <!-- Confirm -->
      <button class="payment-confirm-btn" @click="confirmPayment">
        <span class="payment-confirm-btn__text">Konfirmasi Pembayaran</span>
        <i class="bi bi-check-circle"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatRupiah } from '../composables/api'

const router = useRouter()

const total = ref(parseInt(localStorage.getItem('ambatysm_payment_total') || '0'))
const paymentMethod = ref(localStorage.getItem('ambatysm_payment_method') || 'QRIS')
const proofPreview = ref('')
const proofError = ref('')

const methodIcons = { QRIS: 'bi-qr-code', COD: 'bi-cash-coin', 'Transfer Bank': 'bi-bank', 'E-Wallet': 'bi-wallet2' }
const methodIcon = computed(() => methodIcons[paymentMethod.value] || 'bi-qr-code')

const MAX_SECONDS = 10 * 60
const remaining = ref(MAX_SECONDS)
let interval = null

const minutes = computed(() => String(Math.floor(remaining.value / 60)).padStart(2, '0'))
const seconds = computed(() => String(remaining.value % 60).padStart(2, '0'))
const progressPct = computed(() => (remaining.value / MAX_SECONDS) * 100)

onMounted(() => {
  interval = setInterval(() => {
    if (remaining.value > 0) remaining.value--
  }, 1000)
})

onUnmounted(() => clearInterval(interval))

function handleProofUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { proofError.value = 'File terlalu besar. Maksimal 5MB.'; return }
  proofError.value = ''
  const reader = new FileReader()
  reader.onload = (ev) => { proofPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

function confirmPayment() {
  const now = new Date()
  const orderNum = 'AMB-' + now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
  localStorage.setItem('ambatysm_order_number', orderNum)
  router.push('/payment-success')
}
</script>
