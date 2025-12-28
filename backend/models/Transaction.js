const mongoose = require('mongoose');
const MoneyUtils = require('../utils/moneyUtils');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: {
      values: ['INCOME', 'EXPENSE', 'TRANSFER'],
      message: 'Type must be INCOME, EXPENSE, or TRANSFER'
    },
    uppercase: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    validate: {
      validator: function(value) {
        const validation = MoneyUtils.validate(value);
        return validation.valid;
      },
      message: 'Amount must be a positive integer greater than zero (stored in subunits)'
    }
  },
  // For INCOME and EXPENSE
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  // For TRANSFER
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v);
      },
      message: 'Date must be ISO 8601 format (UTC)'
    },
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringConfig: {
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']
    },
    interval: {
      type: Number,
      min: 1,
      default: 1
    },
    endDate: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v);
        },
        message: 'End date must be ISO 8601 format'
      }
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
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

// Validation: Ensure correct fields based on type
TransactionSchema.pre('save', function(next) {
  if (this.type === 'TRANSFER') {
    if (!this.fromAccount || !this.toAccount) {
      return next(new Error('Transfer requires fromAccount and toAccount'));
    }
    if (this.fromAccount.equals(this.toAccount)) {
      return next(new Error('Cannot transfer to the same account'));
    }
    // Clear single account fields
    this.account = undefined;
    this.category = undefined;
  } else {
    if (!this.account || !this.category) {
      return next(new Error(`${this.type} requires account and category`));
    }
    // Clear transfer fields
    this.fromAccount = undefined;
    this.toAccount = undefined;
  }
  next();
});

// Compound indexes for efficient queries
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1, date: -1 });
TransactionSchema.index({ user: 1, category: 1, date: -1 });
TransactionSchema.index({ user: 1, account: 1, date: -1 });
TransactionSchema.index({ user: 1, fromAccount: 1, date: -1 });
TransactionSchema.index({ user: 1, toAccount: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);