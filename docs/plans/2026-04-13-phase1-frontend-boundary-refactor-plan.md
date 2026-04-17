# 第一阶段前端边界收敛改造开发计划

## Task List

1. 盘点现有前端请求入口、认证状态入口、简历状态入口与首页编排入口
2. 设计统一请求客户端的落地位置、接口形态和鉴权注入规则
3. 收敛普通用户登录态读写路径，统一页面、路由与 store 的状态来源
4. 从 `resume` store 中剥离过重的 IO 编排职责，保留必要状态管理能力
5. 拆分 `ResumeBuilder.vue`，形成职责更明确的控制区、编辑区、预览区或对应子组件
6. 先补齐或更新单元测试，覆盖登录态、请求层与简历主路径
7. 再补齐或更新 E2E 测试，覆盖登录与首页主流程回归
8. 在测试范围明确后实现生产代码
9. 运行相关测试并修复回归
10. 更新 `AGENTS.md` Skill Record

## Priority

### P0

- 统一请求客户端
- 登录态管理边界收敛
- `resume` store 职责收敛

### P1

- `ResumeBuilder.vue` 拆分
- 现有页面接线调整

### P2

- 文档补充
- `AGENTS.md` Skill Record 更新

## Expected Implementation Steps

1. 阅读并确认以下当前入口行为：
   - `src/api/*.ts`
   - `src/utils/request.ts`
   - `src/store/user.ts`
   - `src/store/resume.ts`
   - `src/router/index.ts`
   - `src/views/Home.vue`
   - `src/components/ResumeBuilder.vue`
2. 设计一个统一请求客户端，集中处理：
   - API base URL
   - token 注入
   - 通用错误处理
   - 响应解包约定
3. 调整用户认证路径，统一处理：
   - token 存储
   - userInfo 存储
   - 登录态初始化
   - 登出清理
   - 路由守卫读取来源
4. 将简历相关 IO 副作用从 store 中抽离到 service/composable 或更薄的调用边界：
   - 本地缓存
   - Tauri 文件保存
   - 远端数据库同步
5. 将 `ResumeBuilder.vue` 按职责拆分，但保持用户可见行为不变：
   - 顶部控制区
   - 编辑区
   - 预览区
   - 模块排序区
   - AI 分析入口与导出入口
6. 按测试优先原则先编写或更新单元测试：
   - 请求层
   - 用户认证状态
   - 路由守卫
   - 简历状态主流程
7. 再编写或更新 E2E 测试：
   - 普通用户登录成功
   - 未登录访问首页被重定向
   - 首页核心加载与简历编辑主流程可用
8. 实现生产代码并修复测试失败
9. 运行相关测试并整理结果

## Dependencies

- 现有 Express 接口协议保持兼容
- 现有 `/api` 路径和 Vite 代理配置可继续使用
- 现有 Jest 测试环境可支撑前端逻辑测试
- 现有 Playwright 基线可扩展首页主流程覆盖
- Tauri 相关能力在浏览器环境下必须允许降级

## Test Strategy

### Unit Test

- 为统一请求层增加成功、鉴权头注入、错误处理覆盖
- 为用户 store 增加登录态初始化、登录成功、登出清理覆盖
- 为路由守卫增加未登录重定向、已登录访问登录页跳转覆盖
- 为简历状态流增加创建、加载、保存等主路径覆盖
- 覆盖至少一个异常路径和一个边界条件

### E2E Test

- 普通用户登录成功后进入首页
- 未登录用户访问 `/` 时被引导至 `/login`
- 首页核心简历编辑流程保持可用
- 本阶段涉及的重构不破坏现有 AI、导出、管理员回归基线

## Risks

- 当前代码对 `localStorage` 直接依赖较多，收敛时容易出现隐性回归
- `ResumeBuilder.vue` 体量较大，拆分时要避免事件与状态传递混乱
- 浏览器与 Tauri 双环境分支可能导致测试与运行行为不完全一致
- 如果现有前端测试对 Vue 侧覆盖不足，可能需要补充必要测试支撑
