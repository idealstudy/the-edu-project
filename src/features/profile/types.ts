export type ProfileViewerProps =
  | { mode: 'owner' }
  | { mode: 'viewer'; userId: string };

export type Profile = {
  id: string;
  role: string;
  name: string;
  email: string;
  profileImg?: string;
  intro: string;
};

export type ProfileAccessProps = {
  profile: Profile;
  isOwner: boolean;
};
