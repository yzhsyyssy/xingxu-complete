// 示例：修改登录页面以使用API
// 将以下代码替换 src/pages/login/index.vue 中的相关部分

// 1. 导入API工具
import API from '@/utils/api.js'

// 2. 修改handleLogin函数
const handleLogin = async () => {
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
  
  try {
    // 调用API登录
    const { userId } = await API.login(formData.email)
    
    // 存储用户信息
    uni.setStorageSync('starId', userId)
    uni.setStorageSync('userEmail', formData.email)
    
    // 跳转到场景页面
    uni.redirectTo({ url: '/pages/gallery/index' })
  } catch (error) {
    console.error('登录错误:', error)
    errorMsg.value = error.message || '登录失败，请重试'
    setTimeout(() => errorMsg.value = '', 3000)
  }
}

// 3. 同样方式修改注册页面
// 将 src/pages/register/index.vue 中的handleRegister函数替换为：

const handleRegister = async () => {
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
  
  try {
    // 调用API注册
    const { userId } = await API.login(formData.email)
    
    // 存储用户信息
    uni.setStorageSync('starId', userId)
    uni.setStorageSync('userEmail', formData.email)
    
    // 跳转到场景页面
    uni.redirectTo({ url: '/pages/gallery/index' })
  } catch (error) {
    console.error('注册错误:', error)
    errorMsg.value = error.message || '注册失败，请重试'
    setTimeout(() => errorMsg.value = '', 3000)
  }
}