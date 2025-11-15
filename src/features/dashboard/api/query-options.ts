import type { Dashboard } from '@/features/dashboard';
import { dashboard, DashboardQueryKeys as key } from '@/features/dashboard';
import { queryConfig } from '@/shared/lib';
import type {
  BaseQueryOptions,
  QueryOptionsWithBase,
} from '@/shared/lib/query/types';

/**
 * @description 대시보드 데이터를 가져오는 쿼리 옵션을 생성합니다.
 * 이 팩토리는 기본 설정(staleTime, retry 등)을 적용하고 쿼리 키/함수 및 에러 핸들러를 정의합니다.
 *
 * @param {BaseQueryOptions} [base={}] - 훅 사용 시 기본 옵션(DEFAULT_QUERY_OPTION)을 덮어쓰기 위해 전달되는 옵션입니다.
 * @returns {QueryOptionsWithBase<Dashboard>} 기본 설정이 적용된 최종 React Query 옵션 객체.
 */
const getDashboardQueryOption = (
  base: BaseQueryOptions = {}
): QueryOptionsWithBase<Dashboard> => {
  return queryConfig.withBase(
    {
      queryKey: key.all,
      queryFn: dashboard.api.getDashboard,
      onError: (error: unknown) => {
        // eslint-disable-next-line no-console
        console.error('대시보드 로드 실패:', error);
      },
    },
    base
  );
};

export const options = {
  getDashboard: getDashboardQueryOption,
};
