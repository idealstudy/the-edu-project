'use client';

import { FormEvent, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type Props = {
  studyRoomId: number;
  title: string;
  placeholder: string;
  buttonText: string;
  storageKey: string;
  targetPath: string;
  buttonTestId?: string;
  inputTestId?: string;
};

export const StudyNoteSearch = ({
  studyRoomId,
  title,
  placeholder,
  buttonText,
  storageKey,
  targetPath,
  buttonTestId,
  inputTestId,
}: Props) => {
  const [isLoading, setisLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? '';
    if (value) sessionStorage.setItem(storageKey, value);

    try {
      setisLoading(true);
      router.push(`/study-rooms/${studyRoomId}/${targetPath}`);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };
  return (
    <>
      <p className="font-headline1-heading whitespace-pre-wrap">{title}</p>

      <form
        onSubmit={handleSubmit}
        className="rounded-card flex h-14 items-center gap-2.5 bg-white"
      >
        <Input
          ref={inputRef}
          className="desktop:w-126 border-line-line1 h-14 px-6 py-4.5"
          placeholder={placeholder}
          maxLength={30}
          data-testid={inputTestId}
        />
        <Button
          type="submit"
          className="desktop:w-40.5 rounded-button h-14 text-white"
          disabled={isLoading}
          data-testid={buttonTestId}
        >
          <span className="font-body2-normal font-bold">
            {isLoading ? '페이지 이동중...' : buttonText}
          </span>
        </Button>
      </form>
    </>
  );
};
