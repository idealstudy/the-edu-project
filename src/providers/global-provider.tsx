import { ReactNode } from 'react';

import { QueryProvider, SessionProvider } from '@/providers';

interface Props {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: Props) => {
  return (
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </QueryProvider>
  );
};
