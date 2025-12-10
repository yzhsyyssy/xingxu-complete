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