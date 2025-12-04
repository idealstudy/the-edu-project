import {
  FILE_UPLOAD_CONFIG,
  IMAGE_UPLOAD_CONFIG,
  SLASH_COMMAND_GROUPS,
  UPLOAD_ERROR_MESSAGES,
} from '../constants';
import { SlashCommandGroup, SlashCommandItem } from '../types';

// ============================================================================
// File Validation
// ============================================================================

/**
 * 이미지 파일 유효성 검사
 */
export const validateImageFile = (
  file: File
): { valid: boolean; error?: string } => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (
    !extension ||
    !(IMAGE_UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(
      extension
    )
  ) {
    return {
      valid: false,
      error: UPLOAD_ERROR_MESSAGES.IMAGE_TYPE_NOT_ALLOWED,
    };
  }

  if (
    !IMAGE_UPLOAD_CONFIG.allowedMimeTypes.includes(
      file.type as (typeof IMAGE_UPLOAD_CONFIG.allowedMimeTypes)[number]
    )
  ) {
    return {
      valid: false,
      error: UPLOAD_ERROR_MESSAGES.IMAGE_TYPE_NOT_ALLOWED,
    };
  }

  if (file.size > IMAGE_UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: UPLOAD_ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED };
  }

  return { valid: true };
};

/**
 * 첨부 파일 유효성 검사
 */
export const validateAttachmentFile = (
  file: File
): { valid: boolean; error?: string } => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (
    !extension ||
    !(FILE_UPLOAD_CONFIG.allowedExtensions as readonly string[]).includes(
      extension
    )
  ) {
    return { valid: false, error: UPLOAD_ERROR_MESSAGES.FILE_TYPE_NOT_ALLOWED };
  }

  if (file.size > FILE_UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: UPLOAD_ERROR_MESSAGES.FILE_SIZE_EXCEEDED };
  }

  return { valid: true };
};

/**
 * URL 유효성 검사
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// Error Message Helpers
// ============================================================================

/**
 * 업로드 에러를 사용자 친화적인 메시지로 변환
 */
export const getUploadErrorMessage = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('size') || message.includes('large')) {
    return UPLOAD_ERROR_MESSAGES.IMAGE_SIZE_EXCEEDED;
  }

  if (message.includes('type') || message.includes('format')) {
    return UPLOAD_ERROR_MESSAGES.IMAGE_TYPE_NOT_ALLOWED;
  }

  if (message.includes('network') || message.includes('fetch')) {
    return UPLOAD_ERROR_MESSAGES.NETWORK_ERROR;
  }

  return UPLOAD_ERROR_MESSAGES.UPLOAD_FAILED;
};

// ============================================================================
// File Formatting
// ============================================================================

/**
 * 파일 크기를 읽기 쉬운 형태로 포맷팅
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * 파일명에서 확장자 추출
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// ============================================================================
// Slash Command Helpers
// ============================================================================

/**
 * 모든 슬래시 커맨드를 flat 배열로 반환
 */
export const getAllSlashCommands = (): SlashCommandItem[] => {
  return SLASH_COMMAND_GROUPS.flatMap((group) => group.items);
};

/**
 * 검색어로 슬래시 커맨드 필터링
 */
export const filterSlashCommands = (query: string): SlashCommandGroup[] => {
  if (!query) return SLASH_COMMAND_GROUPS;

  const lowerQuery = query.toLowerCase();

  return SLASH_COMMAND_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.keywords.some((keyword) =>
          keyword.toLowerCase().includes(lowerQuery)
        )
    ),
  })).filter((group) => group.items.length > 0);
};
