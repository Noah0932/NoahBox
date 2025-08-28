import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function HomePage() {
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalCategories: 0,
    totalDownloads: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const filesResponse = await fetch('/api/files');
      const files = await filesResponse.json();
      
      const totalDownloads = files.reduce((sum, file) => sum + (file.downloads || 0), 0);
      const categories = [...new Set(files.map(file => file.category).filter(Boolean))];
      
      setStats({
        totalFiles: files.length,
        totalCategories: categories.length,
        totalDownloads
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  };

  return (
    <div className="home-page">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <a href="/" className="logo">
              <i className="bi bi-box-seam"></i>
              Noah Box
            </a>
            <div className="nav-actions">
              <a href="/downloads.html" className="btn btn-secondary">
                <i className="bi bi-download"></i>
                资源下载
              </a>
              <a href="/admin.html" className="btn btn-secondary">
                <i className="bi bi-gear"></i>
                管理后台
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="main-content">
        <div className="container">
          {/* 英雄区域 */}
          <section className="hero">
            <h1>
              欢迎来到 <span className="gradient-text">Noah Box</span>
            </h1>
            <p>
              精心策划的优质资源下载平台，采用先进的科技架构，
              为您提供安全、快速、便捷的下载体验。探索未来科技的无限可能。
            </p>
            <div className="hero-actions">
              <a href="/downloads.html" className="btn btn-primary">
                <i className="bi bi-rocket-takeoff"></i>
                开始探索
              </a>
              <a href="#features" className="btn btn-secondary">
                <i className="bi bi-stars"></i>
                了解更多
              </a>
            </div>
          </section>

          {/* 统计数据 */}
          <section className="stats-section">
            <div className="grid grid-3">
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-files"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalFiles}</h3>
                  <p className="stat-label">精品资源</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-collection"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalCategories}</h3>
                  <p className="stat-label">资源分类</p>
                </div>
              </div>
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-download"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalDownloads}</h3>
                  <p className="stat-label">下载次数</p>
                </div>
              </div>
            </div>
          </section>

          {/* 特性区域 */}
          <section id="features" className="features-section">
            <h2>为什么选择 Noah Box？</h2>
            <div className="grid grid-2">
              <div className="tech-card">
                <div className="feature-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="feature-content">
                  <h3>安全可靠</h3>
                  <p>
                    所有资源经过严格筛选和安全检测，采用多重加密技术，
                    确保您的设备和数据安全无忧。
                  </p>
                </div>
              </div>
              
              <div className="tech-card">
                <div className="feature-icon">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <div className="feature-content">
                  <h3>极速下载</h3>
                  <p>
                    基于全球CDN网络和智能加速技术，提供毫秒级响应速度，
                    让您享受闪电般的下载体验。
                  </p>
                </div>
              </div>
              
              <div className="tech-card">
                <div className="feature-icon">
                  <i className="bi bi-cpu"></i>
                </div>
                <div className="feature-content">
                  <h3>智能推荐</h3>
                  <p>
                    运用AI算法分析用户偏好，智能推荐最适合的资源，
                    让您快速找到所需的工具和软件。
                  </p>
                </div>
              </div>
              
              <div className="tech-card">
                <div className="feature-icon">
                  <i className="bi bi-cloud-arrow-up"></i>
                </div>
                <div className="feature-content">
                  <h3>云端同步</h3>
                  <p>
                    支持多设备云端同步，随时随地访问您的下载历史和收藏，
                    无缝切换不同设备使用体验。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 技术栈展示 */}
          <section className="tech-stack-section">
            <h2>技术架构</h2>
            <p>采用现代化技术栈，构建高性能、高可用的下载平台</p>
            <div className="grid grid-3">
              <div className="tech-card">
                <div className="tech-icon">
                  <i className="bi bi-cloud"></i>
                </div>
                <h3>Cloudflare Workers</h3>
                <p>边缘计算平台，全球部署，毫秒级响应</p>
              </div>
              
              <div className="tech-card">
                <div className="tech-icon">
                  <i className="bi bi-database"></i>
                </div>
                <h3>D1 Database</h3>
                <p>分布式数据库，高并发处理，数据安全可靠</p>
              </div>
              
              <div className="tech-card">
                <div className="tech-icon">
                  <i className="bi bi-code-square"></i>
                </div>
                <h3>React + Hono.js</h3>
                <p>现代化前后端框架，极致性能与用户体验</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <i className="bi bi-box-seam"></i>
                Noah Box
              </div>
              <p>精品资源下载平台</p>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>快速链接</h4>
                <ul>
                  <li><a href="/downloads.html">资源下载</a></li>
                  <li><a href="/admin.html">管理后台</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>技术支持</h4>
                <ul>
                  <li><a href="#features">功能特性</a></li>
                  <li><a href="#tech-stack">技术架构</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Noah Box. 采用现代化技术构建.</p>
            <div className="status-indicator status-online">
              <span className="pulse"></span>
              系统运行正常
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 渲染应用
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<HomePage />);