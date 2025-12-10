# 星叙项目：从纯前端到桌面应用完整指南

## 目录
1. [准备阶段：环境安装](#准备阶段)
2. [第一步：重组项目结构](#第一步)
3. [第二步：创建GitHub仓库](#第二步)
4. [第三步：创建后端API](#第三步)
5. [第四步：创建Vercel账户并部署API](#第四步)
6. [第五步：配置GitHub自动部署](#第五步)
7. [第六步：修改前端代码使用API](#第六步)
8. [第七步：添加Electron支持](#第七步)
9. [第八步：构建和测试应用](#第八步)
10. [第九步：创建安装包](#第九步)

---

## 准备阶段：环境安装 {#准备阶段}

在开始之前，请确保您的电脑上已安装以下软件：

1. **Node.js** (推荐18.x或更高版本)
   - 访问 [https://nodejs.org](https://nodejs.org) 下载并安装
   - 安装后，打开命令提示符/CMD/PowerShell，输入 `node -v` 检查版本

2. **Git**
   - 访问 [https://git-scm.com/download/win](https://git-scm.com/download/win) 下载并安装
   - 安装后，打开命令提示符，输入 `git --version` 检查版本

3. **代码编辑器**
   - 推荐使用 [Visual Studio Code](https://code.visualstudio.com/download)

4. **GitHub账户**
   - 访问 [https://github.com](https://github.com) 注册并登录

---

## 第一步：重组项目结构 {#第一步}

我们需要将当前项目重组为前端+后端的分离结构。

### 1.1 创建新目录结构

1. 打开命令提示符(CMD)
2. 导航到您当前项目所在的目录：
   ```bash
   cd "C:\Users\23259\Desktop\迷\0305"
   ```
3. 创建新的项目目录结构：
   ```bash
   mkdir xingxu-complete
   cd xingxu-complete
   mkdir frontend
   mkdir api
   mkdir api\functions
   mkdir api\data
   mkdir .github
   mkdir .github\workflows
   ```

### 1.2 复制现有项目到frontend目录

1. 将当前uni-preset-vue-vite目录中的所有文件和文件夹复制到新创建的frontend目录中
2. 您可以通过文件资源管理器手动复制，或使用以下命令：
   ```bash
   xcopy /E /I "..\uni-preset-vue-vite\*" frontend\
   ```

### 1.3 验证项目结构

现在您的 `xingxu-complete` 目录结构应该如下：

```
xingxu-complete/
├── frontend/            # 包含您的原始uni-app代码
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── api/
│   └── functions/       # 后端函数（稍后创建）
├── .github/workflows/   # GitHub Actions（稍后创建）
```

---

## 第二步：创建GitHub仓库 {#第二步}

### 2.1 在GitHub上创建新仓库

1. 登录您的GitHub账户
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: `xingxu-complete`
   - Description: `星叙小程序 - 基于星空主题的社交应用`
   - 选择 Public (公开仓库)
   - 不要勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 2.2 配置Git并提交代码

1. 在命令提示符中，确保您在 `xingxu-complete` 目录中
2. 初始化Git仓库：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete
   git init
   git config user.name "您的姓名"
   git config user.email "您的邮箱"
   ```
3. 添加所有文件并提交：
   ```bash
   git add .
   git commit -m "初始提交：星叙项目前端代码"
   ```
4. 连接到GitHub仓库：
   ```bash
   git remote add origin https://github.com/您的用户名/xingxu-complete.git
   git branch -M main
   git push -u origin main
   ```
   - 您可能需要输入GitHub用户名和密码

---

## 第三步：创建后端API {#第三步}

### 3.1 创建API配置文件

1. 在命令提示符中，确保您在 `xingxu-complete` 目录中
2. 创建API的package.json文件：
   ```bash
   cd api
   echo {"name": "xingxu-api","version": "1.0.0","scripts": {"dev": "vercel dev","build": "vercel build"},"dependencies": {"@vercel/node": "^2.0.0"}} > package.json
   ```

### 3.2 创建Vercel配置文件

创建 `api/vercel.json` 文件，内容如下：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "functions/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/functions/$1.js"
    }
  ],
  "functions": {
    "functions/*.js": {
      "maxDuration": 10
    }
  }
}
```

您可以使用文本编辑器创建此文件，或者在命令提示符中输入：
```bash
echo {"version": 2,"builds": [{"src": "functions/*.js","use": "@vercel/node"}],"routes": [{"src": "/api/(.*)","dest": "/functions/$1.js"}],"functions": {"functions/*.js": {"maxDuration": 10}}} > vercel.json
```

### 3.3 创建API函数

在 `api/functions` 目录中创建以下文件：

#### 1. auth.js - 用户认证API
在命令提示符中：
```bash
cd functions
```

创建 `auth.js` 文件：
```javascript
export default async function handler(req, res) {
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
```

#### 2. bottles.js - 星语瓶API

创建 `bottles.js` 文件：
```javascript
// 星语瓶API
export default async function handler(req, res) {
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
```

#### 3. scenes.js - 场景API

创建 `scenes.js` 文件：
```javascript
// 场景API
export default async function handler(req, res) {
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
```

### 3.4 提交API代码

1. 在命令提示符中：
   ```bash
   cd ..\
   cd ..\
   git add .
   git commit -m "添加后端API函数"
   git push origin main
   ```

---

## 第四步：创建Vercel账户并部署API {#第四步}

### 4.1 创建Vercel账户

1. 访问 [https://vercel.com](https://vercel.com)
2. 点击 "Sign Up"，选择使用GitHub账户登录
3. 授权Vercel访问您的GitHub账户

### 4.2 安装Vercel CLI

在命令提示符中：
```bash
npm install -g vercel
```

### 4.3 部署API到Vercel

1. 在命令提示符中，确保您在 `xingxu-complete/api` 目录中：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete\api
   ```
2. 登录Vercel：
   ```bash
   vercel login
   ```
   - 选择 GitHub 作为登录方式
   - 按照提示完成登录

3. 部署API：
   ```bash
   vercel
   ```
   - 按提示设置项目名称（可以使用默认的）
   - 选择链接到现有目录（默认）
   - 部署完成后，Vercel会显示一个URL，例如：https://xingxu-api-xxxx.vercel.app
   - **记下这个URL**，我们稍后需要用到

### 4.4 测试API

1. 打开浏览器
2. 访问 `https://您的API地址/api/scenes`（替换为您实际的Vercel URL）
3. 您应该看到场景数据的JSON响应

---

## 第五步：配置GitHub自动部署 {#第五步}

### 5.1 获取Vercel项目ID和令牌

1. 在命令提示符中：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete\api
   ```
2. 获取项目ID：
   ```bash
   vercel projects ls
   ```
   - 找到您的项目，记下项目ID

3. 创建Vercel令牌：
   - 访问 [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
   - 点击 "Create Token"
   - 输入令牌名称（如：GitHub Actions）
   - 复制生成的令牌（**仅显示一次**，请妥善保存）

### 5.2 在GitHub中设置Secrets

1. 访问您的GitHub仓库页面
2. 点击 Settings 标签
3. 在左侧菜单中，点击 Secrets > Actions
4. 点击 "New repository secret"
5. 添加以下secrets：

   **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: 您刚创建的Vercel令牌

   **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: 您的Vercel组织ID（可以在项目设置中找到）

   **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: 您的项目ID（从步骤5.1获取）

### 5.3 创建GitHub Actions工作流

1. 在 `xingxu-complete` 项目中创建 `.github/workflows` 目录（如果还没有的话）
2. 创建 `.github/workflows/deploy-api.yml` 文件：
```yaml
name: Deploy API to Vercel

on:
  push:
    branches: [ main ]
    paths: [ 'api/**' ]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: api/package-lock.json

    - name: Install Vercel CLI
      run: npm install --global vercel@latest

    - name: Pull Vercel Environment
      run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      working-directory: api

    - name: Build Project
      run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      working-directory: api

    - name: Deploy Project
      run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      working-directory: api
```

3. 提交工作流文件：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete
   git add .
   git commit -m "添加GitHub Actions工作流"
   git push origin main
   ```

### 5.4 测试自动部署

1. 访问GitHub仓库的Actions标签页
2. 您应该看到一个正在运行或已完成的工作流
3. 如果工作流成功，您的API将自动更新到Vercel

---

## 第六步：修改前端代码使用API {#第六步}

现在我们需要修改前端代码，使其使用我们刚刚创建的API。

### 6.1 创建API工具类

1. 在 `frontend/src/utils` 目录中创建 `api.js` 文件：
```javascript
// API请求工具类
const API_BASE_URL = 'https://您的API地址'  // 替换为您实际的Vercel URL

export default {
  // 用户认证
  async login(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '登录失败')
      }
      
      return data
    } catch (error) {
      console.error('登录API错误:', error)
      throw error
    }
  },

  // 获取场景列表
  async getScenes() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scenes`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取场景失败')
      }
      
      return data
    } catch (error) {
      console.error('获取场景API错误:', error)
      throw error
    }
  },

  // 获取星语瓶
  async getBottles() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bottles`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '获取星语瓶失败')
      }
      
      return data
    } catch (error) {
      console.error('获取星语瓶API错误:', error)
      throw error
    }
  },

  // 发送星语瓶
  async sendBottle(content, userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bottles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, userId })
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || '发送星语瓶失败')
      }
      
      return data
    } catch (error) {
      console.error('发送星语瓶API错误:', error)
      throw error
    }
  }
}
```

**重要**: 请记得将 `API_BASE_URL` 替换为您实际的Vercel URL。

### 6.2 修改登录页面

1. 打开 `frontend/src/pages/login/index.vue`
2. 导入API工具：
   ```javascript
   import API from '@/utils/api.js'
   ```
3. 修改 `handleLogin` 函数：
```javascript
const handleLogin = async () => {
  if (!formData.email || !formData.password) {
    errorMsg.value = '请填写完整信息'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  if (!isValidEmail(formData.email)) {
    errorMsg.value = '请输入有效邮箱'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  try {
    // 调用API登录
    const { userId } = await API.login(formData.email)
    
    // 存储用户信息
    uni.setStorageSync('starId', userId)
    uni.setStorageSync('userEmail', formData.email)
    
    // 跳转到场景页面
    uni.redirectTo({ url: '/pages/gallery/index' })
  } catch (error) {
    console.error('登录错误:', error)
    errorMsg.value = error.message || '登录失败，请重试'
    setTimeout(() => errorMsg.value = '', 3000)
  }
}
```

### 6.3 修改注册页面

1. 打开 `frontend/src/pages/register/index.vue`
2. 导入API工具（如尚未导入）：
   ```javascript
   import API from '@/utils/api.js'
   ```
3. 修改 `handleRegister` 函数：
```javascript
const handleRegister = async () => {
  if (!formData.email || !formData.password) {
    errorMsg.value = '请填写完整信息'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  if (!isValidEmail(formData.email)) {
    errorMsg.value = '请输入有效邮箱'
    setTimeout(() => errorMsg.value = '', 2000)
    return
  }
  
  try {
    // 调用API注册
    const { userId } = await API.login(formData.email)
    
    // 存储用户信息
    uni.setStorageSync('starId', userId)
    uni.setStorageSync('userEmail', formData.email)
    
    // 跳转到场景页面
    uni.redirectTo({ url: '/pages/gallery/index' })
  } catch (error) {
    console.error('注册错误:', error)
    errorMsg.value = error.message || '注册失败，请重试'
    setTimeout(() => errorMsg.value = '', 3000)
  }
}
```

### 6.4 修改画廊页面加载场景

1. 打开 `frontend/src/pages/gallery/index.vue`
2. 导入API工具：
   ```javascript
   import API from '@/utils/api.js'
   ```
3. 在 `onMounted` 函数中，添加加载场景的代码：
```javascript
// 加载场景数据
const loadScenes = async () => {
  try {
    const { scenes } = await API.getScenes()
    scenes.value = scenes
  } catch (error) {
    console.error('加载场景失败:', error)
    // 如果API失败，使用默认场景数据
    // (保持原有的场景数据作为备用)
  }
}

// 在onMounted中调用
onMounted(() => {
  // 现有的代码...
  
  // 添加场景加载
  loadScenes()
})
```

### 6.5 修改星语瓶页面

1. 打开 `frontend/src/pages/bottle/index.vue`
2. 导入API工具：
   ```javascript
   import API from '@/utils/api.js'
   ```
3. 修改 `loadBottles` 函数：
```javascript
const loadBottles = async () => {
  try {
    const { bottles } = await API.getBottles()
    bottles.value = bottles
    
    // 确保每个星语瓶都有comments数组和favorited属性
    bottles.value.forEach(bottle => {
      if (!bottle.comments) {
        bottle.comments = []
      }
      if (bottle.favorited === undefined) {
        bottle.favorited = false
      }
    })
    
    // 应用收藏状态
    applyFavoriteStatus()
  } catch (error) {
    console.error('加载星语瓶失败:', error)
    
    // 加载本地缓存的星语瓶作为备用
    const savedBottles = uni.getStorageSync('bottles')
    if (savedBottles) {
      try {
        bottles.value = JSON.parse(savedBottles)
      } catch (e) {
        bottles.value = []
      }
    } else {
      // 使用示例数据
      bottles.value = [
        // ...原有的示例数据
      ]
      saveBottlesToStorage()
    }
  }
}
```

4. 修改 `sendBottle` 函数：
```javascript
const sendBottle = async () => {
  const raw = newBottleContent.value.trim()
  if (!raw) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }

  const { clean, flagged } = sanitizeText(raw)
  const userInfo = uni.getStorageSync('starId')

  try {
    // 调用API发送星语瓶
    const { bottle } = await API.sendBottle(clean, userInfo)
    
    // 添加到星语瓶列表
    bottles.value.unshift(bottle)
    saveBottlesToStorage()

    if (flagged) {
      uni.showToast({ title: '已为你净化不当内容', icon: 'none' })
    }
    
    // 关闭弹窗
    showSendModal.value = false
    
    // 提示成功
    showToastMessage('你的星语瓶已飞向星空，静待回音')
  } catch (error) {
    console.error('发送星语瓶错误:', error)
    showToastMessage('发送失败，请稍后重试')
    
    // 如果API失败，保存到本地
    const newBottle = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-CN').replace(/\//g, '.') + ' ' + new Date().toTimeString().slice(0, 5),
      content: clean,
      senderId: userInfo,
      expanded: false,
      favorited: false,
      comments: []
    }
    
    bottles.value.unshift(newBottle)
    saveBottlesToStorage()
    
    showSendModal.value = false
    showToastMessage('你的星语瓶已保存到本地')
  }
}
```

### 6.6 提交更改

```bash
cd C:\Users\23259\Desktop\迷\0305\xingxu-complete
git add .
git commit -m "修改前端代码使用API"
git push origin main
```

---

## 第七步：添加Electron支持 {#第七步}

现在我们将添加Electron支持，使应用可以在桌面运行。

### 7.1 安装Electron依赖

1. 在命令提示符中，确保您在 `frontend` 目录中：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete\frontend
   ```
2. 安装Electron和相关依赖：
   ```bash
   npm install electron electron-builder concurrently wait-on --save-dev
   ```

### 7.2 创建Electron主进程文件

1. 在项目根目录 (`xingxu-complete`) 创建 `electron-main.js` 文件：
```javascript
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

// 保持对窗口对象的全局引用
let mainWindow

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    },
    icon: path.join(__dirname, 'assets/icon.png'), // 应用图标
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  })

  // 加载应用
  if (isDev) {
    // 开发环境加载本地服务器
    mainWindow.loadURL('http://localhost:5173')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境加载打包后的文件
    mainWindow.loadFile(path.join(__dirname, 'frontend/dist/index.html'))
  }

  // 当窗口准备好时显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 开发环境下不聚焦，因为会打开DevTools
    if (!isDev) {
      mainWindow.focus()
    }
  })

  // 当窗口被关闭时发出
  mainWindow.on('closed', () => {
    // 取消引用window对象
    mainWindow = null
  })

  // 处理窗口创建
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // 创建菜单
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { label: '撤销', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: '重做', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: '强制重新加载', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
        { label: '开发者工具', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '实际大小', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
        { label: '放大', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
        { label: '缩小', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { label: '最小化', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: '关闭', accelerator: 'CmdOrCtrl+W', role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于星叙',
          click: async () => {
            await dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于星叙',
              message: '星叙',
              detail: '一个基于星空主题的社交应用\n版本 1.0.0\n\n每一颗星，都有故事'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
app.whenReady().then(createWindow)

// 当所有窗口关闭时退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用程序及其菜单栏通常保持活动状态，直到用户使用Cmd + Q明确退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建窗口
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// 处理应用退出前的清理工作
app.on('before-quit', () => {
  // 在这里可以执行清理工作
})

// 处理证书错误（开发环境）
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    // 在开发环境中忽略证书错误
    event.preventDefault()
    callback(true)
  } else {
    // 在生产环境中使用默认行为
    callback(false)
  }
})
```

### 7.3 创建应用图标（可选）

1. 创建一个 `assets` 文件夹
2. 添加一个 `icon.png` 文件作为应用图标（256x256像素）
3. 在Windows上，您可能需要将PNG转换为ICO格式

### 7.4 更新前端的package.json

1. 打开 `frontend/package.json`
2. 添加或更新以下内容：
```json
{
  "name": "xingxu-frontend",
  "main": "../electron-main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron ../electron-main.js",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron ../electron-main.js\"",
    "electron:build": "npm run build && electron-builder"
  },
  "build": {
    "appId": "com.xingxu.app",
    "productName": "星叙",
    "directories": {
      "output": "../dist-electron"
    },
    "files": [
      "dist/**/*"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        }
      ],
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### 7.5 提交更改

```bash
cd C:\Users\23259\Desktop\迷\0305\xingxu-complete
git add .
git commit -m "添加Electron支持"
git push origin main
```

---

## 第八步：构建和测试应用 {#第八步}

### 8.1 测试开发环境

1. 在命令提示符中，确保您在 `frontend` 目录中：
   ```bash
   cd C:\Users\23259\Desktop\迷\0305\xingxu-complete\frontend
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发环境：
   ```bash
   npm run electron:dev
   ```
4. 这将同时启动Vite开发服务器和Electron窗口
5. 您应该看到一个桌面窗口显示您的应用程序

### 8.2 修复可能的问题

如果遇到以下问题，请按照建议修复：

**问题1：CORS错误**
- 确保API函数正确设置了CORS头
- 检查API_BASE_URL是否正确

**问题2：登录失败**
- 检查API是否部署正确
- 查看浏览器控制台的错误信息

**问题3：页面路由错误**
- 确保uni-app的路由配置正确
- 检查页面文件是否存在

### 8.3 构建生产版本

1. 在 `frontend` 目录中运行：
   ```bash
   npm run build
   ```
2. 这将构建生产版本到 `frontend/dist` 目录
3. 测试Electron能否正常加载生产版本：
   ```bash
   npm run electron
   ```
   - 这将只启动Electron应用，加载已构建的生产版本

---

## 第九步：创建安装包 {#第九步}

### 9.1 准备应用图标（Windows）

1. 准备一个256x256像素的PNG图标
2. 使用在线工具（如 [https://convertico.com](https://convertico.com)）将PNG转换为ICO格式
3. 将图标文件命名为 `icon.ico` 并放在 `frontend/assets` 目录中

### 9.2 构建安装包

1. 在 `frontend` 目录中运行：
   ```bash
   npm run electron:build
   ```
2. 这将创建Windows安装包在 `../dist-electron` 目录中

### 9.3 测试安装包

1. 导航到 `dist-electron` 目录
2. 找到 `.exe` 安装程序
3. 双击运行并按照提示安装应用
4. 从开始菜单启动应用，测试一切是否正常工作

### 9.4 分发应用

现在您有了一个可分发的.exe安装包：
- 您可以将此文件分享给他人
- 用户可以双击安装应用程序
- 安装后，应用将出现在开始菜单和桌面（如果在安装过程中选择了创建桌面快捷方式）

---

## 恭喜！您已经完成了所有步骤！

您现在拥有一个完整的星叙应用：
1. 前端使用uni-app和Vue.js
2. 后端使用Vercel无服务器函数
3. 代码托管在GitHub上
4. 通过GitHub Actions自动部署
5. 可以作为桌面应用程序分发

### 下一步可能的改进

1. **添加真实数据库**：
   - 考虑使用Supabase、PlanetScale或其他云数据库
   - 替换当前的模拟数据

2. **增强用户认证**：
   - 添加密码存储和验证
   - 实现用户注册和登录流程

3. **添加更多功能**：
   - 实现实时聊天功能
   - 添加用户个人资料管理
   - 添加更多主题场景

4. **改进UI/UX**：
   - 添加更多动画效果
   - 优化响应式设计
   - 添加用户反馈机制

如果您在实施过程中遇到任何问题，可以查阅相关文档或寻求社区帮助。祝您的星叙项目取得成功！