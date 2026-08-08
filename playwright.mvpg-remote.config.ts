import { defineConfig, devices } from '@playwright/test';
import { loadE2eSecrets } from './e2e/helpers/load-e2e-secrets';

// .env.local 만 읽으면 계정 변수가 없을 때 전 항목이 조용히 skip 된다.
loadE2eSecrets();

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
