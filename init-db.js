// 本地数据库初始化脚本
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// 创建本地SQLite数据库
const dbPath = './local.db';
const db = new Database(dbPath);

console.log('正在初始化本地数据库...');

try {
  // 创建files表
  db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      category TEXT,
      size INTEGER,
      type TEXT,
      downloads INTEGER DEFAULT 0,
      created_at TEXT
    )
  `);

  // 创建admin_config表
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_config (
      id INTEGER PRIMARY KEY,
      password TEXT NOT NULL,
      updated_at TEXT
    )
  `);

  // 插入默认管理员密码
  const adminExists = db.prepare('SELECT COUNT(*) as count FROM admin_config WHERE id = 1').get();
  if (adminExists.count === 0) {
    db.prepare('INSERT INTO admin_config (id, password, updated_at) VALUES (1, ?, datetime("now"))')
      .run('admin123');
    console.log('✅ 默认管理员密码已设置: admin123');
  }

  // 插入示例数据
  const fileCount = db.prepare('SELECT COUNT(*) as count FROM files').get();
  if (fileCount.count === 0) {
    const sampleFiles = [
      {
        name: 'Node.js 开发指南',
        description: 'Node.js 完整开发教程',
        url: 'https://example.com/nodejs-guide.pdf',
        category: '编程教程',
        size: 5242880,
        type: 'pdf'
      },
      {
        name: 'React 实战项目',
        description: 'React 前端框架实战案例',
        url: 'https://example.com/react-project.zip',
        category: '前端开发',
        size: 10485760,
        type: 'zip'
      }
    ];

    const insertFile = db.prepare(`
      INSERT INTO files (name, description, url, category, size, type, downloads, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
    `);

    sampleFiles.forEach(file => {
      insertFile.run(file.name, file.description, file.url, file.category, file.size, file.type);
    });

    console.log('✅ 示例数据已插入');
  }

  console.log('✅ 数据库初始化完成！');
  console.log(`数据库文件: ${path.resolve(dbPath)}`);
  
} catch (error) {
  console.error('❌ 数据库初始化失败:', error);
} finally {
  db.close();
}