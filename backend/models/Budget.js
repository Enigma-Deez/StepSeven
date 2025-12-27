const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  amountLimit: { type: Number, required: true }, // Stored in Kobo
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  carryOver: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);