// 星语瓶API
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
      // 实际项目中这里应该从数据库查询
      // 现在返回模拟数据
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
        },
        {
          id: '2',
          content: '深夜里听着钢琴曲，窗外下着小雨。突然很想念一个人，却不敢联系。把这份思念放进星语瓶，希望能漂到你的星球。',
          userId: '783421',
          date: '2025.04.01 23:30',
          comments: [],
          favorited: false
        },
        {
          id: '3',
          content: '今天读了一本很喜欢的书，里面有一句话："我们都是宇宙里的尘埃，却各自闪着微光。"感觉说到了心里，分享给同样孤独又闪亮的你。',
          userId: '456829',
          date: '2025.03.27 22:15',
          comments: [],
          favorited: false
        }
      ]
      
      return res.json({ 
        success: true, 
        bottles: mockBottles 
      })
    } catch (error) {
      console.error('获取星语瓶错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  if (method === 'POST') {
    try {
      const { content, userId } = req.body
      
      if (!content || !userId) {
        return res.status(400).json({ error: 'Missing content or userId' })
      }
      
      // 实际项目中这里应该保存到数据库
      // 现在只是返回新创建的星语瓶
      const newBottle = {
        id: Date.now().toString(),
        content,
        userId,
        date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.') + ' ' + new Date().toTimeString().slice(0, 5),
        comments: [],
        favorited: false
      }
      
      return res.status(201).json({ 
        success: true, 
        bottle: newBottle,
        message: '星语瓶已发送' 
      })
    } catch (error) {
      console.error('发送星语瓶错误:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}