export type AppEnvironment = 'dev' | 'production' | 'preview' | 'local';

type ResolveAppEnvironmentInput = {
  baseUrl?: string;
  projectProductionUrl?: string;
  vercelEnv?: string;
};

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
  if (hostname === 'd-edu.site' || hostname?.endsWith('.d-edu.site')) {
    return 'production';
  }

  return 'local';
};
