export type Point = {
  x: number;
  y: number;
  pressure?: number;
};

export type Stroke = {
  id: string;
  pageNumber: number;
  points: Point[];
  color: string;
  size: number;
  tool: DrawingTool;
  /**
   * y(0~1)가 기준으로 삼는 캔버스 높이(px).
   * 렌더 시 `y * layoutHeight`로 쓰며, 확장으로 늘어난 canvasHeight와 무관하게 픽셀 위치·길이를 유지한다.
   */
  layoutHeight?: number;
  /**
   * x(0~1)가 기준으로 삼는 캔버스 너비(px, 획을 그릴 당시 실측한 canvasWidth).
   * export(PNG 스냅샷)가 이 값을 캔버스 너비로 써야 draw-time 종횡비와 동일하게 재현된다
   * (미지정 시 레거시 획 — export가 고정폭으로 폴백).
   */
  layoutWidth?: number;
};

export type DrawingTool = 'pen' | 'highlighter' | 'eraser';

export type DrawingState = {
  tool: DrawingTool;
  color: string;
  size: number;
  strokes: Stroke[];
  currentPageNumber: number;
};

export type DrawingSaveData = {
  documentId: string;
  pageNumber: number;
  strokes: Stroke[];
  updatedAt: string;
};

export type PageSize = {
  width: number;
  height: number;
};
