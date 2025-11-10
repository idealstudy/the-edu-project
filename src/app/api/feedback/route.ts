export async function POST(/*req: Request*/) {
  // const body = await req.text();
  /*const res = await fetch(`${serverEnv.backendApiUrl}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    credentials: 'include',
  });*/
  return new Response(null, { status: 204 });
}

// API Route Handler || Root Page의 HTTP 요청 처리
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://dev.the-edu.site',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}
