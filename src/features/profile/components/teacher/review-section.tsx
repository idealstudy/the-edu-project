import Image from 'next/image';

import { FrontendTeacherReviewList } from '@/entities/teacher';

export default function ReviewSection({
  reviews,
}: {
  reviews: FrontendTeacherReviewList;
}) {
  return (
    <div className="flex gap-6 overflow-x-auto">
      {reviews.content.map((review) => (
        <div
          key={review.id}
          className="border-gray-3 flex min-w-75 flex-col gap-2 rounded-xl border px-4 py-2.5"
        >
          <div className="flex items-center gap-2">
            <Image
              src={'/character/img_signup_type02.png'}
              alt="프로필"
              width={32}
              height={32}
              className="aspect-square w-8 rounded-full border border-black object-contain"
            />
            <div>
              <p>{review.srcMemberName}</p>
              <p className="text-text-sub1 font-caption-normal">
                {review.startDate} ~ {review.endDate}
              </p>
            </div>
          </div>
          <p className="line-clamp-6">{review.contentPreview}</p>
        </div>
      ))}
    </div>
  );
}
