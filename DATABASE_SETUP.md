# 🗄️ 数据库连接配置指南

本文档详细说明如何为 Download Station 配置不同平台的数据库连接。

## 🚀 快速选择

| 平台组合 | 优势 | 适用场景 | 费用 |
|---------|------|----------|------|
| **Cloudflare Workers + D1** | 免费额度大、无服务器、全球分布 | 个人项目、小型应用 | 免费 → 低成本 |
| **EdgeOne + 腾讯云 MySQL** | 国内访问快、功能丰富 | 国内用户为主 | 中等成本 |
| **阿里云 ESA + RDS** | 企业级可靠性、生态完整 | 企业应用 | 中高成本 |

## 📋 方案一：Cloudflare Workers + D1 (推荐新手)

### 特点
- ✅ 完全免费开始 (100万请求/月)
- ✅ 无需管理服务器
- ✅ 全球边缘分布
- ✅ 自动备份和扩展
- ❌ 功能相对简单 (SQLite)

### 配置步骤

1. **安装 Wrangler CLI**
```bash
npm install -g wrangler
wrangler login
```

2. **创建 D1 数据库**
```bash
wrangler d1 create download-station-db
```

3. **记录数据库信息**
```bash
# 输出示例:
✅ Successfully created DB 'download-station-db'

[[d1_databases]]
binding = "DB"
database_name = "download-station-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

4. **更新配置文件**
编辑 `backend/cloudflare/wrangler.toml`:
```toml
name = "download-station-api"
main = "src/index.js"
compatibility_date = "2023-08-01"

[vars]
CORS_ORIGIN = "https://your-frontend-domain.com"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-password"

[[d1_databases]]
binding = "DB"
database_name = "download-station-db"
database_id = "your-actual-database-id"  # 替换为步骤3的实际ID
```

5. **部署和初始化**
```bash
cd backend/cloudflare
npm install
wrangler deploy

# 初始化数据库表和示例数据
curl https://your-worker.your-subdomain.workers.dev/api/init
```

### 数据库管理

```bash
# 查看数据库列表
wrangler d1 list

# 执行 SQL 查询
wrangler d1 execute download-station-db --command "SELECT * FROM files"

# 导出数据备份
wrangler d1 export download-station-db --output backup.sql

# 导入数据
wrangler d1 execute download-station-db --file backup.sql
```

## 📋 方案二：EdgeOne + 腾讯云 MySQL

### 特点
- ✅ 国内访问速度快
- ✅ 功能丰富 (完整 MySQL)
- ✅ 腾讯云生态集成
- ❌ 需要付费数据库实例
- ❌ 需要管理数据库

### 配置步骤

1. **创建腾讯云 MySQL 实例**
   - 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
   - 进入云数据库 MySQL
   - 创建实例 (建议选择最小规格开始)

2. **配置数据库**
```sql
-- 连接到 MySQL 实例
mysql -h your-mysql-host.tencentcdb.com -u root -p

-- 创建数据库
CREATE DATABASE download_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用用户
CREATE USER 'download_user'@'%' IDENTIFIED BY 'SecurePassword123!';
GRANT ALL PRIVILEGES ON download_station.* TO 'download_user'@'%';
FLUSH PRIVILEGES;

-- 使用数据库
USE download_station;

-- 创建表结构
CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '文件名称',
  description TEXT COMMENT '文件描述',
  url VARCHAR(500) NOT NULL COMMENT '下载链接',
  category VARCHAR(100) COMMENT '文件分类',
  size BIGINT COMMENT '文件大小(字节)',
  type VARCHAR(50) COMMENT '文件类型',
  downloads INT DEFAULT 0 COMMENT '下载次数',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文件信息表';

-- 插入示例数据
INSERT INTO files (name, description, url, category, size, type) VALUES
('示例PDF文档', '这是一个示例PDF文件，用于测试下载功能', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf'),
('示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg'),
('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe');
```

3. **配置 EdgeOne 边缘函数**

创建 `backend/edgeone/package.json`:
```json
{
  "name": "download-station-edgeone",
  "version": "1.0.0",
  "dependencies": {
    "mysql2": "^3.6.0"
  }
}
```

4. **设置环境变量**
在 EdgeOne 控制台配置:
```bash
DB_TYPE=mysql
DB_HOST=cdb-xxxxxxxx.tencentcdb.com
DB_PORT=3306
DB_USERNAME=download_user
DB_PASSWORD=SecurePassword123!
DB_DATABASE=download_station
DB_SSL=true
CORS_ORIGIN=https://your-frontend-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

5. **部署边缘函数**
   - 将代码打包上传到 EdgeOne 控制台
   - 配置触发规则: `/api/*`
   - 测试函数是否正常工作

## 📋 方案三：阿里云 ESA + RDS MySQL

### 特点
- ✅ 企业级可靠性
- ✅ 阿里云完整生态
- ✅ 丰富的监控和管理工具
- ❌ 成本相对较高
- ❌ 配置相对复杂

### 配置步骤

1. **创建 RDS MySQL 实例**
   - 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
   - 进入 RDS 云数据库
   - 创建 MySQL 实例

2. **配置网络和安全**
```bash
# 在 RDS 控制台配置:
# 1. 白名单: 添加 ESA 边缘节点 IP
# 2. 数据库账号: 创建应用专用账号
# 3. SSL: 启用 SSL 连接
```

3. **初始化数据库**
```sql
-- 创建数据库
CREATE DATABASE download_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'download_user'@'%' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON download_station.* TO 'download_user'@'%';
FLUSH PRIVILEGES;

-- 创建表结构 (同方案二)
```

4. **配置 ESA 边缘函数**

创建 `backend/aliyun-esa/function.config.json`:
```json
{
  "name": "download-station-api",
  "runtime": "nodejs18",
  "handler": "index.handler",
  "timeout": 30,
  "memorySize": 128,
  "environment": {
    "DB_HOST": "rm-xxxxxxxx.mysql.rds.aliyuncs.com",
    "DB_PORT": "3306",
    "DB_USERNAME": "download_user",
    "DB_PASSWORD": "YourSecurePassword123!",
    "DB_DATABASE": "download_station",
    "DB_SSL": "true",
    "CORS_ORIGIN": "https://your-frontend-domain.com"
  }
}
```

5. **部署函数**
   - 打包代码上传到 ESA 控制台
   - 配置 HTTP 触发器
   - 测试函数连接

## 🔧 连接测试

### 测试数据库连接

创建测试脚本 `test-db.js`:
```javascript
// Cloudflare D1 测试
async function testD1(env) {
  try {
    const result = await env.DB.prepare('SELECT 1 as test').first();
    console.log('D1 连接成功:', result);
  } catch (error) {
    console.error('D1 连接失败:', error);
  }
}

// MySQL 测试
async function testMySQL() {
  const mysql = require('mysql2/promise');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE
    });
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('MySQL 连接成功:', rows);
    await connection.end();
  } catch (error) {
    console.error('MySQL 连接失败:', error);
  }
}
```

### API 测试

```bash
# 测试文件列表接口
curl https://your-api-domain.com/api/files

# 测试数据库初始化
curl https://your-api-domain.com/api/init

# 测试分类接口
curl https://your-api-domain.com/api/categories
```

## 🚨 常见问题

### 1. 连接超时
```javascript
// 增加连接超时配置
const config = {
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000
};
```

### 2. SSL 连接问题
```javascript
// 禁用 SSL 证书验证 (仅开发环境)
const sslConfig = {
  ssl: {
    rejectUnauthorized: false
  }
};
```

### 3. 字符编码问题
```sql
-- 确保数据库和表使用 utf8mb4
ALTER DATABASE download_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE files CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 💡 最佳实践

### 1. 连接池配置
```javascript
const poolConfig = {
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  reconnect: true
};
```

### 2. 错误处理
```javascript
async function executeWithRetry(query, params, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await db.execute(query, params);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

### 3. 监控和日志
```javascript
// 记录慢查询
const startTime = Date.now();
const result = await db.query(sql);
const duration = Date.now() - startTime;

if (duration > 1000) {
  console.warn(`Slow query (${duration}ms):`, sql);
}
```

---

选择适合你的方案，按照对应的配置步骤操作即可！如有问题，请查看各平台的详细 README 文档。