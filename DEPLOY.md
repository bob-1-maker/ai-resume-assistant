# 部署指南

本文档介绍 AI 简历助手的多种部署方式。

## 目录

- [Docker 部署（推荐）](#docker-部署推荐)
- [手动部署](#手动部署)
- [桌面应用构建](#桌面应用构建)
- [环境变量配置](#环境变量配置)
- [常见问题](#常见问题)

---

## Docker 部署（推荐）

使用 Docker 可以一键启动完整的服务，无需手动配置环境。

### 前置要求

- Docker >= 20.0.0
- Docker Compose >= 2.0.0

### 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/ai-resume-assistant.git
   cd ai-resume-assistant
   ```

2. **配置环境变量**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，配置 AI API 密钥
   ```

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

4. **访问应用**
   - 前端应用：http://localhost:5173
   - 后端服务：http://localhost:3000

5. **停止服务**
   ```bash
   docker-compose down
   ```

### Docker 命令参考

```bash
# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 重新构建
docker-compose up -d --build

# 查看容器状态
docker-compose ps
```

---

## 手动部署

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Rust >= 1.70.0（桌面应用需要）

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/yourusername/ai-resume-assistant.git
cd ai-resume-assistant

# 安装依赖
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件
# 配置 AI API 密钥和其他参数
```

### 3. 启动后端服务

```bash
# 开发模式
npm run dev

# 或生产模式
npm start
```

后端服务将运行在 http://localhost:3000

### 4. 启动前端应用

```bash
# 开发模式
npm run dev
```

前端应用将运行在 http://localhost:5173

### 5. 构建生产版本

```bash
# 构建前端
npm run build

# 构建后的文件在 dist/ 目录
```

---

## 桌面应用构建

### 前置要求

- Rust >= 1.70.0
- 对应平台的构建工具

### 安装 Rust

```bash
# Windows
# 下载并运行 https://rustup.rs/

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### 构建桌面应用

```bash
# 开发模式
npm run tauri:dev

# 构建生产版本
npm run tauri:build
```

构建后的安装包位于 `src-tauri/target/release/bundle/` 目录。

### 支持的平台

| 平台 | 输出格式 |
|------|----------|
| Windows | .msi, .exe |
| macOS | .dmg, .app |
| Linux | .deb, .rpm, .AppImage |

---

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| AI_API_KEY | AI 服务 API 密钥 | sk-xxxxxxxxxx |
| AI_API_URL | AI 服务 API 地址 | https://api.example.com |

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| PORT | 服务器端口 | 3000 |
| NODE_ENV | 运行环境 | development |

### 配置示例

```bash
# .env 文件
PORT=3000
AI_API_KEY=your_api_key_here
AI_API_URL=https://api.example.com/ai
NODE_ENV=production
```

---

## 常见问题

### Q1: Docker 部署后无法访问

**问题**: 启动 Docker 后无法访问应用

**解决**:
1. 检查容器状态：`docker-compose ps`
2. 查看日志：`docker-compose logs -f`
3. 确认端口未被占用：`netstat -an | grep 3000`
4. 检查防火墙设置

### Q2: AI 接口调用失败

**问题**: AI 生成或优化功能无法使用

**解决**:
1. 检查 AI_API_KEY 和 AI_API_URL 是否正确配置
2. 确认 AI 服务是否可用
3. 查看后端日志排查错误
4. 检查网络连接

### Q3: 桌面应用构建失败

**问题**: 运行 `npm run tauri:build` 报错

**解决**:
1. 确认 Rust 已正确安装：`rustc --version`
2. 安装平台依赖：
   - Windows: 安装 Visual Studio Build Tools
   - macOS: 安装 Xcode Command Line Tools
   - Linux: 安装 build-essential
3. 更新 Tauri CLI：`npm update @tauri-apps/cli`

### Q4: 前端无法连接后端

**问题**: 前端页面显示无法连接后端服务

**解决**:
1. 确认后端服务已启动：`curl http://localhost:3000/api/health`
2. 检查 CORS 配置是否正确
3. 确认前后端端口配置正确
4. 检查网络代理设置

### Q5: 导出 PDF 失败

**问题**: 点击导出 PDF 没有反应或报错

**解决**:
1. 检查 html2pdf.js 和 html2canvas 是否正确安装
2. 确认浏览器支持相关 API
3. 检查简历内容是否为空
4. 查看浏览器控制台错误信息

---

## 性能优化

### 前端优化

1. **代码分割**: 使用动态导入减少首屏加载时间
2. **资源压缩**: 启用 Gzip 压缩
3. **图片优化**: 使用 WebP 格式，懒加载
4. **缓存策略**: 配置合理的缓存头

### 后端优化

1. **启用压缩**: 使用 compression 中间件
2. **请求限流**: 防止 API 滥用
3. **日志管理**: 定期清理日志文件
4. **监控告警**: 配置健康检查和告警

---

## 安全建议

1. **HTTPS**: 生产环境使用 HTTPS
2. **API 密钥**: 定期更换 AI API 密钥
3. **访问控制**: 配置防火墙规则
4. **数据备份**: 定期备份用户数据
5. **日志审计**: 记录关键操作日志

---

## 更新部署

### 更新代码

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install

# 重新构建
npm run build
```

### Docker 更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 清理旧镜像
docker image prune -f
```

---

## 技术支持

如有部署问题，请：

1. 查看 [GitHub Issues](https://github.com/yourusername/ai-resume-assistant/issues)
2. 提交新的 Issue，描述问题和环境信息
3. 加入社区讨论群组

---

**最后更新**: 2024-01-01