export type SortKey =
  | 'LATEST_EDITED'
  | 'OLDEST_EDITED'
  | 'TITLE_ASC'
  | 'TAUGHT_AT_ASC';

export type LimitNumber = 20 | 30;

export type QnAFilter = 'ALL' | 'FEEDBACK_DONE' | 'FEEDBACK_PENDING';

export interface TempQnAItem {
  feedback: QnAStatus;
  title: string;
  author: string;
  profile_img: string;
  createdAt: string;
  id: number;
}

export type QnAStatus = 'PENDING' | 'COMPLETED';

export interface QnAListItem {
  id: number;
  title: string;
  status: string;
  content: string;
  viewCount?: number;
  authorName: string;
  regDate: string;
  messages: string[];
}

export interface QuestionDetailResponse {
  id: number;
  title: string;
  status: QnAStatus;
  authorName: string;
  content: string;
  regDate: string;
  messages: string[];
}

export interface QnAListResponse {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  authorName: string;
  regDate: string;
  read: boolean;
}
