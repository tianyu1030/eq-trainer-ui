/** ====== 对话状态管理（Pinia Store） ====== */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Scene, ChatMsg, Report } from '@/types'
import { fetchScenes, startChat, endChat, streamChat } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
  // ---- 状态 ----
  const scenes = ref<Scene[]>([])
  const messages = ref<ChatMsg[]>([])
  const sessionId = ref<number | null>(null)
  const streaming = ref(false)
  const currentSceneName = ref('')

  // ---- 动作 ----
  async function loadScenes() {
    scenes.value = await fetchScenes()
  }

  async function beginPractice(sceneId: number, sceneName: string) {
    const d = await startChat(sceneId)
    sessionId.value = d.sessionId
    currentSceneName.value = sceneName
    messages.value = [{ role: 'ai', text: d.opening }]
  }

  /** 发送消息并流式接收 AI 回复 */
  async function sendMessage(text: string): Promise<void> {
    if (!sessionId.value) throw new Error('无活动会话')
    messages.value.push({ role: 'user', text })
    streaming.value = true

    // 先插入占位消息，流式更新其文本
    const aiMsg: ChatMsg = { role: 'ai', text: '' }
    messages.value.push(aiMsg)
    const idx = messages.value.length - 1

    try {
      await streamChat(sessionId.value, text, (token) => {
        messages.value[idx].text += token
      })
    } catch (e: any) {
      messages.value[idx].text = '[系统提示] ' + e.message
    } finally {
      streaming.value = false
    }
  }

  /** 结束练习，返回评分报告 */
  async function finishPractice(): Promise<Report> {
    if (!sessionId.value) throw new Error('无活动会话')
    const report = await endChat(sessionId.value)
    sessionId.value = null
    return report
  }

  function reset() {
    sessionId.value = null
    messages.value = []
    streaming.value = false
    currentSceneName.value = ''
  }

  return { scenes, messages, sessionId, streaming, currentSceneName, loadScenes, beginPractice, sendMessage, finishPractice, reset }
})
