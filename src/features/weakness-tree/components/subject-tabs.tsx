import { type TreeSubjectGroup } from '@/entities/tree';
import { cn } from '@/shared/lib';

const SUBJECT_LABEL: Record<TreeSubjectGroup['subject'], string> = {
  MIDDLE_MATH: '중학',
  COMMON_MATH_1: '공통수학1',
  COMMON_MATH_2: '공통수학2',
  ALGEBRA: '대수',
  CALCULUS_1: '미적분Ⅰ',
  CALCULUS_2: '미적분Ⅱ',
  MATH_1: '대수',
  MATH_2: '미적분Ⅰ',
  CALCULUS: '미적분Ⅱ',
  PROBABILITY_STATISTICS: '확률과 통계',
  GEOMETRY: '기하',
  OTHER: '기타',
};

export const ALL_TAB = 'ALL' as const;
export type SubjectTabValue = TreeSubjectGroup['subject'] | typeof ALL_TAB;

type SubjectTabsProps = {
  groups: TreeSubjectGroup[];
  value: SubjectTabValue;
  onChange: (value: SubjectTabValue) => void;
};

/* ─────────────────────────────────────────────────────
 * 과목 탭 — v4 .tabs 이식 (전체 / 과목별)
 * ────────────────────────────────────────────────────*/
export const SubjectTabs = ({ groups, value, onChange }: SubjectTabsProps) => {
  if (groups.length <= 1) return null;

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-0.5"
      role="tablist"
      aria-label="과목 선택"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === ALL_TAB}
        onClick={() => onChange(ALL_TAB)}
        className={cn(
          'border-line-line1 font-body2-heading min-h-11 shrink-0 rounded-full border px-4.5 py-2',
          value === ALL_TAB
            ? 'bg-gray-12 border-gray-12 text-white'
            : 'text-text-sub1 bg-white'
        )}
      >
        전체
      </button>
      {groups.map((group) => (
        <button
          key={group.subject}
          type="button"
          role="tab"
          aria-selected={value === group.subject}
          onClick={() => onChange(group.subject)}
          className={cn(
            'border-line-line1 font-body2-heading min-h-11 shrink-0 rounded-full border px-4.5 py-2',
            value === group.subject
              ? 'bg-gray-12 border-gray-12 text-white'
              : 'text-text-sub1 bg-white'
          )}
        >
          {SUBJECT_LABEL[group.subject]}
        </button>
      ))}
    </div>
  );
};
