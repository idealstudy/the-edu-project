'use client';

import { MyProblemsSection } from './my-problems-section';
import { PointSummaryCard } from './point-summary-card';
import { TreeSummarySection } from './tree-summary-section';

/* ─────────────────────────────────────────────────────
 * 내 학습 허브 클라이언트
 *  포인트 요약 · 약점 트리 요약 · 내 문제(상태별)를 한 화면에.
 *  각 섹션은 자체 로딩/에러/빈 상태를 책임진다.
 * ────────────────────────────────────────────────────*/
export const LearningClient = () => (
  <div className="flex flex-col gap-8">
    <PointSummaryCard />
    <TreeSummarySection />
    <MyProblemsSection />
  </div>
);
