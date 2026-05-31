import { refreshHandlers } from '@/mocks/auth/refresh.handlers';

import { authHandlers } from './auth/handlers';
import { memberHandlers } from './member/handlers';

export const handlers = [
  ...authHandlers,
  ...memberHandlers,
  ...refreshHandlers,
];
