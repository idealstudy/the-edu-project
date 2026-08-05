'use client';

import Link from 'next/link';

const actions = [
  { number: '1', title: '개념 노트 넣어주기', subtitle: '내가 정리한 개념을 학생 노트에 한 장으로 얹습니다', destination: '학생 › 단권화 노트 › 과목 › 단원', button: '새 노트 쓰기' },
  { number: '2', title: '할 일 넣어주기', subtitle: '오늘 뭘 할지 학생 목록에 직접 꽂습니다', destination: '학생 › 내 학습 › 오늘 할 일', button: '할 일 쓰기' },
  { number: '3', title: '문제 피드백 달기', subtitle: '틀린 문제 옆에 왜 틀렸는지 써 줍니다', destination: '학생 › 오답 회독', button: '코멘트 쓰기' },
  { number: '4', title: '시험 내주기', subtitle: '매일 하는 일이 아니라 네 번째로 뒀습니다', destination: '학생 › 응시장', button: '시험 열기' },
] as const;

export const LearningManagementTab = () => (
  <div className="space-y-4" data-testid="learning-management-tab">
    <section className="rounded-xl border border-[#e3e5e8] bg-white p-5">
      <h1 className="text-xl font-extrabold leading-7">학생의 학습에<br />무엇을 넣어줄까요</h1>
      <p className="mt-3 text-xs leading-5 text-[#666b72]">이 탭은 학생을 지켜보는 곳이 아니라 <b>학생 화면에 넣어주는 곳</b>입니다. 각 행위가 도착하는 화면을 함께 표시합니다.</p>
      <div className="mt-4 grid grid-cols-3 gap-2"><button className="rounded-lg border p-3 text-left text-xs font-extrabold">＋ 개념 노트<small className="mt-1 block font-normal text-[#747980]">단권화에 넣기</small></button><button className="rounded-lg border p-3 text-left text-xs font-extrabold">＋ 할 일<small className="mt-1 block font-normal text-[#747980]">오늘 할 일에 꽂기</small></button><button className="rounded-lg border p-3 text-left text-xs font-extrabold">＋ 피드백<small className="mt-1 block font-normal text-[#747980]">오답에 코멘트</small></button></div>
    </section>
    {actions.map((action) => (
      <section key={action.number} className="rounded-xl border border-[#e3e5e8] bg-white p-5">
        <div className="grid grid-cols-[36px_1fr_auto] gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-[#fff0e7] text-sm font-extrabold text-[#a4481e]">{action.number}</span><div><h2 className="text-sm font-extrabold">{action.title}</h2><p className="text-xs text-[#747980]">{action.subtitle}</p><p className="mt-3 rounded-md bg-[#faf6f2] px-3 py-2 text-[11px]"><b className="mr-2 text-[#a4481e]">학생 화면 도착지</b>{action.destination}</p></div><Link href={action.number === '4' ? '/dashboard/teacher/exams' : '#'} className="h-fit rounded-md border border-[#e1aa8d] px-3 py-2 text-xs font-bold text-[#9a441f]">{action.button}</Link></div>
      </section>
    ))}
  </div>
);
