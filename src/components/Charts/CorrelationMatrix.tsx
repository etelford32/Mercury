/**
 * Correlation Matrix Visualization
 * Shows correlations between different solar variables
 */

import './CorrelationMatrix.css';

interface CorrelationMatrixProps {
  matrix: number[][];
  labels: string[];
}

export function CorrelationMatrix({ matrix, labels }: CorrelationMatrixProps) {
  const getColor = (value: number) => {
    // Positive correlation: green, Negative: red, None: gray
    if (value > 0) {
      const intensity = Math.abs(value);
      return `rgba(0, 255, 100, ${intensity})`;
    } else {
      const intensity = Math.abs(value);
      return `rgba(255, 50, 50, ${intensity})`;
    }
  };

  return (
    <div className="correlation-matrix">
      <h3 className="matrix-title">Correlation Matrix</h3>
      <div className="matrix-grid" style={{
        gridTemplateColumns: `auto repeat(${labels.length}, 1fr)`,
        gridTemplateRows: `auto repeat(${labels.length}, 1fr)`,
      }}>
        {/* Empty top-left corner */}
        <div className="matrix-cell header-cell"></div>

        {/* Column headers */}
        {labels.map((label, idx) => (
          <div key={`col-${idx}`} className="matrix-cell header-cell">
            {label}
          </div>
        ))}

        {/* Rows */}
        {matrix.map((row, rowIdx) => (
          <div key={`row-${rowIdx}`} className="matrix-row" style={{ display: 'contents' }}>
            {/* Row header */}
            <div className="matrix-cell header-cell">{labels[rowIdx]}</div>

            {/* Data cells */}
            {row.map((value, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="matrix-cell data-cell"
                style={{ backgroundColor: getColor(value) }}
                title={`${labels[rowIdx]} vs ${labels[colIdx]}: ${value.toFixed(3)}`}
              >
                {value.toFixed(2)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="matrix-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(0, 255, 100, 0.8)' }}></div>
          <span>Strong Positive</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(255, 255, 255, 0.2)' }}></div>
          <span>No Correlation</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: 'rgba(255, 50, 50, 0.8)' }}></div>
          <span>Strong Negative</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Frequency Analysis Chart (FFT)
 */
interface FrequencyAnalysisProps {
  frequencies: number[];
  magnitudes: number[];
  title: string;
}

export function FrequencyAnalysis({ frequencies, magnitudes, title }: FrequencyAnalysisProps) {
  const maxMagnitude = Math.max(...magnitudes);

  return (
    <div className="frequency-analysis">
      <h3 className="analysis-title">{title}</h3>
      <div className="frequency-bars">
        {frequencies.slice(0, 50).map((freq, idx) => (
          <div
            key={idx}
            className="freq-bar"
            style={{
              height: `${(magnitudes[idx] / maxMagnitude) * 100}%`,
              backgroundColor: `hsl(${200 + idx * 3}, 80%, 50%)`,
            }}
            title={`Frequency: ${freq.toFixed(4)}, Magnitude: ${magnitudes[idx].toFixed(2)}`}
          />
        ))}
      </div>
      <div className="frequency-axis">
        <span>0 Hz</span>
        <span>Frequency</span>
        <span>0.5 Hz</span>
      </div>
    </div>
  );
}
