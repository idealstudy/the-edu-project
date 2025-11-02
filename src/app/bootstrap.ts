import { installHttpInterceptors } from '@/lib/http/interceptors';
import { ensureRefreshSession, refreshSession } from '@/lib/http/refresh';

let ejectInterceptors: (() => void) | null = null;
export const bootstrap = () => {
  if (!ejectInterceptors) ejectInterceptors = installHttpInterceptors();

  // test
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window._refresh = refreshSession;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window._refreshOnce = ensureRefreshSession;
  }
};
