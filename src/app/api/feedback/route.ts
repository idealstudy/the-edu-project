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
