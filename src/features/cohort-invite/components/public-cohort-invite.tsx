import Link from 'next/link';

import { Button } from '@/shared/components/ui';
import { PUBLIC } from '@/shared/constants/route';

/**
 * 1:N 기수(cohort) 초대 링크의 웹 진입점.
 *
 * 백엔드 조회 API(`GET /api/public/cohort-invitations/{token}`, native-release
 * 브랜치의 C3)가 아직 develop 백엔드에 없어(2026-09-26 실측, mvp-back 전수
 * grep 0건) 초대 미리보기를 만들 수 없다. 실데이터 없이 학생 이름·기수명
 * 같은 값을 지어내지 않고, 그 API가 배포될 때까지는 앱 설치 안내로만
 * 안전하게 착지시킨다. API가 배포되면 이 컴포넌트를 교체해 실제 미리보기
 * (`PublicTeacherInvite`와 같은 loading/error/수락 패턴)로 바꾼다.
 */
export const PublicCohortInvite = ({ token }: { token: string }) => {
  return (
    <div
      className="max-w-dialog mx-auto p-6 text-center"
      data-testid="cohort-invite-fallback"
    >
      <h1 className="text-xl font-extrabold">앱에서 여는 초대예요</h1>
      <p className="text-gray-9 mt-2 text-sm leading-6">
        이 링크는 디에듀 앱에서 열어야 반 초대를 확인할 수 있어요. 앱이 아직
        없다면 선생님께 안내받은 방법으로 참여해주세요.
      </p>
      <p className="text-gray-6 mt-4 text-xs break-all">
        초대 코드: {token}
      </p>
      <Link
        className="mt-5 block"
        href={PUBLIC.CORE.LOGIN}
      >
        <Button
          className="h-11 w-full"
          variant="outlined"
        >
          로그인하고 직접 확인하기
        </Button>
      </Link>
    </div>
  );
};
