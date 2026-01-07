'use client';

// Session2: 공지사항 바
export function Session2() {
  const notices = [{ date: '2025.11.01', text: '강사 전환 안내' }];

  return (
    <section className="w-full bg-gray-50 px-4 py-3 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <span className="text-sm font-semibold text-gray-700 md:text-base">
          공지사항
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="animate-scroll flex gap-6">
            {notices.map((notice, index) => (
              <div
                key={index}
                className="flex shrink-0 gap-4 text-sm text-gray-600 md:text-base"
              >
                <span className="font-medium">{notice.date}</span>
                <span>{notice.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
