import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import './BudgetCard.css';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const { formatMoney } = useCurrency();

  const percentUsed = parseFloat(budget.percentUsed);
  const isOverBudget = budget.isOverBudget;

  return (
    <div className={`budget-card ${isOverBudget ? 'over-budget' : ''}`}>
      <div className="budget-card-header">
        <div className="category-info">
          <span className="category-icon">{budget.category.icon}</span>
          <h3>{budget.category.name}</h3>
        </div>
        <div className="budget-actions">
          <button onClick={onEdit} className="btn-icon">✏️</button>
          <button onClick={onDelete} className="btn-icon">🗑️</button>
        </div>
      </div>

      <div className="budget-progress">
        <div className="progress-bar">
          <div 
            className={`progress-fill ${isOverBudget ? 'over' : ''}`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <span className="progress-percentage">{percentUsed}%</span>
      </div>

      <div className="budget-amounts">
        <div className="amount-item">
          <span className="amount-label">Budgeted</span>
          <span className="amount-value">{formatMoney(budget.budgeted)}</span>
        </div>
        <div className="amount-item">
          <span className="amount-label">Spent</span>
          <span className={`amount-value ${isOverBudget ? 'over' : ''}`}>
            {formatMoney(budget.spent)}
          </span>
        </div>
        <div className="amount-item">
          <span className="amount-label">Remaining</span>
          <span className={`amount-value ${budget.remaining < 0 ? 'negative' : 'positive'}`}>
            {formatMoney(budget.remaining)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;