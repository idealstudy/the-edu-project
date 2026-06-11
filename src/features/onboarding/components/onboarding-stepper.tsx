'use client';

import { useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import type {
  DiagnosisItem,
  OnboardingElective,
  OnboardingGrade,
  OnboardingSelfGrade,
} from '@/entities/onboarding';
import { useMyTreeQuery } from '@/features/weakness-tree/hooks/use-tree';
import { PUBLIC } from '@/shared/constants';
import { showBottomToast } from '@/shared/components/ui';
import { TriangleAlert } from 'lucide-react';

import { useOnboardingDiagnosisMutation } from '../hooks/use-onboarding-diagnosis';
import { type OnboardingStep, STEP_SEQUENCE } from '../model/steps';
import { CtaButton } from './cta-button';
import { OnboardingShell } from './onboarding-shell';
import { DiagnosisStep } from './steps/diagnosis-step';
import { ElectiveStep } from './steps/elective-step';
import { ExperienceStep } from './steps/experience-step';
import { GradeStep } from './steps/grade-step';
import { RevealStep } from './steps/reveal-step';
import { SelfGradeStep } from './steps/self-grade-step';
import { WeakUnitsStep } from './steps/weak-units-step';

/* ─────────────────────────────────────────────────────
 * 온보딩 스텝퍼 — 학년 → 과목 → 등급 → 약점단원
 *   · (선택)모의진단 → 1문제 체험 → 약점 트리 공개.
 *  입력값은 로컬 state로 모음(저장 API 없으면 state만, 추천 PR5 연동은 후속).
 *  대단원 노드 목록은 GET /common/tree 에서 받아온다.
 * ────────────────────────────────────────────────────*/
export const OnboardingStepper = () => {
  const router = useRouter();
  const { data: tree, isLoading, isError, refetch } = useMyTreeQuery();
  const diagnosis = useOnboardingDiagnosisMutation();

  // ── 입력값 (로컬 state) ──
  const [step, setStep] = useState<OnboardingStep>('grade');
  const [grade, setGrade] = useState<OnboardingGrade | null>(null);
  const [elective, setElective] = useState<OnboardingElective | null>(null);
  const [selfGrade, setSelfGrade] = useState<OnboardingSelfGrade | null>(null);
  const [weakNodeIds, setWeakNodeIds] = useState<string[]>([]);
  const [diagnosisMarks, setDiagnosisMarks] = useState<Record<string, boolean>>(
    {}
  );
  const [experienceChoice, setExperienceChoice] = useState<number | null>(null);

  const groups = tree?.groups ?? [];
  const stepIndex = STEP_SEQUENCE.indexOf(step);

  // 진행 인디케이터 좌표: 기본정보 4스텝(0~3), 그 이후는 beyondCore 처리
  const coreIndex = Math.min(stepIndex, 4);

  const goTo = (next: OnboardingStep) => {
    setStep(next);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  };

  const toggleWeak = (nodeId: string) =>
    setWeakNodeIds((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );

  const markDiagnosis = (nodeId: string, weak: boolean) =>
    setDiagnosisMarks((prev) => ({ ...prev, [nodeId]: weak }));

  // 약점 단원 선택 → 진단 마크 초깃값으로 약점(weak=true) 채워줌
  const diagnosisItems = useMemo<DiagnosisItem[]>(() => {
    const merged: Record<string, boolean> = {};
    weakNodeIds.forEach((id) => {
      merged[id] = true;
    });
    Object.entries(diagnosisMarks).forEach(([id, weak]) => {
      merged[id] = weak;
    });
    return Object.entries(merged).map(([treeNodeId, weak]) => ({
      treeNodeId,
      weak,
    }));
  }, [weakNodeIds, diagnosisMarks]);

  const submitDiagnosis = (next: OnboardingStep) => {
    if (diagnosisItems.length === 0) {
      goTo(next);
      return;
    }
    diagnosis.mutate(diagnosisItems, {
      onSuccess: () => goTo(next),
      onError: () => {
        showBottomToast('진단 저장에 실패했어요. 잠시 후 다시 시도해 주세요.');
      },
    });
  };

  // ── 로딩 / 에러: 대단원 노드를 못 받으면 진행 불가 ──
  if (isLoading) {
    return (
      <OnboardingShell
        step="grade"
        coreIndex={0}
        footer={<CtaButton disabled>불러오는 중…</CtaButton>}
      >
        <div className="flex flex-col gap-3">
          <div className="bg-line-line1 h-9 w-2/3 animate-pulse rounded-md" />
          <div className="bg-line-line1 h-4 w-1/2 animate-pulse rounded-md" />
          <div className="mt-4 flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-line-line1 h-[64px] animate-pulse rounded-[12px]"
              />
            ))}
          </div>
        </div>
      </OnboardingShell>
    );
  }

  if (isError) {
    return (
      <OnboardingShell
        step="grade"
        coreIndex={0}
        footer={
          <CtaButton onClick={() => refetch()}>다시 시도</CtaButton>
        }
      >
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <TriangleAlert
            size={32}
            className="text-system-warning"
            aria-hidden
          />
          <p className="font-body1-heading text-text-main">
            온보딩 정보를 불러오지 못했어요.
          </p>
        </div>
      </OnboardingShell>
    );
  }

  // ── 스텝별 렌더 ──
  switch (step) {
    case 'grade':
      return (
        <OnboardingShell
          step={step}
          coreIndex={coreIndex}
          topRight={
            <button
              type="button"
              onClick={() => router.push(PUBLIC.OPEN_CHALLENGE.LIST)}
              className="font-caption-heading text-text-inactive"
            >
              건너뛰기
            </button>
          }
          footer={
            <CtaButton
              disabled={grade === null}
              onClick={() => goTo('elective')}
            >
              다음
            </CtaButton>
          }
        >
          <GradeStep
            value={grade}
            onChange={setGrade}
          />
        </OnboardingShell>
      );

    case 'elective':
      return (
        <OnboardingShell
          step={step}
          coreIndex={coreIndex}
          topRight={<BackButton onClick={() => goTo('grade')} />}
          footer={
            <CtaButton
              disabled={elective === null}
              onClick={() => goTo('selfGrade')}
            >
              다음
            </CtaButton>
          }
        >
          <ElectiveStep
            value={elective}
            onChange={setElective}
          />
        </OnboardingShell>
      );

    case 'selfGrade':
      return (
        <OnboardingShell
          step={step}
          coreIndex={coreIndex}
          topRight={<BackButton onClick={() => goTo('elective')} />}
          footer={
            <CtaButton
              disabled={selfGrade === null}
              onClick={() => goTo('weakUnits')}
            >
              다음
            </CtaButton>
          }
        >
          <SelfGradeStep
            value={selfGrade}
            onChange={setSelfGrade}
          />
        </OnboardingShell>
      );

    case 'weakUnits':
      return (
        <OnboardingShell
          step={step}
          coreIndex={coreIndex}
          topRight={<BackButton onClick={() => goTo('selfGrade')} />}
          footer={
            <div className="flex flex-col gap-2.5">
              <CtaButton onClick={() => goTo('diagnosis')}>
                모의고사로 한방 진단 (선택)
              </CtaButton>
              <CtaButton
                variant="ghost"
                onClick={() => goTo('experience')}
              >
                진단 한 문제 풀어보기
              </CtaButton>
            </div>
          }
        >
          <WeakUnitsStep
            groups={groups}
            selectedIds={weakNodeIds}
            onToggle={toggleWeak}
          />
        </OnboardingShell>
      );

    case 'diagnosis':
      return (
        <OnboardingShell
          step={step}
          coreIndex={coreIndex}
          topRight={<BackButton onClick={() => goTo('weakUnits')} />}
          footer={
            <div className="flex flex-col gap-2.5">
              <CtaButton
                disabled={diagnosis.isPending}
                onClick={() => submitDiagnosis('experience')}
              >
                {diagnosis.isPending
                  ? '진단 중…'
                  : `입력값으로 진단 (${diagnosisItems.length})`}
              </CtaButton>
              <CtaButton
                variant="ghost"
                onClick={() => goTo('experience')}
              >
                지금은 건너뛰기
              </CtaButton>
            </div>
          }
        >
          <DiagnosisStep
            groups={groups}
            marks={diagnosisMarks}
            onMark={markDiagnosis}
          />
        </OnboardingShell>
      );

    case 'experience':
      return (
        <OnboardingShell
          step={step}
          coreIndex={4}
          beyondCore
          topRight={
            <button
              type="button"
              onClick={() => goTo('reveal')}
              className="font-caption-heading text-text-inactive"
            >
              건너뛰기
            </button>
          }
          footer={
            <CtaButton onClick={() => goTo('reveal')}>
              채점하고 내 트리 보기
            </CtaButton>
          }
        >
          <ExperienceStep
            selectedChoice={experienceChoice}
            onSelectChoice={setExperienceChoice}
          />
        </OnboardingShell>
      );

    case 'reveal':
      return (
        <OnboardingShell
          step={step}
          coreIndex={4}
          beyondCore
          topRight={
            <span className="font-caption-heading text-system-success">
              완료 ✓
            </span>
          }
          footer={
            <CtaButton
              onClick={() => router.push(PUBLIC.OPEN_CHALLENGE.LIST)}
            >
              오늘의 문제 시작
            </CtaButton>
          }
        >
          <RevealStep tree={tree!} />
        </OnboardingShell>
      );
  }
};

/* ─────────────────────────────────────────────────────
 * 상단 좌측 "뒤로" — 시각 보조(진행 후퇴)
 * ────────────────────────────────────────────────────*/
const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="font-caption-heading text-text-sub2"
  >
    ← 뒤로
  </button>
);
