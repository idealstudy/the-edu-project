'use client';

import { useStudentHomeworkDetail } from '@/features/homework/hooks/student/useStudentHomeworkQuries';
import { ColumnLayout } from '@/layout/column-layout';
import { MiniSpinner } from '@/shared/components/loading';

import { FeedbackAnswer } from '../write/components/homework-feedback-answer';
import { WriteFormArea } from '../write/components/homework-write-form-area';
import { StudentHomeworkFormProvider } from '../write/components/student-form-provider';
import { HomeworkDetailLeft } from './homework-detail-left';
import { StudentFeedbackBlock } from './student-feedback-block';
import { StudentHomeworkContent } from './student-homework-content';
import { StudentSubmissionContent } from './student-submission-content';

type Props = {
  studyRoomId: number;
  homeworkId: number;
};

// 학생 과제 디테일 화면
export const StudentHomeworkDetail = ({ studyRoomId, homeworkId }: Props) => {
  const { data, isPending } = useStudentHomeworkDetail(studyRoomId, homeworkId);

  if (isPending) return <MiniSpinner />;
  if (!data) return <div>데이터가 없습니다.</div>;

  return (
    <>
      <HomeworkDetailLeft
        studyRoomId={studyRoomId}
        homeworkId={homeworkId}
      />

      <ColumnLayout.Right className="desktop:min-w-[740px] flex w-full flex-col gap-3 rounded-[12px]">
        {/* 1. 선생님이 낸 과제 */}
        {data.homework && (
          <StudentHomeworkContent
            content={data.homework.content ?? '-'}
            authorName={data.homework.teacherName ?? '-'}
            regDate={data.homework.modifiedAt ?? '-'}
          />
        )}

        {/* 2. 내 제출 */}
        {data.myHomeworkStudent.submission ? (
          <StudentSubmissionContent
            homeworkStudentId={data.myHomeworkStudent.id}
            content={data.myHomeworkStudent.submission?.content ?? '-'}
            authorName={data.myHomeworkStudent.studentName}
            regDate={
              data.myHomeworkStudent.submission?.modifiedSubmissionAt ?? '-'
            }
            submitStatus={data.myHomeworkStudent.status}
            studyRoomId={studyRoomId}
            homeworkId={homeworkId}
          />
        ) : null}

        {/* 선생님이 남긴 피드백 */}
        {data.myHomeworkStudent.feedback ? (
          <FeedbackAnswer
            key={`feedback-${data.myHomeworkStudent.id}`}
            content={data.myHomeworkStudent.feedback.content ?? ''}
            regDate={data.myHomeworkStudent.feedback.modifiedFeedbackAt ?? ''}
            studyRoomId={studyRoomId}
            homeworkId={homeworkId}
            homeworkStudentId={data.myHomeworkStudent.id}
          />
        ) : null}

        {/* 3. 다른 학생 제출 (보기 전용) */}
        {data.otherHomeworkStudents?.map((student) => (
          <div
            key={`otherStudent-${data.myHomeworkStudent.id}`}
            className="space-y-3"
          >
            <StudentHomeworkContent
              content="다른 학생이 제출한 과제는 확인할 수 없습니다."
              authorName={student.studentName}
              regDate={student.modifiedSubmissionAt ?? '-'}
            />
            {student.modifiedSubmissionAt && (
              <StudentFeedbackBlock
                content={
                  '다른 학생이 제출한 과제의 피드백은 확인할 수 없습니다.'
                }
                regDate={student.modifiedFeedbackAt ?? '-'}
              />
            )}
          </div>
        ))}

        {/* 4. 과제 제출 폼 */}
        {data.myHomeworkStudent.status === 'NOT_SUBMIT' ? (
          <StudentHomeworkFormProvider
            studyRoomId={studyRoomId}
            homeworkId={homeworkId}
          >
            <WriteFormArea
              studyRoomId={studyRoomId}
              homeworkId={homeworkId}
            />
          </StudentHomeworkFormProvider>
        ) : null}
      </ColumnLayout.Right>
    </>
  );
};
