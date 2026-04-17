<script setup lang="ts">
// 骨架屏组件
</script>

<template>
  <div class="skeleton-container">
    <!-- 头部骨架 -->
    <div class="skeleton-header">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-header-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-subtitle"></div>
      </div>
    </div>
    
    <!-- 内容区块骨架 -->
    <div class="skeleton-section">
      <div class="skeleton-section-title"></div>
      <div class="skeleton-item">
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    
    <div class="skeleton-section">
      <div class="skeleton-section-title"></div>
      <div class="skeleton-item">
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
      <div class="skeleton-item">
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
    
    <div class="skeleton-section">
      <div class="skeleton-section-title"></div>
      <div class="skeleton-item">
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.skeleton-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eaeaea;
}

.skeleton-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  margin-right: 20px;
}

.skeleton-header-content {
  flex: 1;
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 10px;
  width: 60%;
}

.skeleton-subtitle {
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  width: 40%;
}

.skeleton-section {
  margin-bottom: 30px;
}

.skeleton-section-title {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 15px;
  width: 30%;
}

.skeleton-item {
  margin-bottom: 20px;
}

.skeleton-text {
  height: 14px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 100%;
}

.skeleton-text:nth-child(2) {
  width: 80%;
}

.skeleton-text:nth-child(3) {
  width: 60%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>