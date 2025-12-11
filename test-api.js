// 简单的测试API - 直接放在根目录
export default async function handler(req, res) {
  return res.json({ 
    message: "API工作正常!",
    timestamp: new Date().toISOString()
  });
}