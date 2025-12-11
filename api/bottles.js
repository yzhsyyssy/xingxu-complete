// 星语瓶API - 最简单的Vercel函数格式
export default function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // GET请求 - 获取星语瓶列表
  if (req.method === 'GET') {
    const mockBottles = [
      {
        id: '1',
        content: '今晚的星星很亮，看着它们，突然明白了很多事。',
        userId: '294731',
        date: '2025.04.03 20:45',
        comments: [],
        favorited: false
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      bottles: mockBottles 
    });
  }
  
  // 其他方法不被支持
  return res.status(405).json({ error: 'Method not allowed' });
}