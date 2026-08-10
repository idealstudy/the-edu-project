'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button as UnstyledButton } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

const BackLink = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <div>
      <UnstyledButton
        variant="unstyled"
        size="none"
        className={cn(
          'text-text-sub2 flex cursor-pointer items-center gap-[6px] pt-4 text-xl leading-[160%] tracking-[-4%]',
          className
        )}
        onClick={() => router.back()}
      >
        {children ? (
          children
        ) : (
          <>
            <Image
              src="/common/arrow-left.svg"
              alt="back-link"
              width={20}
              height={20}
            />
            <p>이전으로</p>
          </>
        )}
      </UnstyledButton>
    </div>
  );
};

export default BackLink;
