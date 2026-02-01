import { ProfileWithMeta } from '@/entities/profile';

export type ProfileViewerProps =
  | { mode: 'owner' }
  | { mode: 'viewer'; userId: string };

export type ProfileAccessProps = {
  profile: ProfileWithMeta;
  isOwner: boolean;
};
