# API 文档

本文档描述 AI 简历助手后端接口的使用方法。

## 基础信息

- **基础 URL**: `http://localhost:3000`
- **请求格式**: JSON
- **响应格式**: JSON
- **统一响应结构**:
  ```json
  {
    "code": 200,
    "data": {...},
    "msg": "操作成功"
  }
  ```

## 接口列表

### 1. 健康检查

检查后端服务是否正常运行。

- **URL**: `/api/health`
- **Method**: GET
- **Auth**: 不需要

**请求示例**:
```bash
curl http://localhost:3000/api/health
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "status": "ok"
  },
  "msg": "AI 简历助手后端服务运行正常"
}
```

---

### 2. AI 生成简历

根据基本信息和职位描述，调用 AI 接口生成完整简历。

- **URL**: `/api/ai/generate`
- **Method**: POST
- **Auth**: 不需要

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| basicInfo | Object | 是 | 基本信息 |
| basicInfo.name | String | 否 | 姓名 |
| basicInfo.position | String | 否 | 期望职位 |
| basicInfo.phone | String | 否 | 电话 |
| basicInfo.email | String | 否 | 邮箱 |
| jobDescription | String | 否 | 职位描述 |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "basicInfo": {
      "name": "张三",
      "position": "前端开发工程师",
      "phone": "13800138000",
      "email": "zhangsan@example.com"
    },
    "jobDescription": "招聘前端开发工程师，要求熟悉 Vue、React 等框架"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "basic": {
      "name": "张三",
      "position": "前端开发工程师",
      "summary": "具有丰富经验的前端开发工程师..."
    },
    "education": [
      {
        "id": "1",
        "school": "示例大学",
        "degree": "学士",
        "major": "计算机科学",
        "startDate": "2018-09",
        "endDate": "2022-06"
      }
    ],
    "work": [
      {
        "id": "1",
        "company": "示例科技",
        "position": "前端开发工程师",
        "startDate": "2022-07",
        "endDate": "至今",
        "description": "负责公司核心产品的前端开发..."
      }
    ],
    "project": [...],
    "skills": [...]
  },
  "msg": "生成成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "data": null,
  "msg": "缺少基本信息"
}
```

---

### 3. AI 优化简历

对简历内容进行智能优化，提供改进建议和关键词。

- **URL**: `/api/ai/optimize`
- **Method**: POST
- **Auth**: 不需要

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| resumeData | Object | 是 | 完整简历数据 |
| section | String | 是 | 需要优化的模块（work/education/project/skills） |
| content | String | 是 | 需要优化的内容 |

**请求示例**:
```bash
curl -X POST http://localhost:3000/api/ai/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "resumeData": {...},
    "section": "work",
    "content": "负责前端开发工作，参与多个项目"
  }'
```

**响应示例**:
```json
{
  "code": 200,
  "data": {
    "optimizedContent": "负责前端开发工作，参与多个项目（经过 AI 优化，更加专业和有吸引力）",
    "problems": [
      {
        "id": "1",
        "text": "内容可以更加具体，添加具体的成就和数据。",
        "type": "内容改进"
      },
      {
        "id": "2",
        "text": "可以使用更专业的词汇和表达方式。",
        "type": "语言优化"
      }
    ],
    "keywords": ["专业技能", "团队协作", "项目经验", "问题解决"]
  },
  "msg": "优化成功"
}
```

**错误响应**:
```json
{
  "code": 400,
  "data": null,
  "msg": "缺少必要参数"
}
```

---

### 4. 获取模板列表

获取所有可用的简历模板列表。

- **URL**: `/api/templates`
- **Method**: GET
- **Auth**: 不需要

**请求示例**:
```bash
curl http://localhost:3000/api/templates
```

**响应示例**:
```json
{
  "code": 200,
  "data": [
    {
      "id": "simple",
      "name": "简约风格",
      "type": "basic",
      "previewUrl": "/templates/simple/preview.png",
      "styleUrl": "/templates/simple/style.css",
      "description": "简洁大方，适合各类职位",
      "colors": ["#333333", "#666666", "#f5f5f5"]
    },
    {
      "id": "modern",
      "name": "现代风格",
      "type": "basic",
      "previewUrl": "/templates/modern/preview.png",
      "styleUrl": "/templates/modern/style.css",
      "description": "时尚现代，适合互联网、设计类职位",
      "colors": ["#2c3e50", "#3498db", "#ecf0f1"]
    },
    {
      "id": "professional",
      "name": "专业风格",
      "type": "basic",
      "previewUrl": "/templates/professional/preview.png",
      "styleUrl": "/templates/professional/style.css",
      "description": "正式专业，适合金融、法律等传统行业",
      "colors": ["#1a1a1a", "#4a4a4a", "#e8e8e8"]
    }
  ],
  "msg": "获取模板列表成功"
}
```

**字段说明**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | String | 模板唯一标识 |
| name | String | 模板名称 |
| type | String | 模板类型 |
| previewUrl | String | 预览图 URL |
| styleUrl | String | 样式文件 URL |
| description | String | 模板描述 |
| colors | Array | 主题色数组 |

---

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

## 安全说明

1. **API Key 保护**: AI 接口调用所需的 API Key 存储在服务器环境变量中，不会暴露给前端
2. **敏感信息过滤**: 请求中的敏感字段（如 password、token、creditCard、ssn）会被自动过滤
3. **数据不存储**: 后端服务不存储任何用户请求数据，仅做转发处理
4. **重试机制**: AI 接口调用失败时会自动重试 2 次，超时时间为 3 秒

## 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| PORT | 否 | 服务器端口，默认 3000 |
| AI_API_KEY | 是 | AI 服务 API Key |
| AI_API_URL | 是 | AI 服务 API 地址 |
| NODE_ENV | 否 | 运行环境，development/production |

## 更新日志

### v1.0.0
- 初始版本发布
- 实现 AI 生成和优化接口
- 实现模板管理接口
- 添加健康检查接口