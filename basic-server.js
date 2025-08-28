const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 简单的内存存储
let adminPassword = 'admin123';
const sessions = new Map();

// 生成会话ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 获取文件MIME类型
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };
  return mimeTypes[ext] || 'text/plain';
}

// 解析JSON请求体
function parseJSON(req, callback) {
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  });
}

// 身份验证中间件
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized' }));
    return;
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Session expired' }));
    return;
  }
  
  next();
}

// 模拟文件数据
const sampleFiles = [
  {
    id: 1,
    name: 'Node.js 开发指南',
    description: 'Node.js 完整开发教程',
    url: 'https://example.com/nodejs-guide.pdf',
    category: '编程教程',
    size: 5242880,
    type: 'pdf',
    downloads: 15,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'React 实战项目',
    description: 'React 前端框架实战案例',
    url: 'https://example.com/react-project.zip',
    category: '前端开发',
    size: 10485760,
    type: 'zip',
    downloads: 23,
    created_at: '2024-01-20T14:20:00Z'
  }
];

let files = [...sampleFiles];
let nextId = 3;

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-ID');

  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API路由处理
  if (pathname.startsWith('/api/')) {
    
    // 登录接口
    if (pathname === '/api/login' && method === 'POST') {
      parseJSON(req, (err, data) => {
        if (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '请求格式错误' }));
          return;
        }

        const { username, password } = data;
        
        if (!username || !password) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: '用户名和密码不能为空' }));
          return;
        }
        
        if (username === 'admin' && password === adminPassword) {
          const sessionId = generateSessionId();
          
          sessions.set(sessionId, { 
            username, 
            loginTime: Date.now() 
          });
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            sessionId,
            username 
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: '用户名或密码错误' 
          }));
        }
      });
      return;
    }

    // 验证会话
    if (pathname === '/api/auth/status' && method === 'GET') {
      const sessionId = req.headers['x-session-id'];
      
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: false }));
        return;
      }
      
      const session = sessions.get(sessionId);
      if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
        sessions.delete(sessionId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ authenticated: false }));
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ authenticated: true, username: session.username }));
      return;
    }

    // 修改密码
    if (pathname === '/api/change-password' && method === 'POST') {
      requireAuth(req, res, () => {
        parseJSON(req, (err, data) => {
          if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '请求格式错误' }));
            return;
          }

          const { currentPassword, newPassword } = data;
          
          if (!currentPassword || !newPassword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '请填写完整信息' }));
            return;
          }
          
          if (newPassword.length < 6) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '新密码长度至少6位' }));
            return;
          }
          
          if (currentPassword !== adminPassword) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: '当前密码错误' }));
            return;
          }
          
          // 更新密码
          adminPassword = newPassword;
          
          // 清除所有会话
          sessions.clear();
          
          console.log(`✅ 密码已更新为: ${newPassword}`);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: '密码修改成功，请重新登录' }));
        });
      });
      return;
    }

    // 获取文件列表
    if (pathname === '/api/files' && method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(files));
      return;
    }

    // 添加文件
    if (pathname === '/api/files' && method === 'POST') {
      requireAuth(req, res, () => {
        parseJSON(req, (err, data) => {
          if (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: '请求格式错误' }));
            return;
          }

          const { name, description, url, category, size, type } = data;
          
          if (!name || !url) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name and URL are required' }));
            return;
          }
          
          const newFile = {
            id: nextId++,
            name,
            description: description || '',
            url,
            category: category || 'uncategorized',
            size: parseInt(size) || 0,
            type: type || '',
            downloads: 0,
            created_at: new Date().toISOString()
          };
          
          files.push(newFile);
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        });
      });
      return;
    }

    // 删除文件
    if (pathname.startsWith('/api/files/') && method === 'DELETE') {
      requireAuth(req, res, () => {
        const id = parseInt(pathname.split('/')[3]);
        const index = files.findIndex(f => f.id === id);
        
        if (index === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }
        
        files.splice(index, 1);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    // 获取分类列表
    if (pathname === '/api/categories' && method === 'GET') {
      const categories = [...new Set(files.map(f => f.category))];
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(categories));
      return;
    }

    // 404 for unknown API routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
    return;
  }

  // 静态文件服务
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Internal Server Error</h1>');
      }
    } else {
      const mimeType = getMimeType(filePath);
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    }
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`🚀 开发服务器启动在 http://localhost:${port}`);
  console.log(`📱 管理后台: http://localhost:${port}/admin.html`);
  console.log(`🔑 默认账户: admin / admin123`);
  console.log(`💡 提示: 修改密码后会在控制台显示新密码`);
});