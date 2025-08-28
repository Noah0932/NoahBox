import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Database from 'better-sqlite3';

const app = new Hono();
const db = new Database('./local.db');

// 会话存储
const sessions = new Map();

// CORS中间件
app.use('*', cors());

// 静态文件服务
app.use('/*', serveStatic({ root: './public' }));

// 身份验证中间件
const requireAuth = async (c, next) => {
  const sessionId = c.req.header('X-Session-ID');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return c.json({ error: 'Session expired' }, 401);
  }
  
  await next();
};

// 登录接口
app.post('/api/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      }, 400);
    }
    
    // 从数据库获取管理员密码
    const result = db.prepare('SELECT password FROM admin_config WHERE id = 1').get();
    const storedPassword = result ? result.password : 'admin123';
    
    if (username === 'admin' && password === storedPassword) {
      const sessionId = Math.random().toString(36).substring(2);
      
      sessions.set(sessionId, { 
        username, 
        loginTime: Date.now() 
      });
      
      return c.json({ 
        success: true, 
        sessionId,
        username 
      });
    }
    
    return c.json({ 
      success: false, 
      message: '用户名或密码错误' 
    }, 401);
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ 
      success: false, 
      message: '服务器内部错误' 
    }, 500);
  }
});

// 验证会话
app.get('/api/auth/status', async (c) => {
  const sessionId = c.req.header('X-Session-ID');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ authenticated: false });
  }
  
  const session = sessions.get(sessionId);
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return c.json({ authenticated: false });
  }
  
  return c.json({ authenticated: true, username: session.username });
});

// 修改密码
app.post('/api/change-password', requireAuth, async (c) => {
  try {
    const { currentPassword, newPassword } = await c.req.json();
    
    if (!currentPassword || !newPassword) {
      return c.json({ success: false, message: '请填写完整信息' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ success: false, message: '新密码长度至少6位' }, 400);
    }
    
    // 获取当前存储的密码
    const result = db.prepare('SELECT password FROM admin_config WHERE id = 1').get();
    const currentStoredPassword = result ? result.password : 'admin123';
    
    // 验证当前密码
    if (currentPassword !== currentStoredPassword) {
      return c.json({ success: false, message: '当前密码错误' }, 400);
    }
    
    // 更新密码到数据库
    const updateResult = db.prepare(
      'INSERT OR REPLACE INTO admin_config (id, password, updated_at) VALUES (1, ?, datetime("now"))'
    ).run(newPassword);
    
    if (updateResult.changes === 0) {
      return c.json({ success: false, message: '密码更新失败，请稍后重试' }, 500);
    }
    
    // 清除所有会话，强制重新登录
    sessions.clear();
    
    return c.json({ success: true, message: '密码修改成功，请重新登录' });
  } catch (error) {
    console.error('Password change error:', error);
    return c.json({ success: false, message: '系统错误，请稍后重试' }, 500);
  }
});

// 登出
app.post('/api/logout', requireAuth, async (c) => {
  const sessionId = c.req.header('X-Session-ID');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  return c.json({ success: true });
});

// 获取文件列表
app.get('/api/files', async (c) => {
  try {
    const files = db.prepare('SELECT * FROM files ORDER BY created_at DESC').all();
    return c.json(files);
  } catch (error) {
    console.error('Get files error:', error);
    return c.json({ error: 'Failed to fetch files' }, 500);
  }
});

// 添加文件
app.post('/api/files', requireAuth, async (c) => {
  try {
    const { name, description, url, category, size, type } = await c.req.json();
    
    if (!name || !url) {
      return c.json({ error: 'Name and URL are required' }, 400);
    }
    
    const result = db.prepare(
      'INSERT INTO files (name, description, url, category, size, type, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, datetime("now"))'
    ).run(name, description || '', url, category || 'uncategorized', size || 0, type || '');
    
    if (result.changes === 0) {
      return c.json({ error: 'Failed to add file' }, 500);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Add file error:', error);
    return c.json({ error: 'Failed to add file' }, 500);
  }
});

// 删除文件
app.delete('/api/files/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const result = db.prepare('DELETE FROM files WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete file error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// 更新下载计数
app.post('/api/files/:id/download', async (c) => {
  try {
    const id = c.req.param('id');
    const result = db.prepare('UPDATE files SET downloads = downloads + 1 WHERE id = ?').run(id);
    
    if (result.changes === 0) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update download count error:', error);
    return c.json({ error: 'Failed to update download count' }, 500);
  }
});

// 获取分类列表
app.get('/api/categories', async (c) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM files').all();
    return c.json(categories.map(r => r.category));
  } catch (error) {
    console.error('Get categories error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

const port = 3000;
console.log(`🚀 开发服务器启动在 http://localhost:${port}`);
console.log(`📱 管理后台: http://localhost:${port}/admin.html`);
console.log(`🔑 默认账户: admin / admin123`);

serve({
  fetch: app.fetch,
  port
});