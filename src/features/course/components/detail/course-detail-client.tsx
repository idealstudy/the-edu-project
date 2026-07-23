'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { type Lesson } from '@/entities/course';
import { useSession } from '@/providers';
import { Button } from '@/shared/components/ui';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CirclePlay,
  Lock,
  ShieldCheck,
  X,
} from 'lucide-react';

import {
  useCourseDetailQuery,
  useCourseLessonsQuery,
} from '../../hooks';
import {
  courseSubjectLabel,
  groupLessonsByUnit,
  isFreeCourse,
  priceLabel,
} from '../../lib/format';
import { LessonRow } from '../common/lesson-row';
import { CourseTierSection } from './course-tier-section';

const HERO_COVER_URL =
  'https://cdn0000.airklass.com/videos/0000428465/screenshot-w720-h480?v=3452735007';

const FAQS = [
  {
    question: '하루에 얼마나 걸리나요?',
    answer:
      '강의 시청과 오늘의 문제를 합쳐 약 40~60분을 기준으로 설계했어요. 실제 소요 시간은 현재 학습 수준과 제출물에 따라 달라질 수 있어요.',
  },
  {
    question: '하루를 밀리면 어떻게 되나요?',
    answer:
      '다음 차시는 이전 학습을 끝낸 뒤 열려요. 앞부분을 건너뛰게 하지 않는 것이 이 코스의 학습 방식이에요.',
  },
  {
    question: '환급 조건이 까다롭지 않나요?',
    answer:
      '관리형의 환급은 제출 기준과 등급 인증을 모두 충족했을 때만 적용돼요. 기준을 충족하지 못하면 환급되지 않는다는 점을 결제 전에 안내합니다.',
  },
  {
    question: '학부모도 진도를 확인할 수 있나요?',
    answer:
      '학부모 리포트 제공 범위는 선택한 티어에 따라 달라요. 1:1 티어는 상담 후 배정 범위가 확정됩니다.',
  },
] as const;

const VILLAINS = [
  ['유형 1', '인강 시즌3', '들으면 다 아는 것 같은데, 시험장에서는 첫 줄부터 막혀요.'],
  ['유형 2', '새 문제집 수집가', '안 풀리면 새 문제집을 사고, 앞 단원만 계속 반복해요.'],
  ['유형 3', '답지 번역가', '답지를 보면 이해하지만 내 손으로는 다시 풀지 못해요.'],
] as const;

type CourseDetailClientProps = { courseId: number };

/*
 * 공개 코스 상세 — API가 제공하는 코스/차시 데이터와 승인된 세일즈 아크를 결합한다.
 * 후기·강사 이력·성과 수치처럼 API/운영 데이터가 없는 정보는 슬롯으로만 노출한다.
 */
export const CourseDetailClient = ({ courseId }: CourseDetailClientProps) => {
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const loginHref = `${PUBLIC.CORE.LOGIN}?redirect=${encodeURIComponent(
    PUBLIC.COURSE.DETAIL(courseId)
  )}`;

  const {
    data: course,
    isLoading,
    isError,
    refetch,
  } = useCourseDetailQuery(courseId);
  const { data: lessons } = useCourseLessonsQuery(courseId, {
    // 공용 상세에서 private 차시 API를 호출하지 않아 401 화면을 만들지 않는다.
    enabled: isAuthenticated,
  });
  // 수강 신청/구매는 CourseTierSection 이 자체 처리한다(3티어별 구매).

  if (isLoading) return <CourseDetailSkeleton />;

  if (isError || !course) {
    return (
      <div className="border-line-line2 flex flex-col items-center gap-3 rounded-[12px] border bg-white p-12 text-center">
        <p className="font-body2-normal text-text-sub1">
          코스를 불러오지 못했어요.
        </p>
        <Button
          variant="outlined"
          size="small"
          onClick={() => refetch()}
        >
          다시 시도
        </Button>
      </div>
    );
  }

  const hasLockedLesson = lessons?.some((lesson) => lesson.isLocked) ?? false;
  const isEnrolled = isAuthenticated && lessons != null && !hasLockedLesson;
  const free = isFreeCourse(course.price);

  const handleLessonSelect = (lesson: Lesson) => {
    if (lesson.isLocked) return;
    router.push(
      `${PRIVATE.COURSE.LEARN(courseId)}?lesson=${lesson.lessonId}`
    );
  };

  return (
    <div className="pb-24 lg:pb-0">
      <section
        className="relative -mx-4 overflow-hidden bg-[#17130f] px-4 py-14 text-white sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-[20px] lg:px-10"
        aria-labelledby="course-title"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${HERO_COVER_URL})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#17130f] via-[#17130f]/70 to-[#17130f]/20"
          aria-hidden="true"
        />
        <div className="relative flex max-w-3xl flex-col gap-4">
          <span className="font-caption-heading text-orange-200">
            하루 3문제 · 숨은 등급 찾기
          </span>
          <div className="flex flex-col gap-3">
            <h1
              id="course-title"
              className="font-title-heading text-balance text-3xl text-white sm:text-4xl"
            >
              {course.title}
            </h1>
            <p className="font-body1-normal max-w-xl text-white/80">
              {course.description ??
                '강의를 듣고 끝내지 않고, 오늘의 문제와 제출로 배운 내용을 내 것으로 만드는 코스예요.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/75">
            <span>
              <b className="text-white">{course.lessonCount}차시</b> 커리큘럼
            </span>
            <span>
              매일 <b className="text-white">3제</b> 학습
            </span>
            <span>
              <b className="text-white">50~100일</b> 학습 설계
            </span>
            <span>관리형 등급 인증 시 전액 환급</span>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-white/15">
              <BookOpen size={18} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-caption-heading">강사 정보 준비 중</span>
              <span className="font-caption-normal text-white/65">
                검증된 강사 이력은 등록 후 공개합니다.
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="border-line-line2 grid grid-cols-1 divide-y border-x border-b bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <ProofSlot label="누적 수강" />
        <ProofSlot label="완주 변화" />
        <ProofSlot label="수강 후기" />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <UnavailableOffer
          icon={<CirclePlay size={20} aria-hidden="true" />}
          title="무료 OT 준비 중"
          description="결제 전에 학습 방식을 확인할 수 있는 영상입니다."
          label="공개 준비 중"
        />
        <UnavailableOffer
          icon={<BookOpen size={20} aria-hidden="true" />}
          title="무료 5문제 진단 준비 중"
          description="시작 단원을 찾는 진단은 검증을 마친 뒤 공개합니다."
          label="공개 준비 중"
        />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <main className="flex min-w-0 flex-col gap-12">
          <section aria-labelledby="problem-heading">
            <span className="font-caption-heading text-key-color-primary">
              이 중 하나면, 당신 얘기입니다
            </span>
            <h2
              id="problem-heading"
              className="font-title-heading mt-2 text-balance text-text-main"
            >
              열심히 하는데 등급이 안 움직이는 세 가지 유형
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {VILLAINS.map(([number, title, description]) => (
                <article
                  key={number}
                  className="border-line-line2 rounded-[14px] border bg-white p-5"
                >
                  <span className="font-caption-heading text-key-color-primary">
                    {number}
                  </span>
                  <h3 className="font-body1-heading mt-2 text-text-main">
                    {title}
                  </h3>
                  <p className="font-body2-normal mt-2 text-text-sub1">
                    {description}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-4 rounded-[14px] bg-[#17130f] p-5 text-white">
              <span className="font-caption-heading text-orange-200">
                셋의 원인은 하나입니다
              </span>
              <p className="font-body1-heading mt-1">
                들은 개념이 아니라, 내 손으로 다시 꺼낸 개념만 시험장에 남습니다.
              </p>
            </div>
          </section>

          <section aria-labelledby="method-heading">
            <span className="font-caption-heading text-key-color-primary">
              강의는 입구일 뿐입니다
            </span>
            <h2
              id="method-heading"
              className="font-title-heading mt-2 text-balance text-text-main"
            >
              새 문제집 대신, 핵심 문제를 될 때까지
            </h2>
            <div className="mt-5 grid overflow-hidden rounded-[14px] border border-[#e7ddd7] md:grid-cols-2">
              <ComparisonColumn
                title="그냥 인강"
                muted
                items={[
                  '듣고 나면 남는 게 없다',
                  '틀리면 새 문제집을 산다',
                  '완강해도 실전에서 막힌다',
                ]}
              />
              <ComparisonColumn
                title="이 코스의 학습"
                items={[
                  '개념을 내 말로 정리해 제출',
                  '매일 선별 문제를 다시 풀이',
                  '이전 학습을 마쳐야 다음 단계가 열린다',
                ]}
              />
            </div>
            <ol className="mt-5 flex flex-col divide-y divide-[#e7ddd7] rounded-[14px] border border-[#e7ddd7] bg-white px-5">
              <MethodStep
                number="01"
                title="개념을 내 말로 정리하고 제출"
                description="시청자에 머물지 않도록, 학습한 개념을 직접 정리하는 단계예요."
              />
              <MethodStep
                number="02"
                title="매일 3제와 조건 해석"
                description="문제 수를 늘리기보다 오늘의 핵심 조건을 읽고 풀이하는 훈련에 집중해요."
              />
              <MethodStep
                number="03"
                title="선별 문제를 다시, 될 때까지"
                description="틀린 문제를 지나치지 않고 다시 풀어, 손에 남는 학습으로 연결합니다."
              />
            </ol>
            <div className="mt-4 rounded-[14px] bg-orange-50 p-5">
              <p className="font-body2-heading text-text-main">
                선별된 핵심 문제 · 목표 10회독
              </p>
              <div className="mt-3 flex gap-1.5" aria-label="목표 10회독 중 7회독 예시">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className={`size-3 rounded-full ${
                      index < 7 ? 'bg-key-color-primary' : 'bg-orange-200'
                    }`}
                  />
                ))}
              </div>
              <p className="font-caption-normal mt-3 text-text-sub1">
                회독 상태는 학습이 시작된 뒤 실제 제출·풀이 기록으로 표시됩니다.
              </p>
            </div>
            <div className="border-line-line2 mt-4 rounded-[14px] border bg-white p-5">
              <p className="font-body2-heading text-text-main">
                50일 뒤, 완주자 평균 궤적{' '}
                <sup className="font-caption-normal text-text-sub2">*</sup>
              </p>
              <svg
                viewBox="0 0 320 110"
                className="mt-3 w-full"
                role="img"
                aria-label="완주자 평균 등급 곡선 예시: Day 1 3.9등급에서 Day 50 2.1등급으로 상승"
              >
                <line x1="10" y1="90" x2="310" y2="90" stroke="#eeeae6" strokeWidth="1" />
                <path
                  d="M20 78 C 90 74, 150 52, 200 38 S 280 20, 300 16"
                  fill="none"
                  stroke="#ff4805"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="20" cy="78" r="4" fill="#ffbaa9" />
                <circle cx="160" cy="46" r="4" fill="#ff714e" />
                <circle cx="300" cy="16" r="5" fill="#ff4805" />
                <text x="20" y="103" fontSize="10" fill="#adadad" textAnchor="middle">
                  Day 1
                </text>
                <text x="160" y="103" fontSize="10" fill="#adadad" textAnchor="middle">
                  Day 25
                </text>
                <text x="295" y="103" fontSize="10" fill="#7c7c7c" fontWeight="700" textAnchor="middle">
                  Day 50
                </text>
              </svg>
              <p className="font-caption-normal mt-2 text-text-sub2">
                * 예시 시드 데이터입니다. 실측 완주자 데이터가 쌓이기 전까지는
                성적 보장이 아닌 학습 설계 방향을 보여드리는 참고 곡선이에요.
              </p>
            </div>
          </section>

          <CourseCurriculum
            lessonCount={course.lessonCount}
            lessons={lessons}
            isAuthenticated={isAuthenticated}
            onSelect={handleLessonSelect}
          />

          <section aria-labelledby="review-heading">
            <span className="font-caption-heading text-key-color-primary">
              수강 후기
            </span>
            <h2
              id="review-heading"
              className="font-title-heading mt-2 text-text-main"
            >
              먼저 완주한 사람들의 목소리
            </h2>
            <div className="border-line-line2 mt-5 rounded-[14px] border border-dashed bg-white p-6 text-center">
              <p className="font-body2-heading text-text-main">
                검증된 수강 후기를 준비 중이에요.
              </p>
              <p className="font-caption-normal mt-2 text-text-sub2">
                등급 변화와 후기 수는 운영에서 확인한 실측 데이터만 공개합니다.
              </p>
            </div>
          </section>

          <section id="course-tiers" aria-labelledby="tier-heading">
            <span className="font-caption-heading text-key-color-primary">
              학습 방식 선택
            </span>
            <h2
              id="tier-heading"
              className="font-title-heading mt-2 text-balance text-text-main"
            >
              관리 강도에 맞는 티어를 고르세요
            </h2>
            <p className="font-body2-normal mt-3 text-text-sub1">
              강의만 듣는 자율형부터 매일 검수와 환급을 포함한 관리형까지,
              필요한 도움의 정도가 달라요.
            </p>
            <div className="mt-5">
              <CourseTierSection
                courseId={courseId}
                isAuthenticated={isAuthenticated}
                onRequireLogin={() => router.push(loginHref)}
              />
            </div>
          </section>

          <section className="rounded-[16px] bg-[#17130f] p-6 text-white" aria-labelledby="refund-heading">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-orange-200" size={22} />
              <div>
                <span className="font-caption-heading text-orange-200">
                  관리형 환급 서약
                </span>
                <h2 id="refund-heading" className="font-body1-heading mt-1">
                  조건을 결제 전에 전부 보여드립니다.
                </h2>
              </div>
            </div>
            <ol className="mt-5 flex flex-col gap-3 text-sm text-white/80">
              <li>1. 매일 제출과 출석 기준을 모두 충족해야 합니다.</li>
              <li>2. 코스 종료 후 정해진 기간 안에 등급 인증을 신청해야 합니다.</li>
              <li>3. 기준 미달 또는 등급 미달이면 환급되지 않습니다.</li>
            </ol>
            <p className="mt-5 border-t border-white/15 pt-4 text-xs text-white/55">
              정확한 적용 범위와 인증 기한은 선택한 상품의 결제 전 고지에서 다시
              확인합니다.
            </p>
          </section>

          <section aria-labelledby="faq-heading">
            <span className="font-caption-heading text-key-color-primary">
              결제를 막는 마지막 질문
            </span>
            <h2 id="faq-heading" className="font-title-heading mt-2 text-text-main">
              자주 묻는 질문
            </h2>
            <div className="border-line-line2 mt-5 overflow-hidden rounded-[14px] border bg-white">
              {FAQS.map((faq) => (
                <details key={faq.question} className="group border-b border-[#e7ddd7] last:border-b-0">
                  <summary className="font-body2-heading flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-text-main">
                    {faq.question}
                    <ChevronDown
                      size={18}
                      className="shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="font-body2-normal px-5 pb-5 text-text-sub1">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <div className="rounded-[16px] bg-gradient-to-b from-transparent to-orange-50 px-4 py-8 text-center">
            <p className="font-title-heading text-balance text-text-main">
              새 문제집을 또 사는 대신,{' '}
              <span className="text-key-color-primary">이 문제를 될 때까지.</span>
            </p>
            <p className="font-caption-normal mt-2 text-text-sub1">
              오늘 시작하면 첫 검수는 다음 학습일에 도착해요.
            </p>
            <Button asChild size="medium" className="mt-4">
              <a href="#course-tiers">
                숨은 등급 찾기 시작 <ArrowRight size={16} aria-hidden="true" />
              </a>
            </Button>
          </div>

          <p className="font-caption-normal border-t border-[#e7ddd7] pt-5 text-text-sub2">
            수강생 수·성적 변화·후기는 실측 데이터가 준비되기 전까지 표시하지
            않습니다.
          </p>
        </main>

        <aside className="border-line-line2 hidden flex-col gap-4 rounded-[16px] border bg-white p-5 lg:sticky lg:top-6 lg:flex">
          <span className="font-caption-heading text-key-color-primary">
            {courseSubjectLabel(course.subject)} · {course.lessonCount}차시
          </span>
          <div>
            <p className="font-body1-heading text-text-main">{course.title}</p>
            <p className="font-caption-normal mt-1 text-text-sub2">
              {free ? '무료 수강 가능' : `기본 수강료 ${priceLabel(course.price)}`}
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {[
              `${course.lessonCount}차시 커리큘럼 + 매일 3제 검수`,
              '개념노트 제출·검토',
              '학부모 주간 리포트 (관리형)',
            ].map((item) => (
              <li
                key={item}
                className="font-caption-normal flex items-start gap-1.5 text-text-sub1"
              >
                <Check size={14} className="text-key-color-primary mt-0.5 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-orange-1 rounded-[10px] p-3">
            <p className="font-caption-heading text-text-main">
              관리형은 등급 인증 시 전액 환급
            </p>
            <p className="font-caption-normal mt-1 text-text-sub1">
              기준 미달 시 환급되지 않아요.
            </p>
          </div>
          <UnavailableOffer
            icon={<CirclePlay size={18} aria-hidden="true" />}
            title="무료 OT 준비 중"
            description="결제 전 학습 방식 확인 영상"
            label="준비 중"
          />
          {isEnrolled ? (
            <Button asChild size="medium" className="w-full">
              <Link href={PRIVATE.COURSE.LEARN(courseId)}>오늘의 Day 이어가기</Link>
            </Button>
          ) : (
            <Button asChild size="medium" className="w-full">
              <a href="#course-tiers">티어 선택하기</a>
            </Button>
          )}
          {hasLockedLesson && (
            <p className="font-caption-normal flex gap-1.5 text-text-sub2">
              <Lock size={14} className="mt-0.5 shrink-0" />
              잠긴 차시는 선택한 티어의 수강 신청 후 열려요.
            </p>
          )}
        </aside>
      </div>

      <div className="border-line-line2 fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(23,19,15,0.12)] backdrop-blur lg:hidden">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-caption-heading truncate text-text-main">
            {free ? '무료 수강' : priceLabel(course.price)}
          </span>
          <span className="font-caption-normal truncate text-text-sub2">
            관리형 등급 인증 시 전액 환급
          </span>
        </div>
        {isEnrolled ? (
          <Button asChild size="medium" className="shrink-0">
            <Link href={PRIVATE.COURSE.LEARN(courseId)}>이어서 학습</Link>
          </Button>
        ) : (
          <Button asChild size="medium" className="shrink-0">
            <a href="#course-tiers">
              티어 선택 <ArrowRight size={16} aria-hidden="true" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

const ProofSlot = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-5 text-center">
    <span className="font-caption-heading text-text-sub2">{label}</span>
    <span className="font-caption-normal text-text-sub2">실측 데이터 준비 중</span>
  </div>
);

const UnavailableOffer = ({
  icon,
  title,
  description,
  label,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  label: string;
}) => (
  <div className="border-line-line2 flex items-center gap-3 rounded-[14px] border bg-white p-4">
    <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full">
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="font-body2-heading text-text-main">{title}</span>
      <span className="font-caption-normal text-text-sub2">{description}</span>
    </span>
    <span className="font-caption-heading shrink-0 text-text-sub2">{label}</span>
  </div>
);

const ComparisonColumn = ({
  title,
  items,
  muted = false,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) => (
  <div className={muted ? 'bg-gray-1 p-5' : 'bg-orange-50 p-5'}>
    <h3 className="font-body1-heading text-text-main">{title}</h3>
    <ul className="mt-4 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="font-caption-normal flex items-start gap-2 text-text-sub1">
          {muted ? (
            <X size={15} className="mt-0.5 shrink-0 text-text-sub2" aria-hidden="true" />
          ) : (
            <Check size={15} className="text-key-color-primary mt-0.5 shrink-0" aria-hidden="true" />
          )}
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const MethodStep = ({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <li className="flex gap-4 py-5">
    <span className="font-caption-heading text-key-color-primary">{number}</span>
    <div>
      <h3 className="font-body2-heading text-text-main">{title}</h3>
      <p className="font-caption-normal mt-1 text-text-sub1">{description}</p>
    </div>
  </li>
);

const CourseCurriculum = ({
  lessonCount,
  lessons,
  isAuthenticated,
  onSelect,
}: {
  lessonCount: number;
  lessons: Lesson[] | undefined;
  isAuthenticated: boolean;
  onSelect: (lesson: Lesson) => void;
}) => (
  <section aria-labelledby="curriculum-heading">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <span className="font-caption-heading text-key-color-primary">실제 학습 순서</span>
        <h2 id="curriculum-heading" className="font-title-heading mt-2 text-text-main">
          {lessonCount}차시 커리큘럼
        </h2>
      </div>
      <span className="font-caption-normal text-text-sub2">
        제출해야 다음 단계가 열려요
      </span>
    </div>
    {isAuthenticated && lessons ? (
      lessons.length > 0 ? (
        <div className="mt-5 flex flex-col gap-6">
          {groupLessonsByUnit(lessons).map((unit) => (
            <div key={unit.unitName}>
              <div className="mb-2.5 flex items-center gap-2">
                <span className="font-caption-heading flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-text-main text-[12px] font-extrabold text-white">
                  {unit.unitName === '기타' ? '−' : unit.unitName.slice(0, 1)}
                </span>
                <span className="font-body2-heading text-text-main">
                  {unit.unitName}
                </span>
                <span className="font-caption-normal ml-auto text-text-sub2">
                  {unit.lessons.length}강
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {unit.lessons.map((lesson) => {
                  const globalIndex = lessons.findIndex(
                    (l) => l.lessonId === lesson.lessonId
                  );
                  return (
                    <LessonRow
                      key={lesson.lessonId}
                      lesson={lesson}
                      index={globalIndex}
                      interactive
                      onSelect={onSelect}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CurriculumEmpty text="아직 등록된 차시가 없어요." />
      )
    ) : (
      <CurriculumEmpty text="차시 제목과 무료 미리보기 범위는 로그인 후 실제 수강 데이터로 보여드려요." />
    )}
  </section>
);

const CurriculumEmpty = ({ text }: { text: string }) => (
  <div className="border-line-line2 mt-5 flex flex-col items-center gap-2 rounded-[14px] border border-dashed bg-white p-7 text-center">
    <BookOpen size={20} className="text-key-color-primary" aria-hidden="true" />
    <p className="font-body2-normal text-text-sub1">{text}</p>
  </div>
);

const CourseDetailSkeleton = () => (
  <div className="flex flex-col gap-6">
    <div className="h-96 animate-pulse rounded-[20px] bg-gray-1" />
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-[14px] bg-gray-1" />
        ))}
      </div>
      <div className="h-60 animate-pulse rounded-[14px] bg-gray-1" />
    </div>
  </div>
);
