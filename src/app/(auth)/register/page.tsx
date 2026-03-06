import PageViewTracker from '@/app/(private)/study-rooms/[id]/note/[noteId]/page-view-tracker';
import { RegisterFunnel } from '@/features/auth/components/register-funnel';

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-[570px] px-4 pb-[180px]">
      <PageViewTracker pageName="auth_signup" />
      <RegisterFunnel />
    </main>
  );
}
