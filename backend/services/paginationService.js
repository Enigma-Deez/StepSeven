const logger = require('../utils/logger');

/**
 * Reusable Pagination Service
 */
class PaginationService {
  /**
   * Paginate a Mongoose query
   * 
   * @param {Query} query - Mongoose query object
   * @param {Number} page - Current page (1-indexed)
   * @param {Number} limit - Items per page (default: 50, max: 100)
   * @returns {Object} - { data, pagination }
   */
  static async paginate(query, page = 1, limit = 50) {
    // Validate and sanitize inputs
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (isNaN(limit) || limit < 1) {
      limit = 50;
    }

    if (limit > 100) {
      limit = 100;
    }

    const skip = (page - 1) * limit;
    
    try {
      // Execute count and find in parallel for performance
      const [total, data] = await Promise.all([
        query.model.countDocuments(query.getFilter()),
        query.skip(skip).limit(limit).exec()
      ]);

      const totalPages = Math.ceil(total / limit);

      const pagination = {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      };

      logger.info(`Pagination: Page ${page}/${totalPages}, Items: ${data.length}/${total}`);

      return {
        success: true,
        data,
        pagination
      };
    } catch (error) {
      logger.error('Pagination error:', error);
      throw error;
    }
  }

  /**
   * Create pagination metadata without executing query
   * Useful for cursor-based pagination
   * 
   * @param {Number} total - Total items
   * @param {Number} page - Current page
   * @param {Number} limit - Items per page
   * @returns {Object} - Pagination metadata
   */
  static createMetadata(total, page = 1, limit = 50) {
    page = parseInt(page);
    limit = parseInt(limit);
    total = parseInt(total);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 50;
    if (limit > 100) limit = 100;
    if (isNaN(total) || total < 0) total = 0;

    const totalPages = Math.ceil(total / limit);

    return {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    };
  }

  /**
   * Validate pagination parameters
   * 
   * @param {Number} page - Page number
   * @param {Number} limit - Items per page
   * @returns {Object} - { valid, page, limit, error }
   */
  static validateParams(page, limit) {
    const result = {
      valid: true,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
      error: null
    };

    if (result.page < 1) {
      result.page = 1;
    }

    if (result.limit < 1) {
      result.limit = 50;
    }

    if (result.limit > 100) {
      result.limit = 100;
    }

    return result;
  }
}

module.exports = PaginationService;