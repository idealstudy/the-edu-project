import { authHandlers } from './auth/handlers';
import { memberHandlers } from './member/handlers';

export const handlers = [...authHandlers, ...memberHandlers];
