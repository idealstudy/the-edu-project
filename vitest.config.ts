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
  },
});
