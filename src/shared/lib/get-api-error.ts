import axios from 'axios';

export type ApiError = {
  code: string;
  message: string;
};

export function getApiError(error: unknown): ApiError | null {
  if (!axios.isAxiosError(error)) return null;

  const data = error.response?.data as ApiError | undefined;
  if (!data) return null;

  return {
    code: data.code,
    message: data.message,
  };
}
