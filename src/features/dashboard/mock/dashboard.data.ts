import {
  MarketingAsset,
  RecentNote,
  StudyRoom,
  SummaryCard,
} from '@/features/dashboard/types';
import { Icon } from '@/shared/components/ui/icon';

export const SUMMARY_CARDS: SummaryCard[] = [
  {
    id: 'today-classes',
    title: '오늘 수업',
    value: '4',
    description: '예정된 수업',
    icon: Icon.Notebook,
    accentClassName:
      'bg-gradient-to-br from-orange-scale-orange-1 to-orange-scale-orange-5 shadow-[0_18px_40px_rgba(255,103,55,0.15)]',
    iconClassName:
      'bg-gray-scale-white text-key-color-primary shadow-[0_12px_30px_rgba(255,103,55,0.24)]',
    badge: {
      label: '신규 1건',
      className: 'bg-orange-scale-orange-10/70 text-key-color-primary',
    },
  },
  {
    id: 'students',
    title: '연결된 학생',
    value: '55',
    description: '함께하는 학생 수',
    icon: Icon.Person,
    accentClassName:
      'bg-gradient-to-br from-[#F3F6FF] to-[#EEF1FF] shadow-[0_18px_40px_rgba(88,110,255,0.12)]',
    iconClassName:
      'bg-white text-[#586EFF] shadow-[0_12px_30px_rgba(88,110,255,0.18)]',
  },
  {
    id: 'assignments',
    title: '진행 중 과제',
    value: '69',
    description: '제출 대기 중',
    icon: Icon.BookText,
    accentClassName:
      'bg-gradient-to-br from-[#FFF6E5] to-[#FFEFD1] shadow-[0_18px_40px_rgba(255,200,72,0.14)]',
    iconClassName:
      'bg-white text-[#FFB200] shadow-[0_12px_30px_rgba(255,200,72,0.2)]',
  },
  {
    id: 'notifications',
    title: '확인할 알림',
    value: '13',
    description: '새로운 메시지',
    icon: Icon.Mail,
    accentClassName:
      'bg-gradient-to-br from-[#FFE9EF] to-[#FFD9E4] shadow-[0_18px_40px_rgba(244,114,182,0.18)]',
    iconClassName:
      'bg-white text-[#F472B6] shadow-[0_12px_30px_rgba(244,114,182,0.22)]',
  },
];

export const MY_STUDY_ROOMS: StudyRoom[] = [
  {
    id: 1,
    title: '어휘력 쑥쑥 스터디 #008',
    subject: '중3 영어',
    schedule: '매주 화 · 목 오후 7시',
    nextLesson: '다음 수업 12/12 (화)',
    memberCount: 15,
  },
  {
    id: 2,
    title: '성기쌤 정기 첨삭반',
    subject: '고2 국어',
    schedule: '매주 토요일 오전 10시',
    nextLesson: '다음 수업 12/16 (토)',
    memberCount: 18,
  },
  {
    id: 3,
    title: 'AI 시대 필수 문해력',
    subject: '중1 통합',
    schedule: '매주 월 · 수 오후 5시',
    nextLesson: '다음 수업 12/13 (수)',
    memberCount: 22,
  },
];

export const RECENT_STUDY_NOTES: RecentNote[] = [
  {
    id: 101,
    title: '12/10 개념 확장 수업',
    studyRoom: '어휘력 쑥쑥 스터디 #008',
    submittedAt: '12/10 (일) 21:10 저장',
    highlight: '신규 피드백 5건',
  },
  {
    id: 102,
    title: '12/09 실전 모의 테스트',
    studyRoom: '성기쌤 정기 첨삭반',
    submittedAt: '12/09 (토) 18:42 저장',
    highlight: '학생 제출 3건',
  },
  {
    id: 103,
    title: '12/08 비판적 사고 훈련',
    studyRoom: 'AI 시대 필수 문해력',
    submittedAt: '12/08 (금) 20:18 저장',
    highlight: '보호자 열람 2명',
  },
];

export const MARKETING_ASSETS: MarketingAsset[] = [
  {
    id: 'sms-kit',
    title: '문자 · 카카오톡 소개 문구',
    summary: '6종 템플릿과 복사하기 버튼 제공',
    description:
      '학부모에게 첫인상을 남길 수 있도록 상황별 문구를 미리 작성해 두었습니다. 체험 수업 안내, 정기 수업 홍보 등 상황에 맞춰 복사해 붙여 넣기만 하면 됩니다.',
    href: '/resources/marketing-kit#sms',
    ctaLabel: '문구 살펴보기',
  },
  {
    id: 'visual-pack',
    title: 'SNS · 블로그용 비주얼 패키지',
    summary: '채널별 권장 사이즈와 PSD/PNG 동봉',
    description:
      '이미지를 바로 업로드할 수 있도록 인스타그램, 블로그, 학원 알림장 맞춤 사이즈로 구성했습니다. 색상과 문구 레이어가 분리되어 있어 브랜드 컬러로 빠르게 커스터마이징할 수 있습니다.',
    href: '/resources/marketing-kit#visual',
    ctaLabel: '이미지 패키지 보기',
  },
  {
    id: 'landing',
    title: '체험 수업 랜딩 페이지 초안',
    summary: '노션 · 웹용 복제 템플릿 동시 제공',
    description:
      '체험 수업을 홍보하는 랜딩 페이지 구조를 그대로 옮겨 사용할 수 있게 PDF, 노션, 웹 템플릿을 함께 제공합니다. 주요 USP와 후기 섹션이 포함되어 있어 빠르게 배포할 수 있어요.',
    href: '/connections/invite',
    ctaLabel: '초안 가져가기',
  },
];
