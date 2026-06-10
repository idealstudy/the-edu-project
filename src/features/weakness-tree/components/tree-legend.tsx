import { AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────────────
 * 범례 — 정복 / 진행 / 약점 / 미진단 / 막힘
 *  색은 오렌지 강도 한 축. "막힘"만 warning ⚠ 마커.
 * ────────────────────────────────────────────────────*/
const ITEMS: { label: string; swatch: string }[] = [
  { label: '정복', swatch: 'bg-tree-mastered' },
  { label: '진행', swatch: 'bg-tree-progress' },
  { label: '약점', swatch: 'bg-tree-weak' },
  { label: '미진단', swatch: 'bg-tree-untested border border-line-line2' },
];

export const TreeLegend = () => (
  <div className="border-line-line1 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border bg-white px-4 py-3">
    {ITEMS.map((item) => (
      <span
        key={item.label}
        className="flex items-center gap-2"
      >
        <span
          className={`size-4 rounded-[5px] ${item.swatch}`}
          aria-hidden
        />
        <span className="font-caption-heading text-text-sub1">
          {item.label}
        </span>
      </span>
    ))}
    <span className="flex items-center gap-1.5">
      <AlertTriangle
        size={15}
        className="text-system-warning"
        aria-hidden
      />
      <span className="font-caption-heading text-text-sub1">막힘</span>
    </span>
  </div>
);
