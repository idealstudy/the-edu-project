export const shouldShowMobileDiscoveryLinks = (role?: string | null) =>
  role !== 'ROLE_STUDENT' && role !== 'ROLE_TEACHER' && role !== 'ROLE_PARENT';
