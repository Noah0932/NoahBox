const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 简单的内存存储
let adminPassword = 'admin123';
const sessions = new Map();

// 生成会话ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// 身份验证中间件
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return res.status(401).json({ error: 'Session expired' });
  }
  
  next();
}

// 登录接口
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      });
    }
    
    if (username === 'admin' && password === adminPassword) {
      const sessionId = generateSessionId();
      
      sessions.set(sessionId, { 
        username, 
        loginTime: Date.now() 
      });
      
      return res.json({ 
        success: true, 
        sessionId,
        username 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: '用户名或密码错误' 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: '服务器内部错误' 
    });
  }
});

// 验证会话
app.get('/api/auth/status', (req, res) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.json({ authenticated: false });
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return res.json({ authenticated: false });
  }
  
  return res.json({ authenticated: true, username: session.username });
});

// 修改密码
app.post('/api/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请填写完整信息' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码长度至少6位' });
    }
    
    // 验证当前密码
    if (currentPassword !== adminPassword) {
      return res.status(400).json({ success: false, message: '当前密码错误' });
    }
    
    // 更新密码
    adminPassword = newPassword;
    
    // 清除所有会话，强制重新登录
    sessions.clear();
    
    console.log(`✅ 密码已更新为: ${newPassword}`);
    
    return res.json({ success: true, message: '密码修改成功，请重新登录' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, message: '系统错误，请稍后重试' });
  }
});

// 登出
app.post('/api/logout', requireAuth, (req, res) => {
  const sessionId = req.headers['x-session-id'];
  if (sessionId) {
    sessions.delete(sessionId);
  }
  return res.json({ success: true });
});

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
  },
  {
    id: 3,
    name: 'Python 数据分析',
    description: 'Python 数据科学完整教程',
    url: 'https://example.com/python-data.pdf',
    category: '数据科学',
    size: 8388608,
    type: 'pdf',
    downloads: 31,
    created_at: '2024-01-25T09:15:00Z'
  }
];

let files = [...sampleFiles];
let nextId = 4;

// 获取文件列表
app.get('/api/files', (req, res) => {
  return res.json(files);
});

// 添加文件
app.post('/api/files', requireAuth, (req, res) => {
  try {
    const { name, description, url, category, size, type } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
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
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Add file error:', error);
    return res.status(500).json({ error: 'Failed to add file' });
  }
});

// 删除文件
app.delete('/api/files/:id', requireAuth, (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const index = files.findIndex(f => f.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    files.splice(index, 1);
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({ error: 'Failed to delete file' });
  }
});

// 更新下载计数
app.post('/api/files/:id/download', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const file = files.find(f => f.id === id);
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    file.downloads = (file.downloads || 0) + 1;
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Update download count error:', error);
    return res.status(500).json({ error: 'Failed to update download count' });
  }
});

// 获取分类列表
app.get('/api/categories', (req, res) => {
  try {
    const categories = [...new Set(files.map(f => f.category))];
    return res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`🚀 开发服务器启动在 http://localhost:${port}`);
  console.log(`📱 管理后台: http://localhost:${port}/admin.html`);
  console.log(`🔑 默认账户: admin / admin123`);
  console.log(`💡 提示: 修改密码后会在控制台显示新密码`);
});