import { defineConfig, devices } from '@playwright/test';
import { loadE2eSecrets } from './e2e/helpers/load-e2e-secrets';

// .env.local 을 먼저 읽고(기존 devremote 실행 호환), 없는 계정 변수는 .local-secrets/*.env 로 채운다.
// .env.local 만 읽으면 계정 변수가 없을 때 전 항목이 조용히 skip 된다.
loadE2eSecrets();

process.env.BACKEND_API_URL ??= 'https://apidev.d-edu.site/api';
process.env.NEXT_PUBLIC_BACKEND_API_URL ??= 'https://apidev.d-edu.site/api';
const devOrigin = process.env.E2E_BASE_URL?.trim() || 'https://dev.d-edu.site';
const reportScope = process.env.E2E_REPORT_SCOPE ?? 'manual';

export default defineConfig({
  testDir: './e2e',
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: `playwright-report-devremote-${reportScope}`,
        open: 'never',
      },
    ],
    [
      'junit',
      {
        outputFile: `test-results-devremote-${reportScope}/junit.xml`,
      },
    ],
  ],
  outputDir: `test-results-devremote-${reportScope}`,
  expect: { timeout: 15_000 },
  use: {
    baseURL: devOrigin,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'auth-gate',
      testMatch: /mvp-e-auth-gate\.spec\.ts/,
    },
    {
      // 로그인 1회로 세션 상태를 만들어 두는 단계. 이후 시나리오가 재사용한다.
      name: 'session',
      testMatch: /mvp-e-session\.setup\.ts/,
      dependencies: ['auth-gate'],
    },
    {
      name: 'devremote',
      testIgnore: /mvp-e-(auth-gate\.spec|session\.setup)\.ts/,
      dependencies: ['session'],
      // 저장된 세션은 프로젝트 전역이 아니라 필요한 spec 이 test.use 로 직접 켠다.
      // 전역으로 걸면 로그인·온보딩처럼 비로그인 상태가 전제인 spec 이 전부 깨진다.
    },
  ],
});
