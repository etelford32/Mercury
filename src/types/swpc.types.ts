/**
 * SWPC (Space Weather Prediction Center) Data Types
 * Comprehensive type definitions for all NOAA SWPC solar variables
 */

// Solar Wind Data
export interface SolarWindData {
  timestamp: Date;
  speed: number; // km/s
  density: number; // particles/cm³
  temperature: number; // Kelvin
}

// Interplanetary Magnetic Field (IMF)
export interface MagneticFieldData {
  timestamp: Date;
  bt: number; // Total field (nT)
  bx: number; // GSM coordinates (nT)
  by: number; // GSM coordinates (nT)
  bz: number; // GSM coordinates (nT) - critical for geomagnetic storms
  latitude: number; // degrees
  longitude: number; // degrees
}

// Solar X-ray Flux (GOES)
export interface XRayFluxData {
  timestamp: Date;
  shortWavelength: number; // 0.05-0.4 nm (W/m²)
  longWavelength: number; // 0.1-0.8 nm (W/m²)
  flareClass: 'A' | 'B' | 'C' | 'M' | 'X' | null;
  flareIntensity: number | null;
}

// Proton Flux Data
export interface ProtonFluxData {
  timestamp: Date;
  flux10MeV: number; // particles/(cm²·s·sr)
  flux50MeV: number;
  flux100MeV: number;
  flux500MeV: number;
}

// Electron Flux Data
export interface ElectronFluxData {
  timestamp: Date;
  flux0_8MeV: number; // electrons/(cm²·s·sr)
  flux2MeV: number;
  flux4MeV: number;
}

// Geomagnetic Activity Indices
export interface GeomagneticIndices {
  timestamp: Date;
  kpIndex: number; // 0-9 scale
  apIndex: number; // daily average
  dstIndex: number; // nanoteslas (storm intensity)
  stormLevel: 'quiet' | 'unsettled' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
}

// Solar Radio Flux
export interface SolarRadioFlux {
  timestamp: Date;
  f107: number; // 10.7 cm radio flux (solar flux units)
  f107Adjusted: number; // Adjusted to 1 AU
  sunspotNumber: number;
  solarFluxUnits: number; // 1 sfu = 10^-22 W/(m²·Hz)
}

// Coronal Mass Ejection (CME)
export interface CMEData {
  id: string;
  timestamp: Date;
  detectionTime: Date;
  speed: number; // km/s
  acceleration: number; // m/s²
  angle: number; // Half-angle (degrees)
  latitude: number;
  longitude: number;
  estimatedArrivalTime: Date | null;
  earthDirected: boolean;
  mercuryImpact: boolean;
}

// Solar Flare Event
export interface SolarFlareData {
  id: string;
  timestamp: Date;
  peakTime: Date;
  endTime: Date | null;
  class: 'A' | 'B' | 'C' | 'M' | 'X';
  intensity: number;
  location: {
    latitude: number;
    longitude: number;
  };
  activeRegion: number | null;
  associatedCME: string | null;
}

// Solar Energetic Particles (SEP)
export interface SEPEvent {
  id: string;
  startTime: Date;
  peakTime: Date;
  endTime: Date | null;
  intensity: number;
  energyRange: string;
  particleType: 'proton' | 'electron' | 'ion';
}

// Auroral Activity
export interface AuroralOval {
  timestamp: Date;
  northernOvalSize: number; // degrees latitude
  southernOvalSize: number;
  auroralPower: number; // GW
}

// Comprehensive SWPC Data Package
export interface SWPCDataPackage {
  solarWind: SolarWindData[];
  magneticField: MagneticFieldData[];
  xrayFlux: XRayFluxData[];
  protonFlux: ProtonFluxData[];
  electronFlux: ElectronFluxData[];
  geomagneticIndices: GeomagneticIndices[];
  solarRadioFlux: SolarRadioFlux[];
  cmes: CMEData[];
  solarFlares: SolarFlareData[];
  sepEvents: SEPEvent[];
  auroralActivity: AuroralOval[];
  lastUpdated: Date;
}

// Real-time Summary
export interface SWPCSummary {
  timestamp: Date;
  solarActivity: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
  geomagneticStorm: 'none' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
  radiationStorm: 'none' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
  radioBlackout: 'none' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  mercuryMagnetosphereStatus: 'compressed' | 'normal' | 'expanded';
  solarWindPressure: number; // nPa
  recommendations: string[];
}

// Historical Data Query
export interface DataQuery {
  startTime: Date;
  endTime: Date;
  dataTypes: (keyof SWPCDataPackage)[];
  resolution: 'high' | 'medium' | 'low'; // time resolution
}

// Data Statistics
export interface DataStatistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile25: number;
  percentile75: number;
  skewness: number;
  kurtosis: number;
}

// Prediction Result
export interface PredictionResult {
  timestamp: Date;
  predictedValue: number;
  confidence: number; // 0-1
  upperBound: number;
  lowerBound: number;
  model: string;
}

// ML Model Metadata
export interface MLModelMetadata {
  name: string;
  version: string;
  trainedOn: Date;
  accuracy: number;
  dataPoints: number;
  features: string[];
  targetVariable: string;
}

// Mercury-specific data
export interface MercuryEnvironment {
  timestamp: Date;
  solarWindImpact: {
    pressure: number; // nPa
    dynamicPressure: number;
    ramPressure: number;
  };
  magnetosphere: {
    standoffDistance: number; // Mercury radii
    tailLength: number;
    reconnectionRate: number;
    curvature: number;
  };
  surfaceWeathering: {
    sputteringRate: number;
    ionImplantationRate: number;
    micrometeoroidFlux: number;
  };
  exosphere: {
    sodiumColumn: number; // atoms/cm²
    calciumColumn: number;
    hydrogenColumn: number;
    temperature: number; // K
  };
}

// Space Weather Alert
export interface SpaceWeatherAlert {
  id: string;
  timestamp: Date;
  type: 'watch' | 'warning' | 'alert';
  category: 'geomagnetic' | 'radiation' | 'radio' | 'cme' | 'solar-flare';
  severity: 1 | 2 | 3 | 4 | 5;
  message: string;
  validFrom: Date;
  validTo: Date;
  affectedRegions: string[];
  recommendations: string[];
}
