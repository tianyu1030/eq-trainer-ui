/** ====== 认证 API ====== */
import { apiNoAuth } from './request'
import type { LoginResp } from '@/types'

/** 发送邮箱验证码 */
export function sendCode(email: string, bizType: 'register' | 'reset') {
  return apiNoAuth<void>('POST', '/auth/send-code', { email, bizType })
}

/** 注册 */
export function register(email: string, code: string, password: string, nickname?: string) {
  return apiNoAuth<LoginResp>('POST', '/auth/register', { email, code, password, nickname: nickname || undefined })
}

/** 登录 */
export function login(email: string, password: string) {
  return apiNoAuth<LoginResp>('POST', '/auth/login', { email, password })
}
