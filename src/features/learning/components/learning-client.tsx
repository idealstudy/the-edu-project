'use client';

import { BadgeCollectionSection } from '@/features/level';

import { MyProblemsSection } from './my-problems-section';
import { PointSummaryCard } from './point-summary-card';
import { TreeSummarySection } from './tree-summary-section';

/* ─────────────────────────────────────────────────────
 * 내 학습 허브 클라이언트
 *  포인트 요약(+레벨) · 약점 트리 요약 · 뱃지 컬렉션 · 내 문제(상태별)를 한 화면에.
 *  각 섹션은 자체 로딩/에러/빈 상태를 책임진다.
 * ────────────────────────────────────────────────────*/
export const LearningClient = () => (
  <div className="flex flex-col gap-8">
    <PointSummaryCard />
    <TreeSummarySection />
    <BadgeCollectionSection />
    <MyProblemsSection />
  </div>
);
