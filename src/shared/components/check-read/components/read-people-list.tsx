'use client';

import { getRelativeTimeString } from '@/shared/lib';

export interface ReadPersonItem {
  id: number;
  name: string;
  readAt: string;
}

interface ReadPeopleListProps {
  data?: ReadPersonItem[];
}

// 읽은 사람들 이름 리스트
export const ReadPeopleList = ({ data = [] }: ReadPeopleListProps) => {
  return (
    <div className="max-h-[110px] min-h-[100px] max-w-[180px] min-w-[170px] overflow-auto rounded-sm bg-white p-3 shadow-[15px_25px_65px_0_rgba(0,0,0,0.1),382px_635px_207px_0_rgba(0,0,0,0)]">
      <div className="mb-1 text-left">
        <p className="font-body2-heading text-gray-12">
          읽음 <span className="text-orange-7">{data.length}</span>
        </p>
      </div>

      {data.map((d) => (
        <div
          key={d.id}
          className="flex justify-between"
        >
          <p className="text-gray-12 font-label-normal">{d.name}</p>
          <p className="font-caption-normal text-gray-5">
            {getRelativeTimeString(d.readAt)}
          </p>
        </div>
      ))}
    </div>
  );
};
