import {
  ensureRefreshSession,
  installHttpInterceptors,
  refreshSession,
} from '@/lib/http';

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
