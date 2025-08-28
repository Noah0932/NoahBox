import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function DownloadsPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data);
      
      // 提取分类
      const uniqueCategories = [...new Set(data.map(file => file.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId, url) => {
    try {
      // 更新下载计数
      await fetch(`/api/files/${fileId}/download`, { method: 'POST' });
      
      // 打开下载链接
      window.open(url, '_blank');
      
      // 刷新文件列表以更新下载计数
      fetchFiles();
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  // 过滤文件
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取文件图标
  const getFileIcon = (type, category) => {
    if (type) {
      if (type.includes('image')) return 'bi-image';
      if (type.includes('video')) return 'bi-play-circle';
      if (type.includes('audio')) return 'bi-music-note';
      if (type.includes('pdf')) return 'bi-file-pdf';
      if (type.includes('zip') || type.includes('rar')) return 'bi-file-zip';
    }
    
    switch (category?.toLowerCase()) {
      case 'software': return 'bi-app';
      case 'game': return 'bi-controller';
      case 'document': return 'bi-file-text';
      case 'media': return 'bi-camera-video';
      default: return 'bi-file-earmark';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <div className="downloads-page">
      {/* 导航栏 */}
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <a href="/" className="logo">
              <i className="bi bi-box-seam"></i>
              Noah Box
            </a>
            <div className="nav-actions">
              <a href="/" className="btn btn-secondary">
                <i className="bi bi-house"></i>
                首页
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
          {/* 页面标题 */}
          <section className="page-header">
            <h1>
              <i className="bi bi-download"></i>
              资源下载中心
            </h1>
            <p>探索精心策划的优质资源，享受极速下载体验</p>
          </section>

          {/* 搜索和筛选 */}
          <section className="search-section">
            <div className="search-controls">
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="搜索资源..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="category-filter">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">全部分类</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="search-stats">
              <span className="stats-text">
                找到 <strong>{filteredFiles.length}</strong> 个资源
              </span>
            </div>
          </section>

          {/* 文件列表 */}
          <section className="files-section">
            {loading ? (
              <div className="loading-container">
                <div className="loading">
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <p>正在加载资源...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-inbox"></i>
                </div>
                <h3>暂无资源</h3>
                <p>没有找到匹配的资源，请尝试其他搜索条件</p>
              </div>
            ) : (
              <div className="file-grid">
                {filteredFiles.map(file => (
                  <div key={file.id} className="file-card">
                    <div className="file-header">
                      <div className="file-icon">
                        <i className={getFileIcon(file.type, file.category)}></i>
                      </div>
                      <div className="file-category">
                        {file.category || 'uncategorized'}
                      </div>
                    </div>
                    
                    <div className="file-content">
                      <h3 className="file-title">{file.name}</h3>
                      {file.description && (
                        <p className="file-description">{file.description}</p>
                      )}
                    </div>
                    
                    <div className="file-meta">
                      <div className="meta-item">
                        <i className="bi bi-hdd"></i>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="meta-item">
                        <i className="bi bi-download"></i>
                        <span>{file.downloads || 0} 次</span>
                      </div>
                    </div>
                    
                    <div className="file-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleDownload(file.id, file.url)}
                      >
                        <i className="bi bi-download"></i>
                        立即下载
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 下载统计 */}
          <section className="download-stats">
            <div className="grid grid-3">
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-files"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{files.length}</h3>
                  <p className="stat-label">总资源数</p>
                </div>
              </div>
              
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-collection"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">{categories.length}</h3>
                  <p className="stat-label">资源分类</p>
                </div>
              </div>
              
              <div className="tech-card">
                <div className="stat-icon">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="stat-content">
                  <h3 className="stat-number">
                    {files.reduce((sum, file) => sum + (file.downloads || 0), 0)}
                  </h3>
                  <p className="stat-label">总下载量</p>
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
                <i className="bi bi-box-seam"></i>
                Noah Box
              </div>
              <p>精品资源下载平台</p>
            </div>
            <div className="footer-info">
              <div className="status-indicator status-online">
                <span className="pulse"></span>
                下载服务正常运行
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Noah Box. 采用现代化技术构建.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 渲染应用
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<DownloadsPage />);