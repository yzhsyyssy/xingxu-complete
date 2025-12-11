// 用户认证API
module.exports = async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const { method } = req

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (method === 'POST') {
    try {
      const { email } = req.body
      
      // 简单验证邮箱
      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' })
      }
      
      // 生成星号ID
      const userId = 'HD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      
      // 实际项目中这里应该保存到数据库
      // 现在只是返回生成的ID
      return res.json({ 
        success: true, 
        userId,
        message: '登录成功'
      })
    } catch (error) {
      console.error('认证错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}