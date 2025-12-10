<template>
  <view class="gallery-container">
    <!-- 背景星空效果 -->
    <view class="star-bg">
      <view 
        v-for="(star, index) in stars" 
        :key="index"
        class="star"
        :style="{ 
          left: star.left + '%', 
          top: star.top + '%',
          width: star.size + 'px',
          height: star.size + 'px',
          opacity: star.opacity,
          animationDelay: star.delay + 's'
        }"
      />
      <view class="stardust-halo"></view>
    </view>

    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="star-id">HD {{ starId }}</text>
      <text class="welcome-text">欢迎回到星叙</text>
      <view class="settings" @tap="showSettings = true">
        <view class="gear-icon"></view>
      </view>
    </view>

    <!-- 场景列表 -->
    <view class="gallery-title">时空画廊</view>
    <scroll-view class="scene-list" scroll-y>
      <view 
        v-for="scene in scenes" 
        :key="scene.id" 
        class="scene-card"
        :style="{ background: scene.gradient }"
        @tap="enterScene(scene.id)"
      >
        <!-- 深夜电台的音符背景 -->
        <view v-if="scene.id === 1" class="music-notes">
          <text class="note">♪</text>
          <text class="note">♫</text>
          <text class="note">♩</text>
          <text class="note">♬</text>
          <text class="note">♪</text>
        </view>
        
        <!-- 雨中漫步的雨滴背景 -->
        <view v-if="scene.id === 2" class="rain-effect">
          <view v-for="i in 20" :key="'rain'+i" class="raindrop"></view>
        </view>
        
        <!-- 星空独白的星星背景 -->
        <view v-if="scene.id === 3" class="star-effect">
          <view v-for="i in 20" :key="'star'+i" class="tiny-star"></view>
          <view class="constellation"></view>
        </view>
        
        <view class="scene-content">
          <view class="scene-header">
            <text class="scene-title">{{ scene.title }}</text>
            <view class="scene-decoration" :class="`decoration-${scene.id}`"></view>
          </view>
          <text class="scene-desc">{{ scene.description }}</text>
          <text class="scene-users">{{ scene.users }}人正在此</text>
          <button class="enter-btn" hover-class="enter-btn-hover">进入时空</button>
        </view>
      </view>
    </scroll-view>

    <!-- 设置菜单 -->
    <view class="settings-menu" v-if="showSettings" @tap.stop="showSettings = false">
      <view class="menu-content" @tap.stop>
        <view class="menu-item" @tap="handleLogout">退出登录</view>
        <view class="menu-item" @tap="handleFeedback">意见反馈</view>
      </view>
    </view>

    <!-- 意见反馈弹窗 -->
    <view class="feedback-overlay" v-if="showFeedback" @tap.stop="closeFeedback">
      <view class="feedback-box" @tap.stop>
        <view class="feedback-title">意见反馈</view>
        <textarea
          class="feedback-input"
          v-model="feedbackText"
          placeholder="说说你的建议或遇到的问题..."
          :maxlength="300"
          auto-height
        />
        <view class="feedback-actions">
          <button class="btn-cancel" @tap="closeFeedback">取消</button>
          <button class="btn-submit" @tap="submitFeedback">提交</button>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :active="0" @tab-change="handleTabChange" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'

// 用户ID - 从登录信息获取或生成新的
const starId = ref('')

// 星背景数据
const stars = ref(Array.from({ length: 50 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  delay: Math.random() * 3
})))

// 场景数据
const scenes = ref([
  {
    id: 1,
    title: '深夜电台',
    description: '在宁静的深夜，与陌生人分享心事',
    users: 12,
    gradient: 'linear-gradient(180deg, #1E2B3E 0%, #0F1724 100%)'
  },
  {
    id: 2,
    title: '雨中漫步',
    description: '雨声伴随着脚步，一起走进回忆',
    users: 8,
    gradient: 'linear-gradient(180deg, #2A3B4C 0%, #1A2B3C 100%)'
  },
  {
    id: 3,
    title: '星空独白',
    description: '仰望星空，倾听内心最真实的声音',
    users: 15,
    gradient: 'linear-gradient(180deg, #2E2E4A 0%, #1E1E3A 100%)'
  }
])

// 响应式状态
const showSettings = ref(false)
const currentScene = ref(null)
const showFeedback = ref(false)
const feedbackText = ref('')

// 进入场景
const enterScene = (sceneId: number) => {
  currentScene.value = sceneId
  
  // 跳转到场景页面
  uni.navigateTo({ 
    url: `/pages/scene/index?id=${sceneId}`
  })
}

// 处理标签变化
const handleTabChange = (index) => {
  if (index === 1 && currentScene.value === null) {
    // 如果点击星空但未加入场景
    uni.showToast({
      title: '请先选择一个时空加入',
      icon: 'none',
      duration: 2000
    })
  }
}

// 退出登录
const handleLogout = () => {
  uni.redirectTo({ url: '/pages/splash/index' })
}

// 意见反馈
const handleFeedback = () => {
  showSettings.value = false
  showFeedback.value = true
}

// 反馈弹窗逻辑
const closeFeedback = () => {
  showFeedback.value = false
}
const submitFeedback = () => {
  const text = feedbackText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }
  try {
    const list = uni.getStorageSync('feedbackList') || []
    const item = { id: Date.now(), text, createdAt: Date.now(), starId: 'HD ' + starId.value }
    if (Array.isArray(list)) {
      list.unshift(item)
      uni.setStorageSync('feedbackList', list)
    } else {
      uni.setStorageSync('feedbackList', [item])
    }
    uni.showToast({ title: '感谢你的反馈', icon: 'none' })
    feedbackText.value = ''
    showFeedback.value = false
  } catch (e) {
    uni.showToast({ title: '保存失败，请稍后再试', icon: 'none' })
  }
}

// 初始化获取星星ID
onMounted(() => {
  try {
    // 从存储中获取用户ID
    const savedId = uni.getStorageSync('starId')
    if (savedId) {
      starId.value = savedId.replace('HD ', '')
    } else {
      // 如果没有存储的ID，生成一个新的
      const newId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      starId.value = newId
      uni.setStorageSync('starId', 'HD ' + newId)
    }
  } catch (e) {
    console.error('获取用户信息失败', e)
    // 出现错误时使用随机ID
    starId.value = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  }
})
</script>

<style lang="scss">
.gallery-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1E1E1E 0%, #000000 100%);
  padding: min(30rpx, 4vh) min(30rpx, 4vw) calc(65px + env(safe-area-inset-bottom));
  position: relative;
  box-sizing: border-box;
}

/* 背景星空 */
.star-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 4s infinite;
  will-change: opacity;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.stardust-halo {
  position: absolute;
  bottom: -10vh;
  left: 0;
  right: 0;
  height: 40vh;
  background: radial-gradient(ellipse at bottom, rgba(74, 59, 94, 0.15) 0%, transparent 70%);
  pointer-events: none;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: min(20rpx, 2.5vh) 0;
  margin-bottom: min(20rpx, 2.5vh);
  position: relative;
  z-index: 1;
}

.star-id {
  color: #4A3B5E;
  font-size: min(28rpx, 3.5vh);
  letter-spacing: 2rpx;
}

.welcome-text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: #ffffff;
  font-size: min(24rpx, 3vh);
  font-weight: 300;
  opacity: 0.8;
}

.gear-icon {
  width: min(40rpx, 5vh);
  height: min(40rpx, 5vh);
  border: 2px solid #B0B0B0;
  border-radius: 50%;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 25%;
    border: 2px solid #B0B0B0;
    border-radius: 50%;
  }
}

.gallery-title {
  font-size: min(32rpx, 4vh);
  color: #fff;
  font-weight: 300;
  letter-spacing: 3px;
  margin-bottom: min(25rpx, 3vh);
  text-align: center;
  position: relative;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 2px;
    background: rgba(74, 59, 94, 0.5);
  }
}

.scene-list {
  height: calc(100vh - min(200rpx, 25vh) - (60px + env(safe-area-inset-bottom)));
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: min(30rpx, 4vh);
  padding: min(15rpx, 2vh) 0 min(20rpx, 3vh);
  box-sizing: border-box;
}

.scene-card {
  width: 90%;
  height: 26vh;
  margin: 0 auto;
  border-radius: min(16rpx, 2vh);
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100%;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%);
    z-index: 1;
  }
}

/* 深夜电台背景装饰 */
.scene-card:nth-child(1) {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(255, 156, 85, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 156, 85, 0.1) 0%, transparent 40%);
    z-index: 0;
  }
  
  .music-notes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    opacity: 0.2;
    pointer-events: none;
  }
  
  .note {
    position: absolute;
    color: rgba(255, 156, 85, 0.4);
    font-size: 20px;
    animation: floating 3s infinite ease-in-out;
    
    &:nth-child(1) {
      top: 15%;
      left: 15%;
      animation-delay: 0s;
    }
    &:nth-child(2) {
      top: 25%;
      left: 75%;
      animation-delay: 0.5s;
    }
    &:nth-child(3) {
      top: 60%;
      left: 25%;
      animation-delay: 1s;
    }
    &:nth-child(4) {
      top: 45%;
      left: 85%;
      animation-delay: 1.5s;
    }
    &:nth-child(5) {
      top: 75%;
      left: 65%;
      animation-delay: 2s;
    }
  }
}

/* 雨中漫步背景装饰 */
.scene-card:nth-child(2) {
  position: relative;
  overflow: hidden;
  
  .rain-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;
  }
  
  .raindrop {
    position: absolute;
    width: 1px;
    height: min(15px, 3vh);
    background: linear-gradient(to bottom, transparent, rgba(120, 180, 230, 0.5));
    animation: falling-rain linear infinite;
    
    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        left: random(100) * 1%;
        top: -20px;
        opacity: (random(7) + 3) * 0.1;
        height: (random(10) + 5) * 1px;
        animation-duration: (random(10) + 10) * 0.1s;
        animation-delay: random(10) * 0.1s;
      }
    }
  }
}

/* 星空独白背景装饰 */
.scene-card:nth-child(3) {
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 30% 20%, rgba(150, 130, 200, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(150, 130, 200, 0.1) 0%, transparent 40%);
    z-index: 0;
    animation: nebula-glow 8s infinite alternate;
  }
  
  .star-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
    pointer-events: none;
    overflow: hidden;
  }
  
  .tiny-star {
    position: absolute;
    background: #fff;
    border-radius: 50%;
    animation: twinkle-star 4s infinite;
    box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
    
    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        left: random(100) * 1%;
        top: random(100) * 1%;
        width: (random(3) + 1) * 1px;
        height: (random(3) + 1) * 1px;
        opacity: (random(7) + 3) * 0.1;
        animation-delay: random(8) * 0.5s;
        animation-duration: (random(3) + 3) * 1s;
        transform: rotate(random(360) * 1deg);
        
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: white;
          filter: blur(1px);
          opacity: 0;
          animation: star-pulse (random(5) + 3) * 1s infinite (random(5) * 0.2s);
        }
      }
    }
  }
  
  .constellation {
    position: absolute;
    top: 50%;
    right: 25%;
    width: 100px;
    height: 80px;
    opacity: 0.4;
    animation: float-constellation 20s infinite ease-in-out;
    
    &::before {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 10% 20%, white 0%, white 2px, transparent 3px),
        radial-gradient(circle at 40% 50%, white 0%, white 2px, transparent 3px),
        radial-gradient(circle at 80% 30%, white 0%, white 2px, transparent 3px),
        radial-gradient(circle at 90% 90%, white 0%, white 2px, transparent 3px),
        radial-gradient(circle at 20% 70%, white 0%, white 2px, transparent 3px);
      animation: twinkle-star 6s infinite alternate;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        to bottom right,
        transparent 20%, rgba(255, 255, 255, 0.3) 20%, 
        rgba(255, 255, 255, 0.3) 22%, transparent 22%,
        transparent 38%, rgba(255, 255, 255, 0.3) 38%,
        rgba(255, 255, 255, 0.3) 40%, transparent 40%,
        transparent 58%, rgba(255, 255, 255, 0.3) 58%,
        rgba(255, 255, 255, 0.3) 60%, transparent 60%
      );
      animation: constellation-shine 8s infinite alternate;
    }
  }
}

.scene-content {
  position: relative;
  z-index: 2;
  padding: min(25rpx, 3vh) min(25rpx, 3vw);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scene-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.scene-title {
  font-size: min(30rpx, 3.8vh);
  color: #fff;
  font-weight: 300;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.scene-decoration {
  width: 30px;
  height: 30px;
  position: relative;
  
  &.decoration-1::before {
    content: "♪";
    color: rgba(255, 156, 85, 0.7);
    font-size: 24px;
    position: absolute;
    top: 0;
    right: 0;
  }
  
  &.decoration-2::before {
    content: "";
    position: absolute;
    width: 15px;
    height: 20px;
    border-radius: 0 0 10px 10px;
    background: linear-gradient(180deg, transparent, rgba(120, 180, 230, 0.7));
    top: 0;
    right: 10px;
    animation: rain 2s infinite ease-in;
  }
  
  &.decoration-3::before {
    content: "★";
    color: rgba(150, 130, 200, 0.7);
    font-size: 22px;
    position: absolute;
    top: 0;
    right: 0;
    animation: twinkle 3s infinite;
  }
}

.scene-desc {
  font-size: min(24rpx, 3vh);
  color: rgba(255, 255, 255, 0.8);
  margin: min(16rpx, 2vh) 0 min(24rpx, 3vh);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.scene-users {
  font-size: min(22rpx, 2.8vh);
  color: #B0B0B0;
  letter-spacing: 1px;
  margin-bottom: min(15rpx, 2vh);
  display: flex;
  align-items: center;
  
  &::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    background: rgba(74, 59, 94, 0.7);
    border-radius: 50%;
    margin-right: 6px;
  }
}

.enter-btn {
  align-self: center;
  width: min(200rpx, 28vw);
  height: min(60rpx, 8vh);
  line-height: min(60rpx, 8vh);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: min(30rpx, 4vh);
  color: #fff;
  font-size: min(24rpx, 3vh);
  background: rgba(74, 59, 94, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  text-align: center;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: transparent;
  }
  
  &-hover {
    background: rgba(74, 59, 94, 0.7);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
}

.settings-menu {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

.menu-content {
  width: 40%;
  background: #2A2A2A;
  height: 100vh;
  padding: min(40rpx, 5vh) 0;
  animation: slideIn 0.3s ease;
}

.menu-item {
  padding: min(30rpx, 4vh) min(40rpx, 5vh);
  color: #fff;
  font-size: min(28rpx, 3.5vh);
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes rain {
  0% { transform: translateY(-5px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(15px); opacity: 0; }
}

@keyframes falling-rain {
  0% { transform: translateY(-20px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(150px); opacity: 0; }
}

@keyframes floating {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes ripple {
  from {
    transform: scale(0);
    opacity: 0.5;
  }
  to {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes twinkle-star {
  0%, 100% { opacity: 0.2; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

@keyframes star-pulse {
  0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.5; transform: translate(-50%, -50%) scale(3); }
}

@keyframes nebula-glow {
  0% { opacity: 0.6; }
  50% { opacity: 0.8; }
  100% { opacity: 1; }
}

@keyframes float-constellation {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  50% { transform: translateY(-8px) rotate(0deg); }
  75% { transform: translateY(-3px) rotate(-1deg); }
}

@keyframes constellation-shine {
  0% { opacity: 0.2; }
  50% { opacity: 0.5; }
  100% { opacity: 0.3; }
}

/* 意见反馈弹窗样式 */
.feedback-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}
.feedback-box {
  width: 86%;
  background: #2a2a2a;
  border-radius: 12px;
  padding: 24rpx;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.feedback-title {
  color: #fff;
  font-size: 30rpx;
  text-align: center;
  margin-bottom: 16rpx;
}
.feedback-input {
  width: 100%;
  min-height: 160rpx;
  background: #1f1f1f;
  color: #fff;
  border-radius: 8px;
  padding: 16rpx;
  box-sizing: border-box;
}
.feedback-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 16rpx;
}
.btn-cancel, .btn-submit {
  min-width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}
.btn-cancel { background: #3a3a3a; color: #ddd; }
.btn-submit { background: rgba(74, 59, 94, 0.85); color: #fff; }

/* #ifdef MP-WEIXIN */
/* 小程序端使用更保守的固定值，避免 min()/vh 在部分机型上的误差 */
.gallery-container {
  /* 与 TabBar 120rpx 高度保持一致，并兼容安全区 */
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
.scene-list {
  /* 顶部区域按 200rpx 估算，底部使用 120rpx TabBar + 安全区 */
  height: calc(100vh - 200rpx - (120rpx + constant(safe-area-inset-bottom)));
  height: calc(100vh - 200rpx - (120rpx + env(safe-area-inset-bottom)));
}
/* #endif */
</style>
