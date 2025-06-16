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

function App() {
  return (
    <Router>
      <div className="flex flex-col gap-2 bg-gray-100 font-family-poppins">
        {/* ✅ Common Header (optional) */}


        {/* ✅ Routes */}
        <Routes>
          <Route path="/home" element={
            <PrivateRoute>
              <OrderPage />
            </PrivateRoute>
          } />
          {/* <Route path="/manage-items" element={<AddEditItem />} /> */}
          <Route
            path="/manage-items"
            element={
              <PrivateRoute>
                <ManageItemsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/Add-items"
            element={
              <PrivateRoute>
                <AddEditItem />
              </PrivateRoute>
            }
          />
          <Route
            path='/earning'
            element={<PrivateRoute>
              <VendorEarnings />
            </PrivateRoute>} />
          
          <Route
            path="/vendor-registration"
            element={
              <ProtectedGuestRoute>
                <RegistrationPage />
              </ProtectedGuestRoute>
            }
          />
          <Route path="/" element={
            <ProtectedGuestRoute>
              <Login />
            </ProtectedGuestRoute>
          } />
          <Route
            path="/otp"
            element={
              <ProtectedGuestRoute>
                <Otp />
              </ProtectedGuestRoute>
            }
          />
          {/* Add more routes as needed */}
          <Route
            path="/address"
            element={
              <PrivateRoute>
                <Address />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit_address"
            element={
              <PrivateRoute>
                <EditAddress />
              </PrivateRoute>
            }
          />
          <Route path="/profile" element={
            <PrivateRoute>
              <VendorProfile />
            </PrivateRoute>
          } />

          


        </Routes>
        <InstallPrompt />
        
      </div>
    </Router>
  );
}

export default App;
