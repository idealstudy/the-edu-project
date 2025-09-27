'use client';

import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TextEditor } from '@/features/editor/components/text-editor';
import { useTextEditor } from '@/features/editor/hooks/use-editor';

export default function StepOne() {
  const textEditor = useTextEditor();

  return (
    <>
      <Image
        alt="select-area"
        loading="lazy"
        height="200"
        decoding="async"
        data-nimg="1"
        className="bg-orange-scale-orange-1 rounded-[12px] p-[14px]"
        src="/studyroom/study-room-hero.svg"
      />
      <Form.Item>
        <Form.Label>스터디룸 이름을 지어주세요</Form.Label>
        <Input />
      </Form.Item>
      <Form.Item>
        <Form.Label>스터디룸 설명을 지어주세요</Form.Label>
        <div className="w-full">
          <TextEditor
            value={textEditor.value}
            onChange={() => {}}
            placeholder="수업 내용을 작성해보세요."
          />
        </div>
      </Form.Item>
      <Form.Item>
        <Form.Label>스터디룸의 공개 범위</Form.Label>
        <Select defaultValue="1">
          <Select.Trigger className="w-[240px]" />
          <Select.Content>
            <Select.Option value="1">항목 1</Select.Option>
            <Select.Option value="2">항목 2</Select.Option>
            <Select.Option value="3">항목 3</Select.Option>
          </Select.Content>
        </Select>
      </Form.Item>
      <div>
        <p>스터디룸 공개 범위 설정</p>
        <p>
          스터디룸은 모든 사용자에게 공개하거나 비공개로 설정할 수 있습니다.
          비공개로 설정하면 스터디룸에 초대된 사용자만 조회할 수 있습니다.
        </p>
      </div>
      <Button onClick={() => {}}>다음</Button>
    </>
  );
}
