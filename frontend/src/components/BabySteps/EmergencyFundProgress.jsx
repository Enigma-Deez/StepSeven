import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import './EmergencyFundProgress.css';

const EmergencyFundProgress = ({ step, data }) => {
  const { formatMoney } = useCurrency();

  const progressPercent = data.targetAmount > 0 
    ? (data.currentAmount / data.targetAmount) * 100 
    : 0;

  const remaining = data.targetAmount - data.currentAmount;

  return (
    <div className="emergency-fund-progress">
      <div className="fund-header">
        <h2>
          {step === 1 ? '🛡️ Starter Emergency Fund' : '💰 Full Emergency Fund'}
        </h2>
        <p>
          {step === 1 
            ? 'Your first ₦1,000 to stop the panic'
            : `${data.monthsOfExpenses} months of expenses for complete security`
          }
        </p>
      </div>

      <div className="fund-visual">
        <div className="fund-jar">
          <div 
            className="fund-fill"
            style={{ height: `${Math.min(progressPercent, 100)}%` }}
          >
            <div className="fund-amount">{formatMoney(data.currentAmount)}</div>
          </div>
        </div>
        
        <div className="fund-stats">
          <div className="stat">
            <label>Current</label>
            <strong>{formatMoney(data.currentAmount)}</strong>
          </div>
          <div className="stat">
            <label>Target</label>
            <strong>{formatMoney(data.targetAmount)}</strong>
          </div>
          <div className="stat">
            <label>Remaining</label>
            <strong className="remaining">{formatMoney(remaining)}</strong>
          </div>
        </div>
      </div>

      <div className="progress-bar-large">
        <div 
          className="progress-fill-large"
          style={{ width: `${Math.min(progressPercent, 100)}%` }}
        />
      </div>
      <p className="progress-text-large">
        {progressPercent.toFixed(1)}% Complete
      </p>

      {progressPercent >= 100 && (
        <div className="celebration">
          🎉 Congratulations! You've completed Baby Step {step}!
        </div>
      )}
    </div>
  );
};

export default EmergencyFundProgress;