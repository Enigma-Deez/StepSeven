class MoneyUtils {
  /**
   * Convert amount to subunits (e.g., Naira to kobo)
   * @param {Number} amount - Amount in main unit
   * @param {Number} subunitToUnit - Conversion rate (default: 100)
   * @returns {Number} - Amount in subunits
   */
  static toSubunits(amount, subunitToUnit = 100) {
    return Math.round(amount * subunitToUnit);
  }

  /**
   * Convert subunits to main unit (e.g., kobo to Naira)
   */
  static fromSubunits(amount, subunitToUnit = 100) {
    return amount / subunitToUnit;
  }

  /**
   * Format money for display
   * @param {Number} amount - Amount in subunits
   * @param {String} symbol - Currency symbol
   * @param {Number} subunitToUnit - Conversion rate
   * @returns {String} - Formatted string (e.g., "₦1,234.56")
   */
  static format(amount, symbol = '₦', subunitToUnit = 100) {
    const mainUnit = this.fromSubunits(amount, subunitToUnit);
    return `${symbol}${mainUnit.toLocaleString('en-NG', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  /**
   * Safely add two amounts (avoiding floating point errors)
   */
  static add(amount1, amount2) {
    return amount1 + amount2;
  }

  /**
   * Safely subtract two amounts
   */
  static subtract(amount1, amount2) {
    return amount1 - amount2;
  }
}

module.exports = MoneyUtils;