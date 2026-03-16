# AI 简历助手

一款基于 Vue3 + TypeScript + Tauri 的智能简历生成工具，支持 AI 自动生成和优化简历内容，提供多种精美模板，支持导出 PDF 和图片。

## ✨ 功能特性

- 🤖 **AI 智能生成**：根据基本信息和职位描述，自动生成完整简历
- ✏️ **AI 内容优化**：智能分析简历内容，提供优化建议和关键词提取
- 🎨 **多模板支持**：提供简约、现代、专业等多种风格模板
- 📄 **导出功能**：支持导出 PDF、图片（PNG/JPG）和 JSON 备份
- 💾 **本地存储**：数据保存在本地，保护隐私安全
- 🖥️ **桌面应用**：基于 Tauri 构建，支持 Windows/macOS/Linux

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- Rust >= 1.70.0（桌面应用需要）
- npm 或 yarn

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-resume-assistant.git
cd ai-resume-assistant

# 安装依赖
npm install
```

### 开发模式

```bash
# 前端开发模式
npm run dev

# 桌面应用开发模式（需要 Rust 环境）
npm run tauri:dev
```

### 构建

```bash
# 构建前端
npm run build

# 构建桌面应用（需要 Rust 环境）
npm run tauri:build
```

### Docker 部署

```bash
# 使用 Docker Compose 一键启动
docker-compose up -d
```

## 📁 项目结构

```
ai-resume-assistant/
├── src/                    # 前端源代码
│   ├── components/         # Vue 组件
│   ├── store/             # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   ├── utils/             # 工具函数
│   └── assets/            # 静态资源
├── data/                  # 数据文件
│   └── templates.json     # 简历模板数据
├── server.js              # Express 后端服务
├── package.json           # 项目配置
├── tauri.conf.json        # Tauri 配置
├── Dockerfile             # Docker 配置
└── docker-compose.yml     # Docker Compose 配置
```

## 🔧 技术栈

- **前端**：Vue3 + TypeScript + Pinia + Element Plus
- **桌面**：Tauri
- **后端**：Express + Node.js
- **富文本**：Tiptap
- **导出**：html2pdf.js + html2canvas

## 🔒 隐私说明

- 所有简历数据存储在本地，不会上传到云端
- AI 接口调用时，敏感信息（如密码、身份证号等）会被自动过滤
- 后端服务不存储任何用户请求数据，仅做转发处理
- 支持离线使用，无需联网即可编辑和导出简历

## 📝 使用指南

1. **创建简历**：点击"新建简历"，输入简历名称
2. **填写信息**：在左侧表单中填写基本信息、教育经历、工作经历等
3. **AI 生成**：点击"AI 生成"，输入职位描述，自动生成简历内容
4. **AI 优化**：选中需要优化的内容，点击"AI 优化"获取建议
5. **选择模板**：在预览区域切换不同的简历模板
6. **导出简历**：点击"导出"按钮，选择 PDF、图片或 JSON 格式

## 📚 文档

- [API 文档](./API.md) - 后端接口说明
- [部署指南](./DEPLOY.md) - 详细部署步骤

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT 许可证](./LICENSE) 开源。

## 🙏 致谢

感谢以下开源项目的支持：

- [Vue.js](https://vuejs.org/)
- [Tauri](https://tauri.app/)
- [Tiptap](https://tiptap.dev/)
- [Element Plus](https://element-plus.org/)

---

如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！