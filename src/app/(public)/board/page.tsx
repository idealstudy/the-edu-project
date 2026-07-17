import { Metadata } from 'next';

import { SITE_CONFIG } from '@/config/site';
import ColumnList from '@/features/community/column/components/column-list';

// MVP-G 공개 포털 /board — 기존 column_article 도메인(신규 테이블 0,
// frd-public-portal-v1 §4.6) 재노출. ColumnList를 100% 그대로 쓰고,
// 다탭 CommunityShell 대신 포털 톤의 헤더만 새로 감싼다(다른 탭이 아직
// 없어 탭 UI를 그대로 쓰면 "칼럼 게시판" 탭 1개짜리 셸이 되어 버림).
export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | 상담소 매거진`,
  description:
    '조성진 선생님의 칼럼과 수업 철학, 학습법을 만나보세요. 칼럼·매거진은 공개 발행물이고, 상담소는 비공개 접수 후 익명화된 답변입니다.',
  alternates: { canonical: `${SITE_CONFIG.url}/board` },
  robots: { index: true, follow: true },
};

export default function BoardPage() {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="bg-system-background w-full">
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-8 md:px-8 lg:px-20">
          <h1 className="font-title-heading mt-4 mb-2 text-2xl leading-[135%] tracking-tight lg:text-3xl">
            상담소 매거진
          </h1>
          <p className="font-body2-normal text-text-sub2 mb-10">
            조성진 선생님의 칼럼과 수업 철학, 뉴스 해석을 읽고 상담으로
            연결하세요.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-8 lg:px-20">
        <ColumnList />
      </div>
    </div>
  );
}
