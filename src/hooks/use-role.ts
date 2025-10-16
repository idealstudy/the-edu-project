import { Role } from '@/features/auth/type';
import { useQueryClient } from '@tanstack/react-query';

export const useRole = () => {
  const qc = useQueryClient();
  const session = qc.getQueryData<{ auth?: Role }>(['session']);
  const role = session?.auth;

  return { role };
};
