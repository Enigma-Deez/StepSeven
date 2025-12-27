class PaginationService {
  /**
   * Paginate a Mongoose query
   * @param {Query} query - Mongoose query object
   * @param {Number} page - Current page (1-indexed)
   * @param {Number} limit - Items per page (default: 50)
   * @returns {Object} - { data, pagination }
   */
  static async paginate(query, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    // Execute count and find in parallel
    const [total, data] = await Promise.all([
      query.model.countDocuments(query.getFilter()),
      query.skip(skip).limit(limit).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

module.exports = PaginationService;