// import { API_BASE_URL } from '@/constants';
import { server } from '@/mocks/node';
import { afterAll, afterEach, beforeAll, describe, it } from 'vitest';

// const MEMBER_INFO_URL = `${API_BASE_URL}/member/info`;
beforeAll(() => server.listen());
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// TODO: member/info 테스트코드 작성 해야함
describe('로그인한 사용자 정보 조회 BFF 핸들러 테스트(GET /api/v1/member/info)', () => {
  it('[조회 성공]', async () => {
    const temp = 200;
    exports(temp).toBe(200);
  });
});
