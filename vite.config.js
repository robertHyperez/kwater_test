import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
server: { // 👇 [추가] 이 server 객체를 추가해 주세요.
    allowedHosts: 'all'
  }
})
