import { NextResponse } from 'next/server';

import axios, { AxiosError } from 'axios';

export function handleBffError(error: unknown): NextResponse {
  // Axios 에러인 경우 (Spring 응답까지 받은 케이스)
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<unknown>;

    // 응답이 아예 없으면 네트워크 문제
    // 타임아웃 같은 케이스
    if (!err.response) {
      // console.error('[BFF] Network or unknown axios error', err.message);
      return NextResponse.json(
        { message: '네트워크 오류가 발생했습니다.' },
        { status: 502 }
      );
    }

    const { status, data } = err.response;

    // 401 / 403 → 인증/인가 에러
    if (status === 401 || status === 403) {
      return NextResponse.json(
        {
          message: '인증이 필요하거나 권한이 없습니다.',
          status,
        },
        { status }
      );
    }

    // 나머지 4xx → 그대로 전달 (백엔드 메시지 신뢰한다고 가정)
    if (status >= 400 && status < 500) {
      return NextResponse.json(data ?? { status, message: '요청 오류' }, {
        status,
      });
    }

    // 5xx → 서버 에러
    // console.error('[BFF] Upstream server error', status, data);
    return NextResponse.json(
      {
        message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 500,
      },
      { status: 500 }
    );
  }

  // AxiosError가 아닌 예외 (Zod parse 실패, 코드 버그 등)
  // console.error('[BFF] Unexpected error', error);
  return NextResponse.json(
    {
      message: '예상치 못한 오류가 발생했습니다.',
      status: 500,
    },
    { status: 500 }
  );
}
