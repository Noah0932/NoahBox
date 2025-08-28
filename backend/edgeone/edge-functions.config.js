// EdgeOne 边缘函数配置
module.exports = {
  // 函数名称
  name: 'download-station-api',
  
  // 触发规则
  triggers: [
    {
      // 匹配 API 路径
      match: '/api/*',
      // 执行函数
      function: 'main'
    }
  ],
  
  // 环境变量
  environment: {
    CORS_ORIGIN: 'https://your-frontend-domain.com',
    ADMIN_USERNAME: 'admin',
    ADMIN_PASSWORD: 'your-secure-password',
    DATABASE_URL: 'your-database-connection-string'
  },
  
  // 函数配置
  config: {
    // 超时时间 (毫秒)
    timeout: 30000,
    // 内存限制 (MB)
    memory: 128,
    // 并发限制
    concurrency: 100
  }
};