export type SortKey =
  | 'LATEST_EDITED'
  | 'OLDEST_EDITED'
  | 'TITLE_ASC'
  | 'TAUGHT_AT_ASC';

export type LimitNumber = 20 | 30;

export type QuestionFilter = 'ALL' | 'FEEDBACK_DONE' | 'FEEDBACK_PENDING';

export interface PageableList {
  sortKey: SortKey;
  limit: LimitNumber;
  page: number;
}
