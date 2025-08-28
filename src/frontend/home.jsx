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
      
      const categoriesResponse = await fetch('/api/categories');
      const categories = await categoriesResponse.json();
      
      const totalDownloads = files.reduce((sum, file) => sum + (file.downloads || 0), 0);
      
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
        <div className="nav-container">
          <div className="nav-brand">
            <div className="brand-icon">
              <i className="bi bi-box"></i>
            </div>
            <span className="brand-text">Noah Box</span>
          </div>
          <div className="nav-links">
            <a href="/downloads.html" className="nav-link">
              <i className="bi bi-download"></i>
              资源下载
            </a>
            <a href="/admin.html" className="nav-link">
              <i className="bi bi-gear"></i>
              管理后台
            </a>
            <a href="/downloads.html" className="nav-link primary">
              <i className="bi bi-arrow-right"></i>
              开始使用
            </a>
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            欢迎来到 Noah Box
          </h1>
          <p className="hero-subtitle">
            精心策划的优质资源下载平台，为您提供安全、快速、便捷的下载体验
          </p>
          <div className="hero-buttons">
            <a href="/downloads.html" className="btn btn-primary">
              <i className="bi bi-download"></i>
              开始下载
            </a>
            <a href="#features" className="btn btn-secondary">
              <i className="bi bi-info-circle"></i>
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* 特性区域 */}
      <section id="features" className="features-section">
        <div className="features-content">
          <h2 className="features-title">为什么选择 Noah Box？</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-shield-check"></i>
              </div>
              <h3 className="feature-title">安全可靠</h3>
              <p className="feature-description">
                所有资源经过严格筛选和安全检测，确保您的设备安全无忧
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-lightning"></i>
              </div>
              <h3 className="feature-title">极速下载</h3>
              <p className="feature-description">
                采用CDN加速技术，提供稳定快速的下载体验，节省您的宝贵时间
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-collection"></i>
              </div>
              <h3 className="feature-title">丰富资源</h3>
              <p className="feature-description">
                涵盖软件、游戏、文档等多种类型，满足您的不同需求
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="bi bi-people"></i>
              </div>
              <h3 className="feature-title">用户友好</h3>
              <p className="feature-description">
                简洁直观的界面设计，让每个人都能轻松找到所需资源
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 统计区域 */}
      <section className="stats-section">
        <div className="stats-content">
          <h2 className="stats-title">平台数据</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-files"></i>
              </div>
              <div className="stat-number">{stats.totalFiles}</div>
              <div className="stat-label">资源总数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-tags"></i>
              </div>
              <div className="stat-number">{stats.totalCategories}</div>
              <div className="stat-label">分类数量</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-download"></i>
              </div>
              <div className="stat-number">{stats.totalDownloads}</div>
              <div className="stat-label">下载次数</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="bi bi-people"></i>
              </div>
              <div className="stat-number">1000+</div>
              <div className="stat-label">用户数量</div>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚备案信息 */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <p>&copy; 2025 Noah Box. All rights reserved.</p>
            <p>
              <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
                皖ICP备-2025092209号
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<HomePage />);