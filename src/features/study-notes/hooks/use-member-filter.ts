import { useMemo } from 'react';

import {
  StudyNoteMember,
  StudyNoteSortKey,
} from '@/features/study-notes/model';

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
      case 'LATEST_EDITED':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
        break;
      case 'OLDEST_EDITED':
        filtered.reverse();
        break;
      case 'TITLE_ASC':
      case 'TAUGHT_AT_ASC':
      default:
        break;
    }

    return filtered;
  }, [members, search, sort]);
};
