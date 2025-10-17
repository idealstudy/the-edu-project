'use client';

import QuestionListWrapper from './qna-list-wrapper';

type Props = {
  studyRoomId: number;
};

export default function TeacherQuestionSession({ studyRoomId }: Props) {
  return (
    <div className="">
      <p className="font-headline1-heading mb-9 whitespace-pre-wrap">
        {'학생들이 피드백을 기다리고 있어요.\n답변을 남겨주세요!'}
      </p>
      {/* TODO: 질문 목록 API 연동*/}
      <QuestionListWrapper studyRoomId={studyRoomId} />
    </div>
  );
}
