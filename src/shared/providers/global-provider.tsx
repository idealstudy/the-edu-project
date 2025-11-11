import { ReactNode } from 'react';

import { checkCookie } from '@/shared/lib';
import {
  InterceptorProvider,
  QueryProvider,
  SessionProvider,
} from '@/shared/providers';

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
