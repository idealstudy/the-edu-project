'use client';

import { useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import { DEFAULT_PROFILE_IMAGE, getProfileImageSrc } from '@/shared/constants';

interface CommentCardHeaderProps {
  profileImageSrc: string;
  authorName: string;
  roleLabel: string;
}

const getFallbackProfileImage = (roleLabel: string): string => {
  if (roleLabel === '학생') return DEFAULT_PROFILE_IMAGE.STUDENT;
  if (roleLabel === '부모님') return DEFAULT_PROFILE_IMAGE.PARENT;

  return DEFAULT_PROFILE_IMAGE.TEACHER;
};

export const CommentCardHeader = ({
  profileImageSrc,
  authorName,
  roleLabel,
}: CommentCardHeaderProps) => {
  const fallbackProfileImage = useMemo(
    () => getFallbackProfileImage(roleLabel),
    [roleLabel]
  );
  const safeProfileImageSrc = useMemo(
    () => getProfileImageSrc(profileImageSrc, fallbackProfileImage),
    [fallbackProfileImage, profileImageSrc]
  );
  const [imageSrc, setImageSrc] = useState(safeProfileImageSrc);

  useEffect(() => {
    setImageSrc(safeProfileImageSrc);
  }, [safeProfileImageSrc]);

  const handleImageError = (): void => {
    setImageSrc(fallbackProfileImage);
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="border-gray-12 h-9 w-9 shrink-0 overflow-hidden rounded-full border">
        <Image
          src={imageSrc}
          alt="프로필 이미지"
          width={36}
          height={36}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      </div>
      <div className="flex items-center gap-1">
        <p className="font-body2-normal text-gray-12">
          {roleLabel === '선생님' ? '선생님' : authorName}
        </p>
        {roleLabel === '학생' && (
          <>
            <p className="text-gray-7">·</p>
            <p className="font-body2-normal text-gray-7">{roleLabel}</p>
          </>
        )}
      </div>
    </div>
  );
};
