<template>
  <view class="bottle-container">
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

    <!-- 顶部区域：标题与提示区 -->
    <view class="header-section">
      <text class="star-id">HD {{ starId }}</text>
      <text class="title">星语瓶</text>
      <text class="subtitle">将心事装进星语瓶，静待星空的温柔回音</text>
    </view>

    <!-- 中部区域：星语瓶展示区 -->
    <scroll-view 
      class="bottles-list" 
      scroll-y 
      @scrolltolower="loadMoreBottles"
      @refresherrefresh="refreshBottles"
      refresher-enabled
      :refresher-triggered="isRefreshing"
    >
      <view 
        v-for="(bottle, index) in bottles" 
        :key="index"
        v-if="!shouldHideBottle(bottle)"
        class="bottle-card"
        :class="{ 'expanded': expandedCardIndex === index }"
        @tap="toggleCard(index)"
      >
        <view class="bottle-header">
          <text class="bottle-icon">🍶</text>
          <text class="bottle-date">{{ bottle.date }}</text>
          <text class="delete-btn" @tap.stop="showDeleteConfirm(index)">×</text>
        </view>
        
        <view class="bottle-content" @tap.stop="showComments(index)">
          {{ bottle.content }}
        </view>
        
        <view class="bottle-sender">
          来自 HD {{ bottle.senderId }} 的星语
        </view>
        
        <!-- 收藏按钮 -->
        <view class="favorite-btn" @tap.stop="toggleFavorite(index)">
          <text class="favorite-icon" :class="{ 'favorited': bottle.favorited }">★</text>
        </view>
        
        <!-- 评论计数 -->
        <view class="comment-count" v-if="bottle.comments && bottle.comments.length > 0" @tap.stop="showComments(index)">
          <text class="comment-icon">💬</text>
          <text class="count-text">{{ bottle.comments.length }}</text>
        </view>
      </view>

      <view v-if="bottles.length === 0" class="empty-state">
        <text>星空静悄悄，丢一瓶心事吧</text>
        <view class="empty-bottle">🍶</view>
      </view>
    </scroll-view>

    <!-- 刷新按钮 -->
    <view class="refresh-btn" @tap="refreshRandomBottles">
      <text class="refresh-icon">↻</text>
    </view>

    <!-- 发送星语瓶按钮 -->
    <view class="send-btn" @tap="showSendBottle">
      <text class="send-icon">+</text>
    </view>

    <!-- 弹出框：发送星语瓶 -->
    <view class="modal" v-if="showSendModal" @tap="cancelSend">
      <view class="send-modal-content" @tap.stop>
        <text class="send-title">写下你的星语</text>
        <textarea 
          class="bottle-input" 
          v-model="newBottleContent"
          placeholder="写下你的星语，等待回应..."
          maxlength="100"
          auto-height
        />
        <view class="char-counter">{{ newBottleContent.length }}/100</view>
        <view class="send-actions">
          <button class="cancel-btn" @tap.stop="cancelSend">悄悄收起</button>
          <button class="send-btn-confirm" @tap.stop="sendBottle">送往星空</button>
        </view>
      </view>
    </view>

    <!-- 弹出框：删除确认 -->
    <view class="modal" v-if="showDeleteModal" @tap="cancelDelete">
      <view class="delete-confirm" @tap.stop>
        <text class="confirm-text">将这瓶星语送回星空吗？</text>
        <view class="confirm-actions">
          <button class="cancel-btn" @tap.stop="cancelDelete">再留一会</button>
          <button class="delete-confirm-btn" @tap.stop="confirmDelete">送回星空</button>
        </view>
      </view>
    </view>
    
    <!-- 弹出框：评论列表和输入 -->
    <view class="modal" v-if="showCommentModal" @tap="cancelComment">
      <view class="comment-modal-content" @tap.stop>
        <view class="comment-modal-header">
          <text class="comment-title">共鸣回应</text>
          <text class="close-btn" @tap="cancelComment">×</text>
        </view>
        
        <!-- 原始星语内容 -->
        <view class="original-content" v-if="currentBottle">
          <text class="original-sender">{{ currentBottle.date }} HD {{ currentBottle.senderId }}</text>
          <text class="original-text">{{ currentBottle.content }}</text>
        </view>
        
        <!-- 评论列表 -->
        <scroll-view class="comments-list" scroll-y v-if="currentBottle && currentBottle.comments && currentBottle.comments.length > 0">
          <view 
            v-for="(comment, cIndex) in currentBottle.comments" 
            :key="cIndex"
            class="comment-item"
          >
            <view class="comment-header">
              <text class="comment-sender">HD {{ comment.senderId }}</text>
              <text class="comment-date">{{ comment.date }}</text>
            </view>
            <view class="comment-body">
              <text v-if="!comment.isImage" class="comment-text">{{ comment.content }}</text>
              <image 
                v-else 
                class="comment-image" 
                :src="comment.content" 
                mode="widthFix" 
                @tap="previewImage(comment.content)"
              ></image>
            </view>
          </view>
        </scroll-view>
        
        <view class="no-comments" v-else-if="currentBottle">
          <text>暂无共鸣，说点什么吧</text>
        </view>
        
        <!-- 评论输入区域 -->
        <view class="comment-input-area">
          <input 
            class="comment-input" 
            v-model="newCommentText"
            placeholder="写下你的共鸣..."
            confirm-type="send"
            @confirm="addTextComment"
          />
          <view class="comment-actions">
            <view class="image-upload-btn" @tap="chooseCommentImage">
              <text class="image-icon">🖼️</text>
            </view>
            <button class="send-comment-btn" @tap="addTextComment">发送</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 提示框 -->
    <view class="toast" v-if="showToast">
      <text>{{ toastMessage }}</text>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :active="2" @tab-change="handleTabChange" />
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { sanitizeText } from '@/utils/contentFilter'

// 用户数据
const starId = ref('')

// 星语瓶列表
const bottles = ref([])
const expandedCardIndex = ref(-1)
const isRefreshing = ref(false)

// 弹窗状态
const showSendModal = ref(false)
const showDeleteModal = ref(false)
const deleteIndex = ref(-1)
const newBottleContent = ref('')

// 提示框
const showToast = ref(false)
const toastMessage = ref('')

// 星背景数据
/* #ifdef MP-WEIXIN */
const STAR_COUNT = 30
/* #else */
const STAR_COUNT = 50
/* #endif */
const stars = ref(Array.from({ length: STAR_COUNT }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 30, // 主要集中在顶部
  size: Math.random() * 1.5 + 0.5,
  opacity: Math.random() * 0.5 + 0.3,
  delay: Math.random() * 3
})))

// 评论相关状态
const showCommentModal = ref(false)
const currentBottleIndex = ref(-1)
const currentBottle = computed(() => 
  currentBottleIndex.value >= 0 ? bottles.value[currentBottleIndex.value] : null
)
const newCommentText = ref('')
const hideMyPosts = ref(false)
// 是否需要隐藏该瓶（仅在本设备生效）
const shouldHideBottle = (bottle) => {
  try {
    if (!hideMyPosts.value) return false
    // starId.value 为纯数字字符串（login/register/splash均存储为 'HD 123456'，本页保存时已去掉 'HD ')
    return starId.value && bottle.senderId === starId.value
  } catch (e) {
    return false
  }
}

// 显示提示框
const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 随机生成示例用户ID
const generateRandomUserId = () => {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
}

// 加载示例数据
onMounted(() => {
  // 从存储中获取用户ID
  const savedId = uni.getStorageSync('starId')
  if (savedId) {
    starId.value = savedId.replace('HD ', '')
  }

  // 读取隐私设置（仅本设备生效）
  try {
    const ps = uni.getStorageSync('privacySettings')
    if (ps) {
      const parsed = JSON.parse(ps)
      hideMyPosts.value = !!parsed.hideMyPosts
    }
  } catch (e) {}

  // 加载星语瓶数据
  loadBottles()
  
  // 加载收藏数据
  loadFavorites()
})

// 加载星语瓶数据
const loadBottles = () => {
  // 这里模拟从存储加载数据，实际项目中应该从持久化存储或API加载
  const savedBottles = uni.getStorageSync('bottles')
  if (savedBottles) {
    try {
      bottles.value = JSON.parse(savedBottles)
      // 确保每个星语瓶都有comments数组和favorited属性
      bottles.value.forEach(bottle => {
        if (!bottle.comments) {
          bottle.comments = []
        }
        if (bottle.favorited === undefined) {
          bottle.favorited = false
        }
      })
      // 应用收藏状态
      applyFavoriteStatus()
    } catch (e) {
      bottles.value = []
    }
  } else {
    // 示例数据
    bottles.value = [
      {
        date: '2025.04.03 20:45',
        content: '今晚的星星很亮，看着它们，突然明白了很多事。原来所有的相遇和错过，都是宇宙安排的必然。希望你也能看到同样的星空，感受这份宁静。',
        senderId: '294731',
        expanded: false,
        favorited: false,
        comments: [{
          date: '04.03 21:30',
          content: '我也看到了，真的很美。今晚的星空格外清澈。',
          senderId: '567812',
          isImage: false
        }]
      },
      {
        date: '2025.04.01 23:30',
        content: '深夜里听着钢琴曲，窗外下着小雨。突然很想念一个人，却不敢联系。把这份思念放进星语瓶，希望能漂到你的星球。',
        senderId: '783421',
        expanded: false,
        favorited: false,
        comments: []
      },
      {
        date: '2025.03.27 22:15',
        content: '今天读了一本很喜欢的书，里面有一句话："我们都是宇宙里的尘埃，却各自闪着微光。"感觉说到了心里，分享给同样孤独又闪亮的你。',
        senderId: '456829',
        expanded: false,
        favorited: false,
        comments: []
      }
    ]
    // 保存示例数据
    saveBottlesToStorage()
  }
}

// 生成随机星语瓶
const generateRandomBottles = (count = 3) => {
  const randomContents = [
    '黄昏时刻，城市的灯光渐次亮起，像是宇宙中的星辰。每一盏灯背后，都是一个不为人知的故事。',
    '今天在海边走了很久，听着浪声，看星星倒映在海面。有些问题，在大自然面前显得那么渺小。',
    '午夜醒来，窗外月光如水。突然想起很久以前的一场告别，那时也是这样的月色。',
    '下雨时总会想起你，因为你说过喜欢雨声。不知道在你的城市，是否也在下雨？',
    '有些心事，像风中的蒲公英，不知道会飘到何处。希望拾到这颗星语瓶的你，能感受到我的心情。',
    '旅行的意义或许不在远方，而在沿途的风景和内心的变化。今天看了一场很美的日落。',
    '时间是最奇妙的东西，它能带走伤痛，也能让回忆变得温柔。岁月静好，感谢相遇。',
    '凌晨两点，整座城市仿佛只有我一个人醒着。这种时刻，思绪总是特别清晰。',
    '今天读了一首很美的诗，其中有一句："我们都是星星的孩子。"突然觉得，我们的相遇也是宇宙的安排。',
    '夜深人静，窗外星空浩瀚。曾经以为重要的事，现在看来不过是微尘。'
  ]
  
  const now = new Date()
  const year = now.getFullYear()
  
  const newBottles = []
  for (let i = 0; i < count; i++) {
    // 随机日期（最近30天内）
    const pastDays = Math.floor(Math.random() * 30)
    const bottleDate = new Date(now)
    bottleDate.setDate(bottleDate.getDate() - pastDays)
    
    const month = String(bottleDate.getMonth() + 1).padStart(2, '0')
    const day = String(bottleDate.getDate()).padStart(2, '0')
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, '0')
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, '0')
    const dateStr = `${year}.${month}.${day} ${hours}:${minutes}`
    
    // 随机内容
    const contentIndex = Math.floor(Math.random() * randomContents.length)
    
    newBottles.push({
      date: dateStr,
      content: randomContents[contentIndex],
      senderId: generateRandomUserId(),
      expanded: false,
      favorited: false,
      comments: []
    })
  }
  
  return newBottles
}

// 刷新获取随机星语瓶
const refreshRandomBottles = () => {
  isRefreshing.value = true
  
  // 显示加载动画
  uni.showLoading({
    title: '漫游星海中...'
  })
  
  // 模拟网络请求延迟
  setTimeout(() => {
    // 获取随机星语瓶
    const newBottles = generateRandomBottles(3)
    
    // 替换现有的星语瓶（保留收藏的）
    const favoritedBottles = bottles.value.filter(bottle => bottle.favorited)
    bottles.value = [...newBottles, ...favoritedBottles]
    
    // 保存到存储
    saveBottlesToStorage()
    
    // 隐藏加载动画
    uni.hideLoading()
    isRefreshing.value = false
    
    // 显示提示
    showToastMessage('发现新的星语瓶')
  }, 1500)
}

// 收藏数据相关
// 加载收藏状态
const loadFavorites = () => {
  try {
    const favorites = uni.getStorageSync('favoriteBottles')
    if (favorites) {
      const favList = JSON.parse(favorites)
      // 这里只需获取收藏ID列表，应用到当前星语瓶
      favList.forEach(favBottle => {
        const found = bottles.value.find(b => 
          b.date === favBottle.date && 
          b.content === favBottle.content && 
          b.senderId === favBottle.senderId
        )
        if (found) {
          found.favorited = true
        } else {
          // 如果当前列表中没有这个收藏的星语瓶，添加到列表
          favBottle.favorited = true
          bottles.value.push(favBottle)
        }
      })
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
}

// 应用收藏状态到当前列表
const applyFavoriteStatus = () => {
  try {
    const favorites = uni.getStorageSync('favoriteBottles')
    if (favorites) {
      const favList = JSON.parse(favorites)
      bottles.value.forEach(bottle => {
        bottle.favorited = favList.some(favBottle => 
          bottle.date === favBottle.date && 
          bottle.content === favBottle.content && 
          bottle.senderId === favBottle.senderId
        )
      })
    }
  } catch (e) {
    console.error('应用收藏状态失败', e)
  }
}

// 切换收藏状态
const toggleFavorite = (index) => {
  if (index < 0 || index >= bottles.value.length) return
  
  const bottle = bottles.value[index]
  bottle.favorited = !bottle.favorited
  
  // 更新收藏列表
  saveFavorites()
  
  // 显示提示
  showToastMessage(bottle.favorited ? '已添加到收藏' : '已取消收藏')
}

// 保存收藏到存储
const saveFavorites = () => {
  try {
    const favoriteBottles = bottles.value.filter(bottle => bottle.favorited)
    uni.setStorageSync('favoriteBottles', JSON.stringify(favoriteBottles))
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

 // 发送星语瓶
const sendBottle = () => {
  const raw = newBottleContent.value.trim()
  if (!raw) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  const { clean, flagged } = sanitizeText(raw)

  // 获取当前日期和时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const dateStr = `${year}.${month}.${day} ${hours}:${minutes}`
  
  // 创建新星语瓶
  const newBottle = {
    date: dateStr,
    content: clean,
    senderId: starId.value,
    expanded: false,
    favorited: false,
    comments: [] // 初始化空评论数组
  }
  
  // 添加到星语瓶列表
  bottles.value.unshift(newBottle)
  saveBottlesToStorage()

  if (flagged) {
    uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
  }
  
  // 关闭弹窗
  showSendModal.value = false
  
  // 提示成功
  showToastMessage('你的星语瓶已飞向星空，静待回音')
}

// 切换卡片展开/收起状态
const toggleCard = (index) => {
  if (expandedCardIndex.value === index) {
    expandedCardIndex.value = -1
  } else {
    expandedCardIndex.value = index
  }
}

// 显示发送星语瓶弹窗
const showSendBottle = () => {
  newBottleContent.value = ''
  showSendModal.value = true
}

// 取消发送
const cancelSend = () => {
  showSendModal.value = false
}

// 显示删除确认框
const showDeleteConfirm = (index) => {
  deleteIndex.value = index
  showDeleteModal.value = true
}

// 取消删除
const cancelDelete = () => {
  showDeleteModal.value = false
  deleteIndex.value = -1
}

// 确认删除
const confirmDelete = () => {
  if (deleteIndex.value >= 0) {
    bottles.value.splice(deleteIndex.value, 1)
    saveBottlesToStorage()
    showToastMessage('星语已送回星空')
  }
  showDeleteModal.value = false
  deleteIndex.value = -1
  
  // 重置展开状态
  if (expandedCardIndex.value === deleteIndex.value) {
    expandedCardIndex.value = -1
  }
}

// 加载更多星语瓶
const loadMoreBottles = () => {
  // 实际项目中，这里应该分页加载更多数据
  // 这里只是示例，暂不实现具体逻辑
}

// 刷新星语瓶
const refreshBottles = () => {
  isRefreshing.value = true
  // 模拟刷新延迟
  setTimeout(() => {
    loadBottles()
    isRefreshing.value = false
    showToastMessage('星语瓶已更新')
  }, 1000)
}

// 处理标签变化
const handleTabChange = (index) => {
  // 导航逻辑由TabBar组件处理
}

// 显示评论
const showComments = (index) => {
  currentBottleIndex.value = index
  
  // 确保星语瓶有comments数组
  if (!bottles.value[index].comments) {
    bottles.value[index].comments = []
  }
  
  showCommentModal.value = true
}

// 取消评论
const cancelComment = () => {
  showCommentModal.value = false
  newCommentText.value = ''
  currentBottleIndex.value = -1
}

// 添加文字评论
const addTextComment = () => {
  if (!newCommentText.value.trim()) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
    return
  }
  
  addComment({
    content: newCommentText.value,
    isImage: false
  })
  
  newCommentText.value = ''
}

// 选择图片评论
const chooseCommentImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      addComment({
        content: res.tempFilePaths[0],
        isImage: true
      })
    }
  })
}

 // 添加评论通用方法
const addComment = (commentData) => {
  if (currentBottleIndex.value < 0) return
  
  // 获取当前日期和时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const dateStr = `${month}.${day} ${hours}:${minutes}`

  // 文字评论净化（图片不处理）
  let contentVal = commentData.content
  let flagged = false
  if (!commentData.isImage) {
    const { clean, flagged: f } = sanitizeText(String(contentVal ?? ''))
    contentVal = clean
    flagged = f
  }
  
  // 创建新评论
  const newComment = {
    date: dateStr,
    content: contentVal,
    senderId: starId.value,
    isImage: commentData.isImage
  }
  
  // 添加到评论列表
  bottles.value[currentBottleIndex.value].comments.push(newComment)
  saveBottlesToStorage()

  if (flagged) {
    uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
  }
  
  // 提示成功
  showToastMessage('共鸣已送出')
}

// 预览图片
const previewImage = (imagePath) => {
  uni.previewImage({
    urls: [imagePath],
    current: imagePath
  })
}

// 保存星语瓶数据到存储
const saveBottlesToStorage = () => {
  uni.setStorageSync('bottles', JSON.stringify(bottles.value))
}
</script>

<style lang="scss">
.bottle-container {
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

/* 顶部区域：标题与提示区 */
.header-section {
  padding: min(30px, 8vh) min(20px, 5vw) min(20px, 5vh);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  height: 25vh;
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
  text-align: center;
  opacity: 0;
  animation: fadeIn 2s forwards;
  max-width: 80%;
}

/* 中部区域：星语瓶展示区 */
.bottles-list {
  height: calc(100vh - 25vh - (65px + env(safe-area-inset-bottom))); /* 减去头部和底部高度 + 安全区 */
  padding: 0 min(20px, 5vw);
  position: relative;
  z-index: 1;
}

.bottle-card {
  width: min(90%, 600px);
  margin: 15px auto;
  padding: 15px;
  background: rgba(46, 46, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(74, 59, 94, 0.5);
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: min(150px, 30vh);
  
  &.expanded {
    max-height: min(300px, 50vh);
    background: rgba(74, 59, 94, 0.2);
    box-shadow: 0 2px 15px rgba(74, 59, 94, 0.3);
  }
}

.bottle-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.bottle-icon {
  font-size: min(18px, 5vw);
  margin-right: 8px;
  animation: float 3s ease-in-out infinite;
}

.bottle-date {
  font-size: min(12px, 3.2vw);
  color: #B0B0B0;
}

.bottle-content {
  font-size: min(14px, 4vw);
  color: #fff;
  line-height: 1.5;
  word-break: break-word;
  padding-right: 25px; /* 为删除按钮留出空间 */
  margin-bottom: 15px;
}
/* 收起态两行截断（展开态显示全文） */
.bottle-card:not(.expanded) .bottle-content {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.bottle-sender {
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
  position: absolute;
  right: 15px;
  bottom: 15px;
  background: rgba(74, 59, 94, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20px;
  height: 20px;
  font-size: 18px;
  color: #B0B0B0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    color: #4A3B5E;
  }
}

/* 收藏按钮样式 */
.favorite-btn {
  position: absolute;
  bottom: 15px;
  left: 15px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 59, 94, 0.2);
  border-radius: 50%;
  z-index: 5;
}

.favorite-icon {
  font-size: min(14px, 4vw);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  
  &.favorited {
    color: #FFD700;
    transform: scale(1.1);
    text-shadow: 0 0 5px rgba(255, 215, 0, 0.7);
  }
}

/* 刷新按钮样式 */
.refresh-btn {
  position: fixed;
  right: min(30px, 8vw);
  bottom: calc(65px + env(safe-area-inset-bottom) + min(20px, 5vh) + 55px); /* 位于发送按钮上方 */
  width: min(40px, 11vw);
  height: min(40px, 11vw);
  background: rgba(74, 59, 94, 0.8);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 2px 10px rgba(74, 59, 94, 0.5);
  
  &:active {
    transform: scale(0.95);
  }
}

.refresh-icon {
  font-size: min(20px, 5.5vw);
  font-weight: 300;
  animation: spin 5s infinite linear paused;
}

.refresh-btn:active .refresh-icon {
  animation-play-state: running;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #B0B0B0;
  font-size: min(14px, 4vw);
  text-align: center;
  opacity: 0.7;
}

.empty-bottle {
  font-size: min(40px, 10vw);
  margin-top: 20px;
  animation: float 3s ease-in-out infinite;
  opacity: 0.5;
}

/* 发送星语瓶按钮 */
.send-btn {
  position: fixed;
  right: min(30px, 8vw);
  bottom: calc(65px + env(safe-area-inset-bottom) + min(20px, 5vh));
  width: min(40px, 11vw);
  height: min(40px, 11vw);
  background: #4A3B5E;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 10px rgba(74, 59, 94, 0.5);
  
  &:active {
    transform: scale(0.95);
  }
}

.send-icon {
  font-size: min(24px, 6.5vw);
  font-weight: 300;
}

/* 弹出框 */
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

.send-modal-content {
  width: min(80%, 500px);
  background: #2A2A2A;
  border-radius: 8px;
  padding: min(20px, 5vh);
  animation: scaleIn 0.3s forwards;
  max-height: 80vh;
  overflow-y: auto;
}

.send-title {
  color: #B0B0B0;
  font-size: min(14px, 4vw);
  margin-bottom: 15px;
  display: block;
  text-align: center;
}

.bottle-input {
  width: 100%;
  min-height: min(120px, 20vh);
  max-height: 40vh;
  background: rgba(46, 46, 46, 0.8);
  border: 1px solid #4A3B5E;
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  font-size: min(14px, 4vw);
  margin-bottom: 5px;
}

.char-counter {
  text-align: right;
  color: #B0B0B0;
  font-size: min(12px, 3.2vw);
  margin-bottom: 15px;
}

.send-actions {
  display: flex;
  justify-content: space-between;
}

.cancel-btn, .send-btn-confirm, .delete-confirm-btn {
  padding: 8px 15px;
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

.send-btn-confirm {
  color: #fff;
  background: #4A3B5E;
  
  &:active {
    opacity: 0.9;
  }
}

/* 评论相关样式 */
.comment-count {
  position: absolute;
  right: 15px;
  bottom: 15px;
  display: flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(74, 59, 94, 0.2);
}

.comment-icon {
  font-size: min(12px, 3.2vw);
  margin-right: 4px;
}

.count-text {
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
}

.comment-modal-content {
  width: min(90%, 600px);
  max-height: 80vh;
  background: #2A2A2A;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  animation: scaleIn 0.3s forwards;
}

.comment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.comment-title {
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

.original-content {
  background: rgba(74, 59, 94, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.original-sender {
  font-size: min(12px, 3.2vw);
  color: #B0B0B0;
  margin-bottom: 5px;
  display: block;
}

.original-text {
  font-size: min(14px, 4vw);
  color: #fff;
  line-height: 1.5;
}

.comments-list {
  max-height: calc(40vh);
  margin-bottom: 15px;
  overflow-y: auto;
}

.comment-item {
  margin-bottom: 10px;
  padding: 10px;
  background: rgba(46, 46, 46, 0.8);
  border-radius: 8px;
  border-left: 2px solid rgba(74, 59, 94, 0.5);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.comment-sender {
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
}

.comment-date {
  font-size: min(12px, 3.2vw);
  color: #B0B0B0;
}

.comment-body {
  width: 100%;
}

.comment-text {
  font-size: min(14px, 4vw);
  color: #fff;
  line-height: 1.5;
  word-break: break-word;
}

.comment-image {
  width: 100%;
  max-width: 200px;
  border-radius: 4px;
}

.no-comments {
  display: flex;
  justify-content: center;
  color: #B0B0B0;
  font-size: min(14px, 4vw);
  margin: 20px 0;
}

.comment-input-area {
  display: flex;
  flex-direction: column;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-input {
  background: rgba(46, 46, 46, 0.8);
  height: 40px;
  border-radius: 20px;
  padding: 0 15px;
  color: #fff;
  font-size: min(14px, 4vw);
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.image-upload-btn {
  width: 36px;
  height: 36px;
  background: rgba(46, 46, 46, 0.8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: rgba(74, 59, 94, 0.4);
  }
}

.image-icon {
  font-size: min(18px, 5vw);
}

.send-comment-btn {
  background: #4A3B5E;
  color: #fff;
  font-size: min(14px, 4vw);
  padding: 6px 15px;
  border-radius: 20px;
  border: none;
  
  &:active {
    opacity: 0.9;
  }
}

/* 删除确认弹窗 */
.delete-confirm {
  width: min(70%, 400px);
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
  justify-content: space-between;
}

.delete-confirm-btn {
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

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
/* #ifdef MP-WEIXIN */
/* 小程序端使用固定 rpx 高度并兼容安全区，避免 min()/vh 在部分机型上的差异 */
.bottle-container {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* 头部区域按约 360rpx 估算，避免 25vh 在部分机型表现不一致 */
.bottles-list {
  height: calc(100vh - 360rpx - (120rpx + constant(safe-area-inset-bottom)));
  height: calc(100vh - 360rpx - (120rpx + env(safe-area-inset-bottom)));
}
/* 悬浮按钮位置按 rpx 固定并叠加安全区 */
.send-btn {
  bottom: calc(120rpx + constant(safe-area-inset-bottom) + 40rpx);
  bottom: calc(120rpx + env(safe-area-inset-bottom) + 40rpx);
}
.refresh-btn {
  bottom: calc(120rpx + constant(safe-area-inset-bottom) + 120rpx);
  bottom: calc(120rpx + env(safe-area-inset-bottom) + 120rpx);
}
/* #endif */
</style>
