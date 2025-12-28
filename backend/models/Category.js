const mongoose = require('mongoose');
const express = require('express');
const CategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  type: {
    type: String,
    required: [true, 'Category type is required'],
    enum: {
      values: ['INCOME', 'EXPENSE'],
      message: 'Type must be INCOME or EXPENSE'
    },
    uppercase: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  icon: {
    type: String,
    default: '📊'
  },
  color: {
    type: String,
    default: '#3B82F6',
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: 'Color must be a valid hex code'
    }
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
CategorySchema.index({ user: 1, type: 1, isActive: 1 });
CategorySchema.index({ user: 1, parent: 1 });
CategorySchema.index({ user: 1, name: 1 });

// Update timestamp
CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent circular parent references
CategorySchema.pre('save', async function(next) {
  if (this.parent && this.parent.equals(this._id)) {
    return next(new Error('Category cannot be its own parent'));
  }
  
  // Check for circular reference chain
  if (this.parent && this.isModified('parent')) {
    let currentParentId = this.parent;
    const visited = new Set([this._id.toString()]);
    
    while (currentParentId) {
      const parentIdStr = currentParentId.toString();
      
      if (visited.has(parentIdStr)) {
        return next(new Error('Circular parent reference detected'));
      }
      
      visited.add(parentIdStr);
      
      const parent = await this.constructor.findById(currentParentId);
      if (!parent) break;
      
      currentParentId = parent.parent;
    }
  }
  
  next();
});

module.exports = mongoose.model('Category', CategorySchema);