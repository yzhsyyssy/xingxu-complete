// 简单测试函数 - 用于验证Vercel部署
export default function handler(req, res) {
  res.status(200).json({ 
    message: "API工作正常!",
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}