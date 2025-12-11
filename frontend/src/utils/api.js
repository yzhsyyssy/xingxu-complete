// API配置
const API_CONFIG = {
  // 开发环境使用本地API
  development: {
    baseURL: 'http://localhost:3000'
  },
  // 生产环境使用Vercel部署的API
  production: {
    baseURL: 'https://xingxu-complete-g0nfjk2b5-yzhsyys-projects.vercel.app' // 已更新为您的实际API地址
  }
}

// 获取当前环境的API配置
const getAPIConfig = () => {
  // 在实际部署中，可能需要通过环境变量或其他方式判断环境
  // 这里暂时使用生产环境配置
  return API_CONFIG.production
}

// API请求封装
class API {
  constructor() {
    this.config = getAPIConfig()
  }

  // 通用请求方法
  async request(endpoint, options = {}) {
    const url = `${this.config.baseURL}${endpoint}`
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }
      
      return data
    } catch (error) {
      console.error('API请求错误:', error)
      throw error
    }
  }

  // 获取星语瓶列表
  async getBottles() {
    return this.request('/api/bottles')
  }

  // 发送星语瓶
  async sendBottle(content, userId) {
    return this.request('/api/bottles', {
      method: 'POST',
      body: JSON.stringify({ content, userId })
    })
  }

  // 用户认证
  async authenticate(email) {
    return this.request('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }

  // 获取场景列表
  async getScenes() {
    return this.request('/api/scenes')
  }

  // 获取场景详情
  async getScene(id) {
    return this.request(`/api/scenes/${id}`)
  }
}

// 创建API实例
const api = new API()

export default api