# Cloudflare Workers + D1 数据库部署指南

## 📋 前置要求

- Cloudflare 账户
- Wrangler CLI 工具
- Node.js 16+

## 🚀 快速部署

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
# 或者使用 npx
npx wrangler --version
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create download-station-db

# 输出示例:
# ✅ Successfully created DB 'download-station-db'
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "download-station-db"  
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4. 更新 wrangler.toml 配置

将上面输出的数据库配置复制到 `wrangler.toml` 文件中：

```toml
name = "download-station-api"
main = "src/index.js"
compatibility_date = "2023-08-01"

# 环境变量
[vars]
CORS_ORIGIN = "https://your-frontend-domain.com"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-password"

# D1 数据库配置
[[d1_databases]]
binding = "DB"
database_name = "download-station-db"
database_id = "your-actual-database-id-here"  # 替换为实际的数据库 ID
```

### 5. 本地开发

```bash
# 安装依赖
npm install

# 启动本地开发服务器
npm run dev
# 或
wrangler dev
```

### 6. 初始化数据库

访问 `http://localhost:8787/api/init` 或部署后访问 `https://your-worker.your-subdomain.workers.dev/api/init`

### 7. 部署到生产环境

```bash
# 构建和部署
npm run deploy
# 或
wrangler deploy
```

## 🔧 数据库管理

### 查看数据库信息

```bash
# 列出所有数据库
wrangler d1 list

# 查看数据库详情
wrangler d1 info download-station-db
```

### 执行 SQL 命令

```bash
# 交互式 SQL 控制台
wrangler d1 execute download-station-db --command "SELECT * FROM files"

# 执行 SQL 文件
wrangler d1 execute download-station-db --file schema.sql
```

### 数据备份和恢复

```bash
# 导出数据
wrangler d1 export download-station-db --output backup.sql

# 导入数据
wrangler d1 execute download-station-db --file backup.sql
```

## 📊 监控和日志

### 查看实时日志

```bash
# 查看 Worker 日志
wrangler tail

# 过滤日志
wrangler tail --format pretty
```

### 查看部署状态

```bash
# 查看部署历史
wrangler deployments list

# 查看特定部署
wrangler deployment view <deployment-id>
```

## 🔒 安全配置

### 环境变量管理

```bash
# 设置生产环境变量
wrangler secret put ADMIN_PASSWORD
# 输入密码后回车

# 列出所有 secrets
wrangler secret list

# 删除 secret
wrangler secret delete ADMIN_PASSWORD
```

### 自定义域名

在 `wrangler.toml` 中添加：

```toml
# 自定义域名路由
routes = [
  { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

然后重新部署：

```bash
wrangler deploy
```

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 `database_id` 是否正确
   - 确认数据库绑定名称为 `DB`

2. **部署失败**
   - 检查 `wrangler.toml` 配置
   - 确认已登录 Cloudflare 账户

3. **CORS 错误**
   - 更新 `CORS_ORIGIN` 环境变量
   - 检查前端域名配置

### 调试技巧

```bash
# 本地调试
wrangler dev --local

# 查看详细错误信息
wrangler tail --format json
```

## 📈 性能优化

### 数据库索引

```sql
-- 为常用查询添加索引
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_created_at ON files(created_at);
```

### 缓存策略

在 Worker 中添加缓存：

```javascript
// 缓存文件列表 5 分钟
const cache = caches.default;
const cacheKey = new Request(url, request);
const cachedResponse = await cache.match(cacheKey);

if (cachedResponse) {
  return cachedResponse;
}

// 处理请求...
const response = new Response(data);
response.headers.set('Cache-Control', 'max-age=300');
await cache.put(cacheKey, response.clone());
return response;
```

## 💰 费用说明

Cloudflare Workers 和 D1 的免费额度：

- **Workers**: 100,000 请求/天
- **D1**: 5GB 存储，25M 行读取/天，50K 行写入/天

超出免费额度后按使用量计费，费用很低。