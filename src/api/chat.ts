/** ====== 对话 API ====== */
import { api, apiForm } from './request'
import type { Scene, ChatStartResp, Report } from '@/types'

/** 场景列表 */
export function fetchScenes() { return api<Scene[]>('GET', '/scenes') }

/** 自定义场景 */
export function createCustomScene(name: string, object: string, opening: string) {
  return apiForm<number>('/scenes/custom', { name, object, opening })
}

/** 新建会话 */
export function startChat(sceneId: number) {
  return apiForm<ChatStartResp>('/chat/start', { sceneId })
}

/** 结束会话并获取报告 */
export function endChat(sessionId: number) {
  return apiForm<Report>('/chat/end', { sessionId })
}

/** SSE 流式对话：返回异步可读流，调用方逐段读取 AI 回复 */
export async function streamChat(sessionId: number, message: string, onToken: (t: string) => void): Promise<void> {
  const auth = (await import('@/stores/auth')).useAuthStore()
  const url = `/api/chat/stream?sessionId=${sessionId}&message=${encodeURIComponent(message)}`
  const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + auth.token } })
  if (!res.ok) throw new Error('SSE 连接失败')
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const token = line.slice(5).trim()
        if (token && token !== '[DONE]') onToken(token)
      }
    }
  }
}
