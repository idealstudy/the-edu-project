import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F9F9F9] px-5">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold text-orange-600">403</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-950">
          이 화면을 열 권한이 없습니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-gray-600">
          관리자 화면은 관리자 계정으로만 열 수 있습니다.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-orange-600 px-5 text-sm font-semibold text-white"
        >
          내 화면으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
