import type { Member } from '@/features/member/model/types';

export interface SessionStrategy {
  bootstrap: () => Promise<Member | null>;
}
