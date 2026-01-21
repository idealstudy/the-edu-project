'use client';

import * as React from 'react';

import Image from 'next/image';

import { StudyNote } from '@/features/study-notes/model';
import { cn } from '@/shared/lib/utils';
import * as Popover from '@radix-ui/react-popover';

type TagInputNoteProps = {
  studyNotes: StudyNote[];
  selectedId: number | null;
  onChange: (ids: number | null) => void;
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
};

export const TagInputQna = ({
  studyNotes,
  selectedId,
  onChange,
  error,
  placeholder,
  disabled,
}: TagInputNoteProps) => {
  const [input, setInput] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = studyNotes.filter((note) =>
    note.title.toLowerCase().includes(input.toLowerCase())
  );

  const toggleSelect = (note: StudyNote) => {
    onChange(selectedId === note.id ? null : note.id);
  };

  return (
    <div className="w-full">
      <Popover.Root
        open={open}
        onOpenChange={setOpen}
      >
        <Popover.PopoverTrigger asChild>
          <div
            className={cn(
              'flex min-h-[56px] cursor-text flex-wrap items-center gap-2 rounded-[4px] border px-6 py-[15px] text-sm',
              'border-gray-scale-gray-50',
              open && 'border-line-line3',
              error && 'border-system-warning',
              disabled &&
                'bg-gray-scale-gray-5 text-gray-scale-gray-50 cursor-not-allowed'
            )}
            onClick={() => {
              if (disabled) return;
              setOpen(true);
              inputRef.current?.focus();
            }}
          >
            {selectedId === null ? (
              <span className="text-gray-scale-gray-40">{placeholder}</span>
            ) : (
              (() => {
                const note = studyNotes.find((n) => n.id === selectedId);
                if (!note) return null;

                return (
                  <div
                    key={note.id}
                    className="border-line-line1 bg-background-gray flex items-center gap-1 rounded-sm border px-3 py-2"
                  >
                    <span className="text-black">{note.title}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(note);
                      }}
                      className="ml-1 h-6 w-6"
                    >
                      <Image
                        src="/common/close.svg"
                        width={16}
                        height={16}
                        alt="close"
                      />
                    </button>
                  </div>
                );
              })()
            )}
          </div>
        </Popover.PopoverTrigger>

        <Popover.PopoverContent
          align="start"
          sideOffset={4}
          className="z-50 w-[var(--radix-popover-trigger-width)] rounded-lg border bg-white px-5 py-4 shadow-md"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="수업노트를 검색하세요"
            className="bg-background-gray w-full rounded-sm px-5 py-4 text-sm focus:outline-none"
          />

          <div className="mt-4 flex max-h-[160px] flex-wrap gap-2 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-gray-scale-gray-40 text-sm">
                검색 결과가 없습니다.
              </div>
            ) : (
              filtered.map((note) => {
                const isSelected = selectedId === note.id;

                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => {
                      toggleSelect(note);
                      setInput('');
                    }}
                    className={cn(
                      'rounded-sm border px-3 py-2 text-sm',
                      isSelected
                        ? 'border-orange-scale-orange-50 bg-background-orange text-orange-500'
                        : 'border-line-line1 text-text-sub1'
                    )}
                  >
                    {note.title}
                    {isSelected && (
                      <span className="ml-1 text-orange-500">✓</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </Popover.PopoverContent>
      </Popover.Root>
    </div>
  );
};
