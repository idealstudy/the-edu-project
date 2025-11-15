import { dashboardApi as api } from './api/dashboard.api';
import { adapter } from './model/dashboard.adapters';
import { domain } from './model/dashboard.schema';

// NOTE: 대시보드 스키마 및 어댑터
export const dashboard = { domain, adapter, api };

// NOTE: 대시보드 타입
export type { DashboardMember, Dashboard } from './types';

// NOTE: 커스텀 훅
export * from './hooks';

// NOTE: 쿼리키
export * from './api/query-keys';
