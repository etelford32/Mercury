/**
 * Time Series Chart Component
 * Visualizes historical SWPC data using Recharts
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SolarWindData, XRayFluxData, MagneticFieldData } from '../../types/swpc.types';
import './TimeSeriesChart.css';

interface TimeSeriesChartProps {
  data: (SolarWindData | XRayFluxData | MagneticFieldData)[];
  dataKey: string;
  title: string;
  unit: string;
  color?: string;
}

export function TimeSeriesChart({ data, dataKey, title, unit, color = '#00ff88' }: TimeSeriesChartProps) {
  const chartData = data.map((item: any) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    value: item[dataKey],
  }));

  return (
    <div className="timeseries-chart">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 255, 0.1)" />
          <XAxis
            dataKey="time"
            stroke="#888"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#888' }}
          />
          <YAxis
            stroke="#888"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#888' }}
            label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#888' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 20, 0.95)',
              border: '1px solid rgba(100, 150, 255, 0.3)',
              borderRadius: '5px',
              color: '#fff',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            name={title}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Multi-line Time Series Chart
 */
interface MultiSeriesChartProps {
  data: any[];
  series: { key: string; name: string; color: string }[];
  title: string;
  unit: string;
}

export function MultiSeriesChart({ data, series, title, unit }: MultiSeriesChartProps) {
  const chartData = data.map((item: any) => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    ...series.reduce((acc, s) => ({ ...acc, [s.key]: item[s.key] }), {}),
  }));

  return (
    <div className="timeseries-chart">
      <h3 className="chart-title">{title}</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 150, 255, 0.1)" />
          <XAxis
            dataKey="time"
            stroke="#888"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#888' }}
          />
          <YAxis
            stroke="#888"
            style={{ fontSize: '10px' }}
            tick={{ fill: '#888' }}
            label={{ value: unit, angle: -90, position: 'insideLeft', fill: '#888' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 20, 0.95)',
              border: '1px solid rgba(100, 150, 255, 0.3)',
              borderRadius: '5px',
              color: '#fff',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              name={s.name}
              animationDuration={500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
