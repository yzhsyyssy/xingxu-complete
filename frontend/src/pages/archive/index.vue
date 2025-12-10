<template>
  <view class="archive-container">
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
      <text class="title">星河档案</text>
      <text class="subtitle">你的星空记忆</text>
    </view>

    <!-- 中部区域：档案列表区 -->
    <scroll-view 
      class="archives-list" 
      scroll-y 
      @scrolltolower="loadMoreRecords"
      @refresherrefresh="refreshRecords"
      refresher-enabled
      :refresher-triggered="isRefreshing"
    >
      <view 
        v-for="(archive, index) in archives" 
        :key="index"
        class="archive-card"
        :class="{ 'expanded': expandedCardIndex === index, 'editing': editingCardIndex === index }"
        @tap="toggleCard(index)"
      >
        <view class="archive-date">{{ archive.date }}</view>
        
        <view v-if="editingCardIndex === index" class="edit-container">
          <textarea 
            class="edit-input" 
            v-model="editingContent"
            auto-height
            focus
          />
          <view class="edit-actions">
            <button class="cancel-edit-btn" @tap.stop="cancelEdit">取消</button>
            <button class="save-edit-btn" @tap.stop="saveEdit">保存</button>
          </view>
        </view>
        
        <view v-else class="archive-preview">
          {{ archive.content }}
        </view>
        
        <view class="archive-scene">{{ archive.scene }}</view>
        
        <view class="delete-btn" @tap.stop="showDeleteConfirm(index)">×</view>
        
        <view v-if="expandedCardIndex === index && editingCardIndex !== index" class="edit-btn" @tap.stop="startEdit(index)">
          编辑
        </view>
      </view>

      <view v-if="archives.length === 0" class="empty-state">
        <text>星河空空，快去记录吧</text>
        <view class="empty-stars"></view>
      </view>
    </scroll-view>

    <!-- 添加按钮 -->
    <view class="add-btn" @tap="showAddArchive">+</view>

    <!-- 添加档案弹窗 -->
    <view class="modal" v-if="showAddModal" @tap.stop="cancelAdd">
      <view class="modal-content" @tap.stop>
        <textarea 
          class="archive-input" 
          v-model="newArchiveContent"
          placeholder="记录此刻..."
          auto-height
        />
        <view class="scene-selector">
          <text>场景：</text>
          <picker 
            :range="sceneOptions" 
            @change="handleSceneChange"
            :value="selectedSceneIndex"
          >
            <view class="picker-value">{{ sceneOptions[selectedSceneIndex] }}</view>
          </picker>
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @tap.stop="cancelAdd">取消</button>
          <button class="save-btn" @tap.stop="saveArchive">保存</button>
        </view>
      </view>
    </view>

    <!-- 删除确认弹窗 -->
    <view class="modal" v-if="showDeleteModal" @tap.stop="cancelDelete">
      <view class="delete-confirm" @tap.stop>
        <text class="confirm-text">删除这条记忆？</text>
        <view class="confirm-actions">
          <button class="cancel-btn" @tap.stop="cancelDelete">取消</button>
          <button class="delete-confirm-btn" @tap.stop="confirmDelete">确认</button>
        </view>
      </view>
    </view>

    <!-- 操作提示 -->
    <view class="toast" v-if="showToast">
      <text>{{ toastMessage }}</text>
    </view>

    <!-- 底部导航栏 -->
    <tab-bar :active="3" @tab-change="handleTabChange" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabBar from '@/components/TabBar.vue'
import { sanitizeText } from '@/utils/contentFilter'

// 用户数据
const starId = ref('')

// 档案列表数据
const archives = ref([])
const expandedCardIndex = ref(-1)
const isRefreshing = ref(false)

// 编辑状态
const editingCardIndex = ref(-1)
const editingContent = ref('')

// 弹窗状态
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const deleteIndex = ref(-1)
const newArchiveContent = ref('')
const selectedSceneIndex = ref(0)
const sceneOptions = ['深夜电台', '雨中漫步', '星空独白']

// 提示框
const showToast = ref(false)
const toastMessage = ref('')

// 星背景数据
 // #ifdef MP-WEIXIN
const STAR_COUNT = 30
// #endif
// #ifndef MP-WEIXIN
const STAR_COUNT = 50
// #endif
const stars = ref(Array.from({ length: STAR_COUNT }, () => ({
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

// 加载示例数据
onMounted(() => {
  // 从存储中获取用户ID
  const savedId = uni.getStorageSync('starId')
  if (savedId) {
    starId.value = savedId.replace('HD ', '')
  }
  
  // 加载档案数据
  loadArchives()
})

// 加载档案数据
const loadArchives = () => {
  // 这里模拟从存储加载数据，实际项目中应该从持久化存储加载
  const savedArchives = uni.getStorageSync('archives')
  if (savedArchives) {
    try {
      archives.value = JSON.parse(savedArchives)
    } catch (e) {
      archives.value = []
    }
  } else {
    // 示例数据
    archives.value = [
      {
        date: '2025.04.03 20:45',
        content: '今晚的雨声很温柔，仿佛把所有烦恼都冲刷干净了。坐在窗边，看着雨滴在玻璃上划出痕迹，突然觉得内心很平静。',
        scene: '雨中漫步',
        expanded: false
      },
      {
        date: '2025.04.01 23:30',
        content: '深夜里一个人听着歌，总有种回到过去的感觉。那些熟悉的旋律像是时光机，带我回到最初的感动。',
        scene: '深夜电台',
        expanded: false
      },
      {
        date: '2025.03.27 22:15',
        content: '抬头仰望星空，突然觉得自己很渺小，但又觉得内心很宽广。这种矛盾的感受，或许就是宇宙给我的礼物吧。',
        scene: '星空独白',
        expanded: false
      }
    ]
    // 保存示例数据
    saveArchivesToStorage()
  }
}

// 保存档案数据到存储
const saveArchivesToStorage = () => {
  uni.setStorageSync('archives', JSON.stringify(archives.value))
}

// 切换卡片展开/收起状态
const toggleCard = (index) => {
  // 如果正在编辑，不响应点击
  if (editingCardIndex.value !== -1) return
  
  if (expandedCardIndex.value === index) {
    expandedCardIndex.value = -1
  } else {
    expandedCardIndex.value = index
  }
}

// 开始编辑
const startEdit = (index) => {
  editingCardIndex.value = index
  editingContent.value = archives.value[index].content
}

// 取消编辑
const cancelEdit = () => {
  editingCardIndex.value = -1
  editingContent.value = ''
}

// 保存编辑
const saveEdit = () => {
  if (editingCardIndex.value >= 0) {
    if (!editingContent.value.trim()) {
      uni.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
      return
    }

    const { clean, flagged } = sanitizeText(editingContent.value.trim())
    
    archives.value[editingCardIndex.value].content = clean
    saveArchivesToStorage()
    editingCardIndex.value = -1
    showToastMessage('已保存')
    if (flagged) {
      uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
    }
  }
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
    archives.value.splice(deleteIndex.value, 1)
    saveArchivesToStorage()
    showToastMessage('已删除')
  }
  showDeleteModal.value = false
  deleteIndex.value = -1
  
  // 重置展开状态
  if (expandedCardIndex.value === deleteIndex.value) {
    expandedCardIndex.value = -1
  }
}

// 显示添加档案弹窗
const showAddArchive = () => {
  newArchiveContent.value = ''
  selectedSceneIndex.value = 0
  showAddModal.value = true
}

// 取消添加
const cancelAdd = () => {
  showAddModal.value = false
}

// 处理场景选择
const handleSceneChange = (e) => {
  selectedSceneIndex.value = e.detail.value
}

// 保存新档案
const saveArchive = () => {
  const raw = newArchiveContent.value.trim()
  if (!raw) {
    uni.showToast({
      title: '请输入内容',
      icon: 'none'
    })
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
  
  // 创建新档案
  const newArchive = {
    date: dateStr,
    content: clean,
    scene: sceneOptions[selectedSceneIndex.value],
    expanded: false
  }
  
  // 添加到档案列表
  archives.value.unshift(newArchive)
  saveArchivesToStorage()

  if (flagged) {
    uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
  }
  
  // 关闭弹窗
  showAddModal.value = false
  
  // 提示成功
  showToastMessage('已记录')
}

// 加载更多记录
const loadMoreRecords = () => {
  // 实际项目中，这里应该分页加载更多数据
  // 这里只是示例，暂不实现具体逻辑
}

// 刷新记录
const refreshRecords = () => {
  isRefreshing.value = true
  // 模拟刷新延迟
  setTimeout(() => {
    loadArchives()
    isRefreshing.value = false
  }, 1000)
}

// 处理标签变化
const handleTabChange = (index) => {
  // 导航逻辑由TabBar组件处理
}
</script>

<style lang="scss">
.archive-container {
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

/* 中部区域：档案列表区 */
.archives-list {
  height: calc(100vh - min(170px, 30vh) - (65px + env(safe-area-inset-bottom))); /* 减去头部和底部高度 + 安全区 */
  padding: 0 min(20px, 5vw);
  position: relative;
  z-index: 1;
}

.archive-card {
  width: min(90%, 600px);
  margin: 20px auto;
  padding: 15px;
  background: rgba(46, 46, 46, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid #4A3B5E;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  max-height: min(120px, 25vh);
  
  &.expanded {
    max-height: min(300px, 50vh);
    background: rgba(74, 59, 94, 0.2);
    box-shadow: 0 2px 15px rgba(74, 59, 94, 0.3);
  }
  
  &.editing {
    max-height: min(350px, 60vh);
    background: rgba(74, 59, 94, 0.2);
  }
}

.archive-date {
  font-size: min(12px, 3.2vw);
  color: #B0B0B0;
  margin-bottom: 5px;
}

.archive-preview {
  font-size: min(14px, 4vw);
  color: #fff;
  line-height: 1.4;
  word-break: break-word;
  padding-right: 25px; /* 为删除按钮留出空间 */
}
/* 收起态两行截断（展开态显示全文） */
.archive-card:not(.expanded) .archive-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.archive-scene {
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
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

.edit-btn {
  position: absolute;
  right: 15px;
  bottom: 15px;
  font-size: min(12px, 3.2vw);
  color: #4A3B5E;
  padding: 2px 10px;
  border-radius: 10px;
  background: rgba(74, 59, 94, 0.2);
  
  &:active {
    background: rgba(74, 59, 94, 0.4);
  }
}

.edit-container {
  width: 100%;
}

.edit-input {
  width: 100%;
  min-height: 100px;
  background: rgba(58, 58, 58, 0.8);
  border: 1px solid #4A3B5E;
  border-radius: 4px;
  padding: 10px;
  color: #fff;
  font-size: min(14px, 4vw);
  margin-bottom: 10px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  margin-bottom: 10px;
}

.cancel-edit-btn, .save-edit-btn {
  padding: 5px 15px;
  border-radius: 4px;
  font-size: min(12px, 3.5vw);
  background: transparent;
  border: none;
  margin-left: 10px;
}

.cancel-edit-btn {
  color: #B0B0B0;
  
  &:active {
    opacity: 0.7;
  }
}

.save-edit-btn {
  color: #fff;
  background: #4A3B5E;
  
  &:active {
    opacity: 0.9;
  }
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

.empty-stars {
  width: 100px;
  height: 100px;
  margin-top: 20px;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: #4A3B5E;
    opacity: 0.2;
    border-radius: 50%;
    animation: pulse 3s infinite alternate;
  }
  
  &::before {
    width: 50px;
    height: 50px;
    left: 10px;
    top: 20px;
    animation-delay: 0.5s;
  }
  
  &::after {
    width: 30px;
    height: 30px;
    right: 15px;
    top: 30px;
    animation-delay: 1s;
  }
}

/* 添加按钮 */
.add-btn {
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
  font-size: min(24px, 6.5vw);
  z-index: 10;
  animation: pulse 2s infinite;
  box-shadow: 0 2px 10px rgba(74, 59, 94, 0.5);
  
  &:active {
    transform: scale(0.95);
  }
}

/* 弹窗 */
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.3s forwards;
}

.modal-content {
  width: min(80%, 500px);
  background: #2A2A2A;
  border-radius: 8px;
  padding: min(20px, 5vh);
  animation: scaleIn 0.3s forwards;
  max-height: 80vh;
  overflow-y: auto;
}

.archive-input {
  width: 100%;
  min-height: min(120px, 20vh);
  max-height: 40vh;
  background: rgba(46, 46, 46, 0.8);
  border: 1px solid #4A3B5E;
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  font-size: min(14px, 4vw);
  margin-bottom: 15px;
}

.scene-selector {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  text {
    color: #B0B0B0;
    font-size: min(14px, 4vw);
    margin-right: 10px;
  }
}

.picker-value {
  color: #4A3B5E;
  font-size: min(14px, 4vw);
  padding: 5px 10px;
  background: rgba(74, 59, 94, 0.2);
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn, .save-btn, .delete-confirm-btn {
  padding: 6px 15px;
  border-radius: 4px;
  font-size: min(14px, 4vw);
  background: transparent;
  border: none;
  margin-left: 10px;
}

.cancel-btn {
  color: #B0B0B0;
  
  &:active {
    opacity: 0.7;
  }
}

.save-btn {
  color: #fff;
  background: #4A3B5E;
  
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
  background: #D35F5F;
  
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
/* #ifdef MP-WEIXIN */
/* 小程序端使用固定 rpx 与安全区，避免 min()/vh 误差 */
.archive-container {
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}
/* 头部区域按约 300rpx 估算，若后续视觉有偏差可微调该值 */
.archives-list {
  height: calc(100vh - 300rpx - (120rpx + constant(safe-area-inset-bottom)));
  height: calc(100vh - 300rpx - (120rpx + env(safe-area-inset-bottom)));
}
/* 悬浮添加按钮位置 */
.add-btn {
  bottom: calc(120rpx + constant(safe-area-inset-bottom) + 40rpx);
  bottom: calc(120rpx + env(safe-area-inset-bottom) + 40rpx);
}
/* #endif */
</style>
