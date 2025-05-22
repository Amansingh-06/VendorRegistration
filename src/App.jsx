import React from 'react'
import RegistrationPage from './VendorRegistration'
import Header from './Header'
function App() {
  return (
    <div className='flex flex-col gap-2 bg-gray-100'>
      <Header/>
      <RegistrationPage />
      
    </div>
  )
}

export default App