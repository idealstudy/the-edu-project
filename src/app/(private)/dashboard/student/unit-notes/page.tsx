import type { Metadata } from 'next';

import { UnitNoteLibrary } from '@/features/unit-note/components/unit-note-library';

export const metadata: Metadata = {
  title: '나의 단권화 | 대치동',
  description: '선생님 판서와 내 필기, 관련 오답을 개념별로 쌓는 단권화',
};

const StudentUnitNotesPage = () => <UnitNoteLibrary />;

export default StudentUnitNotesPage;
