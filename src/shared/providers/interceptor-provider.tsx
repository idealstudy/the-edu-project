'use client';

import * as React from 'react';

import { initHttp } from '@/app/bootstrap';

export const InterceptorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  React.useEffect(() => {
    initHttp();
  }, []);
  return <>{children}</>;
};
