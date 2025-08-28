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
              <span className="logo-text">Noah Box</span>
            </a>
            <div className="nav-actions">
              <a href="/downloads.html" className="btn btn-secondary">
                <i className="bi bi-download"></i>
                <span>downloads</span>
              </a>
              <a href="/admin.html" className="btn btn-secondary">
                <i className="bi bi-gear"></i>
                <span>admin</span>
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
              <span className="keyword">const</span>{' '}
              <span className="variable">everything</span>{' '}
              <span className="code-highlight">=</span>{' '}
              <span className="string">"Noah Box"</span>
              <br />
              <span className="keyword">as</span>{' '}
              <span className="variable">Code</span>
            </h1>
            <div className="code-block">
              <div className="code-line">
                <span className="comment">// 一切皆代码</span>
              </div>
              <div className="code-line">
                <span className="keyword">function</span> <span className="variable">downloadResource</span>() {'{'}
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="keyword">return</span> <span className="string">"精品资源下载平台"</span>;
              </div>
              <div className="code-line">
                {'}'}
              </div>
            </div>
            <p>
              发现、下载、分享优质资源。采用现代化技术架构，
              为开发者和创作者提供极致的资源管理体验。
            </p>
            <div className="hero-actions">
              <a href="/downloads.html" className="btn btn-primary">
                <i className="bi bi-play-fill"></i>
                <span>start()</span>
              </a>
              <a href="#features" className="btn btn-secondary">
                <i className="bi bi-info-circle"></i>
                <span>docs</span>
              </a>
            </div>
          </section>

          {/* 统计数据 */}
          <section className="stats-section">
            <div className="grid grid-3">
              <div className="code-card">
                <div className="code-header">
                  <span className="keyword">const</span> <span className="variable">files</span> <span className="code-highlight">=</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalFiles}</h3>
                  <p className="stat-label">// 精品资源</p>
                </div>
              </div>
              <div className="code-card">
                <div className="code-header">
                  <span className="keyword">const</span> <span className="variable">categories</span> <span className="code-highlight">=</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalCategories}</h3>
                  <p className="stat-label">// 资源分类</p>
                </div>
              </div>
              <div className="code-card">
                <div className="code-header">
                  <span className="keyword">const</span> <span className="variable">downloads</span> <span className="code-highlight">=</span>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{stats.totalDownloads}</h3>
                  <p className="stat-label">// 下载次数</p>
                </div>
              </div>
            </div>
          </section>

          {/* 特性区域 */}
          <section id="features" className="features-section">
            <h2>
              <span className="comment">/* 为什么选择 Noah Box? */</span>
            </h2>
            <div className="grid grid-2">
              <div className="code-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className="bi bi-shield-check"></i>
                  </div>
                  <div className="code-title">
                    <span className="keyword">class</span> <span className="variable">Security</span> {'{'}
                  </div>
                </div>
                <div className="feature-content">
                  <h3>安全可靠</h3>
                  <div className="code-snippet">
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="keyword">validate</span>() {'{'}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="string">"多重安全检测"</span>;
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;{'}'}
                    </div>
                  </div>
                  <p>
                    所有资源经过严格筛选和安全检测，采用多重加密技术，
                    确保您的设备和数据安全无忧。
                  </p>
                </div>
              </div>
              
              <div className="code-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className="bi bi-lightning-charge"></i>
                  </div>
                  <div className="code-title">
                    <span className="keyword">class</span> <span className="variable">Performance</span> {'{'}
                  </div>
                </div>
                <div className="feature-content">
                  <h3>极速下载</h3>
                  <div className="code-snippet">
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="keyword">async</span> <span className="variable">download</span>() {'{'}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="keyword">await</span> <span className="variable">cdn</span>.<span className="variable">accelerate</span>();
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;{'}'}
                    </div>
                  </div>
                  <p>
                    基于全球CDN网络和智能加速技术，提供毫秒级响应速度，
                    让您享受闪电般的下载体验。
                  </p>
                </div>
              </div>
              
              <div className="code-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className="bi bi-cpu"></i>
                  </div>
                  <div className="code-title">
                    <span className="keyword">class</span> <span className="variable">AI</span> {'{'}
                  </div>
                </div>
                <div className="feature-content">
                  <h3>智能推荐</h3>
                  <div className="code-snippet">
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="variable">recommend</span>(<span className="variable">user</span>) {'{'}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="variable">ml</span>.<span className="variable">analyze</span>(<span className="variable">preferences</span>);
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;{'}'}
                    </div>
                  </div>
                  <p>
                    运用AI算法分析用户偏好，智能推荐最适合的资源，
                    让您快速找到所需的工具和软件。
                  </p>
                </div>
              </div>
              
              <div className="code-card">
                <div className="feature-header">
                  <div className="feature-icon">
                    <i className="bi bi-cloud-arrow-up"></i>
                  </div>
                  <div className="code-title">
                    <span className="keyword">class</span> <span className="variable">Cloud</span> {'{'}
                  </div>
                </div>
                <div className="feature-content">
                  <h3>云端同步</h3>
                  <div className="code-snippet">
                    <div className="code-line">
                      &nbsp;&nbsp;<span className="variable">sync</span>() {'{'}
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="keyword">return</span> <span className="variable">cloud</span>.<span className="variable">realtime</span>();
                    </div>
                    <div className="code-line">
                      &nbsp;&nbsp;{'}'}
                    </div>
                  </div>
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
            <h2>
              <span className="comment">/* 技术架构 */</span>
            </h2>
            <p>采用现代化技术栈，构建高性能、高可用的下载平台</p>
            <div className="grid grid-3">
              <div className="code-card">
                <div className="tech-header">
                  <div className="tech-icon">
                    <i className="bi bi-cloud"></i>
                  </div>
                  <span className="keyword">import</span> <span className="variable">Workers</span>
                </div>
                <h3>Cloudflare Workers</h3>
                <div className="code-snippet">
                  <div className="code-line">
                    <span className="comment">// 边缘计算平台</span>
                  </div>
                  <div className="code-line">
                    <span className="variable">response</span>.<span className="variable">time</span> <span className="code-highlight">&lt;</span> <span className="string">"1ms"</span>
                  </div>
                </div>
              </div>
              
              <div className="code-card">
                <div className="tech-header">
                  <div className="tech-icon">
                    <i className="bi bi-database"></i>
                  </div>
                  <span className="keyword">import</span> <span className="variable">D1</span>
                </div>
                <h3>D1 Database</h3>
                <div className="code-snippet">
                  <div className="code-line">
                    <span className="comment">// 分布式数据库</span>
                  </div>
                  <div className="code-line">
                    <span className="variable">db</span>.<span className="variable">concurrent</span> <span className="code-highlight">=</span> <span className="string">"∞"</span>
                  </div>
                </div>
              </div>
              
              <div className="code-card">
                <div className="tech-header">
                  <div className="tech-icon">
                    <i className="bi bi-code-square"></i>
                  </div>
                  <span className="keyword">import</span> <span className="variable">React</span>
                </div>
                <h3>React + Hono.js</h3>
                <div className="code-snippet">
                  <div className="code-line">
                    <span className="comment">// 现代化框架</span>
                  </div>
                  <div className="code-line">
                    <span className="variable">performance</span> <span className="code-highlight">=</span> <span className="string">"极致"</span>
                  </div>
                </div>
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
                <span className="logo-text">Noah Box</span>
              </div>
              <div className="code-snippet">
                <div className="code-line">
                  <span className="comment">// 精品资源下载平台</span>
                </div>
                <div className="code-line">
                  <span className="keyword">export</span> <span className="keyword">default</span> <span className="variable">NoahBox</span>;
                </div>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-section">
                <h4>
                  <span className="keyword">const</span> <span className="variable">links</span> <span className="code-highlight">=</span> [
                </h4>
                <ul>
                  <li><a href="/downloads.html">"资源下载"</a></li>
                  <li><a href="/admin.html">"管理后台"</a></li>
                </ul>
                <span>];</span>
              </div>
              <div className="footer-section">
                <h4>
                  <span className="keyword">const</span> <span className="variable">support</span> <span className="code-highlight">=</span> [
                </h4>
                <ul>
                  <li><a href="#features">"功能特性"</a></li>
                  <li><a href="#tech-stack">"技术架构"</a></li>
                </ul>
                <span>];</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="code-line">
              <span className="comment">/* &copy; 2024 Noah Box. 采用现代化技术构建. */</span>
            </div>
            <div className="status-indicator status-online">
              <span className="pulse"></span>
              <span className="keyword">status</span>: <span className="string">"online"</span>
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