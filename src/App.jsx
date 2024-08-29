import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import Chat from './components/Chat';
import Home from './components/Home';
import { logout, isAuthenticated, getUserProfile } from './services/Api';

function App() {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (isAuth) {
      fetchUserProfile();
    }
  }, [isAuth]);

  const fetchUserProfile = async () => {
    try {
      const userData = await getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      handleLogout();
    }
  };

  const handleLogin = async (userData) => {
    setIsAuth(true);
    setUser(userData);
  };

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUser(null);
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
      </div>
    </Router>
  );
}

export default App;