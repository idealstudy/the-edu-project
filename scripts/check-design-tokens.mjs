#!/usr/bin/env node
/**
 * check-design-tokens.mjs — 디자인 시스템 밖 하드코딩 감시 (2026-08-10 신설)
 *
 * ── 왜 생겼나 (근본원인) ──
 * 회장이 dev 를 쓰고 "레이아웃 배치가 일관적이지 않고, 여백이 없거나 과하다"고 지적했다.
 * 조사해보니 화면 코드에 손으로 박은 색 793건, 임의 여백 820건, 공용 부품을 안 쓴 버튼 220건이었다.
 *
 * 개발이 게을러서가 아니었다. 개발 지침이 "프로토타입을 그대로 재현하라"인데
 * 프로토타입은 색·여백을 인라인으로 박은 HTML 이라, **하드코딩을 충실히 옮기는 것이 정답 판정**을 받았다.
 *
 * 2026-08-10 에 전부 토큰으로 옮겼다(색 793→132, 임의 px 820→0).
 * 그런데 **다시 쌓이는 것을 막는 장치가 없다.** 이 검사가 그 자리다.
 *
 * 하는 일: 화면 코드에서 아래를 세고, 기준선을 넘으면 실패시킨다.
 *   ① 손으로 박은 색 (#rrggbb)
 *   ② 임의 여백·크기 ([16px] 형태)
 *   ③ 공용 부품을 안 쓴 버튼 (원시 <button>)
 *
 * 기준선은 "지금 값"이다. 줄이는 것은 언제나 통과, 늘리는 것만 막는다.
 * 기준선을 낮추면 그만큼 되돌아갈 수 없게 된다(래칫).
 *
 * 사용: node scripts/check-design-tokens.mjs [--update]
 *   --update 를 주면 현재 값으로 기준선을 갱신한다(줄었을 때만 허용).
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src', 'features');
const baselinePath = join(root, 'scripts', 'design-token-baseline.json');

const RULES = {
  hardcodedColor: {
    label: '손으로 박은 색',
    re: /#[0-9a-fA-F]{6}\b/g,
    hint: 'globals.css 의 토큰(예: text-gray-9, bg-orange-7)을 쓰세요.',
  },
  arbitrarySpacing: {
    label: '임의 여백·크기',
    re: /\[[0-9]+px\]/g,
    hint: '간격 토큰(gap-block-gap, p-card-pad 등) 또는 표준 스케일을 쓰세요.',
  },
  rawButton: {
    label: '공용 부품을 안 쓴 버튼',
    re: /<button[\s>]/g,
    hint: 'shared/components/ui 의 Button 을 쓰세요. 형태가 다르면 variant 를 추가하세요.',
  },
};

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx|jsx|ts)$/.test(name) && !/\.(test|spec|stories)\./.test(name)) out.push(p);
  }
  return out;
};

if (!existsSync(target)) {
  console.log('SKIP: src/features 없음');
  process.exit(0);
}

const files = walk(target);
const counts = Object.fromEntries(Object.keys(RULES).map((k) => [k, 0]));
const worst = Object.fromEntries(Object.keys(RULES).map((k) => [k, []]));

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const [key, rule] of Object.entries(RULES)) {
    const n = (src.match(rule.re) || []).length;
    if (n > 0) {
      counts[key] += n;
      worst[key].push({ file: f.replace(root + '/', ''), n });
    }
  }
}

const update = process.argv.includes('--update');
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : null;

if (!baseline || update) {
  const next = { ...counts, _note: '기준선. 줄이는 것만 허용(래칫). 늘리려면 사유를 남기고 이 파일을 고치세요.' };
  if (baseline && update) {
    const grew = Object.keys(RULES).filter((k) => counts[k] > baseline[k]);
    if (grew.length) {
      console.error(`거부: 늘어난 항목이 있어 기준선을 갱신할 수 없습니다 — ${grew.join(', ')}`);
      process.exit(2);
    }
  }
  writeFileSync(baselinePath, JSON.stringify(next, null, 2) + '\n');
  console.log('기준선 기록:', counts);
  process.exit(0);
}

let failed = false;
for (const [key, rule] of Object.entries(RULES)) {
  const now = counts[key];
  const base = baseline[key] ?? 0;
  const mark = now > base ? '⛔' : now < base ? '↓' : '=';
  console.log(`${mark} ${rule.label}: ${now} (기준 ${base})`);
  if (now > base) {
    failed = true;
    const top = worst[key].sort((a, b) => b.n - a.n).slice(0, 5);
    for (const t of top) console.log(`     ${t.file} — ${t.n}건`);
    console.log(`     → ${rule.hint}`);
  }
}

if (failed) {
  console.log('');
  console.log('디자인 시스템 밖 코드가 늘었습니다. 이대로 두면 화면이 다시 제각각이 됩니다.');
  console.log('토큰과 공용 부품으로 바꾸거나, 부득이하면 사유를 남기고 기준선을 조정하세요.');
  process.exit(2);
}

console.log('OK: 디자인 시스템 밖 코드가 늘지 않았습니다.');
