import { describe, expect, it, jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

const createMockImage = ({ complete = true, naturalWidth = 100 } = {}) => {
  const listeners = {};

  return {
    complete,
    naturalWidth,
    addEventListener: jest.fn((event, handler) => {
      listeners[event] = handler;
    }),
    removeEventListener: jest.fn((event) => {
      delete listeners[event];
    }),
    trigger(event) {
      if (listeners[event]) {
        listeners[event]();
      }
    }
  };
};

describe('pdf export helpers', () => {
  it('prefers the dedicated export root over the preview shell', async () => {
    const { getResumeExportElement } = await import('../../src/utils/pdfExport');
    const exportRoot = { className: 'resume-export-root' };
    const previewRoot = { className: 'resume-preview' };
    const querySelector = jest.fn((selector) => {
      if (selector === '.resume-export-root') return exportRoot;
      if (selector === '.resume-preview') return previewRoot;
      return null;
    });

    const result = getResumeExportElement({ querySelector });

    expect(result).toBe(exportRoot);
    expect(querySelector).toHaveBeenCalledWith('.resume-export-root');
  });

  it('waits for unfinished images before exporting', async () => {
    const { waitForImagesReady } = await import('../../src/utils/pdfExport');
    const pendingImage = createMockImage({ complete: false, naturalWidth: 0 });
    const readyImage = createMockImage();
    const container = {
      querySelectorAll: jest.fn(() => [pendingImage, readyImage])
    };

    const readyPromise = waitForImagesReady(container);

    expect(pendingImage.addEventListener).toHaveBeenCalledWith('load', expect.any(Function), { once: true });
    pendingImage.complete = true;
    pendingImage.naturalWidth = 80;
    pendingImage.trigger('load');

    await expect(readyPromise).resolves.toBeUndefined();
  });

  it('calculates stable A4 slicing for tall canvases', async () => {
    const { getPdfImageLayout } = await import('../../src/utils/pdfExport');

    const layout = getPdfImageLayout({ width: 1200, height: 3600 });

    expect(layout.pageWidthMm).toBe(210);
    expect(layout.pageHeightMm).toBe(297);
    expect(layout.imageHeightMm).toBeGreaterThan(layout.pageHeightMm);
    expect(layout.totalPages).toBe(3);
  });

  it('keeps a dedicated export root in the preview renderer', () => {
    const previewPath = path.resolve(process.cwd(), 'src/components/ResumeBuilderPreview.vue');
    const previewSource = fs.readFileSync(previewPath, 'utf8');

    expect(previewSource).toContain('resume-export-root');
    expect(previewSource).toContain('resume-preview-shell');
  });
});
