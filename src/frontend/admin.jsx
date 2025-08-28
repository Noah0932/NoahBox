import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

// 主题切换组件
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return 'bi-moon-fill';
      case 'system': return 'bi-circle-half';
      default: return 'bi-sun-fill';
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'dark': return '深色';
      case 'system': return '系统';
      default: return '浅色';
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle-btn"
      title={`当前主题: ${getThemeText()}`}
    >
      <i className={getThemeIcon()}></i>
      <span>{getThemeText()}</span>
    </button>
  );
}

// 密码修改模态框组件
function PasswordModal({ isOpen, onClose, sessionId }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      setError('请输入当前密码');
      return false;
    }
    if (!formData.newPassword) {
      setError('请输入新密码');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('新密码长度至少6位');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('密码修改成功！3秒后将跳转到登录页面...');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 3000);
      } else {
        setError(result.message || '密码修改失败');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setError('');
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content password-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3><i className="bi bi-key"></i> 修改密码</h3>
          <button className="close-btn" onClick={handleClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="password-form">
          <div className="form-group">
            <label htmlFor="currentPassword">
              <i className="bi bi-lock"></i> 当前密码
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="请输入当前密码"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">
              <i className="bi bi-key"></i> 新密码
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="请输入新密码（至少6位）"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <i className="bi bi-check-circle"></i> 确认新密码
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="请再次输入新密码"
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle"></i>
              {success}
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn btn-secondary">
              取消
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? (
                <>
                  <i className="bi bi-arrow-repeat spin"></i>
                  修改中...
                </>
              ) : (
                <>
                  <i className="bi bi-check"></i>
                  确认修改
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 主管理应用组件
function AdminApp() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [stats, setStats] = useState({ total: 0, categories: {} });
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);
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
    const storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      window.location.href = '/login.html';
      return;
    }

    try {
      const response = await fetch('/api/auth/status', {
        headers: { 'X-Session-ID': storedSessionId }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.authenticated) {
          setSessionId(storedSessionId);
        } else {
          localStorage.removeItem('sessionId');
          window.location.href = '/login.html';
        }
      } else {
        localStorage.removeItem('sessionId');
        window.location.href = '/login.html';
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login.html';
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data);
      
      // 计算统计信息
      const stats = {
        total: data.length,
        categories: {}
      };
      
      data.forEach(file => {
        const category = file.category || 'uncategorized';
        stats.categories[category] = (stats.categories[category] || 0) + 1;
      });
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'X-Session-ID': sessionId }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('sessionId');
      window.location.href = '/login.html';
    }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': sessionId
        },
        body: JSON.stringify({
          ...formData,
          size: parseInt(formData.size) || 0
        })
      });

      if (response.ok) {
        setFormData({
          name: '',
          description: '',
          url: '',
          category: '',
          size: '',
          version: ''
        });
        setShowAddForm(false);
        fetchFiles();
      }
    } catch (error) {
      console.error('Failed to add file:', error);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!confirm('确定要删除这个文件吗？')) return;
    
    try {
      const response = await fetch(`/api/files/${id}`, {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId }
      });

      if (response.ok) {
        fetchFiles();
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const renderDashboard = () => (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2><i className="bi bi-speedometer2"></i> 仪表板</h2>
        <p>系统概览和统计信息</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-files"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>总文件数</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-tags"></i>
          </div>
          <div className="stat-content">
            <h3>{Object.keys(stats.categories).length}</h3>
            <p>分类数量</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="bi bi-download"></i>
          </div>
          <div className="stat-content">
            <h3>{files.reduce((sum, file) => sum + (file.downloads || 0), 0)}</h3>
            <p>总下载次数</p>
          </div>
        </div>
      </div>

      <div className="categories-overview">
        <h3>分类统计</h3>
        <div className="category-list">
          {Object.entries(stats.categories).map(([category, count]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <span className="category-count">{count} 个文件</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFileManagement = () => (
    <div className="file-management">
      <div className="section-header">
        <h2><i className="bi bi-folder"></i> 文件管理</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="bi bi-plus"></i> 添加文件
        </button>
      </div>

      {showAddForm && (
        <div className="add-form-container">
          <form onSubmit={handleAddFile} className="add-form">
            <h3>添加新文件</h3>
            <div className="form-grid">
              <input
                type="text"
                placeholder="文件名称"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="分类"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
              <input
                type="url"
                placeholder="下载链接"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                required
              />
              <input
                type="number"
                placeholder="文件大小 (字节)"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
              />
            </div>
            <textarea
              placeholder="文件描述"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
            <div className="form-actions">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">
                取消
              </button>
              <button type="submit" className="btn btn-primary">
                添加文件
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="files-table">
        <table>
          <thead>
            <tr>
              <th>名称</th>
              <th>分类</th>
              <th>大小</th>
              <th>下载次数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    {file.description && <p>{file.description}</p>}
                  </div>
                </td>
                <td>
                  <span className="category-tag">{file.category || 'uncategorized'}</span>
                </td>
                <td>{file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}</td>
                <td>{file.downloads || 0}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="settings">
      <div className="section-header">
        <h2><i className="bi bi-gear"></i> 系统设置</h2>
      </div>
      
      <div className="settings-grid">
        <div className="setting-card">
          <div className="setting-icon">
            <i className="bi bi-key"></i>
          </div>
          <div className="setting-content">
            <h3>密码管理</h3>
            <p>修改管理员登录密码</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowPasswordModal(true)}
            >
              <i className="bi bi-key"></i> 修改密码
            </button>
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-icon">
            <i className="bi bi-palette"></i>
          </div>
          <div className="setting-content">
            <h3>主题设置</h3>
            <p>切换界面主题模式</p>
            <ThemeToggle />
          </div>
        </div>

        <div className="setting-card">
          <div className="setting-icon">
            <i className="bi bi-database"></i>
          </div>
          <div className="setting-content">
            <h3>数据管理</h3>
            <p>数据库维护和备份</p>
            <button className="btn btn-secondary" disabled>
              <i className="bi bi-download"></i> 导出数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-repeat spin"></i>
        </div>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* 侧边栏 */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2><i className="bi bi-speedometer2"></i> Noah Box</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <i className="bi bi-speedometer2"></i>
            <span>仪表板</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'files' ? 'active' : ''}`}
            onClick={() => setActiveSection('files')}
          >
            <i className="bi bi-folder"></i>
            <span>文件管理</span>
          </button>
          
          <button 
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <i className="bi bi-gear"></i>
            <span>系统设置</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main-content">
        <header className="main-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>
          
          <div className="header-actions">
            <ThemeToggle />
            <button className="btn btn-outline" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              退出
            </button>
          </div>
        </header>

        <div className="content-area">
          {activeSection === 'dashboard' && renderDashboard()}
          {activeSection === 'files' && renderFileManagement()}
          {activeSection === 'settings' && renderSettings()}
        </div>
      </main>

      {/* 密码修改模态框 */}
      <PasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        sessionId={sessionId}
      />
    </div>
  );
}

// 渲染应用
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AdminApp />);