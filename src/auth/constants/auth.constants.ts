export const AUTH_BCRYPT_SALT_ROUNDS = 10;
export const AUTH_RESET_TOKEN_BYTES = 32;
export const AUTH_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const AUTH_PASSWORD_PATTERN_MESSAGE =
  'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number';
export const AUTH_JWT_DEFAULT_EXPIRES_IN = '7d';
export const AUTH_GENERIC_FORGOT_PASSWORD_MESSAGE =
  'If an account with that email exists, a reset link has been sent.';
