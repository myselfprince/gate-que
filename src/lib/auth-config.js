export const SESSION_COOKIE = 'gate_pyq_session';

export const isAuthRequired = () => {
  if (process.env.AUTH_REQUIRED === 'true') return true;
  if (process.env.AUTH_REQUIRED === 'false') return false;
  return process.env.NODE_ENV === 'production';
};
