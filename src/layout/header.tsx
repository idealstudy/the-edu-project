'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { NotificationPopover } from '@/features/notifications/components/notification-popover';
// import { useLogoutMutation } from '@/features/auth/services/query';

import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';
import { PRIVATE, PUBLIC } from '@/shared/constants';
import {
  trackGnbLogoClick,
  trackGnbLogoutClick,
  trackGnbProfileClick,
} from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';

export const Header = () => {
  const session = useMemberStore((s) => s.member);
  const router = useRouter();

  const goToMypage = () => {
    router.push('/mypage');
  };

  // const router = useRouter();
  // const { mutate: logout } = useLogoutMutation();
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();

    // GNB 로그아웃 클릭 이벤트 전송
    trackGnbLogoutClick(session?.role ?? null);
  };

  const roleMetaMap = {
    ROLE_ADMIN: {
      label: '관리자',
      className: 'border-white text-white',
    },
    ROLE_STUDENT: {
      label: '학생',
      className: 'border-white text-white',
    },
    ROLE_PARENT: {
      label: '보호자',
      className: 'border-orange-scale-orange-20 text-orange-scale-orange-20',
    },
    ROLE_TEACHER: {
      label: '선생님',
      className: 'border-key-color-primary text-key-color-primary',
    },
    ROLE_MEMBER: {
      label: '회원',
      className: 'border-white text-white',
    },
  } as const;

  const buttonBase =
    'cursor-pointer border border-[#1A1A1A] px-6 py-3 text-base font-bold text-white';

  // 수정된 스타일
  const feedbackButtonBase =
    'flex items-center gap-1.5 rounded-full border border-gray-scale-gray-60 bg-transparent px-4 py-1.5 text-sm font-semibold text-gray-scale-gray-30 transition-colors hover:border-gray-scale-gray-30 hover:text-white cursor-pointer';

  return (
    <header className="h-header-height fixed top-0 right-0 left-0 z-10 flex items-center border-b border-gray-200 bg-[#1A1A1A] px-8">
      <div className="mx-auto flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={
              session === null ? PUBLIC.CORE.INDEX : PRIVATE.DASHBOARD.INDEX
            }
            onClick={() => {
              // GNB 로고 클릭 이벤트 전송
              trackGnbLogoClick(session?.role ?? null);
            }}
          >
            <Image
              src={'/logo.svg'}
              alt="THE EDU 로고"
              width={79}
              height={22}
              className="cursor-pointer"
            />
          </Link>
          <Image
            src={'/img_header_beta.svg'}
            alt="BETA"
            width={44}
            height={20}
          />
          <Link
            href="https://forms.gle/ktLvekAsKTkqTcpQ6"
            className={`${feedbackButtonBase} ml-2`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/ic_question_mark.svg"
              alt="피드백"
              width={16}
              height={16}
            />
            소중한 의견 보내기
          </Link>
          {session && (
            <>
              {/* <Link
                href={ROUTE.DASHBOARD.HOME}
                className="mx-2 text-white"
              >
                대시보드
              </Link> */}
            </>
          )}
        </div>
        {session && (
          <div className="desktop:gap-4 flex items-center gap-1">
            <NotificationPopover />

            <DropdownMenu>
              <DropdownMenu.Trigger
                className="flex cursor-pointer items-center justify-center"
                onClick={() => {
                  // GNB 프로필 조회 클릭 이벤트 전송
                  trackGnbProfileClick(session?.role ?? null);
                }}
              >
                <Image
                  src={'/img_header_profile.svg'}
                  alt="프로필 사진"
                  width={48}
                  height={48}
                  className="desktop:flex hidden cursor-pointer rounded-full"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => goToMypage()}>
                  마이페이지
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => handleLogout()}>
                  로그아웃
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>

            {session?.role && (
              <div className="desktop:flex hidden items-center rounded-[40px] border px-2 py-[2px] text-[12px] font-[400px] text-[#ffffff]">
                {roleMetaMap[session.role]?.label}
              </div>
            )}
            <Image
              src={'/ic_hamburger.svg'}
              alt="햄버거 메뉴 아이콘"
              width={24}
              height={24}
              className="desktop:hidden mr-4 flex cursor-pointer"
            />
          </div>
        )}
        {!session && (
          <div className="flex gap-5">
            <Link
              href={PUBLIC.CORE.LOGIN}
              className={buttonBase}
            >
              로그인
            </Link>
            <Link
              href={PUBLIC.CORE.SIGNUP}
              className={`${buttonBase} bg-key-color-primary hover:bg-key-color-secondary`}
            >
              디에듀 시작하기
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
