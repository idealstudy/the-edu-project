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
