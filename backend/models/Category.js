const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  icon: { type: String, default: 'list' },
  color: { type: String, default: '#2ecc71' },
  isSystem: { type: Boolean, default: false } // For default categories like "Transfer"
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);