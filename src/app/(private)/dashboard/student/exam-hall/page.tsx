import { ExamHall } from '@/features/exam/components/exam-hall';

export default function StudentExamHallPage() {
  return (
    // DESIGN.md §4.2: 학생 대시보드 = 표준 셸(max-w-shell, 1200px) 통일.
    <main className="mx-auto w-full max-w-shell p-4">
      <ExamHall />
    </main>
  );
}
