// 数据库连接配置和工具函数

/**
 * Cloudflare D1 数据库连接
 */
export class D1Database {
  constructor(db) {
    this.db = db;
  }

  async query(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).all();
      }
      return await stmt.all();
    } catch (error) {
      console.error('D1 Query Error:', error);
      throw error;
    }
  }

  async execute(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).run();
      }
      return await stmt.run();
    } catch (error) {
      console.error('D1 Execute Error:', error);
      throw error;
    }
  }

  async first(sql, params = []) {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).first();
      }
      return await stmt.first();
    } catch (error) {
      console.error('D1 First Error:', error);
      throw error;
    }
  }
}

/**
 * MySQL/PostgreSQL 数据库连接 (用于 EdgeOne 和阿里云 ESA)
 */
export class SQLDatabase {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  async connect() {
    if (this.config.type === 'mysql') {
      // MySQL 连接 (需要安装 mysql2 包)
      const mysql = await import('mysql2/promise');
      this.pool = mysql.createPool({
        host: this.config.host,
        port: this.config.port || 3306,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        ssl: this.config.ssl || false
      });
    } else if (this.config.type === 'postgresql') {
      // PostgreSQL 连接 (需要安装 pg 包)
      const { Pool } = await import('pg');
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port || 5432,
        user: this.config.username,
        password: this.config.password,
        database: this.config.database,
        ssl: this.config.ssl || false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }
  }

  async query(sql, params = []) {
    try {
      if (!this.pool) await this.connect();
      const [rows] = await this.pool.execute(sql, params);
      return { results: rows };
    } catch (error) {
      console.error('SQL Query Error:', error);
      throw error;
    }
  }

  async execute(sql, params = []) {
    try {
      if (!this.pool) await this.connect();
      const [result] = await this.pool.execute(sql, params);
      return { 
        success: result.affectedRows > 0,
        insertId: result.insertId,
        affectedRows: result.affectedRows
      };
    } catch (error) {
      console.error('SQL Execute Error:', error);
      throw error;
    }
  }

  async first(sql, params = []) {
    try {
      const result = await this.query(sql, params);
      return result.results[0] || null;
    } catch (error) {
      console.error('SQL First Error:', error);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

/**
 * 数据库工厂函数
 */
export function createDatabase(env) {
  // Cloudflare Workers 环境
  if (env.DB && typeof env.DB.prepare === 'function') {
    return new D1Database(env.DB);
  }
  
  // 其他环境使用 SQL 数据库
  const dbConfig = {
    type: env.DB_TYPE || 'mysql',
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT) || (env.DB_TYPE === 'postgresql' ? 5432 : 3306),
    username: env.DB_USERNAME || env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME || env.DB_DATABASE,
    ssl: env.DB_SSL === 'true' || env.DB_SSL === true
  };
  
  return new SQLDatabase(dbConfig);
}

/**
 * 初始化数据库表结构
 */
export async function initializeDatabase(db) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      url TEXT NOT NULL,
      category TEXT,
      size INTEGER,
      type TEXT,
      downloads INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await db.execute(createTableSQL);
    
    // 检查是否有示例数据
    const existingFiles = await db.query('SELECT COUNT(*) as count FROM files');
    const count = existingFiles.results?.[0]?.count || existingFiles.count || 0;
    
    if (count === 0) {
      // 插入示例数据
      const sampleFiles = [
        {
          name: '示例PDF文档',
          description: '这是一个示例PDF文件，用于测试下载功能',
          url: 'https://example.com/sample.pdf',
          category: '文档',
          size: 1024000,
          type: 'pdf'
        },
        {
          name: '示例图片文件',
          description: '高清壁纸图片',
          url: 'https://example.com/image.jpg',
          category: '图片',
          size: 512000,
          type: 'jpg'
        },
        {
          name: '示例软件安装包',
          description: 'Windows系统工具软件',
          url: 'https://example.com/software.exe',
          category: '软件',
          size: 15360000,
          type: 'exe'
        }
      ];

      for (const file of sampleFiles) {
        await db.execute(
          'INSERT INTO files (name, description, url, category, size, type, downloads) VALUES (?, ?, ?, ?, ?, ?, 0)',
          [file.name, file.description, file.url, file.category, file.size, file.type]
        );
      }
    }
    
    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}