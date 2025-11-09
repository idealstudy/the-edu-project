export type Resource = 'room' | 'note' | 'comment';
export type Action = 'read' | 'create' | 'update' | 'delete';

type Matrix = Record<Resource, Partial<Record<Action, boolean>>>;

export const abilityMatrixByRole: Record<
  'ROLE_ADMIN' | 'ROLE_PARENT' | 'ROLE_TEACHER' | 'ROLE_STUDENT',
  Matrix
> = {
  ROLE_ADMIN: {
    room: { read: true, create: true, update: true, delete: true },
    note: { read: true, create: true, update: true, delete: true },
    comment: { read: true, create: true, update: true, delete: true },
  },
  ROLE_TEACHER: {
    room: { read: true, create: true, update: true, delete: false },
    note: { read: true, create: true, update: true, delete: false },
    comment: { read: true, create: true, update: true, delete: false },
  },
  ROLE_STUDENT: {
    room: { read: true, create: false, update: false, delete: false },
    note: { read: true, create: false, update: false, delete: false },
    comment: { read: true, create: true, update: true, delete: false },
  },
  ROLE_PARENT: {
    room: { read: true, create: false, update: false, delete: false },
    note: { read: true, create: false, update: false, delete: false },
    comment: { read: true, create: true, update: false, delete: false },
  },
};
