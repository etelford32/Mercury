/**
 * Real-time SWPC Data Dashboard
 * Displays all solar variables from NOAA Space Weather Prediction Center
 */

import { useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { swpcDataService } from '../../services/swpcDataService';
import './SWPCDashboard.css';

export function SWPCDashboard() {
  const {
    showDataDashboard,
    swpcSummary,
    solarWindSpeed,
    solarWindDensity,
    solarWindTemperature,
    solarWindPressure,
    magneticFieldBz,
    xrayFlux,
    kpIndex,
    magnetosphereStatus,
    mercuryEnvironment,
    updateSWPCData,
    updateSWPCSummary,
    updateMercuryEnvironment,
    dataUpdateInterval,
  } = useSimulationStore();

  useEffect(() => {
    // Fetch initial data
    fetchData();

    // Set up periodic updates
    const interval = setInterval(fetchData, dataUpdateInterval);

    return () => clearInterval(interval);
  }, [dataUpdateInterval]);

  const fetchData = async () => {
    try {
      const [dataPackage, summary, mercuryEnv] = await Promise.all([
        swpcDataService.getSWPCDataPackage(),
        swpcDataService.getSWPCSummary(),
        swpcDataService.getMercuryEnvironment(),
      ]);

      updateSWPCData(dataPackage);
      updateSWPCSummary(summary);
      updateMercuryEnvironment(mercuryEnv);
    } catch (error) {
      console.error('Error fetching SWPC data:', error);
    }
  };

  if (!showDataDashboard) return null;

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'very-high': return '#ff3300';
      case 'high': return '#ff6600';
      case 'moderate': return '#ffaa00';
      case 'low': return '#88ff00';
      default: return '#00ff00';
    }
  };

  const getStormColor = (level: string) => {
    if (level === 'extreme' || level === 'severe') return '#ff0000';
    if (level === 'strong' || level === 'moderate') return '#ff8800';
    if (level === 'minor' || level === 'unsettled') return '#ffff00';
    return '#00ff00';
  };

  return (
    <div className="swpc-dashboard">
      <div className="dashboard-header">
        <h2>🌞 Space Weather Prediction Center Data</h2>
        <div className="last-update">
          Last Update: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Solar Activity Summary */}
        <div className="dashboard-card summary-card">
          <h3>Solar Activity</h3>
          <div
            className="activity-indicator"
            style={{ backgroundColor: getActivityColor(swpcSummary?.solarActivity || 'low') }}
          >
            {swpcSummary?.solarActivity.toUpperCase().replace('-', ' ') || 'LOADING...'}
          </div>
        </div>

        {/* Geomagnetic Storm */}
        <div className="dashboard-card summary-card">
          <h3>Geomagnetic Storm</h3>
          <div
            className="storm-indicator"
            style={{ backgroundColor: getStormColor(swpcSummary?.geomagneticStorm || 'none') }}
          >
            {swpcSummary?.geomagneticStorm.toUpperCase() || 'NONE'}
          </div>
        </div>

        {/* Solar Wind */}
        <div className="dashboard-card">
          <h3>☄️ Solar Wind</h3>
          <div className="data-row">
            <span className="label">Speed:</span>
            <span className="value">{solarWindSpeed.toFixed(1)} km/s</span>
          </div>
          <div className="data-row">
            <span className="label">Density:</span>
            <span className="value">{solarWindDensity.toFixed(2)} p/cm³</span>
          </div>
          <div className="data-row">
            <span className="label">Temperature:</span>
            <span className="value">{(solarWindTemperature / 1000).toFixed(0)}K K</span>
          </div>
          <div className="data-row">
            <span className="label">Pressure:</span>
            <span className="value">{solarWindPressure.toFixed(2)} nPa</span>
          </div>
        </div>

        {/* Magnetic Field */}
        <div className="dashboard-card">
          <h3>🧲 Interplanetary Magnetic Field</h3>
          <div className="data-row">
            <span className="label">Bz Component:</span>
            <span className="value" style={{ color: magneticFieldBz < 0 ? '#ff6666' : '#66ff66' }}>
              {magneticFieldBz.toFixed(2)} nT
            </span>
          </div>
          <div className="data-hint">
            {magneticFieldBz < -10 && '⚠️ Strong southward - High reconnection'}
            {magneticFieldBz > 10 && '✓ Northward - Low reconnection'}
          </div>
        </div>

        {/* Solar X-Ray Flux */}
        <div className="dashboard-card">
          <h3>☀️ Solar X-Ray Flux</h3>
          <div className="data-row">
            <span className="label">Flux:</span>
            <span className="value">{xrayFlux.toExponential(2)} W/m²</span>
          </div>
          <div className="data-row">
            <span className="label">Class:</span>
            <span className="value flux-class">
              {xrayFlux >= 1e-4 ? 'X-Class' :
               xrayFlux >= 1e-5 ? 'M-Class' :
               xrayFlux >= 1e-6 ? 'C-Class' :
               xrayFlux >= 1e-7 ? 'B-Class' : 'A-Class'}
            </span>
          </div>
        </div>

        {/* Geomagnetic Indices */}
        <div className="dashboard-card">
          <h3>🌍 Geomagnetic Activity</h3>
          <div className="data-row">
            <span className="label">Kp Index:</span>
            <span className="value kp-value" style={{
              color: kpIndex > 6 ? '#ff0000' : kpIndex > 4 ? '#ff8800' : '#00ff00'
            }}>
              {kpIndex.toFixed(1)}
            </span>
          </div>
          <div className="kp-bar">
            <div
              className="kp-fill"
              style={{ width: `${(kpIndex / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Mercury Magnetosphere */}
        <div className="dashboard-card mercury-card">
          <h3>☿ Mercury Magnetosphere</h3>
          <div className="data-row">
            <span className="label">Status:</span>
            <span className="value magnetosphere-status">
              {magnetosphereStatus.toUpperCase()}
            </span>
          </div>
          {mercuryEnvironment && (
            <>
              <div className="data-row">
                <span className="label">Standoff Distance:</span>
                <span className="value">
                  {mercuryEnvironment.magnetosphere.standoffDistance.toFixed(2)} R<sub>M</sub>
                </span>
              </div>
              <div className="data-row">
                <span className="label">Reconnection Rate:</span>
                <span className="value">
                  {mercuryEnvironment.magnetosphere.reconnectionRate.toFixed(3)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Mercury Exosphere */}
        {mercuryEnvironment && (
          <div className="dashboard-card">
            <h3>🌫️ Mercury Exosphere</h3>
            <div className="data-row">
              <span className="label">Na Column:</span>
              <span className="value">
                {mercuryEnvironment.exosphere.sodiumColumn.toExponential(2)} atoms/cm²
              </span>
            </div>
            <div className="data-row">
              <span className="label">Ca Column:</span>
              <span className="value">
                {mercuryEnvironment.exosphere.calciumColumn.toExponential(2)} atoms/cm²
              </span>
            </div>
            <div className="data-row">
              <span className="label">Temperature:</span>
              <span className="value">
                {mercuryEnvironment.exosphere.temperature.toFixed(0)} K
              </span>
            </div>
          </div>
        )}

        {/* Space Weather Alerts */}
        {swpcSummary?.recommendations && swpcSummary.recommendations.length > 0 && (
          <div className="dashboard-card alerts-card">
            <h3>⚠️ Recommendations</h3>
            {swpcSummary.recommendations.map((rec, idx) => (
              <div key={idx} className="alert-item">
                {rec}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
