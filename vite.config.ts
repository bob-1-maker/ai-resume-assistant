import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    // 控制包大小警告限制
    chunkSizeWarningLimit: 500,
    // 开启代码分割
    rollupOptions: {
      output: {
        // 配置依赖拆包
        manualChunks: {
          // vendor 包：放 vue/element-plus 等核心库
          vendor: ['vue', 'element-plus', '@element-plus/icons-vue', 'pinia', 'vue-router'],
          // export 包：放导出相关的库
          export: ['html2pdf.js', 'html2canvas', 'file-saver', 'jspdf'],
          // ai 包：放 AI 相关功能
          ai: ['axios'],
          // utils 包：放工具函数
          utils: ['jszip', 'pdfjs-dist']
        }
      }
    },
    // 开启 gzip 压缩
    compress: true,
    // 开启 terser 代码压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
