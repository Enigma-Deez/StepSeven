import React, { useState, useEffect } from 'react';
import { budgetAPI } from '../../api/budgetAPI';
import { categoryAPI } from '../../api/categoryAPI';
import { useCurrency } from '../../context/CurrencyContext';

const BudgetForm = ({ initialData, currentPeriod, onSuccess, onCancel }) => {
  const { toSubunits, fromSubunits } = useCurrency();
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: initialData?.category?._id || '',
    amount: initialData?.amount ? fromSubunits(initialData.amount) : '',
    period: 'MONTHLY',
    periodKey: currentPeriod,
    carryOverEnabled: initialData?.carryOver?.enabled ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll({ type: 'EXPENSE' });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const budgetData = {
        ...formData,
        amount: toSubunits(parseFloat(formData.amount)),
        carryOver: {
          enabled: formData.carryOverEnabled,
          amount: initialData?.carryOver?.amount || 0
        }
      };

      if (initialData) {
        await budgetAPI.update(initialData._id, budgetData);
      } else {
        await budgetAPI.create(budgetData);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="budget-form" onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Budget' : 'New Budget'}</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Category *</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
          className="form-select"
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Budget Amount *</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          step="0.01"
          min="0"
          required
          className="form-input"
          placeholder="0.00"
        />
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={formData.carryOverEnabled}
            onChange={(e) => setFormData({...formData, carryOverEnabled: e.target.checked})}
          />
          Enable carry-over (unused budget rolls to next month)
        </label>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );
};

export default BudgetForm;