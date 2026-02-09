import { teacherKeys } from '@/entities/teacher/infrastructure/teacher.keys';
import { repository } from '@/entities/teacher/infrastructure/teacher.repository';
import { useQuery } from '@tanstack/react-query';

// [GET] 선생님 기본 정보 조회
export const useTeacherBasicInfo = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: teacherKeys.basicInfo(),
    queryFn: () => repository.basicInfo.getBasicInfo(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
