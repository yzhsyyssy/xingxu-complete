// 星语瓶API - Vercel Serverless Function
module.exports = async function(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // GET请求 - 获取星语瓶列表
  if (req.method === 'GET') {
    try {
      // 模拟数据
      const mockBottles = [
        {
          id: '1',
          content: '今晚的星星很亮，看着它们，突然明白了很多事。原来所有的相遇和错过，都是宇宙安排的必然。希望你也能看到同样的星空，感受这份宁静。',
          userId: '294731',
          date: '2025.04.03 20:45',
          comments: [
            {
              id: '1',
              content: '我也看到了，真的很美。今晚的星空格外清澈。',
              userId: '567812',
              date: '04.03 21:30'
            }
          ],
          favorited: false
        }
      ]
      
      return res.status(200).json({ 
        success: true, 
        bottles: mockBottles 
      })
    } catch (error) {
      console.error('获取星语瓶错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  // 其他方法不被支持
  return res.status(405).json({ error: 'Method not allowed' })
}