import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/authContext.jsx';
import { SearchProvider } from './context/SearchContext.jsx';
import { FetchProvider } from './context/FetchContext.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>   {/* 👈 Wrap App */}
      <SearchProvider>
        <FetchProvider>
        <App />
          <Toaster position="top-center" reverseOrder={false} />
        </FetchProvider>
      </SearchProvider>
    </AuthProvider>
  </StrictMode>,
)
