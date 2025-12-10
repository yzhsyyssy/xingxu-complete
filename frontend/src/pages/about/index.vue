<template>
  <view class="about-container">
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
      <view class="stardust-halo"></view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <view class="back-icon"></view>
    </view>

    <!-- 顶部标题 -->
    <view class="header-section">
      <text class="title">关于星叙</text>
      <text class="subtitle">在夜色里，相遇一束温柔的光</text>
    </view>

    <!-- 简介 -->
    <view class="section">
      <text class="section-title">我们在做什么</text>
      <text class="section-text">
        星叙是一个安静而温暖的角落。你可以在这里进入不同的「时空场景」，与陌生人交换心事，也可以把未说出口的故事装进「星语瓶」，把珍贵的瞬间收进「星河档案」。
      </text>
    </view>

    <!-- 功能一览 -->
    <view class="section">
      <text class="section-title">界面一览</text>
      <view class="feature-list">
        <view class="feature-item">
          <text class="feature-title">画廊</text>
          <text class="feature-desc">挑选想去的「时空」，每个场景都有独特氛围。</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">时空</text>
          <text class="feature-desc">轻声聊天、投递心情、点亮星标，彼此陪伴。</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">星语瓶</text>
          <text class="feature-desc">把心事写进瓶中，等待来自远方的回音。</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">星河档案</text>
          <text class="feature-desc">收藏你的成长与感动，成为专属的记忆长廊。</text>
        </view>
        <view class="feature-item">
          <text class="feature-title">我的</text>
          <text class="feature-desc">管理编号、收藏与隐私偏好，守护自己的边界。</text>
        </view>
      </view>
    </view>

    <!-- 温暖语 -->
    <view class="section warm">
      <text class="warm-text">
        夜色深处，每一颗星都有名字，每一段心事都被温柔安放。愿你在这里，能慢慢忘记锋利，重新喜欢这个世界——也喜欢自己。
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const stars = ref(
  Array.from({ length: 50 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 3
  }))
)

const goBack = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.redirectTo({ url: '/pages/user/index' })
    }
  })
}
</script>

<style lang="scss">
.about-container {
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

.section {
  position: relative;
  z-index: 1;
  padding: min(24rpx, 3vh) min(30rpx, 5vw);
}
.section-title {
  display: block;
  color: #fff;
  font-size: min(28rpx, 3.6vh);
  margin-bottom: 8rpx;
  letter-spacing: 2rpx;
}
.section-text {
  color: #B0B0B0;
  font-size: min(24rpx, 3vh);
  line-height: 1.6;
}

.feature-list {
  margin-top: 8rpx;
}
.feature-item {
  padding: 16rpx;
  border-radius: 12rpx;
  background: rgba(46, 46, 46, 0.8);
  border: 1px solid rgba(74, 59, 94, 0.5);
  backdrop-filter: blur(8px);
  & + .feature-item {
    margin-top: 12rpx;
  }
}
.feature-title {
  color: #fff;
  font-size: min(26rpx, 3.2vh);
}
.feature-desc {
  color: #B0B0B0;
  font-size: min(22rpx, 2.8vh);
  margin-top: 4rpx;
}

.section.warm {
  padding-top: min(32rpx, 4vh);
  padding-bottom: min(32rpx, 4vh);
}
.warm-text {
  display: block;
  color: #fff;
  font-size: min(26rpx, 3.2vh);
  line-height: 1.8;
  text-align: center;
  opacity: 0.9;
}

/* 动画 */
@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.9; }
}

/* #ifdef MP-WEIXIN */
.about-container {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>