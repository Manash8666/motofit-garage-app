import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import IntegratedApp from './components/IntegratedApp'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <IntegratedApp />
    </BrowserRouter>
  </StrictMode>,
)
