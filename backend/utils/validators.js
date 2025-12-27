const { PASSWORD_REQUIREMENTS } = require('../config/constants');

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
    };
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one number'
    };
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      message: 'Password must contain at least one special character'
    };
  }

  return {
    valid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Validate currency code
 */
const isValidCurrencyCode = (code) => {
  const validCodes = ['NGN', 'USD', 'EUR', 'GBP'];
  return validCodes.includes(code.toUpperCase());
};

/**
 * Validate date format
 */
const isValidDateFormat = (format) => {
  const validFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
  return validFormats.includes(format);
};

/**
 * Validate theme
 */
const isValidTheme = (theme) => {
  const validThemes = ['light', 'dark'];
  return validThemes.includes(theme);
};

/**
 * Sanitize string input
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate phone number (Nigerian format)
 */
const isValidNigerianPhone = (phone) => {
  const phoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate amount (must be positive integer in subunits)
 */
const isValidAmount = (amount) => {
  return Number.isInteger(amount) && amount > 0;
};

/**
 * Validate pagination parameters
 */
const validatePaginationParams = (page, limit) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return {
      valid: false,
      message: 'Page must be a positive integer'
    };
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return {
      valid: false,
      message: 'Limit must be between 1 and 100'
    };
  }

  return {
    valid: true,
    page: parsedPage,
    limit: parsedLimit
  };
};

/**
 * Validate date string (ISO 8601)
 */
const isValidISODate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && dateString === date.toISOString();
};

/**
 * Validate name (alphabetic characters, spaces, hyphens)
 */
const isValidName = (name) => {
  const nameRegex = /^[a-zA-Z\s-']+$/;
  return nameRegex.test(name) && name.length >= 1 && name.length <= 50;
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidObjectId,
  isValidCurrencyCode,
  isValidDateFormat,
  isValidTheme,
  sanitizeString,
  isValidNigerianPhone,
  isValidAmount,
  validatePaginationParams,
  isValidISODate,
  isValidName
};