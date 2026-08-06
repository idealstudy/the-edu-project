import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 2,
  retries: 1,
  reporter: 'list',
  use: {
    baseURL: 'https://dev.d-edu.site',
    trace: 'off',
    ...devices['Desktop Chrome'],
  },
});
