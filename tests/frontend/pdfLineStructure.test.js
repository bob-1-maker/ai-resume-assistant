import { describe, expect, it } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('pdf line structure recovery', () => {
  it('reconstructs grouped lines from positioned pdf text items', async () => {
    const { reconstructPdfPageText } = await import('../../src/utils/pdfLineStructure.js');

    const pageText = reconstructPdfPageText([
      { str: '成都锦城学院', transform: [1, 0, 0, 1, 420, 760] },
      { str: '2024年9月 - 至今', transform: [1, 0, 0, 1, 120, 760] },
      { str: '教育经历', transform: [1, 0, 0, 1, 60, 790] },
      { str: '专业技能', transform: [1, 0, 0, 1, 60, 700] },
      { str: '熟悉 HTML/CSS、JavaScript', transform: [1, 0, 0, 1, 80, 675] }
    ]);

    expect(pageText).toContain('教育经历');
    expect(pageText).toContain('2024年9月 - 至今 成都锦城学院');
    expect(pageText).toContain('\n专业技能\n');
    expect(pageText).toContain('熟悉 HTML/CSS、JavaScript');
  });

  it('wires pdf parsing through line reconstruction instead of flattening whole pages', () => {
    const parserPath = path.resolve(process.cwd(), 'src/utils/resumeParser.ts');
    const parserSource = fs.readFileSync(parserPath, 'utf8');

    expect(parserSource).toContain("from './pdfLineStructure.js'");
    expect(parserSource).toContain('reconstructPdfPageText(textContent.items as any[])');
    expect(parserSource).not.toContain(".map((item: any) => item?.str || '')\n            .join(' ')");
  });
});
