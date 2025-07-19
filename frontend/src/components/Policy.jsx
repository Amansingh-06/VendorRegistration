import React, { useEffect, useState } from 'react'
import Header from './Header'
// import Navbar from '../../components/privacypolicy/Navbar'

const Policy = () => {
//   const [isNavbar, setIsNavbar] = useState(false)

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsNavbar(true)
//     }, 500)

//     return () => clearTimeout(timer)
//   }, [])

  return (
    <div className="min-h-screen bg-white text-gray">
      {/* Navbar Transition Wrapper */}
      {/* <div
        className={`transition-all duration-500 transform ${
          isNavbar ? 'opacity-100 -translate-y-12' : 'opacity-0 -translate-y-16'
        }`}
      >
        {isNavbar && <Navbar />}
      </div> */}

          {/* Privacy Policy Content */}
          <Header title='PRIVACY POLICY'/>
      <div className="max-w-2xl mx-auto mt-12 px-3 py-8 bg-yellow-50 min-h-screen">
        <h1 className="text-2xl lg:text-3xl font-bold text-orange mb-4">Privacy Policy</h1>
        <p className="text-base lg:text-lg mb-6 text-gray-dark">
          At XMeals, your privacy is important to us. We are committed to protecting your personal information and being transparent about how we use it.
        </p>

        <h2 className="text-lg font-semibold text-orange mb-2">Information We Collect</h2>
        <ul className="list-disc pl-6 mb-6 text-gray">
          <li>Your name, phone number, and address for order delivery.</li>
          <li>Order history and preferences to improve your experience.</li>
          <li>Device and usage data to enhance app performance.</li>
        </ul>

        <h2 className="text-lg font-semibold text-orange mb-2">How We Use Your Information</h2>
        <ul className="list-disc pl-6 mb-6 text-gray">
          <li>To process and deliver your food orders.</li>
          <li>To personalize offers and recommendations.</li>
          <li>To communicate order updates and support.</li>
        </ul>

        <h2 className="text-lg font-semibold text-orange mb-2">Your Choices & Rights</h2>
        <ul className="list-disc pl-6 mb-6 text-gray">
          <li>You can update your profile information anytime.</li>
          <li>Your data is never sold to third parties.</li>
          <li>Contact support for any privacy concerns.</li>
        </ul>

        <p className="text-sm text-gray mt-4">
          For more details, please contact us at <span className="text-orange font-semibold">support@xmeals.com</span>.
        </p>
      </div>
    </div>
  )
}

export default Policy