/**
 * 主题切换组件
 * 提供浅色/深色主题切换功能，支持跟随系统主题
 * 
 * @component
 * @param {Object} props - 组件属性
 * @param {string} [props.className=''] - 自定义CSS类名
 * @returns {JSX.Element} 主题切换组件
 * 
 * @example
 * // 基本使用
 * <ThemeToggle />
 * 
 * // 带自定义样式
 * <ThemeToggle className="custom-theme-toggle" />
 */

import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  // 获取主题相关的状态和方法
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  
  // 控制下拉菜单显示状态
  const [showDropdown, setShowDropdown] = useState(false);

  /**
   * 可用的主题选项配置
   * @type {Array<{key: string, label: string, icon: string}>}
   */
  const themes = [
    { key: 'light', label: '浅色模式', icon: '☀️' },
    { key: 'dark', label: '深色模式', icon: '🌙' },
    { key: 'system', label: '跟随系统', icon: '💻' }
  ];

  // 获取当前主题配置，默认为系统主题
  const currentTheme = themes.find(t => t.key === theme) || themes[2];

  /**
   * 处理主题选择
   * @param {string} themeKey - 主题键值 ('light' | 'dark' | 'system')
   */
  const handleThemeSelect = (themeKey) => {
    switch (themeKey) {
      case 'light':
        setLightTheme();
        break;
      case 'dark':
        setDarkTheme();
        break;
      case 'system':
        setSystemTheme();
        break;
      default:
        console.warn(`Unknown theme key: ${themeKey}`);
    }
    // 关闭下拉菜单
    setShowDropdown(false);
  };

  return (
    <div className={`theme-toggle ${className}`} style={{ position: 'relative' }}>
      {/* 简单切换按钮 */}
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        title={`当前: ${currentTheme.label}`}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          fontSize: '1.2rem',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'var(--bg-tertiary)';
          e.target.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'var(--bg-secondary)';
          e.target.style.transform = 'scale(1)';
        }}
      >
        {theme === 'dark' ? '🌙' : '☀️'}
      </button>

      {/* 高级切换下拉菜单 */}
      <div className="theme-dropdown" style={{ display: 'none' }}>
        <button
          className="theme-dropdown-btn"
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '120px'
          }}
        >
          <span>{currentTheme.icon}</span>
          <span>{currentTheme.label}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>▼</span>
        </button>

        {showDropdown && (
          <div
            className="theme-dropdown-menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.25rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1000,
              minWidth: '150px',
              overflow: 'hidden'
            }}
          >
            {themes.map((themeOption) => (
              <button
                key={themeOption.key}
                onClick={() => handleThemeSelect(themeOption.key)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: 'none',
                  background: theme === themeOption.key ? 'var(--bg-tertiary)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  transition: 'background-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  if (theme !== themeOption.key) {
                    e.target.style.background = 'var(--bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (theme !== themeOption.key) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <span>{themeOption.icon}</span>
                <span>{themeOption.label}</span>
                {theme === themeOption.key && (
                  <span style={{ marginLeft: 'auto', color: 'var(--primary-color)' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;