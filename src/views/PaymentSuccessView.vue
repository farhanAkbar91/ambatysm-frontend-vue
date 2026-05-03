<template>
  <div>
    <div class="shop-header">
      <router-link to="/" class="shop-header__btn"><i class="bi bi-x-lg"></i></router-link>
      <h1 class="shop-header__title">PEMBAYARAN</h1>
      <div style="width:40px;"></div>
    </div>

    <div class="success-container">
      <div class="success-checkmark">
        <div class="success-checkmark__circle">
          <svg class="success-checkmark__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle class="success-checkmark__circle-bg" cx="26" cy="26" r="25" fill="none"/>
            <path class="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
      </div>

      <h2 class="success-title">SUCCESSFULL</h2>
      <p class="success-subtitle">Pembayaran anda telah terverifikasi</p>

      <div class="success-summary">
        <div class="success-summary__row">
          <span>No. Pesanan</span>
          <span>{{ orderNumber }}</span>
        </div>
        <div class="success-summary__row">
          <span>Total Dibayar</span>
          <span class="success-summary__total">{{ formatRupiah(total) }}</span>
        </div>
        <div class="success-summary__row">
          <span>Metode</span>
          <span>{{ method }}</span>
        </div>
      </div>

      <router-link to="/" class="success-btn success-btn--primary">Kembali ke Beranda</router-link>
    </div>

    <canvas ref="confettiCanvas" class="success-confetti"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatRupiah } from '../composables/api'

const orderNumber = ref(localStorage.getItem('ambatysm_order_number') || 'AMB-00000000-000')
const total = ref(parseInt(localStorage.getItem('ambatysm_payment_total') || '0'))
const method = ref(localStorage.getItem('ambatysm_payment_method') || 'QRIS')
const confettiCanvas = ref(null)

onMounted(() => launchConfetti())

function launchConfetti() {
  const canvas = confettiCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const colors = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e67e22', '#222222']
  const particles = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    w: Math.random() * 10 + 5,
    h: Math.random() * 6 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    rotate: Math.random() * 360,
    rotateSpeed: (Math.random() - 0.5) * 10,
    opacity: 1
  }))

  let frame = 0
  const maxFrames = 180

  function animate() {
    frame++
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rotate += p.rotateSpeed
      if (frame > maxFrames - 60) p.opacity = Math.max(0, p.opacity - 0.02)
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotate * Math.PI) / 180)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })
    if (frame < maxFrames) requestAnimationFrame(animate)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  animate()
}
</script>
