# EdgeOne 边缘函数 + 数据库部署指南

## 📋 前置要求

- 腾讯云账户
- EdgeOne 服务开通
- 云数据库实例 (MySQL/PostgreSQL)

## 🗄️ 数据库配置

### 方案一：腾讯云 MySQL

1. **创建 MySQL 实例**
   - 登录 [腾讯云控制台](https://console.cloud.tencent.com/)
   - 进入云数据库 MySQL
   - 创建实例，选择合适的配置

2. **配置数据库**
```sql
-- 创建数据库
CREATE DATABASE download_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'download_user'@'%' IDENTIFIED BY 'your-secure-password';
GRANT ALL PRIVILEGES ON download_station.* TO 'download_user'@'%';
FLUSH PRIVILEGES;

-- 创建表结构
USE download_station;

CREATE TABLE files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  size BIGINT,
  type VARCHAR(50),
  downloads INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO files (name, description, url, category, size, type) VALUES
('示例PDF文档', '这是一个示例PDF文件，用于测试下载功能', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf'),
('示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg'),
('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe');
```

### 方案二：腾讯云 PostgreSQL

```sql
-- 创建数据库
CREATE DATABASE download_station;

-- 连接到数据库
\c download_station;

-- 创建表结构
CREATE TABLE files (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  size BIGINT,
  type VARCHAR(50),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入示例数据
INSERT INTO files (name, description, url, category, size, type) VALUES
('示例PDF文档', '这是一个示例PDF文件，用于测试下载功能', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf'),
('示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg'),
('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe');
```

## 🚀 EdgeOne 边缘函数部署

### 1. 准备函数代码

创建 `package.json`:

```json
{
  "name": "download-station-edgeone",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "mysql2": "^3.6.0"
  }
}
```

### 2. 环境变量配置

在 EdgeOne 控制台配置以下环境变量：

```bash
# 数据库配置
DB_TYPE=mysql
DB_HOST=your-mysql-host.tencentcdb.com
DB_PORT=3306
DB_USERNAME=download_user
DB_PASSWORD=your-secure-password
DB_DATABASE=download_station
DB_SSL=true

# 应用配置
CORS_ORIGIN=https://your-frontend-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

### 3. 函数代码示例

```javascript
// index.js
import { createDatabase } from '../shared/database.js';
import { Hono } from 'hono';

const app = new Hono();

// 中间件：数据库连接
app.use('*', async (c, next) => {
  c.set('db', createDatabase(c.env));
  await next();
});

// API 路由
app.get('/api/files', async (c) => {
  const db = c.get('db');
  const { results } = await db.query('SELECT * FROM files ORDER BY created_at DESC');
  return c.json(results);
});

// 导出处理函数
export default {
  async fetch(request, env, ctx) {
    return app.fetch(request, env, ctx);
  }
};
```

### 4. 部署步骤

1. **登录 EdgeOne 控制台**
   - 访问 [EdgeOne 控制台](https://console.cloud.tencent.com/edgeone)

2. **创建边缘函数**
   - 选择站点 → 边缘函数
   - 点击"新建函数"
   - 函数名称：`download-station-api`

3. **上传代码**
   - 将代码打包为 ZIP 文件
   - 上传到控制台
   - 或使用在线编辑器

4. **配置触发器**
   - 触发条件：路径匹配 `/api/*`
   - 执行函数：`download-station-api`

5. **配置环境变量**
   - 在函数设置中添加上述环境变量

## 🔧 数据库连接配置

### MySQL 连接示例

```javascript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return { results: rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

### PostgreSQL 连接示例

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query(sql, params = []) {
  try {
    const result = await pool.query(sql, params);
    return { results: result.rows };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
```

## 📊 监控和调试

### 查看函数日志

1. 在 EdgeOne 控制台进入边缘函数
2. 选择对应函数
3. 查看"运行日志"标签

### 性能监控

- 请求次数统计
- 响应时间分析
- 错误率监控
- 资源使用情况

## 🔒 安全配置

### 数据库安全

1. **网络安全**
   - 配置安全组，只允许 EdgeOne 访问
   - 使用 SSL 连接

2. **访问控制**
   - 创建专用数据库用户
   - 最小权限原则

3. **密码安全**
   - 使用强密码
   - 定期更换密码

### 函数安全

1. **环境变量**
   - 敏感信息使用环境变量
   - 不在代码中硬编码密码

2. **CORS 配置**
   - 限制允许的域名
   - 配置适当的 CORS 头

## 💰 费用说明

### EdgeOne 边缘函数

- 免费额度：100万次请求/月
- 超出后按请求次数计费

### 云数据库

- MySQL：按实例规格和存储计费
- PostgreSQL：按实例规格和存储计费
- 建议选择按量计费，根据实际使用调整

## 🚨 故障排除

### 常见问题

1. **数据库连接超时**
   - 检查网络配置
   - 确认数据库实例状态
   - 验证连接参数

2. **函数执行失败**
   - 查看函数日志
   - 检查环境变量配置
   - 验证代码语法

3. **CORS 错误**
   - 检查 CORS_ORIGIN 配置
   - 确认请求头设置

### 调试技巧

1. **本地测试**
```bash
# 设置环境变量
export DB_HOST=your-host
export DB_USERNAME=your-user
# ... 其他变量

# 运行测试
node test.js
```

2. **日志调试**
```javascript
console.log('Database config:', {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE
});