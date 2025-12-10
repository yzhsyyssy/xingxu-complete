# GitHub 后端实现指南

## 方案一：GitHub Pages + GitHub Actions + Vercel/Netlify Functions

### 步骤 1: 仓库结构重组

```
xingxu/
├── frontend/          # 您现有的uni-app代码
├── api/              # 后端API代码
│   ├── functions/    # 无服务器函数
│   │   ├── auth.js
│   │   ├── messages.js
│   │   └── bottles.js
│   └── package.json
├── .github/          # GitHub Actions 工作流
│   └── workflows/
│       ├── deploy.yml
│       └── api-deploy.yml
├── docs/             # 项目文档
└── README.md
```

### 步骤 2: 创建API函数

#### api/functions/auth.js
```javascript
// 用户认证相关API
module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const { method } = req

  if (method === 'POST') {
    // 用户注册/登录
    const { email } = req.body
    const userId = 'HD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    
    // 这里使用简单的JSON文件模拟数据库
    // 实际项目中应使用真实数据库
    return res.json({ success: true, userId })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
```

#### api/functions/bottles.js
```javascript
// 星语瓶相关API
const fs = require('fs')
const path = require('path')

// 模拟数据库
const dataPath = path.join(__dirname, '../../data/bottles.json')
const ensureDataFile = () => {
  if (!fs.existsSync(path.dirname(dataPath))) {
    fs.mkdirSync(path.dirname(dataPath), { recursive: true })
  }
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([]))
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  const { method } = req

  if (method === 'GET') {
    // 获取星语瓶列表
    ensureDataFile()
    const bottles = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    return res.json({ success: true, bottles })
  }
  
  if (method === 'POST') {
    // 创建新星语瓶
    const { content, userId } = req.body
    ensureDataFile()
    
    const bottles = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    const newBottle = {
      id: Date.now(),
      content,
      userId,
      date: new Date().toISOString(),
      comments: []
    }
    
    bottles.push(newBottle)
    fs.writeFileSync(dataPath, JSON.stringify(bottles))
    
    return res.json({ success: true, bottle: newBottle })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
```

### 步骤 3: GitHub Actions 工作流

#### .github/workflows/api-deploy.yml
```yaml
name: Deploy API to Vercel

on:
  push:
    branches: [ main ]
    paths: [ 'api/**' ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: api/package-lock.json
    
    - name: Install dependencies
      run: |
        cd api
        npm install
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        working-directory: ./api
```

### 步骤 4: 修改前端API调用

#### 创建 api.js 工具文件
```javascript
// src/utils/api.js
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : 'https://your-api.vercel.app'

export default {
  // 用户登录
  async login(email) {
    const response = await fetch(`${API_BASE_URL}/api/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return await response.json()
  },
  
  // 获取星语瓶
  async getBottles() {
    const response = await fetch(`${API_BASE_URL}/api/bottles`)
    return await response.json()
  },
  
  // 发送星语瓶
  async sendBottle(content, userId) {
    const response = await fetch(`${API_BASE_URL}/api/bottles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, userId })
    })
    return await response.json()
  }
}
```

### 步骤 5: 集成到现有页面

#### 修改 bottle/index.vue 中的数据加载
```javascript
import API from '@/utils/api'

// 替换原来的本地存储逻辑
const loadBottles = async () => {
  try {
    const { success, bottles } = await API.getBottles()
    if (success) {
      bottles.value = bottles
    }
  } catch (e) {
    console.error('加载星语瓶失败', e)
    // 加载本地缓存的星语瓶作为备用
    const savedBottles = uni.getStorageSync('bottles')
    if (savedBottles) {
      bottles.value = JSON.parse(savedBottles)
    }
  }
}

const sendBottle = async () => {
  const raw = newBottleContent.value.trim()
  if (!raw) return

  const { clean, flagged } = sanitizeText(raw)
  const userInfo = uni.getStorageSync('starId')
  
  try {
    const { success, bottle } = await API.sendBottle(clean, userInfo)
    if (success) {
      bottles.value.unshift(bottle)
      newBottleContent.value = ''
      showToastMessage('你的星语瓶已飞向星空，静待回音')
    }
  } catch (e) {
    console.error('发送失败', e)
    showToastMessage('发送失败，请稍后重试')
  }

  if (flagged) {
    uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
  }
}
```

## 方案二：GitHub + GitHub Codespaces + 容器化API

使用GitHub Codespaces运行后端服务，适合需要持续运行的API。

### 1. 创建Dockerfile

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY api/package*.json ./
RUN npm ci --only=production

COPY api/ .

EXPOSE 3000

CMD [ "node", "server.js" ]
```

### 2. 创建Docker Compose

#### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  # 可以添加数据库服务
  # mongodb:
  #   image: mongo:latest
  #   volumes:
  #     - mongodb_data:/data/db
  #   restart: unless-stopped
```

### 3. GitHub Codespaces 配置

#### .devcontainer/devcontainer.json
```json
{
  "name": "星叙后端",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "api",
  "workspaceFolder": "/app",
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}
```

## 方案三：GitHub + Supabase（推荐）

Supabase是Firebase的开源替代品，与GitHub集成良好。

### 1. 创建Supabase项目

1. 访问 [supabase.com](https://supabase.com)
2. 使用GitHub账号登录
3. 创建新项目
4. 获取API密钥

### 2. 初始化数据库

#### supabase/migrations/001_initial_schema.sql
```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 星语瓶表
CREATE TABLE bottles (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 星语瓶评论
CREATE TABLE bottle_comments (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  bottle_id BIGINT REFERENCES bottles(id),
  user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户收藏
CREATE TABLE user_favorites (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  bottle_id BIGINT REFERENCES bottles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bottle_id)
);

-- 创建索引
CREATE INDEX idx_bottles_user_id ON bottles(user_id);
CREATE INDEX idx_bottle_comments_bottle_id ON bottle_comments(bottle_id);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
```

### 3. 创建Supabase客户端

#### src/utils/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// API封装
export default {
  // 用户相关
  async signIn(email) {
    const userId = 'HD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: userId, email })
      .select()
    
    if (error) throw error
    return { userId: data[0].id }
  },
  
  // 星语瓶相关
  async getBottles() {
    const { data, error } = await supabase
      .from('bottles')
      .select(`
        *,
        users(id),
        bottle_comments(
          *,
          users(id)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  async createBottle(content, userId) {
    const { data, error } = await supabase
      .from('bottles')
      .insert({ content, user_id: userId })
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  async addComment(bottleId, content, userId) {
    const { data, error } = await supabase
      .from('bottle_comments')
      .insert({ bottle_id: bottleId, content, user_id: userId })
      .select()
    
    if (error) throw error
    return data[0]
  }
}
```

## 推荐实施步骤

1. **初期**：使用方案一（Vercel Functions）快速实现API
2. **中期**：根据用户量增长，迁移到Supabase（方案三）
3. **长期**：如果需要自定义功能，考虑自建服务器（方案二）

## 集成到Electron应用

修改 `electron-main.js`，添加API支持：

```javascript
const { app, BrowserWindow, ipcMain } = require('electron')
const API_URL = 'https://your-api.vercel.app'

// 处理前端API请求
ipcMain.handle('api-request', async (event, options) => {
  try {
    const { method, endpoint, data } = options
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    return await response.json()
  } catch (error) {
    return { error: error.message }
  }
})

// 在渲染进程中使用
// const { ipcRenderer } = require('electron')
// const result = await ipcRenderer.invoke('api-request', { 
//   method: 'POST', 
//   endpoint: '/api/auth', 
//   data: { email } 
// })
```

这样，您就可以使用GitHub免费资源构建完整的后端服务，并将整个应用打包成桌面exe软件。