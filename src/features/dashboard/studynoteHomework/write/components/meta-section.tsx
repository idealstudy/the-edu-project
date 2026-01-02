'use client';

import { HomeworkMetaFields } from './homework-meta-form';
import { NoteMetaFields } from './note-meta-form';

type MetaSectionProps = {
  tab: 'note' | 'homework';
};

const MetaSection = ({ tab }: MetaSectionProps) => {
  return (
    <>
      {tab === 'note' && <NoteMetaFields />}
      {tab === 'homework' && <HomeworkMetaFields />}
    </>
  );
};

export default MetaSection;
