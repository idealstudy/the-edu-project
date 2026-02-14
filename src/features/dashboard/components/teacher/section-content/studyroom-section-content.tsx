import { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const IMAGE_SIZE_MOBILE = 200;
const IMAGE_SIZE_TABLET = 300;
const IMAGE_GAP = 32;
const BUTTON_WIDTH = 32;
const TITLE_ROW_GAP = 8;
const ANIMATION_DURATION = 400;
const TABLET_BREAKPOINT = 768;

type StudyroomSectionContentProps = {
  hasStudyRooms: boolean;
  studyRooms: {
    id: number;
    name: string;
  }[];
  onStudyRoomClick: (studyRoomId: number) => void;
};

const StudyroomSectionContent = ({
  hasStudyRooms,
  studyRooms,
  onStudyRoomClick,
}: StudyroomSectionContentProps) => {
  const [isTablet, setIsTablet] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [translateX, setTranslateX] = useState(
    -(IMAGE_SIZE_MOBILE + IMAGE_GAP)
  );
  const [isAnimating, setIsAnimating] = useState(false);
  const totalCount = studyRooms.length;

  // 이미지 크기, 슬라이드 거리, 타이틀 뷰포트 너비 계산
  const imageSize = isTablet ? IMAGE_SIZE_TABLET : IMAGE_SIZE_MOBILE;
  const slideStep = imageSize + IMAGE_GAP;
  const titleViewportWidth = imageSize - BUTTON_WIDTH * 2 - TITLE_ROW_GAP * 2;
  const titleSlideStep = titleViewportWidth + IMAGE_GAP;
  const titleTranslateX = translateX * (titleSlideStep / slideStep);

  // 화면 크기 변경 시 타블렛 크기 여부 업데이트
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${TABLET_BREAKPOINT}px)`);
    const handler = () => setIsTablet(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 애니메이션
  useEffect(() => {
    if (!isAnimating) setTranslateX(-slideStep);
  }, [slideStep, isAnimating]);

  const prevIndex =
    totalCount > 0 ? (currentIndex - 1 + totalCount) % totalCount : 0;
  const nextIndex = totalCount > 0 ? (currentIndex + 1) % totalCount : 0;

  const goToPrev = useCallback(() => {
    if (isAnimating || totalCount <= 1) return;
    setIsAnimating(true);
    setTranslateX(0);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === 0 ? totalCount - 1 : prev - 1));
      setTranslateX(-slideStep);
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  }, [isAnimating, totalCount, slideStep]);

  const goToNext = useCallback(() => {
    if (isAnimating || totalCount <= 1) return;
    setIsAnimating(true);
    setTranslateX(-slideStep * 2);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev === totalCount - 1 ? 0 : prev + 1));
      setTranslateX(-slideStep);
      setIsAnimating(false);
    }, ANIMATION_DURATION);
  }, [isAnimating, totalCount, slideStep]);

  const handleAreaClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isLeftSide = clickX < rect.width / 2;
      if (isLeftSide) {
        goToPrev();
      } else {
        goToNext();
      }
    },
    [goToPrev, goToNext]
  );

  if (totalCount === 0) return null;

  return (
    <div className="flex w-full flex-col gap-8">
      <div
        className="relative w-full cursor-pointer overflow-hidden select-none"
        onClick={handleAreaClick}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') goToPrev();
          if (e.key === 'ArrowRight') goToNext();
        }}
      >
        {!hasStudyRooms && (
          <p className="font-body2-normal text-orange-7">
            상단을 참고해 스터디룸을 생성해주세요.
          </p>
        )}
        {/* 스터디룸 이미지 */}
        <div
          className="tablet:w-[300px] tablet:h-[300px] mx-auto h-[200px] w-[200px] overflow-hidden"
          onClick={() => onStudyRoomClick(studyRooms[currentIndex]?.id ?? 0)}
        >
          <div
            className="flex flex-nowrap items-center"
            style={{
              width: slideStep * 3 - IMAGE_GAP,
              gap: IMAGE_GAP,
              transform: `translateX(${translateX}px)`,
              transition: isAnimating
                ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`
                : 'none',
            }}
          >
            <div className="tablet:w-[300px] tablet:h-[300px] h-[200px] w-[200px] shrink-0">
              <Image
                src="/studyroom/study-room-opened.png"
                alt={studyRooms[prevIndex]?.name ?? '이전 스터디룸'}
                width={IMAGE_SIZE_TABLET}
                height={IMAGE_SIZE_TABLET}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="tablet:w-[300px] tablet:h-[300px] h-[200px] w-[200px] shrink-0">
              <Image
                src="/studyroom/study-room-opened.png"
                alt={studyRooms[currentIndex]?.name ?? '스터디룸'}
                width={IMAGE_SIZE_TABLET}
                height={IMAGE_SIZE_TABLET}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="tablet:w-[300px] tablet:h-[300px] h-[200px] w-[200px] shrink-0">
              <Image
                src="/studyroom/study-room-opened.png"
                alt={studyRooms[nextIndex]?.name ?? '다음 스터디룸'}
                width={IMAGE_SIZE_TABLET}
                height={IMAGE_SIZE_TABLET}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 스터디룸 타이틀 */}
      <div
        className="tablet:w-[300px] mx-auto flex h-6 w-[200px] cursor-pointer items-center gap-2 select-none"
        onClick={handleAreaClick}
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        tabIndex={0}
      >
        <button
          type="button"
          className="flex h-6 w-8 shrink-0 items-center justify-center border-0 bg-transparent px-1"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="이전 스터디룸"
          disabled={totalCount <= 1}
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>

        <div
          className="h-6 min-w-0 flex-1 overflow-hidden"
          onClick={() => onStudyRoomClick(studyRooms[currentIndex]?.id ?? 0)}
        >
          <div
            className="flex flex-nowrap items-center"
            style={{
              width: titleSlideStep * 3 - IMAGE_GAP,
              gap: IMAGE_GAP,
              transform: `translateX(${titleTranslateX}px)`,
              transition: isAnimating
                ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`
                : 'none',
            }}
          >
            <div
              className="font-headline2-heading text-gray-12 min-w-0 shrink-0 truncate text-center leading-6"
              style={{ width: titleViewportWidth, height: 24 }}
            >
              {studyRooms[prevIndex]?.name}
            </div>
            <div
              className="font-headline2-heading text-gray-12 min-w-0 shrink-0 truncate text-center leading-6"
              style={{ width: titleViewportWidth, height: 24 }}
            >
              {studyRooms[currentIndex]?.name}
            </div>
            <div
              className="font-headline2-heading text-gray-12 min-w-0 shrink-0 truncate text-center leading-6"
              style={{ width: titleViewportWidth, height: 24 }}
            >
              {studyRooms[nextIndex]?.name}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="flex h-6 w-8 shrink-0 items-center justify-center border-0 bg-transparent px-1"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="다음 스터디룸"
          disabled={totalCount <= 1}
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default StudyroomSectionContent;
