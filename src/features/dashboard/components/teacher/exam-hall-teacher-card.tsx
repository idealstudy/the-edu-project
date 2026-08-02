'use client';

import { ChangeEvent, useMemo, useState } from 'react';

import { useTeacherDashboardStudyRoomListQuery } from '@/features/dashboard/hooks/use-teacher-dashboard-query';
import {
  useAssignExam,
  useCreateExam,
  useUploadExamPdf,
} from '@/features/exam/hooks/use-exam-mutation';
import { Button, Input, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib';
import { FileCheck2, Upload } from 'lucide-react';

const MAX_PDF_BYTES = 20 * 1024 * 1024;

export const ExamHallTeacherCard = ({ className }: { className?: string }) => {
  const roomsQuery = useTeacherDashboardStudyRoomListQuery();
  const uploadMutation = useUploadExamPdf();
  const createMutation = useCreateExam();
  const assignMutation = useAssignExam();
  const [title, setTitle] = useState('');
  const [examType, setExamType] = useState<'NATIONAL' | 'SCHOOL'>('SCHOOL');
  const [studyRoomId, setStudyRoomId] = useState<string>('');
  const [answerKey, setAnswerKey] = useState('');
  const [treeNodeIds, setTreeNodeIds] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const answers = useMemo(
    () =>
      answerKey
        .split(',')
        .map((answer) => answer.trim())
        .filter(Boolean),
    [answerKey]
  );
  const nodes = useMemo(
    () =>
      treeNodeIds
        .split(',')
        .map((value) => value.trim())
        .map((value) => (value ? Number(value) : null)),
    [treeNodeIds]
  );
  const isPending =
    uploadMutation.isPending ||
    createMutation.isPending ||
    assignMutation.isPending;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    if (!selected) return;
    if (selected.type !== 'application/pdf' || selected.size > MAX_PDF_BYTES) {
      setMessage('20MB 이하 PDF 파일만 올릴 수 있습니다.');
      event.target.value = '';
      setFile(null);
      return;
    }
    setMessage(null);
    setFile(selected);
  };

  const handleCreateAndAssign = async () => {
    setMessage(null);
    if (!file || !title.trim() || !studyRoomId || answers.length === 0) {
      setMessage('시험명·PDF·배정 반·정답표를 모두 입력해주세요.');
      return;
    }
    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      const created = await createMutation.mutateAsync({
        title: title.trim(),
        sourcePdfMediaId: uploaded.mediaId,
        subject: 'MATH',
        examType,
        questions: answers.map((answer, index) => {
          const nodeId = nodes[index];
          return {
            questionNo: index + 1,
            correctAnswer: answer,
            treeNodeId:
              typeof nodeId === 'number' && Number.isSafeInteger(nodeId)
                ? nodeId
                : null,
            prompt: `${index + 1}번 문항`,
          };
        }),
      });
      const assigned = await assignMutation.mutateAsync({
        examId: created.examId,
        input: {
          studyRoomId: Number(studyRoomId),
          excludedStudentIds: [],
          periodStart: new Date().toISOString(),
          periodEnd: null,
        },
      });
      setMessage(`${assigned.assignedStudentCount}명에게 시험을 배정했습니다.`);
      setTitle('');
      setAnswerKey('');
      setTreeNodeIds('');
      setFile(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '시험 생성·배정에 실패했습니다.'
      );
    }
  };

  return (
    <section
      className={cn(
        'bg-gray-white border-gray-4 flex flex-col rounded-xl border p-6',
        className
      )}
      data-testid="teacher-exam-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-body1-heading text-gray-12">시험 열기</h3>
          <p className="font-body2-normal text-gray-8 mt-1">
            PDF 한 번 업로드하고 반 전체에 배정합니다.
          </p>
        </div>
        <Upload
          size={22}
          className="text-orange-7"
          aria-hidden
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Input
          value={title}
          placeholder="시험명"
          aria-label="시험명"
          data-testid="teacher-exam-title"
          onChange={(event) => setTitle(event.target.value)}
        />
        <Select
          value={examType}
          onValueChange={(value) => setExamType(value as 'NATIONAL' | 'SCHOOL')}
        >
          <Select.Trigger
            placeholder="분석 모드"
            data-testid="teacher-exam-type"
          />
          <Select.Content>
            <Select.Option value="SCHOOL">내신 · AI추정 참고용</Select.Option>
            <Select.Option value="NATIONAL">
              전국 · AI 스텁(실데이터 후속)
            </Select.Option>
          </Select.Content>
        </Select>
        <Select
          value={studyRoomId}
          onValueChange={setStudyRoomId}
        >
          <Select.Trigger
            placeholder="배정할 반"
            data-testid="teacher-exam-room"
          />
          <Select.Content>
            {(roomsQuery.data ?? []).map((room) => (
              <Select.Option
                key={room.id}
                value={String(room.id)}
              >
                {room.name}
              </Select.Option>
            ))}
          </Select.Content>
        </Select>
        <label className="border-gray-3 flex min-h-14 cursor-pointer items-center gap-2 rounded-sm border px-5">
          <FileCheck2
            size={18}
            className={file ? 'text-orange-7' : 'text-gray-6'}
            aria-hidden
          />
          <span className="font-body2-normal text-gray-9 min-w-0 truncate">
            {file?.name ?? '시험지 PDF 선택 · 최대 20MB'}
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={handleFile}
            data-testid="teacher-exam-file"
          />
        </label>
      </div>

      <Input
        value={answerKey}
        placeholder="정답표: 2, 4, 1, 3, 5"
        aria-label="쉼표로 구분한 정답표"
        className="mt-3"
        data-testid="teacher-exam-answer-key"
        onChange={(event) => setAnswerKey(event.target.value)}
      />
      <Input
        value={treeNodeIds}
        placeholder="단원 노드 ID(선택): 101, 102, 103"
        aria-label="쉼표로 구분한 단원 노드 ID"
        className="mt-3"
        data-testid="teacher-exam-tree-node-ids"
        onChange={(event) => setTreeNodeIds(event.target.value)}
      />
      <p className="font-caption-normal text-gray-7 mt-2">
        {answers.length}문항 · 전국 모드도 EBSi 데이터가 없으면 AI_STUB 플래그와
        후속 연동 안내를 표시합니다.
      </p>

      {message && (
        <p
          className="font-caption-normal text-gray-9 mt-3"
          role="status"
        >
          {message}
        </p>
      )}
      <Button
        className="mt-4"
        disabled={isPending}
        onClick={handleCreateAndAssign}
        data-testid="teacher-exam-assign-button"
      >
        {isPending ? '시험을 여는 중...' : 'PDF 업로드하고 반에 배정'}
      </Button>
    </section>
  );
};
