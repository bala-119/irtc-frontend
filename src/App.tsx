import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { api, USER_SERVICE_URL } from './config/api';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import SearchTrains from './pages/SearchTrains';
import AdminDashboard from './pages/AdminDashboard';
import BookTicket from './pages/BookTicket';
import Payment from './pages/Payment';
import Profile from './pages/Profile';
import PNRStatus from './pages/PNRStatus';
import { useAuthStore } from './store/useAuthStore';


function App() {
  const { isAuthenticated, user, login } = useAuthStore();

  useEffect(() => {
    const refreshProfile = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get(`${USER_SERVICE_URL}/v1/user/profile`);
          login(response.data.user || response.data, token);
        } catch (error) {
          console.error('Failed to refresh profile', error);
        }
      }
    };
    refreshProfile();
  }, [login]);


  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<SearchTrains />} />
          <Route path="pnr-status" element={<PNRStatus />} />
          <Route path="pnr-status/:pnr" element={<PNRStatus />} />
          <Route path="book" element={
            isAuthenticated ? <BookTicket /> : <Navigate to="/login" />
          } />

          <Route path="payment/:pnr" element={
            isAuthenticated ? <Payment /> : <Navigate to="/login" />
          } />

          <Route path="bookings" element={
            isAuthenticated ? <MyBookings /> : <Navigate to="/login" />
          } />

          <Route path="profile" element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          } />


          {/* Admin Routes */}
          <Route path="admin/*" element={
            isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
