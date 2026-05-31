import { dto } from '@/entities/study-note-group/infrastructure';
import { z } from 'zod';

const StudyNoteGroupDomainSchema = z.object({
  id: dto.item.shape.id,
  title: dto.item.shape.title.trim().min(1),
});

export const domain = {
  group: StudyNoteGroupDomainSchema,
};
