import { base } from '@/entities/profile/schema';
import { z } from 'zod';

/* ─────────────────────────────────────────────────────
 * 선생님 도메인 스키마
 * ────────────────────────────────────────────────────*/
const TeacherProfileSchema = base.teacher.transform((profile) => ({
  ...profile,
  description:
    profile.desc === '테스트' ? '간단 소개를 입력해주세요.' : profile.desc,
}));

/* ─────────────────────────────────────────────────────
 * 학생 도메인 스키마
 * ────────────────────────────────────────────────────*/
const StudentProfileSchema = base.student.transform((profile) => ({
  ...profile,
  learningGoal:
    profile.desc === '테스트' ? '학습 목표를 입력해주세요.' : profile.desc,
}));

/* ─────────────────────────────────────────────────────
 * 보호자 도메인 스키마
 * ────────────────────────────────────────────────────*/
const ParentProfileSchema = base.parent.transform((profile) => ({
  ...profile,
}));

/* ─────────────────────────────────────────────────────
 * Union 타입 - 필드 구조로 구분
 * - teacherNoteCount 있으면 선생님
 * - desc만 있고 teacherNoteCount 없으면 학생
 * - name, email만 있으면 보호자
 * ────────────────────────────────────────────────────*/
const ProfileSchema = z.union([
  TeacherProfileSchema,
  StudentProfileSchema,
  ParentProfileSchema,
]);

export const domain = {
  teacher: TeacherProfileSchema,
  student: StudentProfileSchema,
  parent: ParentProfileSchema,
  schema: ProfileSchema,
};
