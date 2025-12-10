<template>
  <view class="privacy-container">
    <!-- 星空背景 -->
    <view class="star-bg">
      <view
        v-for="(star, i) in stars"
        :key="i"
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
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <view class="back-icon"></view>
    </view>

    <!-- 顶部标题 -->
    <view class="header-section">
      <text class="title">隐私设置</text>
      <text class="subtitle">守护你的星空边界</text>
    </view>

    <!-- 设置项 -->
    <view class="settings-list">
      <view class="setting-item" @tap="toggle('invisible')">
        <view class="setting-left">
          <text class="setting-name">隐身模式</text>
          <text class="setting-desc">不显示在线状态与动态痕迹</text>
        </view>
        <switch
          :checked="settings.invisible"
          color="#4A3B5E"
          @tap.stop="noop"
          @change="onSwitch('invisible', $event.detail.value)"
        />
      </view>

      <view class="setting-item" @tap="toggle('hideMyPosts')">
        <view class="setting-left">
          <text class="setting-name">隐藏我发布的信息</text>
          <text class="setting-desc">其他人将不可见你新发布的内容</text>
        </view>
        <switch
          :checked="settings.hideMyPosts"
          color="#4A3B5E"
          @tap.stop="noop"
          @change="onSwitch('hideMyPosts', $event.detail.value)"
        />
      </view>

      <view class="tip-card">
        <text class="tip-title">说明</text>
        <text class="tip-text">以上设置仅作用于本设备当前账户。部分功能可能需要与后端联动后才能在所有端完全生效。</text>
      </view>

      <view class="actions">
        <button class="reset-btn" @tap="reset">恢复默认</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type PrivacySettings = {
  invisible: boolean
  hideMyPosts: boolean
}

const defaultSettings: PrivacySettings = {
  invisible: false,
  hideMyPosts: false
}

const settings = ref<PrivacySettings>({ ...defaultSettings })

// 背景星点
const stars = ref(
  Array.from({ length: 40 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 3
  }))
)

const load = () => {
  try {
    const raw = uni.getStorageSync('privacySettings')
    if (raw) {
      const parsed = JSON.parse(raw)
      settings.value = { ...defaultSettings, ...parsed }
    }
  } catch (e) {
    settings.value = { ...defaultSettings }
  }
}

const save = () => {
  try {
    uni.setStorageSync('privacySettings', JSON.stringify(settings.value))
  } catch (e) {}
}

const noop = () => {}

const onSwitch = (key: keyof PrivacySettings, val: boolean) => {
  settings.value[key] = val
  save()
}

const toggle = (key: keyof PrivacySettings) => {
  settings.value[key] = !settings.value[key]
  save()
}

const reset = () => {
  settings.value = { ...defaultSettings }
  save()
  uni.showToast({ title: '已恢复默认', icon: 'none' })
}

const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.redirectTo({ url: '/pages/user/index' })
    }
  })
}

onMounted(() => {
  load()
})
</script>

<style lang="scss">
.privacy-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #1E1E1E 0%, #2A2A2A 100%);
  position: relative;
  overflow: hidden;
  padding-bottom: calc(65px + env(safe-area-inset-bottom));
}

/* 背景星空 */
.star-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 4s infinite;
  will-change: opacity;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.header-section {
  padding: min(40rpx, 5vh) min(30rpx, 5vw) 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}
.title {
  color: #fff;
  font-size: min(36rpx, 5vh);
  font-weight: 300;
  letter-spacing: 4rpx;
}
.subtitle {
  margin-top: 6px;
  color: #B0B0B0;
  font-size: min(24rpx, 3.2vh);
}

.back-btn {
  position: absolute;
  top: min(30rpx, 4vh);
  left: min(30rpx, 4vw);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(46, 46, 46, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.back-btn:active {
  transform: scale(0.95);
}
.back-icon {
  width: 10px;
  height: 10px;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  transform: rotate(-45deg);
  margin-left: 4px;
}

.settings-list {
  position: relative;
  z-index: 1;
  padding: min(20rpx, 3vh) min(30rpx, 5vw);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(46, 46, 46, 0.8);
  border: 1px solid rgba(74, 59, 94, 0.5);
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  backdrop-filter: blur(8px);
}
.setting-left {
  display: flex;
  flex-direction: column;
}
.setting-name {
  color: #fff;
  font-size: min(28rpx, 3.6vh);
}
.setting-desc {
  color: #B0B0B0;
  font-size: min(22rpx, 3vh);
  margin-top: 6rpx;
}

.tip-card {
  margin-top: 12rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(74, 59, 94, 0.15);
  border: 1px solid rgba(74, 59, 94, 0.3);
}
.tip-title {
  color: #B0B0B0;
  font-size: min(24rpx, 3vh);
}
.tip-text {
  display: block;
  margin-top: 6rpx;
  color: #B0B0B0;
  font-size: min(22rpx, 2.8vh);
}

.actions {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}
.reset-btn {
  color: #fff;
  background: #4A3B5E;
  border: none;
  border-radius: 20rpx;
  padding: 14rpx 28rpx;
  font-size: min(26rpx, 3.2vh);
}

/* 动画 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}

/* #ifdef MP-WEIXIN */
.privacy-container {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>