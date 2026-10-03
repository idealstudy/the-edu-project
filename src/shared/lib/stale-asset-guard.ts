/**
 * 옛 빌드 HTML 자가 복구 스크립트(인라인, 프레임워크 없이 동작).
 *
 * 설치형 앱에서 옛 HTML 이 뜨면 그 HTML 이 가리키는 /_next/static 파일이 이미 지워져 404 가 난다.
 * 그러면 화면 스크립트가 못 켜져 버튼이 안 먹고 예전 모양이 남는다. 이 스크립트는 그런 정적 파일
 * 적재 실패를 잡아 한 번만 새로고침한다. 같은 탭에서 1분 안 재발은 무시해 반복을 막는다.
 */
export const STALE_ASSET_RELOAD_KEY = 'dedu:stale-asset-reload-at';
export const STALE_ASSET_RELOAD_COOLDOWN_MS = 60_000;

export const shouldReloadForAssetError = (
  assetUrl: string,
  lastReloadAt: number,
  now: number
): boolean => {
  if (!assetUrl.includes('/_next/static/')) return false;
  return now - lastReloadAt >= STALE_ASSET_RELOAD_COOLDOWN_MS;
};

export const STALE_ASSET_GUARD = `(function(){var K=${JSON.stringify(
  STALE_ASSET_RELOAD_KEY
)},C=${STALE_ASSET_RELOAD_COOLDOWN_MS};window.addEventListener('error',function(e){var t=e&&e.target;if(!t||t===window)return;var u=t.src||t.href||'';if(String(u).indexOf('/_next/static/')<0)return;var last=0;try{last=Number(sessionStorage.getItem(K))||0}catch(_){}var now=Date.now();if(now-last<C)return;try{sessionStorage.setItem(K,String(now))}catch(_){}location.reload()},true)})();`;
