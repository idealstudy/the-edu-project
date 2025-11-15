import { api } from '@/shared/api';

import { ConnectionListRequestParams, ConnectionListResponse } from '../type';

export const getConnectionList = async (
  params: ConnectionListRequestParams
) => {
  return await api.private.get<ConnectionListResponse>('/connections', {
    params,
  });
};
