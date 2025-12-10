<template>
  <view class="user-container">
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

    <!-- 顶部区域：个人信息区 -->
    <view class="header-section">
      <text class="star-id">HD {{ starId }}</text>
      <text class="title">我的星空</text>
      <text class="subtitle">属于你的宇宙角落</text>
    </view>

    <!-- 中部区域：设置选项区 -->
    <view class="settings-section">
      <!-- 我的编号 -->
      <view class="setting-item" @tap="showIdCopy">
        <view class="setting-left">
          <text class="icon star-icon">★</text>
          <text class="setting-text">我的编号</text>
        </view>
        <view class="setting-right">
          <text class="preview-text">HD {{ starId }}</text>
        </view>
      </view>
      
      <!-- 我的收藏 -->
      <view class="setting-item" @tap="showFavorites">
        <view class="setting-left">
          <text class="icon favorite-icon">⭐</text>
          <text class="setting-text">我的收藏</text>
        </view>
        <view class="setting-right">
          <text class="count-badge" v-if="favoriteBottles.length > 0">{{ favoriteBottles.length }}</text>
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 隐私设置 -->
      <view class="setting-item" @tap="navigateToPrivacy">
        <view class="setting-left">
          <text class="icon lock-icon">🔒</text>
          <text class="setting-text">隐私设置</text>
        </view>
        <view class="setting-right">
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 关于星叙 -->
      <view class="setting-item" @tap="navigateToAbout">
        <view class="setting-left">
          <text class="icon info-icon">ℹ</text>
          <text class="setting-text">关于星叙</text>
        </view>
        <view class="setting-right">
          <text class="arrow-icon">›</text>
        </view>
      </view>

      <!-- 退出登录 -->
      <view class="logout-item" @tap="showLogoutConfirm">
        <text class="logout-text">退出登录</text>
      </view>
    </view>

    <!-- 弹出框：我的编号复制 -->
    <view class="modal" v-if="showIdModal" @tap="hideIdModal">
      <view class="id-modal-content" @tap.stop>
        <text class="id-title">你的星星编号</text>
        <text class="id-full">HD {{ starId }}</text>
        <button class="copy-btn" @tap="copyId">复制</button>
      </view>
    </view>
    
    <!-- 弹出框：我的收藏列表 -->
    <view class="modal" v-if="showFavoritesModal" @tap="hideFavorites">
      <view class="favorites-modal-content" @tap.stop>
        <view class="favorites-header">
          <text class="favorites-title">我的星语收藏</text>
          <text class="close-btn" @tap="hideFavorites">×</text>
        </view>
        
        <scroll-view class="favorites-list" scroll-y v-if="favoriteBottles.length > 0">
          <view 
            v-for="(bottle, index) in favoriteBottles" 
            :key="index"
            class="favorite-item"
          >
            <view class="favorite-date">{{ bottle.date }}</view>
            <view class="favorite-content">{{ bottle.content }}</view>
            <view class="favorite-sender">来自 HD {{ bottle.senderId }}</view>
            <view class="remove-favorite" @tap.stop="removeFavorite(index)">
              <text class="remove-icon">★</text>
            </view>
          </view>
        </scroll-view>
        
        <view class="empty-favorites" v-else>
          <text>还没有收藏的星语</text>
          <text class="empty-tip">探索星语瓶，收藏喜欢的内容</text>
          <button class="explore-btn" @tap="navigateToBottle">探索星语</button>
        </view>
      </view>
    </view>

    <!-- 弹出框：退出登录确认 -->
    <view class="modal" v-if="showLogoutModal" @tap="cancelLogout">
      <view class="logout-confirm" @tap.stop>
        <text class="confirm-text">确定退出登录？</text>
        <view class="confirm-actions">
          <button class="cancel-btn" @tap.stop="cancelLogout">取消</button>
          <button class="confirm-btn" @tap.stop="confirmLogout">确认</button>
        </view>
      </view>
    </view>

    <!-- 提示框 -->
    <view class="toast" v-if="showToast">
      <text>{{ toastMessage }}</text>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :active="4" @tab-change="handleTabChange" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'

// 用户数据
const starId = ref('')

// 收藏数据
const favoriteBottles = ref([])

// 弹窗状态
const showIdModal = ref(false)
const showLogoutModal = ref(false)
const showFavoritesModal = ref(false)

// 提示框
const showToast = ref(false)
const toastMessage = ref('')

// 星背景数据
const stars = ref(Array.from({ length: 50 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 30, // 主要集中在顶部
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  delay: Math.random() * 3
})))

// 显示提示框
const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 显示编号复制弹窗
const showIdCopy = () => {
  showIdModal.value = true
}

// 隐藏编号复制弹窗
const hideIdModal = () => {
  showIdModal.value = false
}

// 复制星星编号
const copyId = () => {
  const fullId = `HD ${starId.value}`
  uni.setClipboardData({
    data: fullId,
    success: () => {
      showToastMessage('已复制')
      hideIdModal()
    }
  })
}

// 显示收藏弹窗
const showFavorites = () => {
  // 加载收藏数据
  loadFavorites()
  showFavoritesModal.value = true
}

// 隐藏收藏弹窗
const hideFavorites = () => {
  showFavoritesModal.value = false
}

// 加载收藏数据
const loadFavorites = () => {
  try {
    const favorites = uni.getStorageSync('favoriteBottles')
    if (favorites) {
      favoriteBottles.value = JSON.parse(favorites)
    } else {
      favoriteBottles.value = []
    }
  } catch (e) {
    console.error('加载收藏失败', e)
    favoriteBottles.value = []
  }
}

// 移除收藏
const removeFavorite = (index) => {
  if (index < 0 || index >= favoriteBottles.value.length) return
  
  // 移除收藏
  favoriteBottles.value.splice(index, 1)
  
  // 保存更新后的收藏列表
  uni.setStorageSync('favoriteBottles', JSON.stringify(favoriteBottles.value))
  
  // 提示成功
  showToastMessage('已从收藏中移除')
}

// 跳转到星语瓶页面
const navigateToBottle = () => {
  hideFavorites()
  uni.redirectTo({ url: '/pages/bottle/index' })
}

// 显示退出登录确认
const showLogoutConfirm = () => {
  showLogoutModal.value = true
}

// 取消退出登录
const cancelLogout = () => {
  showLogoutModal.value = false
}

// 确认退出登录
const confirmLogout = () => {
  // 清除登录状态和用户数据
  uni.removeStorageSync('starId')
  uni.removeStorageSync('loginStatus')
  
  // 跳转到splash页面
  uni.reLaunch({
    url: '/pages/splash/index'
  })
}

 // 跳转到隐私设置页面
const navigateToPrivacy = () => {
  uni.navigateTo({ url: '/pages/privacy/index' })
}

// 跳转到关于页面
const navigateToAbout = () => {
  uni.navigateTo({ url: '/pages/about/index' })
}

// 处理标签变化
const handleTabChange = (index) => {
  // 导航逻辑由TabBar组件处理
}

// 加载用户数据
onMounted(() => {
  // 从存储中获取用户ID
  const savedId = uni.getStorageSync('starId')
  if (savedId) {
    starId.value = savedId.replace('HD ', '')
  }
  
  // 加载收藏数据
  loadFavorites()
})
</script>

<style lang="scss">
.user-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1E1E1E 0%, #2A2A2A 100%);
  position: relative;
  overflow: hidden;
  padding-bottom: calc(65px + env(safe-area-inset-bottom)); /* 底部导航栏高度 + 安全区 */
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

/* 顶部区域：个人信息区 */
.header-section {
  padding: min(30px, 8vh) min(20px, 5vw) min(20px, 5vh);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  height: 30vh;
  justify-content: center;
}

.star-id {
  color: #4A3B5E;
  font-size: min(18px, 5vw);
  font-weight: 300;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(74, 59, 94, 0.3);
  opacity: 0;
  animation: fadeIn 0.8s forwards;
}

.title {
  color: #fff;
  font-size: min(16px, 4.5vw);
  font-weight: 300;
  letter-spacing: 2px;
  margin-top: 10px;
  opacity: 0;
  animation: fadeIn 1s forwards;
}

.subtitle {
  color: #B0B0B0;
  font-size: min(12px, 3.5vw);
  margin-top: 10px;
  opacity: 0;
  animation: fadeIn 2s forwards;
}

/* 中部区域：设置选项区 */
.settings-section {
  padding: 0 min(20px, 5vw);
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 60vh;
}

.setting-item {
  width: 90%;
  height: 50px;
  margin-bottom: 10px;
  background: rgba(46, 46, 46, 0.8);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  border: 1px solid rgba(74, 59, 94, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  position: relative;
  overflow: hidden;
  
  &:active {
    background: rgba(74, 59, 94, 0.2);
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--tap-x, 50%) var(--tap-y, 50%), rgba(74, 59, 94, 0.3) 0%, transparent 80%);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    transform: scale(2);
  }
}

.setting-left {
  display: flex;
  align-items: center;
}

.icon {
  color: #4A3B5E;
  font-size: min(16px, 4.5vw);
  margin-right: 12px;
}

.setting-text {
  color: #fff;
  font-size: min(14px, 4vw);
}

.setting-right {
  display: flex;
  align-items: center;
}

.preview-text {
  color: #B0B0B0;
  font-size: min(12px, 3.5vw);
}

.arrow-icon {
  color: #4A3B5E;
  font-size: min(18px, 5vw);
}

.logout-item {
  width: 90%;
  margin-top: 30px;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  
  &:active {
    opacity: 0.7;
  }
}

.logout-text {
  color: #4A3B5E;
  font-size: min(14px, 4vw);
}

/* 弹出框：编号复制 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s forwards;
}

.id-modal-content {
  width: min(280px, 80%);
  background: #2A2A2A;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: scaleIn 0.3s forwards;
}

.id-title {
  color: #B0B0B0;
  font-size: min(14px, 4vw);
  margin-bottom: 15px;
}

.id-full {
  color: #fff;
  font-size: min(18px, 5vw);
  margin-bottom: 20px;
  font-weight: 300;
  letter-spacing: 1px;
}

.copy-btn {
  background: #4A3B5E;
  color: #fff;
  font-size: min(14px, 4vw);
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  margin-top: 20px;
  
  &:active {
    opacity: 0.9;
  }
}

/* 收藏相关样式 */
.count-badge {
  font-size: min(12px, 3.2vw);
  color: #fff;
  background: #4A3B5E;
  border-radius: 10px;
  padding: 2px 8px;
  margin-right: 8px;
}

.favorites-modal-content {
  width: min(90%, 600px);
  max-height: 80vh;
  background: #2A2A2A;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.3s forwards;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.favorites-title {
  color: #B0B0B0;
  font-size: min(16px, 4.5vw);
  font-weight: 300;
}

.close-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: min(20px, 5vw);
  color: #B0B0B0;
  
  &:active {
    color: #4A3B5E;
  }
}

.favorites-list {
  max-height: calc(60vh);
  overflow-y: auto;
}

.favorite-item {
  margin-bottom: 15px;
  padding: 15px;
  background: rgba(46, 46, 46, 0.8);
  border-radius: 8px;
  border-left: 3px solid #4A3B5E;
  position: relative;
}

.favorite-date {
  font-size: min(12px, 3.2vw);
  color: #B0B0B0;
  margin-bottom: 10px;
}

.favorite-content {
  font-size: min(14px, 4vw);
  color: #fff;
  line-height: 1.5;
  word-break: break-word;
  margin-bottom: 15px;
}

.favorite-sender {
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
  text-align: right;
}

.remove-favorite {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(74, 59, 94, 0.2);
}

.remove-icon {
  font-size: min(14px, 4vw);
  color: #FFD700;
  
  &:active {
    opacity: 0.7;
  }
}

.empty-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 30vh;
  color: #B0B0B0;
  font-size: min(14px, 4vw);
  text-align: center;
}

.empty-tip {
  font-size: min(12px, 3.5vw);
  color: #7A7A7A;
  margin-top: 10px;
  margin-bottom: 20px;
}

.explore-btn {
  background: #4A3B5E;
  color: #fff;
  font-size: min(14px, 4vw);
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  
  &:active {
    opacity: 0.9;
  }
}

/* 其他图标样式 */
.favorite-icon::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
}

.favorite-icon {
  color: #FFD700;
}

/* 弹出框：退出登录确认 */
.logout-confirm {
  width: min(280px, 70%);
  background: #2A2A2A;
  border-radius: 8px;
  padding: 20px;
  animation: scaleIn 0.3s forwards;
}

.confirm-text {
  color: #fff;
  font-size: min(16px, 4.5vw);
  margin-bottom: 20px;
  text-align: center;
  display: block;
}

.confirm-actions {
  display: flex;
  justify-content: space-around;
}

.cancel-btn, .confirm-btn {
  padding: 6px 20px;
  border-radius: 20px;
  font-size: min(14px, 4vw);
  background: transparent;
  border: none;
}

.cancel-btn {
  color: #B0B0B0;
  
  &:active {
    opacity: 0.7;
  }
}

.confirm-btn {
  color: #fff;
  background: #4A3B5E;
  
  &:active {
    opacity: 0.9;
  }
}

/* 提示框 */
.toast {
  position: fixed;
  top: min(40px, 10vh);
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 20px;
  background: rgba(74, 59, 94, 0.9);
  border-radius: 20px;
  color: #fff;
  font-size: min(14px, 4vw);
  z-index: 200;
  animation: fadeInDown 0.3s forwards;
}

/* 动画 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInDown {
  from { 
    opacity: 0;
    transform: translate(-50%, -20px);
  }
  to { 
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* #ifdef MP-WEIXIN */
/* 小程序端与 120rpx TabBar 对齐，并兼容安全区 */
.user-container {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>
