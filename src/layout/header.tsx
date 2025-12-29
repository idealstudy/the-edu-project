'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useAuth } from '@/features/auth/hooks/use-auth';
// import { useLogoutMutation } from '@/features/auth/services/query';

import { DropdownMenu } from '@/shared/components/ui/dropdown-menu';
// import { useRouter } from 'next/navigation';

import { PRIVATE, PUBLIC } from '@/shared/constants';
import {
  trackGnbAlarmClick,
  trackGnbLogoClick,
  trackGnbLogoutClick,
  trackGnbProfileClick,
} from '@/shared/lib/gtm/trackers';
import { useMemberStore } from '@/store';

export const Header = () => {
  const session = useMemberStore((s) => s.member);

  // const router = useRouter();
  // const { mutate: logout } = useLogoutMutation();
  const { logout } = useAuth();
  const handleLogout = () => {
    // GNB 로그아웃 클릭 이벤트 전송
    trackGnbLogoutClick(session?.role ?? null);

    void logout();
    // TODO: 세션 유효한지 확인하는 API / Logout API 부재로
    // window.location 사용 => 추후에 router.replace로 변경
    window.location.replace(PUBLIC.CORE.INDEX);
    // router.replace(ROUTE.HOME);
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
  } as const;

  const buttonBase =
    'cursor-pointer border border-[#1A1A1A] px-6 py-3 text-base font-bold text-white';

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
          {session && (
            <>
              {/* <Link
                href={ROUTE.DASHBOARD.HOME}
                className="mx-2 text-white"
              >
                대시보드
              </Link> */}
              <Link
                href=""
                className="mx-2 text-white"
                onClick={() => {
                  alert('서비스 준비 중입니다');
                }}
              >
                공지사항
              </Link>
              <Link
                href="https://open.kakao.com/o/gzPs2mIe"
                className="mx-2 text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                카카오 오픈채팅
              </Link>
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLScorJ0ofMtrxSDiFukigY-ytiablWaQE1MqaYplfzLfFY07Gw/viewform?usp=header"
                className="mx-2 text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                피드백
              </Link>
            </>
          )}
        </div>
        {session && (
          <div className="flex items-center">
            <Image
              src={'/img_header_bell.svg'}
              alt="알림 벨 아이콘"
              width={24}
              height={24}
              className="mr-8 cursor-pointer"
              onClick={() => {
                // GNB 알림 아이콘 클릭 이벤트 전송
                trackGnbAlarmClick(session?.role ?? null);
              }}
            />

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
                  className="desktop:flex mr-4 hidden cursor-pointer rounded-full"
                />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item onClick={() => handleLogout()}>
                  로그아웃
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>

            <p className="desktop:flex mr-2 hidden items-center gap-2 text-[14px] font-[600] text-white">
              {session.nickname}
            </p>
            {session?.role && (
              <div className="desktop:flex hidden items-center gap-2 rounded-[40px] border px-2 py-[2px] text-[12px] font-[400px] text-[#ffffff]">
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
