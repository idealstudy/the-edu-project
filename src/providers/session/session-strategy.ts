import type { Member } from '@/entities';
import { memberKeys } from '@/features/member/api/keys';
import { getMemberInfoOptions } from '@/features/member/api/options';
import { AuthError } from '@/lib/error';
import type { QueryClient } from '@tanstack/react-query';

export interface SessionStrategy {
  bootstrap: () => Promise<Member | null>;
  hasSession?: () => boolean | Promise<boolean>;
}

export function makeQuerySessionStrategy(
  queryClient: QueryClient
): SessionStrategy {
  let inflight: Promise<Member | null> | null = null;

  const bootstrap = async (): Promise<Member | null> => {
    if (inflight) return inflight;
    inflight = (async () => {
      const cached = queryClient.getQueryData<Member>(memberKeys.info());
      if (cached) return cached;

      try {
        return await queryClient.fetchQuery(getMemberInfoOptions());
      } catch (e) {
        if (e instanceof AuthError) {
          queryClient.removeQueries({
            queryKey: memberKeys.info(),
            exact: true,
          });
          return null;
        }
        throw e;
      }
    })();

    try {
      return await inflight;
    } finally {
      inflight = null;
    }
  };

  return { bootstrap };
}
