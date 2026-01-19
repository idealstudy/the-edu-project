// 역할별 메타 정보
export const ROLE_META_MAP = {
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

// 버튼 스타일
export const BUTTON_BASE =
  'cursor-pointer border border-[#1A1A1A] px-6 py-3 text-base font-bold text-white';

export const FEEDBACK_BUTTON_BASE =
  'flex items-center gap-1.5 rounded-full border border-gray-scale-gray-60 bg-transparent px-4 py-1.5 text-sm font-semibold text-gray-scale-gray-30 transition-colors hover:border-gray-scale-gray-30 hover:text-white cursor-pointer';
