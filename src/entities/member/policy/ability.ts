import { abilityMatrixByRole } from './rules';

export type Ability = {
  can: (
    action: 'read' | 'create' | 'update' | 'delete',
    resource: 'room' | 'note' | 'comment'
  ) => boolean;
};

export function buildAbility(
  role: 'ROLE_ADMIN' | 'ROLE_PARENT' | 'ROLE_TEACHER' | 'ROLE_STUDENT'
): Ability {
  const table = abilityMatrixByRole[role];

  return {
    can(action, resource) {
      return !!table?.[resource]?.[action];
    },
  };
}
