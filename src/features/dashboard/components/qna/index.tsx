import { QnAHeader } from './qna-header';
import { QnAList } from './qna-list';

export const QnA = () => {
  return (
    <div className="flex min-h-[calc(100vh-76px)] w-full flex-col">
      <QnAHeader isTeacher={true} />
      <QnAList isTeacher={true} />
    </div>
  );
};
