import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/*
 * E2E 계정 시크릿 자동 로드.
 * 값은 git 미추적 디렉터리(.local-secrets/, .gitignore 등록됨)에만 존재하고
 * 이 모듈은 "경로"만 안다. 값을 코드·로그에 남기지 않는다.
 *
 * 탐색 순서:
 *   1) E2E_SECRETS_FILE 환경변수(파일 경로 직접 지정)
 *   2) 현재 체크아웃과 그 상위 디렉터리들의 .local-secrets/
 *   3) git worktree 인 경우 메인 체크아웃의 .local-secrets/
 * 이미 process.env 에 있는 값은 dotenv 기본 동작대로 덮어쓰지 않는다.
 * 가까운 디렉터리에 fixture 전용 파일만 있어도 탐색을 끝내지 않고, 뒤 디렉터리에서
 * 아직 비어 있는 계정 변수를 채운다.
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

/**
 * `.env.local` 과 `.local-secrets/{dev-qa,e2e}*.env` 를 순서대로 읽어 process.env 를 채운다.
 * 모든 Playwright 설정이 이 함수를 쓴다. 설정마다 로직이 갈라지면
 * 계정 변수가 없는 설정에서 스위트 전체가 조용히 skip 된다.
 */
export const loadE2eSecrets = (): void => {
  dotenv.config({ path: '.env.local', quiet: true });

  const explicit = process.env.E2E_SECRETS_FILE?.trim();
  if (explicit) {
    if (fs.existsSync(explicit)) dotenv.config({ path: explicit, quiet: true });
    return;
  }
  for (const dir of secretsDirCandidates()) {
    if (!fs.existsSync(dir)) continue;
    const files = fs
      .readdirSync(dir)
      .filter((name) => /^(?:dev-qa|e2e)[\w.-]*\.env$/i.test(name))
      .sort()
      .map((name) => path.join(dir, name));
    for (const file of files) dotenv.config({ path: file, quiet: true });
  }
};
