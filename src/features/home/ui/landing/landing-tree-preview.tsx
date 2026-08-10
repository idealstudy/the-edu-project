import { cn } from '@/shared/lib';

type Stage = 'untested' | 'weak' | 'progress' | 'mastered';

interface Node {
  label: string;
  stage: Stage;
  meta: string;
  blocked?: boolean;
  pct?: number;
}

// 약점 트리 미리보기 (랜딩 시그니처). 오렌지 강도 한 축.
const NODES: Node[] = [
  { label: '지수와 로그', stage: 'mastered', meta: '정복', pct: 100 },
  { label: '수열', stage: 'progress', meta: '진행', pct: 62 },
  { label: '삼각함수', stage: 'weak', meta: '약점', pct: 28, blocked: true },
  { label: '함수의 극한', stage: 'progress', meta: '진행', pct: 54 },
  { label: '미분', stage: 'weak', meta: '약점', pct: 19 },
  { label: '수학적 귀납법', stage: 'untested', meta: '미진단' },
];

const STAGE_BG: Record<Stage, string> = {
  untested: 'bg-tree-untested text-gray-9',
  weak: 'bg-tree-weak text-gray-11',
  progress: 'bg-tree-progress text-white',
  mastered: 'bg-tree-mastered text-white',
};

const LEGEND: { stage: Stage; label: string }[] = [
  { stage: 'mastered', label: '정복' },
  { stage: 'progress', label: '진행' },
  { stage: 'weak', label: '약점' },
  { stage: 'untested', label: '미진단' },
];

export function LandingTreePreview() {
  return (
    <section
      className={cn(
        'mx-auto flex w-full max-w-228 flex-col gap-6 px-6 py-14',
        'tablet:py-20'
      )}
    >
      <div className="flex flex-col gap-2">
        <span className="font-label-heading text-orange-7">
          내 약점 트리 · 수학 I
        </span>
        <h2
          className={cn(
            'font-headline1-heading text-balance',
            'tablet:font-title-heading'
          )}
        >
          채울수록 진해지는, 내 정복 지도
        </h2>
        <p className="font-label-normal text-gray-9 tablet:font-body2-normal">
          진할수록 정복. 옅으면 약점, 회색은 미진단. <span aria-hidden>⚠</span>{' '}
          = 반복해서 막힌 단원.
        </p>
      </div>

      <div className={cn('grid grid-cols-2 gap-3', 'tablet:grid-cols-3')}>
        {NODES.map((node) => (
          <div
            key={node.label}
            className={cn(
              'relative flex min-h-22 flex-col justify-between rounded-xl p-4',
              STAGE_BG[node.stage]
            )}
          >
            {node.blocked && (
              <span
                className="text-system-warning absolute top-3 right-3 text-sm"
                aria-label="반복해서 막힌 단원"
              >
                ⚠
              </span>
            )}
            <span className="font-body2-heading text-balance">
              {node.label}
            </span>
            <span className="font-caption-heading flex items-baseline gap-1.5 opacity-90">
              {node.meta}
              {node.pct !== undefined && (
                <span className="tabular-nums">· {node.pct}%</span>
              )}
            </span>
          </div>
        ))}
      </div>

      <div className="font-caption-heading text-gray-9 flex flex-wrap gap-x-4 gap-y-2">
        {LEGEND.map(({ stage, label }) => (
          <span
            key={stage}
            className="flex items-center gap-1.5"
          >
            <span
              className={cn(
                'h-3 w-3 rounded-full',
                STAGE_BG[stage].split(' ')[0]
              )}
              aria-hidden
            />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}
