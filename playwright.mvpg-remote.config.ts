import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  testDir: './e2e',
  testMatch: 'mvp-g-v2-remote.spec.ts',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/mvp-g-v2', open: 'never' }],
    ['json', { outputFile: 'test-results/mvp-g-v2/results.json' }],
  ],
  outputDir: 'test-results/mvp-g-v2/artifacts',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
});
