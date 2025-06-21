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

function App() {
  return (
    <Router>
      <div className="flex flex-col gap-2 bg-gray-100 font-family-poppins">
        {/* ✅ Common Header (optional) */}


        {/* ✅ Routes */}
        <Routes>

          
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
          

          {/* ✅ Protected Routes (Admin + Vendor) */}
          <Route path="/home" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <OrderPage />
              </PrivateRoute>
            }>
              <OrderPage />
            </AdminProtectedRoute>
          } />
          <Route path="/manage-items" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <ManageItemsPage />
              </PrivateRoute>
            }>
              <ManageItemsPage />
            </AdminProtectedRoute>
          } />
          <Route path="/Add-items" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <AddEditItem />
              </PrivateRoute>
            }>
              <AddEditItem />
            </AdminProtectedRoute>
          } />
          <Route path="/earning" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <VendorEarnings />
              </PrivateRoute>
            }>
              <VendorEarnings />
            </AdminProtectedRoute>
          } />
          <Route path="/address" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <Address />
              </PrivateRoute>
            }>
              <Address />
            </AdminProtectedRoute>
          } />
          <Route path="/edit_address" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <EditAddress />
              </PrivateRoute>
            }>
              <EditAddress />
            </AdminProtectedRoute>
          } />
          <Route path="/profile" element={
            <AdminProtectedRoute fallback={
              <PrivateRoute>
                <VendorProfile />
              </PrivateRoute>
            }>
              <VendorProfile />
            </AdminProtectedRoute>
          } />

          
          {/* <Route path='/registration' element={<RegistrationPage />} /> */}


        </Routes>
        <InstallPrompt />
        
      </div>
    </Router>
  );
}

export default App;
