import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Home from './components/Home';
import { logout, isAuthenticated, getUserInfo } from './services/Api';

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuth) {
      fetchUserInfo();
    }
  }, [isAuth]);

  const fetchUserInfo = async () => {
    try {
      const userId = localStorage.getItem('userId'); // We'll store userId in localStorage after login
      if (userId) {
        const userData = await getUserInfo(userId);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      handleLogout();
    }
  };

  const handleLogin = async (loginData) => {
    setIsAuth(true);
    localStorage.setItem('userId', loginData.userId);
    await fetchUserInfo(); // Fetch user info immediately after login
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem('userId');
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            {isAuth ? (
              <>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/chat">Chat</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : null}
          </ul>
        </nav>

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

        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;