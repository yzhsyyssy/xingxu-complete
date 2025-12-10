<template>
  <view class="tab-bar">
    <view 
      v-for="(tab, index) in tabs" 
      :key="index" 
      class="tab-item"
      :class="{ active: activeTab === index }"
      @tap="switchTab(index)"
    >
      <view :class="['tab-icon', tab.icon]"></view>
      <text class="tab-text">{{ tab.name }}</text>
      <view v-if="activeTab === index" class="active-dot"></view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  active: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tabChange'])

// 导航数据 - 增加星语按钮
const tabs = [
  { name: '首页', icon: 'icon-home', path: '/pages/gallery/index' },
  { name: '星空', icon: 'icon-star', path: '/pages/scene/index' },
  { name: '星语', icon: 'icon-bottle', path: '/pages/bottle/index' },
  { name: '档案', icon: 'icon-book', path: '/pages/archive/index' },
  { name: '我的', icon: 'icon-user', path: '/pages/user/index' }
]

// 当前激活的标签页
const activeTab = computed(() => props.active)

// 切换标签
const switchTab = (index) => {
  if (index === activeTab.value) return
  
  emit('tabChange', index)
  
  // 导航逻辑
  const targetPath = tabs[index].path
  if (targetPath) {
    // 特殊处理星空页面的导航
    if (index === 1) {
      // 检查是否已经有场景ID
      const pages = getCurrentPages()
      const currentRoute = pages[pages.length - 1]?.route
      
      // 如果当前不在场景页，提示用户先选择场景
      if (!currentRoute?.includes('scene')) {
        uni.showToast({
          title: '请先选择一个时空加入',
          icon: 'none',
          duration: 2000
        })
        return
      }
    }
    
    // 使用redirectTo避免页面堆栈过多
    uni.redirectTo({ 
      url: targetPath,
      fail: () => {
        // 如果失败，可能是已经在当前页面，或者页面栈已满
        uni.switchTab({ 
          url: targetPath,
          fail: () => {
            // 兜底方案 - 重新加载
            uni.reLaunch({ url: targetPath })
          }
        })
      }
    })
  } else {
    uni.showToast({
      title: `${tabs[index].name}功能开发中`,
      icon: 'none'
    })
  }
}
</script>

<style lang="scss">
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(46, 46, 46, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #4A3B5E;
  z-index: 50;
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px 0;
  position: relative;
  width: 20%; /* 从25%改为20%，因为现在是5个按钮 */
}

.tab-icon {
  width: 20px;
  height: 20px;
  margin-bottom: 5px;
  position: relative;
  
  &::before, &::after {
    content: '';
    position: absolute;
    background: #B0B0B0;
    transition: all 0.3s;
  }
}

.tab-text {
  font-size: 10px;
  color: #B0B0B0;
  transition: color 0.3s;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6A56A0;
  position: absolute;
  bottom: 3px;
}

.tab-item.active {
  .tab-text {
    color: #6A56A0;
  }
  
  .tab-icon::before, .tab-icon::after {
    background: #6A56A0;
    border-color: #6A56A0;
  }
}

/* 图标样式 */
.icon-home::before {
  width: 18px;
  height: 1px;
  bottom: 0;
  left: 1px;
}

.icon-home::after {
  width: 16px;
  height: 12px;
  border: 1px solid;
  border-bottom: none;
  bottom: 1px;
  left: 2px;
  background: transparent;
  border-radius: 2px 2px 0 0;
}

.icon-star::before {
  width: 20px;
  height: 20px;
  background: transparent;
  border: 1px solid;
  border-radius: 50%;
  left: 0;
  top: 0;
}

.icon-star::after {
  content: '★';
  font-size: 12px;
  background: transparent;
  left: 4px;
  top: 2px;
}

/* 新增星语瓶图标 */
.icon-bottle::before {
  width: 10px;
  height: 14px;
  border: 1px solid;
  border-radius: 4px 4px 6px 6px;
  background: transparent;
  left: 5px;
  top: 3px;
}

.icon-bottle::after {
  width: 6px;
  height: 6px;
  border: 1px solid;
  border-radius: 50% 50% 0 0;
  border-bottom: none;
  background: transparent;
  left: 7px;
  top: 0;
}

.icon-book::before {
  width: 16px;
  height: 18px;
  border: 1px solid;
  border-radius: 1px;
  background: transparent;
  left: 2px;
  top: 1px;
}

.icon-book::after {
  width: 10px;
  height: 1px;
  left: 5px;
  top: 9px;
}

.icon-user::before {
  width: 8px;
  height: 8px;
  border: 1px solid;
  border-radius: 50%;
  background: transparent;
  left: 6px;
  top: 2px;
}

.icon-user::after {
  width: 14px;
  height: 7px;
  border: 1px solid;
  border-radius: 6px 6px 10px 10px;
  background: transparent;
  border-top: none;
  left: 3px;
  top: 10px;
}
/* #ifdef MP-WEIXIN */
.tab-bar {
  /* 使用固定 rpx 高度，兼容小程序端 */
  height: 120rpx;
  /* iOS 老版本优先 constant，再用 env 兜底 */
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */
</style>
