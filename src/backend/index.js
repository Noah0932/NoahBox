/**
 * Download Station 后端 API 服务
 * 基于 Hono.js 框架，支持 Cloudflare Workers 部署
 * 
 * 主要功能：
 * - 文件管理 CRUD 操作
 * - 用户认证和会话管理
 * - 静态文件服务
 * - 数据库初始化
 * 
 * @author Download Station Team
 * @version 1.0.0
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';

// 创建 Hono 应用实例
const app = new Hono();

/**
 * 静态页面路由配置
 * 为不同的页面提供静态文件服务
 */
app.get('/downloads', serveStatic({ path: './public/downloads.html' }));
app.get('/admin', serveStatic({ path: './public/admin.html' }));
app.get('/login', serveStatic({ path: './public/login.html' }));
app.get('/change-password', serveStatic({ path: './public/change-password.html' }));

/**
 * 通用静态文件服务
 * 处理所有其他静态资源请求
 */
app.get('/*', serveStatic({ root: './' }));

/**
 * 会话存储
 * 在生产环境中应该使用 Redis 或数据库存储
 * 当前使用内存存储仅用于演示
 * 
 * @type {Map<string, {username: string, loginTime: number}>}
 */
const sessions = new Map();

/**
 * 用户登录接口
 * 验证用户凭据并创建会话
 * 
 * @route POST /api/login
 * @param {Object} body - 请求体
 * @param {string} body.username - 用户名
 * @param {string} body.password - 密码
 * @returns {Object} 登录结果
 * @returns {boolean} returns.success - 登录是否成功
 * @returns {string} [returns.sessionId] - 会话ID（成功时返回）
 * @returns {string} [returns.username] - 用户名（成功时返回）
 * @returns {string} [returns.message] - 错误信息（失败时返回）
 */
app.post('/api/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    // 验证必填字段
    if (!username || !password) {
      return c.json({ 
        success: false, 
        message: '用户名和密码不能为空' 
      }, 400);
    }
    
    // 从数据库获取管理员密码
    let storedPassword = 'admin123'; // 默认密码
    
    try {
      const { DB } = c.env;
      if (DB) {
        const result = await DB.prepare('SELECT password FROM admin_config WHERE id = 1').first();
        if (result && result.password) {
          storedPassword = result.password;
        }
      }
    } catch (dbError) {
      console.log('Database query failed, using default password:', dbError);
      // 如果数据库查询失败，使用默认密码
    }
    
    // 验证管理员账户
    if (username === 'admin' && password === storedPassword) {
      // 生成会话ID
      const sessionId = Math.random().toString(36).substring(2);
      
      // 存储会话信息
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
    
    // 登录失败
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

// 验证会话 - 支持多种方式获取session
app.get('/api/auth/status', async (c) => {
  // 尝试从多个地方获取sessionId
  let sessionId = c.req.header('X-Session-ID');
  
  // 如果没有X-Session-ID头部，尝试从Cookie获取
  if (!sessionId) {
    const cookies = c.req.header('Cookie');
    if (cookies) {
      const match = cookies.match(/session=([^;]+)/);
      sessionId = match ? match[1] : null;
    }
  }
  
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ authenticated: false });
  }
  
  const session = sessions.get(sessionId);
  // 检查会话是否过期（24小时）
  if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
    sessions.delete(sessionId);
    return c.json({ authenticated: false });
  }
  
  return c.json({ 
    authenticated: true, 
    user: { username: session.username } 
  });
});

// 添加check-auth别名接口
app.get('/api/check-auth', async (c) => {
  // 重定向到auth/status
  return app.fetch(new Request(c.req.url.replace('/check-auth', '/auth/status'), c.req));
});

// 登出
app.post('/api/logout', async (c) => {
  const sessionId = c.req.header('X-Session-ID');
  
  if (sessionId) {
    sessions.delete(sessionId);
  }
  
  return c.json({ success: true });
});

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

// 修改密码
app.post('/api/change-password', requireAuth, async (c) => {
  const { DB } = c.env;
  const { currentPassword, newPassword } = await c.req.json();
  
  if (!currentPassword || !newPassword) {
    return c.json({ success: false, message: '请填写完整信息' }, 400);
  }
  
  if (newPassword.length < 6) {
    return c.json({ success: false, message: '新密码长度至少6位' }, 400);
  }
  
  try {
    // 获取当前存储的密码
    let currentStoredPassword = 'admin123'; // 默认密码
    
    try {
      if (DB) {
        const result = await DB.prepare('SELECT password FROM admin_config WHERE id = 1').first();
        if (result && result.password) {
          currentStoredPassword = result.password;
        }
      }
    } catch (dbError) {
      console.log('Database query failed in change-password, using default:', dbError);
    }
    
    // 验证当前密码
    if (currentPassword !== currentStoredPassword) {
      return c.json({ success: false, message: '当前密码错误' }, 400);
    }
    
    // 更新密码到数据库
    const { success } = await DB.prepare(
      'INSERT OR REPLACE INTO admin_config (id, password, updated_at) VALUES (1, ?, datetime("now"))'
    ).bind(newPassword).run();
    
    if (!success) {
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

// API路由
app.route('/api', api());

function api() {
  const api = new Hono();

  // 获取所有文件
  api.get('/files', async (c) => {
    const { DB } = c.env;
    const { results } = await DB.prepare('SELECT * FROM files ORDER BY created_at DESC').all();
    return c.json(results);
  });

  // 获取单个文件
  api.get('/files/:id', async (c) => {
    const { DB } = c.env;
    const id = c.req.param('id');
    const file = await DB.prepare('SELECT * FROM files WHERE id = ?').bind(id).first();
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    return c.json(file);
  });

  // 添加文件 (需要身份验证)
  api.post('/files', requireAuth, async (c) => {
    const { DB } = c.env;
    const body = await c.req.json();
    
    const { name, description, url, category, size, type } = body;
    
    if (!name || !url) {
      return c.json({ error: 'Name and URL are required' }, 400);
    }
    
    const { success } = await DB.prepare(
      'INSERT INTO files (name, description, url, category, size, type, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, datetime("now"))'
    ).bind(name, description || '', url, category || 'uncategorized', size || 0, type || '').run();
    
    if (!success) {
      return c.json({ error: 'Failed to add file' }, 500);
    }
    
    return c.json({ success: true });
  });
  
  // 更新文件 (需要身份验证)
  api.put('/files/:id', requireAuth, async (c) => {
    const { DB } = c.env;
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const { name, description, url, category, size, type } = body;
    
    if (!name || !url) {
      return c.json({ error: 'Name and URL are required' }, 400);
    }
    
    const { success } = await DB.prepare(
      'UPDATE files SET name = ?, description = ?, url = ?, category = ?, size = ?, type = ? WHERE id = ?'
    ).bind(name, description || '', url, category || 'uncategorized', size || 0, type || '', id).run();
    
    if (!success) {
      return c.json({ error: 'Failed to update file' }, 500);
    }
    
    return c.json({ success: true });
  });
  
  // 删除文件 (需要身份验证)
  api.delete('/files/:id', requireAuth, async (c) => {
    const { DB } = c.env;
    const id = c.req.param('id');
    
    const { success } = await DB.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
    
    if (!success) {
      return c.json({ error: 'Failed to delete file' }, 500);
    }
    
    return c.json({ success: true });
  });

  // 更新下载计数
  api.post('/files/:id/download', async (c) => {
    const { DB } = c.env;
    const id = c.req.param('id');
    
    const { success } = await DB.prepare(
      'UPDATE files SET downloads = downloads + 1 WHERE id = ?'
    ).bind(id).run();
    
    if (!success) {
      return c.json({ error: 'Failed to update download count' }, 500);
    }
    
    return c.json({ success: true });
  });

  // 获取分类列表
  api.get('/categories', async (c) => {
    const { DB } = c.env;
    const { results } = await DB.prepare('SELECT DISTINCT category FROM files').all();
    return c.json(results.map(r => r.category));
  });

  return api;
}

// 初始化数据库
app.get('/api/init', async (c) => {
  const { DB } = c.env;
  
  try {
    // 创建表结构
    await DB.exec("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, url TEXT NOT NULL, category TEXT, size INTEGER, type TEXT, downloads INTEGER DEFAULT 0, created_at TEXT)");
    
    // 创建管理员配置表
    await DB.exec("CREATE TABLE IF NOT EXISTS admin_config (id INTEGER PRIMARY KEY, password TEXT NOT NULL, updated_at TEXT)");
    
    // 初始化默认管理员密码
    const { results } = await DB.prepare('SELECT COUNT(*) as count FROM admin_config WHERE id = 1').all();
    if (results[0].count === 0) {
      await DB.prepare('INSERT INTO admin_config (id, password, updated_at) VALUES (1, ?, datetime("now"))').bind('admin123').run();
    }
    
    // 添加示例数据
    try {
      // 添加第一个示例文件
      await DB.prepare(
        'INSERT INTO files (name, description, url, category, size, type, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
      ).bind('示例PDF文档', '这是一个示例PDF文件，用于测试下载功能', 'https://example.com/sample.pdf', '文档', 1024000, 'pdf', 0).run();
      
      // 添加第二个示例文件
      await DB.prepare(
        'INSERT INTO files (name, description, url, category, size, type, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
      ).bind('示例图片文件', '高清壁纸图片', 'https://example.com/image.jpg', '图片', 512000, 'jpg', 0).run();
      
      // 添加第三个示例文件
      await DB.prepare(
        'INSERT INTO files (name, description, url, category, size, type, downloads, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))'
      ).bind('示例软件安装包', 'Windows系统工具软件', 'https://example.com/software.exe', '软件', 15360000, 'exe', 0).run();
    } catch (insertError) {
      // 如果插入失败，可能是因为数据已存在，我们可以忽略这个错误
      console.error('Insert sample data error:', insertError);
    }
    
    return c.json({ success: true, message: 'Database initialized successfully with sample data' });
  } catch (e) {
    return c.json({ error: e.message }, 500);
  }
});

export default app;