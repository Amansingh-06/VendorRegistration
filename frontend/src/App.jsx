import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/VendorRegistration';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AddEditItem from './pages/AddEditItem/AddEditItems';
import Login from './pages/Login/Login';
import Otp from './pages/Login/Otp';
import PrivateRoute from './Routes/ProtectedRoutes';
import ProtectedGuestRoute from './Routes/ProtectedGuestRoutes';
import VendorProfile from './pages/Vendor_profile';
import EditAddress from './pages/Address/EditAddress';
import Address from './pages/Address/Address';
import LocationPopup from './components/LocationPopUP';
import VendorRegistration from './components/VendorRegistration';
import VendorEarnings from './pages/VendorEarning';
import ManageItemsPage from './pages/Manage-item';
import InstallPrompt from './components/InstallPrompt';
import AdminProtectedRoute from './Routes/AdminAccess';
import ScrollToTop from './components/ScrolltoTop';
import Layout from './pages/Layout';
import BackRedirect from './components/BackRedirectToHome';
import Support from './pages/Contactsupport';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log("✅ You are online");
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.warn("📴 You are offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      console.warn("📴 You are offline at first load");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ❌ Don't render anything when offline
  if (!isOnline) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>📴 You are offline</h1>
        <p>Please check your internet connection.</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="poppins-regular">
        <ScrollToTop />
        <BackRedirect/>

        <Routes>
          {/* Guest Routes */}
          <Route path="/" element={<ProtectedGuestRoute><Login /></ProtectedGuestRoute>} />
          <Route path="/otp" element={<ProtectedGuestRoute><Otp /></ProtectedGuestRoute>} />
          <Route path="/vendor-registration" element={<ProtectedGuestRoute><RegistrationPage /></ProtectedGuestRoute>} />

          {/* Protected Layout for all dashboard pages */}
          <Route
            element={
              <AdminProtectedRoute fallback={<PrivateRoute><Layout /></PrivateRoute>}>
                <Layout />
              </AdminProtectedRoute>
            }
          >
            <Route path="/home" element={<OrderPage />} />
            <Route path="/manage-items" element={<ManageItemsPage />} />
            <Route path="/add-items" element={<AddEditItem />} />
            <Route path="/earning" element={<VendorEarnings />} />
            <Route path="/profile" element={<VendorProfile />} />
            <Route path="/address" element={<Address />} />
            <Route path="/edit_address" element={<EditAddress />} />
            <Route path="/support" element={<Support/>} />
            
          </Route>
        </Routes>

        <InstallPrompt />
      </div>
    </Router>
  );
}

export default App;
