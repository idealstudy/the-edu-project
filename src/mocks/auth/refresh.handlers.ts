import { serverEnv } from '@/shared/lib/bff';
import { HttpResponse, http } from 'msw';

const createSetCookieHeaders = () => {
  const headers = new Headers();
  headers.append('Set-Cookie', 'sid=new_session_id; Path=/; HttpOnly; Secure');
  headers.append(
    'Set-Cookie',
    'refresh=new_refresh_token; Path=/api/auth/refresh; HttpOnly; Secure'
  );
  return headers;
};

// 요청 헤더에 refresh 토큰이 있는지 확인하는 로직 추가 가능
// 토큰이 없거나 유효하지 않으면 401을 반환할수 있음
// 테스트 편의상 204 성공 시나리오만 진행
export const refreshHandlers = [
  http.get(`${serverEnv.backendApiUrl}/auth/refresh`, ({ request }) => {
    const cookieHeader = request.headers.get('Cookie');
    // console.log('MSW received Cookie header:', cookieHeader);
    if (!cookieHeader || !cookieHeader.includes('refresh-token')) {
    }

    // MSW 응답에 새로운 Set-Cookie 헤더를 포함하여 반환
    return new HttpResponse(null, {
      status: 204,
      headers: createSetCookieHeaders(),
      /*headers: {
        'Set-Cookie': [
          'sid=new_session_id; Path=/; HttpOnly; Secure',
          'refresh=new_refresh_token; Path=/api/auth/refresh; HttpOnly; Secure',
        ],
      },*/
    });
  }),

  // 실패시 쿠키를 제거하는 Set-Cookie 헤더를 포함가능(본문과 401 상태만 반환)
  http.get(`${serverEnv.backendApiUrl}/auth/refresh`, () => {
    return HttpResponse.json(
      { message: 'Refresh token expired or invalid.' },
      {
        status: 401,
      }
    );
  }),
];
