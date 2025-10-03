export interface StudyNoteGroup {
  id: number;
  title: string;
}

export interface CreateStepForm {
  onNext: () => void;
  disabled: boolean;
}

export interface StudyRoomFormValues {
  basic: {
    title: string;
    description: string;
    visibility: 'public' | 'private';
  };
  profile: {
    location: 'online' | 'offline';
    classType: 'one_to_one' | 'one_to_many';
    subject: 'ko' | 'en' | 'math' | 'etc';
    school: string;
    grade: string;
  };
  invite: {
    emails: string;
  };
}
