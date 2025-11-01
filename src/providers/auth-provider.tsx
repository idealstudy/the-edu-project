'use client';

import * as React from 'react';

import { bootstrap } from '@/app/bootstrap';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // const [session, setSession] = React.useState<undefined | null>(null);
  React.useEffect(() => {
    bootstrap();
  }, []);
  return <>{children}</>;
};

export default AuthProvider;
