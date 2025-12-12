/**
 * Global Simulation State Store
 * Manages all state for the Mercury Solar Wind Simulation
 */

import { create } from 'zustand';
import type {
  SWPCDataPackage,
  SWPCSummary,
  MercuryEnvironment,
  PredictionResult,
} from '../types/swpc.types';

interface SimulationState {
  // Display settings
  showSolarWind: boolean;
  showMagnetosphere: boolean;
  showSun: boolean;
  showDataDashboard: boolean;
  showAnalysisPanel: boolean;
  showPredictions: boolean;

  // SWPC Data
  swpcData: SWPCDataPackage | null;
  swpcSummary: SWPCSummary | null;
  mercuryEnvironment: MercuryEnvironment | null;

  // Real-time values
  solarWindSpeed: number;
  solarWindDensity: number;
  solarWindTemperature: number;
  solarWindPressure: number;
  magneticFieldBz: number;
  xrayFlux: number;
  solarActivity: number; // 0-1 scale
  kpIndex: number;

  // Magnetosphere status
  magnetosphereStatus: 'compressed' | 'normal' | 'expanded';

  // ML Predictions
  solarWindPrediction: PredictionResult | null;
  flareProbability: number;

  // Analysis data
  correlationMatrix: number[][] | null;
  fftData: { frequencies: number[]; magnitudes: number[] } | null;

  // Data loading
  isLoadingData: boolean;
  lastDataUpdate: Date | null;
  dataUpdateInterval: number; // milliseconds

  // Actions
  setShowSolarWind: (show: boolean) => void;
  setShowMagnetosphere: (show: boolean) => void;
  setShowSun: (show: boolean) => void;
  setShowDataDashboard: (show: boolean) => void;
  setShowAnalysisPanel: (show: boolean) => void;
  setShowPredictions: (show: boolean) => void;

  updateSWPCData: (data: SWPCDataPackage) => void;
  updateSWPCSummary: (summary: SWPCSummary) => void;
  updateMercuryEnvironment: (env: MercuryEnvironment) => void;
  updatePredictions: (prediction: PredictionResult, flareProb: number) => void;

  setDataUpdateInterval: (interval: number) => void;
}

export const useSimulationStore = create<SimulationState>((set) => ({
  // Initial display settings
  showSolarWind: true,
  showMagnetosphere: true,
  showSun: true,
  showDataDashboard: true,
  showAnalysisPanel: false,
  showPredictions: true,

  // Initial data
  swpcData: null,
  swpcSummary: null,
  mercuryEnvironment: null,

  // Initial real-time values
  solarWindSpeed: 400,
  solarWindDensity: 7,
  solarWindTemperature: 100000,
  solarWindPressure: 2.0,
  magneticFieldBz: -5,
  xrayFlux: 1e-7,
  solarActivity: 0.5,
  kpIndex: 3,

  magnetosphereStatus: 'normal',

  // Initial predictions
  solarWindPrediction: null,
  flareProbability: 0.1,

  // Analysis
  correlationMatrix: null,
  fftData: null,

  // Loading state
  isLoadingData: false,
  lastDataUpdate: null,
  dataUpdateInterval: 60000, // 1 minute

  // Actions
  setShowSolarWind: (show) => set({ showSolarWind: show }),
  setShowMagnetosphere: (show) => set({ showMagnetosphere: show }),
  setShowSun: (show) => set({ showSun: show }),
  setShowDataDashboard: (show) => set({ showDataDashboard: show }),
  setShowAnalysisPanel: (show) => set({ showAnalysisPanel: show }),
  setShowPredictions: (show) => set({ showPredictions: show }),

  updateSWPCData: (data) => {
    // Extract latest values
    const latestSolarWind = data.solarWind[data.solarWind.length - 1];
    const latestMagField = data.magneticField[data.magneticField.length - 1];
    const latestXray = data.xrayFlux[data.xrayFlux.length - 1];
    const latestGeo = data.geomagneticIndices[data.geomagneticIndices.length - 1];

    set({
      swpcData: data,
      solarWindSpeed: latestSolarWind?.speed || 400,
      solarWindDensity: latestSolarWind?.density || 7,
      solarWindTemperature: latestSolarWind?.temperature || 100000,
      magneticFieldBz: latestMagField?.bz || -5,
      xrayFlux: latestXray?.longWavelength || 1e-7,
      kpIndex: latestGeo?.kpIndex || 3,
      lastDataUpdate: new Date(),
    });
  },

  updateSWPCSummary: (summary) => {
    const activityLevel =
      summary.solarActivity === 'very-high' ? 1.0 :
      summary.solarActivity === 'high' ? 0.8 :
      summary.solarActivity === 'moderate' ? 0.5 :
      summary.solarActivity === 'low' ? 0.3 : 0.1;

    set({
      swpcSummary: summary,
      solarActivity: activityLevel,
      solarWindPressure: summary.solarWindPressure,
      magnetosphereStatus: summary.mercuryMagnetosphereStatus,
    });
  },

  updateMercuryEnvironment: (env) => {
    set({ mercuryEnvironment: env });
  },

  updatePredictions: (prediction, flareProb) => {
    set({
      solarWindPrediction: prediction,
      flareProbability: flareProb,
    });
  },

  setDataUpdateInterval: (interval) => {
    set({ dataUpdateInterval: interval });
  },
}));
