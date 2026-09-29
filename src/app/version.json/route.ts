import {
  APP_VERSION_IDENTITY,
  APP_VERSION_INFO,
} from '@/shared/lib/app-version';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(APP_VERSION_INFO, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'x-app-version': APP_VERSION_IDENTITY,
    },
  });
}
