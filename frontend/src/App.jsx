import React from 'react'
import RegistrationPage from './components/VendorRegistration'
import Header from './components/Header'
function App() {
  return (
    <div className='flex flex-col gap-2 bg-gray-100 font-family-poppins '>
      <Header/>
      <RegistrationPage />
      {/* <TimeClockFull/> */}
    </div>
  )
}

export default App