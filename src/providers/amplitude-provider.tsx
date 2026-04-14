'use client';

import { useEffect } from 'react';

import { useSession } from '@/providers/session/session-context';
import {
  initAmplitude,
  resetAmplitudeUser,
  setAmplitudeUser,
  setAmplitudeUserProperties,
} from '@/shared/lib/amplitude';
import { getGaUserType } from '@/shared/lib/gtm';

export const AmplitudeProvider = () => {
  const { member, status } = useSession();

  useEffect(() => {
    initAmplitude();
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && member) {
      setAmplitudeUser(String(member.id));
      setAmplitudeUserProperties({
        user_type: getGaUserType(member.role),
      });
    } else if (status === 'unauthenticated' || status === 'error') {
      resetAmplitudeUser();
    }
  }, [status, member]);

  return null;
};
