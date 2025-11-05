import { useMemo } from 'react';

import { StudyNoteSortKey } from '@/features/study-notes/type';
import { StudyNoteMember } from '@/features/study-notes/types';

export const useMemberFilter = (
  members: StudyNoteMember[],
  search: string,
  sort: StudyNoteSortKey
) => {
  return useMemo(() => {
    let filtered = [...members];

    // 검색 필터
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
      );
    }

    // 정렬
    switch (sort) {
      case 'TITLE_ASC':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'OLDEST_EDITED':
        filtered.reverse();
        break;
      case 'TAUGHT_AT_ASC':
      case 'LATEST_EDITED':
      default:
        break;
    }

    return filtered;
  }, [members, search, sort]);
};
