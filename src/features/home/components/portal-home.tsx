'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  consultationCaseKeys,
  repository as consultationRepository,
} from '@/entities/consultation-lead';
import { useColumnList } from '@/features/community/column/hooks/use-column-list';
import { useCoursesQuery } from '@/features/course/hooks';
import {
  useOpenChallengeDetailQuery,
  useOpenChallengeListQuery,
} from '@/features/open-challenge/hooks/use-open-challenge';
import { MENTOR_PROFILE } from '@/features/teachers/mentor-profile';
import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight, RefreshCw } from 'lucide-react';

const cardClass =
  'overflow-hidden rounded-[18px] border border-gray-3 bg-white shadow-[0_3px_12px_rgba(26,26,26,0.06)] transition duration-200 hover:-translate-y-px hover:shadow-[0_9px_24px_rgba(26,26,26,0.12)]';

function ModuleHeading({
  title,
  description,
  href,
  more,
}: {
  title: string;
  description: string;
  href: string;
  more: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-headline2-heading border-gray-12 text-gray-12 inline-block border-b-2 pb-2">
          {title}
        </h2>
        <p className="text-gray-8 mt-2 text-sm leading-6">{description}</p>
      </div>
      <Link
        href={href}
        className="focus-ring text-orange-8 inline-flex shrink-0 items-center gap-1 text-sm font-semibold"
      >
        {more}
        <ChevronRight
          size={16}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

function ModuleState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="border-gray-3 rounded-[18px] border bg-white px-6 py-10 text-center">
      <p className="font-body2-heading text-gray-11">{message}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="focus-ring text-orange-8 hover:bg-orange-1 mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-semibold"
        >
          <RefreshCw
            size={16}
            aria-hidden="true"
          />
          다시 불러오기
        </button>
      )}
    </div>
  );
}

function PortalHero() {
  return (
    <section
      aria-label="디에듀 소개"
      className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.82),transparent_22%),radial-gradient(circle_at_68%_75%,rgba(255,145,123,0.54),transparent_28%),linear-gradient(135deg,var(--orange-1),var(--orange-2),#ffdccf)] px-6 py-9 shadow-[0_9px_28px_rgba(209,56,0,0.12)] sm:px-10 sm:py-12"
    >
      <div className="relative z-10 max-w-[620px]">
        <span className="bg-gray-12 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white">
          <span className="bg-orange-5 h-1.5 w-1.5 rounded-full" />
          이상한수학 · 중위권 수학 관리
        </span>
        <h1 className="text-gray-12 mt-5 text-[34px] leading-[1.2] font-bold tracking-[-0.055em] sm:text-[42px]">
          오늘 한 문제, <em className="text-orange-8 not-italic">자력으로.</em>
          <br />
          숨은 등급을 찾습니다.
        </h1>
        <p className="text-gray-10 mt-5 max-w-[530px] text-base leading-7 sm:text-lg">
          해설을 열기 전에 스스로 버틴 시간만 실력으로 남깁니다. 가입 전에도
          오늘의 문제를 풀고, 약점 트리를 채워보세요.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            size="medium"
            className="shadow-[0_5px_0_var(--orange-10)] active:translate-y-[2px] active:shadow-[0_3px_0_var(--orange-10)]"
          >
            <Link href="#today-challenge">
              무료로 오늘의 문제 풀기 <ArrowRight size={17} />
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            size="medium"
            className="bg-white/80"
          >
            <Link href={PUBLIC.CONSULT.INDEX}>고민 비공개로 올리기</Link>
          </Button>
        </div>
        <div className="border-orange-4 mt-8 grid max-w-[500px] grid-cols-3 gap-3 border-t pt-5">
          {MENTOR_PROFILE.facts.map((fact) => (
            <div key={fact.label}>
              <p className="text-orange-9 text-xl font-extrabold tabular-nums sm:text-2xl">
                {fact.value}
              </p>
              <p className="text-gray-9 mt-1 text-xs leading-4">{fact.label}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-9 mt-4 text-xs">
          경력·상담·배출 수치는 실제 값입니다.
        </p>
      </div>
      <div className="relative z-10 mt-8 ml-auto w-full max-w-[290px] sm:absolute sm:right-8 sm:bottom-[-2px] sm:mt-0 sm:w-[34%] sm:min-w-[260px]">
        <Image
          src="/character/img_intro01.png"
          alt="학습 중인 디에듀 캐릭터 일러스트"
          width={400}
          height={390}
          priority
          className="mx-auto h-auto w-full drop-shadow-[0_16px_12px_rgba(86,23,0,0.22)]"
        />
        <div className="border-gray-3 absolute -bottom-3 -left-10 w-[245px] overflow-hidden rounded-xl border bg-white shadow-[0_10px_24px_rgba(26,26,26,0.18)] sm:-left-16">
          <div className="bg-gray-12 flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-white">
            <span className="bg-orange-6 h-1.5 w-1.5 rounded-full" />
            지금 풀 수 있는 오늘의 문제
          </div>
          <Image
            src="/mock-problems/ebsi/4001.png"
            alt="오늘의 문제 스캔 미리보기"
            width={490}
            height={276}
            className="h-[92px] w-full object-cover object-top"
          />
          <p className="text-gray-8 flex justify-between px-3 py-2 text-[10px]">
            <span>수학 · 예상 8분</span>
            <span>무료 · 로그인 없이</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function TodayChallenge() {
  const { data, isLoading, isError, refetch } = useOpenChallengeListQuery({
    subject: 'ALL',
    sort: 'latest',
    size: 1,
  });
  const challenge = data?.[0];
  const { data: challengeDetail } = useOpenChallengeDetailQuery(
    challenge?.id ?? '',
    { enabled: Boolean(challenge) }
  );

  return (
    <section id="today-challenge">
      <ModuleHeading
        title="오늘의 오픈챌린지"
        description="가입 전에도 한 문제. 자력으로 풀면 약점 트리가 채워집니다."
        href={PUBLIC.CHALLENGES.LIST}
        more="전체 문제"
      />
      {isLoading && <ModuleState message="오늘의 문제를 준비하고 있습니다" />}
      {!isLoading && isError && (
        <ModuleState
          message="문제를 불러오지 못했어요"
          retry={() => void refetch()}
        />
      )}
      {!isLoading && !isError && !challenge && (
        <ModuleState message="등록된 오늘의 문제가 없습니다" />
      )}
      {challenge && (
        <Link
          href={PUBLIC.OPEN_CHALLENGE.DETAIL(challenge.id)}
          className={`focus-ring block ${cardClass}`}
        >
          <div className="bg-gray-12 flex items-center gap-2 px-4 py-3 text-xs font-bold text-white">
            <span className="bg-orange-6 h-1.5 w-1.5 rounded-full" />
            오늘의 문제 ·{' '}
            {challenge.subject === 'MATH' ? '수학' : challenge.subject}
            <span className="text-gray-5 ml-auto hidden font-mono font-normal sm:inline">
              {challenge.sourceText}
            </span>
          </div>
          <div className="grid gap-6 p-5 sm:grid-cols-[1.05fr_0.95fr] sm:p-6">
            <div>
              <h3 className="font-headline2-heading text-gray-12">
                {challenge.title}
              </h3>
              <div className="border-gray-12 bg-gray-1 mt-4 rounded-xl border p-4">
                <span className="text-gray-8 text-xs font-bold">문제</span>
                <p className="text-gray-12 mt-2 text-xl font-semibold tracking-tight">
                  {challengeDetail?.questionText ?? challenge.title}
                </p>
                <p className="text-gray-9 mt-2 text-sm leading-6">
                  풀이를 시작한 뒤에도 해설은 언제든 확인할 수 있습니다.
                </p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <Metric
                  value={`${challenge.passRate ?? '-'}%`}
                  label="통과율"
                />
                <Metric
                  value={challenge.participantCount.toLocaleString()}
                  label="도전자"
                />
                <Metric
                  value="무료"
                  label="지금 시작"
                />
              </div>
              <span className="text-orange-8 mt-5 inline-flex items-center gap-1 text-sm font-bold">
                무료로 지금 풀기 <ChevronRight size={17} />
              </span>
            </div>
            <div className="border-gray-3 bg-orange-1 relative min-h-[220px] overflow-hidden rounded-xl border">
              <span className="text-orange-9 absolute top-3 left-3 z-10 rounded-full bg-white px-2 py-1 text-[11px] font-bold shadow-sm">
                실제 EBSi 스캔
              </span>
              {challenge.questionImageUrl ? (
                <Image
                  src={challenge.questionImageUrl}
                  alt={`${challenge.title} 문제 이미지`}
                  width={680}
                  height={480}
                  unoptimized
                  className="h-full w-full bg-white object-contain p-5"
                />
              ) : (
                <Image
                  src="/mock-problems/ebsi/4001.png"
                  alt="EBSi 문제 스캔 예시"
                  width={680}
                  height={480}
                  className="h-full w-full object-cover object-top"
                />
              )}
            </div>
          </div>
        </Link>
      )}
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-body1-heading text-gray-12 tabular-nums">{value}</p>
      <p className="text-gray-8 mt-1 text-xs">{label}</p>
    </div>
  );
}

function PopularPosts() {
  const { data, isLoading, isError, refetch } = useColumnList({
    page: 0,
    sort: 'POPULAR',
  });
  const posts = data?.content.slice(0, 5) ?? [];

  return (
    <section>
      <ModuleHeading
        title="인기 글"
        description="지금 많이 보는 상담·칼럼"
        href={PUBLIC.BOARD.LIST}
        more="전체 보기"
      />
      {isLoading && <ModuleState message="인기 글을 불러오고 있습니다" />}
      {!isLoading && isError && (
        <ModuleState
          message="글을 불러오지 못했어요"
          retry={() => void refetch()}
        />
      )}
      {!isLoading && !isError && posts.length === 0 && (
        <ModuleState message="칼럼을 준비하고 있습니다" />
      )}
      {posts.length > 0 && (
        <ol className={`${cardClass} divide-gray-2 divide-y`}>
          {posts.map((post, index) => (
            <li key={post.id}>
              <Link
                href={PUBLIC.BOARD.DETAIL(post.id)}
                className="focus-ring hover:bg-orange-1 flex min-h-[64px] items-center gap-3 px-3 py-3"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-extrabold text-white ${index < 3 ? 'from-orange-6 to-orange-9 bg-gradient-to-br' : 'bg-gray-5'}`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="text-gray-12 block truncate text-sm">
                    {post.title}
                  </b>
                  <span className="text-gray-8 mt-1 block text-xs">
                    {post.authorName ?? post.authorNickname ?? '작성자'} · 조회{' '}
                    {post.viewCount.toLocaleString()}
                  </span>
                </span>
                <span className="bg-gray-1 text-gray-10 rounded-full px-2 py-1 text-[11px] font-bold">
                  칼럼
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Consultation() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: consultationCaseKeys.list(0, 3),
    queryFn: () => consultationRepository.getCaseList({ page: 0, size: 3 }),
    staleTime: 5 * 60 * 1000,
  });
  const cases = data?.content ?? [];
  return (
    <section>
      <ModuleHeading
        title="상담소"
        description="300명 이상 상담에서 나온 진짜 질문. 내 고민도 비공개로 올려보세요."
        href={PUBLIC.CONSULT.INDEX}
        more="상담소 전체"
      />
      <div className="from-orange-6 to-orange-9 rounded-[18px] bg-gradient-to-br p-6 text-white shadow-[0_8px_20px_rgba(209,56,0,0.22)]">
        <p className="text-orange-1 text-xs font-bold">무료 · 비공개 접수</p>
        <h3 className="mt-2 text-2xl font-bold">내 고민 올리기</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/85">
          점수·학원 이야기 말고, 지금 막힌 지점 하나만 적어도 됩니다. 동의
          없이는 절대 공개되지 않습니다.
        </p>
        <Button
          asChild
          variant="secondary"
          size="small"
          className="text-orange-9 mt-5 border-white bg-white"
        >
          <Link href={PUBLIC.CONSULT.INDEX}>
            내 고민 비공개로 올리기 <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {isLoading && (
          <div className="col-span-full">
            <ModuleState message="공개 동의를 받은 사례를 확인하고 있습니다" />
          </div>
        )}
        {!isLoading && isError && (
          <div className="col-span-full">
            <ModuleState
              message="사례를 불러오지 못했어요"
              retry={() => void refetch()}
            />
          </div>
        )}
        {!isLoading && !isError && cases.length === 0 && (
          <div className="col-span-full">
            <ModuleState message="아직 공개 동의를 받은 사례가 없습니다" />
          </div>
        )}
        {cases.map((item) => (
          <Link
            key={item.caseId}
            href={PUBLIC.CONSULT.CASE_DETAIL(item.caseId)}
            className="focus-ring border-orange-6 hover:bg-orange-1 rounded-xl border-l-4 bg-white p-5 shadow-sm"
          >
            <p className="text-orange-8 text-xs font-bold">
              {item.category} · 익명 사례
            </p>
            <p className="font-body2-heading text-gray-12 mt-3 line-clamp-2">
              “{item.question}”
            </p>
            <p className="text-gray-8 mt-3 line-clamp-2 text-sm leading-6">
              {item.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MentorAndCourses() {
  const { data, isLoading, isError, refetch } = useCoursesQuery(0, 3);
  const courses = data?.content ?? [];
  return (
    <section>
      <ModuleHeading
        title="대표 멘토"
        description="디에듀가 미는 단 한 명, 조성진"
        href={PUBLIC.TEACHERS.DETAIL}
        more="프로필 보기"
      />
      <div className={cardClass}>
        <div className="flex items-end gap-4 bg-[radial-gradient(circle_at_90%_0%,rgba(255,145,123,.55),transparent_45%),linear-gradient(135deg,var(--orange-1),var(--orange-2))] p-5">
          <Image
            src="/character/img_profile_teacher01.png"
            alt="조성진 선생님 프로필 일러스트"
            width={90}
            height={90}
            className="h-18 w-18 rounded-full object-cover"
          />
          <div>
            <h3 className="font-body1-heading text-gray-12">
              {MENTOR_PROFILE.name} 선생님
            </h3>
            <p className="text-gray-9 mt-1 text-xs">
              이상한수학 · 중위권 수학 · 스터디룸 관리
            </p>
          </div>
          <span
            data-asset-slot="mentor-real-photo"
            className="border-orange-4 text-orange-9 ml-auto rounded-full border bg-white/75 px-2 py-1 text-[10px] font-bold"
          >
            실사진 예정
          </span>
        </div>
        <ul className="divide-gray-2 divide-y px-5">
          {MENTOR_PROFILE.facts.map((fact) => (
            <li
              key={fact.label}
              className="flex gap-3 py-3"
            >
              <span className="text-orange-8 w-16 shrink-0 font-bold">
                {fact.value}
              </span>
              <span className="text-gray-9 text-sm">{fact.label}</span>
            </li>
          ))}
        </ul>
        <Link
          href={PUBLIC.TEACHERS.DETAIL}
          className="focus-ring border-gray-2 text-orange-8 flex min-h-12 items-center justify-between border-t px-5 text-sm font-bold"
        >
          프로필 · 상담 신청 <ChevronRight size={17} />
        </Link>
      </div>
      <p className="text-gray-11 mt-5 text-sm font-bold">
        조성진 선생님의 코스
      </p>
      {isLoading && (
        <div className="mt-3">
          <ModuleState message="코스를 준비하고 있습니다" />
        </div>
      )}
      {!isLoading && isError && (
        <div className="mt-3">
          <ModuleState
            message="코스를 불러오지 못했어요"
            retry={() => void refetch()}
          />
        </div>
      )}
      {!isLoading && !isError && courses.length === 0 && (
        <div className="mt-3">
          <ModuleState message="공개된 코스를 준비하고 있습니다" />
        </div>
      )}
      {courses.length > 0 && (
        <div className="mt-3 space-y-3">
          {courses.map((course, index) => (
            <Link
              key={course.courseId}
              href={PUBLIC.COURSE.DETAIL(course.courseId)}
              className="focus-ring border-gray-3 hover:border-orange-4 flex min-h-16 items-center gap-3 rounded-xl border bg-white p-2.5 shadow-sm"
            >
              <span className="from-orange-4 to-orange-9 relative flex h-14 w-19 shrink-0 items-end overflow-hidden rounded-lg bg-gradient-to-br p-1.5 text-[10px] font-bold text-white">
                <Image
                  src={`/home/im_card_${(index % 3) + 1}_desktop.png`}
                  alt=""
                  fill
                  className="object-cover opacity-75"
                />
                <span className="bg-gray-12/80 relative rounded px-1.5 py-0.5">
                  코스
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <b className="text-gray-12 block truncate text-sm">
                  {course.title}
                </b>
                <span className="text-gray-8 mt-1 block truncate text-xs">
                  {course.description ??
                    `${course.freeLessonCount}개 무료 차시`}
                </span>
              </span>
              <ChevronRight
                size={18}
                className="text-orange-8"
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function EditorialAndNews() {
  const { data, isLoading, isError, refetch } = useColumnList({
    page: 0,
    sort: 'LATEST',
  });
  const articles = data?.content ?? [];
  const lead = articles[0];
  return (
    <>
      <section>
        <ModuleHeading
          title="칼럼"
          description="이번 주 조성진 선생님이 가장 하고 싶은 이야기 한 편"
          href={PUBLIC.BOARD.LIST}
          more="칼럼 전체"
        />
        {isLoading && <ModuleState message="칼럼을 불러오고 있습니다" />}
        {!isLoading && isError && (
          <ModuleState
            message="칼럼을 불러오지 못했어요"
            retry={() => void refetch()}
          />
        )}
        {!isLoading && !isError && !lead && (
          <ModuleState message="발행된 칼럼이 없습니다" />
        )}
        {lead && (
          <Link
            href={PUBLIC.BOARD.DETAIL(lead.id)}
            className={`focus-ring block ${cardClass}`}
          >
            <div className="min-h-42 bg-[radial-gradient(circle_at_82%_15%,rgba(255,145,123,.66),transparent_32%),linear-gradient(125deg,var(--orange-12),var(--orange-9))] p-6 text-white">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">
                편집장 칼럼 · 조성진
              </span>
              <h3 className="mt-8 line-clamp-2 text-2xl leading-tight font-bold">
                {lead.title}
              </h3>
            </div>
            <div className="p-5">
              <p className="text-gray-8 line-clamp-2 text-sm leading-6">
                {lead.tags.length > 0
                  ? lead.tags.map((tag) => `#${tag}`).join(' ')
                  : '중위권 수학 학습을 위한 이번 주 이야기입니다.'}
              </p>
              <p className="text-orange-8 mt-4 text-sm font-bold">
                계속 읽기 · 게시판 칼럼 상세로 이어집니다
              </p>
            </div>
          </Link>
        )}
      </section>
      <section className="mt-9">
        <ModuleHeading
          title="교육뉴스"
          description="수학 교육 뉴스를 중위권 학습 전략으로 번역합니다."
          href={PUBLIC.BOARD.LIST}
          more="더 보기"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {['2028', '오답', '14주'].map((glyph, index) => (
            <div
              key={glyph}
              data-asset-slot="news-photo"
              className={`${cardClass} flex min-h-55 flex-col`}
            >
              <div
                className={`relative flex aspect-video items-end overflow-hidden p-3 ${index === 0 ? 'from-orange-6 to-orange-9 bg-gradient-to-br' : index === 1 ? 'from-orange-8 to-orange-11 bg-gradient-to-br' : 'from-gray-11 to-orange-11 bg-gradient-to-br'}`}
              >
                <span className="text-orange-9 relative rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold">
                  실사진 예정
                </span>
                <b className="absolute right-0 -bottom-5 text-7xl font-extrabold tracking-tighter text-white/15">
                  {glyph}
                </b>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="font-body2-heading text-gray-12">
                  교육 뉴스 편집을 준비하고 있습니다
                </p>
                <p className="text-gray-8 mt-2 text-sm leading-6">
                  검증된 출처의 뉴스가 발행되면 학습 전략과 함께 보여드립니다.
                </p>
                <span className="text-gray-7 mt-auto pt-4 text-xs">
                  공개 발행 대기
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function PortalHome() {
  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 py-7 sm:px-8 sm:py-10 lg:px-12">
      <PortalHero />
      <div className="mt-10 grid gap-x-8 gap-y-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,.95fr)]">
        <div className="space-y-10">
          <TodayChallenge />
          <Consultation />
          <EditorialAndNews />
        </div>
        <aside className="space-y-10">
          <PopularPosts />
          <MentorAndCourses />
        </aside>
      </div>
    </main>
  );
}
