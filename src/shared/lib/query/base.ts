import { BaseQueryOptions } from './types';

/**
 * @description 모든 React Query 훅에 공통으로 적용되는 기본 옵션입니다.
 *
 * - staleTime: 30초 동안 데이터를 'fresh' 상태로 간주합니다.
 * - gcTime: 5분 후 가비지 컬렉션(GC)됩니다.
 * - retry: 실패 시 1회 재시도합니다.
 * - refetchOnWindowFocus: 창 포커스 시 자동 재요청을 비활성화합니다.
 * - refetchOnMount: 컴포넌트 마운트 시 자동 재요청을 활성화합니다.
 */
const DEFAULT_QUERY_OPTION: Required<BaseQueryOptions> = {
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  refetchOnMount: true,
};

/**
 * @template T - queryKey, queryFn 등 쿼리별 필수 옵션을 포함하는 객체 타입.
 * @description 기본 옵션(DEFAULT_QUERY_OPTION)에 훅별 덮어쓰기 옵션(base)과 쿼리별 필수 옵션(opt)을 병합하여 최종 쿼리 옵션 객체를 반환합니다.
 *
 * 병합 순서 (우선순위 낮음 -> 높음): DEFAULT_QUERY_OPTION -> base -> opt
 *
 * @param {T} opt - 쿼리 키(queryKey), 쿼리 함수(queryFn) 등 쿼리 자체를 정의하는 필수 옵션 (가장 높은 우선순위).
 * @param {Partial<BaseQueryOptions>} [base={}] - DEFAULT_QUERY_OPTION을 덮어쓰고 싶은 옵션 (예: staleTime, retry 등).
 * @returns {T & Required<BaseQueryOptions>} 기본 옵션이 적용된 최종 React Query 옵션 객체.
 */
const withBase = <T extends object>(
  opt: T,
  base: Partial<BaseQueryOptions> = {}
): T & Required<BaseQueryOptions> =>
  ({ ...DEFAULT_QUERY_OPTION, ...base, ...opt }) as T &
    Required<BaseQueryOptions>;

export const queryConfig = {
  DEFAULT_QUERY_OPTION,
  withBase,
};
