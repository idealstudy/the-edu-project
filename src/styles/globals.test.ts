import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = fs
  .readFileSync(path.resolve(process.cwd(), 'src/styles/globals.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '');

const topLevelRules = (source: string) => {
  const rules: Array<{ prelude: string; body: string }> = [];
  let depth = 0;
  let start = 0;
  let prelude = '';

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '{') {
      if (depth === 0) {
        prelude = source.slice(start, index).trim();
        start = index + 1;
      }
      depth += 1;
    } else if (source[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        rules.push({ prelude, body: source.slice(start, index) });
        start = index + 1;
      }
    }
  }

  return rules;
};

describe('스터디룸 셸 CSS 경계', () => {
  const rules = topLevelRules(css);

  it('모든 폭에서 대시보드 사이드바와 좌측 패딩을 제거한다', () => {
    expect(rules).toContainEqual({
      prelude: 'body:has([data-study-room-shell]) [data-dashboard-sidebar]',
      body: expect.stringMatching(/display:\s*none\s*;/),
    });
    expect(rules).toContainEqual({
      prelude: 'body:has([data-study-room-shell]) [data-private-app-shell]',
      body: expect.stringMatching(/padding-left:\s*0\s*;/),
    });
  });

  it('TanStack Query 버튼 보정만 1024px 미만에 제한한다', () => {
    const mobileRule = rules.find(
      ({ prelude }) => prelude === '@media (max-width: 1023.98px)'
    );

    expect(mobileRule?.body).toContain('.tsqd-open-btn-container');
    expect(mobileRule?.body).not.toContain('[data-dashboard-sidebar]');
    expect(mobileRule?.body).not.toContain('[data-private-app-shell]');
  });
});

describe('폰 사용성 토큰 계약', () => {
  it('MOB-TYPE-01 768px 미만에서 본문·메타·특수 UI 최소 글자값을 제공한다', () => {
    expect(css).toMatch(/--type-body-2-size:\s*16px\s*;/);
    expect(css).toMatch(/--type-label-size:\s*15px\s*;/);
    expect(css).toMatch(/--type-caption-size:\s*13px\s*;/);
    expect(css).toMatch(/--type-ui-compact-size:\s*13px\s*;/);
    expect(css).toMatch(/--type-ui-choice-size:\s*14px\s*;/);
    expect(css).toMatch(/--type-coach-size:\s*16px\s*;/);
    expect(css).toMatch(/--text-xs:\s*var\(--type-caption-size\)\s*;/);
  });

  it('MOB-TYPE-02 768px 이상에서 기존 태블릿 글자값을 복원해 확대를 거절한다', () => {
    const tabletRule = topLevelRules(css).find(
      ({ prelude }) => prelude === '@media (min-width: 768px)'
    );

    expect(tabletRule?.body).toMatch(/--type-display-1-size:\s*48px\s*;/);
    expect(tabletRule?.body).toMatch(/--type-title-size:\s*30px\s*;/);
    expect(tabletRule?.body).toMatch(/--type-label-size:\s*14px\s*;/);
    expect(tabletRule?.body).toMatch(/--type-caption-size:\s*12px\s*;/);
    expect(tabletRule?.body).toMatch(/--type-ui-compact-size:\s*10\.5px\s*;/);
  });

  it('MOB-ACTION-01 누를 수 있는 공통 요소에 100ms 이내 눌림 반응을 제공한다', () => {
    expect(css).toMatch(/transition-duration:\s*100ms\s*;/);
    expect(css).toMatch(/:not\(\[aria-disabled='true'\]\):active\s*\{/);
    expect(css).toMatch(/opacity:\s*0\.9\s*;/);
    expect(css).toMatch(/transform:\s*translateY\(1px\)\s*;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('MOB-TARGET-01 폰에서 공통 액션의 최소 누름 영역을 44px로 강제한다', () => {
    const phoneRule = topLevelRules(css).find(
      ({ prelude }) => prelude === '@media (max-width: 767.98px)'
    );

    expect(phoneRule?.body).toMatch(/button/);
    expect(phoneRule?.body).toMatch(/\[role='tab'\]/);
    expect(phoneRule?.body).toMatch(/min-width:\s*var\(--spacing-touch-min\)/);
    expect(phoneRule?.body).toMatch(/min-height:\s*var\(--spacing-touch-min\)/);
  });
});
