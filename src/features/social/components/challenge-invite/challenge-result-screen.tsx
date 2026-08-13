'use client';

import { useEffect } from 'react';

import Link from 'next/link';

import { type ChallengeInviteResult } from '@/entities/social';
import {
  useOpenChallengeDetailQuery,
  useRecommendedChallengesQuery,
} from '@/features/open-challenge/hooks/use-open-challenge';
import { Button, Card } from '@/shared/components/ui';
import { PRIVATE, PUBLIC, subjectDisplayLabel } from '@/shared/constants';
import { cn, withKoreanParticle } from '@/shared/lib';
import { trackVersusView } from '@/shared/lib/analytics';
import {
  extractErrorCode,
  extractErrorMessage,
} from '@/shared/lib/bff/utils.message';
import { AxiosError } from 'axios';
import { Check, Compass, Search, Swords, User, X } from 'lucide-react';

import {
  useCreateRematchMutation,
  useInviteResultQuery,
  usePublicInvitePreviewQuery,
} from '../../hooks';

/* ─────────────────────────────────────────────────────
 * 대결 결과 전용 화면 (D-10-4).
 *  기반: prototypes/mvp-e-v1.1.0-디자인허브-v3-opus5.html resultScreen()
 *        + docs/qa/design-conformance-matrix.md D-10-4 행.
 *  이전엔 팝업 모달(challenge-result-dialog.tsx) 하나로 승/패를 문구만
 *  바꿔 재사용했다. 승인 시안은 ①전용 페이지 ②도전 맥락 띠 ③승패별 다른
 *  다음 카드 ④진 쪽만 상단 "먼저 볼 곳" 안내 띠 ⑤좌우 비교를 요구한다.
 *  이 화면이 그 다섯을 채운다. (private) 셸 안에 둬 앱바(h1)·사이드바를
 *  DashboardAppHeader/DashboardSidebar가 그리게 하고, 이 컴포넌트는 h1을
 *  다시 그리지 않는다(회귀: mvp-g-dashboard-app-header.test.tsx).
 * ────────────────────────────────────────────────────*/
type Outcome = NonNullable<ChallengeInviteResult['outcome']>;

const OUTCOME_COPY: Record<
  Outcome,
  { title: string; sub: string; tone: 'win' | 'lose' }
> = {
  WIN: {
    title: '이겼어요',
    sub: '두 사람이 고른 답과 풀이가 어디서 갈렸는지 확인해 보세요.',
    tone: 'win',
  },
  LOSE: {
    title: '졌어요. 어디서 갈렸는지 보고 가요',
    sub: '상대의 풀이와 내 풀이에서 달라진 줄을 먼저 확인해 보세요.',
    tone: 'lose',
  },
  BOTH_WRONG: {
    title: '둘 다 걸렸어요',
    sub: '같은 문제에서 둘 다 놓친 지점을 확인하고 함께 다시 풀어보세요.',
    tone: 'lose',
  },
  BOTH_CORRECT: {
    title: '둘 다 맞혔어요',
    sub: '서로 다른 풀이 순서를 비교하고 다음 문제로 이어가 보세요.',
    tone: 'win',
  },
};

const formatSelectedAnswer = (answer: string): string => {
  const normalized = answer.trim();
  return /^\d+$/.test(normalized) ? `${normalized}번` : normalized;
};

const getOpponentName = (result: ChallengeInviteResult): string =>
  result.opponentName?.trim() || result.context?.inviterName?.trim() || '상대';

const buildResultSummary = (
  result: ChallengeInviteResult,
  fallback: string
): string => {
  const myAnswer = result.myAttempt?.selectedAnswer?.trim();
  const opponentAnswer = result.opponentAttempt?.selectedAnswer?.trim();

  if (!myAnswer || !opponentAnswer || myAnswer === opponentAnswer) {
    return fallback;
  }

  const opponentName = getOpponentName(result);
  const answerSummary = `${withKoreanParticle(opponentName, '은/는')} ${formatSelectedAnswer(opponentAnswer)}, 나는 ${formatSelectedAnswer(myAnswer)}을 골랐어요.`;
  const divergenceReason = result.divergence?.reason?.trim();

  return divergenceReason
    ? `${answerSummary} ${divergenceReason}`
    : answerSummary;
};

const formatDateTime = (iso: string | null | undefined): string | null => {
  if (!iso) return null;
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
};

export const ChallengeResultScreen = ({ token }: { token: string }) => {
  const {
    data: result,
    error,
    isLoading,
    isError,
    refetch,
  } = useInviteResultQuery(token);

  const isPending = !!result && result.status !== 'COMPLETED';

  // 컨닝 가드(CUNNING_GUARD_BLOCKED): 내가 아직 문제를 안 풀어서 결과 조회가
  // 막힌 정상적인 상황이다. 서버가 준 사유를 그대로 보여준 뒤, 문제 풀이로
  // 보내는 게 맞는 동작이다. 내부 에러 코드는 화면에 노출하지 않는다.
  const isCunningGuardBlocked =
    error instanceof AxiosError &&
    extractErrorCode(error.response?.data) === 'CUNNING_GUARD_BLOCKED';
  const cunningGuardMessage =
    (error instanceof AxiosError
      ? extractErrorMessage(error.response?.data)
      : undefined) ?? '아직 문제를 풀지 않아서 상대방 결과를 볼 수 없어요.';
  // 결과 요청과 공개 미리보기를 병렬로 시작한다. 컨닝 가드가 먼저 실패해도
  // 오류 화면을 띄우는 시점에는 문제 ID가 준비돼 주 동작이 사라지지 않는다.
  const { data: invitePreview, isLoading: isInvitePreviewLoading } =
    usePublicInvitePreviewQuery(token);

  return (
    <main className="tablet:px-8 mx-auto flex w-full max-w-220 flex-col gap-5 px-4 py-6">
      {result && <ContextBar result={result} />}

      {(isLoading || (isCunningGuardBlocked && isInvitePreviewLoading)) && (
        <Card className="items-center gap-4 py-14 text-center">
          <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
            <Swords size={26} />
          </span>
          <p className="font-body1-heading text-text-main">
            두 사람 결과를 맞춰 보는 중이에요
          </p>
          <div className="bg-gray-1 rounded-card h-24 w-full max-w-100 animate-pulse" />
        </Card>
      )}

      {isError && isCunningGuardBlocked && !isInvitePreviewLoading && (
        <Card className="items-center gap-3 py-10 text-center">
          <span className="bg-orange-1 text-key-color-primary flex size-14 items-center justify-center rounded-full">
            <Swords size={26} />
          </span>
          <h2 className="font-body1-heading text-text-main">
            아직 결과를 볼 수 없어요
          </h2>
          <p className="font-body2-normal text-text-sub1 text-balance">
            {cunningGuardMessage}
          </p>
          <div className="mt-2 flex w-full max-w-100 gap-2">
            <Button
              variant="outlined"
              size="large"
              className="flex-1"
              asChild
            >
              <Link href={PRIVATE.FRIENDS.INDEX}>친구 목록으로</Link>
            </Button>
            <Button
              variant="primary"
              size="large"
              className="flex-1"
              asChild
            >
              <Link
                href={
                  invitePreview?.challengeId != null
                    ? PUBLIC.OPEN_CHALLENGE.DETAIL(invitePreview.challengeId)
                    : PUBLIC.CORE.INVITE.CHALLENGE(token)
                }
              >
                문제 풀러 가기
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {isError && !isCunningGuardBlocked && (
        <Card className="items-center gap-3 py-10 text-center">
          <h2 className="font-body1-heading text-text-main">
            결과를 불러오지 못했어요
          </h2>
          <p className="font-body2-normal text-text-sub1">
            잠시 후 다시 시도해 주세요. 계속 안 되면 이 대결이 취소됐거나 내
            대결이 아닐 수 있어요.
          </p>
          {/* 2026-08-12 코드리뷰 지적 해소: 여기엔 "다시 시도" 하나뿐이라
              권한 없음·만료·삭제처럼 다시 눌러도 같은 이유로 실패하는 경우
              본문 안에서 무한 재시도만 하게 됐다. 컨닝가드 분기에는 이미
              나갈 길이 있는데 이 분기만 없었다. 나갈 길을 같이 둔다. */}
          <div className="gap-inline-gap flex w-full max-w-80 flex-col sm:flex-row">
            <Button
              variant="outlined"
              size="large"
              className="w-full flex-1"
              onClick={() => refetch()}
            >
              다시 시도
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="w-full flex-1"
              asChild
            >
              <Link href={PRIVATE.FRIENDS.INDEX}>친구 목록으로</Link>
            </Button>
          </div>
        </Card>
      )}

      {!isLoading && !isError && result && isPending && (
        <Card className="items-center gap-3 py-10 text-center">
          <h2 className="font-body1-heading text-text-main">
            아직 진행 중이에요
          </h2>
          <p className="font-body2-normal text-text-sub1 text-balance">
            나와 상대가 모두 문제를 풀어야 결과를 볼 수 있어요. 조금만 기다려
            주세요!
          </p>
          <Button
            variant="outlined"
            size="large"
            className="w-full max-w-60"
            asChild
          >
            <Link href={PRIVATE.FRIENDS.INDEX}>친구 목록으로</Link>
          </Button>
        </Card>
      )}

      {!isLoading && !isError && result && !isPending && (
        <ResultBody result={result} />
      )}
    </main>
  );
};

/* 도전 맥락 띠(R-19). 결과를 봐도 "누구와의 대결인지"가 사라지지 않게
 * 본문 맨 위에 항상 붙인다. */
const ContextBar = ({ result }: { result: ChallengeInviteResult }) => {
  const opponentName = getOpponentName(result);
  const sentAt = formatDateTime(result.context?.sentAt);
  const opponentSolvedAt = formatDateTime(result.context?.opponentSolvedAt);
  const bothSubmitted =
    result.status === 'COMPLETED' &&
    result.myAttempt?.solvedAt != null &&
    result.opponentAttempt?.solvedAt != null;
  const stateLabel = bothSubmitted
    ? '둘 다 냈어요'
    : result.opponentAttempt?.solvedAt != null || opponentSolvedAt
      ? '상대는 이미 풀었어요'
      : result.myAttempt?.solvedAt != null
        ? '상대가 아직 안 풀었어요'
        : '대결이 진행 중이에요';
  const stateDetail = opponentSolvedAt
    ? `상대가 ${opponentSolvedAt}에 제출`
    : sentAt
      ? `${sentAt}에 도전장을 보냄`
      : '도전장을 주고받은 대결이에요';

  return (
    <div className="border-line-line2 rounded-card flex items-center gap-3 border bg-white px-4 py-3">
      <span className="bg-orange-1 text-key-color-primary flex size-10 shrink-0 items-center justify-center rounded-full font-bold">
        {opponentName.slice(0, 1)}
      </span>
      <div className="min-w-0 flex-1">
        <b className="text-text-main text-single-line block text-sm font-bold">
          {withKoreanParticle(opponentName, '와/과')}의 대결
        </b>
        <span className="text-text-sub2 text-single-line block text-xs">
          {stateDetail}
        </span>
      </div>
      <span className="text-text-sub2 text-xs whitespace-nowrap">
        {stateLabel}
      </span>
    </div>
  );
};

const ResultBody = ({ result }: { result: ChallengeInviteResult }) => {
  const outcome = result.outcome;
  const opponentName = getOpponentName(result);
  const isDuelLimitReached =
    result.openDuelCount != null && result.openDuelCount >= 3;
  const rematch = useCreateRematchMutation();
  const rematchErrorCode =
    rematch.error instanceof AxiosError
      ? extractErrorCode(rematch.error.response?.data)
      : undefined;

  // 정정(2026-08-12, 크로스세션 재확인): 결과 API 자체엔 subject·unitNodeId가
  // 없지만, 그게 없다는 게 무필터로 갈 이유는 아니었다. 이미 있는 문제
  // 상세 조회(challengeId → GET .../challenges/{id})가 subject·units를
  // 준다. 2단계 경로로 연결한다: ①결과의 challengeId로 문제 상세를 받아
  // subject·대표 단원(units 중 isPrimary, 없으면 첫 항목)을 얻는다
  // ②그 값으로 GET .../challenges/recommended?subject=&unitNodeId=&size=3
  // 를 호출해 "다른 문제로/이 유형 더 풀기" 버튼이 실제로 같은 단원의 다음
  // 문제를 가리키게 한다. 요청이 2번 나가는 건 감수한다. 문제 상세는
  // "친구와 대결"에 필요한 challengeId만 있으면 되는 가벼운 캐시 조회라,
  // 결과 화면 진입 시 한 번 더 부르는 비용이 무필터로 보내는 것보다 낫다고
  // 판단했다(react-query가 같은 challengeId를 이미 캐시했으면 재요청도 안 함
  // 이 문제로 도전장이 걸렸던 흐름 대부분이 그 문제 상세를 이미 지나왔다.
  const challengeIdParam = String(result.challengeId);
  const { data: challengeDetail } = useOpenChallengeDetailQuery(
    challengeIdParam,
    { enabled: !!result.challengeId }
  );
  const primaryUnit = challengeDetail?.units.find((unit) => unit.isPrimary);
  const primaryUnitNodeId =
    primaryUnit?.nodeId ?? challengeDetail?.units[0]?.nodeId ?? null;
  const challengeSubjectDisplay =
    subjectDisplayLabel(primaryUnit?.subjectName) ??
    subjectDisplayLabel(challengeDetail?.subject);
  const { data: sameUnitCandidates, isLoading: isSameUnitLoading } =
    useRecommendedChallengesQuery(
      {
        // 표시용 한글(challengeDetail.subject)이 아니라 서버가 아는 코드를 보낸다.
        // 한글을 보내면 recommended 가 400 으로 거부하고 추천이 조용히 실패한다(2026-08-12 관찰).
        subject: challengeDetail?.subjectCode,
        unitNodeId: primaryUnitNodeId ?? undefined,
        size: 3,
      },
      { enabled: primaryUnitNodeId != null }
    );
  // 방금 푼 문제 자신은 추천에서 제외한다(같은 문제를 다시 권하지 않는다).
  const otherSameUnitCandidates =
    sameUnitCandidates?.filter(
      (candidate) => candidate.id !== challengeDetail?.id
    ) ?? [];
  const nextSameUnitChallenge = otherSameUnitCandidates[0] ?? null;
  // 승리 화면 세 번째 버튼("이 유형 더 풀기")은 "다른 문제로"와 목적지를
  // 겹치지 않게 같은 단원 추천 목록의 그다음 후보를 쓴다. 후보가 하나뿐이면
  // 부득이 겹치되(그래도 무필터 전체 목록보단 낫다) 항상 갈 곳은 남긴다.
  const moreOfTypeChallenge = otherSameUnitCandidates[1] ?? null;
  const hasNoSameUnitCandidate =
    primaryUnitNodeId != null &&
    !isSameUnitLoading &&
    sameUnitCandidates != null &&
    !nextSameUnitChallenge;
  // 추천 조회가 실패(에러)하거나 후보가 비어도 화면이 침묵하지 않게, 다음
  // 후보가 없을 때는 항상 전체 목록으로라도 잇는다(결함1: 조용히 아무 일도
  // 안 일어나던 것. CORS 차단 시 sameUnitCandidates는 undefined로 남아
  // 이 폴백이 그대로 적용된다).
  const nextChallengeHref = nextSameUnitChallenge
    ? PUBLIC.OPEN_CHALLENGE.DETAIL(nextSameUnitChallenge.id)
    : PUBLIC.OPEN_CHALLENGE.LIST;
  const moreOfTypeHref = moreOfTypeChallenge
    ? PUBLIC.OPEN_CHALLENGE.DETAIL(moreOfTypeChallenge.id)
    : nextChallengeHref;
  // 패배 화면 주 버튼("갈린 자리 다시 풀기")은 추천 조회와 무관하게 항상
  // 방금 틀린 그 문제로 보낸다. challengeId는 결과 응답에 항상 있는 값이라
  // 추천 API가 막히거나 후보가 비어도 갈 곳이 사라지지 않는다.
  const retryDivergedHref = PUBLIC.OPEN_CHALLENGE.DETAIL(result.challengeId);

  // D2 계측: versus_view. 결과 화면 마운트 시 1회.
  useEffect(() => {
    if (!outcome) return;
    const normalizedOutcome =
      outcome === 'BOTH_WRONG' || outcome === 'BOTH_CORRECT' ? 'DRAW' : outcome;
    trackVersusView({
      outcome: normalizedOutcome,
      ...(result.viewerRole
        ? { is_inviter: result.viewerRole === 'INVITER' }
        : {}),
    });
  }, [outcome, result.viewerRole]);

  if (!outcome) return null;
  const copy = OUTCOME_COPY[outcome];
  const resultSummary = buildResultSummary(result, copy.sub);
  const iWon = outcome === 'WIN';
  const showSplitBanner = outcome === 'LOSE' || outcome === 'BOTH_WRONG';

  return (
    <div className="flex flex-col gap-5">
      {/* 승인 시안의 결과 머리: 별도 카드나 아이콘 배지 없이 제목, 실제 답
          비교 설명, 통계 칩이 한 흐름으로 이어진다. */}
      <section
        data-testid="result-summary"
        className="gap-content-gap flex flex-col text-left"
      >
        {/* font-headline1-heading = 24/700(DESIGN.md). 시안 제목은 800이라
            디자인시스템 토큰만으로는 안 닿는다. 임의 px·hex 대신 Tailwind
            표준 굵기 유틸(font-extrabold=800)만 얹는다. */}
        <h2 className="font-headline1-heading text-text-main font-extrabold">
          {copy.title}
        </h2>
        <p className="font-body2-normal text-text-sub1 text-balance">
          {resultSummary}
        </p>
        {challengeDetail && (
          <div className="gap-content-gap flex flex-wrap">
            {challengeSubjectDisplay && (
              <span className="border-line-line2 rounded-full border bg-white px-3 py-1.5 text-xs">
                <b className="text-text-main">
                  {challengeSubjectDisplay} {challengeDetail.questionNumber}번
                </b>
              </span>
            )}
            <span className="border-line-line2 rounded-full border bg-white px-3 py-1.5 text-xs">
              <span className="text-text-sub2">이 문제 오답률</span>{' '}
              <b className="text-text-main tabular-nums">
                {challengeDetail.wrongAnswerRate}%
              </b>
            </span>
            {result.headToHead && (
              <span className="border-line-line2 rounded-full border bg-white px-3 py-1.5 text-xs">
                <b className="text-text-main">
                  {withKoreanParticle(opponentName, '와/과')} 통산{' '}
                  {result.headToHead.win}승 {result.headToHead.lose}패{' '}
                  {result.headToHead.draw}무
                </b>
              </span>
            )}
          </div>
        )}
      </section>

      {/* 진 쪽(또는 둘 다 오답) 전용. "먼저 볼 곳" 안내를 본문 최상단에 둔다.
          방금 진 사람에게 필요한 건 위로가 아니라 어디를 보라는 지시다. */}
      {showSplitBanner && (
        <div className="border-system-warning bg-system-warning-alt rounded-card flex items-start gap-3 border px-4 py-3">
          <Search
            size={18}
            className="text-system-warning-text mt-0.5 shrink-0"
          />
          <div className="text-sm">
            <b className="text-system-warning-text block">
              먼저 볼 곳: 두 풀이가 갈린 이유
            </b>
            <span className="text-text-sub1 mt-0.5 block">
              줄 주석 데이터는 아직 없어요. 지금은 아래 비교와 제공된 설명으로
              두 풀이가 달라진 이유를 확인해 주세요.
            </span>
          </div>
        </div>
      )}

      {/* 좌우 비교. 정답여부·고른답·소요시간·푼시각·손풀이를 같은 순서로. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <VsColumn
          label="나"
          data={result.myAttempt}
          correct={result.myCorrect ?? false}
          won={iWon}
        />
        <VsColumn
          label={opponentName}
          data={result.opponentAttempt}
          correct={result.opponentCorrect ?? false}
          won={outcome === 'LOSE'}
        />
      </div>

      {/* 다음 카드. 승/패로 제목·버튼 구성이 다르다(D-10-4). */}
      <Card className="bg-gray-1 items-start gap-2 text-left">
        <Card.Header>
          <div className="min-w-0">
            <Card.Title>
              {iWon
                ? `${opponentName}에게 다시 붙자고 할까요?`
                : '지금은 이 유형을 한 번 더 보는 게 낫습니다'}
            </Card.Title>
            <Card.Description className="mt-inline-gap">
              {/* "다시 붙기"는 백엔드 POST rematch(useCreateRematchMutation)가
                  이미 실제로 두 사람이 약한 같은 단원에서 서로 아직 안 푼 문제를
                  골라 돌려준다(아래 rematch.data 선정 이유 카드가 그 실제 결과다).
                  이긴 화면의 "다른 문제로"/"이 유형 더 풀기"는 결과의
                  challengeId로 문제 상세를 받아 subject·대표 단원을 얻고,
                  그 값으로 추천 API를 호출한 같은 단원 후보 중 서로 다른
                  두 문제를 쓴다(nextChallengeHref/moreOfTypeHref). 후보가
                  없을 때만(hasNoSameUnitCandidate) 아래 3갈래 안내로 막다른
                  길을 피한다. 진 화면의 주 버튼("갈린 자리 다시 풀기")은
                  추천 API와 무관하게 항상 방금 틀린 그 문제로 보낸다
                  (retryDivergedHref, 시안 확정 문구). */}
              {iWon
                ? '같은 문제는 다시 보내지 않습니다. 둘 다 약한 단원에서 다음 문제를 골라요.'
                : '같은 자리에서 또 걸리지 않게 방금 그 문제로 먼저 돌아가요. 다시 붙기는 그다음에 해도 늦지 않습니다.'}
            </Card.Description>
          </div>
        </Card.Header>
        {rematch.data && (
          <Card.Content className="font-caption-normal text-text-sub1">
            선정 이유: 둘 다 약한 {rematch.data.unitName}에서{' '}
            {rematch.data.challengeTitle}을 골랐어요.
          </Card.Content>
        )}
        <Card.Footer className="flex-col sm:flex-row">
          {iWon ? (
            <>
              <Button
                variant="primary"
                size="large"
                className="w-full flex-1"
                disabled={rematch.isPending || isDuelLimitReached}
                onClick={() => rematch.mutate(result.shareToken)}
              >
                {rematch.isPending
                  ? '문제 고르는 중…'
                  : `${withKoreanParticle(opponentName, '와/과')} 다시 붙기`}
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="w-full flex-1"
                disabled={hasNoSameUnitCandidate}
                asChild={!hasNoSameUnitCandidate}
              >
                {hasNoSameUnitCandidate ? (
                  '다른 문제로'
                ) : (
                  <Link href={nextChallengeHref}>다른 문제로</Link>
                )}
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="w-full flex-1"
                disabled={hasNoSameUnitCandidate}
                asChild={!hasNoSameUnitCandidate}
              >
                {hasNoSameUnitCandidate ? (
                  '이 유형 더 풀기'
                ) : (
                  <Link href={moreOfTypeHref}>이 유형 더 풀기</Link>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="large"
                className="w-full flex-1"
                asChild
              >
                <Link href={retryDivergedHref}>갈린 자리 다시 풀기</Link>
              </Button>
              <Button
                variant="outlined"
                size="large"
                className="w-full flex-1"
                disabled={rematch.isPending || isDuelLimitReached}
                onClick={() => rematch.mutate(result.shareToken)}
              >
                {rematch.isPending
                  ? '문제 고르는 중…'
                  : `${withKoreanParticle(opponentName, '와/과')} 다시 붙기`}
              </Button>
            </>
          )}
        </Card.Footer>
        {result.openDuelCount != null && (
          <p className="font-caption-normal text-text-sub2 mt-content-gap">
            {withKoreanParticle(opponentName, '와/과')} 진행 중인 대결{' '}
            <b className="text-text-main">{result.openDuelCount}건</b> · 한
            친구와 동시에 3건까지 열 수 있어요
          </p>
        )}
      </Card>

      {/* 추천 0건(D-3-3). 출시 문항이 276개뿐이라 실제로 자주 나는 상태다.
          시안 rematchScreen(vp,'empty')대로 막다른 길을 만들지 않고 옆 단원 ·
          혼자 풀기 · 다른 친구 세 갈래로 잇는다. 문항 개수는 어디에도
          쓰지 않는다(개수는 자랑거리가 아니라 약점이라 시안이 못박음). */}
      {hasNoSameUnitCandidate && (
        <NoCandidateCard
          opponentName={opponentName}
          justSolvedChallengeId={result.challengeId}
          unitNodeId={primaryUnitNodeId}
        />
      )}

      {rematchErrorCode === 'REMATCH_NO_CANDIDATE' && (
        <div className="border-line-line2 bg-gray-1 rounded-xl border px-4 py-3 text-left">
          <strong className="text-text-main text-sm">
            이 단원에서 둘 다 안 푼 문제가 없어요
          </strong>
          <p className="text-text-sub1 mt-1 text-xs">
            둘 다 정복 중인 다른 단원을 고르거나 혼자 다른 문제를 풀어보세요.
          </p>
          <Link
            href={PUBLIC.OPEN_CHALLENGE.LIST}
            className="text-orange-10 mt-2 inline-block text-xs font-bold"
          >
            다른 단원 문제 보기
          </Link>
        </div>
      )}
      {rematchErrorCode === 'INVITE_LIMIT_EXCEEDED' && (
        <div className="border-line-line2 bg-gray-1 rounded-xl border px-4 py-3 text-left">
          <strong className="text-text-main text-sm">
            이 친구와 열려 있는 대결이 3건이에요
          </strong>
          <p className="text-text-sub1 mt-1 text-xs">
            먼저 내 차례인 대결을 끝내면 다시 붙을 수 있어요.
          </p>
          <Link
            href={PRIVATE.FRIENDS.INDEX}
            className="text-orange-10 mt-2 inline-block text-xs font-bold"
          >
            내 차례인 대결 풀러 가기
          </Link>
        </div>
      )}
    </div>
  );
};

/* 추천 0건 전용 카드(D-3-3, 시안 rematchScreen(vp,'empty')). 같은 단원엔
 * 둘 다 안 푼 문제가 없을 때 뜬다. 옆 단원 추천은 unitNodeId 없이
 * subject:'ALL'로 넓혀 부른다. 백엔드가 이유(recommendReason)까지 준다. */
const NoCandidateCard = ({
  opponentName,
  justSolvedChallengeId,
  unitNodeId,
}: {
  opponentName: string;
  justSolvedChallengeId: number;
  unitNodeId: number | null;
}) => {
  const { data: widerCandidates } = useRecommendedChallengesQuery(
    { subject: 'ALL', size: 3 },
    { enabled: true }
  );
  const otherUnitChallenge =
    widerCandidates?.find(
      (candidate) => candidate.id !== String(justSolvedChallengeId)
    ) ?? null;

  return (
    <Card className="items-start gap-3 text-left">
      <Card.Header>
        <Card.Title>이 단원에서 둘 다 안 푼 문제가 없어요</Card.Title>
        <Card.Description className="mt-inline-gap">
          같은 문제로는 다시 붙지 않아요. 답을 아는 사람끼리 겨루면 대결이
          아니니까요. 대신 세 갈래로 이어갈 수 있어요.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex w-full flex-col gap-3">
        <div className="border-line-line2 rounded-card flex items-start gap-3 border bg-white p-3">
          <span className="bg-orange-1 text-key-color-primary flex size-9 shrink-0 items-center justify-center rounded-full">
            <Compass size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <b className="text-text-main block text-sm">
              {otherUnitChallenge
                ? otherUnitChallenge.title
                : '다른 단원 문제 보기'}
            </b>
            <span className="text-text-sub2 mt-0.5 block text-xs">
              {otherUnitChallenge
                ? otherUnitChallenge.recommendReason
                : `${withKoreanParticle(opponentName, '와/과')} 둘 다 정복 중인 다른 단원에서 새 문제가 들어오면 알려 드려요.`}
            </span>
            <Button
              variant="primary"
              size="small"
              className="mt-2 w-full"
              asChild
            >
              <Link
                href={
                  otherUnitChallenge
                    ? PUBLIC.OPEN_CHALLENGE.DETAIL(otherUnitChallenge.id)
                    : PUBLIC.OPEN_CHALLENGE.LIST
                }
              >
                {otherUnitChallenge ? '문제 보기' : '다른 단원 둘러보기'}
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-line-line2 rounded-card flex items-start gap-3 border bg-white p-3">
          <span className="bg-gray-1 text-text-sub1 flex size-9 shrink-0 items-center justify-center rounded-full">
            <Search size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <b className="text-text-main block text-sm">
              방금 갈린 문제 혼자 다시 풀기
            </b>
            <span className="text-text-sub2 mt-0.5 block text-xs">
              기록은 새로 만들지 않아요. 갈렸던 자리만 다시 확인하고 싶을 때
              쓰세요.
            </span>
            <Button
              variant="outlined"
              size="small"
              className="mt-2 w-full"
              asChild
            >
              <Link href={PUBLIC.OPEN_CHALLENGE.DETAIL(justSolvedChallengeId)}>
                혼자 다시 풀기
              </Link>
            </Button>
          </div>
        </div>

        <div className="border-line-line2 rounded-card flex items-start gap-3 border bg-white p-3">
          <span className="bg-gray-1 text-text-sub1 flex size-9 shrink-0 items-center justify-center rounded-full">
            <User size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <b className="text-text-main block text-sm">
              다른 친구에게 도전장 보내기
            </b>
            <span className="text-text-sub2 mt-0.5 block text-xs">
              {withKoreanParticle(opponentName, '와/과')}는 이 단원을 웬만큼
              훑었어요. 다른 친구와 새로 겨뤄보세요.
            </span>
            <Button
              variant="ghost"
              size="small"
              className="mt-2 w-full"
              asChild
            >
              <Link
                href={`${PRIVATE.FRIENDS.INDEX}?challengeId=${justSolvedChallengeId}${unitNodeId == null ? '' : `&unitNodeId=${unitNodeId}`}`}
              >
                친구 선택하기
              </Link>
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

const formatTimeSpent = (seconds: number | null | undefined): string | null => {
  if (seconds == null || seconds < 0) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest}초`;
  return `${minutes}분 ${rest}초`;
};

const VsColumn = ({
  label,
  data,
  correct,
  won,
}: {
  label: string;
  data: ChallengeInviteResult['myAttempt'];
  correct: boolean;
  won: boolean;
}) => {
  const timeLabel = formatTimeSpent(data?.timeSpentSeconds ?? null);
  const submittedAt = formatDateTime(data?.solvedAt ?? null);

  return (
    <Card
      data-testid={`vs-column-${label}`}
      className={cn(
        'flex flex-col gap-3 text-left',
        won && 'border-key-color-primary'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex size-9 items-center justify-center rounded-full',
            correct
              ? 'bg-system-success/10 text-system-success'
              : 'bg-gray-white text-system-warning-text'
          )}
        >
          {correct ? <Check size={20} /> : <X size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <b className="text-single-line block text-sm font-bold">{label}</b>
          <span
            className={cn(
              'font-caption-heading',
              correct ? 'text-system-success' : 'text-system-warning-text'
            )}
          >
            {correct ? '정답' : '오답'}
          </span>
        </div>
      </div>

      <dl className="flex flex-col gap-1 text-sm">
        {data?.selectedAnswer && (
          <div className="flex justify-between">
            <dt className="text-text-sub2">고른 답</dt>
            <dd className="text-text-main font-bold">{data.selectedAnswer}</dd>
          </div>
        )}
        {timeLabel && (
          <div className="flex justify-between">
            <dt className="text-text-sub2">걸린 시간</dt>
            <dd className="text-text-main tabular-nums">{timeLabel}</dd>
          </div>
        )}
        {submittedAt && (
          <div className="flex justify-between">
            <dt className="text-text-sub2">푼 시각</dt>
            <dd className="text-text-main">{submittedAt}에 제출</dd>
          </div>
        )}
      </dl>

      {/* 결함 수정(2026-08-13, 실제 렌더 확인): 이 안내가 <span>(인라인)이라
          위아래 padding이 문서 흐름에 반영되지 않아 바로 위 dl의 "푼 시각"
          줄과 겹쳐 보였다(after-lose-web.png에서 직접 관찰). div(block)로
          바꿔 Card의 flex flex-col 흐름에 정상으로 끼게 한다. */}
      {data?.solutionWithdrawn && (
        <div className="bg-gray-white text-text-sub1 rounded-lg px-2 py-4 text-center text-xs">
          {label === '나' ? '내가 풀이를 내렸어요' : '상대가 풀이를 내렸어요'}
        </div>
      )}
      {/* 결함 보완(2026-08-13): withdrawn(내렸음)만 안내 문구가 있고,
          애초에 안 올린 경우(solutionShared=false)는 빈칸으로 뭉개졌다.
          "왜 없는지"를 늘 한 줄로 말한다(과업 지시). */}
      {!data?.solutionWithdrawn && !data?.solutionShared && (
        <div className="bg-gray-white text-text-sub1 rounded-lg px-2 py-4 text-center text-xs">
          {label === '나'
            ? '풀이를 올리지 않았어요'
            : '상대가 풀이를 올리지 않았어요'}
        </div>
      )}
      {!data?.solutionWithdrawn && data?.solutionImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, next/image 도메인 미등록
        <img
          src={data.solutionImageUrl}
          alt={`${label} 풀이 이미지`}
          className={cn(
            'border-line-line2 rounded-button h-32 w-full border object-cover',
            !correct && 'border-system-warning'
          )}
        />
      )}
    </Card>
  );
};
