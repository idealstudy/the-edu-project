import { CourseListClient } from '@/features/course';

export const metadata = {
  title: '코스',
  description: '과목별 코스를 둘러보고 무료 맛보기부터 시작해요.',
};

export default function CoursesPage() {
  return (
    <div className="min-h-screen w-full bg-[#F9F9F9]">
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 md:px-8 lg:px-12">
        <header className="mb-6 flex flex-col gap-1">
          <h1 className="font-title-heading text-text-main text-balance">
            코스
          </h1>
          <p className="font-body2-normal text-text-sub1">
            과목별 코스를 둘러보고, 무료 맛보기 차시부터 시작해요.
          </p>
        </header>

        <CourseListClient />
      </div>
    </div>
  );
}
