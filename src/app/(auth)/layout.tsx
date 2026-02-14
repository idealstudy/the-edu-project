import { redirect } from 'next/navigation';

import AuthBanner from '@/shared/components/auth/banner';
import { checkCookie } from '@/shared/lib';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasSession = await checkCookie();
  if (hasSession) redirect('/dashboard');

  return (
    <>
      <AuthBanner />
      {children}
    </>
  );
}
