import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BASE_URL } from '../composables/api'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const auth = useAuthStore()

  const cartCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  async function fetchCart() {
    if (!auth.token) {
      items.value = []
      return
    }
    loading.value = true
    try {
      const res = await fetch(`${BASE_URL}/cart`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` }
      })
      if (res.status === 401) {
        auth.logout()
        items.value = []
        return
      }
      const data = await res.json()
      items.value = data.data || []
    } catch (e) {
      console.error('Failed to fetch cart:', e)
    } finally {
      loading.value = false
    }
  }

  return { items, loading, cartCount, fetchCart }
})
