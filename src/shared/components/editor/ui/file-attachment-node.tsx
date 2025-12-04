'use client';

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';
import {
  Download,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Presentation,
} from 'lucide-react';

import { formatFileSize, getFileExtension } from '../utils';

const getFileIcon = (filename: string) => {
  const ext = getFileExtension(filename);
  const iconClass = 'h-8 w-8';

  switch (ext) {
    case 'pdf':
      return <FileText className={`${iconClass} text-red-500`} />;
    case 'docx':
    case 'hwp':
    case 'hwpx':
      return <FileText className={`${iconClass} text-blue-500`} />;
    case 'pptx':
      return <Presentation className={`${iconClass} text-orange-500`} />;
    case 'xlsx':
      return <FileSpreadsheet className={`${iconClass} text-green-500`} />;
    case 'zip':
      return <FileArchive className={`${iconClass} text-yellow-500`} />;
    default:
      return <FileText className={`${iconClass} text-gray-500`} />;
  }
};

export const FileAttachmentNode = ({ node }: NodeViewProps) => {
  const { url, name, size } = node.attrs as {
    url: string;
    name: string;
    size: number;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <NodeViewWrapper className="file-attachment-wrapper my-2">
      <div
        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        contentEditable={false}
      >
        {getFileIcon(name)}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatFileSize(size)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-600 dark:hover:text-gray-300"
          title="다운로드"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </NodeViewWrapper>
  );
};
