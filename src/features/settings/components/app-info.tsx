import { APP_VERSION_INFO, formatBuiltAtKst } from '@/shared/lib/app-version';
import type { AppVersionInfo as AppVersionInfoValue } from '@/shared/lib/app-version';

type Props = {
  versionInfo?: AppVersionInfoValue;
};

export default function AppInfo({ versionInfo = APP_VERSION_INFO }: Props) {
  return (
    <section
      className="flex flex-col gap-6"
      aria-labelledby="app-info-heading"
    >
      <h2
        id="app-info-heading"
        className="font-body1-heading"
      >
        앱 정보
      </h2>

      <div className="border-line-line1 rounded-xl border bg-white p-6">
        <p className="font-body1-heading">디에듀 웹</p>
        <p
          className="text-text-sub2 font-caption-normal mt-2"
          data-testid="app-version"
        >
          버전 v{versionInfo.version} · 빌드 {versionInfo.commit} ·{' '}
          {formatBuiltAtKst(versionInfo.builtAt)}
        </p>
      </div>
    </section>
  );
}
