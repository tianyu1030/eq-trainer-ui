/** ====== 知识库 API ====== */
import { api } from './request'
import type { PageResult, KbArticle, KbCategory } from '@/types'

export function fetchKbCategories() { return api<KbCategory[]>('GET', '/kb/categories') }

export function fetchKbArticles(params: Record<string, string | number>) {
  const qs = new URLSearchParams(params as any).toString()
  return api<PageResult<KbArticle>>('GET', '/kb/articles?' + qs)
}

export function fetchKbArticle(id: number) { return api<KbArticle>('GET', '/kb/articles/' + id) }

export function toggleKbLike(id: number) { return api<void>('POST', '/kb/articles/' + id + '/like') }
export function toggleKbBookmark(id: number) { return api<void>('POST', '/kb/articles/' + id + '/bookmark') }
