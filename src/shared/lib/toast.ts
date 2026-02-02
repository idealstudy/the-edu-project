import { toast } from 'react-toastify';

const shownErrors = new Set<string>();

export const ShowErrorToast = (key: string, message: string) => {
  if (shownErrors.has(key)) return;

  shownErrors.add(key);
  toast.error(message);

  setTimeout(() => {
    shownErrors.delete(key);
  }, 3000);
};
