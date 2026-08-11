<!-- ====== 沟通练习页 ====== -->
<template>
  <!-- 场景选择 -->
  <div style="display:flex;gap:6px;overflow-x:auto;padding:12px 20px 8px;">
    <button v-for="s in chat.scenes" :key="s.id" class="btn btn-out btn-sm"
            style="white-space:nowrap" @click="start(s.id, s.name)">
      {{ s.name }}
    </button>
  </div>

  <!-- 对话区 -->
  <div class="chat-box" ref="chatBoxRef">
    <div v-if="!chat.messages.length" class="empty">👈 先选择一个场景开始练习</div>
    <div v-for="(m, i) in chat.messages" :key="i" :class="['chat-msg', m.role]">
      {{ m.text }}
    </div>
  </div>

  <!-- 输入区 -->
  <div class="input-area" v-if="chat.sessionId">
    <input v-model="msg" placeholder="输入你的回应…" :disabled="chat.streaming"
           @keyup.enter="send" />
    <button class="btn btn-prim" :disabled="!msg.trim() || chat.streaming" @click="send">发送</button>
    <button class="btn btn-out" :disabled="chat.streaming" @click="end">结束并评分</button>
    <button class="btn btn-out" @click="chat.reset()">重置</button>
  </div>

  <!-- 评分报告弹窗 -->
  <div v-if="report" class="modal-mask" @click.self="report = null">
    <div class="modal">
      <button class="modal-close" @click="report = null">&times;</button>
      <h2 style="color:var(--prim);margin-bottom:12px;">📊 练习评估报告</h2>
      <div style="text-align:center;font-size:36px;font-weight:700;color:var(--prim);margin-bottom:4px;">
        {{ report.totalScore }}<span style="font-size:16px;color:var(--text-light)"> / 10</span>
      </div>
      <div style="text-align:center;font-size:12px;color:var(--text-light);margin-bottom:16px;">AI模型：{{ report.aiModel }}</div>
      <div v-for="s in subList" :key="s.name" class="sub-bar">
        <span class="label">{{ s.name }}</span>
        <div class="bar"><div class="fill" :style="{width:((s.val??0)*10)+'%'}"></div></div>
        <span>{{ s.val }}</span>
      </div>
      <div v-if="report.highlights?.length" class="report-section"><h4>✨ 亮点</h4><ul class="report-items"><li v-for="h in report.highlights" :key="h">{{ h }}</li></ul></div>
      <div v-if="report.suggestions?.length" class="report-section"><h4>💡 改进建议</h4><ul class="report-items"><li v-for="s in report.suggestions" :key="s">{{ s }}</li></ul></div>
      <div v-if="report.vocabReview?.length" class="report-section"><h4>📝 关键词汇复盘</h4><ul class="report-items"><li v-for="v in report.vocabReview" :key="v">{{ v }}</li></ul></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { Report } from '@/types'

const chat = useChatStore()
const msg = ref('')
const report = ref<Report | null>(null)
const chatBoxRef = ref<HTMLElement>()

const subList = computed(() => [
  { name: '情绪感知', val: report.value?.subEmotion },
  { name: '共情回应', val: report.value?.subEmpathy },
  { name: '建设性沟通', val: report.value?.subConstructive },
  { name: '表达柔和度', val: report.value?.subSoftness },
])

onMounted(() => { chat.loadScenes() })

async function start(id: number, name: string) {
  chat.reset()
  await chat.beginPractice(id, name)
  scrollDown()
}

async function send() {
  const t = msg.value.trim()
  if (!t || chat.streaming) return
  msg.value = ''
  await chat.sendMessage(t)
  scrollDown()
}

async function end() {
  if (!chat.sessionId) return
  report.value = await chat.finishPractice()
}

function scrollDown() {
  nextTick(() => {
    if (chatBoxRef.value) chatBoxRef.value.scrollTop = chatBoxRef.value.scrollHeight
  })
}
</script>
