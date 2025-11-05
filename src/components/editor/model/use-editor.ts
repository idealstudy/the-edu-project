import { useState } from 'react';

import { initialTextEditorValue } from '@/components/editor/model/initial-state';
import { TextEditorValue } from '@/components/editor/model/types';

export const useTextEditor = (initialValue = initialTextEditorValue) => {
  const [value, setValue] = useState(initialValue);

  const onChange = (value: TextEditorValue) => {
    setValue(value);
  };

  return {
    value,
    onChange,
  };
};
