import BackLink from '@/features/dashboard/studynote/components/back-link';

export default function InquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 로그인 시 사이드바 셸은 상위 (public)/layout.tsx 의 AppShell 이 담당한다.
  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-8 lg:px-20">
      <BackLink />
      {children}
    </div>
  );
}
