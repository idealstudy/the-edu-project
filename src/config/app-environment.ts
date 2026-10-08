export type AppEnvironment = 'dev' | 'production' | 'preview' | 'local';

type ResolveAppEnvironmentInput = {
  baseUrl?: string;
  projectProductionUrl?: string;
  vercelEnv?: string;
};

// 2026-10-08 운영 도메인 이전(d-edu.site 만료 → hongong.today). 옛 도메인은 재갱신 대비로 유지.
const PRODUCTION_HOSTS = ['hongong.today', 'd-edu.site'];

const resolveHostname = (value?: string) => {
  const candidate = value?.trim();

  if (!candidate) return null;

  try {
    const url = candidate.includes('://')
      ? new URL(candidate)
      : new URL(`https://${candidate}`);

    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
};

export const resolveAppEnvironment = ({
  baseUrl,
  projectProductionUrl,
  vercelEnv,
}: ResolveAppEnvironmentInput): AppEnvironment => {
  const deploymentUrl = baseUrl?.trim() || projectProductionUrl;
  const hostname = resolveHostname(deploymentUrl);

  if (vercelEnv === 'preview') return 'preview';
  if (hostname?.startsWith('dev.')) return 'dev';
  if (
    PRODUCTION_HOSTS.some(
      (host) => hostname === host || hostname?.endsWith(`.${host}`)
    )
  ) {
    return 'production';
  }

  return 'local';
};
