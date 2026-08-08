import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config({ path: '.env.local' });

/*
 * E2E 계정 시크릿 자동 로드.
 * 값은 git 미추적 디렉터리(.local-secrets/, .gitignore 등록됨)에만 존재하고
 * 이 설정은 "경로"만 안다. 값을 코드·로그에 남기지 않는다.
 *
 * 탐색 순서:
 *   1) E2E_SECRETS_FILE 환경변수(파일 경로 직접 지정)
 *   2) 현재 체크아웃과 그 상위 디렉터리들의 .local-secrets/
 *   3) git worktree 인 경우 메인 체크아웃의 .local-secrets/
 * 이미 process.env 에 있는 값은 dotenv 기본 동작대로 덮어쓰지 않는다.
 */
const secretsDirCandidates = (): string[] => {
  const dirs: string[] = [];
  let current = process.cwd();
  for (let depth = 0; depth < 4; depth += 1) {
    dirs.push(path.join(current, '.local-secrets'));
    current = path.dirname(current);
  }
  try {
    const commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
      cwd: process.cwd(),
      encoding: 'utf8',
    }).trim();
    if (commonDir) {
      const mainRoot = path.dirname(path.resolve(process.cwd(), commonDir));
      dirs.push(path.join(mainRoot, '.local-secrets'));
    }
  } catch {
    // git 이 없거나 저장소가 아니면 무시한다.
  }
  return dirs;
};

const loadLocalSecrets = () => {
  const explicit = process.env.E2E_SECRETS_FILE?.trim();
  if (explicit) {
    if (fs.existsSync(explicit)) dotenv.config({ path: explicit });
    return;
  }
  for (const dir of secretsDirCandidates()) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((name) => name.endsWith('.env'))
      .map((name) => path.join(dir, name));
    for (const file of files) dotenv.config({ path: file });
    if (files.length > 0) return;
  }
};

loadLocalSecrets();

const e2eBaseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
const useRemoteWeb = Boolean(process.env.E2E_BASE_URL);

// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: e2eBaseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: useRemoteWeb
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
      },
});
