'use client';

import { useStudentGrowthQuery } from '@/features/dashboard/hooks/use-growth-query';
import { useWrongAnswersQuery } from '@/features/dashboard/hooks/use-wrong-answer-query';
import { useMyPointWalletQuery } from '@/features/point/hooks/use-point';
import { useMemberStore } from '@/store';

const StudentDashboardHeader = ({
  initialMemberName,
  title = '내 학습',
}: {
  initialMemberName?: string;
  title?: string;
}) => {
  const storedMemberName = useMemberStore((state) => state.member?.name);
  const growthQuery = useStudentGrowthQuery();
  const pointQuery = useMyPointWalletQuery();
  const wrongAnswersQuery = useWrongAnswersQuery();
  const memberName = initialMemberName?.trim() || storedMemberName || '학생';
  const chips = [
    ['내 오답', `${wrongAnswersQuery.data?.totalCount ?? '-'}개`],
    ['연속', `${growthQuery.data?.streakDays ?? '-'}일`],
    ['레벨', `Lv.${growthQuery.data?.level ?? '-'}`],
    ['포인트', `${pointQuery.data?.balance.toLocaleString('ko-KR') ?? '-'}P`],
  ] as const;

  return (
    <header className="border-gray-3 bg-gray-white sticky top-0 z-20 border-b px-4 py-3 md:px-5.5">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-gray-12 text-coach font-extrabold">{title}</h1>
          <p className="text-gray-7 text-xs">{memberName} · 고2 수학</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {chips.map(([label, value]) => (
            <span
              key={label}
              className="border-gray-3 bg-gray-1 text-gray-8 text-ui-choice rounded-full border px-2.5 py-1 font-bold"
            >
              {label} <b className="text-gray-12 tabular-nums">{value}</b>
            </span>
          ))}
          <span className="bg-gray-11 flex size-8 items-center justify-center rounded-full text-xs font-extrabold text-white">
            {memberName.slice(0, 1)}
          </span>
        </div>
      </div>
    </header>
  );
};

export default StudentDashboardHeader;
