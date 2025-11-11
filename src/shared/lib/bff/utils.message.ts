export const extractErrorMessage = (payload: unknown): string | undefined => {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    return (payload as { message: string }).message;
  }

  return undefined;
};
