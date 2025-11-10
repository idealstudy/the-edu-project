import { createCorsHeaders, resolveAllowedOrigin } from '@/lib';

export async function POST(req: Request) {
  const allowedOrigin = resolveAllowedOrigin(req);
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(allowedOrigin),
  });
}
