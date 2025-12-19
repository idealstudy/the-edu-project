import Image from 'next/image';

import { Role } from '@/entities/member';
import { cn } from '@/shared/lib/utils';
import { RadioGroup as RadioGroupPrimitives } from 'radix-ui';

type RoleRadioGroupItemProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitives.Item>,
  'value' | 'onValueChange'
> & {
  value: Role;
};

const RoleRadioGroupItem = ({
  className,
  children,
  ...props
}: RoleRadioGroupItemProps) => {
  return (
    <RadioGroupPrimitives.Item
      className={cn(
        // 기본 스타일
        'text-gray-scale-gray-50 border-gray-scale-gray-10 flex h-[180px] w-[174px] cursor-pointer flex-col items-center justify-center gap-2 border pt-6 pb-3 font-medium transition-all duration-200',
        // 호버 효과
        'hover:border-key-color-primary hover:bg-orange-scale-orange-1 hover:text-text-main',
        // 선택된 상태 (Radix UI는 data-[state=checked] 사용)
        'data-[state=checked]:border-key-color-primary data-[state=checked]:bg-orange-scale-orange-1 data-[state=checked]:text-text-main data-[state=checked]:outline-key-color-primary data-[state=checked]:shadow-[0_4px_12px_rgba(255,72,5,0.15)] data-[state=checked]:outline data-[state=checked]:outline-2',
        className
      )}
      {...props}
    >
      {children}
    </RadioGroupPrimitives.Item>
  );
};

type RoleRadioGroupProps = Omit<
  React.ComponentProps<typeof RadioGroupPrimitives.Root>,
  'onValueChange' | 'onChange'
> & {
  onChange: (value: Role) => void;
};

export const RoleRadioGroup = ({
  className,
  onChange,
  ...props
}: RoleRadioGroupProps) => {
  return (
    <RadioGroupPrimitives.Root
      className={cn('flex gap-6', className)}
      onValueChange={onChange}
      {...props}
    >
      <RoleRadioGroupItem value="ROLE_TEACHER">
        <Image
          width={100}
          height={124}
          src="/character/img_signup_type01.png"
          alt="선생님"
        />
        선생님
      </RoleRadioGroupItem>
      <RoleRadioGroupItem value="ROLE_STUDENT">
        <Image
          width={108}
          height={124}
          src="/character/img_signup_type02.png"
          alt="학생"
        />
        학생
      </RoleRadioGroupItem>
      <RoleRadioGroupItem value="ROLE_PARENT">
        <Image
          width={132}
          height={120}
          src="/character/img_signup_type03.png"
          alt="학부모"
        />
        학부모
      </RoleRadioGroupItem>
    </RadioGroupPrimitives.Root>
  );
};
