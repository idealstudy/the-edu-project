'use client';

import Link from 'next/link';

import type { NotificationCategory } from '@/entities/notification';
import type {
  FrontendStudentStudyRoomListItem,
  FrontendStudentTeachingNoteListItem,
} from '@/entities/student';
import {
  useStudentBasicInfo,
  useUpdateStudentBasicInfo,
} from '@/features/mypage/common/hooks/student/use-basic-info';
import { useStudentReport } from '@/features/mypage/profile/hooks/student/use-report';
import { useStudentStudyRooms } from '@/features/mypage/profile/hooks/student/use-study-rooms';
import { useStudentTeachingNotes } from '@/features/mypage/profile/hooks/student/use-teaching-notes';
import {
  useNotificationSettings,
  useUpdateNotificationSetting,
} from '@/features/settings/hooks/use-notification';
import { PageLayout } from '@/layout';
import {
  Button,
  Card,
  EmptyState,
  ProfileAvatar,
  StatusBadge,
} from '@/shared/components/ui';
import { Toggle } from '@/shared/components/ui/toggle';
import { PRIVATE } from '@/shared/constants';
import { formatMMDDWeekday } from '@/shared/lib';
import { BookOpenText, GraduationCap } from 'lucide-react';

const NOTIFICATION_ROWS: Array<{
  category: NotificationCategory;
  label: string;
  description: string;
}> = [
  {
    category: 'TEACHING_NOTE',
    label: '수업노트 알림',
    description: '새 수업노트를 받으면 알려드려요.',
  },
  {
    category: 'QNA',
    label: '질문·답변 알림',
    description: '내 질문에 답변이 달리면 알려드려요.',
  },
  {
    category: 'INQUIRY',
    label: '문의 알림',
    description: '문의 처리 상태가 바뀌면 알려드려요.',
  },
];

const visibilityLabel = (
  visibility: FrontendStudentTeachingNoteListItem['visibility']
) =>
  visibility === 'PUBLIC'
    ? '공개'
    : visibility.includes('PARENTS')
      ? '학부모 공개'
      : '수업 공개';

const StudentProfileSummary = () => {
  const basicInfo = useStudentBasicInfo();

  if (basicInfo.isLoading) {
    return <Card className="bg-surface-skeleton-alt min-h-45 animate-pulse" />;
  }

  if (basicInfo.isError || !basicInfo.data) {
    return (
      <Card>
        <EmptyState
          title="내 정보를 불러오지 못했어요"
          description="다른 학습 기록은 그대로예요. 내 정보만 다시 불러올 수 있어요."
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={() => void basicInfo.refetch()}
            >
              내 정보 다시 불러오기
            </Button>
          }
        />
      </Card>
    );
  }

  const profile = basicInfo.data;

  return (
    <Card data-testid="student-profile-summary">
      <Card.Header>
        <div className="gap-content-gap flex min-w-0 items-center">
          <ProfileAvatar
            src={profile.profileImageUrl}
            alt={`${profile.name} 프로필`}
            size={56}
            className="size-14 shrink-0"
          />
          <div className="min-w-0">
            <Card.Title className="font-body1-heading truncate">
              {profile.name}
            </Card.Title>
            <p className="text-gray-9 font-caption-normal truncate">
              {profile.email}
            </p>
          </div>
        </div>
        <StatusBadge
          variant={profile.isProfilePublic ? 'success' : 'default'}
          label={profile.profilePublicKorean}
        />
      </Card.Header>
      <Card.Content className="bg-orange-1 rounded-row p-card-pad">
        <b className="text-orange-10 font-caption-heading block">학습 목표</b>
        <p className="text-gray-11 mt-content-gap text-sm leading-relaxed">
          {profile.learningGoal?.trim() ||
            '아직 학습 목표가 없어요. 한 문장으로 다음 목표를 정해보세요.'}
        </p>
      </Card.Content>
    </Card>
  );
};

const AccountSettingsList = () => {
  const basicInfo = useStudentBasicInfo();
  const updateBasicInfo = useUpdateStudentBasicInfo();
  const notificationSettings = useNotificationSettings();
  const updateNotification = useUpdateNotificationSetting();
  const settingsMap = new Map(
    notificationSettings.data?.map((setting) => [
      setting.category,
      setting.enabled,
    ])
  );
  return (
    <Card data-testid="student-account-settings">
      <Card.Header>
        <div>
          <Card.Title>계정과 설정</Card.Title>
          <Card.Description>내가 직접 관리</Card.Description>
        </div>
      </Card.Header>
      <Card.Content>
        {basicInfo.data && (
          <SettingRow
            label="프로필 공개"
            description="친구가 내 프로필을 볼 수 있어요."
            checked={basicInfo.data.isProfilePublic}
            disabled={basicInfo.isLoading || updateBasicInfo.isPending}
            onCheckedChange={(checked) =>
              updateBasicInfo.mutate({
                name: basicInfo.data.name,
                isProfilePublic: checked,
                learningGoal: basicInfo.data.learningGoal ?? '',
              })
            }
          />
        )}

        {notificationSettings.isError ? (
          <div className="border-system-warning bg-system-warning-alt rounded-row p-card-pad border">
            <p className="text-system-warning-text text-sm font-bold">
              알림 설정을 불러오지 못했어요.
            </p>
            <Button
              variant="outlined"
              size="xsmall"
              className="mt-content-gap"
              onClick={() => void notificationSettings.refetch()}
            >
              알림 설정 다시 불러오기
            </Button>
          </div>
        ) : (
          NOTIFICATION_ROWS.map((row) => {
            const isUpdatingThis =
              updateNotification.isPending &&
              updateNotification.variables?.category === row.category;
            return (
              <SettingRow
                key={row.category}
                label={row.label}
                description={row.description}
                checked={settingsMap.get(row.category) ?? false}
                disabled={notificationSettings.isLoading || isUpdatingThis}
                onCheckedChange={(checked) =>
                  updateNotification.mutate({
                    category: row.category,
                    enabled: checked,
                  })
                }
              />
            );
          })
        )}

        <Link
          href={`${PRIVATE.MYPAGE}?tab=inquiries`}
          className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3"
        >
          <span className="min-w-0 flex-1">
            <b className="text-gray-12 block text-sm">문의 내역</b>
            <small className="text-gray-8 text-ui-choice block">
              접수한 문의와 답변을 확인해요.
            </small>
          </span>
          <StatusBadge
            variant="default"
            label="보기"
          />
        </Link>

        <div className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3">
          <span className="min-w-0 flex-1">
            <b className="text-gray-12 block text-sm">결제·구독</b>
            <small className="text-gray-8 text-ui-choice block">
              현재 연결된 데이터와 이동 경로가 없어요.
            </small>
          </span>
          <Button
            variant="outlined"
            size="xsmall"
            disabled
          >
            연결 전
          </Button>
        </div>
      </Card.Content>
    </Card>
  );
};

const SettingRow = ({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3 first:border-t-0">
    <span className="min-w-0 flex-1">
      <b className="text-gray-12 block text-sm">{label}</b>
      <small className="text-gray-8 text-ui-choice block">{description}</small>
    </span>
    <label className="size-touch-min flex shrink-0 items-center justify-end">
      <span className="sr-only">{label}</span>
      <Toggle
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={`${label} ${checked ? '켜짐' : '꺼짐'}`}
      />
    </label>
  </div>
);

const StudentActivitySummary = () => {
  const report = useStudentReport();

  return (
    <Card data-testid="student-activity-summary">
      <Card.Header>
        <Card.Title>누적 활동</Card.Title>
        <Card.Description>최근 동기화</Card.Description>
      </Card.Header>
      {report.isLoading ? (
        <div className="gap-content-gap tablet:grid-cols-4 grid grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-surface-skeleton-alt rounded-row h-20 animate-pulse"
            />
          ))}
        </div>
      ) : report.isError || !report.data ? (
        <EmptyState
          title="활동 숫자를 불러오지 못했어요"
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={() => void report.refetch()}
            >
              활동 다시 불러오기
            </Button>
          }
        />
      ) : (
        <>
          <div className="gap-content-gap tablet:grid-cols-4 grid grid-cols-2">
            <ActivityStat
              value={report.data.studyRoomCount}
              label="참여 스터디룸"
            />
            <ActivityStat
              value={report.data.questionCount}
              label="질문 수"
            />
            <ActivityStat
              value={`${report.data.submittedHomeworkCount}/${report.data.totalHomeworkCount}`}
              label="과제 제출"
            />
            <ActivityStat
              value={`${report.data.homeworkCompletionRate}%`}
              label="과제 완료율"
            />
          </div>
          <progress
            value={report.data.homeworkCompletionRate}
            max={100}
            aria-label={`과제 완료율 ${report.data.homeworkCompletionRate}%`}
            className="accent-orange-7 bg-gray-3 mt-content-gap rounded-pill h-2 w-full overflow-hidden"
          />
        </>
      )}
    </Card>
  );
};

const ActivityStat = ({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) => (
  <div className="bg-gray-2 rounded-row p-card-pad-mobile">
    <b className="text-gray-12 font-body1-heading block tabular-nums">
      {value}
    </b>
    <span className="text-gray-8 text-ui-compact mt-inline-gap-xs block">
      {label}
    </span>
  </div>
);

const RecentTeachingNotes = () => {
  const notes = useStudentTeachingNotes();
  const items = notes.data?.content.slice(0, 2) ?? [];

  return (
    <Card data-testid="student-recent-teaching-notes">
      <Card.Header>
        <Card.Title>최근 수업노트</Card.Title>
        <Button
          asChild
          variant="ghost"
          size="xsmall"
        >
          <Link href={`${PRIVATE.MYPAGE}?tab=profile`}>전체 보기</Link>
        </Button>
      </Card.Header>
      {notes.isLoading ? (
        <ListSkeleton />
      ) : notes.isError ? (
        <InlineRetry
          message="수업노트를 불러오지 못했어요."
          onRetry={() => void notes.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="받은 수업노트가 없어요"
          description="수업이 끝난 뒤 선생님이 노트를 보내면 여기에 모여요."
          icon={<BookOpenText size={24} />}
          action={
            <Button
              asChild
              variant="outlined"
              size="small"
            >
              <Link href={PRIVATE.DASHBOARD.STUDENT}>내 학습 보기</Link>
            </Button>
          }
        />
      ) : (
        <div>
          {items.map((note) => (
            <TeachingNoteRow
              key={note.id}
              note={note}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const TeachingNoteRow = ({
  note,
}: {
  note: FrontendStudentTeachingNoteListItem;
}) => (
  <Link
    href={PRIVATE.NOTE.DETAIL(note.studyRoomId, note.id)}
    className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3 first:border-t-0"
  >
    <span className="bg-orange-1 text-orange-10 rounded-row text-ui-compact flex size-9 shrink-0 items-center justify-center font-extrabold">
      노트
    </span>
    <span className="min-w-0 flex-1">
      <b className="text-gray-12 block truncate text-sm">{note.title}</b>
      <small className="text-gray-8 text-ui-choice block truncate">
        {note.studyRoomName} · {note.teacherName} ·{' '}
        {formatMMDDWeekday(note.taughtAt)}
      </small>
    </span>
    <StatusBadge
      variant={note.visibility === 'PUBLIC' ? 'success' : 'default'}
      label={visibilityLabel(note.visibility)}
    />
  </Link>
);

const StudentStudyRooms = () => {
  const rooms = useStudentStudyRooms();
  const items = rooms.data?.slice(0, 6) ?? [];

  return (
    <Card data-testid="student-study-rooms">
      <Card.Header>
        <Card.Title>참여 스터디룸</Card.Title>
        <Card.Description>{rooms.data?.length ?? 0}개</Card.Description>
      </Card.Header>
      {rooms.isLoading ? (
        <ListSkeleton />
      ) : rooms.isError ? (
        <InlineRetry
          message="스터디룸을 불러오지 못했어요."
          onRetry={() => void rooms.refetch()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="참여 중인 스터디룸이 없어요"
          description="초대받은 스터디룸에 참여하면 수업노트와 질문을 한곳에서 볼 수 있어요."
          icon={<GraduationCap size={24} />}
          action={
            <Button
              asChild
              size="small"
            >
              <Link href={PRIVATE.DASHBOARD.STUDENT}>내 학습으로 가기</Link>
            </Button>
          }
        />
      ) : (
        <div>
          {items.map((room) => (
            <StudyRoomRow
              key={room.id}
              room={room}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

const StudyRoomRow = ({ room }: { room: FrontendStudentStudyRoomListItem }) => (
  <Link
    href={PRIVATE.ROOM.DETAIL(room.id)}
    className="border-gray-3 min-h-row-min gap-content-gap flex items-center border-t py-3 first:border-t-0"
  >
    <span className="bg-orange-1 text-orange-10 rounded-row flex size-9 shrink-0 items-center justify-center">
      <GraduationCap size={18} />
    </span>
    <span className="min-w-0 flex-1">
      <b className="text-gray-12 block truncate text-sm">{room.name}</b>
      <small className="text-gray-8 text-ui-choice block truncate">
        학생 {room.studentCount}명 · 질문 {room.qnaCount}개 · 수업노트{' '}
        {room.teachingNoteCount}개
      </small>
    </span>
    {room.state === 'APPROVED' && (
      <StatusBadge
        variant="success"
        label="참여 중"
      />
    )}
  </Link>
);

const InlineRetry = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="border-system-warning bg-system-warning-alt rounded-row p-card-pad border text-center">
    <p className="text-system-warning-text text-sm font-bold">{message}</p>
    <Button
      variant="outlined"
      size="xsmall"
      className="mt-content-gap"
      onClick={onRetry}
    >
      다시 시도
    </Button>
  </div>
);

const ListSkeleton = () => (
  <div className="gap-content-gap flex flex-col">
    {Array.from({ length: 2 }).map((_, index) => (
      <div
        key={index}
        className="bg-surface-skeleton-alt h-row-min rounded-row animate-pulse"
      />
    ))}
  </div>
);

export const StudentMyPage = () => (
  <div className="bg-system-background min-h-screen w-full">
    <PageLayout
      width="content"
      className="gap-section-gap flex flex-col"
      data-testid="student-my-page"
    >
      <PageLayout.Header className="items-end justify-between">
        <div>
          <h2 className="text-gray-12 font-headline1-heading">마이페이지</h2>
          <p className="text-gray-9 font-caption-normal mt-inline-gap-xs">
            내 정보와 학습 활동을 한곳에서 확인해요.
          </p>
        </div>
        <Button
          asChild
          variant="outlined"
          size="small"
        >
          <Link href={`${PRIVATE.MYPAGE}?tab=profile`}>프로필 수정</Link>
        </Button>
      </PageLayout.Header>

      <div className="desktop:grid-split-profile gap-section-gap desktop:grid-cols-2 grid grid-cols-1 items-start">
        <div className="gap-block-gap grid min-w-0">
          <StudentProfileSummary />
          <AccountSettingsList />
        </div>
        <div className="gap-block-gap grid min-w-0">
          <StudentActivitySummary />
          <RecentTeachingNotes />
          <StudentStudyRooms />
        </div>
      </div>
    </PageLayout>
  </div>
);
