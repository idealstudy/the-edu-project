'use client';

import { cn } from '@/shared/lib';
import { Loader2 } from 'lucide-react';

type ImageUploadOverlayProps = {
  isUploading: boolean;
  darkMode?: boolean;
};

export const ImageUploadOverlay = ({
  isUploading,
  darkMode = false,
}: ImageUploadOverlayProps) => {
  if (!isUploading) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-lg',
        'bg-black/40 backdrop-blur-sm',
        'animate-in fade-in-0'
      )}
    >
      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-lg px-6 py-4',
          darkMode ? 'bg-gray-scale-gray-80' : 'bg-gray-scale-white'
        )}
      >
        <Loader2
          className={cn(
            'h-8 w-8 animate-spin',
            darkMode ? 'text-key-color-primary' : 'text-key-color-primary'
          )}
        />
        <span
          className={cn(
            'text-sm font-medium',
            darkMode ? 'text-gray-scale-white' : 'text-text-main'
          )}
        >
          이미지 업로드 중...
        </span>
      </div>
    </div>
  );
};
