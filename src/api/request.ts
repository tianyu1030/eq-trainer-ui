/** ====== API 基础请求封装（自动带 JWT、过期刷新、统一错误处理） ====== */

import type { ApiResult } from '@/types'
import { useAuthStore } from '@/stores/auth'

// 后端接口基础路径（开发时由 Vite proxy 转发，生产可改为绝对 URL）
const BASE = '/api'

/** 标准 JSON 请求 */
export async function api<T>(method: string, path: string, body?: any): Promise<T> {
  const headers: Record<string, string> = {}
  const auth = useAuthStore()
  if (auth.token) headers['Authorization'] = 'Bearer ' + auth.token

  const init: RequestInit = { method, headers }
  if (!headers['Content-Type'] && method !== 'GET') headers['Content-Type'] = 'application/json'
  if (body !== undefined) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body)
  }

  let res = await fetch(BASE + path, init)
  // 401 过期 → 自动刷新
  if (res.status === 401 && auth.refreshToken) {
    const rf = await fetch(BASE + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'refreshToken=' + encodeURIComponent(auth.refreshToken)
    })
    if (rf.ok) {
      const d: ApiResult<{ accessToken: string; refreshToken: string }> = await rf.json()
      if (d.code === 200 && d.data) {
        auth.setToken(d.data.accessToken, d.data.refreshToken)
        headers['Authorization'] = 'Bearer ' + d.data.accessToken
        res = await fetch(BASE + path, init)
      }
    }
  }

  const data: ApiResult<T> = await res.json()
  if (data.code !== 200) {
    if (data.code === 401) { auth.logout() }
    throw new Error(data.msg || '请求失败')
  }
  return data.data
}

/** 无认证请求（发送验证码 / 注册 / 登录） */
export async function apiNoAuth<T>(method: string, path: string, body?: any): Promise<T> {
  const init: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (body !== undefined) init.body = JSON.stringify(body)
  const res = await fetch(BASE + path, init)
  const data: ApiResult<T> = await res.json()
  if (data.code !== 200) throw new Error(data.msg || '请求失败')
  return data.data
}

/** form-urlencoded POST（用于 chat/start、chat/end 等不走 JSON 的接口） */
export async function apiForm<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const auth = useAuthStore()
  const body = new URLSearchParams(params as any).toString()
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + auth.token
    },
    body
  })
  const data: ApiResult<T> = await res.json()
  if (data.code !== 200) throw new Error(data.msg || '请求失败')
  return data.data
}
