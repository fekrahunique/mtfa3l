import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // ملفات الوزارة ليست جزءًا من التطبيق، ومراقبتها أثناء التنزيل
      // تُسقط الخادم بخطأ EBUSY على ويندوز.
      ignored: ['**/ministry-files/**'],
    },
  },
})
