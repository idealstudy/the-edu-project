import { Member } from '@/entities/member';
import { authService } from '@/features/auth/services/api';

export const fetchMemberInfo = async (): Promise<Member | null> => {
  return await authService.getSession();
};
