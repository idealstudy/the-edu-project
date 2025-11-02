// 개발/테스트용 - 클라이언트에서 직접 인증 쿠키를 읽는 용도
export const getSessionCookie = () => {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken='))
    ?.split('=')[1];
};

// 강제로 쿠키 삭제 (로그아웃 테스트용)
export const clearSessionCookie = () => {
  document.cookie = 'accessToken=; Max-Age=0; path=/';
};
