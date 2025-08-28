import React, { useState, useEffect } from 'react';

/**
 * 主题切换组件
 * 支持浅色/深色/跟随系统三种模式
 */
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 从localStorage读取保存的主题设置
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
      case 'dark':
        return 'bi-moon-fill';
      case 'system':
        return 'bi-circle-half';
      default:
        return 'bi-sun-fill';
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'dark':
        return '深色模式';
      case 'system':
        return '跟随系统';
      default:
        return '浅色模式';
    }
  };

  return (
    <button 
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={`当前: ${getThemeText()}`}
    >
      <i className={`bi ${getThemeIcon()}`}></i>
      <span className="theme-text">{getThemeText()}</span>
    </button>
  );
}

export default ThemeToggle;