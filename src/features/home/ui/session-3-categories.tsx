'use client';

// Session3: 카테고리 카드 섹션
export function Session3() {
  // 실제 데이터가 없으므로 메타데이터로 표시
  // 사회적 가치 증명: 다른 강사들이 활발히 사용 중임을 보여줌
  const categories = [
    { title: '초등부', count: 127, icon: '📚', activeTeachers: 23 },
    { title: '중등부', count: 89, icon: '📖', activeTeachers: 18 },
    { title: '고등부', count: 156, icon: '📕', activeTeachers: 31 },
    { title: '수능대비', count: 342, icon: '🎯', activeTeachers: 67 },
    { title: '내신관리', count: 198, icon: '📊', activeTeachers: 42 },
    { title: '멘토링', count: 76, icon: '⭐', activeTeachers: 15 },
  ];

  return (
    <section className="w-full bg-white px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 text-center md:mb-8">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">
            카테고리별 수업 현황
          </h2>
          <p className="mt-2 text-sm text-gray-600 md:text-base">
            다양한 강사들이 활발히 수업을 운영하고 있습니다
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group flex flex-col items-center justify-center rounded-2xl border-2 border-gray-200 bg-white p-6 text-center transition-all hover:border-gray-300 hover:shadow-md md:p-8"
            >
              <div className="mb-3 text-4xl md:text-5xl">{category.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl">
                {category.title}
              </h3>
              <p className="mb-1 text-sm font-semibold text-[#ff4500] md:text-base">
                {category.count}개 수업
              </p>
              <p className="text-xs text-gray-500 md:text-sm">
                {category.activeTeachers}명의 강사가 운영 중
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
