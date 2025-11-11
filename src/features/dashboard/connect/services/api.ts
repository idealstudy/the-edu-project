import { authApi } from '@/shared/lib';

import { ConnectionListRequestParams, ConnectionListResponse } from '../type';

export const getConnectionList = async (
  params: ConnectionListRequestParams
) => {
  return await authApi.get<ConnectionListResponse>('/connections', {
    params,
  });
};
