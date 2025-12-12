/**
 * Advanced Control Panel
 * Controls for visualization, ML features, and analysis
 */

import { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import './AdvancedControls.css';

export function AdvancedControls() {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    showSolarWind,
    showMagnetosphere,
    showSun,
    showDataDashboard,
    showAnalysisPanel,
    showPredictions,
    setShowSolarWind,
    setShowMagnetosphere,
    setShowSun,
    setShowDataDashboard,
    setShowAnalysisPanel,
    setShowPredictions,
    solarWindPrediction,
    flareProbability,
  } = useSimulationStore();

  return (
    <div className="advanced-controls">
      <div className="controls-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>⚙️ Controls & Analysis</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="controls-content">
          {/* Visualization Controls */}
          <div className="control-section">
            <h4>Visualization</h4>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showSun}
                onChange={(e) => setShowSun(e.target.checked)}
              />
              <span>Show Sun & Corona</span>
            </label>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showSolarWind}
                onChange={(e) => setShowSolarWind(e.target.checked)}
              />
              <span>Show Solar Wind Particles</span>
            </label>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showMagnetosphere}
                onChange={(e) => setShowMagnetosphere(e.target.checked)}
              />
              <span>Show Magnetosphere</span>
            </label>
          </div>

          {/* Data Display Controls */}
          <div className="control-section">
            <h4>Data Display</h4>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showDataDashboard}
                onChange={(e) => setShowDataDashboard(e.target.checked)}
              />
              <span>SWPC Data Dashboard</span>
            </label>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showAnalysisPanel}
                onChange={(e) => setShowAnalysisPanel(e.target.checked)}
              />
              <span>Analysis Panel (FFT, Correlation)</span>
            </label>

            <label className="control-checkbox">
              <input
                type="checkbox"
                checked={showPredictions}
                onChange={(e) => setShowPredictions(e.target.checked)}
              />
              <span>ML Predictions</span>
            </label>
          </div>

          {/* ML Predictions Display */}
          {showPredictions && (
            <div className="control-section predictions-section">
              <h4>🤖 Machine Learning Predictions</h4>

              {solarWindPrediction && (
                <div className="prediction-item">
                  <div className="prediction-label">Solar Wind Speed (1h):</div>
                  <div className="prediction-value">
                    {solarWindPrediction.predictedValue.toFixed(1)} km/s
                  </div>
                  <div className="prediction-confidence">
                    Confidence: {(solarWindPrediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              )}

              <div className="prediction-item">
                <div className="prediction-label">Solar Flare Probability:</div>
                <div className="prediction-value">
                  {(flareProbability * 100).toFixed(1)}%
                </div>
                <div className="probability-bar">
                  <div
                    className="probability-fill"
                    style={{
                      width: `${flareProbability * 100}%`,
                      backgroundColor:
                        flareProbability > 0.7 ? '#ff3300' :
                        flareProbability > 0.4 ? '#ff8800' : '#00ff88'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Information */}
          <div className="control-section info-section">
            <h4>ℹ️ About</h4>
            <p>
              This simulation integrates real-time data from NOAA's Space Weather
              Prediction Center (SWPC) to visualize the complex interactions between
              the Sun, solar wind, and Mercury's magnetosphere.
            </p>
            <p>
              Machine learning models predict future solar activity based on
              historical patterns using TensorFlow.js.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
