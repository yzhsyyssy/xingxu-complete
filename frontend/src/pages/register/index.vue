<template>
  <view class="register-container">
    <!-- 星空背景 -->
    <view class="stars-container">
      <view 
        v-for="(star, index) in stars" 
        :key="index"
        class="star"
        :style="{ 
          left: star.left + '%', 
          top: star.top + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          opacity: star.opacity
        }"
      />
    </view>

    <!-- 标题区域 -->
    <view class="header-section">
      <text class="title">加入星叙</text>
      <text class="subtitle">成为夜空中的一颗星</text>
    </view>

    <!-- 注册窗口 -->
    <view class="register-window">
      <view class="input-group" v-for="(field, index) in fields" :key="index">
        <input 
          class="register-input"
          :class="{ 'active': activeField === field.name }"
          v-model="formData[field.name]"
          :type="field.type"
          :placeholder="field.placeholder"
          @focus="activeField = field.name"
          @blur="handleBlur(field.name)"
        />
      </view>
      <button class="register-btn" @click="handleRegister">注册并进入</button>
      <text v-if="errorMsg" class="error-msg">{{ errorMsg }}</text>
    </view>

    <!-- 底部区域 -->
    <view class="footer">
      <text class="login-link" @click="handleToLogin">已有账号？去登录</text>
      <text class="slogan">每一颗星，都有故事</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 星星生成
const stars = ref(Array.from({ length: 50 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.1
})))

// 表单配置
const fields = [
  { name: 'email', type: 'text', placeholder: '输入邮箱' },
  { name: 'password', type: 'password', placeholder: '输入注册密码' }
]

// 响应式数据
const formData = reactive({ email: '', password: '' })
const activeField = ref('')
const errorMsg = ref('')

// 邮箱验证
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// 处理输入框失焦
const handleBlur = (fieldName: string) => {
  activeField.value = ''
  if (fieldName === 'email' && formData.email && !isValidEmail(formData.email)) {
    errorMsg.value = '请输入有效邮箱'
    setTimeout(() => errorMsg.value = '', 2000)
  }
}

// 处理注册
const handleRegister = () => {
  if (!formData.email || !formData.password) {
    errorMsg.value = '请填写完整信息'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  if (!isValidEmail(formData.email)) {
    errorMsg.value = '请输入有效邮箱'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  // 生成星星ID
  const newStarId = 'HD ' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  
  // 模拟存储用户信息
  try {
    uni.setStorageSync('starId', newStarId)
    uni.setStorageSync('userEmail', formData.email)
  } catch (e) {
    console.error('保存用户信息失败', e)
  }
  
  // 跳转到场景页面
  uni.redirectTo({ url: '/pages/gallery/index' })
}

// 跳转登录
const handleToLogin = () => uni.navigateTo({ url: '/pages/login/index' })
</script>

<style lang="scss">
.register-container {
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

.header-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: min(20rpx, 2vh);
  z-index: 1;
}

.title {
  font-size: min(48rpx, 6vh);
  color: #fff;
  font-weight: 300;
  letter-spacing: 6rpx;
}

.subtitle {
  font-size: min(32rpx, 4vh);
  color: #B0B0B0;
  font-weight: 300;
}

.register-window {
  flex: 2;
  width: min(600rpx, 85%);
  margin: 0 auto;
  padding: min(40rpx, 4vh);
  background: rgba(46, 46, 46, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid #4A3B5E;
  border-radius: min(16rpx, 2vh);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.input-group {
  width: 85%;
  margin-bottom: min(20rpx, 2vh);
}

.register-input {
  width: 100%;
  height: min(80rpx, 10vh);
  background: #3A3A3A;
  border-radius: min(8rpx, 1vh);
  padding: 0 min(20rpx, 2vh);
  color: #fff;
  font-size: min(28rpx, 3.5vh);
  
  &.active {
    border: 1px solid #4A3B5E;
  }
}

.register-btn {
  width: min(400rpx, 50vw);
  height: min(80rpx, 10vh);
  margin-top: min(20rpx, 2vh);
  background: #4A3B5E;
  border-radius: min(8rpx, 1vh);
  color: #fff;
  font-size: min(28rpx, 3.5vh);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s;
  
  &:active {
    transform: scale(0.95);
  }
}

.error-msg {
  font-size: min(24rpx, 3vh);
  color: #5E3B4A;
  margin-top: min(20rpx, 2vh);
}

.footer {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: min(20rpx, 2vh);
  padding-bottom: min(20rpx, 2vh);
  z-index: 1;
}

.login-link {
  font-size: min(24rpx, 3vh);
  color: #4A3B5E;
  padding: min(10rpx, 1vh);
}

.slogan {
  font-size: min(24rpx, 3vh);
  color: #B0B0B0;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.2); }
}
</style> 