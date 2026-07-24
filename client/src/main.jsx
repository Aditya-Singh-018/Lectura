import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './App.jsx'
import VideoIngestion from './components/VideoIngestion.jsx'
import KnowledgeGraph from './components/KnowledgeGraph.jsx'
import AdaptiveQuiz from './components/AdaptiveQuiz.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    {/* <VideoIngestion></VideoIngestion> */}
    {/* <KnowledgeGraph></KnowledgeGraph> */}
    <AdaptiveQuiz></AdaptiveQuiz>
  </StrictMode>,
)
