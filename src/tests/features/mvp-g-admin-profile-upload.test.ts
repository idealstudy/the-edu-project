import { getProfileImagePresignPath } from '@/features/mypage/common/components/edit-profile-card';
import { describe, expect, test } from 'vitest';

describe('MVP-G 관리자 프로필 업로드 입구', () => {
  test('관리자는 관리자 전용 presign 경로를 사용한다', () => {
    expect(getProfileImagePresignPath('ROLE_ADMIN')).toBe(
      '/admin/media/presign-batch'
    );
  });

  test('기존 역할은 공통 presign 경로를 유지한다', () => {
    expect(getProfileImagePresignPath('ROLE_STUDENT')).toBe(
      '/common/media/presign-batch'
    );
  });
});
