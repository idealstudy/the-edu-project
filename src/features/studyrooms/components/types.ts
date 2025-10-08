export interface StudyNoteGroup {
  id: number;
  title: string;
}

export interface CreateStepForm {
  onNext: () => void;
  disabled: boolean;
}
