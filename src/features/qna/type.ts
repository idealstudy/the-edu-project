export type SortKey = 'LATEST' | 'OLDEST' | 'ALPHABETICAL';

export type LimitNumber = 20 | 30;

export type QnAFilter = 'DEFAULT' | 'PENDING' | 'COMPLETED';

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
