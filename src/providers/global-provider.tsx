import { ReactNode } from 'react';

import {
  InterceptorProvider,
  QueryProvider,
  SessionProvider,
} from '@/providers';
import { checkCookie } from '@/shared/lib';

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
