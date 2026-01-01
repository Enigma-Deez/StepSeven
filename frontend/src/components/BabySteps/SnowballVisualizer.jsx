import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';
import './SnowballVisualizer.css';

const SnowballVisualizer = ({ debts }) => {
  const { formatMoney, fromSubunits } = useCurrency();

  const chartData = debts
    .filter(debt => !debt.isPaidOff)
    .map(debt => ({
      name: debt.name,
      balance: fromSubunits(debt.currentBalance),
      order: debt.order,
      fullData: debt
    }));

  const COLORS = ['#FF6B6B', '#FFA07A', '#FFD700', '#98D8C8', '#6BCF7F'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload.fullData;
      return (
        <div className="snowball-tooltip">
          <h4>{data.name}</h4>
          <p>Balance: {formatMoney(data.currentBalance)}</p>
          <p>Min Payment: {formatMoney(data.minimumPayment)}</p>
          <p>Attack Order: #{data.order}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="snowball-visualizer">
      <div className="visualizer-header">
        <h2>🔥 Your Debt Snowball</h2>
        <p>Attack debts from smallest to largest - build momentum!</p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="balance" name="Balance" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="snowball-strategy">
        <h3>Your Attack Plan:</h3>
        <ol>
          {debts.filter(d => !d.isPaidOff).map(debt => (
            <li key={debt.accountId} className={debt.order === 1 ? 'target-debt' : ''}>
              <strong>{debt.name}</strong>: {formatMoney(debt.currentBalance)}
              {debt.order === 1 && <span className="target-badge">← Attack This First!</span>}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default SnowballVisualizer;