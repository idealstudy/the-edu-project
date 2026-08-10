'use client';

import { useState } from 'react';

import Image from 'next/image';

import { HomeworkLimit, HomeworkSortKey } from '@/entities/homework/types';
import { Select } from '@/features/study-rooms/components/common/select';
import { Input } from '@/shared/components/ui/input';

type Props = {
  search: string;
  sort: HomeworkSortKey;
  limit: HomeworkLimit;
  onSearch: (value: string) => void;
  onSortChange: (value: HomeworkSortKey) => void;
  onLimitChange: (value: HomeworkLimit) => void;
};

const HOMEWORK_SORT_OPTIONS: Array<{ value: HomeworkSortKey; label: string }> =
  [
    { value: 'DEADLINE_IMMINENT', label: '마감 임박순' },
    { value: 'DEADLINE_RECENT', label: '최근 마감순' },
    { value: 'LATEST_EDITED', label: '최근 편집순' },
    { value: 'OLDEST_EDITED', label: '오래된순' },
  ];

const LIMIT_OPTIONS: Array<{ value: HomeworkLimit; label: string }> = [
  { value: 20, label: '20개씩' },
  { value: 30, label: '30개씩' },
];

const SELECT_STYLES = {
  trigger:
    'border-line-line2 h-9 rounded-button pr-8 pl-2 text-sm min-w-27.5 text-[var(--color-text-sub2)] whitespace-nowrap mock-[state=open]:border-line-line3 focus:ring-0 focus:outline-none px-3 font-label-normal',
  option:
    'flex h-8 border-b-0 text-center w-full font-body2-normal justify-center items-center',
};

export const HomeworkSearchFilterBar = ({
  search,
  sort,
  limit,
  onSearch,
  onSortChange,
  onLimitChange,
}: Props) => {
  const [localSearch, setLocalSearch] = useState(search);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-2.5">
        <Select
          value={sort}
          onValueChange={onSortChange}
        >
          <Select.Trigger
            className={SELECT_STYLES.trigger}
            placeholder="마감 임박순"
            data-position="right-2"
          />
          <Select.Content>
            {HOMEWORK_SORT_OPTIONS.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value}
                className={SELECT_STYLES.option}
              >
                {option.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select>
        <Select
          value={limit.toString()}
          onValueChange={(value) =>
            onLimitChange(Number(value) as HomeworkLimit)
          }
        >
          <Select.Trigger
            className={SELECT_STYLES.trigger}
            placeholder="20개씩"
            data-position="right-2"
          />
          <Select.Content>
            {LIMIT_OPTIONS.map((option) => (
              <Select.Option
                key={option.value}
                value={option.value.toString()}
                className={SELECT_STYLES.option}
              >
                {option.label}
              </Select.Option>
            ))}
          </Select.Content>
        </Select>
      </div>
      <div className="relative w-58.5">
        <Input
          className="border-line-line1 font-body2-normal rounded-button h-12 w-full pr-10.5 pl-4"
          placeholder="검색어를 입력하세요"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSearch(e.currentTarget.value);
            }
          }}
        />
        <Image
          src="/studynotes/search.png"
          alt="search"
          width={18}
          height={20}
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
        />
      </div>
    </div>
  );
};
