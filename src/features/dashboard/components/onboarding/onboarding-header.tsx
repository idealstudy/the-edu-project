interface OnboardingHeaderProps {
  greeting: string;
  subtitle: string;
  completedCount: number;
  totalSteps: number;
}

export const OnboardingHeader = ({
  greeting,
  subtitle,
  completedCount,
  totalSteps,
}: OnboardingHeaderProps) => {
  return (
    <>
      {/* 온보딩 헤더 */}
      <section className="rounded-[32px] bg-gradient-to-br from-[#ff4500] to-[#ff6b35] p-10 text-center text-white shadow-[0_24px_48px_rgba(255,72,5,0.35)]">
        <h1 className="mb-4 text-[32px] leading-[140%] font-bold tracking-[-0.04em]">
          {greeting}
          <br />
        </h1>
        <p className="mb-6 text-lg text-white/90">{subtitle}</p>
        {/* 진행률 표시 */}
        <div className="mx-auto max-w-md">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>진행률</span>
            <span className="font-semibold">
              {completedCount} / {totalSteps}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(completedCount / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </section>
    </>
  );
};
