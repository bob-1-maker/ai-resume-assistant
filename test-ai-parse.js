import axios from 'axios';

async function testAiParse() {
  try {
    const apiClient = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 30000, // 增加超时时间到30秒
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // 响应拦截器
    apiClient.interceptors.response.use(
      response => {
        // 检查是否有 data 字段，如果有则返回 data.data
        if (response.data && response.data.data) {
          return response.data.data;
        }
        return response.data;
      },
      error => {
        console.error('API请求错误:', error);
        return Promise.reject(error);
      }
    );

    const aiData = await apiClient.post('/ai/parse-resume', {
      text: '张三，电话：13800138000，邮箱：zhangsan@example.com，教育经历：2020-2024年，北京大学，计算机科学与技术专业，本科。项目经验：2022-2023年，智能简历解析系统，前端开发，使用Vue3+TypeScript。技能：JavaScript, TypeScript, Vue3, React。'
    });
    console.log('AI解析接口测试成功:', aiData);
  } catch (error) {
    console.error('AI解析接口测试失败:', error.message);
  }
}

testAiParse();
