import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import './StepCard.css';

const StepCard = ({ step, isCurrent, onRefresh }) => {
  const { formatMoney } = useCurrency();

  const getProgressPercentage = () => {
    if (step.isManual) return step.completed ? 100 : 0;
    if (!step.target || step.target === 0) return 0;
    return Math.min((step.current / step.target) * 100, 100);
  };

  const progressPercent = getProgressPercentage();

  return (
    <div className={`step-card ${isCurrent ? 'current' : ''} ${step.completed ? 'completed' : ''}`}>
      <div className="step-header">
        <div className="step-number">
          {step.completed ? '✓' : step.number}
        </div>
        {isCurrent && <span className="current-badge">Current Step</span>}
      </div>

      <h3 className="step-title">{step.title}</h3>
      <p className="step-description">{step.description}</p>

      {!step.isManual && step.target > 0 && (
        <div className="step-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-text">
            <span>{formatMoney(step.current)}</span>
            <span>{formatMoney(step.target)}</span>
          </div>
          <div className="progress-percent">
            {progressPercent.toFixed(1)}% Complete
          </div>
        </div>
      )}

      {step.completed && (
        <div className="completion-badge">
          Completed {step.completedDate ? `on ${new Date(step.completedDate).toLocaleDateString()}` : ''}
        </div>
      )}
    </div>
  );
};

export default StepCard;