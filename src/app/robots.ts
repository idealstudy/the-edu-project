import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://the-edu.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/login',
          '/register',
          '/studyrooms',
          '/dashboard',
          '/api',
          '/_next',
        ],
      },
    ],
    sitemap: [`${host}/sitemap.xml`],
  };
}
