import { http } from './http.transport';

export const refreshSession = async (): Promise<void> => {
  await http.authenticated.get('/auth/refresh');
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
