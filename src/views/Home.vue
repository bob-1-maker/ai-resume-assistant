<script setup lang="ts">
import { useResumeStore } from '@/store'

const resumeStore = useResumeStore()
</script>

<template>
  <div class="home">
    <h2>欢迎使用 AI 简历助手</h2>
    <p>开始创建您的专业简历</p>
  </div>
</template>

<style scoped>
.home {
  text-align: center;
  padding: 40px;
}
</style>
