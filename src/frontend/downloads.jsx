import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function DownloadsPage() {
  const [files, setFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [filesRes, categoriesRes] = await Promise.all([
        fetch('/api/files'),
        fetch('/api/categories')
      ]);
      
      const filesData = await filesRes.json();
      const categoriesData = await categoriesRes.json();
      
      setFiles(filesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = async (fileId) => {
    try {
      await fetch(`/api/files/${fileId}/download`, { method: 'POST' });
      // 更新下载次数
      fetchData();
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>正在加载资源...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 顶部导航 */}
      <div className="header">
        <div className="logo">
          <div className="logo-icon">
            <i className="bi bi-box"></i>
          </div>
          Noah Box - 下载中心
        </div>
        <div className="nav-links">
          <a href="/" className="nav-link">
            <i className="bi bi-house"></i> 首页
          </a>
          <a href="/admin.html" className="nav-link">
            <i className="bi bi-gear"></i> 管理
          </a>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <input
          type="text"
          className="search-input"
          placeholder="搜索资源..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 分类标签 */}
      <div className="categories">
        <span
          className={`category-tag ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          全部 ({files.length})
        </span>
        {categories.map(category => (
          <span
            key={category}
            className={`category-tag ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category} ({files.filter(f => f.category === category).length})
          </span>
        ))}
      </div>

      {/* 文件列表 */}
      {filteredFiles.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          <h3>暂无资源</h3>
          <p>没有找到匹配的资源，请尝试其他搜索条件</p>
        </div>
      ) : (
        <div className="files-grid">
          {filteredFiles.map(file => (
            <div key={file.id} className="file-card">
              <div className="file-header">
                <div className="file-icon">
                  <i className="bi bi-file-earmark"></i>
                </div>
                <div className="file-info">
                  <h3>{file.name}</h3>
                  <span className="file-category">{file.category}</span>
                </div>
              </div>
              
              <p className="file-description">{file.description}</p>
              
              <div className="file-meta">
                <span>大小: {file.size || '未知'}</span>
                <span>下载: {file.downloads || 0} 次</span>
              </div>
              
              <button
                className="download-btn"
                onClick={() => handleDownload(file.id)}
              >
                <i className="bi bi-download"></i> 立即下载
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 页脚 */}
      <div className="footer">
        <p>&copy; 2025 Noah Box. All rights reserved.</p>
        <p>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">
            皖ICP备-2025092209号
          </a>
        </p>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<DownloadsPage />);