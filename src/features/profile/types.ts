import { ProfileWithMeta } from '@/entities/profile';

export type ProfileAccessProps = {
  profile: ProfileWithMeta;
  isOwner: boolean;
};
