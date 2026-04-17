# PDF Line Structure Recovery

## Feature description

修复 PDF 简历导入时文本被整页压平成单行的问题，让解析阶段尽量保留原始行结构，从而提升教育经历、荣誉奖项、专业技能、项目经历、在校经历等模块的识别率。

## Inputs and outputs

- 输入：用户上传的 PDF 简历文件。
- 输出：保留行结构的文本，以及基于该文本生成的结构化简历数据。

## Page flow and API flow

- 页面流：用户在导入区上传 PDF 文件，系统先提取文本，再执行 TS 解析并展示结果预览。
- API 流：本次不修改 AI 解析接口链路；若用户启用 AI 且 AI 失败，仍按现有逻辑回退到 TS 解析。

## Exception scenarios

- PDF 为扫描件或纯图片，无法提取有效文本。
- PDF 提取到的文字顺序异常，导致部分行无法正确归组。
- 模块标题存在变体，可能仍需回退到基础文本匹配。

## Acceptance criteria

- PDF 文本提取不再简单整页 `join(' ')` 压平。
- TS 解析能比当前版本识别出更多非基础信息模块。
- 不影响现有上传、预览、应用到简历的基本流程。
- 不修改 AI 接口和非 PDF 导入逻辑。
