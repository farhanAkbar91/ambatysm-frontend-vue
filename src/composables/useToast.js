import { ref } from 'vue'

const toasts = ref([])

let nextId = 0

export function useToast() {
  function show(type, title, message, duration = 4000) {
    const id = ++nextId
    toasts.value = [...toasts.value, { id, type, title, message }]
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    success: (title, msg) => show('success', title, msg),
    error: (title, msg) => show('error', title, msg),
    info: (title, msg) => show('info', title, msg),
    dismiss
  }
}

