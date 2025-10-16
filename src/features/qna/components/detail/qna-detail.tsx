'use client';

import { ColumnLayout } from '@/components/layout/column-layout';

import { QuestionDetailResponse } from '../../type';
import { QuestionLeftSidebar } from '../sidebar/left-side-bar';
import QuestionAnswer from '../sidebar/question-answer';
import QuestionContent from '../sidebar/question-content';
import QuestionEditor from '../sidebar/question-editor';

type Props = {
  studyRoomId: number;
  contextId: number;
};

const tempQuestionDetail: QuestionDetailResponse = {
  id: 90,
  title: '(예시) 기후변화가 생태계에 미치는 영향은 어떤 방식으로 나타날까요?',
  status: 'PENDING',
  authorName: '김지수',
  content:
    '선생님, 저는 아직 기획이 뭔지 완전히 모르겠어요. 자꾸만 기능 정리하다가 길을 잃고, 와이어프레임 만들다 보면 그냥 화면 꾸미기 같기도 하고요. 그래서 궁금해졌어요. “좋은 기획자”는 도대체 어떤 사람일까요? 단순히 아이디어를 많이 내는 사람이 좋은 기획자인 건지, 아니면 문서 정리를 잘하는 사람이 그런 건지 잘 모르겠어요. 선생님이 생각하는 좋은 기획자의 기준을 듣고 싶습니다.',
  regDate: '2025-10-11T16:18:42.777Z',
  messages: ['답변 1', '답변 2'],
};

export function QuestionDetail({}: Props) {
  // TODO: API로 질문 가져오기
  // 받아온 데이터만 하위 컴포넌트로 전달

  return (
    <>
      <ColumnLayout.Left className="rounded-[12px] bg-white">
        <QuestionLeftSidebar
          status={tempQuestionDetail.status}
          title={tempQuestionDetail.title}
        />
      </ColumnLayout.Left>
      <ColumnLayout.Right className="desktop:min-w-[740px] flex h-[400px] w-full flex-col gap-3 rounded-[12px]">
        <QuestionContent
          content={tempQuestionDetail.content}
          authorName={tempQuestionDetail.authorName}
          regDate={tempQuestionDetail.regDate}
        />
        <QuestionAnswer />
        <QuestionEditor />
      </ColumnLayout.Right>
    </>
  );
}
