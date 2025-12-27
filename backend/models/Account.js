const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Account name is required'],
    trim: true 
  },
  // High-level accounting type
  type: { 
    type: String, 
    enum: ['ASSET', 'LIABILITY', 'EQUITY'], 
    required: true 
  },
  // Specific type for UI icons and logic
  subType: { 
    type: String, 
    enum: ['CASH', 'BANK', 'CREDIT_CARD', 'LOAN', 'INVESTMENT', 'SAVINGS'], 
    required: true 
  },
  // Always in Kobo (e.g., ₦1,000.00 = 100000)
  balance: { 
    type: Number, 
    default: 0 
  },
  currency: { 
    type: String, 
    default: 'NGN' 
  },
  includeInTotal: { 
    type: Boolean, 
    default: true 
  },
  // Fields for Baby Step 2 (Debt Snowball)
  interestRate: { 
    type: Number, 
    default: 0 
  }, // e.g., 15.5 for 15.5%
  minimumPayment: { 
    type: Number, 
    default: 0 
  }, // in Kobo
  
  // For Sinking Funds logic (Baby Step 3+)
  isSinkingFund: { 
    type: Boolean, 
    default: false 
  },
  targetAmount: { 
    type: Number 
  } // in Kobo
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Naira display (Balance / 100)
accountSchema.virtual('balanceNaira').get(function() {
  return (this.balance / 100).toFixed(2);
});

module.exports = mongoose.model('Account', accountSchema);