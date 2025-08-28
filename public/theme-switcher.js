// 科技感主题切换器
class TechThemeSwitcher {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    // 设置初始主题
    this.setTheme(this.currentTheme);
    
    // 创建主题切换按钮
    this.createThemeToggle();
    
    // 监听系统主题变化
    this.watchSystemTheme();
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.currentTheme = theme;
    
    // 更新按钮状态
    this.updateToggleButton();
    
    // 触发主题变化事件
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    
    // 添加切换动画
    this.addTransitionEffect();
  }

  createThemeToggle() {
    // 查找现有的主题切换按钮
    let toggleButton = document.querySelector('.theme-toggle');
    
    if (!toggleButton) {
      // 如果不存在，创建新的
      toggleButton = document.createElement('button');
      toggleButton.className = 'theme-toggle';
      toggleButton.setAttribute('aria-label', '切换主题');
      
      // 添加到导航栏
      const navbar = document.querySelector('.navbar-content');
      if (navbar) {
        navbar.appendChild(toggleButton);
      } else {
        // 如果没有导航栏，添加到body
        document.body.appendChild(toggleButton);
        toggleButton.style.position = 'fixed';
        toggleButton.style.top = '20px';
        toggleButton.style.right = '20px';
        toggleButton.style.zIndex = '1000';
      }
    }
    
    // 绑定点击事件
    toggleButton.addEventListener('click', () => this.toggleTheme());
    
    // 初始化按钮内容
    this.updateToggleButton();
  }

  updateToggleButton() {
    const toggleButton = document.querySelector('.theme-toggle');
    if (!toggleButton) return;
    
    const isDark = this.currentTheme === 'dark';
    toggleButton.innerHTML = `
      <i class="bi bi-${isDark ? 'sun' : 'moon'}"></i>
      <span>${isDark ? '浅色' : '深色'}模式</span>
    `;
  }

  addTransitionEffect() {
    // 添加平滑过渡效果
    document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // 移除过渡效果
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  watchSystemTheme() {
    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // 只有在用户没有手动设置主题时才跟随系统
        if (!localStorage.getItem('theme-manual')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }

  // 检查是否为深色主题
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }
}

// 科技感粒子背景效果
class TechParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;
    this.connectionDistance = 150;
    
    this.init();
  }

  init() {
    this.resize();
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('themeChanged', (e) => this.updateColors(e.detail.theme));
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
  }

  updateColors(theme) {
    this.particleColor = theme === 'dark' ? 'rgba(0, 212, 255, 0.6)' : 'rgba(14, 165, 233, 0.6)';
    this.lineColor = theme === 'dark' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(14, 165, 233, 0.2)';
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // 更新粒子位置
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 边界检测
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
    });
    
    // 绘制粒子和连线
    this.drawParticles();
    this.drawConnections();
    
    requestAnimationFrame(() => this.animate());
  }

  drawParticles() {
    this.ctx.fillStyle = this.particleColor || 'rgba(0, 212, 255, 0.6)';
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawConnections() {
    this.ctx.strokeStyle = this.lineColor || 'rgba(0, 212, 255, 0.2)';
    this.ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }
}

// 初始化主题切换器
document.addEventListener('DOMContentLoaded', () => {
  window.techTheme = new TechThemeSwitcher();
  
  // 创建粒子背景画布
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  canvas.style.opacity = '0.3';
  document.body.appendChild(canvas);
  
  // 初始化粒子效果
  window.techParticles = new TechParticles(canvas);
});

// 导出供其他脚本使用
window.TechThemeSwitcher = TechThemeSwitcher;