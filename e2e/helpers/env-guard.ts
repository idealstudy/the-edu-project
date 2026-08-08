import { test } from '@playwright/test';

/**
 * E2E 계정/시크릿 환경변수 가드.
 *
 * 원칙: 환경변수가 없다고 모듈 로드 시점에 throw 하면 Playwright 의 테스트 수집이
 * 통째로 무너져서 관계없는 스펙까지 전부 실행되지 않는다.
 * 그래서 "그 스펙만" 건너뛰도록 test.skip 조건을 건다.
 *
 * 값의 출처는 .local-secrets/dev-qa-accounts.env 이며,
 * playwright.config.ts 가 자동으로 읽어 process.env 에 주입한다.
 */

export const SECRETS_HINT =
  '값 출처: <repo>/.local-secrets/dev-qa-accounts.env (또는 E2E_SECRETS_FILE 환경변수)';

export const missingEnv = (names: readonly string[]): string[] =>
  names.filter((name) => !process.env[name]?.trim());

export const envValue = (name: string): string => process.env[name] ?? '';

/**
 * 필요한 환경변수가 하나라도 없으면 호출한 스코프(파일 또는 describe)의
 * 테스트만 skip 한다. 나머지 스위트는 정상 수집·실행된다.
 */
export const skipWithoutEnv = (names: readonly string[]): void => {
  const missing = missingEnv(names);
  test.skip(
    missing.length > 0,
    `환경변수 없음: ${missing.join(', ')}. ${SECRETS_HINT}`
  );
};
