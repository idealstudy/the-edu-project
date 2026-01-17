import { createContext } from 'react';

export type StudyNoteGroupContextValue = {
  selectedGroupId: number | 'all';
  setSelectedGroupId: (id: number | 'all') => void;
};

export const StudyNoteGroupContext =
  createContext<StudyNoteGroupContextValue | null>(null);
