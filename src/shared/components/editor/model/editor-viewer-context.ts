import { createContext, useContext } from 'react';

type EditorViewerContextValue = {
  onLoginRequired?: () => void;
};

export const EditorViewerContext = createContext<EditorViewerContextValue>({});

export const useEditorViewerContext = () => useContext(EditorViewerContext);
