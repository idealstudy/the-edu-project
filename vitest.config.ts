import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    globals: true,
  },
  define: {
    'process.env.NEXT_PUBLIC_BASE_URL': JSON.stringify(
      'http://localhost/mock-api'
    ),
    // 테스트 환경용 백엔드 API URL 설정
    'process.env.NEXT_PUBLIC_BACKEND_API_URL': JSON.stringify(
      'http://localhost:3000/api'
    ),
    'process.env.BACKEND_API_URL': JSON.stringify('http://localhost:3000/api'),
  },
});
