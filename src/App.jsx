import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Home from './components/Home';
import SideNav from './components/SideNav';
import { logout, isAuthenticated, getUserInfo } from './services/Api';
import './App.css';

const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

function AuthContainer({ onLogin }) {
  const [isLoginForm, setIsLoginForm] = useState(true);

  const handleSwitchToRegister = () => setIsLoginForm(false);
  const handleSwitchToLogin = () => setIsLoginForm(true);

  return (
    <>
      {isLoginForm ? (
        <Login onLogin={onLogin} onSwitchToRegister={handleSwitchToRegister} />
      ) : (
        <Register onLogin={onLogin} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </>
  );
}

function AppContent() {
  const [isAuth, setIsAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();

  const handleActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      if (authenticated) {
        try {
          const userData = await getUserInfo();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user info:', error);
          handleLogout();
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    const inactivityTimer = setInterval(() => {
      if (isAuth && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        handleLogout();
        toast.info('You have been logged out due to inactivity.');
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearInterval(inactivityTimer);
    };
  }, [handleActivity, isAuth]);

  useEffect(() => {
    if (isAuth === false && location.pathname !== '/') {
      navigate('/');
    }
  }, [isAuth, location.pathname, navigate]);

  const handleLogin = async (loginData) => {
    setIsAuth(true);
    localStorage.setItem('authToken', loginData.token);
    const userData = await getUserInfo();
    setUser(userData);
    setLastActivity(Date.now());
    navigate('/chat');  // Redirect to Chat.jsx after successful login
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('lastRoute');
    navigate('/');  // Redirect to login page after logout
  };

  if (isLoading || isAuth === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App" onClick={handleActivity} onKeyDown={handleActivity}>
      {isAuth && <SideNav onLogout={handleLogout} />}
      <div className="content">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuth ? 
                <Navigate to="/chat" /> : 
                <AuthContainer onLogin={handleLogin} />
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
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;