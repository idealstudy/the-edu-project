'use server';

import { cookies } from 'next/headers';

export const checkCookie = async (): Promise<boolean> => {
  const cookieStore = await cookies();
  const hasSession = !!(
    cookieStore.get('refresh') ?? cookieStore.get('Authorization')
  );
  return hasSession;
};
