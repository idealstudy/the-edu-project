import { memberKeys } from '@/features/member/api/keys';
import { getMemberInfoOptions } from '@/features/member/api/options';
import type { Member } from '@/features/member/model/types';
import { AuthError } from '@/lib/error';
import type { SessionStrategy } from '@/providers/session/session-strategy';
import type { QueryClient } from '@tanstack/react-query';

export class QuerySessionStrategy implements SessionStrategy {
  constructor(private readonly queryClient: QueryClient) {}

  async bootstrap(): Promise<Member | null> {
    const cached = this.queryClient.getQueryData<Member>(memberKeys.info());
    if (cached) return cached;

    try {
      return await this.queryClient.fetchQuery(getMemberInfoOptions());
    } catch (error) {
      if (error instanceof AuthError) {
        this.queryClient.removeQueries({
          queryKey: memberKeys.info(),
          exact: true,
        });
        return null;
      }
      throw error;
    }
  }
}
