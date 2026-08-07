'use client';

import { ChangeEvent, useRef, useState } from 'react';

import { repository } from '@/entities/unit-note';
import {
  SolutionDrawingPad,
  type Stroke,
  useDrawingUpload,
} from '@/shared/components/drawing';
import { Button } from '@/shared/components/ui';
import {
  FileImage,
  FileText,
  Loader2,
  Paperclip,
  PenLine,
  X,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

import { useAppendUnitNotePages } from '../hooks/use-unit-note-query';

type UnitNoteEditorProps = {
  nodeId: number;
  displayName: string;
  nextPageNumber: number;
  initialMode?: 'PEN' | 'UPLOAD';
};

type UploadRow = {
  id: string;
  file: File;
  status: 'QUEUED' | 'UPLOADING' | 'SAVED' | 'FAILED';
  mediaId?: string;
  error?: string;
};

const MAX_FILE_COUNT = 30;

const splitPdf = async (file: File): Promise<File[]> => {
  const source = await PDFDocument.load(await file.arrayBuffer());
  const baseName = file.name.replace(/\.pdf$/i, '');
  const pages: File[] = [];
  for (let pageIndex = 0; pageIndex < source.getPageCount(); pageIndex++) {
    const target = await PDFDocument.create();
    const [copied] = await target.copyPages(source, [pageIndex]);
    target.addPage(copied);
    const bytes = await target.save();
    const pageBuffer = Uint8Array.from(bytes).buffer;
    pages.push(
      new File([pageBuffer], `${baseName}-${pageIndex + 1}.pdf`, {
        type: 'application/pdf',
      })
    );
  }
  return pages;
};

const expandFiles = async (files: File[]): Promise<File[]> => {
  const expanded: File[] = [];
  for (const file of files) {
    if (file.type === 'application/pdf') {
      expanded.push(...(await splitPdf(file)));
    } else {
      expanded.push(file);
    }
  }
  return expanded.slice(0, MAX_FILE_COUNT);
};

export const UnitNoteEditor = ({
  nodeId,
  displayName,
  nextPageNumber,
  initialMode = 'PEN',
}: UnitNoteEditorProps) => {
  const [mode, setMode] = useState<'PEN' | 'UPLOAD'>(initialMode);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [uploadRows, setUploadRows] = useState<UploadRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingUpload = useDrawingUpload('UNIT_NOTE_PAGE');
  const appendMutation = useAppendUnitNotePages(nodeId);

  const saveDrawing = async () => {
    const uploaded = await drawingUpload.uploadDrawingAsync(strokes);
    await appendMutation.mutateAsync({
      pages: [{ source: 'PEN', mediaId: uploaded.mediaId, cover: false }],
    });
    setStrokes([]);
  };

  const updateRow = (id: string, patch: Partial<UploadRow>) => {
    setUploadRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  };

  const persistUploadRow = async (row: UploadRow) => {
    updateRow(row.id, { status: 'UPLOADING', error: undefined });
    try {
      const uploaded = row.mediaId
        ? { mediaId: row.mediaId }
        : await repository.uploadPageFile(row.file);
      updateRow(row.id, { mediaId: uploaded.mediaId });
      await appendMutation.mutateAsync({
        pages: [{ source: 'UPLOAD', mediaId: uploaded.mediaId, cover: false }],
      });
      updateRow(row.id, { status: 'SAVED', mediaId: uploaded.mediaId });
    } catch (error) {
      updateRow(row.id, {
        status: 'FAILED',
        error: error instanceof Error ? error.message : '페이지 업로드 실패',
      });
    }
  };

  const persistUploadRows = async (rows: UploadRow[]) => {
    rows.forEach((row) =>
      updateRow(row.id, { status: 'UPLOADING', error: undefined })
    );
    const uploadedRows = await Promise.all(
      rows.map(async (row) => {
        try {
          const uploaded = await repository.uploadPageFile(row.file);
          updateRow(row.id, { mediaId: uploaded.mediaId });
          return { ...row, mediaId: uploaded.mediaId };
        } catch (error) {
          updateRow(row.id, {
            status: 'FAILED',
            error:
              error instanceof Error ? error.message : '페이지 업로드 실패',
          });
          return null;
        }
      })
    );
    const successfulRows = uploadedRows.filter(
      (row): row is UploadRow & { mediaId: string } => row !== null
    );
    if (successfulRows.length === 0) return;

    try {
      await appendMutation.mutateAsync({
        pages: successfulRows.map((row) => ({
          source: 'UPLOAD',
          mediaId: row.mediaId,
          cover: false,
        })),
      });
      successfulRows.forEach((row) =>
        updateRow(row.id, { status: 'SAVED', mediaId: row.mediaId })
      );
    } catch (error) {
      successfulRows.forEach((row) =>
        updateRow(row.id, {
          status: 'FAILED',
          mediaId: row.mediaId,
          error: error instanceof Error ? error.message : '페이지 저장 실패',
        })
      );
    }
  };

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (selected.length === 0) return;
    try {
      const expanded = await expandFiles(selected);
      const rows = expanded.map((file, index) => ({
        id: `${Date.now()}-${index}-${file.name}`,
        file,
        status: 'QUEUED' as const,
      }));
      setUploadRows((current) => [...current, ...rows]);
      await persistUploadRows(rows);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'PDF 페이지 분해 실패';
      setUploadRows((current) => [
        ...current,
        {
          id: `${Date.now()}-pdf-error`,
          file: selected[0]!,
          status: 'FAILED',
          error: message,
        },
      ]);
    }
  };

  return (
    <section
      className="border-gray-3 bg-gray-white rounded-xl border p-4 md:p-6"
      aria-labelledby="unit-note-editor-title"
      data-testid="unit-note-editor"
    >
      <div>
        <h2
          id="unit-note-editor-title"
          className="font-headline2-heading text-gray-12"
        >
          {displayName} · 새 페이지
        </h2>
        <p className="font-caption-normal text-gray-8 mt-1">
          저장하면 이 소단원의 {nextPageNumber}번째 페이지로 끝에 꽂혀요.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`min-h-11 cursor-pointer rounded-full border px-4 text-xs font-bold ${
            mode === 'PEN'
              ? 'border-orange-7 bg-orange-1'
              : 'border-gray-3 hover:bg-gray-1'
          }`}
          aria-pressed={mode === 'PEN'}
          onClick={() => setMode('PEN')}
          data-testid="unit-note-mode-pen"
        >
          <span className="text-gray-12 flex items-center gap-2">
            <PenLine
              size={20}
              className="text-orange-7"
            />
            펜으로 쓰기
          </span>
        </button>
        <button
          type="button"
          className={`min-h-11 cursor-pointer rounded-full border px-4 text-xs font-bold ${
            mode === 'UPLOAD'
              ? 'border-orange-7 bg-orange-1'
              : 'border-gray-3 hover:bg-gray-1'
          }`}
          aria-pressed={mode === 'UPLOAD'}
          onClick={() => setMode('UPLOAD')}
          data-testid="unit-note-mode-upload"
        >
          <span className="text-gray-12 flex items-center gap-2">
            <Paperclip
              size={20}
              className="text-orange-7"
            />
            파일 올리기
          </span>
        </button>
      </div>

      {mode === 'PEN' ? (
        <div className="mt-5">
          <SolutionDrawingPad
            key={nodeId}
            height={280}
            persistKey={`unit-note:${nodeId}`}
            onStrokesChange={setStrokes}
          />
          <Button
            className="mt-4 w-full"
            disabled={
              strokes.length === 0 ||
              drawingUpload.isUploading ||
              appendMutation.isPending
            }
            onClick={() => void saveDrawing()}
            data-testid="unit-note-save-drawing"
          >
            {(drawingUpload.isUploading || appendMutation.isPending) && (
              <Loader2
                size={18}
                className="animate-spin"
              />
            )}
            이 페이지를 책에 꽂기
          </Button>
        </div>
      ) : (
        <div className="mt-5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif,application/pdf"
            multiple
            className="sr-only"
            onChange={(event) => void handleFiles(event)}
            data-testid="unit-note-file-input"
          />
          <button
            type="button"
            className="border-orange-4 bg-orange-1 hover:bg-orange-2 flex min-h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center"
            onClick={() => fileInputRef.current?.click()}
            data-testid="unit-note-file-picker"
          >
            <Paperclip
              size={30}
              className="text-orange-7"
            />
            <span className="font-body1-heading text-gray-12 mt-3">
              여기로 끌어다 놓거나 눌러서 고르세요
            </span>
            <span className="font-caption-normal text-gray-8 mt-2 leading-relaxed">
              굿노트·삼성노트에서 내보낸 PDF, 사진 JPG, PNG, HEIC를 여러 장 한
              번에 올릴 수 있어요. PDF는 낱장으로 나눠 저장합니다.
            </span>
          </button>

          {uploadRows.length > 0 && (
            <div
              className="mt-4 flex flex-col gap-2"
              data-testid="unit-note-upload-list"
            >
              {uploadRows.map((row) => {
                const Icon =
                  row.file.type === 'application/pdf' ? FileText : FileImage;
                return (
                  <div
                    key={row.id}
                    className="border-gray-3 flex min-h-16 items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <Icon
                      size={22}
                      className="text-gray-7 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-label-heading text-gray-11 truncate">
                        {row.file.name}
                      </p>
                      <p className="font-caption-normal text-gray-7">
                        {(row.file.size / 1024 / 1024).toFixed(1)}MB ·{' '}
                        {row.status === 'QUEUED' && '대기'}
                        {row.status === 'UPLOADING' && '올리는 중'}
                        {row.status === 'SAVED' && '책장에 꽂힘'}
                        {row.status === 'FAILED' &&
                          (row.error ?? '이 장만 실패')}
                      </p>
                    </div>
                    {row.status === 'UPLOADING' && (
                      <Loader2
                        size={19}
                        className="text-orange-7 animate-spin"
                      />
                    )}
                    {row.status === 'FAILED' && (
                      <Button
                        size="xsmall"
                        variant="outlined"
                        onClick={() => void persistUploadRow(row)}
                        data-testid={`unit-note-upload-retry-${row.id}`}
                      >
                        다시 올리기
                      </Button>
                    )}
                    {row.status !== 'UPLOADING' && (
                      <button
                        type="button"
                        className="text-gray-6 hover:bg-gray-1 flex size-11 cursor-pointer items-center justify-center rounded-lg"
                        aria-label={`${row.file.name} 업로드 목록에서 제거`}
                        onClick={() =>
                          setUploadRows((rows) =>
                            rows.filter((item) => item.id !== row.id)
                          )
                        }
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
