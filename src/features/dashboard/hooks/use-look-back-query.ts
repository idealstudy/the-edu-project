import {
  type LookBackPeriod,
  lookBackRepository,
} from '@/entities/look-back/infrastructure/look-back.repository';
import { useQuery } from '@tanstack/react-query';

export const useLookBackQuery = (period: LookBackPeriod, offset = 0) =>
  useQuery({
    queryKey: ['student-look-back', period, offset],
    queryFn: () => lookBackRepository.getLookBack(period, offset),
  });
