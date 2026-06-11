'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib';
import { Eraser, Pencil, Redo2, Trash2, Undo2 } from 'lucide-react';

import { useStrokes } from '../model/use-strokes';
import type { DrawingTool, Stroke } from '../types';
import { DrawingCanvas } from './drawing-canvas';

/* ─────────────────────────────────────────────────────
 * SolutionDrawingPad — 풀이공유용 손글씨 입력 패드
 *  - 펜/지우개/색/굵기/실행취소/다시실행/전체지우기 (단일 캔버스)
 *  - 획(Stroke[])을 onStrokesChange로 부모에 노출 → 제출 시 PNG 스냅샷 업로드.
 *  - DrawingPanel(IndexedDB 자동저장·확장)과 달리 상태를 부모가 소유하는 단순본.
 *  - 태블릿 퍼스트: 큰 캔버스, 펜슬 1순위, 터치 타깃 ≥44px.
 * ────────────────────────────────────────────────────*/

const PAD_COLORS = [
  '#1a1a1a',
  '#ff4805',
  '#2563eb',
  '#16a34a',
  '#6b7280',
] as const;

const PEN_SIZES = [3, 5, 8] as const;
const DEFAULT_HEIGHT = 440;

type SolutionDrawingPadProps = {
  /** 획이 바뀔 때마다 호출 — 부모가 스냅샷·빈 여부 판단에 사용 */
  onStrokesChange?: (strokes: Stroke[]) => void;
  /** 캔버스 가시 높이(px). 기본 440 (태블릿 기준) */
  height?: number;
  className?: string;
};

export function SolutionDrawingPad({
  onStrokesChange,
  height = DEFAULT_HEIGHT,
  className,
}: SolutionDrawingPadProps) {
  const [tool, setTool] = useState<DrawingTool>('pen');
  const [color, setColor] = useState<string>(PAD_COLORS[0]);
  const [size, setSize] = useState<number>(PEN_SIZES[1]);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const surfaceRef = useRef<HTMLDivElement>(null);

  const {
    strokes,
    addStroke,
    eraseStrokes,
    clearStrokes,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useStrokes();

  const onStrokesChangeRef = useRef(onStrokesChange);
  onStrokesChangeRef.current = onStrokesChange;

  useEffect(() => {
    onStrokesChangeRef.current?.(strokes);
  }, [strokes]);

  // 캔버스 너비 측정 (좌표 정규화 기준)
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setCanvasWidth(w);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleToolChange = useCallback((next: DrawingTool) => {
    setTool(next);
  }, []);

  const pageSize = { width: canvasWidth, height };

  return (
    <div className={cn('flex flex-col gap-3 select-none', className)}>
      {/* ── 캔버스 ── */}
      <div
        ref={surfaceRef}
        data-drawing-surface
        className="border-line-line1 relative overflow-hidden rounded-xl border-2 border-dashed bg-white"
        style={{ height }}
      >
        {strokes.length === 0 && (
          <div
            className="text-gray-6 pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2"
            aria-hidden
          >
            <Pencil
              size={28}
              className="text-gray-5"
            />
            <p className="font-caption-normal">펜슬로 풀이를 적어보세요</p>
          </div>
        )}

        {canvasWidth > 0 && (
          <DrawingCanvas
            strokes={strokes}
            tool={tool}
            color={color}
            size={size}
            pageSize={pageSize}
            onStrokeAdd={addStroke}
            onStrokeErase={eraseStrokes}
          />
        )}
      </div>

      {/* ── 툴바 (터치 타깃 ≥44px) ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <PadToolButton
            active={tool === 'pen'}
            onClick={() => handleToolChange('pen')}
            label="펜"
          >
            <Pencil size={20} />
          </PadToolButton>
          <PadToolButton
            active={tool === 'eraser'}
            onClick={() => handleToolChange('eraser')}
            label="지우개"
          >
            <Eraser size={20} />
          </PadToolButton>
        </div>

        {tool !== 'eraser' && (
          <>
            <div className="bg-line-line1 h-6 w-px shrink-0" />
            <div className="flex items-center gap-1.5">
              {PAD_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`색상 ${c}`}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-full',
                    'transition-transform hover:scale-105'
                  )}
                >
                  <span
                    className={cn(
                      'block size-6 rounded-full',
                      color === c &&
                        'ring-2 ring-white ring-offset-2 ring-offset-white outline-2 outline-current'
                    )}
                    style={{ backgroundColor: c, color: c }}
                  />
                </button>
              ))}
            </div>

            <div className="bg-line-line1 h-6 w-px shrink-0" />
            <div className="flex items-center gap-1">
              {PEN_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-label={`굵기 ${s}`}
                  className={cn(
                    'flex size-11 items-center justify-center rounded-lg transition-colors',
                    size === s ? 'bg-orange-1' : 'hover:bg-gray-1'
                  )}
                >
                  <span
                    className={cn(
                      'block rounded-full',
                      size === s ? 'bg-orange-7' : 'bg-gray-7'
                    )}
                    style={{ width: s + 2, height: s + 2 }}
                  />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <PadIconButton
            onClick={undo}
            disabled={!canUndo}
            label="실행 취소"
          >
            <Undo2 size={18} />
          </PadIconButton>
          <PadIconButton
            onClick={redo}
            disabled={!canRedo}
            label="다시 실행"
          >
            <Redo2 size={18} />
          </PadIconButton>
          <PadIconButton
            onClick={clearStrokes}
            disabled={strokes.length === 0}
            label="전체 지우기"
          >
            <Trash2 size={18} />
          </PadIconButton>
        </div>
      </div>
    </div>
  );
}

function PadToolButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex h-11 min-w-11 items-center gap-1.5 rounded-lg px-3 transition-colors',
        active ? 'bg-orange-1 text-orange-7' : 'text-gray-7 hover:bg-gray-1'
      )}
    >
      {children}
      <span className="font-label-normal text-sm">{label}</span>
    </button>
  );
}

function PadIconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'text-gray-7 hover:bg-gray-1 flex size-11 items-center justify-center rounded-lg transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-30'
      )}
    >
      {children}
    </button>
  );
}
