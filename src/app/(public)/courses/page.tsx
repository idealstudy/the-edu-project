import { CourseListClient } from '@/features/course';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: '코스',
  description: '과목별 코스를 둘러보고 무료 맛보기부터 시작해요.',
};

const MIRROR_QUESTIONS = [
  '문제집 1권, 끝까지 풀어본 적 있어?',
  '틀린 문제 다시 풀었어? 새 문제집만 샀지.',
  '완강하고 머리에 남은 거, 말로 해볼 수 있어?',
] as const;

export default function CoursesPage() {
  return (
    <div className="bg-gray-1 min-h-screen w-full">
      {/* 히어로 — 코스 존재 이유(왜 인강이 아니라 이 코스인지) */}
      <section className="bg-gray-12 relative -mx-0 overflow-hidden px-4 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-3">
          <span className="font-caption-heading text-orange-200">
            수학 매3제 · 관리형 코스
          </span>
          <h1 className="font-title-heading text-3xl text-balance text-white sm:text-4xl">
            1번을 공부해도, 제대로.
          </h1>
          <p className="font-body1-normal max-w-xl text-white/80">
            인강 듣고, 매일 3문제 꼼꼼히. 그게 전부예요.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1200px] px-4 pb-16 md:px-8 lg:px-12">
        {/* 거울 훅 — 결제 전 자기점검 3문 */}
        <section
          className="bg-gray-12 relative mt-6 overflow-hidden rounded-[20px] p-6 text-white sm:p-8"
          aria-labelledby="mirror-heading"
        >
          <span className="font-caption-heading text-orange-200">
            잠깐, 시작 전에
          </span>
          <h2
            id="mirror-heading"
            className="font-title-heading mt-2 text-balance text-white"
          >
            솔직히 하나만 묻자.
          </h2>
          <ul className="mt-4 flex flex-col divide-y divide-white/10">
            {MIRROR_QUESTIONS.map((q) => (
              <li
                key={q}
                className="font-body2-normal flex items-center gap-3 py-3 text-white/80"
              >
                <span className="font-caption-heading flex size-5 shrink-0 items-center justify-center rounded-[6px] bg-orange-200/15 text-orange-200">
                  ×
                </span>
                {q}
              </li>
            ))}
          </ul>
          <p className="font-body1-heading mt-5 border-t border-white/15 pt-4 text-white">
            공부를 안 한 게 아니다.{' '}
            <span className="text-orange-200">‘내 것으로’ 만드는 공부</span>를
            안 한 거다.
          </p>
        </section>

        {/* 정직 지표 스트립 — 실측 준비 전까지 라벨로 명시 */}
        <div className="border-line-line2 mt-6 grid grid-cols-2 divide-x divide-y-0 rounded-[14px] border bg-white sm:grid-cols-4">
          <ProofStat label="누적 수강" />
          <ProofStat label="완주자 평균 변화" />
          <ProofStat label="완주율" />
          <ProofStat label="수강 후기" />
        </div>

        <header className="mt-10 mb-6 flex flex-col gap-1">
          <h2 className="font-title-heading text-text-main text-balance">
            과목 선택
          </h2>
          <p className="font-body2-normal text-text-sub1">
            과목당 50~100일 · 관리형은 등급 향상 인증 시 전액 환급
          </p>
        </header>

        <CourseListClient />

        <div className="border-line-line2 mt-8 flex items-center justify-center gap-2 rounded-[12px] border border-dashed bg-white p-4 text-center">
          <ShieldCheck
            size={16}
            className="text-key-color-primary shrink-0"
            aria-hidden="true"
          />
          <span className="font-caption-normal text-text-sub1">
            관리형 등급 향상 인증 시 전액 환급 — 조건은 각 코스 상세에서 결제 전
            확인할 수 있어요.
          </span>
        </div>
      </div>
    </div>
  );
}

const ProofStat = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-5 text-center">
    <span className="font-caption-heading text-text-sub2">{label}</span>
    <span className="font-caption-normal text-text-sub2">
      실측 데이터 준비 중
    </span>
  </div>
);
