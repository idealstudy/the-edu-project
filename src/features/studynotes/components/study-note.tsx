// 'use client';
//
// import { useState } from 'react';
//
// import QuestionListWrapper from '@/features/qna/components/detail/qna-list-wrapper';
// import { useRole } from '@/hooks/use-role';
// import StudyNoteMemberPage from '@/app/(dashboard)/studyrooms/[id]/(study-note)/member/page';
// import { StudyNoteTab } from '@/features/studynotes/components/study-note-tab';
// import { TAB, TabValue } from '@/features/studyrooms/components/common/constants/tabs';
// import { StudyNotes } from '@/features/studyrooms/components/studynotes';
//
// type Props = {
//   studyRoomId: number;
// };
//
// export function StudyNote({ studyRoomId }: Props) {
//   const { role } = useRole();
//   const [selectedGroupId, setSelectedGroupId] = useState<number | 'all'>('all');
//
//   const [tab, setTab] = useState<TabValue>(TAB.NOTES);
//   const onTabChange = (v: string) => setTab(v as TabValue);
//
//   const handleSelectGroupId = (id: number | 'all') => {
//     setSelectedGroupId(id);
//   };
//
//   return (
//     <>
//       {tab === TAB.NOTES && <StudyNotes selectedGroupId={selectedGroupId} />}
//       {tab === TAB.STUDENTS && <StudyNoteMemberPage/>}
//       {tab === TAB.QUESTIONS && role === 'ROLE_STUDENT' && (
//         <QuestionListWrapper
//           hasBorder={true}
//           studyRoomId={studyRoomId}
//         />
//       )}
//     </>
//   );
// }
