import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './v2/v2.css'
import App from './v2/App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
