import AccountSettings from '@/features/settings/components/account-settings';
import NotificationSettings from '@/features/settings/components/notification-settings';
import { PageLayout } from '@/layout';

export default function SettingsPage() {
  return (
    // DESIGN.md §4.2: 학생 대시보드 = 표준 셸(max-w-shell, 1200px). content(1100px)는 오적용이었다.
    <div className="mx-auto w-full max-w-shell">
      <PageLayout width="fluid">
        <PageLayout.Content className="gap-block-gap">
          {/* 알림 설정 */}
          <NotificationSettings />
          {/* 계정 설정 - 탈퇴 */}
          <AccountSettings />
        </PageLayout.Content>
      </PageLayout>
    </div>
  );
}
