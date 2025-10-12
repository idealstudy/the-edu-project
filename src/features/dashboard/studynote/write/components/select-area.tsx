'use client';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Image from 'next/image';

import { ColumnLayout } from '@/components/layout/column-layout';
import { Form } from '@/components/ui/form';
import { ChevronDownIcon, PlusIcon, Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Popover } from 'radix-ui';

import { StudyNoteForm } from '../schemas/note';
import { useStudyNoteGroupsQuery, useStudyRoomsQuery } from '../services/query';

const SelectArea = () => {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<StudyNoteForm>();
  const roomId = watch('studyRoomId');
  const { data: rooms } = useStudyRoomsQuery();
  const { data: studyNoteGroups } = useStudyNoteGroupsQuery(roomId);

  const [open, setOpen] = useState(false);

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
            {/* TODO
                드롭다운으로 컴포넌트 변경 필요
                기존 작업 popover로 제작됨
                디자인 차이로 인한 결과로 추정됨 -> 일반 드롭다운과 디자인이 다름
            */}
            <Controller
              name="studyRoomId"
              control={control}
              render={({ field }) => {
                // TODO: 진입 시점 파악 필요
                // roomId 제공된 경우 vs 아닌 경우로 나누기
                const fieldValue =
                  field.value != null ? String(field.value) : '';
                const selectedRoomName =
                  rooms?.find((r) => String(r.id) === fieldValue)?.name ??
                  '스터디룸을 선택해주세요.';
                return (
                  <Popover.Root
                    open={open}
                    onOpenChange={setOpen}
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
                            open ? 'rotate-180' : ''
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
                                  setOpen(false);
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
            render={({ field }) => {
              const value =
                field.value == null ? undefined : String(field.value);

              // "추가하기" 눌렀을 때 실행할 함수 (필요에 따라 props로 받아도 됨)
              const onAddGroup = () => {
                // 여기에 모달 오픈 로직
                // openCreateGroupModal();
              };

              return (
                <Select
                  defaultValue=""
                  value={value}
                  onValueChange={(v) => {
                    if (v === 'add') {
                      onAddGroup();
                      return;
                    }
                    field.onChange(v); // 저장 타입 문자열
                  }}
                >
                  <Select.Trigger
                    placeholder="없음"
                    className="mt-[9px]"
                  />
                  <Select.Content>
                    {Array.isArray(studyNoteGroups?.content) &&
                      studyNoteGroups.content.length > 0 &&
                      studyNoteGroups.content.map((group) => (
                        <Select.Option
                          key={group.id}
                          value={String(group.id)}
                        >
                          {group.title}
                        </Select.Option>
                      ))}

                    {/* 데이터가 없거나, 항상 맨 아래 “추가하기” 노출 */}
                    <Select.Option value={'add'}>
                      <button className="flex w-full cursor-pointer items-center justify-between gap-1 leading-[140%]">
                        <PlusIcon />
                        <span>추가하기</span>
                      </button>
                    </Select.Option>
                  </Select.Content>
                </Select>
              );
            }}
          />
        </Form.Control>
        {errors.studyNoteGroup && (
          <Form.ErrorMessage className="text-system-warning text-sm">
            {errors.studyNoteGroup.message}
          </Form.ErrorMessage>
        )}
      </Form.Item>
      {/* <Dialog>
        <Dialog.Trigger asChild>
          <Button size="small">열기</Button>
        </Dialog.Trigger>
        <Dialog.Content className="w-[598px]">
          <Dialog.Header>
            <Dialog.Title>수업노트 그룹 추가</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body className="mt-6">
            <TextField description={<TextField.Description>
                  수업노트 그룹으로 여러개의 수업노트를 묶어서 관리할 수
                  있습니다.
                </TextField.Description>}>
              <TextField.Input placeholder="수업노트 그룹 이름을 작성해주세요." />
            </TextField>
          </Dialog.Body>
          <Dialog.Footer className="mt-6 justify-end">
            <Dialog.Close asChild>
              <Button className="w-[120px]" variant="outlined" size="small">
                취소
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button className="w-[120px]" size="small">
                저장
              </Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog> */}
    </ColumnLayout.Left>
  );
};

export default SelectArea;
