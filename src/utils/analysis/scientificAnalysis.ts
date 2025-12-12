/**
 * Advanced Scientific Analysis Utilities
 * FFT, Wavelets, Statistical Analysis, Signal Processing
 */

import type { DataStatistics } from '../../types/swpc.types';

/**
 * Fast Fourier Transform Analysis
 */
export class FFTAnalyzer {
  /**
   * Compute FFT of a signal
   */
  static computeFFT(signal: number[]): { frequencies: number[]; magnitudes: number[]; phases: number[] } {
    const n = signal.length;
    const fftResult = this.fft(signal);

    const magnitudes = fftResult.map(c => Math.sqrt(c.re * c.re + c.im * c.im));
    const phases = fftResult.map(c => Math.atan2(c.im, c.re));
    const frequencies = Array.from({ length: n }, (_, i) => i / n);

    return { frequencies, magnitudes, phases };
  }

  /**
   * Basic FFT implementation using Cooley-Tukey algorithm
   */
  private static fft(signal: number[]): { re: number; im: number }[] {
    const n = signal.length;

    if (n <= 1) {
      return [{ re: signal[0] || 0, im: 0 }];
    }

    // Ensure power of 2
    const paddedLength = Math.pow(2, Math.ceil(Math.log2(n)));
    const padded = [...signal, ...Array(paddedLength - n).fill(0)];

    return this.fftRecursive(padded.map(re => ({ re, im: 0 })));
  }

  private static fftRecursive(x: { re: number; im: number }[]): { re: number; im: number }[] {
    const n = x.length;

    if (n <= 1) return x;

    const even = this.fftRecursive(x.filter((_, i) => i % 2 === 0));
    const odd = this.fftRecursive(x.filter((_, i) => i % 2 === 1));

    const result: { re: number; im: number }[] = [];

    for (let k = 0; k < n / 2; k++) {
      const angle = -2 * Math.PI * k / n;
      const twiddle = {
        re: Math.cos(angle),
        im: Math.sin(angle),
      };

      const t = this.complexMultiply(twiddle, odd[k]);

      result[k] = this.complexAdd(even[k], t);
      result[k + n / 2] = this.complexSubtract(even[k], t);
    }

    return result;
  }

  private static complexMultiply(a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } {
    return {
      re: a.re * b.re - a.im * b.im,
      im: a.re * b.im + a.im * b.re,
    };
  }

  private static complexAdd(a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } {
    return {
      re: a.re + b.re,
      im: a.im + b.im,
    };
  }

  private static complexSubtract(a: { re: number; im: number }, b: { re: number; im: number }): { re: number; im: number } {
    return {
      re: a.re - b.re,
      im: a.im - b.im,
    };
  }

  /**
   * Find dominant frequencies in signal
   */
  static findDominantFrequencies(signal: number[], topN: number = 5): { frequency: number; magnitude: number }[] {
    const { frequencies, magnitudes } = this.computeFFT(signal);

    const peaks = frequencies
      .map((freq, idx) => ({ frequency: freq, magnitude: magnitudes[idx] }))
      .filter((_, idx) => idx > 0 && idx < frequencies.length / 2) // Ignore DC and negative frequencies
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, topN);

    return peaks;
  }

  /**
   * Power Spectral Density
   */
  static computePSD(signal: number[]): { frequencies: number[]; psd: number[] } {
    const { frequencies, magnitudes } = this.computeFFT(signal);
    const n = signal.length;

    const psd = magnitudes.map(mag => (mag * mag) / n);

    return { frequencies: frequencies.slice(0, n / 2), psd: psd.slice(0, n / 2) };
  }
}

/**
 * Wavelet Transform for multi-resolution analysis
 */
export class WaveletAnalyzer {
  /**
   * Continuous Wavelet Transform using Morlet wavelet
   */
  static cwt(signal: number[], scales: number[]): number[][] {
    const n = signal.length;
    const result: number[][] = [];

    for (const scale of scales) {
      const row: number[] = [];

      for (let position = 0; position < n; position++) {
        let sum = 0;

        for (let t = 0; t < n; t++) {
          const wavelet = this.morletWavelet((t - position) / scale);
          sum += signal[t] * wavelet;
        }

        row.push(Math.abs(sum));
      }

      result.push(row);
    }

    return result;
  }

  /**
   * Morlet wavelet function
   */
  private static morletWavelet(t: number): number {
    const sigma = 1;
    const omega = 5;

    return Math.exp(-(t * t) / (2 * sigma * sigma)) * Math.cos(omega * t);
  }

  /**
   * Discrete Wavelet Transform (Haar wavelet)
   */
  static dwt(signal: number[]): { approximation: number[]; detail: number[] } {
    const n = signal.length;
    const approximation: number[] = [];
    const detail: number[] = [];

    for (let i = 0; i < n - 1; i += 2) {
      approximation.push((signal[i] + signal[i + 1]) / Math.sqrt(2));
      detail.push((signal[i] - signal[i + 1]) / Math.sqrt(2));
    }

    return { approximation, detail };
  }
}

/**
 * Statistical Analysis Tools
 */
export class StatisticalAnalyzer {
  /**
   * Compute comprehensive statistics
   */
  static computeStatistics(data: number[]): DataStatistics {
    const sorted = [...data].sort((a, b) => a - b);
    const n = data.length;

    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const min = sorted[0];
    const max = sorted[n - 1];
    const percentile25 = sorted[Math.floor(n * 0.25)];
    const percentile75 = sorted[Math.floor(n * 0.75)];

    // Skewness
    const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;

    // Kurtosis
    const kurtosis = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;

    return {
      mean,
      median,
      stdDev,
      min,
      max,
      percentile25,
      percentile75,
      skewness,
      kurtosis,
    };
  }

  /**
   * Moving average
   */
  static movingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }

    return result;
  }

  /**
   * Exponential moving average
   */
  static exponentialMovingAverage(data: number[], alpha: number = 0.3): number[] {
    const result: number[] = [data[0]];

    for (let i = 1; i < data.length; i++) {
      const ema = alpha * data[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }

    return result;
  }

  /**
   * Calculate correlation coefficient between two datasets
   */
  static correlation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
    const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    return numerator / Math.sqrt(denomX * denomY);
  }

  /**
   * Compute correlation matrix for multiple datasets
   */
  static correlationMatrix(datasets: number[][]): number[][] {
    const n = datasets.length;
    const matrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < n; j++) {
        row.push(this.correlation(datasets[i], datasets[j]));
      }
      matrix.push(row);
    }

    return matrix;
  }

  /**
   * Linear regression
   */
  static linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length;
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, idx) => sum + val * y[idx], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const meanY = sumY / n;
    const ssTotal = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
    const ssResidual = y.reduce((sum, val, idx) => {
      const predicted = slope * x[idx] + intercept;
      return sum + Math.pow(val - predicted, 2);
    }, 0);
    const r2 = 1 - ssResidual / ssTotal;

    return { slope, intercept, r2 };
  }

  /**
   * Detect outliers using IQR method
   */
  static detectOutliers(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;

    const q1 = sorted[Math.floor(n * 0.25)];
    const q3 = sorted[Math.floor(n * 0.75)];
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data
      .map((val, idx) => (val < lowerBound || val > upperBound ? idx : -1))
      .filter(idx => idx >= 0);
  }

  /**
   * Autocorrelation function
   */
  static autocorrelation(data: number[], maxLag: number = 50): number[] {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);

    const acf: number[] = [];

    for (let lag = 0; lag <= maxLag; lag++) {
      let sum = 0;

      for (let i = 0; i < data.length - lag; i++) {
        sum += (data[i] - mean) * (data[i + lag] - mean);
      }

      acf.push(sum / variance);
    }

    return acf;
  }

  /**
   * Seasonal decomposition (additive model)
   */
  static seasonalDecomposition(data: number[], period: number): {
    trend: number[];
    seasonal: number[];
    residual: number[];
  } {
    // Compute trend using moving average
    const trend = this.movingAverage(data, period);

    // Detrend
    const detrended = data.map((val, idx) => val - trend[idx]);

    // Compute seasonal component
    const seasonal: number[] = [];
    const seasonalAverages = Array(period).fill(0);
    const seasonalCounts = Array(period).fill(0);

    detrended.forEach((val, idx) => {
      const seasonIdx = idx % period;
      seasonalAverages[seasonIdx] += val;
      seasonalCounts[seasonIdx]++;
    });

    for (let i = 0; i < period; i++) {
      seasonalAverages[i] /= seasonalCounts[i];
    }

    data.forEach((_, idx) => {
      seasonal.push(seasonalAverages[idx % period]);
    });

    // Compute residual
    const residual = data.map((val, idx) => val - trend[idx] - seasonal[idx]);

    return { trend, seasonal, residual };
  }
}

/**
 * Signal Processing Utilities
 */
export class SignalProcessor {
  /**
   * Low-pass filter (simple moving average)
   */
  static lowPassFilter(signal: number[], cutoff: number): number[] {
    return StatisticalAnalyzer.movingAverage(signal, cutoff);
  }

  /**
   * High-pass filter
   */
  static highPassFilter(signal: number[], cutoff: number): number[] {
    const lowPass = this.lowPassFilter(signal, cutoff);
    return signal.map((val, idx) => val - lowPass[idx]);
  }

  /**
   * Bandpass filter
   */
  static bandPassFilter(signal: number[], lowCutoff: number, highCutoff: number): number[] {
    const lowPass = this.lowPassFilter(signal, highCutoff);
    return this.highPassFilter(lowPass, lowCutoff);
  }

  /**
   * Detrend signal (remove linear trend)
   */
  static detrend(signal: number[]): number[] {
    const x = Array.from({ length: signal.length }, (_, i) => i);
    const { slope, intercept } = StatisticalAnalyzer.linearRegression(x, signal);

    return signal.map((val, idx) => val - (slope * idx + intercept));
  }

  /**
   * Normalize signal to 0-1 range
   */
  static normalize(signal: number[]): number[] {
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const range = max - min;

    return signal.map(val => (val - min) / range);
  }

  /**
   * Standardize signal (z-score normalization)
   */
  static standardize(signal: number[]): number[] {
    const mean = signal.reduce((sum, val) => sum + val, 0) / signal.length;
    const stdDev = Math.sqrt(
      signal.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / signal.length
    );

    return signal.map(val => (val - mean) / stdDev);
  }

  /**
   * Smooth signal using Savitzky-Golay filter
   */
  static smoothSavitzkyGolay(signal: number[], windowSize: number = 5): number[] {
    // Simplified Savitzky-Golay filter (polynomial order 2)
    const halfWindow = Math.floor(windowSize / 2);
    const result: number[] = [];

    for (let i = 0; i < signal.length; i++) {
      const start = Math.max(0, i - halfWindow);
      const end = Math.min(signal.length, i + halfWindow + 1);
      const window = signal.slice(start, end);

      const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
      result.push(avg);
    }

    return result;
  }
}

/**
 * Time Series Analysis
 */
export class TimeSeriesAnalyzer {
  /**
   * Detect change points in time series
   */
  static detectChangePoints(data: number[], threshold: number = 2): number[] {
    const changePoints: number[] = [];
    const windowSize = 10;

    for (let i = windowSize; i < data.length - windowSize; i++) {
      const before = data.slice(i - windowSize, i);
      const after = data.slice(i, i + windowSize);

      const meanBefore = before.reduce((sum, val) => sum + val, 0) / windowSize;
      const meanAfter = after.reduce((sum, val) => sum + val, 0) / windowSize;

      const stdDev = Math.sqrt(
        [...before, ...after].reduce((sum, val) => {
          const mean = (meanBefore + meanAfter) / 2;
          return sum + Math.pow(val - mean, 2);
        }, 0) / (2 * windowSize)
      );

      const zScore = Math.abs(meanAfter - meanBefore) / stdDev;

      if (zScore > threshold) {
        changePoints.push(i);
      }
    }

    return changePoints;
  }

  /**
   * Calculate rate of change
   */
  static rateOfChange(data: number[], period: number = 1): number[] {
    const roc: number[] = [];

    for (let i = period; i < data.length; i++) {
      const change = (data[i] - data[i - period]) / data[i - period] * 100;
      roc.push(change);
    }

    return roc;
  }

  /**
   * Momentum indicator
   */
  static momentum(data: number[], period: number = 10): number[] {
    const momentum: number[] = [];

    for (let i = period; i < data.length; i++) {
      momentum.push(data[i] - data[i - period]);
    }

    return momentum;
  }
}

export {
  FFTAnalyzer as FFT,
  WaveletAnalyzer as Wavelet,
  StatisticalAnalyzer as Statistics,
  SignalProcessor as Signal,
  TimeSeriesAnalyzer as TimeSeries,
};
