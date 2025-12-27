const Category = require('../models/Category');

class CategoryController {
  /**
   * Get all categories for the authenticated user
   * GET /api/categories
   */
  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const { type } = req.query;

      const filter = { user: userId, isActive: true };
      if (type) filter.type = type.toUpperCase();

      const categories = await Category.find(filter)
        .populate('parent', 'name')
        .sort({ order: 1, name: 1 });

      // Organize into hierarchy
      const parentCategories = categories.filter(cat => !cat.parent);
      const childCategories = categories.filter(cat => cat.parent);

      const hierarchy = parentCategories.map(parent => ({
        ...parent.toObject(),
        children: childCategories.filter(child => 
          child.parent._id.equals(parent._id)
        )
      }));

      res.json({
        success: true,
        data: categories,
        hierarchy
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get a single category
   * GET /api/categories/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findOne({
        _id: id,
        user: userId
      }).populate('parent');

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Create a new category
   * POST /api/categories
   */
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const categoryData = {
        ...req.body,
        user: userId
      };

      const category = await Category.create(categoryData);

      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update a category
   * PUT /api/categories/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findOneAndUpdate(
        { _id: id, user: userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category,
        message: 'Category updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Delete (soft delete) a category
   * DELETE /api/categories/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const category = await Category.findOne({ _id: id, user: userId });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      category.isActive = false;
      await category.save();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = CategoryController;