'use client';

import { ReactNode, useEffect, useState } from 'react';

import {
  useConsultationDetail,
  useConsultationList,
  useCreateConsultation,
  useDeleteConsultation,
  useUpdateConsultation,
} from '@/features/member/hooks/use-consultation';
import {
  initialTextEditorValue,
  parseEditorContent,
  prepareContentForSave,
} from '@/shared/components/editor';
import { TextEditorValue } from '@/shared/components/editor/types';
import { showBottomToast } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { cn, formatDateDot, toPlainText } from '@/shared/lib';
import { ChevronLeft, Info, X } from 'lucide-react';

import { DeleteConfirm } from './delete-confirm';
import { ConsultationDetailContent } from './detail';
import { ConsultationFormContent } from './form';
import { ConsultationListContent } from './list';

// ─────────────────────────────────────────────────────
// Layout (공통 다이얼로그 프레임)
// ─────────────────────────────────────────────────────

type LayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export const ConsultationDialogLayout = ({
  isOpen,
  onClose,
  title,
  navigation,
  children,
  footer,
}: LayoutProps) => {
  return (
    <Dialog isOpen={isOpen}>
      <Dialog.Content className="tablet:h-[80vh] tablet:max-w-[600px] desktop:h-[602px] desktop:w-[720px] desktop:max-w-[720px] h-[85vh] max-w-[calc(100%-2rem)] gap-0 overflow-y-hidden p-6">
        <Dialog.Header className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="min-w-0 flex-1">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-7 hover:text-gray-12 shrink-0"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="font-label-normal text-gray-7 flex items-center gap-1">
            <Info size={14} />
            작성된 내용은 학생과 보호자에게도 공유돼요.
          </Dialog.Description>
        </Dialog.Header>

        {navigation && <div className="mb-5">{navigation}</div>}

        <Dialog.Body className="min-h-0">{children}</Dialog.Body>

        {footer && (
          <Dialog.Footer className="mt-6 justify-end">{footer}</Dialog.Footer>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────
// Tab Nav
// ─────────────────────────────────────────────────────

type TabNavProps = {
  activeTab: 'write' | 'list';
  onTabChange: (tab: 'write' | 'list') => void;
};

export const ConsultationTabNav = ({ activeTab, onTabChange }: TabNavProps) => {
  return (
    <div className="flex gap-2">
      {(['write', 'list'] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={cn(
              'font-body2-normal rounded-full border px-5 py-2 transition-colors',
              isActive
                ? 'border-key-color-primary text-key-color-primary'
                : 'border-gray-4 text-gray-7 hover:border-gray-6'
            )}
          >
            {tab === 'write' ? '기록 일지 작성' : '기록 일지 기록'}
          </button>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────

type View = 'list' | 'form' | 'detail';

type ConsultationDialogsProps = {
  studyRoomId: number;
  studentId: string;
  studentName: string;
  initialView: 'list' | 'form';
  isOpen: boolean;
  isTeacher: boolean;
  onClose: () => void;
};

export const ConsultationDialogs = ({
  studyRoomId,
  studentId,
  studentName,
  initialView,
  isOpen,
  isTeacher,
  onClose,
}: ConsultationDialogsProps) => {
  const numericStudentId = Number(studentId);
  const [view, setView] = useState<View>(initialView);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [accItems, setAccItems] = useState<
    { id: string; date: string; preview: string }[]
  >([]);

  // Form state
  const [formContent, setFormContent] = useState<TextEditorValue>(
    initialTextEditorValue
  );

  // Detail state
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [detailContent, setDetailContent] = useState<TextEditorValue>(
    initialTextEditorValue
  );

  const { data: pageData } = useConsultationList(
    studyRoomId,
    numericStudentId,
    page,
    isOpen
  );

  useEffect(() => {
    if (!pageData) return;
    const newItems = pageData.list.map((item) => ({
      id: String(item.id),
      date: formatDateDot(item.regDate),
      preview: toPlainText(item.content),
    }));
    setAccItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
  }, [pageData, page]);

  const hasMore = pageData ? page + 1 < pageData.totalPages : false;

  const { data: detailData, isError } = useConsultationDetail(
    studyRoomId,
    numericStudentId,
    selectedId,
    view === 'detail' && selectedId !== null
  );

  useEffect(() => {
    setIsEditing(false);
    setDetailContent(initialTextEditorValue);
  }, [selectedId]);

  useEffect(() => {
    if (!detailData) return;
    const resolved = detailData.resolvedContent;
    const raw =
      resolved?.expiresAt && new Date(resolved.expiresAt) > new Date()
        ? resolved.content
        : detailData.content;
    setDetailContent(parseEditorContent(raw));
  }, [detailData]);

  const createMutation = useCreateConsultation(studyRoomId, numericStudentId);
  const updateMutation = useUpdateConsultation(studyRoomId, numericStudentId);
  const deleteMutation = useDeleteConsultation(studyRoomId, numericStudentId);

  const handleTabChange = (tab: 'write' | 'list') =>
    setView(tab === 'write' ? 'form' : 'list');

  const handleFormSave = () => {
    const { contentString, mediaIds } = prepareContentForSave(formContent);
    createMutation.mutate(
      { content: contentString, mediaIds },
      {
        onSuccess: () => {
          setFormContent(initialTextEditorValue);
          setView('list');
        },
      }
    );
  };

  const handleDetailSave = () => {
    if (!selectedId) return;
    const { contentString, mediaIds } = prepareContentForSave(detailContent);
    updateMutation.mutate(
      { sheetId: selectedId, content: contentString, mediaIds },
      {
        onSuccess: () => {
          setIsEditing(false);
          setView('list');
        },
      }
    );
  };

  const handleDetailCancel = () => {
    if (detailData) {
      const raw = detailData.resolvedContent?.content ?? detailData.content;
      setDetailContent(parseEditorContent(raw));
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const date = formatDateDot(detailData?.regDate ?? new Date());
    deleteMutation.mutate(
      { sheetId: selectedId },
      {
        onSuccess: () => {
          setIsDeleteOpen(false);
          setSelectedId(null);
          setView('list');
          showBottomToast(
            `${date} ${studentName} 학생 기록 일지가 삭제되었어요.`
          );
        },
      }
    );
  };

  if (view === 'form') {
    return (
      <ConsultationDialogLayout
        isOpen={isOpen}
        onClose={onClose}
        title={`${studentName} 학생 기록 일지`}
        navigation={
          isTeacher ? (
            <ConsultationTabNav
              activeTab="write"
              onTabChange={handleTabChange}
            />
          ) : undefined
        }
        footer={
          isTeacher ? (
            <Button
              variant="primary"
              size="small"
              className="font-body2-heading px-12"
              onClick={handleFormSave}
            >
              저장
            </Button>
          ) : undefined
        }
      >
        <ConsultationFormContent
          content={formContent}
          onChange={setFormContent}
        />
      </ConsultationDialogLayout>
    );
  }

  if (view === 'detail' && selectedId !== null) {
    const fallback = accItems.find((item) => item.id === String(selectedId));
    const date = detailData
      ? formatDateDot(detailData.regDate)
      : (fallback?.date ?? '');

    const detailTitle = (
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={isEditing ? handleDetailCancel : () => setView('list')}
          className="text-gray-7 hover:text-gray-12 -ml-1 shrink-0 p-1"
          aria-label={isEditing ? '편집 취소' : '목록으로'}
        >
          <ChevronLeft
            size={20}
            aria-hidden
          />
        </button>
        <span className="truncate">
          {date ? `${date} 기록 일지` : '기록 일지'}
        </span>
      </div>
    );

    if (isError) {
      return (
        <ConsultationDialogLayout
          isOpen={isOpen}
          onClose={onClose}
          title={detailTitle}
        >
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <span className="font-body2-normal text-gray-7">
              기록을 불러오지 못했어요.
            </span>
            <button
              type="button"
              onClick={() => setView('list')}
              className="font-label-normal text-key-color-primary"
            >
              목록으로 돌아가기
            </button>
          </div>
        </ConsultationDialogLayout>
      );
    }

    if (!date || !detailData) {
      return (
        <ConsultationDialogLayout
          isOpen={isOpen}
          onClose={onClose}
          title={detailTitle}
        >
          <div className="flex flex-1 items-center justify-center">
            <span className="font-body2-normal text-gray-7">
              불러오는 중...
            </span>
          </div>
        </ConsultationDialogLayout>
      );
    }

    const detailFooter = isTeacher ? (
      isEditing ? (
        <Button
          variant="primary"
          size="small"
          className="font-body2-heading px-12"
          onClick={handleDetailSave}
        >
          수정 완료
        </Button>
      ) : (
        <>
          <Button
            variant="outlined"
            size="small"
            className="font-body2-heading px-12"
            onClick={() => setIsDeleteOpen(true)}
          >
            삭제
          </Button>
          <Button
            variant="primary"
            size="small"
            className="font-body2-heading px-12"
            onClick={() => setIsEditing(true)}
          >
            수정
          </Button>
        </>
      )
    ) : undefined;

    return (
      <>
        <ConsultationDialogLayout
          isOpen={isOpen}
          onClose={onClose}
          title={detailTitle}
          footer={detailFooter}
        >
          <ConsultationDetailContent
            isEditing={isEditing}
            content={detailContent}
            onChange={setDetailContent}
          />
        </ConsultationDialogLayout>

        <DeleteConfirm
          date={date}
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          onDelete={handleDelete}
        />
      </>
    );
  }

  return (
    <ConsultationDialogLayout
      isOpen={isOpen}
      onClose={onClose}
      title={`${studentName} 학생 기록 일지`}
      navigation={
        isTeacher ? (
          <ConsultationTabNav
            activeTab="list"
            onTabChange={handleTabChange}
          />
        ) : undefined
      }
    >
      <ConsultationListContent
        items={accItems}
        hasMore={hasMore}
        onLoadMore={() => setPage((p) => p + 1)}
        onSelectItem={(id) => {
          setSelectedId(Number(id));
          setView('detail');
        }}
      />
    </ConsultationDialogLayout>
  );
};
