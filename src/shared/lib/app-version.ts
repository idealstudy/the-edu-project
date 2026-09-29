export type AppVersionInfo = {
  version: string;
  commit: string;
  builtAt: string;
  env: string;
};

export const APP_VERSION_INFO: AppVersionInfo = Object.freeze({
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
  commit: process.env.NEXT_PUBLIC_APP_COMMIT ?? 'local',
  builtAt: process.env.NEXT_PUBLIC_APP_BUILT_AT ?? '',
  env: process.env.NEXT_PUBLIC_APP_ENV ?? 'local',
});

export const APP_VERSION_IDENTITY = `${APP_VERSION_INFO.version}+${APP_VERSION_INFO.commit}`;

export const formatBuiltAtKst = (builtAt: string) => {
  const date = new Date(builtAt);

  if (Number.isNaN(date.getTime())) return '빌드 시각 미상';

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value('minute')} KST`;
};
