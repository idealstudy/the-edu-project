import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    suppressGlobalErrorToast?: boolean;
  }

  export interface InternalAxiosRequestConfig {
    suppressGlobalErrorToast?: boolean;
  }
}
