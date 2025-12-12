import { Scene } from './components/Mercury/Scene'
import { SWPCDashboard } from './components/Dashboard/SWPCDashboard'
import { AnalysisPanel } from './components/Dashboard/AnalysisPanel'
import { AdvancedControls } from './components/UI/AdvancedControls'
import './App.css'

function App() {
  return (
    <>
      <Scene />
      <SWPCDashboard />
      <AnalysisPanel />
      <AdvancedControls />
    </>
  )
}

export default App
