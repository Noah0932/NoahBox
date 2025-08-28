import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function DownloadStation() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiles();
    fetchCategories();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesCategory = !selectedCategory || file.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category) => {
    const icons = {
      '软件': '💻',
      '游戏': '🎮',
      '文档': '📄',
      '媒体': '🎵',
      '其他': '📦'
    };
    return icons[category] || '📦';
  };

  const handleDownload = (url, name) => {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="download-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">正在加载资源库...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="download-container fade-in">
      {/* 头部区域 */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <i className="bi bi-cloud-download"></i>
            资源下载站
          </h1>
          <p className="hero-subtitle">精选优质资源，一键快速下载</p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{files.length}</span>
              <span className="stat-label">总资源</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{categories.length}</span>
              <span className="stat-label">分类</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">在线服务</span>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="搜索资源名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filters">
            <button
              className={`filter-btn ${!selectedCategory ? 'active' : ''}`}
              onClick={() => setSelectedCategory('')}
            >
              <i className="bi bi-grid"></i>
              全部
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span className="category-icon">{getCategoryIcon(category)}</span>
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 资源列表 */}
      <div className="resources-section">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>暂无匹配资源</h3>
            <p>尝试调整搜索条件或浏览其他分类</p>
          </div>
        ) : (
          <div className="resources-grid">
            {filteredFiles.map((file, index) => (
              <div key={file.id} className="resource-card fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="card-header">
                  <div className="card-icon">
                    {getCategoryIcon(file.category)}
                  </div>
                  <div className="card-category">
                    <span className="badge badge-primary">{file.category}</span>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{file.name}</h3>
                  <p className="card-description">{file.description}</p>
                  <div className="card-meta">
                    <div className="meta-item">
                      <i className="bi bi-hdd"></i>
                      <span>{file.size}</span>
                    </div>
                    <div className="meta-item">
                      <i className="bi bi-tag"></i>
                      <span>{file.version}</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="download-btn"
                    onClick={() => handleDownload(file.url, file.name)}
                  >
                    <i className="bi bi-download"></i>
                    立即下载
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 页脚 */}
      <div className="footer-section">
        <div className="footer-content">
          <p>&copy; 2024 资源下载站. 所有资源仅供学习交流使用.</p>
          <div className="footer-links">
            <a href="/admin.html" className="footer-link">
              <i className="bi bi-gear"></i>
              管理后台
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<DownloadStation />);