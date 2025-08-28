import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

function AdminPanel() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [stats, setStats] = useState({ total: 0, categories: {} });
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: '',
    size: '',
    version: ''
  });

  useEffect(() => {
    checkAuth();
    fetchFiles();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const response = await fetch('/api/auth/status', {
        headers: {
          'X-Session-ID': sessionId
        }
      });
      if (!response.ok) {
        window.location.href = '/login.html';
      }
    } catch (error) {
      window.location.href = '/login.html';
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data);
      
      // 计算统计数据
      const categories = {};
      data.forEach(file => {
        categories[file.category] = (categories[file.category] || 0) + 1;
      });
      setStats({ total: data.length, categories });
    } catch (error) {
      console.error('获取文件列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingFile ? `/api/files/${editingFile.id}` : '/api/files';
      const method = editingFile ? 'PUT' : 'POST';
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFiles();
        resetForm();
        showNotification(editingFile ? '资源更新成功！' : '资源添加成功！', 'success');
      } else {
        showNotification('操作失败！', 'error');
      }
    } catch (error) {
      console.error('提交失败:', error);
      showNotification('操作失败！', 'error');
    }
  };

  const handleEdit = (file) => {
    setEditingFile(file);
    setFormData({
      name: file.name,
      description: file.description,
      url: file.url,
      category: file.category,
      size: file.size,
      version: file.version
    });
    setShowAddForm(true);
    setActiveSection('add');
  };

  const handleDelete = async (id) => {
    if (confirm('确定要删除这个资源吗？')) {
      try {
        const sessionId = localStorage.getItem('sessionId');
        const response = await fetch(`/api/files/${id}`, {
          method: 'DELETE',
          headers: {
            'X-Session-ID': sessionId
          }
        });

        if (response.ok) {
          fetchFiles();
          showNotification('资源删除成功！', 'success');
        } else {
          showNotification('删除失败！', 'error');
        }
      } catch (error) {
        console.error('删除失败:', error);
        showNotification('删除失败！', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      url: '',
      category: '',
      size: '',
      version: ''
    });
    setShowAddForm(false);
    setEditingFile(null);
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      await fetch('/api/logout', { 
        method: 'POST',
        headers: {
          'X-Session-ID': sessionId
        }
      });
      localStorage.removeItem('sessionId');
      window.location.href = '/login.html';
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : 'danger'} position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; padding: 1rem; border-radius: 12px; background: var(--bg-glass); backdrop-filter: blur(20px); border: 1px solid var(--border-color); color: var(--text-primary);';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const renderDashboard = () => (
    <div className="fade-in">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="bi bi-speedometer2"></i>
            仪表板概览
          </h2>
        </div>
        <div className="card-body">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
            <div className="content-card" style={{margin: 0}}>
              <div className="card-body" style={{textAlign: 'center', padding: '1.5rem'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem'}}>
                  {stats.total}
                </div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  总资源数
                </div>
              </div>
            </div>
            <div className="content-card" style={{margin: 0}}>
              <div className="card-body" style={{textAlign: 'center', padding: '1.5rem'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', background: 'var(--success-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem'}}>
                  {Object.keys(stats.categories).length}
                </div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  分类数量
                </div>
              </div>
            </div>
            <div className="content-card" style={{margin: 0}}>
              <div className="card-body" style={{textAlign: 'center', padding: '1.5rem'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', background: 'var(--warning-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem'}}>
                  {stats.categories['软件'] || 0}
                </div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  软件资源
                </div>
              </div>
            </div>
            <div className="content-card" style={{margin: 0}}>
              <div className="card-body" style={{textAlign: 'center', padding: '1.5rem'}}>
                <div style={{fontSize: '2rem', fontWeight: '700', background: 'var(--danger-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '0.5rem'}}>
                  {stats.categories['游戏'] || 0}
                </div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
                  游戏资源
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAddForm = () => (
    <div className="fade-in">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="bi bi-file-earmark-plus"></i>
            {editingFile ? '编辑资源' : '添加新资源'}
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">资源名称</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="输入资源名称"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">资源分类</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">选择分类</option>
                  <option value="软件">💻 软件工具</option>
                  <option value="游戏">🎮 游戏娱乐</option>
                  <option value="文档">📄 文档资料</option>
                  <option value="媒体">🎵 媒体文件</option>
                  <option value="其他">📦 其他资源</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">文件大小</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="例如: 128MB"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">版本信息</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="例如: v2.1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({...formData, version: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">下载链接</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com/download"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">资源描述</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="详细描述这个资源的功能和特点..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              ></textarea>
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-success btn-lg">
                <i className="bi bi-check-circle"></i>
                {editingFile ? '更新资源' : '添加资源'}
              </button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={resetForm}>
                <i className="bi bi-x-circle"></i>
                取消操作
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const renderFilesList = () => (
    <div className="fade-in">
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">
            <i className="bi bi-collection"></i>
            资源管理中心
            <span className="badge badge-primary" style={{marginLeft: '1rem'}}>{files.length} 个资源</span>
          </h2>
        </div>
        <div className="card-body" style={{padding: 0}}>
          {files.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <h3>暂无资源</h3>
              <p>点击侧边栏"添加资源"开始管理您的资源库</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>资源信息</th>
                    <th>分类</th>
                    <th>规格</th>
                    <th>描述</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, index) => (
                    <tr key={file.id} className="fade-in" style={{animationDelay: `${index * 0.05}s`}}>
                      <td>
                        <div>
                          <strong style={{display: 'block'}}>{file.name}</strong>
                          <small style={{color: 'var(--text-muted)'}}>版本 {file.version}</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{file.category}</span>
                      </td>
                      <td>
                        <div className="badge badge-secondary">{file.size}</div>
                      </td>
                      <td>
                        <div style={{maxWidth: '200px'}}>
                          <small style={{color: 'var(--text-muted)'}}>
                            {file.description.length > 60 
                              ? file.description.substring(0, 60) + '...' 
                              : file.description}
                          </small>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleEdit(file)}
                            title="编辑资源"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(file.id)}
                            title="删除资源"
                          >
                            <i className="bi bi-trash3"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="loading-container" style={{width: '100%', minHeight: '100vh'}}>
          <div className="spinner"></div>
          <div className="loading-text">正在加载管理面板...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* 移动端菜单按钮 */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* 侧边栏 */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <i className="bi bi-cloud-download"></i>
            </div>
            <div className="brand-text">
              <h1>资源管理</h1>
              <p>高级控制面板</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-section-title">主要功能</div>
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveSection('dashboard'); setSidebarOpen(false);}}
              >
                <i className="nav-icon bi bi-speedometer2"></i>
                仪表板
              </a>
            </div>
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeSection === 'files' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveSection('files'); setSidebarOpen(false);}}
              >
                <i className="nav-icon bi bi-collection"></i>
                资源管理
              </a>
            </div>
            <div className="nav-item">
              <a 
                href="#" 
                className={`nav-link ${activeSection === 'add' ? 'active' : ''}`}
                onClick={(e) => {e.preventDefault(); setActiveSection('add'); setShowAddForm(true); resetForm(); setSidebarOpen(false);}}
              >
                <i className="nav-icon bi bi-plus-circle"></i>
                添加资源
              </a>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">系统设置</div>
            <div className="nav-item">
              <a href="/change-password.html" className="nav-link">
                <i className="nav-icon bi bi-shield-lock"></i>
                安全设置
              </a>
            </div>
            <div className="nav-item">
              <a href="/" className="nav-link">
                <i className="nav-icon bi bi-house"></i>
                返回首页
              </a>
            </div>
            <div className="nav-item">
              <a 
                href="#" 
                className="nav-link"
                onClick={(e) => {e.preventDefault(); handleLogout();}}
              >
                <i className="nav-icon bi bi-power"></i>
                安全退出
              </a>
            </div>
          </div>
        </nav>

        <div className="sidebar-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">总资源</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{Object.keys(stats.categories).length}</span>
              <span className="stat-label">分类</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.categories['软件'] || 0}</span>
              <span className="stat-label">软件</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.categories['游戏'] || 0}</span>
              <span className="stat-label">游戏</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="main-content">
        <div className="top-bar">
          <div>
            <h1 className="page-title">
              <i className="bi bi-gear-wide-connected"></i>
              {activeSection === 'dashboard' && '仪表板'}
              {activeSection === 'files' && '资源管理'}
              {activeSection === 'add' && (editingFile ? '编辑资源' : '添加资源')}
            </h1>
            <p className="page-subtitle">
              {activeSection === 'dashboard' && '系统概览与统计信息'}
              {activeSection === 'files' && '管理您的所有资源文件'}
              {activeSection === 'add' && '添加或编辑资源信息'}
            </p>
          </div>
          <div className="top-actions">
            <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>
              欢迎回来，管理员
            </span>
          </div>
        </div>

        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'files' && renderFilesList()}
        {activeSection === 'add' && renderAddForm()}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AdminPanel />);