# 🚀 Noah Box - 精品资源下载站

一个现代化、美观的下载站系统，基于 React + Hono.js 构建，支持 Cloudflare Workers 部署。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange)](https://workers.cloudflare.com)
[![GitHub Stars](https://img.shields.io/github/stars/Noah0932/NoahBox?style=social)](https://github.com/Noah0932/NoahBox)

## ✨ 特性

- 🎨 **现代化UI设计** - 支持浅色/深色主题切换，响应式设计
- ⚡ **边缘计算加速** - 基于 Cloudflare Workers 的全球边缘部署
- 🔐 **安全的管理后台** - 基于会话的身份验证，支持密码修改
- 📊 **实时统计** - 下载次数、分类统计等数据展示
- 🔍 **智能搜索** - 支持实时搜索和分类筛选
- 🌐 **一键部署** - 简化的部署流程，快速上线

## 🛠️ 技术栈

### 前端
- **框架**: React 18
- **构建**: esbuild (超快构建)
- **样式**: CSS Variables + 主题系统
- **图标**: Bootstrap Icons
- **字体**: Inter (Google Fonts)

### 后端
- **平台**: Cloudflare Workers
- **框架**: Hono.js (轻量级 Web 框架)
- **数据库**: Cloudflare D1 (SQLite)
- **认证**: Session-based 会话管理

## 🚀 快速开始

### 一键部署 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/Noah0932/NoahBox.git
cd NoahBox

# 2. 安装依赖
npm install

# 3. 配置 Cloudflare
npx wrangler login

# 4. 创建 D1 数据库
npx wrangler d1 create download-station-db

# 5. 更新 wrangler.toml 中的数据库 ID

# 6. 构建并部署
npm run build
npm run deploy
```

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 或者使用本地 HTTP 服务器预览
python -m http.server 8081 --directory public
```

访问 `http://localhost:8081` 查看应用。

## 📁 项目结构

```
NoahBox/
├── public/                 # 静态文件
│   ├── index.html         # 首页
│   ├── admin.html         # 管理后台
│   ├── downloads.html     # 下载页面
│   ├── login.html         # 登录页面
│   ├── change-password.html # 修改密码页面
│   └── *.js, *.css        # 构建后的资源文件
├── src/
│   ├── frontend/          # React 组件
│   │   ├── home.jsx       # 首页组件
│   │   ├── admin.jsx      # 管理后台组件
│   │   ├── downloads.jsx  # 下载页面组件
│   │   └── components/    # 共用组件
│   └── backend/           # 后端 API
│       └── index.js       # Hono.js 应用
├── package.json           # 项目配置
├── wrangler.toml         # Cloudflare Workers 配置
└── README.md             # 项目说明
```

## ⚙️ 配置说明

### 环境配置

编辑 `wrangler.toml` 文件：

```toml
name = "download-station"
main = "src/backend/index.js"
compatibility_date = "2023-01-01"

[site]
bucket = "./public"

[[d1_databases]]
binding = "DB"
database_name = "download_station_db"
database_id = "your-database-id-here"  # 替换为实际的数据库 ID
```

### 管理员账户

默认管理员账户：
- **用户名**: `admin`
- **密码**: `admin123`

⚠️ **安全提醒**: 部署后请立即修改默认密码！

## 🔧 功能说明

### 用户功能
- 📱 **响应式首页** - 展示平台信息和热门资源
- 🔍 **资源浏览** - 支持分类筛选和实时搜索
- ⬇️ **文件下载** - 一键下载，自动统计下载次数
- 🌓 **主题切换** - 浅色/深色/系统主题

### 管理功能
- 🔐 **安全登录** - 会话管理，自动过期保护
- 📝 **文件管理** - 添加、编辑、删除下载文件
- 📊 **数据统计** - 查看下载统计和分类信息
- 🔑 **密码修改** - 支持在线修改管理员密码

## 📚 API 文档

### 认证接口

```bash
# 管理员登录
POST /api/login
{
  "username": "admin",
  "password": "admin123"
}

# 修改密码
POST /api/change-password
Headers: X-Session-ID: <session-id>
{
  "currentPassword": "admin123",
  "newPassword": "new-password"
}
```

### 文件管理接口

```bash
# 获取文件列表
GET /api/files

# 添加文件 (需要认证)
POST /api/files
Headers: X-Session-ID: <session-id>
{
  "name": "文件名",
  "description": "文件描述",
  "url": "下载链接",
  "category": "分类",
  "size": 1024000,
  "type": "pdf"
}
```

详细 API 文档请查看 [API.md](API.md)

## 🚀 部署指南

### Cloudflare Workers 部署

1. **准备工作**
   - 注册 [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
   - 安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

2. **配置数据库**
   ```bash
   # 创建 D1 数据库
   npx wrangler d1 create download-station-db
   
   # 更新 wrangler.toml 中的数据库 ID
   ```

3. **部署应用**
   ```bash
   npm run build
   npm run deploy
   ```

4. **初始化数据库**
   ```bash
   # 访问初始化接口
   curl https://your-worker.workers.dev/api/init
   ```

详细部署说明请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

## 🔒 安全最佳实践

1. **修改默认密码** - 部署后立即修改管理员密码
2. **定期备份数据** - 使用 `wrangler d1 export` 备份数据库
3. **监控访问日志** - 通过 Cloudflare Dashboard 监控异常访问
4. **启用安全功能** - 配置 Cloudflare 的 WAF 和 DDoS 防护

## 🛠️ 开发指南

### 构建命令

```bash
# 构建所有组件
npm run build

# 单独构建前端组件
npm run build:home      # 首页
npm run build:downloads # 下载页面
npm run build:admin     # 管理后台

# 构建后端
npm run build:backend
```

### 代码规范

```bash
# 代码检查
npm run lint

# 代码格式化
npm run format

# 运行测试
npm test
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

详细贡献指南请查看 [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Cloudflare Workers](https://workers.cloudflare.com/) - 边缘计算平台
- [React](https://reactjs.org/) - 用户界面库
- [Hono.js](https://hono.dev/) - 轻量级 Web 框架
- [Bootstrap Icons](https://icons.getbootstrap.com/) - 图标库
- [Inter Font](https://rsms.me/inter/) - 现代化字体

## 📞 支持

如有问题或建议：

- 🐛 [提交 Bug](https://github.com/Noah0932/NoahBox/issues)
- 💡 [功能建议](https://github.com/Noah0932/NoahBox/discussions)
- 📖 [查看文档](https://github.com/Noah0932/NoahBox/wiki)

---

⭐ 如果这个项目对你有帮助，请给我们一个 Star！

**Made with ❤️ by Noah**