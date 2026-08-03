'use client';

import { useStudentQna } from '@/features/mypage/profile/hooks/student/use-qna';
import { useStudentReport } from '@/features/mypage/profile/hooks/student/use-report';
import { useStudentStudyRooms } from '@/features/mypage/profile/hooks/student/use-study-rooms';
import { useStudentTeachingNotes } from '@/features/mypage/profile/hooks/student/use-teaching-notes';
import SectionContainer from '@/features/profile/components/section-container';
import ActivityReportSection from '@/features/profile/components/student/activity-report-section';
import QnaSection from '@/features/profile/components/student/qna-section';
import StudyroomSection from '@/features/profile/components/student/studyroom-section';
import TeachingNoteSection from '@/features/profile/components/student/teaching-note-section';

export default function StudentSections() {
  // 누적 활동
  const {
    data: report,
    isLoading: isReportLoading,
    isError: isReportError,
    refetch: refetchReport,
  } = useStudentReport();

  // 질문
  const {
    data: qnaData,
    isLoading: isQnaLoading,
    isError: isQnaError,
    refetch: refetchQna,
    page: qnaPage,
    setPage: setQnaPage,
    searchKeyword: qnaSearchKeyword,
    setSearchKeyword: setQnaSearchKeyword,
    sort: qnaSort,
    setSort: setQnaSort,
    status: qnaStatus,
    setStatus: setQnaStatus,
    isExpanded: isQnaExpanded,
    setIsExpanded: setIsQnaExpanded,
  } = useStudentQna();

  // 수업노트
  const {
    data: teachingNoteData,
    isLoading: isTeachingNoteLoading,
    isError: isTeachingNoteError,
    refetch: refetchTeachingNote,
    page: teachingNotePage,
    setPage: setTeachingNotePage,
    keyword: teachingNoteKeyword,
    setKeyword: setTeachingNoteKeyword,
    sortKey: teachingNoteSortKey,
    setSortKey: setTeachingNoteSortKey,
    isExpanded: isTeachingNoteExpanded,
    setIsExpanded: setIsTeachingNoteExpanded,
  } = useStudentTeachingNotes();

  // 스터디룸
  const {
    data: studyRoomData,
    isLoading: isStudyRoomLoading,
    isError: isStudyRoomError,
    refetch: refetchStudyRoom,
  } = useStudentStudyRooms();

  return (
    <>
      <SectionContainer
        title="누적 활동 리포트"
        isLoading={isReportLoading}
        isError={isReportError}
        onRetry={refetchReport}
      >
        {report && <ActivityReportSection report={report} />}
      </SectionContainer>

      <SectionContainer
        title="내 질문"
        isLoading={isQnaLoading}
        isError={isQnaError}
        onRetry={refetchQna}
      >
        <QnaSection
          data={qnaData}
          page={qnaPage}
          setPage={setQnaPage}
          searchKeyword={qnaSearchKeyword}
          setSearchKeyword={setQnaSearchKeyword}
          sort={qnaSort}
          setSort={setQnaSort}
          status={qnaStatus}
          setStatus={setQnaStatus}
          isExpanded={isQnaExpanded}
          setIsExpanded={setIsQnaExpanded}
        />
      </SectionContainer>

      <SectionContainer
        title="최근 등록된 수업노트"
        isLoading={isTeachingNoteLoading}
        isError={isTeachingNoteError}
        onRetry={refetchTeachingNote}
      >
        <TeachingNoteSection
          data={teachingNoteData}
          page={teachingNotePage}
          setPage={setTeachingNotePage}
          keyword={teachingNoteKeyword}
          setKeyword={setTeachingNoteKeyword}
          sortKey={teachingNoteSortKey}
          setSortKey={setTeachingNoteSortKey}
          isExpanded={isTeachingNoteExpanded}
          setIsExpanded={setIsTeachingNoteExpanded}
        />
      </SectionContainer>

      <SectionContainer
        title="참여한 스터디룸"
        isLoading={isStudyRoomLoading}
        isError={isStudyRoomError}
        onRetry={refetchStudyRoom}
      >
        {studyRoomData &&
          (studyRoomData.length > 0 ? (
            <StudyroomSection data={studyRoomData} />
          ) : (
            <p className="text-text-sub2 my-4 text-center">
              참여한 스터디룸이 없습니다.
            </p>
          ))}
      </SectionContainer>
    </>
  );
}
