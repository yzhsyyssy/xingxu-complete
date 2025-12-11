// 场景API
module.exports = async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const { method } = req

  if (method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (method === 'GET') {
    try {
      // 返回场景数据
      const scenes = [
        {
          id: 1,
          title: '深夜电台',
          description: '在宁静的深夜，与陌生人分享心事',
          users: Math.floor(Math.random() * 20) + 5, // 随机在线人数
          gradient: 'linear-gradient(180deg, #1E2B3E 0%, #0F1724 100%)'
        },
        {
          id: 2,
          title: '雨中漫步',
          description: '雨声伴随着脚步，一起走进回忆',
          users: Math.floor(Math.random() * 20) + 5,
          gradient: 'linear-gradient(180deg, #2A3B4C 0%, #1A2B3C 100%)'
        },
        {
          id: 3,
          title: '星空独白',
          description: '仰望星空，倾听内心最真实的声音',
          users: Math.floor(Math.random() * 20) + 5,
          gradient: 'linear-gradient(180deg, #2E2E4A 0%, #1E1E3A 100%)'
        }
      ]
      
      return res.json({ 
        success: true, 
        scenes 
      })
    } catch (error) {
      console.error('获取场景错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}