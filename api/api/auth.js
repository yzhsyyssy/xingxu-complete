// 用户认证API - Vercel Serverless Function
module.exports = async function(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 只处理POST请求
  if (req.method === 'POST') {
    try {
      const body = JSON.parse(req.body)
      const { email } = body
      
      // 简单验证邮箱
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' })
      }
      
      // 生成星号ID
      const userId = 'HD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      
      // 返回生成的ID
      return res.status(200).json({ 
        success: true, 
        userId,
        message: '登录成功'
      })
    } catch (error) {
      console.error('认证错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  // 其他方法不被支持
  return res.status(405).json({ error: 'Method not allowed' })
}