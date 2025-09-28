'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { RadioCard } from '@/components/ui/radio-card';
import { RadioGroup } from '@/components/ui/radio-group';
import { Select } from '@/components/ui/select';
import step2 from '@/features/studyrooms/components/create/data/step2.json';
import { cn } from '@/lib/utils';

type Base = {
  id: string;
  title: string;
  type: 'radio' | 'select';
};

type Option = {
  value: string;
  label: string;
  subLabel?: string;
};

type RadioQuestion = Base & {
  type: 'radio';
  options: Option[];
};

type SelectQuestion = Base & {
  type: 'select';
  options: {
    school: Option[];
    grade: Option[];
  };
};

type Data = RadioQuestion | SelectQuestion;

type FileSchema = {
  data: Data[];
};

const { data } = step2 as FileSchema;

export default function StepTwo() {
  const [school, setSchool] = React.useState('high');

  return (
    <>
      {data.map((el) => (
        <React.Fragment key={el.id}>
          <div>
            <p>{el.id.toUpperCase()}</p>
            <p>{el.title}</p>
          </div>

          {el.type === 'radio' && (
            <RadioGroup
              defaultValue={el.options[0]?.value}
              className="flex-row"
            >
              {el.options.map((option) => (
                <RadioCard.Item
                  key={option.value}
                  value={option.value}
                >
                  <div className={cn(``)}>
                    <p className="font-medium">{option.label}</p>
                    {option.subLabel && (
                      <p className="text-sm text-gray-500">{option.subLabel}</p>
                    )}
                  </div>
                </RadioCard.Item>
              ))}
            </RadioGroup>
          )}

          {el.type === 'select' && (
            <div className="flex gap-3">
              <Form.Item>
                <Select
                  defaultValue={el.options.school[0]?.value}
                  onValueChange={(value) => setSchool(value)}
                >
                  <Select.Trigger className="w-[240px]" />
                  <Select.Content>
                    {el.options.school.map((option) => (
                      <Select.Option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>

              <Form.Item>
                <Select defaultValue={el.options.grade[0]?.value}>
                  <Select.Trigger className="w-[240px]" />
                  <Select.Content>
                    {el.options.grade
                      .filter((option) => {
                        if (school === 'elementary') return true;
                        return Number(option.value) <= 3;
                      })
                      .map((option) => (
                        <Select.Option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </Select.Option>
                      ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            </div>
          )}
        </React.Fragment>
      ))}

      <div className="flex space-y-4">
        <p className="text-muted-foreground text-sm">
          작성하신 정보는 더 나은 디에듀 서비스를 제공하는데에 활용됩니다.
        </p>
        <Button
          type="submit"
          className="w-full"
        >
          다음
        </Button>
      </div>
    </>
  );
}
