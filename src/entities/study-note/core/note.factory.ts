import {
  NoteDetail,
  NoteDomain,
  NoteListItem,
  NoteRequest,
} from '@/entities/study-note';

import { domain } from '../core/note.domain.schema';

/* ─────────────────────────────────────────────────────
 * 수업 노트 생성
 * ────────────────────────────────────────────────────*/
const createNote = (dto: NoteRequest): NoteDomain => {
  return domain.schema.parse(dto);
};

/* ─────────────────────────────────────────────────────
 * 수업 노트 수정
 * ────────────────────────────────────────────────────*/
const fromEditNote = (dto: NoteRequest): NoteDomain => {
  return domain.schema.parse(dto);
};

/* ─────────────────────────────────────────────────────
 * 전체 수업노트조회 응답의 개별 아이템
 * ────────────────────────────────────────────────────*/
const fromNoteListItem = (dto: NoteListItem): NoteDomain => {
  return domain.schema.parse(dto);
};

/* ─────────────────────────────────────────────────────
 * 수업 노트 목록 조회 응답(Pagination 포함)
 * ────────────────────────────────────────────────────*/
const fromNoteList = (dtoList: NoteListItem[]): NoteDomain[] => {
  return dtoList.map((dto) => domain.schema.parse(dto));
};

/* ─────────────────────────────────────────────────────
 * 수업 노트 상세 내용 조회
 * ────────────────────────────────────────────────────*/
const fromNoteDetail = (dto: NoteDetail): NoteDomain => {
  return domain.schema.parse(dto);
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const factory = {
  create: createNote,
  fromEdit: fromEditNote,
  fromListItem: fromNoteListItem,
  fromList: fromNoteList,
  fromDetail: fromNoteDetail,
};
