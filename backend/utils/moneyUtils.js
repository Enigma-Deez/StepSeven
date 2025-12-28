/**
 * Money Utilities for Subunit Handling
 * CRITICAL: All money is stored as integers in subunits (e.g., kobo for NGN)
 * This prevents floating-point arithmetic errors
 */
class MoneyUtils {
  /**
   * Convert amount from main unit to subunits
   * Example: 10.50 Naira → 1050 kobo
   * 
   * @param {Number} amount - Amount in main unit (e.g., Naira)
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @returns {Number} - Amount in subunits (e.g., kobo)
   */
  static toSubunits(amount, subunitToUnit = 100) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }

    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    // Round to avoid floating point issues
    const result = Math.round(amount * subunitToUnit);

    if (!Number.isInteger(result)) {
      throw new Error('Conversion resulted in non-integer value');
    }

    return result;
  }

  /**
   * Convert amount from subunits to main unit
   * Example: 1050 kobo → 10.50 Naira
   * 
   * @param {Number} amount - Amount in subunits (e.g., kobo)
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @returns {Number} - Amount in main unit (e.g., Naira)
   */
  static fromSubunits(amount, subunitToUnit = 100) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    if (amount < 0) {
      throw new Error('Amount cannot be negative');
    }

    return amount / subunitToUnit;
  }

  /**
   * Format money for display
   * Example: 105050 kobo → "₦1,050.50"
   * 
   * @param {Number} amount - Amount in subunits
   * @param {String} symbol - Currency symbol (default: '₦')
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @param {String} locale - Locale for formatting (default: 'en-NG')
   * @returns {String} - Formatted string
   */
  static format(amount, symbol = '₦', subunitToUnit = 100, locale = 'en-NG') {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    const mainUnit = this.fromSubunits(amount, subunitToUnit);
    
    const formatted = mainUnit.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Format money without currency symbol
   * Example: 105050 kobo → "1,050.50"
   * 
   * @param {Number} amount - Amount in subunits
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @param {String} locale - Locale for formatting (default: 'en-NG')
   * @returns {String} - Formatted string without symbol
   */
  static formatWithoutSymbol(amount, subunitToUnit = 100, locale = 'en-NG') {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    const mainUnit = this.fromSubunits(amount, subunitToUnit);
    
    return mainUnit.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Safely add two amounts
   * Prevents floating-point errors
   * 
   * @param {Number} amount1 - First amount in subunits
   * @param {Number} amount2 - Second amount in subunits
   * @returns {Number} - Sum in subunits
   */
  static add(amount1, amount2) {
    if (!Number.isInteger(amount1) || !Number.isInteger(amount2)) {
      throw new Error('Both amounts must be integers');
    }

    return amount1 + amount2;
  }

  /**
   * Safely subtract two amounts
   * 
   * @param {Number} amount1 - First amount in subunits
   * @param {Number} amount2 - Second amount in subunits
   * @returns {Number} - Difference in subunits
   */
  static subtract(amount1, amount2) {
    if (!Number.isInteger(amount1) || !Number.isInteger(amount2)) {
      throw new Error('Both amounts must be integers');
    }

    return amount1 - amount2;
  }

  /**
   * Multiply amount by a factor
   * Example: Calculate 15% of an amount
   * 
   * @param {Number} amount - Amount in subunits
   * @param {Number} multiplier - Multiplication factor
   * @returns {Number} - Result in subunits
   */
  static multiply(amount, multiplier) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    if (typeof multiplier !== 'number' || isNaN(multiplier)) {
      throw new Error('Multiplier must be a valid number');
    }

    return Math.round(amount * multiplier);
  }

  /**
   * Divide amount by a divisor
   * 
   * @param {Number} amount - Amount in subunits
   * @param {Number} divisor - Division factor
   * @returns {Number} - Result in subunits
   */
  static divide(amount, divisor) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    if (typeof divisor !== 'number' || isNaN(divisor) || divisor === 0) {
      throw new Error('Divisor must be a valid non-zero number');
    }

    return Math.round(amount / divisor);
  }

  /**
   * Calculate percentage of an amount
   * Example: 15% of ₦1,000.00
   * 
   * @param {Number} amount - Amount in subunits
   * @param {Number} percentage - Percentage (0-100)
   * @returns {Number} - Result in subunits
   */
  static percentage(amount, percentage) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    if (typeof percentage !== 'number' || isNaN(percentage)) {
      throw new Error('Percentage must be a valid number');
    }

    return Math.round((amount * percentage) / 100);
  }

  /**
   * Split amount into equal parts
   * Handles rounding by adding remainder to first part
   * 
   * @param {Number} amount - Amount in subunits
   * @param {Number} parts - Number of parts
   * @returns {Array<Number>} - Array of amounts in subunits
   */
  static split(amount, parts) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    if (!Number.isInteger(parts) || parts < 1) {
      throw new Error('Parts must be a positive integer');
    }

    const baseAmount = Math.floor(amount / parts);
    const remainder = amount % parts;

    const result = new Array(parts).fill(baseAmount);
    
    // Add remainder to first part
    if (remainder > 0) {
      result[0] += remainder;
    }

    return result;
  }

  /**
   * Compare two amounts
   * 
   * @param {Number} amount1 - First amount in subunits
   * @param {Number} amount2 - Second amount in subunits
   * @returns {Number} - -1 if amount1 < amount2, 0 if equal, 1 if amount1 > amount2
   */
  static compare(amount1, amount2) {
    if (!Number.isInteger(amount1) || !Number.isInteger(amount2)) {
      throw new Error('Both amounts must be integers');
    }

    if (amount1 < amount2) return -1;
    if (amount1 > amount2) return 1;
    return 0;
  }

  /**
   * Get absolute value
   * 
   * @param {Number} amount - Amount in subunits
   * @returns {Number} - Absolute value in subunits
   */
  static abs(amount) {
    if (!Number.isInteger(amount)) {
      throw new Error('Amount must be an integer');
    }

    return Math.abs(amount);
  }

  /**
   * Check if amount is zero
   * 
   * @param {Number} amount - Amount in subunits
   * @returns {Boolean} - True if amount is zero
   */
  static isZero(amount) {
    return amount === 0;
  }

  /**
   * Check if amount is positive
   * 
   * @param {Number} amount - Amount in subunits
   * @returns {Boolean} - True if amount is positive
   */
  static isPositive(amount) {
    return amount > 0;
  }

  /**
   * Check if amount is negative
   * 
   * @param {Number} amount - Amount in subunits
   * @returns {Boolean} - True if amount is negative
   */
  static isNegative(amount) {
    return amount < 0;
  }

  /**
   * Validate amount
   * 
   * @param {Number} amount - Amount to validate
   * @returns {Object} - { valid, error }
   */
  static validate(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return {
        valid: false,
        error: 'Amount must be a valid number'
      };
    }

    if (!Number.isInteger(amount)) {
      return {
        valid: false,
        error: 'Amount must be an integer (stored in subunits)'
      };
    }

    if (amount < 0) {
      return {
        valid: false,
        error: 'Amount cannot be negative'
      };
    }

    return {
      valid: true,
      error: null
    };
  }

  /**
   * Round to nearest subunit
   * Useful when converting from decimal inputs
   * 
   * @param {Number} amount - Amount (may have decimals)
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @returns {Number} - Rounded amount in subunits
   */
  static round(amount, subunitToUnit = 100) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }

    return Math.round(amount * subunitToUnit);
  }

  /**
   * Parse string input to subunits
   * Handles common formats: "1000", "1,000", "1000.50", "1,000.50"
   * 
   * @param {String} input - String to parse
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @returns {Number} - Amount in subunits
   */
  static parse(input, subunitToUnit = 100) {
    if (typeof input === 'number') {
      return this.toSubunits(input, subunitToUnit);
    }

    if (typeof input !== 'string') {
      throw new Error('Input must be a string or number');
    }

    // Remove currency symbols and spaces
    let cleaned = input.replace(/[₦$€£,\s]/g, '');

    // Parse as float
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
      throw new Error('Invalid amount format');
    }

    return this.toSubunits(parsed, subunitToUnit);
  }
}

module.exports = MoneyUtils;