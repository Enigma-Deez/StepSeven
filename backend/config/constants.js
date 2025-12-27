const CURRENCIES = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    subunitName: 'kobo',
    subunitToUnit: 100,
    locale: 'en-NG'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    subunitName: 'cent',
    subunitToUnit: 100,
    locale: 'en-US'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    subunitName: 'cent',
    subunitToUnit: 100,
    locale: 'en-EU'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    subunitName: 'penny',
    subunitToUnit: 100,
    locale: 'en-GB'
  }
};

const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};

const DATE_FORMATS = {
  DMY: 'DD/MM/YYYY',
  MDY: 'MM/DD/YYYY',
  YMD: 'YYYY-MM-DD'
};

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false
};

const RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5
  },
  WRITE: {
    windowMs: 60 * 1000, // 1 minute
    max: 20
  }
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Not authorized to access this resource',
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  EMAIL_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later'
};

const SUCCESS_MESSAGES = {
  REGISTRATION: 'User registered successfully',
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  ACCOUNT_DELETED: 'Account deleted successfully'
};

// Default user preferences
const DEFAULT_PREFERENCES = {
  theme: THEMES.LIGHT,
  startOfWeek: 1, // Monday
  dateFormat: DATE_FORMATS.DMY,
  language: 'en'
};

// Default currency
const DEFAULT_CURRENCY = CURRENCIES.NGN;

module.exports = {
  CURRENCIES,
  USER_ROLES,
  THEMES,
  DATE_FORMATS,
  PASSWORD_REQUIREMENTS,
  RATE_LIMITS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULT_PREFERENCES,
  DEFAULT_CURRENCY
};