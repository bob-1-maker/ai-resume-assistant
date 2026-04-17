# AI Resume Assistant

一个基于 Vue 3 + TypeScript + Vite + Express + Turso/libSQL + Tauri 的 AI 简历助手项目，支持简历编辑、模板预览、AI 生成与优化、导出以及本地/远端双存储能力。

当前仓库已经具备可运行的产品雏形，但从代码组织来看，仍处于“快速迭代型单体应用”阶段：前后端都能工作，但存在职责耦合、配置分散、重复封装和可维护性不足的问题。本 README 既说明如何运行项目，也给出面向工程化的优化方案，适合作为后续重构基线。

## 项目定位

- 面向个人用户的 AI 简历编辑与导出工具
- 前端提供简历编辑、模板切换、导出、导入与 AI 能力
- 后端提供用户认证、简历记录存储、AI 接口代理与缓存
- Tauri 提供桌面端壳层与本地文件落盘能力

## 当前技术栈

### 前端

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Element Plus

### 后端

- Node.js
- Express
- @libsql/client
- Redis
- JWT
- bcrypt

### 桌面端

- Tauri

### 导出与解析

- html2pdf.js
- html2canvas
- jspdf
- pdfjs-dist
- jszip
- mammoth

## 主要功能

- 简历基础信息、教育、工作、项目、技能、奖项、自我评价编辑
- 多模板预览与切换
- AI 简历解析、生成、优化
- 简历导出为 PDF、图片、Word、JSON
- 用户注册、登录、鉴权
- Turso/libSQL 持久化简历记录
- Tauri 环境下本地文件自动保存

## 实际代码结构

```text
.
├─ src/                     前端应用
│  ├─ api/                  API 调用封装
│  ├─ components/           业务组件与模板组件
│  ├─ composables/          Vue 组合式逻辑
│  ├─ router/               路由
│  ├─ store/                Pinia 状态管理
│  ├─ types/                类型定义
│  ├─ utils/                文件、请求、解析等工具
│  ├─ views/                页面入口
│  └─ workers/              导出 Worker
├─ controllers/             Express 控制器
├─ routes/                  Express 路由
├─ middleware/              认证中间件
├─ config/                  数据库与迁移配置
├─ public/templates/        HTML/CSS 模板资源
├─ src-tauri/               Tauri 桌面端代码
├─ server.js                后端主入口，当前承载大量 AI 逻辑
├─ db.sql                   数据库初始化脚本
├─ turso.sql                Turso 初始化脚本
└─ vite.config.ts           前端构建配置
```

## 架构现状分析

### 前端

前端整体是典型的单页应用结构，但业务边界还不够清晰。

- 页面入口较薄，主要逻辑下沉到组件和 store
- `src/components/ResumeBuilder.vue` 承担了模板切换、预览模式、导出、模块排序、AI 面板调度等多种职责，组件过重
- `src/store/resume.ts` 同时负责本地缓存、Tauri 文件保存、远端数据库同步，Store 责任过多
- `src/api/resume.ts`、`src/api/user.ts`、`src/utils/request.ts` 存在重复请求封装，未形成统一基础设施层
- 路由鉴权依赖 `localStorage` 直接读取，状态源分散

### 后端

后端已经拆出 `routes/`、`controllers/`、`middleware/` 和 `config/`，但核心 AI 逻辑仍集中在 `server.js`。

- `server.js` 同时负责应用启动、中间件配置、数据库初始化、缓存、AI 请求编排、降级策略、JSON 清洗与多个业务接口
- AI 相关接口均在入口文件内实现，导致文件体量过大，测试和维护成本高
- 控制器层目前偏薄，数据校验、错误处理和 DTO 转换未统一
- 数据访问层未显式抽象，控制器直接依赖数据库执行函数

### 数据与部署

- 当前项目同时存在 MySQL 配置和 Turso 配置，但运行路径已偏向 Turso/libSQL
- `.env.example` 配置项不完整，和实际代码使用的环境变量不一致
- Vite 配置了 `/api` 代理，但前端 API 层仍大量硬编码 `http://localhost:3001/api`

## 关键问题诊断

以下问题均来自当前仓库实际代码，而非泛化建议。

### 1. 后端入口文件过重

`server.js` 既是应用启动入口，也是 AI 服务实现文件，包含多组 `app.post('/api/ai/...')` 接口，维护成本高，变更风险集中。

### 2. 请求层重复且配置不一致

- `src/api/resume.ts`
- `src/api/user.ts`
- `src/utils/request.ts`

三处都在做 Axios 封装，但行为不一致。结果是超时、错误处理、token 注入、缓存策略都分散，难以统一治理。

### 3. API 地址硬编码

前端 API 调用普遍写死为 `http://localhost:3001/api`，这会直接破坏：

- Vite 代理能力
- Docker 部署灵活性
- Tauri 桌面端打包后的环境适配
- 多环境切换能力

### 4. 调试日志过多且包含敏感信息

认证和请求链路中存在大量 `console.log`，包括 token、Authorization header、请求头等内容，生产环境存在安全风险。

### 5. Store 负责过多副作用

`src/store/resume.ts` 同时处理：

- 本地 localStorage
- Tauri 文件保存
- 远端数据库读写
- UI 数据状态

这会导致单元测试困难，也会让后续多端同步逻辑变得脆弱。

### 6. 迁移逻辑重复执行

`config/migrations.js` 文件底部已经执行 `runMigrations()`，`server.js` 又再次调用一次，启动时存在重复迁移行为。

### 7. 配置源不统一

- Vite 代理使用相对路径思想
- API 层使用绝对地址
- `.env.example` 与实际环境变量不一致
- MySQL 与 Turso 两套数据访问路径并存

最终表现为部署门槛高，环境问题排查困难。

### 8. 组件切分仍不彻底

虽然 `ResumeBuilder.vue` 已使用 `defineAsyncComponent` 做了懒加载，但业务编排仍集中在一个超大组件中，后续扩展模板系统、导出策略或 AI 工作流时会进一步膨胀。

## 性能优化方案

以下方案按投入产出比排序，优先给出可落地动作。

### P0: 立即执行

#### 统一 API 客户端

- 保留一个基础 Axios 实例
- 用 `VITE_API_BASE_URL` 或相对路径 `/api`
- 将 token 注入、错误处理、超时、重试统一到一个 client 中

预期收益：

- 降低重复代码
- 避免多处拦截器叠加
- 减少联调和部署问题

#### 移除生产环境调试日志

- 删除 token、Authorization、完整请求头日志
- 使用 `import.meta.env.DEV` 或日志工具做环境分级

预期收益：

- 降低控制台噪音
- 改善运行时性能
- 消除敏感信息暴露风险

#### 拆分 `server.js`

建议最少拆成：

- `server/app.js`：Express app 初始化
- `server/routes/ai.js`：AI 路由
- `server/services/ai/`：AI 提示词、调用、响应解析
- `server/services/cache/`：Redis 缓存
- `server/services/resume/`：简历业务服务

预期收益：

- 缩短定位时间
- 降低单文件变更冲突
- 让 AI 能力可测试、可替换

### P1: 中期优化

#### 建立模板资源缓存策略

当前模板样式通过动态插入 `<link>` 加载。可以进一步：

- 统一模板资源清单
- 预加载常用模板 CSS
- 对模板预览使用 `keep-alive` 或渲染缓存

适合场景：

- 模板数量继续增加
- 频繁切换模板

#### 优化导出链路

现状中 PDF、图片导出仍偏前台主线程执行。建议：

- 将可纯计算部分继续转移到 Worker
- 对大型导出任务增加分段进度上报
- 避免重复生成完整 DOM 快照

预期收益：

- 降低导出卡顿
- 改善长简历导出体验

#### 简历列表虚拟化落地

仓库里已有 `src/components/VirtualList.vue`，但当前主界面侧边栏仍直接 `v-for` 渲染。若历史简历量增大，应在列表页真正接入虚拟滚动。

### P2: 构建与资源层面

#### 校正分包策略

当前 `vite.config.ts` 已做 `manualChunks`，但仍可进一步优化：

- 将 `pdfjs-dist`、`html2pdf.js`、`jspdf`、`mammoth` 放入独立异步 chunk
- 仅在导入/导出页面使用时加载
- 分析首屏依赖，减少 Element Plus 全量引入

#### Element Plus 按需引入

目前通过 `for...of` 全量注册全部图标，并整体 `app.use(ElementPlus)`。优化方向：

- 使用自动导入插件或显式按需引入
- 仅注册实际使用的图标

预期收益：

- 降低首屏包体积
- 缩短冷启动时间

## 架构改进方案

## 推荐目标架构

### 前端分层

```text
src/
├─ app/                应用启动、路由、全局插件
├─ modules/
│  ├─ auth/
│  ├─ resume-editor/
│  ├─ resume-history/
│  ├─ ai-assistant/
│  └─ export/
├─ shared/
│  ├─ api/
│  ├─ components/
│  ├─ composables/
│  ├─ utils/
│  └─ types/
└─ infrastructure/
   ├─ storage/
   ├─ tauri/
   └─ telemetry/
```

改造原则：

- 按业务域而不是技术类型组织代码
- UI 组件、状态、服务、类型尽量在模块内部闭环
- `shared/` 只放真正跨域复用的能力

### 后端分层

```text
server/
├─ app/
│  ├─ createApp.js
│  ├─ middlewares/
│  └─ routes/
├─ modules/
│  ├─ auth/
│  ├─ resume/
│  └─ ai/
├─ services/
│  ├─ cache/
│  ├─ llm/
│  └─ parser/
├─ repositories/
├─ config/
└─ scripts/
```

改造原则：

- Route 只做协议层转换
- Controller 只做参数接收和响应返回
- Service 承担业务逻辑
- Repository 负责数据访问
- LLM 调用与 Prompt 管理独立为可替换模块

## 可维护性提升方案

### 1. 建立统一类型模型

当前前端 `ResumeInfo` 与后端 `resume_records` 的字段模型并不完全一致，建议增加：

- `shared schema` 或 `src/types/dto.ts`
- 明确区分表单模型、API DTO、数据库实体

建议至少定义：

- `ResumeEditorModel`
- `ResumeRecordDTO`
- `ResumeEntity`
- `AIParseResultDTO`

### 2. 引入统一错误码和响应协议

建议标准化为：

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

并统一：

- 参数校验错误
- 鉴权错误
- 业务错误
- 第三方 AI 服务错误

### 3. 增加参数校验层

当前后端大多是手写 `if (!text)` 这类校验。建议引入：

- `zod`
- 或 `joi`

覆盖：

- 登录注册
- 简历保存
- AI 生成与解析请求

### 4. 清理历史残留实现

建议逐步删除或归档：

- 未实际使用的 MySQL 数据访问链路
- 重复的请求封装
- 调试性质的测试 HTML / JS 文件
- 构建产物 `dist/` 是否纳入仓库需要重新决策

### 5. 建立测试基线

当前仓库缺少成体系测试。建议最少补齐：

- `utils` 层单元测试
- AI 响应解析函数测试
- 认证与简历接口集成测试
- 关键编辑流程的 E2E 测试

推荐组合：

- Vitest
- Vue Test Utils
- Supertest
- Playwright

## 分阶段重构路线图

### 第一阶段：低风险治理

- 统一 API 客户端
- 移除硬编码 API 地址
- 清理敏感日志
- 修正 `.env.example`
- 修复迁移重复执行

### 第二阶段：结构拆分

- 拆分 `server.js`
- 将 AI 逻辑迁移到 `services/ai`
- 将简历数据访问抽到 repository
- 将 `resume store` 中的副作用迁移到 service/composable

### 第三阶段：工程化

- 接入测试
- 接入 lint / format / type-check
- 建立 CI
- 统一错误协议与 DTO

### 第四阶段：体验优化

- 虚拟列表接入
- 导出异步化
- 模板系统插件化
- AI 工作流可配置化

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+
- Rust 1.70+（仅 Tauri 桌面端需要）
- Turso/libSQL 可用实例
- Redis 可选

### 安装依赖

```bash
npm install
```

### 推荐环境变量

当前代码实际依赖的环境变量至少包括：

```env
PORT=3001
NODE_ENV=development

JWT_SECRET=change-me

TURSO_DB_URL=
TURSO_DB_AUTH_TOKEN=

REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379

AI_API_KEY=
AI_BASE_URL=https://api.siliconflow.cn/v1/chat/completions

DOUBAN_API_KEY=
DOUBAN_API_URL=https://ark.cn-beijing.volces.com/api/v3/chat/completions
DOUBAN_MODEL=Doubao-Seed-2.0-mini

VITE_API_BASE_URL=/api
```

建议你同步更新根目录 `.env.example`，让它与代码保持一致。

### 启动方式

前端开发：

```bash
npm run dev
```

后端开发：

```bash
npm run server
```

桌面端开发：

```bash
npm run tauri:dev
```

生产构建：

```bash
npm run build
npm run tauri:build
```

## 已识别的高优先级改造点

- 将 `server.js` 拆分为 app、route、service、repository 四层
- 合并 `src/api/resume.ts`、`src/api/user.ts`、`src/utils/request.ts`
- 去除所有写死的 `http://localhost:3001/api`
- 修复迁移逻辑重复执行
- 移除 token 与请求头日志
- 将 Store 中的 IO 副作用迁移到 service/composable
- 补齐环境变量文档

## 适合继续演进的方向

- 支持多用户云端同步
- 模板市场化与模板配置 JSON 化
- AI Prompt 配置化与模型切换
- 简历版本历史与差异对比
- 职位 JD 匹配度分析

## 文档

- [API.md](./API.md)
- [DEPLOY.md](./DEPLOY.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)

## 许可证

[MIT](./LICENSE)
