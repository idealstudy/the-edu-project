'use client';

import { cn } from '@/shared/lib';

/**
 * 학부모 주간 안심 카드 — MVP-G v3. 응시 횟수·할 일 완료율·스트릭·점수 흐름·선생님 한마디를
 * 한 장으로 모은 보기 전용 카드(독려 버튼 없음 — 회장 확정: 학부모는 보는 사람).
 * ⛔ 백엔드 계약 필요: 응시장/성장(스트릭·xp) 도메인이 아직 없어 집계할 값이 없다.
 * 실제 지표가 없는 채로 숫자를 지어내지 않고 준비중 상태만 노출한다.
 */
export const WeeklyReassuranceCard = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-2xl border p-6',
        className
      )}
    >
      <h3 className="font-body1-heading text-gray-12">주간 안심 카드</h3>
      <p className="font-body2-normal text-gray-8 mt-2 leading-relaxed">
        응시 횟수·할 일 완료율·연속 학습일·점수 흐름을 한 주 단위로 모아
        보여드릴 예정이에요. 원점수·오답 상세는 선생님이 공유를 승인한
        범위만 노출돼요.
      </p>
      <div className="border-gray-2 bg-gray-1 mt-4 flex flex-col items-center gap-1 rounded-xl border py-6 text-center">
        <p className="font-body2-heading text-gray-10">준비 중이에요</p>
        <p className="font-caption-normal text-gray-8">
          응시장·성장 지표가 쌓이면 이 카드에 나타나요
        </p>
      </div>

      {/* MVP-G v4 — 학부모 신뢰 각주(신규). "공유 안 함"을 숨기지 않고 구조로 설명한다. */}
      <div className="border-gray-4 mt-4 rounded-xl border p-3.5">
        <p className="font-caption-normal text-gray-9 leading-relaxed">
          <span aria-hidden className="mr-1">
            🔒
          </span>
          아이가 매일 쓰는 회고와 AI 코멘트는 부모님께 공유되지 않아요. 아이가
          솔직하게 기록할 수 있도록 선생님과 본인만 볼 수 있는 공간으로
          운영돼요.
        </p>
      </div>
    </section>
  );
};
