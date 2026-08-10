import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';

import { SITE_CONFIG } from '@/config/site';
import { Header } from '@/layout/header';
import { GlobalProvider } from '@/providers';
import '@/shared/components/editor/styles/text-editor.css';
import '@/styles/globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: 'THE EDU',
  description:
    'THE EDU는 과외와 일정 관리를 하나의 플랫폼에서 제공합니다. 실시간 피드백, 스케줄 조정 기능을 경험해보세요.',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification':
        process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? '',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  const shouldLoadGtm =
    Boolean(gtmId) && process.env.NEXT_PUBLIC_ENABLE_GTM === 'true';

  return (
    <html
      lang="ko"
      className={`${pretendard.variable} font-app`}
      suppressHydrationWarning
    >
      <body className="bg-gray-1 antialiased">
        {/* 승인 디자인의 앱 글꼴. CDN이 실패하면 로컬 Pretendard로 즉시 폴백한다. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- 승인 디자인과 동일한 전역 variable font stylesheet */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
        />
        {/* GTM Head 스니펫 */}
        {/* 배포환경일때만 작동되게 */}
        {shouldLoadGtm && (
          <>
            <Script
              id="gtm-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                `,
              }}
            />
            <Script
              id="gtm-script"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${gtmId}');
                `,
              }}
            />
          </>
        )}
        {/* GTM Body 스니펫 (noscript) */}
        {shouldLoadGtm && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        <GlobalProvider>
          <Header />
          <div
            className="mt-header-height flex flex-col"
            data-root-content
          >
            {children}
          </div>
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
