const { CURRENCIES } = require('../config/constants');

class CurrencyService {
  /**
   * Get currency info by code
   */
  static getCurrency(code) {
    return CURRENCIES[code.toUpperCase()] || CURRENCIES.NGN;
  }

  /**
   * Convert between currencies (placeholder for future API integration)
   */
  static convert(amount, fromCurrency, toCurrency) {
    // TODO: Integrate with exchange rate API
    // For now, return same amount
    logger.warn('Currency conversion not yet implemented');
    return amount;
  }

  /**
   * Format amount with currency
   */
  static formatAmount(amount, currencyCode) {
    const currency = this.getCurrency(currencyCode);
    const MoneyUtils = require('../utils/moneyUtils');
    
    return MoneyUtils.format(
      amount,
      currency.symbol,
      currency.subunitToUnit,
      currency.locale
    );
  }
}

module.exports = CurrencyService;