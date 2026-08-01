import {
  dto,
  payload,
} from '@/entities/unit-note/infrastructure/unit-note.dto';
import { z } from 'zod';

export type UnitNoteLibrary = z.infer<typeof dto.library>;
export type UnitNoteNode = UnitNoteLibrary['nodes'][number];
export type UnitNoteDetail = NonNullable<UnitNoteLibrary['detail']>;
export type UnitNotePage = UnitNoteDetail['pages'][number];
export type UnitNoteTeachingLayer = UnitNoteDetail['teachingLayers'][number];
export type UnitNoteProblem = UnitNoteDetail['relatedProblems'][number];
export type AppendUnitNotePagesPayload = z.infer<typeof payload.append>;
export type UpdateUnitNotePagePayload = z.infer<typeof payload.update>;

export type UnitNoteUploadResult = {
  mediaId: string;
  fileName: string;
  sizeBytes: number;
};
