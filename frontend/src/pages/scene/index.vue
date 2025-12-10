<template>
  <view class="scene-container" :class="sceneClass">
    <!-- 动态背景效果 -->
    <view class="scene-bg">
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
      <view v-if="sceneId === 2" class="rain-container">
        <view 
          v-for="i in 50" 
          :key="i" 
          class="raindrop"
          :style="{
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 2 + 1}s`,
            animationDelay: `${Math.random() * 3}s`
          }"
        />
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="back-btn" @tap="goBack">
      <view class="back-icon"></view>
    </view>

    <!-- 顶部区域：场景信息 -->
    <view class="scene-header">
      <text class="scene-title">{{ sceneData.title }}</text>
      <text class="scene-users">{{ sceneData.users }}/20</text>
      <view class="audio-controls" @tap="toggleAudio">
        <view class="audio-icon" :class="{ playing: isPlaying }"></view>
      </view>
    </view>

    <!-- 中部区域：聊天/留言 -->
    <scroll-view 
      class="chat-container" 
      scroll-y 
      scroll-with-animation
      @tap="hideKeyboard"
      :scroll-into-view="bottomAnchor"
    >
      <view 
        v-for="(msg, index) in displayedMessages" 
        :key="index"
        class="message"
        :class="{ 'self-message': msg.isSelf }"
        @longpress="showMessageActions(index)"
      >
        <view class="message-header">
          <text class="sender-id">{{ msg.senderId }}</text>
          <view v-if="msg.starred" class="star-icon starred"></view>
        </view>
        <view class="message-body">
          <text v-if="!msg.isImage" class="message-content">{{ msg.content }}</text>
          <image v-else class="message-image" :src="msg.content" mode="widthFix" @tap="previewImage(msg.content)"></image>
        </view>
      </view>
      <view :id="bottomAnchor" style="height: 2px;"></view>
    </scroll-view>

    <!-- 底部区域：输入/功能 -->
    <view class="input-container">
      <input 
        class="message-input"
        type="text"
        v-model="newMessage"
        confirm-type="send"
        placeholder="说点什么..."
        @confirm="sendMessage"
        cursor-spacing="10"
        focus
      />
      <view class="input-actions">
        <view class="action-btn voice-btn" @touchstart="startRecording" @touchend="stopRecording">
          <view class="mic-icon"></view>
          <view v-if="isRecording" class="wave-animation" :class="sceneClass"></view>
        </view>
        <view class="action-btn send-btn" @tap="sendMessage">
          <view class="send-icon"></view>
        </view>
        <view class="action-btn upload-btn" @tap="chooseImage">
          <view class="upload-icon"></view>
        </view>
      </view>
    </view>

    <!-- 操作弹窗 -->
    <view v-if="showActions" class="actions-popup" @tap.stop="showActions = false">
      <view class="actions-content" @tap.stop>
        <view class="action-item" @tap="starMessage">
          <text>{{ selectedMessage?.starred ? '取消点亮' : '点亮星星' }}</text>
        </view>
        <view class="action-item" @tap="reportMessage">
          <text>举报</text>
        </view>
      </view>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :active="1" @tab-change="handleTabChange" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { sanitizeText } from '@/utils/contentFilter'

// 获取路由参数
const sceneId = ref(1)
onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  const options = page?.$page?.options || {}
  if (options.id) {
    sceneId.value = Number(options.id)
  }
  
  // 设置页面标题
  setSceneTitle()
  
  // 初始滚动到底部
  scrollToBottom()
})

// 场景数据
const scenes = [
  {
    id: 1,
    title: '深夜电台',
    users: 8,
    gradient: 'linear-gradient(180deg, #1E1E1E 0%, #2A3B5E 100%)'
  },
  {
    id: 2,
    title: '雨中漫步',
    users: 10,
    gradient: 'linear-gradient(180deg, #1E1E1E 0%, #3A4A5E 100%)'
  },
  {
    id: 3,
    title: '星空独白',
    users: 6,
    gradient: 'linear-gradient(180deg, #1E1E1E 0%, #4A3B5E 100%)'
  }
]

// 当前场景数据
const sceneData = computed(() => {
  return scenes.find(s => s.id === sceneId.value) || scenes[0]
})

// 设置页面标题
const setSceneTitle = () => {
  uni.setNavigationBarTitle({
    title: sceneData.value.title
  })
}

// 场景CSS类
const sceneClass = computed(() => {
  return {
    'scene-radio': sceneId.value === 1,
    'scene-rain': sceneId.value === 2,
    'scene-space': sceneId.value === 3
  }
})

// 生成星星
/* #ifdef MP-WEIXIN */
const STAR_COUNT = 30
/* #else */
const STAR_COUNT = 50
/* #endif */
const stars = ref(Array.from({ length: STAR_COUNT }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  delay: Math.random() * 3
})))

// 生成随机消息
const generateRandomMessages = () => {
  const senderPrefix = ['HD', 'ST', 'GX', 'YL']
  const contents = [
    '今天的星空真美',
    '有人在吗？',
    '感觉这个场景很温馨',
    '一个人静静地听着',
    '这个地方让我想起小时候',
    '有时候孤独也是一种享受',
    '喜欢这里的氛围',
    '夜深人静的时候总是会想很多',
    '雨声真的很治愈呢',
    '这首曲子真好听'
  ]
  
  return Array.from({ length: 8 }, () => ({
    senderId: `${senderPrefix[Math.floor(Math.random() * senderPrefix.length)]} ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
    content: contents[Math.floor(Math.random() * contents.length)],
    isSelf: Math.random() > 0.8,
    starred: Math.random() > 0.7,
    isImage: false
  }))
}

// 响应式状态
const messages = ref(generateRandomMessages())
const bottomAnchor = ref('msg-bottom')
const newMessage = ref('')
const isPlaying = ref(false)
const isChatMode = ref(true)
const isRecording = ref(false)
const showActions = ref(false)
const selectedMessageIndex = ref(-1)
const selectedMessage = computed(() => selectedMessageIndex.value >= 0 ? messages.value[selectedMessageIndex.value] : null)

const currentUserId = ref(uni.getStorageSync('starId') || 'HD 123456')
const hideMyPosts = ref(false)
const displayedMessages = computed(() => hideMyPosts.value ? messages.value.filter(m => m.senderId !== currentUserId.value) : messages.value)

// 读取隐私设置（仅本设备生效）
try {
  const ps = uni.getStorageSync('privacySettings')
  if (ps) {
    const parsed = JSON.parse(ps)
    hideMyPosts.value = !!parsed.hideMyPosts
  }
} catch (e) {}

// 返回上一页
const goBack = () => {
  uni.redirectTo({
    url: '/pages/gallery/index'
  })
}

// 选择图片
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      sendImageMessage(res.tempFilePaths[0])
    }
  })
}

// 发送图片消息
const sendImageMessage = (imagePath) => {
  const userInfo = uni.getStorageSync('starId') || 'HD 123456'
  messages.value.push({
    senderId: userInfo,
    content: imagePath,
    isSelf: true,
    starred: false,
    isImage: true
  })
  
  scrollToBottom()
}

// 预览图片
const previewImage = (imagePath) => {
  uni.previewImage({
    urls: [imagePath],
    current: imagePath
  })
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    // 变更锚点 id 以触发 scroll-into-view
    bottomAnchor.value = 'msg-bottom-' + Date.now()
  })
}

// 发送消息
const sendMessage = () => {
  const raw = newMessage.value.trim()
  if (!raw) return

  const { clean, flagged } = sanitizeText(raw)
  const userInfo = uni.getStorageSync('starId') || 'HD 123456'
  messages.value.push({
    senderId: userInfo,
    content: clean,
    isSelf: true,
    starred: false,
    isImage: false
  })

  if (flagged) {
    uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
  }

  newMessage.value = ''
  scrollToBottom()
}

// 隐藏键盘
const hideKeyboard = () => {
  uni.hideKeyboard()
}

// 开始录音
const startRecording = () => {
  isRecording.value = true
}

// 停止录音
const stopRecording = () => {
  isRecording.value = false
  
  const userInfo = uni.getStorageSync('starId') || 'HD 123456'
  messages.value.push({
    senderId: userInfo,
    content: '[语音消息]',
    isSelf: true,
    starred: false,
    isImage: false
  })
  
  scrollToBottom()
  
  uni.showToast({
    title: '发送语音成功',
    icon: 'none'
  })
}

// 显示消息操作菜单
const showMessageActions = (index) => {
  selectedMessageIndex.value = index
  showActions.value = true
}

// 点亮星星
const starMessage = () => {
  if (selectedMessageIndex.value >= 0) {
    const msg = messages.value[selectedMessageIndex.value]
    msg.starred = !msg.starred
  }
  showActions.value = false
}

// 举报消息
const reportMessage = () => {
  uni.showToast({
    title: '举报成功',
    icon: 'none'
  })
  showActions.value = false
}

// 切换音频播放状态
const toggleAudio = () => {
  isPlaying.value = !isPlaying.value
  
  uni.showToast({
    title: `${sceneData.value.title}音效已${isPlaying.value ? '开启' : '关闭'}`,
    icon: 'none'
  })
}

// 处理标签变化
const handleTabChange = (index) => {
  // 导航逻辑由TabBar组件处理
}
</script>

<style lang="scss">
.scene-container {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  &.scene-radio {
    background: linear-gradient(180deg, #1E1E1E 0%, #2A3B5E 100%);
    
    .scene-bg::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 30vh;
      background: radial-gradient(ellipse at bottom, rgba(59, 42, 42, 0.3) 0%, transparent 70%);
      pointer-events: none;
    }
    
    .message:not(.self-message) {
      background: rgba(59, 42, 42, 0.3);
    }
    
    .wave-animation {
      background: linear-gradient(90deg, transparent, rgba(255, 156, 85, 0.5), transparent);
    }
  }
  
  &.scene-rain {
    background: linear-gradient(180deg, #1E1E1E 0%, #3A4A5E 100%);
    
    .message:not(.self-message) {
      background: rgba(58, 74, 94, 0.3);
    }
    
    .wave-animation {
      background: linear-gradient(90deg, transparent, rgba(120, 180, 230, 0.5), transparent);
    }
  }
  
  &.scene-space {
    background: linear-gradient(180deg, #1E1E1E 0%, #4A3B5E 100%);
    
    .scene-bg::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40vh;
      background: radial-gradient(ellipse at bottom, rgba(74, 59, 94, 0.2) 0%, transparent 75%);
      pointer-events: none;
    }
    
    .message:not(.self-message) {
      background: rgba(74, 59, 94, 0.3);
    }
    
    .wave-animation {
      background: linear-gradient(90deg, transparent, rgba(150, 130, 200, 0.5), transparent);
    }
  }
}

.scene-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* 返回按钮 */
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
  
  &:active {
    transform: scale(0.95);
  }
}

.back-icon {
  width: 10px;
  height: 10px;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
  transform: rotate(-45deg);
  margin-left: 4px;
}

.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  animation: twinkle 4s infinite;
  will-change: opacity;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}

.rain-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.raindrop {
  position: absolute;
  top: -10px;
  width: 1px;
  height: 20px;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5));
  animation: rain linear infinite;
}

.scene-header {
  padding: min(30rpx, 4vh) min(30rpx, 4vw);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-left: 50px; /* 为返回按钮留出空间 */
}

.scene-title {
  font-size: 16px;
  color: #fff;
  font-weight: 300;
  letter-spacing: 2px;
}

.scene-users {
  font-size: 12px;
  color: #B0B0B0;
  animation: pulse 2s infinite;
}

.audio-controls {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #4A3B5E;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: scale(0.95);
  }
}

.audio-icon {
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 6px 0 6px 10px;
  border-color: transparent transparent transparent #4A3B5E;
  margin-left: 2px;
  
  &.playing {
    width: 10px;
    height: 10px;
    border: none;
    margin: 0;
    background: #4A3B5E;
  }
}

.chat-container {
  flex: 1;
  padding: min(20rpx, 2.5vh) min(30rpx, 4vw);
  overflow-y: auto;
  z-index: 1;
}

.message {
  max-width: 80%;
  margin-bottom: min(20rpx, 2.5vh);
  padding: min(20rpx, 2.5vh);
  border-radius: min(8rpx, 1vh);
  animation: fadeIn 0.3s;
  position: relative;
  
  &.self-message {
    margin-left: auto;
    background: rgba(74, 59, 94, 0.4);
  }
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.sender-id {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.message-body {
  width: 100%;
}

.message-image {
  width: 100%;
  max-width: 220px;
  max-height: 240px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.star-icon {
  width: 16px;
  height: 16px;
  position: relative;
  
  &.starred::after {
    content: "★";
    position: absolute;
    right: 0;
    top: -2px;
    color: #4A3B5E;
    font-size: 14px;
  }
}

.message-content {
  font-size: 14px;
  color: #fff;
  word-break: break-word;
}

.input-container {
  padding: 15rpx 30rpx;
  display: flex;
  align-items: center;
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: calc(60px + env(safe-area-inset-bottom)); /* 底部导航栏高度 + 安全区 */
}

.message-input {
  flex: 1;
  background: rgba(58, 58, 58, 0.8);
  height: 80rpx;
  border-radius: 8rpx;
  padding: 0 20rpx;
  color: #fff;
  font-size: 28rpx;
}

.input-actions {
  display: flex;
  margin-left: 20rpx;
}

.action-btn {
  width: 40px;
  height: 40px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
}

.mic-icon::before {
  content: "";
  display: block;
  width: 8px;
  height: 14px;
  border: 2px solid #4A3B5E;
  border-radius: 6px;
}

.mic-icon::after {
  content: "";
  display: block;
  width: 2px;
  height: 8px;
  background: #4A3B5E;
  position: absolute;
  bottom: 10px;
}

.send-icon {
  width: 18px;
  height: 18px;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    width: 18px;
    height: 2px;
    background: #4A3B5E;
    transform: rotate(45deg);
    top: 8px;
  }
  
  &::after {
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 0 0 8px 8px;
    border-color: transparent transparent #4A3B5E transparent;
    transform: rotate(45deg);
    right: 3px;
    top: 3px;
  }
}

/* 上传图片按钮 */
.upload-icon {
  width: 18px;
  height: 18px;
  position: relative;
  
  &::before {
    content: "";
    position: absolute;
    width: 16px;
    height: 12px;
    border: 2px solid #4A3B5E;
    border-radius: 2px;
    left: -1px;
    top: 1px;
  }
  
  &::after {
    content: "";
    position: absolute;
    width: 6px;
    height: 6px;
    background: #4A3B5E;
    border-radius: 50%;
    left: 6px;
    top: 5px;
  }
}

.wave-animation {
  position: absolute;
  width: 100%;
  height: 3px;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  animation: wave 1s infinite linear;
}

.actions-popup {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions-content {
  width: 60%;
  background: #2A2A2A;
  border-radius: min(16rpx, 2vh);
  overflow: hidden;
}

.action-item {
  padding: min(30rpx, 4vh) min(40rpx, 5vw);
  color: #fff;
  font-size: 14px;
  text-align: center;
  
  &:active {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

@keyframes twinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes rain {
  0% { transform: translateY(-10px); }
  100% { transform: translateY(100vh); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wave {
  0% { transform: translateY(-50%) scaleY(1); }
  50% { transform: translateY(-50%) scaleY(2); }
  100% { transform: translateY(-50%) scaleY(1); }
}
/* #ifdef MP-WEIXIN */
/* 小程序端使用固定 rpx 高度并兼容安全区，避免 min()/vh 的差异 */
.input-container {
  margin-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  margin-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* #endif */
</style>
