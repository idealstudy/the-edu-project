import { domain, helpers } from '@/entities/level/core';
import {
  type Badge,
  type BadgeConditionType,
  type UserLevel,
} from '@/entities/level/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';

import { dto } from './level.dto';

/* ─────────────────────────────────────────────────────
 * 조건 유형 정규화 (백엔드 string → Domain enum)
 *  - 미정의 유형은 안전하게 FIRST_CORRECT로 본다.
 * ────────────────────────────────────────────────────*/
const KNOWN_CONDITIONS: BadgeConditionType[] = [
  'FIRST_CORRECT',
  'SOLVE_COUNT',
  'STREAK',
  'NODE_MASTERED',
];

const toConditionType = (raw: string): BadgeConditionType => {
  const upper = raw.toUpperCase();
  const matched = KNOWN_CONDITIONS.find((type) => type === upper);
  return matched ?? 'FIRST_CORRECT';
};

/* ─────────────────────────────────────────────────────
 * DTO → UI-ready 뱃지 변환
 *  - conditionLabel(미보유 안내 문구)을 미리 붙인다.
 * ────────────────────────────────────────────────────*/
const toBadge = (raw: unknown): Badge => {
  const parsed = dto.badge.parse(raw);
  const conditionType = toConditionType(parsed.conditionType);

  const validated = domain.badge.parse({
    id: parsed.id,
    code: parsed.code,
    name: parsed.name,
    description: parsed.description,
    conditionType,
    threshold: parsed.threshold,
    icon: parsed.icon,
    earned: parsed.earned,
    earnedAt: parsed.earnedAt,
  });

  return {
    ...validated,
    conditionLabel: helpers.toConditionLabel(conditionType, parsed.threshold),
  };
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 레벨 조회 (없으면 백엔드가 Lv.1 생성 후 반환)
 *  GET /api/common/me/level
 * ────────────────────────────────────────────────────*/
const getMyLevel = async (): Promise<UserLevel> => {
  const response = await api.private.get('/common/me/level');
  return unwrapEnvelope(response, dto.userLevel);
};

/* ─────────────────────────────────────────────────────
 * [READ] 내 뱃지 카탈로그 조회 (보유 + 미보유 전체)
 *  GET /api/common/me/badges
 *  - 보유 뱃지를 앞으로, 그 안에서는 획득 최신순으로 정렬.
 * ────────────────────────────────────────────────────*/
const getMyBadges = async (): Promise<Badge[]> => {
  const response = await api.private.get('/common/me/badges');
  const data = unwrapEnvelope(response, dto.badgeCatalog);

  return data.map(toBadge).sort((a, b) => {
    if (a.earned !== b.earned) return a.earned ? -1 : 1;
    return (b.earnedAt ?? '').localeCompare(a.earnedAt ?? '');
  });
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  getMyLevel,
  getMyBadges,
};
