'use client';

import Image from 'next/image';

import { REACTION_EMOJIS } from './constants/emojis';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  selectedEmoji?: string | null;
}

export const EmojiPicker = ({
  onSelect,
  onClose,
  selectedEmoji,
}: EmojiPickerProps) => {
  return (
    <div className="w-[290px] rounded-[16px] bg-white px-5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-body2-heading text-gray-12">반응 추가하기</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full leading-none text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label="닫기"
        >
          <Image
            src="/common/close.svg"
            alt="닫기"
            width={20}
            height={20}
          />
        </button>
      </div>
      <div className="flex items-center gap-4">
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-[8px] text-[24px] leading-none transition-colors ${
              selectedEmoji === emoji
                ? 'bg-gray-1'
                : 'hover:bg-gray-1 bg-transparent'
            }`}
            aria-label={`${emoji} 반응 추가`}
          >
            <span aria-hidden>{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export { REACTION_EMOJIS };
