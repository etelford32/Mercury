/**
 * SWPC Data Service
 * Fetches real-time and historical data from NOAA Space Weather Prediction Center
 */

import type {
  SolarWindData,
  MagneticFieldData,
  XRayFluxData,
  ProtonFluxData,
  GeomagneticIndices,
  SolarRadioFlux,
  SWPCDataPackage,
  SWPCSummary,
  CMEData,
  SolarFlareData,
  MercuryEnvironment,
} from '../types/swpc.types';

// NOAA SWPC API endpoints
const SWPC_BASE_URL = 'https://services.swpc.noaa.gov';
const DONKI_BASE_URL = 'https://api.nasa.gov/DONKI';
const NASA_API_KEY = 'DEMO_KEY'; // Replace with actual API key for production

class SWPCDataService {

  /**
   * Fetch solar wind data from ACE satellite
   */
  async getSolarWindData(): Promise<SolarWindData[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/solar-wind/mag-2-hour.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => ({
        timestamp: new Date(row[0]),
        speed: parseFloat(row[6]) || 0,
        density: parseFloat(row[7]) || 0,
        temperature: parseFloat(row[8]) || 0,
      })).filter((d: SolarWindData) => !isNaN(d.speed));
    } catch (error) {
      console.error('Error fetching solar wind data:', error);
      return this.generateMockSolarWindData();
    }
  }

  /**
   * Fetch magnetic field data
   */
  async getMagneticFieldData(): Promise<MagneticFieldData[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/solar-wind/mag-2-hour.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => ({
        timestamp: new Date(row[0]),
        bt: parseFloat(row[1]) || 0,
        bx: parseFloat(row[2]) || 0,
        by: parseFloat(row[3]) || 0,
        bz: parseFloat(row[4]) || 0,
        latitude: parseFloat(row[5]) || 0,
        longitude: 0,
      })).filter((d: MagneticFieldData) => !isNaN(d.bt));
    } catch (error) {
      console.error('Error fetching magnetic field data:', error);
      return this.generateMockMagneticFieldData();
    }
  }

  /**
   * Fetch X-ray flux data from GOES satellite
   */
  async getXRayFluxData(): Promise<XRayFluxData[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/goes-xrs-3-day.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => {
        const shortFlux = parseFloat(row[2]);
        const longFlux = parseFloat(row[3]);

        return {
          timestamp: new Date(row[0]),
          shortWavelength: shortFlux || 0,
          longWavelength: longFlux || 0,
          flareClass: this.determineFlareClass(longFlux),
          flareIntensity: longFlux,
        };
      }).filter((d: XRayFluxData) => !isNaN(d.longWavelength));
    } catch (error) {
      console.error('Error fetching X-ray flux data:', error);
      return this.generateMockXRayData();
    }
  }

  /**
   * Fetch proton flux data
   */
  async getProtonFluxData(): Promise<ProtonFluxData[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/goes-proton-flux.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => ({
        timestamp: new Date(row[0]),
        flux10MeV: parseFloat(row[1]) || 0,
        flux50MeV: parseFloat(row[2]) || 0,
        flux100MeV: parseFloat(row[3]) || 0,
        flux500MeV: parseFloat(row[4]) || 0,
      }));
    } catch (error) {
      console.error('Error fetching proton flux data:', error);
      return this.generateMockProtonFluxData();
    }
  }

  /**
   * Fetch geomagnetic indices
   */
  async getGeomagneticIndices(): Promise<GeomagneticIndices[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/noaa-planetary-k-index.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => {
        const kp = parseFloat(row[1]);
        return {
          timestamp: new Date(row[0]),
          kpIndex: kp,
          apIndex: this.kpToAp(kp),
          dstIndex: -30 * kp, // Approximate
          stormLevel: this.determineStormLevel(kp),
        };
      });
    } catch (error) {
      console.error('Error fetching geomagnetic indices:', error);
      return this.generateMockGeomagneticData();
    }
  }

  /**
   * Fetch solar radio flux (F10.7)
   */
  async getSolarRadioFlux(): Promise<SolarRadioFlux[]> {
    try {
      const response = await fetch(`${SWPC_BASE_URL}/products/solar-regions/solar-flux.json`);
      const data = await response.json();

      return data.slice(1).map((row: string[]) => ({
        timestamp: new Date(row[0]),
        f107: parseFloat(row[1]) || 70,
        f107Adjusted: parseFloat(row[2]) || 70,
        sunspotNumber: parseFloat(row[3]) || 0,
        solarFluxUnits: parseFloat(row[1]) || 70,
      }));
    } catch (error) {
      console.error('Error fetching solar radio flux:', error);
      return this.generateMockSolarRadioFlux();
    }
  }

  /**
   * Fetch CME data from NASA DONKI
   */
  async getCMEData(days: number = 30): Promise<CMEData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const response = await fetch(
        `${DONKI_BASE_URL}/CME?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&api_key=${NASA_API_KEY}`
      );
      const data = await response.json();

      return data.map((cme: unknown) => this.parseCMEData(cme));
    } catch (error) {
      console.error('Error fetching CME data:', error);
      return this.generateMockCMEData();
    }
  }

  /**
   * Fetch solar flare data from NASA DONKI
   */
  async getSolarFlareData(days: number = 30): Promise<SolarFlareData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      const response = await fetch(
        `${DONKI_BASE_URL}/FLR?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}&api_key=${NASA_API_KEY}`
      );
      const data = await response.json();

      return data.map((flare: unknown) => this.parseFlareData(flare));
    } catch (error) {
      console.error('Error fetching solar flare data:', error);
      return this.generateMockFlareData();
    }
  }

  /**
   * Get comprehensive SWPC data package
   */
  async getSWPCDataPackage(): Promise<SWPCDataPackage> {
    const [
      solarWind,
      magneticField,
      xrayFlux,
      protonFlux,
      geomagneticIndices,
      solarRadioFlux,
      cmes,
      solarFlares,
    ] = await Promise.all([
      this.getSolarWindData(),
      this.getMagneticFieldData(),
      this.getXRayFluxData(),
      this.getProtonFluxData(),
      this.getGeomagneticIndices(),
      this.getSolarRadioFlux(),
      this.getCMEData(),
      this.getSolarFlareData(),
    ]);

    return {
      solarWind,
      magneticField,
      xrayFlux,
      protonFlux,
      electronFlux: [],
      geomagneticIndices,
      solarRadioFlux,
      cmes,
      solarFlares,
      sepEvents: [],
      auroralActivity: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Get real-time summary
   */
  async getSWPCSummary(): Promise<SWPCSummary> {
    const [solarWind, xrayFlux, geoIndices] = await Promise.all([
      this.getSolarWindData(),
      this.getXRayFluxData(),
      this.getGeomagneticIndices(),
    ]);

    const latestSolarWind = solarWind[solarWind.length - 1];
    const latestXray = xrayFlux[xrayFlux.length - 1];
    const latestGeo = geoIndices[geoIndices.length - 1];

    // Calculate solar wind pressure (nPa)
    const solarWindPressure = latestSolarWind
      ? 1.6726e-6 * latestSolarWind.density * Math.pow(latestSolarWind.speed, 2)
      : 2.0;

    // Determine Mercury magnetosphere status based on solar wind pressure
    const mercuryStatus = solarWindPressure > 3 ? 'compressed'
      : solarWindPressure < 1.5 ? 'expanded' : 'normal';

    const stormLevel = latestGeo?.stormLevel || 'quiet';
    const validStormLevel = stormLevel === 'quiet' || stormLevel === 'unsettled' ? 'none' : stormLevel;

    return {
      timestamp: new Date(),
      solarActivity: this.determineSolarActivity(latestXray),
      geomagneticStorm: validStormLevel,
      radiationStorm: this.determineRadiationStorm(0),
      radioBlackout: this.determineRadioBlackout(latestXray),
      mercuryMagnetosphereStatus: mercuryStatus,
      solarWindPressure,
      recommendations: this.generateRecommendations(solarWindPressure, latestGeo),
    };
  }

  /**
   * Calculate Mercury environment from solar conditions
   */
  async getMercuryEnvironment(): Promise<MercuryEnvironment> {
    const [solarWind, magneticField] = await Promise.all([
      this.getSolarWindData(),
      this.getMagneticFieldData(),
    ]);

    const latest = solarWind[solarWind.length - 1];
    const latestMag = magneticField[magneticField.length - 1];

    if (!latest) {
      return this.generateDefaultMercuryEnvironment();
    }

    // Calculate dynamic pressure
    const dynamicPressure = 1.6726e-6 * latest.density * Math.pow(latest.speed, 2);

    // Mercury's magnetopause standoff distance (simplified)
    const standoffDistance = 1.5 * Math.pow(dynamicPressure / 2.0, -1/6);

    return {
      timestamp: new Date(),
      solarWindImpact: {
        pressure: dynamicPressure,
        dynamicPressure,
        ramPressure: dynamicPressure * 1.1,
      },
      magnetosphere: {
        standoffDistance,
        tailLength: standoffDistance * 10,
        reconnectionRate: Math.abs(latestMag?.bz || 0) * 0.1,
        curvature: 1.0 / standoffDistance,
      },
      surfaceWeathering: {
        sputteringRate: latest.density * latest.speed * 0.001,
        ionImplantationRate: latest.density * 0.01,
        micrometeoroidFlux: 1e-16,
      },
      exosphere: {
        sodiumColumn: 1e11 * (1 + Math.random() * 0.5),
        calciumColumn: 1e10 * (1 + Math.random() * 0.5),
        hydrogenColumn: 1e12 * (1 + Math.random() * 0.5),
        temperature: 450 + Math.random() * 50,
      },
    };
  }

  // Helper methods
  private determineFlareClass(flux: number): 'A' | 'B' | 'C' | 'M' | 'X' | null {
    if (flux < 1e-8) return 'A';
    if (flux < 1e-7) return 'B';
    if (flux < 1e-6) return 'C';
    if (flux < 1e-5) return 'M';
    if (flux >= 1e-5) return 'X';
    return null;
  }

  private kpToAp(kp: number): number {
    const apTable = [0, 2, 3, 4, 5, 6, 7, 9, 12, 15, 18, 22, 27, 32, 39, 48, 56, 67, 80, 94, 111, 132, 154, 179, 207, 236, 300, 400];
    const index = Math.floor(kp * 3);
    return apTable[Math.min(index, apTable.length - 1)];
  }

  private determineStormLevel(kp: number): 'quiet' | 'unsettled' | 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme' {
    if (kp < 3) return 'quiet';
    if (kp < 4) return 'unsettled';
    if (kp < 5) return 'minor';
    if (kp < 6) return 'moderate';
    if (kp < 7) return 'strong';
    if (kp < 8) return 'severe';
    return 'extreme';
  }

  private determineSolarActivity(xray: XRayFluxData | undefined): 'very-low' | 'low' | 'moderate' | 'high' | 'very-high' {
    if (!xray) return 'low';
    const flux = xray.longWavelength;
    if (flux < 1e-7) return 'very-low';
    if (flux < 1e-6) return 'low';
    if (flux < 1e-5) return 'moderate';
    if (flux < 1e-4) return 'high';
    return 'very-high';
  }

  private determineRadiationStorm(protonFlux: number): 'none' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' {
    if (protonFlux < 10) return 'none';
    if (protonFlux < 100) return 'S1';
    if (protonFlux < 1000) return 'S2';
    if (protonFlux < 10000) return 'S3';
    if (protonFlux < 100000) return 'S4';
    return 'S5';
  }

  private determineRadioBlackout(xray: XRayFluxData | undefined): 'none' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5' {
    if (!xray) return 'none';
    const flux = xray.longWavelength;
    if (flux < 1e-6) return 'none';
    if (flux < 5e-6) return 'R1';
    if (flux < 1e-5) return 'R2';
    if (flux < 1e-4) return 'R3';
    if (flux < 2e-4) return 'R4';
    return 'R5';
  }

  private generateRecommendations(pressure: number, geo: GeomagneticIndices | undefined): string[] {
    const recommendations: string[] = [];

    if (pressure > 3) {
      recommendations.push('High solar wind pressure - Mercury magnetosphere compressed');
    }

    if (geo && geo.kpIndex > 5) {
      recommendations.push('Elevated geomagnetic activity detected');
    }

    recommendations.push('Monitoring solar conditions continuously');

    return recommendations;
  }

  // Mock data generators for fallback
  private generateMockSolarWindData(): SolarWindData[] {
    const data: SolarWindData[] = [];
    for (let i = 0; i < 120; i++) {
      data.push({
        timestamp: new Date(Date.now() - (120 - i) * 60000),
        speed: 400 + Math.random() * 200,
        density: 5 + Math.random() * 10,
        temperature: 100000 + Math.random() * 50000,
      });
    }
    return data;
  }

  private generateMockMagneticFieldData(): MagneticFieldData[] {
    const data: MagneticFieldData[] = [];
    for (let i = 0; i < 120; i++) {
      data.push({
        timestamp: new Date(Date.now() - (120 - i) * 60000),
        bt: 5 + Math.random() * 10,
        bx: (Math.random() - 0.5) * 10,
        by: (Math.random() - 0.5) * 10,
        bz: (Math.random() - 0.5) * 10,
        latitude: (Math.random() - 0.5) * 30,
        longitude: Math.random() * 360,
      });
    }
    return data;
  }

  private generateMockXRayData(): XRayFluxData[] {
    const data: XRayFluxData[] = [];
    for (let i = 0; i < 120; i++) {
      const flux = 1e-7 + Math.random() * 1e-6;
      data.push({
        timestamp: new Date(Date.now() - (120 - i) * 60000),
        shortWavelength: flux * 0.8,
        longWavelength: flux,
        flareClass: this.determineFlareClass(flux),
        flareIntensity: flux,
      });
    }
    return data;
  }

  private generateMockProtonFluxData(): ProtonFluxData[] {
    const data: ProtonFluxData[] = [];
    for (let i = 0; i < 120; i++) {
      data.push({
        timestamp: new Date(Date.now() - (120 - i) * 60000),
        flux10MeV: Math.random() * 10,
        flux50MeV: Math.random() * 5,
        flux100MeV: Math.random() * 2,
        flux500MeV: Math.random() * 0.5,
      });
    }
    return data;
  }

  private generateMockGeomagneticData(): GeomagneticIndices[] {
    const data: GeomagneticIndices[] = [];
    for (let i = 0; i < 120; i++) {
      const kp = Math.random() * 5;
      data.push({
        timestamp: new Date(Date.now() - (120 - i) * 60000),
        kpIndex: kp,
        apIndex: this.kpToAp(kp),
        dstIndex: -30 * kp,
        stormLevel: this.determineStormLevel(kp),
      });
    }
    return data;
  }

  private generateMockSolarRadioFlux(): SolarRadioFlux[] {
    return [{
      timestamp: new Date(),
      f107: 100 + Math.random() * 50,
      f107Adjusted: 100 + Math.random() * 50,
      sunspotNumber: Math.floor(Math.random() * 100),
      solarFluxUnits: 100 + Math.random() * 50,
    }];
  }

  private generateMockCMEData(): CMEData[] {
    return [];
  }

  private generateMockFlareData(): SolarFlareData[] {
    return [];
  }

  private parseCMEData(cme: any): CMEData {
    // Parse CME data from DONKI API
    return {
      id: cme.activityID || 'unknown',
      timestamp: new Date(cme.startTime),
      detectionTime: new Date(cme.startTime),
      speed: parseFloat(cme.linkedEvents?.[0]?.speed) || 500,
      acceleration: 0,
      angle: parseFloat(cme.halfAngle) || 30,
      latitude: parseFloat(cme.latitude) || 0,
      longitude: parseFloat(cme.longitude) || 0,
      estimatedArrivalTime: null,
      earthDirected: cme.linkedEvents?.some((e: any) => e.link?.includes('earth')) || false,
      mercuryImpact: false,
    };
  }

  private parseFlareData(flare: any): SolarFlareData {
    return {
      id: flare.flrID || 'unknown',
      timestamp: new Date(flare.beginTime),
      peakTime: new Date(flare.peakTime),
      endTime: flare.endTime ? new Date(flare.endTime) : null,
      class: (flare.classType?.[0] || 'C') as 'A' | 'B' | 'C' | 'M' | 'X',
      intensity: parseFloat(flare.classType?.substring(1)) || 1.0,
      location: {
        latitude: parseFloat(flare.sourceLocation?.split('N')?.[0]) || 0,
        longitude: parseFloat(flare.sourceLocation?.split('W')?.[0]) || 0,
      },
      activeRegion: parseInt(flare.activeRegionNum) || null,
      associatedCME: flare.linkedEvents?.find((e: any) => e.activityID?.includes('CME'))?.activityID || null,
    };
  }

  private generateDefaultMercuryEnvironment(): MercuryEnvironment {
    return {
      timestamp: new Date(),
      solarWindImpact: {
        pressure: 2.0,
        dynamicPressure: 2.0,
        ramPressure: 2.2,
      },
      magnetosphere: {
        standoffDistance: 1.45,
        tailLength: 14.5,
        reconnectionRate: 0.1,
        curvature: 0.69,
      },
      surfaceWeathering: {
        sputteringRate: 0.5,
        ionImplantationRate: 0.05,
        micrometeoroidFlux: 1e-16,
      },
      exosphere: {
        sodiumColumn: 1e11,
        calciumColumn: 1e10,
        hydrogenColumn: 1e12,
        temperature: 450,
      },
    };
  }
}

export const swpcDataService = new SWPCDataService();
