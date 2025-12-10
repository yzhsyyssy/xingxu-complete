// 这个脚本帮助重组项目结构
const fs = require('fs')
const path = require('path')

// 创建新的目录结构
const dirs = [
  'frontend',       // 移动当前src目录到这里
  'api/functions',  // 后端API函数
  'api/data',       // 临时数据存储
  '.github/workflows', // GitHub Actions
  'docs'            // 项目文档
]

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`创建目录: ${dir}`)
  }
})

// 提示手动移动文件
console.log(`
请手动完成以下操作：

1. 将当前项目中的以下文件/文件夹移动到 frontend/ 目录:
   - src/
   - package.json
   - vite.config.js
   - index.html
   - .gitignore
   - 其他前端相关文件

2. 在 frontend/ 目录创建新的 package.json:
{
  "name": "xingxu-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron:dev": "concurrently \\"npm run dev\\" \\"wait-on http://localhost:5173 && electron ../electron-main.js\\"",
    "electron:build": "npm run build && electron-builder"
  }
}

3. 在 api/ 目录创建 package.json:
{
  "name": "xingxu-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "vercel dev",
    "build": "vercel build"
  },
  "dependencies": {
    "@vercel/node": "^2.0.0"
  }
}
`)