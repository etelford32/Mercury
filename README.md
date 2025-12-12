# ☿ Mercury Simulation

<div align="center">

![Mercury Simulation](https://img.shields.io/badge/Mercury-Simulation-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**Advanced Solar Wind & Space Weather Analysis Platform**

[Live Demo](https://etelford32.github.io/Mercury/) | [Documentation](#features) | [Report Bug](https://github.com/etelford32/Mercury/issues)

</div>

---

## 🌟 Overview

The Mercury Simulation is a comprehensive, real-time space weather analysis platform that integrates live data from NOAA's Space Weather Prediction Center (SWPC) with machine learning predictions and advanced scientific analysis tools. Experience an interactive 3D visualization of Mercury's interaction with the solar wind, complete with GPU-accelerated particle systems, magnetosphere dynamics, and real-time solar activity monitoring.

## ✨ Features

### 🌞 Real-time SWPC Data Integration
- **Solar Wind Monitoring**: Live speed, density, temperature, and pressure data
- **Interplanetary Magnetic Field (IMF)**: Bt, Bx, By, Bz components in GSM coordinates
- **Solar X-Ray Flux**: Real-time flare detection and classification (A, B, C, M, X-class)
- **Geomagnetic Indices**: Kp, Ap, and Dst indices for storm monitoring
- **Solar Radio Flux**: F10.7 measurements and sunspot numbers
- **CME & Solar Flare Data**: Historical events from NASA DONKI API
- **Mercury Environment**: Magnetosphere, exosphere, and surface conditions

### 🤖 Machine Learning & Predictions
- **LSTM Neural Networks**: TensorFlow.js-powered solar wind speed forecasting
- **Flare Probability**: AI-driven solar flare likelihood predictions
- **Anomaly Detection**: Automatic identification of unusual solar activity
- **Pattern Recognition**: Time series pattern matching and classification
- **K-means Clustering**: Solar event categorization

### 📊 Advanced Scientific Analysis
- **FFT Analysis**: Fast Fourier Transform for frequency domain analysis
- **Wavelet Transforms**: Multi-resolution time-frequency analysis
- **Statistical Tools**: Comprehensive statistics including correlation matrices
- **Time Series Decomposition**: Trend, seasonal, and residual analysis
- **Signal Processing**: Filtering, smoothing, and detrending algorithms

### 🎮 Interactive 3D Visualization
- **Photorealistic Sun**: Animated corona with dynamic solar activity
- **Solar Wind Particles**: GPU-accelerated 50,000-particle simulation
- **Mercury's Magnetosphere**: Real-time compression dynamics based on solar wind pressure
- **Magnetic Field Lines**: Dipole field visualization
- **Bow Shock**: Visualization of solar wind interaction boundary

### 📈 Data Dashboards
- **SWPC Dashboard**: Real-time display of all solar variables
- **Analysis Panel**: Time series charts, correlation matrices, FFT plots
- **Control Panel**: Toggle visualization layers and view ML predictions
- **Responsive Design**: Adapts to desktop and tablet displays

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/etelford32/Mercury.git
cd Mercury

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technology Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework |
| **Three.js** | 3D graphics engine |
| **@react-three/fiber** | React renderer for Three.js |
| **TensorFlow.js** | Machine learning models |
| **Recharts** | Data visualization charts |
| **D3.js** | Advanced visualizations |
| **Zustand** | State management |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |

## 📊 SWPC Variables Measured

The simulation monitors and visualizes all major space weather parameters:

### Solar Wind
- Speed (km/s)
- Density (particles/cm³)
- Temperature (Kelvin)
- Dynamic Pressure (nPa)

### Magnetic Field
- Total field strength (Bt)
- GSM components (Bx, By, Bz)
- Latitude and longitude

### Solar Activity
- X-ray flux (short and long wavelength)
- Flare classification and intensity
- Solar radio flux (F10.7)
- Sunspot numbers

### Geomagnetic Activity
- Kp index (0-9 scale)
- Ap index (daily average)
- Dst index (storm intensity)
- Storm classification levels

### Mercury Environment
- Magnetosphere standoff distance
- Reconnection rate
- Exosphere composition (Na, Ca, H)
- Surface weathering rates

## 🎯 Usage

### Launching the Simulation

1. Open the application in your browser
2. Click "🚀 Launch Simulation" on the landing page
3. Explore the interactive 3D scene using mouse controls:
   - **Left Click + Drag**: Rotate view
   - **Right Click + Drag**: Pan camera
   - **Scroll**: Zoom in/out

### Dashboard Controls

- **Toggle Visualizations**: Use the Advanced Controls panel to show/hide components
- **View Analysis**: Enable the Analysis Panel for scientific tools
- **ML Predictions**: Check real-time solar activity predictions
- **Data Updates**: SWPC data refreshes automatically every minute

## 🔬 Scientific Applications

This simulation is useful for:

- **Space Weather Research**: Analyze Mercury's response to solar conditions
- **Educational Demonstrations**: Teach planetary magnetospheres and solar wind
- **Real-time Monitoring**: Track current space weather conditions
- **Predictive Analysis**: Forecast solar activity using ML models
- **Data Correlation Studies**: Explore relationships between solar variables

## 📂 Project Structure

```
Mercury/
├── src/
│   ├── components/
│   │   ├── Charts/          # Visualization charts
│   │   ├── Dashboard/       # Data dashboards
│   │   ├── Magnetosphere/   # Magnetosphere visualization
│   │   ├── Mercury/         # Mercury planet component
│   │   ├── SolarWind/       # Particle system
│   │   ├── Sun/             # Sun visualization
│   │   └── UI/              # User interface components
│   ├── ml/                  # Machine learning models
│   ├── services/            # SWPC data fetching
│   ├── store/               # State management
│   ├── types/               # TypeScript definitions
│   └── utils/               # Analysis utilities
├── public/                  # Static assets
└── dist/                    # Production build
```

## 🌐 API Integration

### NOAA SWPC APIs
- Solar Wind: `https://services.swpc.noaa.gov/products/solar-wind/`
- X-Ray Flux: `https://services.swpc.noaa.gov/products/goes-xrs-3-day.json`
- Geomagnetic: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`

### NASA DONKI API
- CME Data: `https://api.nasa.gov/DONKI/CME`
- Solar Flares: `https://api.nasa.gov/DONKI/FLR`

*Note: The application includes fallback mock data for offline use.*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Elliot Telford**
- Website: [elliottelford.com](https://elliottelford.com)
- GitHub: [@etelford32](https://github.com/etelford32)

## 🙏 Acknowledgments

- **NOAA SWPC**: For providing real-time space weather data
- **NASA**: For DONKI API access and solar event data
- **Three.js Community**: For excellent 3D graphics tools
- **TensorFlow.js Team**: For browser-based machine learning

## 📸 Screenshots

![Mercury Simulation Dashboard](docs/screenshot-dashboard.png)
*Real-time SWPC data dashboard with solar wind and magnetic field monitoring*

![3D Visualization](docs/screenshot-3d.png)
*Interactive 3D scene showing Sun, solar wind particles, and Mercury's magnetosphere*

![Scientific Analysis](docs/screenshot-analysis.png)
*Advanced analysis tools including FFT, time series, and correlation matrices*

---

<div align="center">

**Built with ❤️ for space weather enthusiasts and researchers**

⭐ Star this repo if you find it useful!

</div>
