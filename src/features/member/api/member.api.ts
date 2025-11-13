import { MemberDTO } from '@/entities/member';
import { authService } from '@/features/auth/services/api';

export const fetchMemberInfo = async (): Promise<MemberDTO | null> => {
  return await authService.getSession();
};
