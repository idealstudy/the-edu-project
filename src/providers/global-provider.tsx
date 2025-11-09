import { ReactNode } from 'react';

import { checkCookie } from '@/lib';
import {
  InterceptorProvider,
  QueryProvider,
  SessionProvider,
} from '@/providers';

interface Props {
  children: ReactNode;
}

export const GlobalProvider = async ({ children }: Props) => {
  const hasSession = await checkCookie();
  return (
    <InterceptorProvider>
      <QueryProvider>
        <SessionProvider initialHasSession={hasSession}>
          {children}
        </SessionProvider>
      </QueryProvider>
    </InterceptorProvider>
  );
};
