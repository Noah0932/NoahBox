# 阿里云 ESA 边缘函数 + 数据库部署指南

## 📋 前置要求

- 阿里云账户
- ESA (Edge Script) 服务开通
- RDS 数据库实例 (MySQL/PostgreSQL)

## 🗄️ 数据库配置

### 方案一：阿里云 RDS MySQL

1. **创建 RDS MySQL 实例**
   - 登录 [阿里云控制台](https://ecs.console.aliyun.com/)
   - 进入 RDS 云数据库
   - 创建 MySQL 实例

2. **配置数据库**
```sql
-- 创建数据库
CREATE DATABASE download_station CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'download_user'@'%' IDENTIFIED BY 'YourSecurePassword123!';
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
('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe'),
('示例视频文件', '教学视频资源', 'https://example.com/video.mp4', '媒体', 52428800, 'mp4'),
('示例压缩包', '工具集合包', 'https://example.com/tools.zip', '软件', 8388608, 'zip');
```

### 方案二：阿里云 RDS PostgreSQL

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

-- 创建索引
CREATE INDEX idx_files_category ON files(category);
CREATE INDEX idx_files_created_at ON files(created_at);

-- 插入示例数据
INSERT INTO files (name, description, url, category, size, type) VALUES
('示例PDF文档', '这是一个示例PDF文件，用于测试下载功能', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf'),
('示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg'),
('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe'),
('示例视频文件', '教学视频资源', 'https://example.com/video.mp4', '媒体', 52428800, 'mp4'),
('示例压缩包', '工具集合包', 'https://example.com/tools.zip', '软件', 8388608, 'zip');
```

## 🚀 ESA 边缘函数部署

### 1. 函数代码结构

```
aliyun-esa/
├── index.js              # 主函数文件
├── package.json          # 依赖配置
├── function.config.json  # 函数配置
└── lib/
    ├── database.js       # 数据库连接
    └── utils.js         # 工具函数
```

### 2. package.json 配置

```json
{
  "name": "download-station-esa",
  "version": "1.0.0",
  "description": "Download Station API for Alibaba Cloud ESA",
  "main": "index.js",
  "dependencies": {
    "mysql2": "^3.6.0",
    "pg": "^8.11.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 3. 主函数代码

```javascript
// index.js
const mysql = require('mysql2/promise');

// 数据库连接池
let pool = null;

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false
    });
  }
  return pool;
}

// 主处理函数
exports.handler = async (event, context) => {
  const { httpMethod, path, headers, body } = event;
  
  // CORS 处理
  const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
    'Content-Type': 'application/json'
  };

  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const db = createPool();
    
    // 路由处理
    if (path === '/api/files' && httpMethod === 'GET') {
      const [rows] = await db.execute('SELECT * FROM files ORDER BY created_at DESC');
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(rows)
      };
    }
    
    if (path === '/api/categories' && httpMethod === 'GET') {
      const [rows] = await db.execute('SELECT DISTINCT category FROM files WHERE category IS NOT NULL');
      const categories = rows.map(row => row.category);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(categories)
      };
    }
    
    if (path === '/api/init' && httpMethod === 'GET') {
      // 检查表是否存在
      const [tables] = await db.execute("SHOW TABLES LIKE 'files'");
      if (tables.length === 0) {
        // 创建表
        await db.execute(`
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
          )
        `);
        
        // 插入示例数据
        const sampleData = [
          ['示例PDF文档', '这是一个示例PDF文件', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf'],
          ['示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg'],
          ['示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe']
        ];
        
        for (const data of sampleData) {
          await db.execute(
            'INSERT INTO files (name, description, url, category, size, type) VALUES (?, ?, ?, ?, ?, ?)',
            data
          );
        }
      }
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true, message: 'Database initialized successfully' })
      };
    }
    
    // 需要认证的路由
    if (path.startsWith('/api/files') && ['POST', 'PUT', 'DELETE'].includes(httpMethod)) {
      const sessionId = headers['x-session-id'] || headers['X-Session-ID'];
      if (!sessionId || !isValidSession(sessionId)) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }
      
      // 处理认证后的请求...
    }
    
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Not Found' })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// 简单的会话验证
function isValidSession(sessionId) {
  // 这里应该实现真正的会话验证逻辑
  // 可以使用 Redis 或数据库存储会话信息
  return sessionId && sessionId.length > 10;
}
```

### 4. 部署步骤

1. **准备代码包**
```bash
# 安装依赖
npm install

# 打包代码
zip -r download-station-esa.zip . -x "node_modules/.cache/*" "*.git*"
```

2. **创建边缘函数**
   - 登录 [阿里云 ESA 控制台](https://esa.console.aliyun.com/)
   - 选择站点 → 边缘函数
   - 创建新函数

3. **上传代码包**
   - 选择"上传代码包"
   - 上传 ZIP 文件
   - 配置入口函数：`index.handler`

4. **配置环境变量**
```bash
DB_HOST=rm-xxxxxxxx.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USERNAME=download_user
DB_PASSWORD=YourSecurePassword123!
DB_DATABASE=download_station
DB_SSL=true
CORS_ORIGIN=https://your-frontend-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
```

5. **配置触发器**
   - 触发器类型：HTTP 触发器
   - 请求方法：GET, POST, PUT, DELETE, OPTIONS
   - 路径：`/api/*`

## 🔧 数据库连接优化

### 连接池配置

```javascript
const poolConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,        // 最大连接数
  queueLimit: 0,             // 队列限制
  acquireTimeout: 60000,     // 获取连接超时
  timeout: 60000,            // 查询超时
  reconnect: true,           // 自动重连
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
};
```

### 错误处理和重试

```javascript
async function executeQuery(sql, params = [], retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const db = createPool();
      const [rows] = await db.execute(sql, params);
      return rows;
    } catch (error) {
      console.error(`Query attempt ${i + 1} failed:`, error);
      
      if (i === retries - 1) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## 📊 监控和日志

### 函数日志

在 ESA 控制台查看：
- 函数执行日志
- 错误统计
- 性能指标

### 数据库监控

在 RDS 控制台查看：
- 连接数统计
- 查询性能
- 慢查询日志

## 🔒 安全配置

### 网络安全

1. **白名单配置**
```bash
# 在 RDS 控制台配置白名单
# 添加 ESA 边缘节点 IP 段
```

2. **SSL 连接**
```javascript
const sslConfig = {
  ssl: {
    ca: fs.readFileSync('/path/to/ca-cert.pem'),
    rejectUnauthorized: true
  }
};
```

### 访问控制

1. **数据库权限**
```sql
-- 创建只读用户
CREATE USER 'readonly_user'@'%' IDENTIFIED BY 'ReadOnlyPassword123!';
GRANT SELECT ON download_station.* TO 'readonly_user'@'%';

-- 创建管理用户
CREATE USER 'admin_user'@'%' IDENTIFIED BY 'AdminPassword123!';
GRANT ALL PRIVILEGES ON download_station.* TO 'admin_user'@'%';
```

2. **环境变量加密**
```bash
# 使用阿里云 KMS 加密敏感信息
# 在函数中解密使用
```

## 💰 费用说明

### ESA 边缘函数
- 按请求次数计费
- 按执行时间计费
- 免费额度：100万次请求/月

### RDS 数据库
- 按实例规格计费
- 按存储空间计费
- 按流量计费

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
```javascript
// 检查连接参数
console.log('DB Config:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE
});
```

2. **函数超时**
```javascript
// 增加超时时间配置
// 在 function.config.json 中设置
{
  "timeout": 60
}
```

3. **内存不足**
```javascript
// 优化内存使用
// 及时释放连接
if (pool) {
  await pool.end();
  pool = null;
}
```

### 调试技巧

1. **本地测试**
```bash
# 设置环境变量
export DB_HOST=your-rds-host
export DB_USERNAME=your-username
# ... 其他变量

# 运行本地测试
node local-test.js
```

2. **日志调试**
```javascript
// 详细日志
console.log('Request:', JSON.stringify(event, null, 2));
console.log('Response:', JSON.stringify(response, null, 2));