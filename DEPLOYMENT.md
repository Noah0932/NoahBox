anan🚀 部署指南

本文档详细说明如何将 Download Station 部署到 Cloudflare Workers。

## 📋 前置要求

- [Node.js](https://nodejs.org/) 16.0.0 或更高版本
- [npm](https://www.npmjs.com/) 8.0.0 或更高版本
- [Cloudflare 账户](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

## 🛠️ 本地开发环境设置

### 1. 克隆项目

```bash
git clone https://github.com/your-username/download-station.git
cd download-station
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Wrangler

```bash
# 登录 Cloudflare 账户
npx wrangler login

# 验证登录状态
npx wrangler whoami
```

### 4. 创建 D1 数据库

```bash
# 创建数据库
npx wrangler d1 create download-station-db

# 记录返回的数据库 ID
```

### 5. 更新配置文件

编辑 `wrangler.toml` 文件，更新数据库配置：

```toml
name = "download-station"
main = "src/backend/index.js"
compatibility_date = "2023-08-01"

[[d1_databases]]
binding = "DB"
database_name = "download-station-db"
database_id = "your-database-id-here"  # 替换为实际的数据库 ID

[vars]
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-password"  # 设置安全的管理员密码
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:8787` 查看应用。

## 🌐 生产环境部署

### 方法一：使用 Wrangler CLI

1. **构建项目**
```bash
npm run build
```

2. **部署到 Cloudflare Workers**
```bash
npm run deploy
```

3. **初始化数据库**
访问 `https://your-worker.your-subdomain.workers.dev/api/init` 初始化数据库。

### 方法二：使用 GitHub Actions (推荐)

1. **Fork 项目到你的 GitHub 账户**

2. **设置 GitHub Secrets**

在 GitHub 项目设置中添加以下 Secrets：

- `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID

获取方式：
- API Token: Cloudflare Dashboard → My Profile → API Tokens → Create Token
- Account ID: Cloudflare Dashboard → 右侧边栏

3. **推送代码触发部署**
```bash
git push origin main
```

GitHub Actions 将自动构建和部署项目。

### 方法三：一键部署按钮

点击下面的按钮进行一键部署：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/download-station)

## ⚙️ 环境配置

### 环境变量

在 `wrangler.toml` 中配置以下变量：

```toml
[vars]
# 管理员账户配置
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-password"

# 应用配置
APP_NAME = "Download Station"
APP_DESCRIPTION = "现代化的文件下载站"

# 安全配置
SESSION_TIMEOUT = "86400"  # 会话超时时间（秒）
```

### 数据库配置

```toml
[[d1_databases]]
binding = "DB"
database_name = "download-station-db"
database_id = "your-database-id"
```

## 🔧 高级配置

### 自定义域名

1. **在 Cloudflare Dashboard 中添加域名**

2. **配置 DNS 记录**
```
Type: CNAME
Name: download (或其他子域名)
Target: your-worker.your-subdomain.workers.dev
```

3. **在 wrangler.toml 中配置路由**
```toml
routes = [
  { pattern = "download.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

4. **重新部署**
```bash
npm run deploy
```

### SSL/TLS 配置

Cloudflare Workers 自动提供 SSL/TLS 加密，无需额外配置。

### 缓存配置

在 `src/backend/index.js` 中配置缓存策略：

```javascript
// 静态资源缓存
app.get('/public/*', serveStatic({ 
  root: './',
  headers: {
    'Cache-Control': 'public, max-age=31536000'
  }
}));
```

## 📊 监控和日志

### 查看部署状态

```bash
# 查看部署列表
npx wrangler deployments list

# 查看特定部署
npx wrangler deployment view <deployment-id>
```

### 实时日志

```bash
# 查看实时日志
npx wrangler tail

# 过滤日志
npx wrangler tail --format pretty
```

### 性能监控

在 Cloudflare Dashboard 中查看：
- 请求数量和响应时间
- 错误率和状态码分布
- 地理分布和缓存命中率

## 🔒 安全最佳实践

### 1. 密码安全
- 使用强密码作为管理员密码
- 定期更换密码
- 考虑使用环境变量存储敏感信息

### 2. 访问控制
- 限制管理后台访问 IP（如果需要）
- 启用 Cloudflare 的安全功能

### 3. 数据备份
```bash
# 导出数据库
npx wrangler d1 export download-station-db --output backup.sql

# 导入数据库
npx wrangler d1 execute download-station-db --file backup.sql
```

## 🚨 故障排除

### 常见问题

1. **部署失败**
   - 检查 wrangler.toml 配置
   - 验证 Cloudflare 账户权限
   - 查看错误日志

2. **数据库连接失败**
   - 确认数据库 ID 正确
   - 检查数据库是否已创建
   - 验证绑定名称

3. **认证问题**
   - 检查管理员密码配置
   - 清除浏览器缓存
   - 查看网络请求日志

### 获取帮助

- 查看 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- 提交 [GitHub Issue](https://github.com/your-username/download-station/issues)
- 参与 [GitHub Discussions](https://github.com/your-username/download-station/discussions)

## 📈 性能优化

### 1. 代码优化
- 使用代码分割减少包大小
- 启用 gzip 压缩
- 优化图片和静态资源

### 2. 缓存策略
- 配置适当的缓存头
- 使用 Cloudflare CDN
- 实施边缘缓存

### 3. 数据库优化
- 添加适当的索引
- 优化查询语句
- 定期清理无用数据

---

🎉 恭喜！你已成功部署 Download Station。如有问题，请查看文档或提交 Issue。