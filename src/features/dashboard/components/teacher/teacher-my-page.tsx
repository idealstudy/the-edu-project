'use client';

export const TeacherMyPage = ({ memberName }: { memberName: string }) => (
  <div className="min-h-screen w-full bg-[#f6f7f9]">
    <header className="border-b border-[#e3e5e8] bg-white px-8 py-4"><h1 className="text-lg font-extrabold">마이페이지</h1></header>
    <main className="mx-auto grid w-full max-w-[1120px] gap-4 px-6 py-6 lg:grid-cols-2" data-testid="teacher-my-page">
      <div className="space-y-4">
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5"><div className="mb-4 flex items-center"><h2 className="font-extrabold">내 정보</h2><button className="ml-auto rounded-md border px-2 py-1 text-xs font-bold">수정</button></div><dl className="grid grid-cols-[80px_1fr] gap-y-3 text-sm"><dt className="text-[#747980]">이름</dt><dd className="font-bold">{memberName}</dd><dt className="text-[#747980]">과목</dt><dd className="font-bold">수학</dd><dt className="text-[#747980]">대상</dt><dd className="font-bold">중3 ~ 고3</dd></dl></section>
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5"><div className="mb-3"><h2 className="font-extrabold">학생 초대 코드</h2><p className="text-xs text-[#747980]">학생이 이 코드를 넣으면 스터디룸이 자동으로 생깁니다</p></div><div className="rounded-lg border border-dashed border-[#e1aa8d] p-4 text-center text-xl font-extrabold tracking-[.12em] text-[#9a441f]">초대 코드 발행</div><div className="mt-3 grid grid-cols-2 gap-2"><button className="rounded-md border py-2 text-xs font-bold">코드 복사</button><button className="rounded-md border py-2 text-xs font-bold">링크로 보내기</button></div></section>
      </div>
      <div className="space-y-4">
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5"><div className="mb-3"><h2 className="font-extrabold">알림</h2><p className="text-xs text-[#747980]">받을 것만 켜 둡니다</p></div><Setting label="학생이 질문을 남겼을 때" detail="즉시" enabled /><Setting label="오답이 3일 넘게 방치될 때" detail="하루 한 번 모아서" enabled /><Setting label="학생이 시험을 제출했을 때" detail="즉시" /></section>
        <section className="rounded-xl border border-[#e3e5e8] bg-white p-5"><div className="mb-3 flex items-center"><h2 className="font-extrabold">이번 주 사용 시간</h2><span className="ml-auto text-xs text-[#747980]">목표 주당 30분</span></div><b className="text-2xl">0분</b><div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee]"><i className="block h-full w-0 bg-[#f26a2e]" /></div><p className="mt-3 text-xs text-[#747980]">스터디룸 안에서 손볼 것을 카드 단위로 닫는 구조라 시간을 아낄 수 있습니다.</p></section>
      </div>
    </main>
  </div>
);

const Setting = ({ label, detail, enabled = false }: { label: string; detail: string; enabled?: boolean }) => <div className="flex items-center border-t border-[#eee] py-3 first:border-t-0"><div><b className="block text-sm">{label}</b><small className="text-[#747980]">{detail}</small></div><button className={`ml-auto rounded-md border px-2 py-1 text-xs font-bold ${enabled ? 'border-[#e1aa8d] text-[#9a441f]' : ''}`}>{enabled ? '켜짐' : '꺼짐'}</button></div>;
