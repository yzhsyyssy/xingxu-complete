<template>
  <view class="splash-container">
    <!-- 星空背景 -->
    <view class="stars-container">
      <view v-for="(star, index) in stars" :key="index" class="star"
        :style="{ left: star.left + '%', top: star.top + '%', width: star.size + 'px', height: star.size + 'px', opacity: star.opacity }" />
    </view>

    <!-- 主要内容 -->
    <view class="content">
      <text class="time">{{ currentTime }}</text>
      <text class="welcome">欢迎来到星叙</text>
      <text class="star-id">你的编号是 {{ starId }}</text>
    </view>

    <!-- 底部区域 -->
    <view class="footer">
      <text class="footer-text">每一颗星，都有故事</text>
      <view class="button-group">
        <button class="action-btn login-btn" @click="handleLogin">登 录</button>
        <button class="action-btn register-btn" @click="handleRegister">注 册</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 生成星星
const stars = ref(Array.from({ length: 50 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.1
})))

// 响应式数据
const currentTime = ref(new Date().toLocaleTimeString('zh-CN', { hour12: false }))
const starId = ref('HD ' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'))

// 定时器
let timer: number

// 更新时间
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

// 页面跳转
const handleLogin = () => uni.navigateTo({ url: '/pages/login/index' })
const handleRegister = () => uni.navigateTo({ url: '/pages/register/index' })

onMounted(() => {
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style lang="scss">
.splash-container {
  height: 100vh;
  background: linear-gradient(180deg, #1E1E1E 0%, #2A2A2A 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.stars-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 3s infinite;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: min(40rpx, 5vh);
  padding: 0 40rpx;
  text-align: center;
  z-index: 1;
}

.time {
  font-size: min(72rpx, 8vh);
  color: #fff;
  font-weight: 200;
  letter-spacing: 4rpx;
}

.welcome {
  font-size: min(48rpx, 6vh);
  color: #fff;
  font-weight: 300;
  letter-spacing: 6rpx;
}

.star-id {
  font-size: min(32rpx, 4vh);
  color: #B0B0B0;
  letter-spacing: 2rpx;
}

.footer {
  padding-bottom: min(120rpx, 15vh);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: min(40rpx, 5vh);
  z-index: 1;
}

.footer-text {
  font-size: min(28rpx, 3.5vh);
  color: #B0B0B0;
  letter-spacing: 4rpx;
}

.button-group {
  display: flex;
  gap: min(40rpx, 5vh);
}

.action-btn {
  width: min(240rpx, 30vw);
  height: min(80rpx, 10vh);
  border-radius: min(8rpx, 1vh);
  font-size: min(28rpx, 3.5vh);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
}

.login-btn {
  background: #4A3B5E;
  color: #fff;
}

.register-btn {
  background: transparent;
  border: 1px solid #4A3B5E;
  color: #4A3B5E;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
</style> 