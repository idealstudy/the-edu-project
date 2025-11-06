import { cookies } from 'next/headers';

import axios from 'axios';

const BASE_URL = 'https://dev.the-edu.site/api';

export async function createServerAuthHttp() {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      // ← 핵심: 서버에서 쿠키 수동 주입
      Cookie: cookieHeader,
    },
  });
}
