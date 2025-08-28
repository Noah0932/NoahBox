import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/themes.css';

const Home = () => {
  return (
    <div className="home-page" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* 导航栏 */}
      <nav style={{
        padding: '1rem 2rem',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--gradient-primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              📦
            </div>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Download Station
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/downloads" className="btn btn-primary">
              浏览下载
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* 英雄区域 */}
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: `
          radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          var(--bg-primary)
        `
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3.5rem',
            fontWeight: '800',
            marginBottom: '1.5rem',
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2'
          }}>
            现代化的资源下载站
          </h2>
          
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem',
            lineHeight: '1.6'
          }}>
            基于边缘计算技术构建，提供快速、安全、美观的文件下载体验。
            支持多平台部署，完美适配浅色和深色主题。
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/downloads" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              🚀 开始下载
            </Link>
            <Link to="/admin" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
              ⚙️ 管理后台
            </Link>
          </div>
        </div>
      </section>

      {/* 特性展示 */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-secondary)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '3rem',
            color: 'var(--text-primary)'
          }}>
            ✨ 核心特性
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '⚡',
                title: '边缘计算加速',
                desc: '基于 EdgeOne Pages 和边缘函数，全球加速访问'
              },
              {
                icon: '🎨',
                title: '现代化设计',
                desc: '支持浅色/深色主题，响应式设计，完美适配各种设备'
              },
              {
                icon: '🔐',
                title: '安全可靠',
                desc: '完善的权限管理，安全的文件存储和传输'
              },
              {
                icon: '📊',
                title: '实时统计',
                desc: '下载次数统计，分类管理，数据可视化'
              },
              {
                icon: '🔍',
                title: '智能搜索',
                desc: '支持实时搜索和分类筛选，快速找到所需资源'
              },
              {
                icon: '🚀',
                title: '一键部署',
                desc: '支持多平台部署，配置简单，维护方便'
              }
            ].map((feature, index) => (
              <div key={index} className="card" style={{
                padding: '2rem',
                textAlign: 'center',
                background: 'var(--bg-card)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {feature.icon}
                </div>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术栈 */}
      <section style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '3rem',
            color: 'var(--text-primary)'
          }}>
            🛠️ 技术栈
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem'
          }}>
            {[
              { name: 'React 18', desc: '现代化前端框架' },
              { name: 'EdgeOne Pages', desc: '前端静态部署' },
              { name: 'Edge Functions', desc: '边缘计算后端' },
              { name: 'D1 Database', desc: 'SQLite 云数据库' },
              { name: 'Vite', desc: '快速构建工具' },
              { name: 'CSS Variables', desc: '主题系统' }
            ].map((tech, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                transition: 'all var(--transition-normal)'
              }}>
                <h5 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  {tech.name}
                </h5>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer style={{
        padding: '2rem',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '1rem'
          }}>
            © 2025 Download Station. 基于 MIT 许可证开源.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <a href="https://github.com/your-username/download-station" 
               style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              📚 文档
            </a>
            <a href="https://github.com/your-username/download-station/issues" 
               style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              🐛 反馈
            </a>
            <a href="https://github.com/your-username/download-station" 
               style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ⭐ GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;