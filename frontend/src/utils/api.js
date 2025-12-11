// API请求工具类
// 在实际项目中，您需要将API_BASE_URL替换为您的Vercel部署地址

// 开发环境使用本地地址，生产环境使用线上地址
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000'  // 本地开发时可以使用vercel dev
  : 'https://your-api-name.vercel.app'  // 替换为您的Vercel实际地址

export default {
  // 用户认证
  async login(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '登录失败')
      }
      
      return data
    } catch (error) {
      console.error('登录API错误:', error)
      throw error
    }
  },

  // 获取场景列表
  async getScenes() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取场景失败')
      }
      
      return data
    } catch (error) {
      console.error('获取场景API错误:', error)
      throw error
    }
  },

  // 获取星语瓶
  async getBottles() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bottles`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取星语瓶失败')
      }
      
      return data
    } catch (error) {
      console.error('获取星语瓶API错误:', error)
      throw error
    }
  },

  // 发送星语瓶
  async sendBottle(content, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bottles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '发送星语瓶失败')
      }
      
      return data
    } catch (error) {
      console.error('发送星语瓶API错误:', error)
      throw error
    }
  }
}