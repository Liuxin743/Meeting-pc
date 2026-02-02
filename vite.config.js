import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' 
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [vue()],
  base: isProduction ? '/Meeting-System/' : '/',  
  build: {
    outDir: 'dist',         
    assetsDir: 'assets',    
    emptyOutDir: true,      
    rollupOptions: {        
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})