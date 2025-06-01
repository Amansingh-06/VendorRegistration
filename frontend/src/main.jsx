import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/authContext.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>   {/* 👈 Wrap App */}
      <App />
      <Toaster position="top-center" reverseOrder={false} />
    </AuthProvider>
  </StrictMode>,
)
