# Noah Box - EdgeOne Pages 部署指南

## 📋 部署概述

Noah Box 项目支持前后端分离部署：
- **前端**: 部署到 EdgeOne Pages (静态页面)
- **后端**: 部署到 Cloudflare Workers (API服务)

## 🚀 EdgeOne Pages 前端部署

### 1. 准备工作

确保您已经：
- 注册腾讯云账号
- 开通 EdgeOne 服务
- 准备好域名并完成备案

### 2. 构建前端资源

```bash
# 安装依赖
npm install

# 构建所有前端组件
npm run build:all

# 或者分别构建
npm run build:home
npm run build:downloads
npm run build:admin
```

### 3. 部署到 EdgeOne Pages

#### 方式一：通过 Git 仓库部署

1. 将代码推送到 Git 仓库（GitHub/GitLab/Gitee）
2. 在 EdgeOne 控制台创建新的 Pages 项目
3. 连接您的 Git 仓库
4. 配置构建设置：
   - **构建命令**: `npm run build:all`
   - **输出目录**: `public`
   - **Node.js 版本**: 18.x

#### 方式二：手动上传部署

1. 运行 `npm run build:all` 构建项目
2. 将 `public` 目录下的所有文件打包
3. 在 EdgeOne Pages 控制台手动上传

### 4. 配置路由规则

在 EdgeOne Pages 控制台配置以下路由规则：

```
/ → /index.html
/downloads → /downloads.html
/admin → /admin.html
/login → /login.html
/change-password → /change-password.html
```

### 5. 配置自定义域名

1. 在 EdgeOne Pages 控制台添加自定义域名
2. 配置 DNS 解析指向 EdgeOne Pages
3. 启用 HTTPS（自动申请 SSL 证书）

## 🔧 后端 API 配置

### 1. 部署 Cloudflare Workers

```bash
# 部署到 Cloudflare Workers
npm run deploy
```

### 2. 配置 API 端点

在前端代码中更新 API 基础 URL：

```javascript
// 在各个前端组件中更新
const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev';
```

### 3. 跨域配置

确保 Cloudflare Workers 后端支持跨域请求：

```javascript
// 在后端代码中添加 CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://your-domain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
};
```

## 📁 项目结构

```
noah-box/
├── public/                 # 前端静态文件 (部署到 EdgeOne Pages)
│   ├── index.html         # 主页
│   ├── downloads.html     # 下载页面
│   ├── admin.html         # 管理后台
│   ├── login.html         # 登录页面
│   ├── *.css             # 样式文件
│   └── *-bundle.js       # 打包后的 JS 文件
├── src/
│   ├── frontend/          # React 组件源码
│   └── backend/           # Cloudflare Workers 后端
├── wrangler.toml          # Cloudflare Workers 配置
└── package.json           # 项目配置
```

## 🌐 访问地址

部署完成后，您可以通过以下地址访问：

- **主页**: https://your-domain.com/
- **下载中心**: https://your-domain.com/downloads
- **管理后台**: https://your-domain.com/admin
- **登录页面**: https://your-domain.com/login

## 📝 备案信息

项目已包含备案号：**皖ICP备-2025092209号**

备案信息显示在页面底部，符合中国大陆网站备案要求。

## 🔒 安全配置

EdgeOne Pages 自动提供：
- HTTPS 加密
- DDoS 防护
- WAF 防护
- 全球 CDN 加速

## 📊 性能优化

- 所有静态资源通过 EdgeOne CDN 分发
- 自动压缩 CSS/JS 文件
- 图片优化和 WebP 转换
- 智能缓存策略

## 🛠️ 故障排除

### 常见问题

1. **路由 404 错误**
   - 检查路由规则配置
   - 确保 HTML 文件存在于 public 目录

2. **API 请求失败**
   - 检查 CORS 配置
   - 确认 API 端点 URL 正确

3. **样式加载失败**
   - 检查 CSS 文件路径
   - 确认文件已正确上传

## 📞 技术支持

如需技术支持，请联系：
- EdgeOne Pages 官方文档
- Cloudflare Workers 文档
- 项目 GitHub Issues

---

**Noah Box** - 现代化的资源下载站解决方案