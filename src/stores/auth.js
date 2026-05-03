import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BASE_URL } from '../composables/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || null)
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setToken(t) {
    token.value = t
    if (t) localStorage.setItem('auth_token', t)
    else localStorage.removeItem('auth_token')
  }

  async function fetchUser() {
    if (!token.value) return null
    try {
      const res = await fetch(`${BASE_URL}/user`, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token.value}` }
      })
      if (res.ok) {
        const data = await res.json()
        user.value = data.data || data
        return user.value
      }
    } catch {}
    return null
  }

  async function logout() {
    if (token.value) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: { Accept: 'application/json', Authorization: `Bearer ${token.value}` }
        })
      } catch {}
    }
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('ambatysm_checkout')
  }

  return { token, user, isLoggedIn, isAdmin, setToken, fetchUser, logout }
})
