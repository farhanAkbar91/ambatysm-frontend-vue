import { reactive } from 'vue'

const toasts = reactive([])

let nextId = 0

export function useToast() {
  function show(type, title, message, duration = 4000) {
    const id = ++nextId
    toasts.push({ id, type, title, message })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx !== -1) toasts.splice(idx, 1)
  }

  return {
    toasts,
    success: (title, msg) => show('success', title, msg),
    error: (title, msg) => show('error', title, msg),
    info: (title, msg) => show('info', title, msg),
    dismiss
  }
}
