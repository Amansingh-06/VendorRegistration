import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/VendorRegistration';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AddEditItem from './pages/AddEditItems';
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

// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout'; // 👈 import your new Layout
// ... all other imports remain

function App() {
  return (
    <Router>
      <div className="font-family-poppins">
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
            {/* Routes under Layout */}
            <Route path="/home" element={<OrderPage />} />
            <Route path="/manage-items" element={<ManageItemsPage />} />
            <Route path="/add-items" element={<AddEditItem />} />
            <Route path="/earning" element={<VendorEarnings />} />
            <Route path="/profile" element={<VendorProfile />} />
            <Route path="/address" element={<Address />} />
            <Route path="/edit_address" element={<EditAddress />} />
          </Route>

        </Routes>

        <InstallPrompt />
      </div>
    </Router>
  );
}

export default App;

