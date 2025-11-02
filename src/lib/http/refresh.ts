import { refreshHttp } from '@/lib/http/clients';

export const refreshSession = async (): Promise<void> => {
  await refreshHttp.get('/auth/refresh');
};

let refreshPromise: Promise<void> | null = null;

export const ensureRefreshSession = async (): Promise<void> => {
  if (refreshPromise) return refreshPromise;
  refreshPromise = refreshSession()
    .catch((e) => {
      throw e;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};
