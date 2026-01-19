import { useState } from 'react';

import { initialTextEditorValue } from '@/shared/components/editor/model/initial-state';
import { TextEditorValue } from '@/shared/components/editor/types';

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
