'use client';

import React from 'react';

import Image from 'next/image';

import { Button } from '@/shared/components/ui/button';

const StudentInvitation = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      className="border-key-color-primary text-key-color-primary hover:bg-key-color-secondary/20 gap-2 rounded-xl font-semibold"
      variant="outlined"
      onClick={onClick}
    >
      <Image
        src="/studynotes/invite_student.svg"
        alt="search"
        width={30}
        height={30}
        className="h-[30px] w-[30px]"
      />
      <span>학생 초대</span>
    </Button>
  );
};

export default StudentInvitation;
