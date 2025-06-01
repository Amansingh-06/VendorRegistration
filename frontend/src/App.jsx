import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationPage from './components/VendorRegistration';
import Header from './components/Header';
import OrderPage from './pages/OrderPage';
import AddEditItem from './pages/AddEditItems';
import Login from './pages/Login/Login';
import Otp from './pages/Login/Otp';
import PrivateRoute from './Routes/ProtectedRoutes';

function App() {
  return (
    <Router>
      <div className="flex flex-col gap-2 bg-gray-100 font-family-poppins">
        {/* ✅ Common Header (optional) */}
        

        {/* ✅ Routes */}
        <Routes>
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/manage-items" element={<AddEditItem />} />
          <Route
            path="/user-registration"
            element={
              <PrivateRoute>
                <RegistrationPage />
              </PrivateRoute>
            }
          />          <Route path="/" element={<Login />} />
          <Route path="/otp" element={<Otp />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
