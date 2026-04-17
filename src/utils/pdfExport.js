export const A4_PAGE_WIDTH_MM = 210;
export const A4_PAGE_HEIGHT_MM = 297;

export const getResumeExportElement = (root = document) => {
  return root.querySelector('.resume-export-root') || root.querySelector('.resume-preview');
};

export const waitForImagesReady = async (container) => {
  if (!container) return;

  const images = Array.from(container.querySelectorAll('img'));
  const pendingImages = images.filter((image) => !(image.complete && image.naturalWidth > 0));

  if (pendingImages.length === 0) {
    return;
  }

  await Promise.all(
    pendingImages.map(
      (image) =>
        new Promise((resolve) => {
          const handleReady = () => {
            image.removeEventListener('load', handleReady);
            image.removeEventListener('error', handleReady);
            resolve();
          };

          image.addEventListener('load', handleReady, { once: true });
          image.addEventListener('error', handleReady, { once: true });
        })
    )
  );
};

export const waitForFontsReady = async (root = document) => {
  if (root?.fonts?.ready) {
    await root.fonts.ready;
  }
};

export const getPdfImageLayout = ({
  width,
  height,
  pageWidthMm = A4_PAGE_WIDTH_MM,
  pageHeightMm = A4_PAGE_HEIGHT_MM
}) => {
  const imageHeightMm = (height * pageWidthMm) / width;

  return {
    pageWidthMm,
    pageHeightMm,
    imageHeightMm,
    totalPages: Math.max(1, Math.ceil(imageHeightMm / pageHeightMm))
  };
};

export const cloneExportElement = (element) => {
  const clone = element.cloneNode(true);
  clone.classList.add('pdf-export-mode');
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-100000px';
  wrapper.style.top = '0';
  wrapper.style.zIndex = '-1';
  wrapper.style.background = '#ffffff';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return {
    clone,
    cleanup: () => wrapper.remove()
  };
};
