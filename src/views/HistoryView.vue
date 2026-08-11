<!-- ====== 练习记录页 ====== -->
<template>
  <div style="overflow-y:auto;flex:1;padding:20px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <button class="btn btn-sm btn-out" @click="load">🔄 刷新</button>
      <button class="btn btn-sm btn-out" style="color:var(--red)" @click="doClear">清空记录</button>
    </div>

    <div v-for="r in items" :key="r.sessionId" class="hist-item" @click="openReport(r.sessionId)">
      <div>
        <div class="name">{{ r.sceneName || '练习' }}</div>
        <div class="date">{{ r.createdAt }}</div>
      </div>
      <div class="score">{{ r.totalScore }}</div>
    </div>
    <div v-if="!items.length" class="empty">暂无练习记录</div>

    <!-- 分页 -->
    <div style="text-align:center;margin-top:12px;" v-if="totalPages > 1">
      <button v-for="p in totalPagesArr" :key="p" class="btn btn-sm"
              :class="p===page?'btn-prim':'btn-out'" @click="page=p;load()">{{ p }}</button>
    </div>

    <!-- 报告弹窗 -->
    <div v-if="reportDetail" class="modal-mask" @click.self="reportDetail=null">
      <div class="modal">
        <button class="modal-close" @click="reportDetail=null">&times;</button>
        <h2 style="color:var(--prim);margin-bottom:12px;">📊 {{ reportDetail.sceneName }} · 评估报告</h2>
        <div style="text-align:center;font-size:36px;font-weight:700;color:var(--prim);margin-bottom:4px;">
          {{ reportDetail.totalScore }}<span style="font-size:16px;color:var(--text-light)"> / 10</span>
        </div>
        <div v-for="s in subItems" :key="s.name" class="sub-bar">
          <span class="label">{{ s.name }}</span><div class="bar"><div class="fill" :style="{width:((s.val??0)*10)+'%'}"></div></div><span>{{ s.val }}</span>
        </div>
        <div v-if="reportDetail.highlights?.length" class="report-section"><h4>✨ 亮点</h4><ul class="report-items"><li v-for="h in reportDetail.highlights" :key="h">{{ h }}</li></ul></div>
        <div v-if="reportDetail.suggestions?.length" class="report-section"><h4>💡 改进建议</h4><ul class="report-items"><li v-for="s in reportDetail.suggestions" :key="s">{{ s }}</li></ul></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchHistory, fetchReport, clearHistory } from '@/api/history'
import type { Report } from '@/types'

const items = ref<Report[]>([])
const reportDetail = ref<Report | null>(null)
const page = ref(1), total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / 10))
const totalPagesArr = computed(() => Array.from({length: Math.min(totalPages.value, 10)}, (_, i) => i + 1))
const subItems = computed(() => [
  { name: '情绪感知', val: reportDetail.value?.subEmotion },
  { name: '共情回应', val: reportDetail.value?.subEmpathy },
  { name: '建设性沟通', val: reportDetail.value?.subConstructive },
  { name: '表达柔和度', val: reportDetail.value?.subSoftness },
])

onMounted(() => load())
async function load() {
  const d = await fetchHistory(page.value)
  items.value = d.list; total.value = d.total
}
async function openReport(id: number) {
  reportDetail.value = await fetchReport(id)
}
async function doClear() {
  if (!confirm('确认清空所有练习记录？此操作不可恢复！')) return
  await clearHistory()
  items.value = []; total.value = 0
}
</script>
