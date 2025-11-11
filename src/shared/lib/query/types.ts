export type BaseQueryOptions = {
  staleTime?: number;
  gcTime?: number;
  retry?: number | boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean | 'always';
};
