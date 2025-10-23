import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import GlobeView from "./GlobeView.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobeView />
  </StrictMode>,
)