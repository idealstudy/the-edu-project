'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import { Download, Maximize2, Minimize2, X } from 'lucide-react';

export const ResizableImageNode = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
  selected,
}: NodeViewProps) => {
  const { src, alt, title, width, align } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [initialWidth, setInitialWidth] = useState(0);
  const [initialX, setInitialX] = useState(0);
  const [resizeDirection, setResizeDirection] = useState<'left' | 'right'>(
    'right'
  );
  const [showControls, setShowControls] = useState(false);

  const isEditable = editor.isEditable;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: 'left' | 'right') => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      setInitialX(e.clientX);
      setInitialWidth(containerRef.current?.offsetWidth || width || 300);
      setResizeDirection(direction);
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const delta = e.clientX - initialX;
      // 왼쪽 핸들: 드래그 방향과 반대로 크기 변경
      // 오른쪽 핸들: 드래그 방향대로 크기 변경
      const adjustedDelta = resizeDirection === 'left' ? -delta : delta;
      const newWidth = Math.max(
        100,
        Math.min(800, initialWidth + adjustedDelta)
      );
      updateAttributes({ width: newWidth });
    },
    [isResizing, initialX, initialWidth, resizeDirection, updateAttributes]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleAlignChange = (newAlign: 'left' | 'center' | 'right') => {
    updateAttributes({ align: newAlign });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const justifyClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }[align || 'center'];

  return (
    <NodeViewWrapper
      className={`resizable-image-wrapper my-2 flex ${justifyClass}`}
    >
      <div
        ref={containerRef}
        className="group relative inline-block"
        style={{ width: width ? `${width}px` : 'auto' }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !isResizing && setShowControls(false)}
        contentEditable={false}
      >
        <Image
          src={src}
          alt={alt || ''}
          title={title}
          width={width || 300}
          height={0}
          className={`block h-auto max-w-full ${selected ? 'ring-2 ring-blue-500' : ''}`}
          style={{ width: width ? `${width}px` : 'auto' }}
          draggable={false}
          unoptimized
        />

        {/* 컨트롤 오버레이 */}
        {isEditable && (showControls || selected) && (
          <>
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => deleteNode()}
              className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/60 text-white transition-opacity hover:bg-gray-900/80"
              title="삭제"
            >
              <X className="h-3 w-3" />
            </button>

            {/* 다운로드 버튼 */}
            <button
              type="button"
              onClick={handleDownload}
              className="absolute top-2 right-10 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-900/60 text-white transition-opacity hover:bg-gray-900/80"
              title="다운로드"
            >
              <Download className="h-3 w-3" />
            </button>

            {/* 정렬 컨트롤 */}
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-md bg-gray-900/60 p-1">
              <button
                type="button"
                onClick={() => handleAlignChange('left')}
                className={`flex h-6 w-6 items-center justify-center rounded text-white transition-colors ${
                  align === 'left' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                title="왼쪽 정렬"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <rect
                    x="1"
                    y="3"
                    width="10"
                    height="2"
                  />
                  <rect
                    x="1"
                    y="7"
                    width="14"
                    height="2"
                  />
                  <rect
                    x="1"
                    y="11"
                    width="8"
                    height="2"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange('center')}
                className={`flex h-6 w-6 items-center justify-center rounded text-white transition-colors ${
                  align === 'center' || !align
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
                title="가운데 정렬"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <rect
                    x="3"
                    y="3"
                    width="10"
                    height="2"
                  />
                  <rect
                    x="1"
                    y="7"
                    width="14"
                    height="2"
                  />
                  <rect
                    x="4"
                    y="11"
                    width="8"
                    height="2"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => handleAlignChange('right')}
                className={`flex h-6 w-6 items-center justify-center rounded text-white transition-colors ${
                  align === 'right' ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                title="오른쪽 정렬"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <rect
                    x="5"
                    y="3"
                    width="10"
                    height="2"
                  />
                  <rect
                    x="1"
                    y="7"
                    width="14"
                    height="2"
                  />
                  <rect
                    x="7"
                    y="11"
                    width="8"
                    height="2"
                  />
                </svg>
              </button>
            </div>

            {/* 크기 조절 핸들 - 왼쪽 */}
            <div
              className="absolute top-1/2 left-0 z-10 flex h-12 w-3 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
              onMouseDown={(e) => handleMouseDown(e, 'left')}
            >
              <Minimize2 className="h-3 w-3 rotate-45 text-white" />
            </div>

            {/* 크기 조절 핸들 - 오른쪽 */}
            <div
              className="absolute top-1/2 right-0 z-10 flex h-12 w-3 translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
              onMouseDown={(e) => handleMouseDown(e, 'right')}
            >
              <Maximize2 className="h-3 w-3 rotate-45 text-white" />
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};
