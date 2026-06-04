import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import DeployConfigGate from './components/DeployConfigGate.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary
    name="App"
    title="Application error"
    message="The app encountered an unexpected error. Please refresh the page."
  >
    <DeployConfigGate>
      <App />
    </DeployConfigGate>
  </ErrorBoundary>
)
