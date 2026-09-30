/**
 * 새 배포 감지 판정. 설치형 앱(PWA)은 며칠씩 떠 있어서, 배포 전에 받은 화면 코드와
 * 전역 스타일을 계속 쓴다. 화면 안 이동(비회원 탐색·이메일 로그인)은 전체 새로고침이
 * 아니라서 새 배포가 반영되지 않는다. 서버 버전과 내 빌드 버전이 다르면 한 번 새로고침한다.
 */
export type ServerVersion = { version?: unknown; commit?: unknown };

export const RELOAD_MARK_KEY = 'dedu:reloaded-for';

export const toIdentity = (v: ServerVersion) =>
  typeof v.version === 'string' && typeof v.commit === 'string'
    ? `${v.version}+${v.commit}`
    : null;

export const shouldReloadForVersion = (
  clientIdentity: string,
  server: ServerVersion,
  alreadyReloadedFor: string | null
) => {
  const serverIdentity = toIdentity(server);
  if (!serverIdentity) return false;
  // 로컬 개발 빌드는 판정하지 않는다.
  if (clientIdentity.startsWith('unknown') || clientIdentity.endsWith('+local'))
    return false;
  if (serverIdentity === clientIdentity) return false;
  // 같은 새 버전으로 이미 한 번 새로고침했으면 다시 하지 않는다(무한 새로고침 방지).
  return alreadyReloadedFor !== serverIdentity;
};
