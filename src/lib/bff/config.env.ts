import { API_BASE_URL } from '@/constants';

const DEFAULT_BACKEND_API_URL = 'https://api.dev.the-edu.site/api';

const sanitize = (value: string | undefined) =>
  value && value.trim().length > 0 ? value.trim() : undefined;

const publicBackendUrl =
  sanitize(process.env.NEXT_PUBLIC_BACKEND_API_URL) ?? API_BASE_URL;

const serverBackendUrl =
  sanitize(process.env.BACKEND_API_URL) ?? publicBackendUrl;

export const env = {
  backendApiUrl: publicBackendUrl,
};

export const serverEnv = {
  backendApiUrl: serverBackendUrl,
};

export { DEFAULT_BACKEND_API_URL };
