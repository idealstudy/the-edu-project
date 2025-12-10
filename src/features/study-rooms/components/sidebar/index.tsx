'use client';

import { useReducer, useState } from 'react';

import { ConfirmDialog } from '@/features/study-rooms/components/common/dialog/confirm-dialog';
import { InputDialog } from '@/features/study-rooms/components/common/dialog/input-dialog';
import { StudyroomGroups } from '@/features/study-rooms/components/sidebar/groups';
import { InvitationDialog } from '@/features/study-rooms/components/student-invitation/InvitationDialog';
import StudentInvitation from '@/features/study-rooms/components/student-invitation/StudentInvitation';
//import { useSearchParams, useRouter } from 'next/navigation';

import { useTeacherStudyRoomDetailQuery } from '@/features/study-rooms/hooks';
import { ColumnLayout } from '@/layout/column-layout';
import {
  dialogReducer,
  initialDialogState,
} from '@/shared/components/dialog/model/dialog-reducer';
import { useRole } from '@/shared/hooks/use-role';

import { StudyRoomDetail } from '../../model';
import { StudyroomSidebarHeader } from './header';
import { useDeleteStudyRoom, useUpdateStudyRoom } from './services/query';
import { StudyStats } from './status';

/*const parseGroupIdParam = (value: string | null): number | 'all' => {
  if (!value) return 'all';
  if (value === 'all') return 'all';
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 'all' : parsed;
};*/

export const StudyroomSidebar = ({
  studyRoomId,
  segment,
}: {
  studyRoomId: number;
  segment: string | undefined;
}) => {
  // const router = useRouter();
  // const searchParams = useSearchParams();

  const [dialog, dispatch] = useReducer(dialogReducer, initialDialogState);
  const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
  const [deleteNoticeMsg, setDeleteNoticeMsg] =
    useState('수업노트 그룹이 삭제되었습니다.');
  const { role } = useRole();
  const { mutate: deleteStudyRoom } = useDeleteStudyRoom();
  const { mutate: updateRoomName } = useUpdateStudyRoom();
  // 스터디룸 상세 정보 조회 (선생님만)
  const { data: studyRoomDetail } = useTeacherStudyRoomDetailQuery(
    studyRoomId,
    {
      enabled: role === 'ROLE_TEACHER',
    }
  );

  const handleSelectGroupId = (id: number | 'all') => {
    setSelectedGroupId(id);
  };

  // TODO: 스터디룸 이름 변경 API 연결
  const handleSubmitRoomRename = (name: string, others: StudyRoomDetail) => {
    updateRoomName(
      { studyRoomId, name, others },
      {
        onSuccess: () => {
          dispatch({ type: 'CLOSE' });
        },
      }
    );
  };

  // TODO: 스터디룸 삭제 API 연결
  const handleDeleteGroup = () => {
    deleteStudyRoom({ studyRoomId });
    setDeleteNoticeMsg('스터디룸이 삭제되었습니다.');
    dispatch({ type: 'GO_TO_CONFIRM' });
  };
  if (!segment) return null;
  return (
    <>
      {dialog.status === 'open' && dialog.kind === 'onConfirm' && (
        <ConfirmDialog
          type="confirm"
          open={true}
          dispatch={dispatch}
          description={deleteNoticeMsg}
        />
      )}

      {dialog.status === 'open' &&
        dialog.kind === 'delete' &&
        dialog.scope === 'studyroom' && (
          <ConfirmDialog
            type="delete"
            open={true}
            dispatch={dispatch}
            onDelete={() => handleDeleteGroup()}
            title="스터디룸을 삭제하시겠습니까?"
            description="삭제된 스터디룸은 복구할 수 없습니다."
          />
        )}
      {dialog.status === 'open' &&
        dialog.kind === 'rename' &&
        dialog.scope === 'studyroom' &&
        studyRoomDetail && (
          <InputDialog
            isOpen={true}
            placeholder={studyRoomDetail?.name || ''}
            onOpenChange={() => dispatch({ type: 'CLOSE' })}
            title="스터디룸 이름 변경"
            onSubmit={(newName) =>
              handleSubmitRoomRename(newName, studyRoomDetail)
            }
          />
        )}

      {dialog.status === 'open' &&
        dialog.kind === 'invite' &&
        dialog.scope === 'studyroom' && (
          <InvitationDialog
            isOpen={true}
            title="스터디룸에 학생 초대"
            placeholder="초대할 학생을 검색후 선택해 주세요."
            studyRoomId={studyRoomId}
            onOpenChange={() => dispatch({ type: 'CLOSE' })}
          />
        )}

      <ColumnLayout.Left className="border-line-line1 flex h-fit flex-col gap-5 rounded-xl border bg-white px-8 py-8">
        <StudyroomSidebarHeader
          dispatch={dispatch}
          studyRoomName={studyRoomDetail?.name}
        />
        <StudyStats
          numberOfTeachingNote={studyRoomDetail?.numberOfTeachingNote}
          numberOfStudents={studyRoomDetail?.studentNames?.length}
          numberOfQuestion={studyRoomDetail?.numberOfQuestion}
        />
        <StudentInvitation dispatch={dispatch} />
        {/* 수업노트 탭에서만 보이는 컴포넌트 */}
        {segment === 'note' && (
          <StudyroomGroups
            role={role}
            studyRoomId={studyRoomId}
            selectedGroupId={selectedGroupId}
            handleSelectGroupId={handleSelectGroupId}
          />
        )}
        {/* TODO: 마지막 활동 시간 추가 */}
        <div className="font-body2-normal text-gray-scale-gray-60 flex items-end justify-end">
          <p className="text-right">마지막 활동 3일전</p>
        </div>
      </ColumnLayout.Left>
    </>
  );
};
