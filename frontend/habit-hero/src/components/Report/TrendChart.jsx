import React, { useMemo } from 'react';
import './TrendChart.css';

const TrendChart = ({ trendData, startDate }) => {
  const chartData = useMemo(() => {
    if (!trendData || trendData.length === 0) {
      // Generate mock trend data with real dates if not provided
      const dates = [];
      const start = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        dates.push({
          date: dateStr,
          displayDate: monthDay,
          day: dayName,
          completion: 60 + Math.random() * 35
        });
      }
      return dates;
    }
    
    // Map provided data to include dates
    return trendData.map(data => {
    const date = new Date(data.date);
    const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      ...data,
      date: data.date || new Date().toISOString().split('T')[0],
      displayDate: monthDay,
      day: data.day || date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  });
}, [trendData, startDate]);

  // Create SVG path for trend line
  const createTrendPath = () => {
    const width = 400;
    const height = 200;
    const padding = 30;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    const maxValue = 100;
    const minValue = 0;

    const points = chartData.map((data, index) => {
      const x = padding + (index / (chartData.length - 1)) * graphWidth;
      const y = height - padding - ((data.completion - minValue) / (maxValue - minValue)) * graphHeight;
      return { x, y, ...data };
    });

    const pathData = points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${path} L ${point.x} ${point.y}`;
    }, '');

    return { pathData, points, width, height, padding };
  };

  const { pathData, points, width: svgWidth, height: svgHeight, padding } = createTrendPath();

  // Calculate average completion
  const avgCompletion = Math.round(
    chartData.reduce((sum, data) => sum + data.completion, 0) / chartData.length
  );

  // Get trend direction
  const getTrendDirection = () => {
    if (chartData.length < 2) return 'neutral';
    const firstHalf = chartData.slice(0, Math.ceil(chartData.length / 2))
      .reduce((sum, d) => sum + d.completion, 0) / Math.ceil(chartData.length / 2);
    const secondHalf = chartData.slice(Math.ceil(chartData.length / 2))
      .reduce((sum, d) => sum + d.completion, 0) / (chartData.length - Math.ceil(chartData.length / 2));
    
    if (secondHalf > firstHalf) return 'positive';
    if (secondHalf < firstHalf) return 'negative';
    return 'neutral';
  };

  const trendDirection = getTrendDirection();

  return (
    <div className="trend-chart-container">
      <div className="trend-header">
        <h4>Daily Trend</h4>
        <div className={`trend-indicator ${trendDirection}`}>
          {trendDirection === 'positive' && '📈 Improving'}
          {trendDirection === 'negative' && '📉 Declining'}
          {trendDirection === 'neutral' && '➡️ Stable'}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="trend-chart"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <g className="grid-lines">
          {[0, 25, 50, 75, 100].map((value) => {
            const y = svgHeight - padding - (value / 100) * (svgHeight - 2 * padding);
            return (
              <g key={`grid-${value}`}>
                <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} />
                <text x={padding - 8} y={y + 4} className="grid-label">
                  {value}%
                </text>
              </g>
            );
          })}
        </g>

        {/* Trend line */}
        <path
          d={pathData}
          className="trend-line"
          fill="none"
          stroke="#2196F3"
          strokeWidth="3"
          vectorEffect="non-scaling-stroke"
        />

        {/* Area under curve */}
        <defs>
          <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#2196F3', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#2196F3', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path
          d={`${pathData} L ${svgWidth - padding} ${svgHeight - padding} L ${padding} ${svgHeight - padding} Z`}
          className="trend-area"
          fill="url(#trendGradient)"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={`point-${index}`} className="data-point-group">
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              className="trend-point"
            />
            <text
              x={point.x}
              y={svgHeight - padding + 15}
              textAnchor="middle"
              className="day-label"
            >
              {/* {point.displayDate} */}
            </text>
            <text
              x={point.x}
              y={svgHeight - padding + 30}
              textAnchor="middle"
              className="date-label"
            >
              {point.displayDate}
            </text>
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              className="completion-label"
            >
              {Math.round(point.completion)}%
            </text>
          </g>
        ))}
      </svg>

      <div className="trend-stats">
        <div className="trend-stat-item">
          <span className="stat-label">Average Completion</span>
          <span className="stat-value">{avgCompletion}%</span>
        </div>
        <div className="trend-stat-item">
          <span className="stat-label">Peak Day</span>
          <span className="stat-value">
            {chartData.reduce((max, curr) => 
              curr.completion > max.completion ? curr : max
            ).day}
          </span>
        </div>
        <div className="trend-stat-item">
          <span className="stat-label">Trend</span>
          <span className={`stat-value ${trendDirection}`}>
            {trendDirection === 'positive' && 'Improving'}
            {trendDirection === 'negative' && 'Declining'}
            {trendDirection === 'neutral' && 'Stable'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TrendChart;
