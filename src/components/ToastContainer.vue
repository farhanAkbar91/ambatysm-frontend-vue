<template>
  <div class="ambatysm-toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      :class="`ambatysm-toast ambatysm-toast--${toast.type}`"
    >
      <span class="ambatysm-toast__icon">{{ icons[toast.type] }}</span>
      <div class="ambatysm-toast__content">
        <div class="ambatysm-toast__title">{{ toast.title }}</div>
        <div class="ambatysm-toast__message">{{ toast.message }}</div>
      </div>
      <button class="ambatysm-toast__close" @click="dismiss(toast.id)">✕</button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'

const { toasts, dismiss } = useToast()
const icons = { success: '✅', error: '❌', info: 'ℹ️' }
</script>
