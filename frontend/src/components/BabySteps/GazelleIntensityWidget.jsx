import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { babyStepAPI } from '../../api/babyStepAPI';
import './GazelleIntensityWidget.css';

const GazelleIntensityWidget = ({ data }) => {
  const { formatMoney } = useCurrency();

  const handleThrowAtDebt = async () => {
    try {
      const smallestDebt = await babyStepAPI.getSmallestDebt();
      if (smallestDebt.data) {
        alert(`Throw ${formatMoney(data.unallocated)} at ${smallestDebt.data.name}!`);
        // Navigate to payment screen or open payment modal
      }
    } catch (error) {
      console.error('Error fetching smallest debt:', error);
    }
  };

  return (
    <div className="gazelle-intensity-widget">
      <div className="widget-icon">🦌</div>
      <div className="widget-content">
        <h3>Gazelle Intensity Alert!</h3>
        <p>You have <strong>{formatMoney(data.unallocated)}</strong> unallocated this month.</p>
        <p className="motivation">Don't let it sit idle - attack your debt!</p>
      </div>
      <button 
        className="btn-primary throw-debt-btn"
        onClick={handleThrowAtDebt}
      >
        Throw at Debt
      </button>
    </div>
  );
};

export default GazelleIntensityWidget;