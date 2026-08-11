<!-- ====== 知识库页 ====== -->
<template>
  <div style="overflow-y:auto;flex:1;padding:20px;">
    <!-- 筛选栏 -->
    <div class="kb-filters">
      <select v-model="query.categoryId" @change="load">
        <option value="">全部分类</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <input v-model="query.keyword" placeholder="搜索文章…" @keyup.enter="load" />
      <select v-model="query.sort" @change="load">
        <option value="latest">最新</option>
        <option value="hot">最热</option>
      </select>
    </div>

    <!-- 文章卡片网格 -->
    <div class="kb-grid" v-if="articles.length">
      <div v-for="a in articles" :key="a.id" class="kb-card" @click="openDetail(a.id)">
        <h3>{{ a.title }}</h3>
        <div class="meta">
          <span>{{ a.categoryName }}</span>
          <span>👁 {{ a.viewCount }}</span>
          <span>❤ {{ a.likeCount }}</span>
        </div>
        <div style="font-size:13px;color:var(--text-light);line-height:1.5;margin-top:6px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">{{ a.summary }}</div>
        <div style="margin-top:8px;display:flex;gap:6px;">
          <button class="btn btn-sm btn-out" :class="{liked:a.liked}" @click.stop="like(a.id)">{{ a.liked ? '❤' : '🤍' }}</button>
          <button class="btn btn-sm btn-out" @click.stop="bookmark(a.id)">🔖</button>
        </div>
      </div>
    </div>
    <div v-else class="empty">暂无文章</div>

    <!-- 分页 -->
    <div style="text-align:center;margin-top:16px;" v-if="totalPages > 1">
      <button v-for="p in totalPagesArr" :key="p" class="btn btn-sm"
              :class="p===page?'btn-prim':'btn-out'" @click="page=p;load()">{{ p }}</button>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="detail" class="modal-mask" @click.self="detail=null">
      <div class="modal">
        <button class="modal-close" @click="detail=null">&times;</button>
        <h2 style="color:var(--prim);margin-bottom:8px;">{{ detail.title }}</h2>
        <div class="meta" style="margin-bottom:12px;"><span>{{ detail.categoryName }}</span><span>👁 {{ detail.viewCount }}</span><span>❤ {{ detail.likeCount }}</span></div>
        <div style="line-height:1.8;color:var(--text-light);white-space:pre-wrap;">{{ detail.content }}</div>
        <div style="margin-top:16px;display:flex;gap:10px;">
          <button class="btn btn-sm btn-out" @click="like(detail.id)">{{ detail.liked ? '❤ 已赞' : '🤍 点赞' }}</button>
          <button class="btn btn-sm btn-out" @click="bookmark(detail.id)">🔖 收藏</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchKbCategories, fetchKbArticles, fetchKbArticle, toggleKbLike, toggleKbBookmark } from '@/api/kb'
import type { KbArticle, KbCategory } from '@/types'

const categories = ref<KbCategory[]>([])
const articles = ref<KbArticle[]>([])
const detail = ref<KbArticle | null>(null)
const query = reactive({ categoryId: '', keyword: '', sort: 'latest' })
const page = ref(1)
const total = ref(0)
const totalPages = computed(() => Math.ceil(total.value / 12))
const totalPagesArr = computed(() => Array.from({length: Math.min(totalPages.value, 10)}, (_, i) => i + 1))

onMounted(() => { loadCats(); load() })
async function loadCats() { categories.value = await fetchKbCategories() }

async function load() {
  const d = await fetchKbArticles({
    page: page.value, size: 12, sort: query.sort,
    ...(query.categoryId ? { categoryId: Number(query.categoryId) } : {}),
    ...(query.keyword ? { keyword: query.keyword } : {}),
  })
  articles.value = d.list; total.value = d.total
}

async function openDetail(id: number) {
  detail.value = await fetchKbArticle(id)
}

async function like(id: number) {
  await toggleKbLike(id)
  load()  // 刷新列表/详情中的 liked 状态
  if (detail.value?.id === id) detail.value.liked = !detail.value.liked
}

async function bookmark(id: number) {
  await toggleKbBookmark(id)
}
</script>
