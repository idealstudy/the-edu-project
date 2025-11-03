import { queryKey } from '@/constants/query-key';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();

  const login = async () => {
    // NOTE: 로그인 성공 후 세션 캐시를 갱신하기 위해 기존 데이터 무효화
    await queryClient.invalidateQueries({
      queryKey: queryKey.session,
    });
  };

  const logout = async () => {
    // NOTE: 로그아웃 시 세션 캐시 초기화 및 무효화
    queryClient.setQueryData(queryKey.session, null);
    await queryClient.invalidateQueries({ queryKey: queryKey.session });
  };

  return {
    login,
    logout,
  };
};
