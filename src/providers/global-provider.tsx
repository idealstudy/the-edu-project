import { ReactNode } from 'react';

import {
  AmplitudeProvider,
  InterceptorProvider,
  QueryProvider,
  SessionProvider,
  ToastProvider,
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
          <AmplitudeProvider />
          <ToastProvider />
          {children}
        </SessionProvider>
      </QueryProvider>
    </InterceptorProvider>
  );
};
