// 这是一个占位符脚本，用于创建一个简单的PNG图标
// 在实际项目中，您应该使用真正的PNG图标文件

const fs = require('fs')
const path = require('path')

// 简单的SVG图标
const svgIcon = `<svg width="256" height="256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#1E1E1E" rx="20"/>
  <circle cx="128" cy="128" r="60" fill="#4A3B5E" opacity="0.8"/>
  <circle cx="128" cy="128" r="40" fill="#2E2E4A" opacity="0.6"/>
  <text x="128" y="135" font-family="Arial" font-size="24" fill="#ffffff" text-anchor="middle">星叙</text>
</svg>`

// 写入SVG文件
fs.writeFileSync(path.join(__dirname, 'icon.svg'), svgIcon)
console.log('创建了简单的SVG图标占位符')

// 注意：在实际构建时，您需要将SVG转换为PNG格式
// 可以使用在线转换工具或使用Sharp库进行转换