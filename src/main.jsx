import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/ai.css'
import './styles/editorial.css'
import './styles/editorial-fixes.css'
import './styles/sync.css'
import './styles/selected-look.css'
import './styles/compact-interactions.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
