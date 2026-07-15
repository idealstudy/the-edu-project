import { renderStrokes } from '../model/use-drawing-canvas';
import type { Stroke } from '../types';

/* ─────────────────────────────────────────────────────
 * 드로잉 스냅샷(PNG) 익스포트
 *  획(Stroke[])을 오프스크린 캔버스에 동일 렌더러(renderStrokes)로 그려
 *  PNG 이미지로 변환한다. 풀이공유 첨부(presign 업로드) + AI 코치 풀이 이미지에 사용.
 *
 *  - 좌표는 정규화(0~1) 기준이므로 렌더 시 width/height만 지정하면 된다.
 *  - layoutHeight를 가진 획은 자체 높이를 기준으로, layoutWidth를 가진 획은
 *    자체 너비(draw-time 실측 canvasWidth)를 기준으로 그려지므로
 *    가장 큰 layoutWidth/layoutHeight를 캔버스 크기로 사용한다(스크롤 확장 캔버스 대응).
 *    → 두 값을 함께 써야 draw-time 종횡비가 export에서도 그대로 재현된다
 *      (width만 고정폭으로 박아두면 가로가 늘어나 손글씨가 왜곡된다 — 과거 버그).
 *  - 물리 픽셀은 devicePixelRatio(최소 2x)만큼 키우되 논리 크기(width/height)는
 *    그대로 두고 ctx.scale로 확대한다. 즉 좌표계·펜 굵기(stroke.size)는 화면과
 *    동일 비율로 유지되면서 해상도만 올라간다 — 별도 펜 굵기 계수가 필요 없다.
 * ────────────────────────────────────────────────────*/

const DEFAULT_WIDTH = 1000;
const DEFAULT_BACKGROUND = '#ffffff';
/** 첨자·지수 판독을 위한 최소 업스케일 배율(§Phase 1b A-1) */
const MIN_EXPORT_SCALE = 2;

type ExportOptions = {
  /** 출력 캔버스 논리 너비(px). 미지정 시 획 layoutWidth 기반 자동 산정(레거시 폴백 1000) */
  width?: number;
  /** 출력 캔버스 논리 높이(px). 미지정 시 획 layoutHeight 기반 자동 산정 */
  height?: number;
  /** 배경색. 기본 흰색(투명 PNG가 필요하면 null) */
  background?: string | null;
  /** 물리 픽셀 배율. 미지정 시 max(devicePixelRatio, 2) */
  scale?: number;
};

const resolveCanvasSize = (
  strokes: Stroke[],
  options: ExportOptions
): { width: number; height: number } => {
  const maxLayoutWidth = strokes.reduce(
    (max, stroke) => Math.max(max, stroke.layoutWidth ?? 0),
    0
  );
  const maxLayoutHeight = strokes.reduce(
    (max, stroke) => Math.max(max, stroke.layoutHeight ?? 0),
    0
  );
  const width =
    options.width && options.width > 0
      ? options.width
      : maxLayoutWidth > 0
        ? Math.round(maxLayoutWidth)
        : DEFAULT_WIDTH;
  const height =
    options.height && options.height > 0
      ? options.height
      : maxLayoutHeight > 0
        ? Math.round(maxLayoutHeight)
        : DEFAULT_WIDTH;
  return { width, height };
};

const resolveExportScale = (options: ExportOptions): number => {
  if (options.scale && options.scale > 0) return options.scale;
  const dpr =
    typeof window !== 'undefined' && window.devicePixelRatio
      ? window.devicePixelRatio
      : 1;
  return Math.max(MIN_EXPORT_SCALE, dpr);
};

/**
 * 획을 오프스크린 캔버스에 렌더 — 논리 크기(=draw-time 종횡비)는 그대로 두고
 * 물리 픽셀만 scale배 키운다(ctx.scale). 두 export 함수(dataURL/Blob)가 공유.
 */
const renderStrokesToCanvas = (
  strokes: Stroke[],
  options: ExportOptions
): HTMLCanvasElement => {
  const { width, height } = resolveCanvasSize(strokes, options);
  const scale = resolveExportScale(options);

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('캔버스를 초기화할 수 없습니다.');
  }

  ctx.scale(scale, scale);

  const background =
    options.background === undefined ? DEFAULT_BACKGROUND : options.background;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  // layoutSize를 논리 크기로 명시 — 물리 캔버스가 scale배 커졌어도
  // renderStrokes 내부 clearRect/좌표 계산은 논리 좌표계를 쓰게 한다.
  renderStrokes(ctx, strokes, null, { width, height });
  return canvas;
};

/** 획을 PNG dataURL 문자열로 변환 */
export function exportStrokesToDataURL(
  strokes: Stroke[],
  options: ExportOptions = {}
): string {
  const canvas = renderStrokesToCanvas(strokes, options);
  return canvas.toDataURL('image/png');
}

/** 획을 PNG Blob으로 변환 (presign PUT 업로드용) */
export function exportStrokesToBlob(
  strokes: Stroke[],
  options: ExportOptions = {}
): Promise<Blob> {
  let canvas: HTMLCanvasElement;
  try {
    canvas = renderStrokesToCanvas(strokes, options);
  } catch (error) {
    return Promise.reject(
      error instanceof Error
        ? error
        : new Error('캔버스를 초기화할 수 없습니다.')
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('드로잉 이미지를 생성하지 못했습니다.'));
    }, 'image/png');
  });
}

/** 획을 PNG File로 변환 (fileName 지정) */
export async function exportStrokesToFile(
  strokes: Stroke[],
  fileName = 'solution-drawing.png',
  options: ExportOptions = {}
): Promise<File> {
  const blob = await exportStrokesToBlob(strokes, options);
  return new File([blob], fileName, { type: 'image/png' });
}
