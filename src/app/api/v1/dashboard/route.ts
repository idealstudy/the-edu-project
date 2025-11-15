import { NextResponse } from 'next/server';

import { member } from '@/entities/member';
import type { MemberDTO, Role } from '@/entities/member';
import { note } from '@/entities/study-note';
import { room } from '@/entities/study-room';
import { dashboard } from '@/features/dashboard';
import { api } from '@/shared/api/http';
import axios from 'axios';

type DashboardRole = 'teacher' | 'student';
function toDashboardRole(role: Role): DashboardRole | null {
  if (role === 'ROLE_TEACHER') return 'teacher';
  if (role === 'ROLE_STUDENT') return 'student';
  return null;
}

function getEndpoints(role: DashboardRole) {
  if (role === 'teacher')
    return {
      rooms: '/api/teacher/study-rooms',
      notes: '/api/teacher/teaching-notes',
    };
  return {
    rooms: '/api/student/study-rooms',
    notes: '/api/student/teaching-notes',
  };
}

export async function GET() {
  try {
    /* ─────────────────────────────────────────────────────
     * 멤버 정보 조회 + envelope -> DTO 파싱
     * ────────────────────────────────────────────────────*/
    const memberResponse = await api.bff.server.get<MemberDTO>('/members/info');
    const memberEnvelope = member.dto.envelope.parse(memberResponse);
    const memberDTO = memberEnvelope.data;

    /* ─────────────────────────────────────────────────────
     * 대시보드에서 쓸 role로 변환
     * ────────────────────────────────────────────────────*/
    const dashboardRole = toDashboardRole(memberDTO.role);
    if (!dashboardRole) {
      return NextResponse.json(
        { message: 'Forbidden', status: 403 },
        { status: 403 }
      );
    }

    /* ─────────────────────────────────────────────────────
     * 데이터 병렬 조회
     * ────────────────────────────────────────────────────*/
    const endpoints = getEndpoints(dashboardRole);
    const [roomsResponse, notesResponse] = await Promise.all([
      api.bff.server.get(endpoints.rooms, { params: { size: 3 } }),
      api.bff.server.get(endpoints.notes, { params: { size: 3 } }),
    ]);

    /* ─────────────────────────────────────────────────────
     * StudyNote (HTTP -> DTO -> 도메인)
     * ────────────────────────────────────────────────────*/
    const notesEnvelope = note.adapters.listItem.parse(notesResponse);
    const notesDto = notesEnvelope.data;
    const notesDomain = note.factory.fromList(notesDto);

    /* ─────────────────────────────────────────────────────
     * 스터디룸 타입 분기처리(role: teacher)
     * HTTP -> DTO -> 도메인
     * Dashboard 도메인으로 최종 조립 + 검증
     * ────────────────────────────────────────────────────*/
    if (dashboardRole === 'teacher') {
      const roomsEnvelope = room.adapters.teacher.list.parse(roomsResponse);
      const roomsDto = roomsEnvelope.data;
      const teacherRoomsDomain = room.factory.teacher.list(roomsDto);

      const response = dashboard.adapter.fromSources({
        role: 'teacher',
        member: memberDTO,
        rooms: teacherRoomsDomain,
        notes: notesDomain,
      });

      return NextResponse.json({ data: response }, { status: 200 });
    }

    /* ─────────────────────────────────────────────────────
     * 스터디룸 타입 분기처리(role: student)
     * HTTP -> DTO -> 도메인
     * Dashboard 도메인으로 최종 조립 + 검증
     * ────────────────────────────────────────────────────*/
    const roomsEnvelope = room.adapters.student.list.parse(roomsResponse);
    const roomsDto = roomsEnvelope.data;
    const studentRoomsDomain = room.factory.student.list(roomsDto);

    const response = dashboard.adapter.fromSources({
      role: 'student',
      member: memberDTO,
      rooms: studentRoomsDomain,
      notes: notesDomain,
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: unknown) {
    // Axios 에러면 status 분기
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;

      const isAuthError = [401, 403].includes(status);
      const defaultBody = {
        message: 'Failed to load dashboard',
        status,
      };

      // 401 / 403 → 로그인/세션 문제
      if (isAuthError) {
        return NextResponse.json(
          { message: 'Unauthorized', status },
          { status }
        );
      }

      // 나머지
      return NextResponse.json(defaultBody, {
        status,
      });
    }

    // 예측 못 한 에러
    // eslint-disable-next-line
    console.error('[dashboard BFF] unexpected error', error);
    return NextResponse.json(
      { message: 'Internal Server Error', status: 500 },
      { status: 500 }
    );
  }
}
