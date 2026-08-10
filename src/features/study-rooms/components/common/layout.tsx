import { Pagination } from '@/shared/components/ui/pagination';

export const StudyRoomDetailLayout = ({
  filter,
  children,
  page,
}: {
  filter?: React.ReactNode;
  children: React.ReactNode;
  page: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}) => {
  return (
    <div className="border-line-line1 rounded-card flex flex-col gap-6 border bg-white p-6 px-8">
      <div className="flex flex-col gap-3">
        {filter}
        {children}
      </div>
      {page.totalPages > 0 && (
        <div className="flex justify-center">
          <Pagination {...page} />
        </div>
      )}
    </div>
  );
};
