const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['INCOME', 'EXPENSE', 'TRANSFER'], 
    required: true 
  },
  amount: { type: Number, required: true }, // Stored in Kobo
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  
  // For Transfers
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  
  // Linked to Category Model
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, 
  
  description: { type: String, trim: true },
  notes: { type: String, trim: true },
  tags: [{ type: String }],
  date: { type: Date, default: Date.now },
  cleared: { type: Boolean, default: true }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Naira display
transactionSchema.virtual('amountNaira').get(function() {
  return (this.amount / 100).toFixed(2);
});

module.exports = mongoose.model('Transaction', transactionSchema);