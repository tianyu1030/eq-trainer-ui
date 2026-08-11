/** ====== 认证状态管理（Pinia Store） ====== */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { sendCode as apiSendCode, register as apiRegister, login as apiLogin } from '@/api/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // ---- 状态 ----
  const token = ref(sessionStorage.getItem('eq_token') || '')
  const refreshToken = ref(localStorage.getItem('eq_refresh') || '')
  const user = ref<UserInfo | null>(
    JSON.parse(localStorage.getItem('eq_user') || 'null')
  )

  const isLoggedIn = computed(() => !!token.value)

  // ---- 动作 ----
  function setToken(access: string, refresh: string) {
    token.value = access
    refreshToken.value = refresh
    sessionStorage.setItem('eq_token', access)
    localStorage.setItem('eq_refresh', refresh)
  }

  function setUser(u: UserInfo) {
    user.value = u
    localStorage.setItem('eq_user', JSON.stringify(u))
  }

  async function sendCode(email: string, bizType: 'register' | 'reset') {
    await apiSendCode(email, bizType)
  }

  async function doRegister(email: string, code: string, password: string, nickname?: string) {
    const d = await apiRegister(email, code, password, nickname)
    setToken(d.accessToken, d.refreshToken)
    setUser(d.userInfo)
    router.push('/practice')
  }

  async function doLogin(email: string, password: string) {
    const d = await apiLogin(email, password)
    setToken(d.accessToken, d.refreshToken)
    setUser(d.userInfo)
    router.push('/practice')
  }

  function logout() {
    token.value = ''
    refreshToken.value = ''
    user.value = null
    sessionStorage.removeItem('eq_token')
    localStorage.removeItem('eq_refresh')
    localStorage.removeItem('eq_user')
    router.push('/login')
  }

  return { token, refreshToken, user, isLoggedIn, setToken, setUser, sendCode, doRegister, doLogin, logout }
})
