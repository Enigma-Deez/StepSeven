const mongoose = require('mongoose');
const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'Budget amount must be a positive integer (stored in subunits)'
    }
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    enum: {
      values: ['WEEKLY', 'MONTHLY'],
      message: 'Period must be WEEKLY or MONTHLY'
    },
    uppercase: true
  },
  periodKey: {
    type: String,
    required: [true, 'Period key is required'],
    index: true
  },
  carryOver: {
    enabled: {
      type: Boolean,
      default: true
    },
    amount: {
      type: Number,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Carry over amount must be an integer'
      }
    }
  },
  spent: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Spent amount must be an integer'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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

// Unique budget per category per period
BudgetSchema.index({ user: 1, category: 1, periodKey: 1 }, { unique: true });
BudgetSchema.index({ user: 1, periodKey: 1 });

module.exports = mongoose.model('Budget', BudgetSchema);