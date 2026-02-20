'use client';

import React from 'react';

import { useMemberStore } from '@/store';

import { DashboardStudent } from './student';
import DashboardTeacher from './teacher';

export const DashboardContainer = () => {
  const session = useMemberStore((s) => s.member);
  const role = session?.role;

  switch (role) {
    case 'ROLE_TEACHER':
      return <DashboardTeacher />;
    case 'ROLE_STUDENT':
      return <DashboardStudent />;
    default:
      return null;
  }
};
