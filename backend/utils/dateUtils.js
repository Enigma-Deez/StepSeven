class DateUtils {
  /**
   * Get current date in ISO 8601 format (UTC)
   */
  static now() {
    return new Date().toISOString();
  }

  /**
   * Parse ISO 8601 string to Date object
   */
  static parseISO(dateString) {
    return new Date(dateString);
  }

  /**
   * Get start of month
   */
  static startOfMonth(date) {
    const d = new Date(date);
    d.setUTCDate(1);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  /**
   * Get end of month
   */
  static endOfMonth(date) {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(0);
    d.setUTCHours(23, 59, 59, 999);
    return d;
  }

  /**
   * Subtract months from a date
   */
  static subMonths(date, months) {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() - months);
    return d;
  }

  /**
   * Add months to a date
   */
  static addMonths(date, months) {
    const d = new Date(date);
    d.setUTCMonth(d.getUTCMonth() + months);
    return d;
  }

  /**
   * Get period key for monthly budgets (e.g., "2025-01")
   */
  static getMonthlyPeriodKey(date) {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Get period key for weekly budgets (e.g., "2025-W03")
   */
  static getWeeklyPeriodKey(date) {
    const d = new Date(date);
    const year = d.getUTCFullYear();
    const week = this.getWeekNumber(d);
    return `${year}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * Get ISO week number
   */
  static getWeekNumber(date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Format date for display
   */
  static format(date, formatString = 'DD/MM/YYYY') {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();

    if (formatString === 'DD/MM/YYYY') {
      return `${day}/${month}/${year}`;
    } else if (formatString === 'MM/DD/YYYY') {
      return `${month}/${day}/${year}`;
    } else if (formatString === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    }

    return date.toISOString();
  }
}

module.exports = DateUtils;