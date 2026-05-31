import {
  ensureRefreshSession,
  installHttpInterceptors,
  refreshSession,
} from '@/shared/api';

let ejectInterceptors: (() => void) | null = null;
const bindRefreshDebug = () => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window._refresh = refreshSession;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window._refreshOnce = ensureRefreshSession;
  }
};

export const initHttp = () => {
  if (!ejectInterceptors) {
    ejectInterceptors = installHttpInterceptors();
    bindRefreshDebug();
  }
  return ejectInterceptors;
};
