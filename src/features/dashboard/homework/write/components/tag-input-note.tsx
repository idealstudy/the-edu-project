'use client';

import * as React from 'react';

import Image from 'next/image';

import { StudyNote } from '@/features/study-notes/model';
import { cn } from '@/shared/lib/utils';
import * as Popover from '@radix-ui/react-popover';

type TagInputNoteProps = {
  studyNotes: StudyNote[];
  error?: boolean;
  placeholder: string;
  disabled?: boolean;
};

export default function TagInputNote({
  studyNotes,
  error,
  placeholder,
  disabled,
}: TagInputNoteProps) {
  const [input, setInput] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [selectedNotes, setSelectedNotes] = React.useState<StudyNote[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = studyNotes.filter((note) =>
    note.title.toLowerCase().includes(input.toLowerCase())
  );

  const toggleSelect = (note: StudyNote) => {
    setSelectedNotes((prev) => {
      const exists = prev.some((s) => s.title === note.title);
      return exists
        ? prev.filter((s) => s.title !== note.title)
        : [...prev, note];
    });
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
            {selectedNotes.length === 0 ? (
              <span className="text-gray-scale-gray-40">{placeholder}</span>
            ) : (
              selectedNotes.map((note) => (
                <div
                  key={note.title}
                  className="border-line-line1 bg-background-gray flex items-center gap-1 rounded-sm border px-3 py-2"
                >
                  <span className="text-black">{note.title}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(note);
                    }}
                    className="ml-1 h-6 w-6 cursor-pointer text-sm leading-none text-gray-400 hover:text-gray-600"
                  >
                    <Image
                      src="/common/close.svg"
                      width={16}
                      height={16}
                      alt="close"
                    />
                  </button>
                </div>
              ))
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

          {filtered.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="mt-4 flex max-h-[160px] flex-wrap gap-2 overflow-y-auto">
              {filtered.map((note) => {
                const isSelected = selectedNotes.some(
                  (s) => s.title === note.title
                );

                return (
                  <button
                    key={note.title}
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
                    {isSelected ? (
                      <span className="ml-1 text-orange-500">✓</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </Popover.PopoverContent>
      </Popover.Root>
    </div>
  );
}
