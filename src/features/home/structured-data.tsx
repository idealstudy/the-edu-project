import { SITE_CONFIG } from '@/config/site';

// 랜딩 2.0 FAQ (JSON-LD용). 화면 FAQ(landing-faq)와 동기화.
const FAQ_SEO = [
  {
    question: '"제대로 풀었다"는 어떻게 판단하나요?',
    answer:
      '스스로 푼 자력 정답만 약점 트리를 채웁니다. 찍어서 맞히거나 해설을 먼저 본 문제는 정복도에 반영되지 않습니다.',
  },
  {
    question: '막혔을 때 정답을 안 알려주면 어떻게 풀어요?',
    answer:
      'AI 코치가 정답 대신 다음 한 걸음을 같이 찾아줍니다. 정답 해설을 열면 그 문제는 트리에서 제외됩니다.',
  },
  {
    question: '약점 트리는 어떻게 채워지나요?',
    answer:
      '문제를 제대로 풀면 단원 노드가 오렌지로 진해집니다. 미진단·약점·진행·정복 순으로 채워집니다.',
  },
  {
    question: '무료로 사용할 수 있나요?',
    answer: '오픈챌린지 문제 풀이와 약점 트리는 무료로 시작할 수 있습니다.',
  },
] as const;

export function StructuredData() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    about: {
      '@type': 'Thing',
      name: '문제 풀이 학습 플랫폼',
      description: '제대로 푼 만큼 채워지는 약점 트리와 AI 코치 기반 문제 풀이',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
      },
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_SEO.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
