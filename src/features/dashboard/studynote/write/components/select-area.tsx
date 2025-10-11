'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Image from 'next/image';

import { ColumnLayout } from '@/components/layout/column-layout';
import { Form } from '@/components/ui/form';
import { ChevronDownIcon, Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Popover } from 'radix-ui';

import { StudyNoteForm } from '../schemas/note';
import { useStudyNoteGroupsQuery, useStudyRoomsQuery } from '../services/query';

const SelectArea = () => {
  const { data: rooms } = useStudyRoomsQuery();
  const { data: studyNoteGroups } = useStudyNoteGroupsQuery();

  const [openStudyRoomOption, setOpenStudyRoomOption] = useState(false);

  const {
    control,
    formState: { errors },
  } = useFormContext<StudyNoteForm>();

  return (
    <ColumnLayout.Left className="border-line-line1 h-fit rounded-xl border bg-white px-8 py-10">
      <Image
        src="/studyroom/study-room-profile.svg"
        alt="select-area"
        width={300}
        height={300}
      />
      <div className="my-10 flex w-full items-center justify-between">
        <Form.Item
          error={!!errors.studyRoomId}
          className="w-full"
        >
          <Form.Control>
            <Controller
              name="studyRoomId"
              control={control}
              // defaultValue={0}
              render={({ field }) => {
                const fieldValue =
                  field.value != null ? String(field.value) : '';
                const selectedRoomName =
                  rooms?.find((r) => String(r.id) === fieldValue)?.name ??
                  '스터디룸을 선택해주세요.';
                return (
                  <Popover.Root
                    open={openStudyRoomOption}
                    onOpenChange={setOpenStudyRoomOption}
                  >
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-between text-start text-2xl leading-[140%] font-bold"
                      >
                        <span>{selectedRoomName}</span>
                        <ChevronDownIcon
                          className={cn(
                            'h-6 w-6 transition-transform duration-200',
                            openStudyRoomOption ? 'rotate-180' : ''
                          )}
                        />
                      </button>
                    </Popover.Trigger>

                    <Popover.Portal>
                      <Popover.Content
                        className="mt-1 rounded-md border border-gray-200 bg-white shadow-sm"
                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                      >
                        {rooms?.map((room) => {
                          const isSelected = fieldValue === String(room.id);

                          return (
                            <Popover.Close
                              key={room.id}
                              asChild
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  field.onChange(room.id);
                                  setOpenStudyRoomOption(false);
                                }}
                                className={cn(
                                  'w-full cursor-pointer px-4 py-2 text-left transition-colors hover:bg-gray-100',
                                  isSelected && 'bg-gray-200 font-semibold'
                                )}
                              >
                                {room.name}
                              </button>
                            </Popover.Close>
                          );
                        })}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                );
              }}
            />
          </Form.Control>
          {errors.studyRoomId && (
            <Form.ErrorMessage className="text-system-warning text-sm">
              {errors.studyRoomId.message}
            </Form.ErrorMessage>
          )}
        </Form.Item>
      </div>

      <Form.Item error={!!errors.title}>
        <Form.Label className="text-text-sub2 text-base font-semibold">
          수업노트 그룹
        </Form.Label>
        <Form.Control>
          <Controller
            name="studyNoteGroup"
            control={control}
            rules={{ required: '공개 범위를 선택해주세요.' }}
            render={({ field }) => (
              <Select
                value={String(field.value) ?? undefined}
                onValueChange={(value) => {
                  // 빈 선택(없음)을 허용한다면 undefined로 저장
                  if (value === '' || value === 'none')
                    return field.onChange(undefined);
                  // 값이 숫자 enum이면 Number(value)로, 문자열이면 그대로
                  field.onChange(value); // or Number(value)
                }}
              >
                <Select.Trigger
                  placeholder="없음asdf"
                  className="mt-[9px]"
                />
                <Select.Content>
                  {!studyNoteGroups?.content ||
                  studyNoteGroups.content.length === 0 ? (
                    <Select.Option value="none">없음</Select.Option>
                  ) : (
                    studyNoteGroups.content.map((group) => (
                      <Select.Option
                        key={group.id}
                        value={String(group.id)}
                      >
                        {group.title}
                      </Select.Option>
                    ))
                  )}
                </Select.Content>
              </Select>
            )}
          />
        </Form.Control>
        {errors.studyRoomId && (
          <Form.ErrorMessage className="text-system-warning text-sm">
            {errors.studyRoomId.message}
          </Form.ErrorMessage>
        )}
      </Form.Item>
    </ColumnLayout.Left>
  );
};

export default SelectArea;
