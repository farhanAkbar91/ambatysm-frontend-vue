<template>
  <div>
    <div v-if="orders.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-receipt fs-1 d-block mb-2 text-secondary" style="opacity:0.5;"></i>
      <span class="font-b612" style="font-size:14px;">Belum ada pesanan di daftar ini.</span>
    </div>

    <div v-for="order in orders" :key="order.id" class="bg-white p-3 mb-2 border-bottom">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <span class="text-secondary" style="font-size:12px;"><i class="bi bi-calendar3"></i> {{ formatDate(order.created_at) }}</span>
        <span :class="`badge ${badgeClass(order.status)}`" style="font-size:11px;letter-spacing:0.5px;">{{ order.status.toUpperCase() }}</span>
      </div>

      <div class="d-flex align-items-center justify-content-between font-b612">
        <div>
          <h6 class="mb-1 fw-bold" style="font-size:14px;">Order #{{ order.id }}</h6>
          <p class="mb-0 text-muted" style="font-size:12px;">Kurir: {{ order.courier?.toUpperCase() || '-' }}</p>
        </div>
        <div class="text-end">
          <p class="mb-0 text-muted" style="font-size:12px;">Total Belanja</p>
          <h6 class="mb-0 fw-bold">{{ formatRupiah(calcTotal(order)) }}</h6>
        </div>
      </div>

      <div v-if="isAdmin && order.status !== 'cancelled' && order.status !== 'completed'" class="mt-3 pt-3 border-top d-flex gap-2">
        <button class="btn btn-sm btn-outline-danger flex-grow-1 font-b612" @click="$emit('update-status', order.id, 'cancelled')">Batalkan</button>
        <button class="btn btn-sm btn-dark flex-grow-1 font-b612" @click="$emit('update-status', order.id, 'completed')">Selesaikan</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah } from '../composables/api'

const props = defineProps({
  orders: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false }
})
defineEmits(['update-status'])

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function badgeClass(status) {
  if (status === 'paid' || status === 'completed') return 'bg-success'
  if (status === 'cancelled') return 'bg-danger'
  if (status === 'pending') return 'bg-warning text-dark'
  return 'bg-secondary'
}

function calcTotal(order) {
  let total = order.total_amount || order.total_price || 0
  if (total === 0 && order.items?.length > 0) {
    const sub = order.items.reduce((s, i) => {
      const price = i.price || i.product?.price || 0
      return s + price * i.quantity
    }, 0)
    total = sub + (order.shipping_cost || 0)
  }
  return total
}
</script>
