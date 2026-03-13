// 읽음 여부 확인
export const CommantReadPeoplle = () => {
  return (
    <div className="max-h-[110px] min-h-[100px] max-w-[180px] min-w-[170px] overflow-auto rounded-sm bg-white p-3 shadow-[15px_25px_65px_0_rgba(0,0,0,0.1),382px_635px_207px_0_rgba(0,0,0,0)]">
      <div className="mb-1">
        <p className="font-body2-heading text-gray-12">
          읽음 <span className="text-orange-7">2</span>
        </p>
      </div>
      <div className="flex justify-between">
        <p className="text-gray-12 font-label-normal">학생 이름</p>
        <p className="font-caption-normal text-gray-5">2분 전</p>
      </div>
    </div>
  );
};
