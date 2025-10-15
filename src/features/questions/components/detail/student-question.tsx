'use client';

import QuestionList from './question-list';

export default function StudentQuestionSession() {
  return (
    <div className="">
      <p className="font-headline1-heading whitespace-pre-wrap">
        {'궁금한 점이 생겼나요? 언제든 질문해보세요!'}
      </p>
      {/* TODO: 질문 목록 */}
      {/* <StudyRoomDetailLayout> */}
      <QuestionList />
      {/* </StudyRoomDetailLayout> */}
    </div>
  );
}
