export async function POST(req: Request) {
  const allowedOrigin = resolveAllowedOrigin(req);
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(allowedOrigin),
  });
}

// API Route Handler || Root Page의 HTTP 요청 처리
export async function OPTIONS(req: Request) {
  const allowedOrigin = resolveAllowedOrigin(req);
  return new Response(null, {
    status: 204,
    headers: createCorsHeaders(allowedOrigin),
  });
}
const parseAllowedOrigins = () => {
  const origins = (
    process.env.CORS_ALLOWED_ORIGINS ?? 'https://dev.the-edu.site'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  return origins.length > 0 ? origins : ['https://dev.the-edu.site'];
};

const ALLOWED_ORIGINS = parseAllowedOrigins();

const resolveAllowedOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0] ?? 'https://dev.the-edu.site';
};

const createCorsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Credentials': 'true',
});
