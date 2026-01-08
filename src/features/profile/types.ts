import { FrontendProfile, ProfileRole } from '@/entities/profile';

export type ProfileViewerProps =
  | { mode: 'owner' }
  | { mode: 'viewer'; userId: string };

export type ProfileData = FrontendProfile & {
  id: string;
  role: ProfileRole;
};

export type ProfileAccessProps = {
  profile: ProfileData;
  isOwner: boolean;
};
