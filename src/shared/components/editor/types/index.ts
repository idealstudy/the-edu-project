import { Editor, JSONContent } from '@tiptap/react';

// ============================================================================
// Editor Core Types
// ============================================================================

/** 에디터 콘텐츠 값 타입 */
export type TextEditorValue = JSONContent;

/** 기본 에디터 Props */
export type TextEditorProps = {
  className?: string;
  value: TextEditorValue;
  onChange: (value: TextEditorValue) => void;
  placeholder?: string;
};

/** 뷰어 Props */
export type TextViewerProps = {
  className?: string;
  value: TextEditorValue;
};

/** 툴바 Props */
export type ToolbarProps = {
  editor: Editor;
};

/** Notion 스타일 에디터 Props */
export type NotionEditorProps = TextEditorProps & {
  /** 다크모드 활성화 */
  darkMode?: boolean;
  /** 자동 포커스 */
  autoFocus?: boolean;
  /** 슬래시 커맨드 활성화 */
  enableSlashCommand?: boolean;
  /** 툴바 표시 여부 */
  showToolbar?: boolean;
  /** 버블 메뉴 표시 여부 */
  showBubbleMenu?: boolean;
  /** 최소 높이 */
  minHeight?: string;
  /** 최대 높이 */
  maxHeight?: string;
  /** 읽기 전용 */
  readOnly?: boolean;
  /** 커스텀 이미지 업로드 핸들러 (제공하지 않으면 기본 API 사용) */
  onImageUpload?: (file: File) => Promise<string>;
  /** 커스텀 파일 업로드 핸들러 */
  onFileUpload?: (
    file: File
  ) => Promise<{ url: string; name: string; size: number }>;
  /** 에러 핸들러 */
  onError?: (message: string) => void;
  /** 접근성 레이블 */
  ariaLabel?: string;
};

// ============================================================================
// Auto Save Types
// ============================================================================

/** 자동 저장 상태 */
export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** useAutoSave 훅 옵션 */
export type UseAutoSaveOptions = {
  /** 자동 저장 활성화 여부 */
  enabled?: boolean;
  /** 디바운스 딜레이 (ms) */
  debounceMs?: number;
  /** 저장 함수 */
  onSave: (value: TextEditorValue) => Promise<void>;
  /** 저장 성공 콜백 */
  onSaveSuccess?: () => void;
  /** 저장 실패 콜백 */
  onSaveError?: (error: Error) => void;
};

/** useAutoSave 훅 반환값 */
export type UseAutoSaveReturn = {
  /** 현재 저장 상태 */
  status: AutoSaveStatus;
  /** 마지막 저장 시간 */
  lastSavedAt: Date | null;
  /** 변경 사항 있음 여부 */
  hasUnsavedChanges: boolean;
  /** 수동 저장 트리거 */
  saveNow: () => Promise<void>;
  /** 값 변경 핸들러 */
  handleChange: (value: TextEditorValue) => void;
};

// ============================================================================
// Upload Types
// ============================================================================

/** 이미지 업로드 응답 */
export type UploadImageResponse = {
  url: string;
};

/** 이미지 업로드 파라미터 */
export type UploadImageParams = {
  file: File;
};

/** useImageUpload 훅 옵션 */
export type UseImageUploadOptions = {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
};

/** 파일 업로드 응답 */
export type FileUploadResponse = {
  url: string;
  name: string;
  size: number;
};

/** 파일 업로드 파라미터 */
export type FileUploadParams = {
  file: File;
};

/** useFileUpload 훅 옵션 */
export type UseFileUploadOptions = {
  onSuccess?: (data: FileUploadResponse) => void;
  onError?: (error: Error) => void;
};

/** 파일 유효성 검사 결과 */
export type FileValidationResult = {
  valid: boolean;
  error?: string;
};

// ============================================================================
// Link Preview Types
// ============================================================================

/** 링크 미리보기 데이터 */
export type LinkPreviewData = {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
};

/** useLinkPreview 훅 옵션 */
export type UseLinkPreviewOptions = {
  onSuccess?: (data: LinkPreviewData) => void;
  onError?: (error: Error) => void;
};

// ============================================================================
// Slash Command Types
// ============================================================================

/** 슬래시 커맨드 아이템 */
export type SlashCommandItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  command: (editor: Editor) => void;
};

/** 슬래시 커맨드 그룹 */
export type SlashCommandGroup = {
  title: string;
  items: SlashCommandItem[];
};
