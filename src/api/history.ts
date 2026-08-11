/** ====== 练习历史 API ====== */
import { api } from './request'
import type { PageResult, Report, ChatMsg } from '@/types'

export function fetchHistory(page = 1, size = 10) {
  return api<PageResult<Report>>('GET', `/history?page=${page}&size=${size}`)
}

export function fetchReport(sessionId: number) {
  return api<Report>('GET', '/history/' + sessionId)
}

/** 对话回放（完整消息记录） */
export function fetchTranscript(sessionId: number) {
  return api<{ role: string; content: string }[]>('GET', '/history/' + sessionId + '/messages')
}

export function clearHistory() { return api<void>('DELETE', '/history') }
