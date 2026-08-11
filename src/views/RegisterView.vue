<!-- ====== 注册页（邮箱 + 验证码） ====== -->
<template>
  <div class="auth-card">
    <h2>📮 注册情商训练室</h2>
    <div class="field">
      <label>邮箱</label>
      <input v-model="email" type="email" placeholder="your@email.com" />
    </div>
    <div class="field" style="display:flex;gap:8px;">
      <input v-model="code" placeholder="验证码" style="flex:1" />
      <button class="btn btn-out btn-sm" style="white-space:nowrap" :disabled="codeSending" @click="send">
        {{ codeBtnText }}
      </button>
    </div>
    <div class="field">
      <label>密码（6～32 位）</label>
      <input v-model="password" type="password" placeholder="输入密码" />
    </div>
    <div class="field">
      <label>昵称（选填）</label>
      <input v-model="nickname" placeholder="你的昵称" />
    </div>
    <button class="btn btn-prim btn-block" @click="submit" :disabled="loading">
      {{ loading ? '注册中…' : '注册' }}
    </button>
    <div class="switch">
      已有账号？<router-link to="/login">去登录</router-link>
    </div>
    <div v-if="error" style="color:var(--red);font-size:13px;text-align:center;margin-top:8px">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const email = ref(''), code = ref(''), password = ref(''), nickname = ref('')
const loading = ref(false), error = ref(''), codeSending = ref(false), codeBtnText = ref('获取验证码')

let timer = 0

async function send() {
  if (!email.value) { error.value = '请填写邮箱'; return }
  codeSending.value = true; error.value = ''
  try {
    await auth.sendCode(email.value, 'register')
    let s = 60
    codeBtnText.value = s + 's'
    timer = window.setInterval(() => {
      s--
      codeBtnText.value = s > 0 ? s + 's' : '获取验证码'
      if (s <= 0) { clearInterval(timer); codeSending.value = false }
    }, 1000)
  } catch (e: any) {
    error.value = e.message
    codeSending.value = false; codeBtnText.value = '获取验证码'
  }
}

async function submit() {
  if (!email.value || !code.value || !password.value) { error.value = '请完整填写'; return }
  loading.value = true; error.value = ''
  try {
    await auth.doRegister(email.value, code.value, password.value, nickname.value || undefined)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
