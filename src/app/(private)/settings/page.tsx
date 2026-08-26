import AccountSettings from '@/features/settings/components/account-settings';
import NotificationSettings from '@/features/settings/components/notification-settings';
import { PageLayout } from '@/layout';

export default function SettingsPage() {
  return (
    <PageLayout width="content">
      <PageLayout.Content className="gap-block-gap">
        {/* 알림 설정 */}
        <NotificationSettings />
        {/* 계정 설정 - 탈퇴 */}
        <AccountSettings />
      </PageLayout.Content>
    </PageLayout>
  );
}
