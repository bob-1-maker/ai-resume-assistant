import { parseWordToText } from './src/utils/textPreprocess.js';
import fs from 'fs';

// 测试Word文件解析
const testWordParse = async () => {
  try {
    // 读取测试Word文件
    const file = new File([fs.readFileSync('./test-resume.docx')], 'test-resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    console.log('开始解析Word文件...');
    const text = await parseWordToText(file);
    console.log('解析成功！');
    console.log('解析结果:', text);
  } catch (error) {
    console.error('解析失败:', error);
  }
};

testWordParse();