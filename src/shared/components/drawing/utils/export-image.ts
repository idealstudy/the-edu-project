import { renderStrokes } from '../model/use-drawing-canvas';
import type { Stroke } from '../types';

/* ─────────────────────────────────────────────────────
 * 드로잉 스냅샷(PNG) 익스포트
 *  획(Stroke[])을 오프스크린 캔버스에 동일 렌더러(renderStrokes)로 그려
 *  PNG 이미지로 변환한다. 풀이공유 첨부(presign 업로드)에 사용.
 *
 *  - 좌표는 정규화(0~1) 기준이므로 렌더 시 width/height만 지정하면 된다.
 *  - layoutHeight를 가진 획은 자체 높이를 기준으로 그려지므로
 *    가장 긴 layoutHeight를 캔버스 높이로 사용한다(스크롤 확장 캔버스 대응).
 * ────────────────────────────────────────────────────*/

const DEFAULT_WIDTH = 1000;
const DEFAULT_BACKGROUND = '#ffffff';

type ExportOptions = {
  /** 출력 캔버스 너비(px). 기본 1000 */
  width?: number;
  /** 출력 캔버스 높이(px). 미지정 시 획 layoutHeight 기반 자동 산정 */
  height?: number;
  /** 배경색. 기본 흰색(투명 PNG가 필요하면 null) */
  background?: string | null;
};

const resolveCanvasSize = (
  strokes: Stroke[],
  options: ExportOptions
): { width: number; height: number } => {
  const width = options.width ?? DEFAULT_WIDTH;
  if (options.height && options.height > 0) {
    return { width, height: options.height };
  }
  const maxLayoutHeight = strokes.reduce(
    (max, stroke) => Math.max(max, stroke.layoutHeight ?? 0),
    0
  );
  return {
    width,
    height: maxLayoutHeight > 0 ? Math.round(maxLayoutHeight) : DEFAULT_WIDTH,
  };
};

/** 획을 PNG dataURL 문자열로 변환 */
export function exportStrokesToDataURL(
  strokes: Stroke[],
  options: ExportOptions = {}
): string {
  const { width, height } = resolveCanvasSize(strokes, options);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('캔버스를 초기화할 수 없습니다.');
  }

  const background =
    options.background === undefined ? DEFAULT_BACKGROUND : options.background;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  renderStrokes(ctx, strokes);
  return canvas.toDataURL('image/png');
}

/** 획을 PNG Blob으로 변환 (presign PUT 업로드용) */
export function exportStrokesToBlob(
  strokes: Stroke[],
  options: ExportOptions = {}
): Promise<Blob> {
  const { width, height } = resolveCanvasSize(strokes, options);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return Promise.reject(new Error('캔버스를 초기화할 수 없습니다.'));
  }

  const background =
    options.background === undefined ? DEFAULT_BACKGROUND : options.background;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }

  renderStrokes(ctx, strokes);

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
