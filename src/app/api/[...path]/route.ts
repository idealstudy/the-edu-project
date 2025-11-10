import {
  createCorsHeaders,
  resolveAllowedOrigin,
} from '@/app/api/feedback/route';

// API Route Handler || Root Page의 HTTP 요청 처리
export async function OPTIONS(req: Request) {
  const allowedOrigin = resolveAllowedOrigin(req);
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(allowedOrigin),
  });
}
