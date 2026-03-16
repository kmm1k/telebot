import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import queryClient from '@/queries/queryClient'

export const TOKEN_KEY = 'tb-token'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const route = useRoute()

  const token = ref(localStorage.getItem(TOKEN_KEY) || undefined)
  const user = ref()

  const isAuthenticated = computed(() => !!token.value)

  async function login(user) {
    try {
      const { data } = await axios.post('/api/login/', {
        username: user.username,
        password: user.password,
      })
      user.value = data.user
      token.value = data.token
      localStorage.setItem(TOKEN_KEY, data.token)

      const next = route.query.next
      if (next && typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
        await router.push(next)
      } else {
        await router.push({
          name: 'messageForwarder',
        })
      }
    } catch (e) {
      reset()
      throw e
    }
  }

  async function logoutLocallyAndRedirectToLogin(next) {
    reset()

    // Clear all connected caches
    queryClient.clear()

    await router.push({
      name: 'login',
      query: {
        next: next === 'login' ? undefined : next,
      },
    })
  }

  async function logout(next) {
    await axios.post('/api/logout/')
    await logoutLocallyAndRedirectToLogin(next)
  }

  const reset = () => {
    localStorage.removeItem(TOKEN_KEY)
    token.value = undefined
    user.value = undefined
  }

  return {
    token,
    isAuthenticated,
    user,
    login,
    logout,
    logoutLocallyAndRedirectToLogin,
  }
})
