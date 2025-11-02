import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from '@/lib/local-storage';
import Cookies from 'js-cookie';

export const getLocalSessionToken = () => {
  return getLocalStorage('accessToken');
};

export const saveLocalSessionToken = (token: string) => {
  setLocalStorage('accessToken', token);
};

export const removeLocalSessionToken = () => {
  removeLocalStorage('accessToken');
};

export const getSessionToken = () => {
  return Cookies.get('Authorization');
};

export const saveSessionToken = (token: string) => {
  Cookies.set('Authorization', token, {
    path: '/',
    sameSite: 'strict',
    secure: true,
  });
};

export const removeSessionToken = () => {
  Cookies.remove('Authorization', { path: '/' });
};
