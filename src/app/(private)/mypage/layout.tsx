import ProfileCard from '@/features/profile/components/profile-card';
import { ColumnLayout } from '@/layout';

type LayoutProps = {
  children: React.ReactNode;
};

export default async function MypageLayout({ children }: LayoutProps) {
  return (
    <main className="bg-[#F9F9F9]">
      <ColumnLayout>
        <ColumnLayout.Left>
          <div className="border-line-line1 flex flex-col gap-9 rounded-xl border bg-white p-8">
            <ProfileCard isOwner={true} />
          </div>
        </ColumnLayout.Left>
        <ColumnLayout.Right className="desktop:max-w-[740px] px-8">
          <div>{children}</div>
        </ColumnLayout.Right>
      </ColumnLayout>
    </main>
  );
}
