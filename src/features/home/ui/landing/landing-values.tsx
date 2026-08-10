import { cn } from '@/shared/lib';

// 핵심가치 3블록 (B+A 톤: 절제·숫자 정직).
const VALUES = [
  {
    tag: '제대로',
    title: '자력 정답만 인정',
    desc: '찍어서 맞힌 건 빼고, 스스로 푼 문제만 트리를 채웁니다. 오답률·자력정답률을 숫자로 보여줘요.',
  },
  {
    tag: '막힘',
    title: '답이 아니라 코치',
    desc: '막혔을 때 정답을 알려주지 않습니다. AI 코치가 한 걸음씩 같이 풀어 나갑니다.',
  },
  {
    tag: '쌓임',
    title: '풀수록 진해지는 지도',
    desc: '푼 결과가 약점 트리에 쌓입니다. 어디를 더 풀어야 오르는지 한눈에 보입니다.',
  },
] as const;

export function LandingValues() {
  return (
    <section
      className={cn(
        'mx-auto flex w-full max-w-228 flex-col gap-6 px-6 py-14',
        'tablet:py-20'
      )}
    >
      <h2
        className={cn(
          'font-headline1-heading text-balance',
          'tablet:font-title-heading'
        )}
      >
        오르는 공부는 다릅니다
      </h2>
      <div
        className={cn('flex flex-col gap-3', 'tablet:grid tablet:grid-cols-3')}
      >
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="border-line-line1 flex flex-col gap-3 rounded-xl border bg-white p-6"
          >
            <span className="font-caption-heading text-orange-7 bg-orange-1 w-fit rounded-full px-3 py-1">
              {v.tag}
            </span>
            <h3 className="font-body1-heading text-text-main">{v.title}</h3>
            <p className="font-label-normal text-gray-9 tablet:font-body2-normal">
              {v.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
