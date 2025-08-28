# 贡献指南

感谢你对 Download Station 项目的关注！我们欢迎所有形式的贡献。

## 🚀 快速开始

### 开发环境设置

```bash
# 1. Fork 并克隆项目
git clone https://github.com/your-username/download-station.git
cd download-station

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 分支策略

- `main` - 主分支，稳定的生产代码
- `develop` - 开发分支，最新的开发代码
- `feature/*` - 功能分支
- `bugfix/*` - 修复分支

## 📝 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>: <description>

[optional body]
```

### 类型说明
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```bash
feat: 添加文件上传功能
fix: 修复搜索结果显示问题
docs: 更新部署文档
```

## 🔧 开发流程

1. **创建分支**
```bash
git checkout -b feature/your-feature-name
```

2. **开发和测试**
```bash
npm run test
npm run lint
```

3. **提交代码**
```bash
git add .
git commit -m "feat: 添加新功能"
```

4. **推送并创建 PR**
```bash
git push origin feature/your-feature-name
```

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行测试覆盖率
npm run test:coverage

# 运行 lint 检查
npm run lint
```

## 📚 文档

- 更新相关文档
- 添加代码注释
- 更新 API 文档

## 🐛 Bug 报告

请使用 GitHub Issues 报告 Bug，包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息

## 💡 功能建议

欢迎提出新功能建议：

- 详细描述功能
- 说明使用场景
- 提供设计思路

## 📄 许可证

贡献的代码将采用 MIT 许可证。

## 🙏 致谢

感谢所有贡献者的努力！