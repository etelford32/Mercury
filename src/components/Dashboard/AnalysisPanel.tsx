/**
 * Analysis Panel
 * Shows time series charts, correlation matrix, and frequency analysis
 */

import { useEffect, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { TimeSeriesChart, MultiSeriesChart } from '../Charts/TimeSeriesChart';
import { CorrelationMatrix, FrequencyAnalysis } from '../Charts/CorrelationMatrix';
import { Statistics, FFT } from '../../utils/analysis/scientificAnalysis';
import './AnalysisPanel.css';

export function AnalysisPanel() {
  const { showAnalysisPanel, swpcData } = useSimulationStore();
  const [correlationData, setCorrelationData] = useState<{ matrix: number[][]; labels: string[] } | null>(null);
  const [fftData, setFftData] = useState<{ frequencies: number[]; magnitudes: number[] } | null>(null);

  useEffect(() => {
    if (!swpcData) return;

    // Calculate correlation matrix
    const datasets = [
      swpcData.solarWind.map(d => d.speed),
      swpcData.solarWind.map(d => d.density),
      swpcData.magneticField.map(d => d.bz),
      swpcData.xrayFlux.map(d => d.longWavelength * 1e7), // Scale for visibility
      swpcData.geomagneticIndices.map(d => d.kpIndex),
    ];

    const labels = ['SW Speed', 'SW Density', 'IMF Bz', 'X-ray', 'Kp'];

    const matrix = Statistics.correlationMatrix(datasets);
    setCorrelationData({ matrix, labels });

    // Calculate FFT of solar wind speed
    const speeds = swpcData.solarWind.map(d => d.speed);
    const fft = FFT.computeFFT(speeds);
    setFftData(fft);
  }, [swpcData]);

  if (!showAnalysisPanel || !swpcData) return null;

  return (
    <div className="analysis-panel">
      <div className="panel-header">
        <h2>📊 Scientific Analysis</h2>
      </div>

      <div className="panel-content">
        {/* Time Series Charts */}
        <div className="charts-section">
          <h3 className="section-title">Time Series Data</h3>

          <TimeSeriesChart
            data={swpcData.solarWind}
            dataKey="speed"
            title="Solar Wind Speed"
            unit="km/s"
            color="#00ff88"
          />

          <MultiSeriesChart
            data={swpcData.magneticField}
            series={[
              { key: 'bx', name: 'Bx', color: '#ff6666' },
              { key: 'by', name: 'By', color: '#66ff66' },
              { key: 'bz', name: 'Bz', color: '#6666ff' },
            ]}
            title="Magnetic Field Components (GSM)"
            unit="nT"
          />

          <TimeSeriesChart
            data={swpcData.xrayFlux}
            dataKey="longWavelength"
            title="Solar X-Ray Flux"
            unit="W/m²"
            color="#ffaa00"
          />

          <TimeSeriesChart
            data={swpcData.geomagneticIndices as any}
            dataKey="kpIndex"
            title="Kp Geomagnetic Index"
            unit="Kp"
            color="#ff66ff"
          />
        </div>

        {/* Correlation Matrix */}
        {correlationData && (
          <CorrelationMatrix
            matrix={correlationData.matrix}
            labels={correlationData.labels}
          />
        )}

        {/* Frequency Analysis */}
        {fftData && (
          <FrequencyAnalysis
            frequencies={fftData.frequencies}
            magnitudes={fftData.magnitudes}
            title="Solar Wind Speed - Frequency Analysis (FFT)"
          />
        )}

        {/* Statistical Summary */}
        <div className="stats-summary">
          <h3 className="section-title">Statistical Summary</h3>
          <div className="stats-grid">
            {swpcData.solarWind.length > 0 && (
              <StatCard
                title="Solar Wind Speed"
                data={swpcData.solarWind.map(d => d.speed)}
                unit="km/s"
              />
            )}
            {swpcData.solarWind.length > 0 && (
              <StatCard
                title="Solar Wind Density"
                data={swpcData.solarWind.map(d => d.density)}
                unit="p/cm³"
              />
            )}
            {swpcData.magneticField.length > 0 && (
              <StatCard
                title="IMF Bz"
                data={swpcData.magneticField.map(d => d.bz)}
                unit="nT"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, data, unit }: { title: string; data: number[]; unit: string }) {
  const stats = Statistics.computeStatistics(data);

  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <div className="stat-row">
        <span>Mean:</span>
        <span>{stats.mean.toFixed(2)} {unit}</span>
      </div>
      <div className="stat-row">
        <span>Median:</span>
        <span>{stats.median.toFixed(2)} {unit}</span>
      </div>
      <div className="stat-row">
        <span>Std Dev:</span>
        <span>{stats.stdDev.toFixed(2)} {unit}</span>
      </div>
      <div className="stat-row">
        <span>Range:</span>
        <span>{stats.min.toFixed(2)} - {stats.max.toFixed(2)} {unit}</span>
      </div>
    </div>
  );
}
