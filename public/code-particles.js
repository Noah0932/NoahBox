// 代码粒子背景效果 - 参考 cnb.cool 风格
class CodeParticleSystem {
  constructor() {
    this.particles = [];
    this.codeElements = [
      // HTML/JSX 元素
      '<div>', '</div>', '<span>', '</span>', '<h1>', '</h1>',
      // JavaScript 关键字
      'const', 'let', 'var', 'function', 'return', 'if', 'else',
      // 符号和操作符
      '{', '}', '(', ')', '[', ']', '=>', '===', '!==', '&&', '||',
      // 代码片段
      'import', 'export', 'from', 'class', 'extends', 'async', 'await',
      // 特殊符号
      '#', '*', '+', '-', '/', '%', '=', '?', ':', ';',
      // 数字和字符串
      '0', '1', '42', '100', '"hello"', "'world'", '`template`',
      // CSS 相关
      '.class', '#id', 'px', 'rem', 'vh', 'vw', 'flex', 'grid',
      // 其他编程元素
      'null', 'undefined', 'true', 'false', 'NaN', 'Infinity'
    ];
    
    this.colors = [
      'orange', 'blue', 'green', 'purple', 'yellow', 'cyan'
    ];
    
    this.init();
  }

  init() {
    this.createContainer();
    this.createParticles();
    this.startAnimation();
    
    // 监听主题变化
    window.addEventListener('themeChanged', () => {
      this.updateParticleColors();
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.handleResize();
    });
  }

  createContainer() {
    // 检查是否已存在容器
    let container = document.querySelector('.code-particles');
    if (!container) {
      container = document.createElement('div');
      container.className = 'code-particles';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  createParticles() {
    const particleCount = Math.min(50, Math.max(20, Math.floor(window.innerWidth / 30)));
    
    for (let i = 0; i < particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement('div');
    particle.className = 'code-particle';
    
    // 随机选择代码元素和颜色
    const codeElement = this.codeElements[Math.floor(Math.random() * this.codeElements.length)];
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    
    particle.textContent = codeElement;
    particle.classList.add(color);
    
    // 设置随机位置和大小
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight + Math.random() * 200;
    const size = Math.random() * 0.8 + 0.6; // 0.6 - 1.4em
    const duration = Math.random() * 15 + 15; // 15-30秒
    const delay = Math.random() * 5; // 0-5秒延迟
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.fontSize = size + 'em';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';
    
    // 添加随机的水平漂移
    const drift = (Math.random() - 0.5) * 200;
    particle.style.setProperty('--drift', drift + 'px');
    
    this.container.appendChild(particle);
    this.particles.push({
      element: particle,
      x: x,
      y: y,
      duration: duration,
      delay: delay
    });
  }

  startAnimation() {
    // 定期添加新粒子
    setInterval(() => {
      this.addNewParticle();
    }, 2000);
    
    // 清理过期粒子
    setInterval(() => {
      this.cleanupParticles();
    }, 5000);
  }

  addNewParticle() {
    // 限制粒子数量
    if (this.particles.length < 60) {
      this.createParticle();
    }
  }

  cleanupParticles() {
    this.particles = this.particles.filter(particle => {
      const rect = particle.element.getBoundingClientRect();
      if (rect.bottom < -100) {
        particle.element.remove();
        return false;
      }
      return true;
    });
  }

  updateParticleColors() {
    // 主题切换时更新粒子颜色
    this.particles.forEach(particle => {
      const currentColor = this.colors.find(color => 
        particle.element.classList.contains(color)
      );
      if (currentColor) {
        particle.element.classList.remove(currentColor);
        const newColor = this.colors[Math.floor(Math.random() * this.colors.length)];
        particle.element.classList.add(newColor);
      }
    });
  }

  handleResize() {
    // 窗口大小变化时调整粒子
    const targetCount = Math.min(50, Math.max(20, Math.floor(window.innerWidth / 30)));
    const currentCount = this.particles.length;
    
    if (currentCount < targetCount) {
      // 添加粒子
      for (let i = 0; i < targetCount - currentCount; i++) {
        this.createParticle();
      }
    } else if (currentCount > targetCount) {
      // 移除多余粒子
      const excess = currentCount - targetCount;
      for (let i = 0; i < excess; i++) {
        const particle = this.particles.pop();
        if (particle) {
          particle.element.remove();
        }
      }
    }
  }

  // 暂停动画
  pause() {
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'paused';
    });
  }

  // 恢复动画
  resume() {
    this.particles.forEach(particle => {
      particle.element.style.animationPlayState = 'running';
    });
  }

  // 销毁粒子系统
  destroy() {
    this.particles.forEach(particle => {
      particle.element.remove();
    });
    this.particles = [];
    if (this.container) {
      this.container.remove();
    }
  }
}

// 增强的主题切换器 - 代码风格
class CodeThemeSwitcher {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    this.setTheme(this.currentTheme);
    this.createThemeToggle();
    this.watchSystemTheme();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
    
    this.updateToggleButton();
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.addTransitionEffect();
  }

  createThemeToggle() {
    let toggleButton = document.querySelector('.theme-toggle');
    
    if (!toggleButton) {
      toggleButton = document.createElement('button');
      toggleButton.className = 'theme-toggle';
      toggleButton.setAttribute('aria-label', '切换主题');
      
      const navbar = document.querySelector('.navbar-content');
      if (navbar) {
        navbar.appendChild(toggleButton);
      } else {
        document.body.appendChild(toggleButton);
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.zIndex = '1000';
      }
    }
    
    toggleButton.addEventListener('click', () => this.toggleTheme());
    this.updateToggleButton();
  }

  updateToggleButton() {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;
    
    const isDark = this.currentTheme === 'dark';
    toggleButton.innerHTML = `
      <i class="bi bi-${isDark ? 'sun' : 'moon'}"></i>
      <span>"${isDark ? 'light' : 'dark'}"</span>
    `;
  }

  addTransitionEffect() {
    document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme-manual')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}

// 代码打字机效果
class CodeTypewriter {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = texts;
    this.options = {
      typeSpeed: 100,
      deleteSpeed: 50,
      pauseTime: 2000,
      loop: true,
      ...options
    };
    
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    
    this.init();
  }

  init() {
    if (this.element) {
      this.type();
    }
  }

  type() {
    const currentText = this.texts[this.currentTextIndex];
    
    if (this.isDeleting) {
      this.currentCharIndex--;
    } else {
      this.currentCharIndex++;
    }
    
    this.element.textContent = currentText.substring(0, this.currentCharIndex);
    
    let typeSpeed = this.isDeleting ? this.options.deleteSpeed : this.options.typeSpeed;
    
    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      typeSpeed = this.options.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
    }
    
    setTimeout(() => this.type(), typeSpeed);
  }
}

// 初始化所有效果
document.addEventListener('DOMContentLoaded', () => {
  // 初始化主题切换器
  window.codeTheme = new CodeThemeSwitcher();
  
  // 初始化粒子系统
  window.codeParticles = new CodeParticleSystem();
  
  // 初始化打字机效果（如果存在目标元素）
  const typewriterElement = document.querySelector('.typewriter');
  if (typewriterElement) {
    window.codeTypewriter = new CodeTypewriter(typewriterElement, [
      'Noah Box',
      'Download Station',
      'Code Repository',
      'Resource Hub'
    ]);
  }
  
  // 页面可见性变化时暂停/恢复动画
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.codeParticles?.pause();
    } else {
      window.codeParticles?.resume();
    }
  });
});

// 导出供其他脚本使用
window.CodeParticleSystem = CodeParticleSystem;
window.CodeThemeSwitcher = CodeThemeSwitcher;
window.CodeTypewriter = CodeTypewriter;