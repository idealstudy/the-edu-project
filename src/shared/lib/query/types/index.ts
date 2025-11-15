import {
  QueryFunction,
  QueryKey,
  UseQueryOptions,
} from '@tanstack/react-query';

export type BaseQueryOptions = {
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | 'always';
};

/**
 * withBase 유틸리티를 거쳐 생성된 최종 쿼리 옵션의 타입을 나타냅니다.
 * TData, TError 타입과 함께 queryKey, queryFn을 포함합니다.
 * 또한 BaseQueryOptions의 모든 속성 (staleTime, retry 등)을
 * Required로 포함합니다.
 */
export type QueryOptionsWithBase<
  TData,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
  TSelectData = TData,
> = {
  queryKey: TQueryKey;
  queryFn: QueryFunction<TData>;
} & Required<BaseQueryOptions> &
  Omit<
    UseQueryOptions<TData, TError, TSelectData, TQueryKey>,
    keyof BaseQueryOptions | 'queryKey' | 'queryFn'
  >;
