import Image from 'next/image';

export default function TeacherProfileExtra() {
  return (
    <>
      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <Image
            src="/studyroom/notebook.svg"
            width={24}
            height={24}
            alt="누적 수업노트"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 수업노트
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            999개
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/studyroom/notebook.svg"
            width={24}
            height={24}
            alt="누적 수업노트"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 학생
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            34,900명
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Image
            src="/studyroom/notebook.svg"
            width={24}
            height={24}
            alt="누적 수업노트"
          />
          <span className="text-text-sub2 font-label-normal mt-1">
            누적 후기
          </span>
          <span className="font-headline2-heading text-key-color-primary">
            2,231개
          </span>
        </div>
      </div>

      <div>
        <h4 className="font-body1-heading mb-2">간단 소개</h4>
        <p>단순한 과외 선생님이 아니라 학생의 멘토가 되어드리겠습니다.</p>
      </div>
    </>
  );
}
