import { useState } from 'react'
import { useMercuryStore, mercuryFacts } from '../../store/mercuryStore'
import './InfoPanel.css'

export function InfoPanel() {
  const { showInfo, setShowInfo } = useMercuryStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'features'>('overview')

  if (!showInfo) {
    return (
      <button className="info-toggle" onClick={() => setShowInfo(true)}>
        <span>ℹ</span>
      </button>
    )
  }

  return (
    <div className="info-panel">
      <div className="info-header">
        <div className="info-title">
          <h2>{mercuryFacts.general.title}</h2>
          <span className="info-subtitle">{mercuryFacts.general.subtitle}</span>
        </div>
        <button className="info-close" onClick={() => setShowInfo(false)}>
          ×
        </button>
      </div>

      <div className="info-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          Features
        </button>
      </div>

      <div className="info-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <p>{mercuryFacts.general.description}</p>
            <div className="quick-facts">
              <h3>Quick Facts</h3>
              <ul>
                <li>Smallest planet in our Solar System</li>
                <li>Fastest orbit around the Sun (88 Earth days)</li>
                <li>Extreme temperature variations</li>
                <li>No atmosphere to retain heat</li>
                <li>Heavily cratered surface like our Moon</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-content">
            {mercuryFacts.stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-detail">{stat.detail}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'features' && (
          <div className="features-content">
            {mercuryFacts.features.map((feature) => (
              <div key={feature.id} className="feature-item">
                <h4>{feature.name}</h4>
                <p>{feature.description}</p>
                <div className="feature-coords">
                  {feature.coordinates.lat}° {feature.coordinates.lat >= 0 ? 'N' : 'S'}, {' '}
                  {Math.abs(feature.coordinates.lon)}° {feature.coordinates.lon >= 0 ? 'E' : 'W'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-footer">
        <span>Data: NASA/MESSENGER Mission</span>
      </div>
    </div>
  )
}
