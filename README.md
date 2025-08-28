# 🚀 Download Station

一个现代化、美观的下载站系统，支持前后端分离部署。前端使用 EdgeOne Pages，后端支持 Cloudflare Workers、EdgeOne 边缘函数或阿里云 ESA 边缘函数。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy Frontend](https://img.shields.io/badge/Deploy-EdgeOne%20Pages-blue)](https://console.cloud.tencent.com/edgeone)
[![Deploy Backend](https://img.shields.io/badge/Deploy-Edge%20Functions-green)](https://workers.cloudflare.com)

## ✨ 特性

- 🎨 **现代化UI设计** - 支持浅色/深色主题切换，响应式设计
- ⚡ **边缘计算加速** - 前端 EdgeOne Pages，后端多平台边缘函数
- 🔐 **安全的管理后台** - 基于会话的身份验证
- 📊 **实时统计** - 下载次数、分类统计等
- 🔍 **智能搜索** - 支持实时搜索和分类筛选
- 🌐 **多平台部署** - 支持 Cloudflare、EdgeOne、阿里云 ESA

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + React Router
- **构建**: Vite 4
- **样式**: CSS Variables + 主题系统
- **部署**: EdgeOne Pages / Vercel / Netlify

### 后端
- **平台**: Cloudflare Workers / EdgeOne 边缘函数 / 阿里云 ESA
- **框架**: Hono.js (轻量级 Web 框架)
- **数据库**: Cloudflare D1 / MySQL / PostgreSQL
- **认证**: Session-based

## 🚀 快速部署

### 一键部署 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/your-username/download-station.git
cd download-station

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 部署到 Cloudflare (推荐)
npm run deploy:cloudflare
```

### 手动部署

#### 前端部署 (EdgeOne Pages)

```bash
# 构建前端
cd frontend
npm install && npm run build

# 上传 dist/ 目录到 EdgeOne Pages 控制台
```

#### 后端部署 (选择一种)

**Cloudflare Workers (推荐)**
```bash
cd backend/cloudflare
npm install
npx wrangler login
npx wrangler deploy
```

**EdgeOne 边缘函数**
```bash
cd backend/edgeone
# 在 EdgeOne 控制台上传代码
```

**阿里云 ESA**
```bash
cd backend/aliyun-esa
# 在阿里云控制台创建边缘函数
```

## ⚙️ 配置

### 环境变量

**前端配置** (`frontend/.env`)
```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
```

**后端配置** (根据平台设置)
```bash
CORS_ORIGIN=https://your-frontend-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

### 数据库配置

**Cloudflare D1 (推荐)**
```bash
# 创建数据库
wrangler d1 create download-station-db

# 初始化表结构
curl https://your-worker.workers.dev/api/init
```

**MySQL/PostgreSQL**
```sql
CREATE DATABASE download_station;
-- 详细配置见 DATABASE_SETUP.md
```

## 📚 文档

- [API 文档](API.md) - 详细的 API 接口说明
- [部署指南](DEPLOYMENT.md) - 完整的部署教程
- [贡献指南](CONTRIBUTING.md) - 如何参与项目开发
- [更新日志](CHANGELOG.md) - 版本更新记录

## 🔧 本地开发

```bash
# 启动前端开发服务器
cd frontend && npm run dev

# 启动后端开发服务器
cd backend/cloudflare && npm run dev
```

## 🤝 贡献

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [EdgeOne Pages](https://cloud.tencent.com/product/edgeone) - 前端静态部署
- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [React](https://reactjs.org/) - 用户界面库
- [Vite](https://vitejs.dev/) - 快速构建工具
- [Hono.js](https://hono.dev/) - 轻量级 Web 框架

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！