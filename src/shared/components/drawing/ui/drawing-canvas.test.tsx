import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DrawingCanvas } from './drawing-canvas';

const pageSize = { width: 640, height: 440 };

describe('BUG-QA-01 마우스 손풀이 계약', () => {
  beforeEach(() => {
    class TestPointerEvent extends MouseEvent {
      readonly pointerId: number;
      readonly pointerType: string;
      readonly pressure: number;

      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerId = init.pointerId ?? 0;
        this.pointerType = init.pointerType ?? '';
        this.pressure = init.pressure ?? 0;
      }
    }
    vi.stubGlobal('PointerEvent', TestPointerEvent);
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: vi.fn(() => ({
        canvas: { width: pageSize.width, height: pageSize.height },
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        clearRect: vi.fn(),
        drawImage: vi.fn(),
        globalAlpha: 1,
        fillStyle: '',
      })),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'setPointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'hasPointerCapture', {
      configurable: true,
      value: vi.fn(() => true),
    });
    Object.defineProperty(HTMLCanvasElement.prototype, 'releasePointerCapture', {
      configurable: true,
      value: vi.fn(),
    });
    vi.stubGlobal('Path2D', class Path2D {});
  });

  function renderCanvas(onStrokeAdd = vi.fn()) {
    const view = render(
      <DrawingCanvas
        strokes={[]}
        tool="pen"
        color="#1a1a1a"
        size={5}
        pageSize={pageSize}
        onStrokeAdd={onStrokeAdd}
        onStrokeErase={vi.fn()}
      />
    );
    const canvas = view.container.querySelector('canvas');
    if (!canvas) throw new Error('드로잉 캔버스가 없습니다.');
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: pageSize.width,
      bottom: pageSize.height,
      width: pageSize.width,
      height: pageSize.height,
      toJSON: () => ({}),
    });
    return { canvas, onStrokeAdd };
  }

  it('[BUG-QA-01 정상] 주 마우스 드래그는 포인터 종료 시 한 획을 저장한다', () => {
    const { canvas, onStrokeAdd } = renderCanvas();

    fireEvent.pointerDown(canvas, {
      pointerId: 1,
      pointerType: 'mouse',
      buttons: 1,
      clientX: 40,
      clientY: 60,
    });
    fireEvent.pointerMove(canvas, {
      pointerId: 1,
      pointerType: 'mouse',
      buttons: 1,
      clientX: 120,
      clientY: 140,
    });
    fireEvent.pointerUp(canvas, {
      pointerId: 1,
      pointerType: 'mouse',
      buttons: 0,
      clientX: 160,
      clientY: 180,
    });

    expect(onStrokeAdd).toHaveBeenCalledTimes(1);
    expect(onStrokeAdd.mock.calls[0]?.[0].points.length).toBeGreaterThanOrEqual(
      2
    );
  });

  it('[BUG-QA-01 거절] 왼쪽 버튼이 누르지 않은 마우스 이동은 획으로 저장하지 않는다', () => {
    const { canvas, onStrokeAdd } = renderCanvas();

    fireEvent.pointerDown(canvas, {
      pointerId: 2,
      pointerType: 'mouse',
      buttons: 0,
      clientX: 40,
      clientY: 60,
    });
    fireEvent.pointerMove(canvas, {
      pointerId: 2,
      pointerType: 'mouse',
      buttons: 0,
      clientX: 120,
      clientY: 140,
    });
    fireEvent.pointerUp(canvas, {
      pointerId: 2,
      pointerType: 'mouse',
      buttons: 0,
      clientX: 160,
      clientY: 180,
    });

    expect(onStrokeAdd).not.toHaveBeenCalled();
  });
});
