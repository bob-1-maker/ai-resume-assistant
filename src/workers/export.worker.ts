// 导出 Worker
// 处理 Word 导出逻辑（PDF 和图片导出需要在主线程中处理，因为需要 DOM 操作）

// 定义消息类型
interface ExportMessage {
  type: 'exportWord';
  payload: {
    resumeId: string;
    exportType: string;
    htmlContent: string;
    options?: any;
  };
}

// 定义响应类型
interface ExportResponse {
  type: 'success' | 'error';
  payload: {
    htmlContent?: string;
    error?: string;
  };
}

// 处理 Word 导出
const handleExportWord = async (htmlContent: string): Promise<string> => {
  return new Promise((resolve) => {
    // 创建包含简历内容的完整 HTML
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>简历</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 20px;
    }
    h1, h2, h3 {
      color: #333;
    }
    .resume-section {
      margin-bottom: 20px;
    }
    .section-title {
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .info-item {
      margin-bottom: 5px;
    }
    .education-item, .work-item, .project-item {
      margin-bottom: 15px;
    }
    .item-header {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .item-description {
      margin-left: 20px;
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    resolve(fullHtml);
  });
};

// 监听消息
self.addEventListener('message', async (event: MessageEvent<ExportMessage>) => {
  const { type, payload } = event.data;
  const { resumeId, exportType, htmlContent, options } = payload;

  try {
    let result: string;

    switch (type) {
      case 'exportWord':
        result = await handleExportWord(htmlContent);
        break;
      default:
        throw new Error('Unknown export type');
    }

    // 发送成功响应
    const response: ExportResponse = {
      type: 'success',
      payload: {
        htmlContent: result
      }
    };
    self.postMessage(response);
  } catch (error) {
    // 发送错误响应
    const response: ExportResponse = {
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Export failed'
      }
    };
    self.postMessage(response);
  }
});