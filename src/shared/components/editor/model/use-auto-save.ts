import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AutoSaveStatus,
  TextEditorValue,
  UseAutoSaveOptions,
  UseAutoSaveReturn,
} from '../types';

export const useAutoSave = (
  initialValue: TextEditorValue,
  options: UseAutoSaveOptions
): UseAutoSaveReturn => {
  const {
    enabled = true,
    debounceMs = 2000,
    onSave,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const valueRef = useRef<TextEditorValue>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (isSavingRef.current || !hasUnsavedChanges) return;

    isSavingRef.current = true;
    setStatus('saving');

    try {
      await onSave(valueRef.current);
      setStatus('saved');
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      onSaveSuccess?.();

      // 3초 후 idle로 변경
      setTimeout(() => {
        setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 3000);
    } catch (error) {
      setStatus('error');
      onSaveError?.(error instanceof Error ? error : new Error('Save failed'));
    } finally {
      isSavingRef.current = false;
    }
  }, [hasUnsavedChanges, onSave, onSaveSuccess, onSaveError]);

  const handleChange = useCallback(
    (value: TextEditorValue) => {
      valueRef.current = value;
      setHasUnsavedChanges(true);

      if (!enabled) return;

      // 기존 타이머 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 새 타이머 설정
      timeoutRef.current = setTimeout(() => {
        save();
      }, debounceMs);
    },
    [enabled, debounceMs, save]
  );

  const saveNow = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await save();
  }, [save]);

  // 컴포넌트 언마운트 시 저장
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hasUnsavedChanges && enabled) {
        onSave(valueRef.current).catch((error) => {
          // 사용자가 페이지를 떠나기 전 마지막 시도
          // localStorage에 백업 저장
          try {
            localStorage.setItem(
              'editor_backup',
              JSON.stringify(valueRef.current)
            );
          } catch {
            // localStorage 실패 시 무시
          }
          onSaveError?.(
            error instanceof Error ? error : new Error('Save failed')
          );
        });
      }
    };
  }, [hasUnsavedChanges, enabled, onSave, onSaveError]);

  // 브라우저 종료 전 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    status,
    lastSavedAt,
    hasUnsavedChanges,
    saveNow,
    handleChange,
  };
};
