import { BaseQueryOptions } from './types';

export const DEFAULT_QUERY_OPTION: Required<BaseQueryOptions> = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

export const withBase = <T extends object>(
  opt: T,
  base: Partial<BaseQueryOptions> = {}
) =>
  ({ ...DEFAULT_QUERY_OPTION, ...base, ...opt }) as T &
    Required<BaseQueryOptions>;
