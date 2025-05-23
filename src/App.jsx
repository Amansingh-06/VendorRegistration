import React from 'react'
import RegistrationPage from './VendorRegistration'
import Header from './Header'
import TimeClockFull from './ClockPopup'
function App() {
  return (
    <div className='flex flex-col gap-2 bg-gray-100'>
      <Header/>
      <RegistrationPage />
      {/* <TimeClockFull/> */}
    </div>
  )
}

export default App