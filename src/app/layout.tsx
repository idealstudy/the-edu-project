import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';

import { Header } from '@/layout/header';
import { GlobalProvider } from '@/providers';
import '@/shared/components/editor/styles/text-editor.css';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'THE EDU',
  description:
    'THE EDU는 과외와 일정 관리를 하나의 플랫폼에서 제공합니다. 실시간 피드백, 스케줄 조정 기능을 경험해보세요.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} font-pretendard`}
    >
      <body className="antialiased">
        {/* 
          GTM (Google Tag Manager) 스니펫
          - Next.js Script 컴포넌트를 사용하여 최적화된 방식으로 GTM을 로드합니다
          - id 속성은 필수이며, strategy="afterInteractive"는 페이지가 인터랙티브한 후 로드합니다
        */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                `,
              }}
            />
            {/* 
              GTM Body 스니펫 (noscript)
              - JavaScript가 비활성화된 브라우저용 fallback입니다
            */}
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
        <GlobalProvider>
          <Header />
          <div className="mt-header-height flex flex-col">{children}</div>
        </GlobalProvider>
      </body>
    </html>
  );
}

const pretendard = localFont({
  src: [
    {
      path: '../assets/fonts/Pretendard-Regular.subset.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Pretendard-Medium.subset.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Pretendard-SemiBold.subset.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Pretendard-Bold.subset.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../assets/fonts/Pretendard-ExtraBold.subset.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
});
