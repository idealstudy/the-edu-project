import { authApi } from '@/lib/http';

import { ConnectionListRequestParams, ConnectionListResponse } from '../type';

export const getConnectionList = async (
  params: ConnectionListRequestParams
) => {
  return await authApi.get<ConnectionListResponse>('/connections', {
    params,
  });
};
