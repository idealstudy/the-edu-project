import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const jar = await cookies();
  const hasSession = !!(jar.get('Authorization') || jar.get('sid'));
  return NextResponse.json({ hasSession });
}
