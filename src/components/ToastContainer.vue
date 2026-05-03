<template>
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="`toast toast--${toast.type}`"
    >
      <span class="toast__icon">{{ icons[toast.type] }}</span>
      <div class="toast__content">
        <div class="toast__title">{{ toast.title }}</div>
        <div class="toast__message">{{ toast.message }}</div>
      </div>
      <button class="toast__close" @click="dismiss(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()
const icons = { success: '✅', error: '❌', info: 'ℹ️' }
</script>
