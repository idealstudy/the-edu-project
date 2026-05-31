export type ApiResponse<TData> = {
  status: number;
  message: string;
  result: TData;
};

export type CommonResponse<T> = {
  status: number;
  message: string;
  data: T;
};

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  page: number;
  size: number;
  sort: string[];
}

export interface PaginationMeta {
  pageNumber: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PaginationData<T> extends PaginationMeta {
  content: T[];
}
