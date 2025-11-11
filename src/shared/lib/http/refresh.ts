import { authBffHttp } from './http.transport';

export const refreshSession = async (): Promise<void> => {
  await authBffHttp.get('/api/v1/auth/refresh');
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
