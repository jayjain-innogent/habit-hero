import React from 'react';
import './WeekComparison.css';

const WeekComparison = ({ comparison }) => {
  const getChangeIcon = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };

  const getChangeClass = (value) => {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  };

  const formatChange = (value, suffix = '') => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value}${suffix}`;
  };

  return (
    <div className="week-comparison">
      <h3>Week-over-Week Comparison</h3>
      
      {/*<div className="comparison-grid">*/}
      {/*  <div className="comparison-item">*/}
      {/*    <div className="comparison-icon">*/}
      {/*      {getChangeIcon(comparison.completionsDiff)}*/}
      {/*    </div>*/}
      {/*    <div className="comparison-content">*/}
      {/*      <div className="comparison-label">Completions Change</div>*/}
      {/*      <div className={`comparison-value ${getChangeClass(comparison.completionsDiff)}`}>*/}
      {/*        {formatChange(comparison.completionsDiff)}*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*  <div className="comparison-item">*/}
      {/*    <div className="comparison-icon">*/}
      {/*      {getChangeIcon(comparison.percentageDiff)}*/}
      {/*    </div>*/}
      {/*    <div className="comparison-content">*/}
      {/*      <div className="comparison-label">Percentage Change</div>*/}
      {/*      <div className={`comparison-value ${getChangeClass(comparison.percentageDiff)}`}>*/}
      {/*        {formatChange(comparison.percentageDiff, '%')}*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}

      {/*  <div className="comparison-item">*/}
      {/*    <div className="comparison-icon">*/}
      {/*      {getChangeIcon(-comparison.missedDaysDiff)}*/}
      {/*    </div>*/}
      {/*    <div className="comparison-content">*/}
      {/*      <div className="comparison-label">Missed Days Change</div>*/}
      {/*      <div className={`comparison-value ${getChangeClass(-comparison.missedDaysDiff)}`}>*/}
      {/*        {formatChange(comparison.missedDaysDiff)}*/}
      {/*      </div>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
        {/* Visual Bar Chart */}
        <div className="comparison-chart">
            <div className="chart-item">
                <div className="chart-bar-container">
                    <div
                        className={`chart-bar ${getChangeClass(comparison.completionsDiff)}`}
                        style={{ height: `${Math.max(20, Math.abs(comparison.completionsDiff) * 2)}px` }}
                    >
                        <span className="bar-value">{formatChange(comparison.completionsDiff)}</span>
                    </div>
                </div>
                <div className="chart-label">Completions</div>
            </div>

            <div className="chart-item">
                <div className="chart-bar-container">
                    <div
                        className={`chart-bar ${getChangeClass(comparison.percentageDiff)}`}
                        style={{ height: `${Math.max(20, Math.abs(comparison.percentageDiff) * 2)}px` }}
                    >
                        <span className="bar-value">{formatChange(comparison.percentageDiff, '%')}</span>
                    </div>
                </div>
                <div className="chart-label">Percentage</div>
            </div>

            <div className="chart-item">
                <div className="chart-bar-container">
                    <div
                        className={`chart-bar ${getChangeClass(-comparison.missedDaysDiff)}`}
                        style={{ height: `${Math.max(20, Math.abs(comparison.missedDaysDiff) * 10)}px` }}
                    >
                        <span className="bar-value">{formatChange(comparison.missedDaysDiff)}</span>
                    </div>
                </div>
                <div className="chart-label">Missed Days</div>
            </div>
        </div>

        <div className="comparison-summary">
        {comparison.percentageDiff > 0 ? (
          <p className="summary-positive">
            Great job! You improved by {comparison.percentageDiff}% this week! 🎉
          </p>
        ) : comparison.percentageDiff < 0 ? (
          <p className="summary-negative">
            Your performance decreased by {Math.abs(comparison.percentageDiff)}% this week. Keep pushing! 💪
          </p>
        ) : (
          <p className="summary-neutral">
            Your performance remained consistent this week. 👍
          </p>
        )}
      </div>
    </div>
  );
};

export default WeekComparison;