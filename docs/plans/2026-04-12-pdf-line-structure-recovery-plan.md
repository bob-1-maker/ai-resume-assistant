# PDF Line Structure Recovery Plan

## Task list

1. 分析当前 PDF 文本提取方式和 `pdfjs` 返回的文本项结构。
2. 设计按行重建文本的最小实现。
3. 先补单元测试，覆盖行结构恢复和模块识别回归。
4. 调整 `resumeParser.ts` 的 PDF 提取逻辑。
5. 运行相关单测并验证结果。

## Priority

- 高优先级：恢复 PDF 行结构。
- 中优先级：确保教育、技能、项目、在校经历等模块识别率提升。
- 低优先级：进一步优化更复杂版式的边界情况。

## Expected implementation steps

- 基于 `pdfjs` 文本项的位置信息或相邻关系重建换行。
- 将重建后的文本交给现有 `splitSections` 和模块提取逻辑。
- 仅在 PDF 导入链路中启用该恢复逻辑。

## Dependencies

- `pdfjs-dist`
- 当前 `src/utils/resumeParser.ts`
- 现有导入组件 `src/components/ResumeImport.vue`

## Test strategy

- 单元测试：
  - 主成功路径：多模块 PDF 文本可按行恢复。
  - 错误路径：空文本或扫描件风格输入安全返回空结果。
  - 边界条件：标题行、日期行、列表行不被全部压平。
- E2E：本次先不新增，沿用现有导入页面人工验证。
