/**
 * API接口测试
 * 测试所有后端API接口的功能和错误处理
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import app from '../index.js';

describe('Authentication API', () => {
  test('POST /api/login - 成功登录', async () => {
    const response = await app.request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.sessionId).toBeDefined();
    expect(data.username).toBe('admin');
  });

  test('POST /api/login - 错误密码', async () => {
    const response = await app.request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword'
      })
    });

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toBe('用户名或密码错误');
  });

  test('GET /api/auth/status - 有效会话', async () => {
    // 先登录获取sessionId
    const loginResponse = await app.request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    const { sessionId } = await loginResponse.json();

    const response = await app.request('/api/auth/status', {
      headers: { 'X-Session-ID': sessionId }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.authenticated).toBe(true);
    expect(data.user.username).toBe('admin');
  });

  test('GET /api/auth/status - 无效会话', async () => {
    const response = await app.request('/api/auth/status', {
      headers: { 'X-Session-ID': 'invalid-session' }
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.authenticated).toBe(false);
  });
});

describe('Files API', () => {
  let sessionId;

  beforeEach(async () => {
    // 每个测试前先登录
    const loginResponse = await app.request('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    const loginData = await loginResponse.json();
    sessionId = loginData.sessionId;
  });

  test('GET /api/files - 获取文件列表', async () => {
    const response = await app.request('/api/files');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('POST /api/files - 添加文件', async () => {
    const fileData = {
      name: '测试文件.pdf',
      description: '这是一个测试文件',
      url: 'https://example.com/test.pdf',
      category: '测试',
      size: 1024000,
      type: 'pdf'
    };

    const response = await app.request('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify(fileData)
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/files - 缺少必填字段', async () => {
    const fileData = {
      description: '缺少名称和URL的文件'
    };

    const response = await app.request('/api/files', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify(fileData)
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Name and URL are required');
  });

  test('POST /api/files - 未授权访问', async () => {
    const fileData = {
      name: '测试文件.pdf',
      url: 'https://example.com/test.pdf'
    };

    const response = await app.request('/api/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fileData)
    });

    expect(response.status).toBe(401);
  });

  test('GET /api/categories - 获取分类列表', async () => {
    const response = await app.request('/api/categories');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('Database Initialization', () => {
  test('GET /api/init - 初始化数据库', async () => {
    const response = await app.request('/api/init');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Database initialized successfully');
  });
});