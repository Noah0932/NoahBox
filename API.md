# 📚 API 文档

Download Station 提供了完整的 RESTful API，支持文件管理、用户认证等功能。

## 🔗 基础信息

- **Base URL**: `https://your-domain.com/api`
- **认证方式**: Session-based (使用 `X-Session-ID` 头)
- **数据格式**: JSON
- **字符编码**: UTF-8

## 🔐 认证

### 登录

获取管理员会话 ID。

**请求**
```http
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

**响应**
```json
{
  "success": true,
  "sessionId": "abc123def456",
  "username": "admin"
}
```

### 检查认证状态

验证当前会话是否有效。

**请求**
```http
GET /api/auth/status
X-Session-ID: abc123def456
```

**响应**
```json
{
  "authenticated": true,
  "user": {
    "username": "admin"
  }
}
```

### 登出

销毁当前会话。

**请求**
```http
POST /api/logout
X-Session-ID: abc123def456
```

**响应**
```json
{
  "success": true
}
```

## 📁 文件管理

### 获取文件列表

获取所有可下载文件的列表。

**请求**
```http
GET /api/files
```

**响应**
```json
[
  {
    "id": 1,
    "name": "示例文件.pdf",
    "description": "这是一个示例文件",
    "url": "https://example.com/file.pdf",
    "category": "文档",
    "size": 1024000,
    "type": "pdf",
    "downloads": 42,
    "created_at": "2025-08-27T12:00:00Z"
  }
]
```

### 获取单个文件

根据 ID 获取特定文件信息。

**请求**
```http
GET /api/files/{id}
```

**响应**
```json
{
  "id": 1,
  "name": "示例文件.pdf",
  "description": "这是一个示例文件",
  "url": "https://example.com/file.pdf",
  "category": "文档",
  "size": 1024000,
  "type": "pdf",
  "downloads": 42,
  "created_at": "2025-08-27T12:00:00Z"
}
```

### 添加文件 🔒

添加新的下载文件（需要管理员权限）。

**请求**
```http
POST /api/files
X-Session-ID: abc123def456
Content-Type: application/json

{
  "name": "新文件.zip",
  "description": "文件描述",
  "url": "https://example.com/newfile.zip",
  "category": "软件",
  "size": 2048000,
  "type": "zip"
}
```

**响应**
```json
{
  "success": true
}
```

### 更新文件 🔒

更新现有文件信息（需要管理员权限）。

**请求**
```http
PUT /api/files/{id}
X-Session-ID: abc123def456
Content-Type: application/json

{
  "name": "更新后的文件名.zip",
  "description": "更新后的描述",
  "url": "https://example.com/updated-file.zip",
  "category": "软件",
  "size": 3072000,
  "type": "zip"
}
```

**响应**
```json
{
  "success": true
}
```

### 删除文件 🔒

删除指定文件（需要管理员权限）。

**请求**
```http
DELETE /api/files/{id}
X-Session-ID: abc123def456
```

**响应**
```json
{
  "success": true
}
```

### 更新下载计数

增加文件的下载次数。

**请求**
```http
POST /api/files/{id}/download
```

**响应**
```json
{
  "success": true
}
```

## 📊 分类管理

### 获取分类列表

获取所有文件分类。

**请求**
```http
GET /api/categories
```

**响应**
```json
[
  "软件",
  "游戏",
  "文档",
  "媒体",
  "其他"
]
```

## 🛠️ 系统管理

### 初始化数据库

初始化数据库表结构和示例数据。

**请求**
```http
GET /api/init
```

**响应**
```json
{
  "success": true,
  "message": "Database initialized successfully with sample data"
}
```

## 📝 数据模型

### File 对象

| 字段 | 类型 | 描述 |
|------|------|------|
| `id` | integer | 文件唯一标识符 |
| `name` | string | 文件名称 |
| `description` | string | 文件描述 |
| `url` | string | 下载链接 |
| `category` | string | 文件分类 |
| `size` | integer | 文件大小（字节） |
| `type` | string | 文件类型/扩展名 |
| `downloads` | integer | 下载次数 |
| `created_at` | string | 创建时间 (ISO 8601) |

### User 对象

| 字段 | 类型 | 描述 |
|------|------|------|
| `username` | string | 用户名 |

## ❌ 错误处理

### 错误响应格式

```json
{
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 常见错误码

| HTTP 状态码 | 错误码 | 描述 |
|-------------|--------|------|
| 400 | `BAD_REQUEST` | 请求参数错误 |
| 401 | `UNAUTHORIZED` | 未授权访问 |
| 403 | `FORBIDDEN` | 权限不足 |
| 404 | `NOT_FOUND` | 资源不存在 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 |

### 示例错误响应

```json
{
  "error": "Name and URL are required",
  "code": "BAD_REQUEST"
}
```

## 🔧 使用示例

### JavaScript/Fetch API

```javascript
// 获取文件列表
const files = await fetch('/api/files')
  .then(res => res.json());

// 管理员登录
const loginResponse = await fetch('/api/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'password'
  })
});

const { sessionId } = await loginResponse.json();

// 添加文件（需要认证）
const addResponse = await fetch('/api/files', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-ID': sessionId
  },
  body: JSON.stringify({
    name: '新文件.pdf',
    description: '文件描述',
    url: 'https://example.com/file.pdf',
    category: '文档',
    size: 1024000,
    type: 'pdf'
  })
});
```

### cURL

```bash
# 获取文件列表
curl -X GET https://your-domain.com/api/files

# 管理员登录
curl -X POST https://your-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 添加文件
curl -X POST https://your-domain.com/api/files \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: your-session-id" \
  -d '{
    "name": "新文件.pdf",
    "description": "文件描述",
    "url": "https://example.com/file.pdf",
    "category": "文档",
    "size": 1024000,
    "type": "pdf"
  }'
```

## 📈 速率限制

目前 API 没有实施速率限制，但建议：

- 避免频繁的大量请求
- 实施客户端缓存
- 使用适当的请求间隔

## 🔄 版本控制

当前 API 版本：`v1`

未来版本将通过以下方式标识：
- URL 路径：`/api/v2/files`
- 请求头：`API-Version: v2`

## 📞 支持

如有 API 相关问题：

- 查看 [GitHub Issues](https://github.com/your-username/download-station/issues)
- 参与 [GitHub Discussions](https://github.com/your-username/download-station/discussions)
- 阅读 [部署文档](DEPLOYMENT.md)

---

📝 本文档会随着 API 的更新而持续维护。