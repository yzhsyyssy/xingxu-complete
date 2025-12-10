# 星叙项目部署指南

## 前置准备

1. **创建GitHub仓库**
   - 访问 [github.com](https://github.com) 并登录
   - 创建新仓库，命名为 `xingxu`（或您喜欢的名称）
   - 勾选 "Public"（公开仓库）

2. **安装Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **创建Vercel账户**
   - 访问 [vercel.com](https://vercel.com)
   - 使用GitHub账户登录
   - 连接您的GitHub仓库

## 部署步骤

### 第一步：推送代码到GitHub

```bash
# 初始化Git仓库
git init
git add .
git commit -m "初始提交：星叙项目"

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/yourusername/xingxu.git
git branch -M main
git push -u origin main
```

### 第二步：部署API到Vercel

1. **本地测试API**
   ```bash
   cd api
   npm install
   npm run dev
   ```
   这将在本地启动API服务器，您可以通过 `http://localhost:3000/api/auth` 等地址测试

2. **连接到Vercel项目**
   ```bash
   cd api
   vercel link
   ```
   按提示选择项目或创建新项目

3. **部署到生产环境**
   ```bash
   vercel --prod
   ```

4. **获取必要的环境变量**
   ```bash
   vercel env ls
   ```
   记录 `VERCEL_ORG_ID` 和 `VERCEL_PROJECT_ID`

### 第三步：配置GitHub Secrets

1. **获取Vercel Token**
   - 登录 Vercel 控制台
   - 进入 Settings > Tokens
   - 创建新令牌

2. **在GitHub仓库添加Secrets**
   - 进入GitHub仓库 > Settings > Secrets > Actions
   - 添加以下secrets：
     - `VERCEL_TOKEN`: 您的Vercel令牌
     - `VERCEL_ORG_ID`: Vercel组织ID
     - `VERCEL_PROJECT_ID`: Vercel项目ID

### 第四步：测试自动部署

1. **推送代码更改**
   ```bash
   # 修改任何API文件
   git add .
   git commit -m "更新API"
   git push origin main
   ```

2. **检查部署状态**
   - 进入GitHub仓库的Actions标签页
   - 查看部署工作流状态

## 构建桌面应用

1. **安装Electron**
   ```bash
   cd frontend
   npm install electron electron-builder --save-dev
   ```

2. **创建Electron配置文件**
   - 在项目根目录创建 `electron-main.js`（见下文）

3. **构建exe文件**
   ```bash
   cd frontend
   npm run electron:build
   ```

## 注意事项

1. **API地址更新**
   - 部署后，记得更新 `src/utils/api.js` 中的 `API_BASE_URL`
   - 替换为您的Vercel实际地址，如 `https://your-project.vercel.app`

2. **环境变量管理**
   - 不要在代码中硬编码敏感信息
   - 使用Vercel的环境变量管理功能

3. **数据库选择**
   - 当前使用模拟数据，实际项目建议使用 Supabase 或 PlanetScale
   - 两者都有免费额度且与Vercel集成良好

4. **前端构建**
   - 前端代码可以部署到 Vercel 或 Netlify
   - 建议与API使用不同的项目，便于独立管理

## 故障排除

### API部署失败
- 检查 `api/vercel.json` 配置
- 确认所有函数文件语法正确
- 查看Vercel部署日志

### GitHub Actions失败
- 检查secrets是否正确设置
- 确认工作流文件语法正确
- 查看Actions日志中的错误信息

### 构建exe失败
- 确认所有依赖已正确安装
- 检查Electron配置文件
- 查看构建日志中的错误信息