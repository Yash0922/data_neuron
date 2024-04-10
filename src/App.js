import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './component/Navbar';
import SignIn from './pages/SignIn';
import Login from './pages/Login';
import Home from './pages/Home';
import { isLoggedIn } from './utils/auth';
import { ToastContainer,  } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const PrivateRoute = ({ children }) => {
 
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;