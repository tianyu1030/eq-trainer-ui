<!-- ====== 根组件：未登录显示 auth 页，已登录显示侧栏+顶栏布局 ====== -->
<template>
  <div v-if="!auth.isLoggedIn" class="auth-page">
    <router-view />
  </div>
  <div v-else class="layout">
    <!-- 左侧导航 -->
    <aside class="sidebar">
      <div class="logo">🎯 情商训练室</div>
      <router-link to="/practice" class="nav-link" active-class="active">🎭 沟通练习</router-link>
      <router-link to="/knowledge" class="nav-link" active-class="active">📚 知识库</router-link>
      <router-link to="/history" class="nav-link" active-class="active">📈 练习记录</router-link>
    </aside>
    <!-- 主区域 -->
    <div class="main">
      <div class="topbar">
        <span>{{ auth.user?.nickname || auth.user?.email }}</span>
        <button class="btn btn-out btn-sm" @click="auth.logout()">退出</button>
      </div>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
