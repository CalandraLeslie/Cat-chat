import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Home from './components/Home';
import SideNav from './components/SideNav';
import { logout, isAuthenticated, getUserInfo } from './services/Api';
import './App.css';

const INACTIVE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [user, setUser] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    if (isAuth) {
      fetchUserInfo();
    }
  }, [isAuth]);

  useEffect(() => {
    if (isAuth) {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => window.addEventListener(event, handleActivity));

      const checkInactivity = setInterval(() => {
        if (Date.now() - lastActivity > INACTIVE_TIMEOUT) {
          handleLogout();
          toast.info('You have been logged out due to inactivity.');
        }
      }, 1000); // Check every second

      return () => {
        events.forEach(event => window.removeEventListener(event, handleActivity));
        clearInterval(checkInactivity);
      };
    }
  }, [isAuth, lastActivity, handleActivity]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userData = await getUserInfo(token);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      handleLogout();
    }
  };

  const handleLogin = async (loginData) => {
    setIsAuth(true);
    localStorage.setItem('authToken', loginData.token);
    setLastActivity(Date.now());
    await fetchUserInfo();
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        {isAuth && <SideNav onLogout={handleLogout} />}
        <div className="content">
          <Routes>
            <Route 
              path="/" 
              element={
                isAuth ? 
                  <Navigate to="/home" /> : 
                  <LoginRegister onLogin={handleLogin} />
              } 
            />
            <Route 
              path="/home" 
              element={
                isAuth ? 
                  <Home user={user} /> : 
                  <Navigate to="/" />
              } 
            />
            <Route 
              path="/profile" 
              element={
                isAuth ? 
                  <Profile user={user} updateUser={setUser} /> : 
                  <Navigate to="/" />
              } 
            />
            <Route 
              path="/chat" 
              element={
                isAuth ? 
                  <Chat user={user} /> : 
                  <Navigate to="/" />
              } 
            />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;