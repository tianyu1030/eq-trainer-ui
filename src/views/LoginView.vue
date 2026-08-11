<!-- ====== 登录页 ====== -->
<template>
  <div class="auth-card">
    <h2>🔑 登录</h2>
    <div class="field">
      <label>邮箱</label>
      <input v-model="email" type="email" placeholder="your@email.com" @keyup.enter="submit" />
    </div>
    <div class="field">
      <label>密码</label>
      <input v-model="password" type="password" placeholder="输入密码" @keyup.enter="submit" />
    </div>
    <button class="btn btn-prim btn-block" @click="submit" :disabled="loading">
      {{ loading ? '登录中…' : '登录' }}
    </button>
    <div class="switch">
      还没账号？<router-link to="/register">去注册</router-link>
    </div>
    <div v-if="error" style="color:var(--red);font-size:13px;text-align:center;margin-top:8px">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!email.value || !password.value) { error.value = '请完整填写'; return }
  loading.value = true; error.value = ''
  try {
    await auth.doLogin(email.value, password.value)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
