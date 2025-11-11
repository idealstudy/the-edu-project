import { Suspense } from 'react';

import { InterceptorProvider, SessionProvider } from '@/shared/providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export const wrapper = ({ children }: { children: React.ReactNode }) => {
  const hasSession = false;
  return (
    <InterceptorProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider initialHasSession={hasSession}>
          <Suspense>{children}</Suspense>
        </SessionProvider>
      </QueryClientProvider>
    </InterceptorProvider>
  );
};

export const renderWithProviders = (ui: React.ReactNode) => {
  return render(ui, { wrapper });
};
