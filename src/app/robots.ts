import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = 'https://d-edu.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/login',
          '/register',
          '/study-rooms',
          '/dashboard',
          '/api',
          '/_next',
        ],
      },
    ],
    sitemap: [`${host}/sitemap.xml`],
  };
}
