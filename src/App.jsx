import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import Profile from './components/Profile';
import { logout } from './services/Api';

const Home = ({ user }) => (
  <div>
    <h2>Welcome to the Home Page</h2>
    {user && user.avatar && (
      <img 
        src={user.avatar} 
        alt="User Avatar" 
        style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} 
      />
    )}
  </div>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            {isAuthenticated ? (
              <>
                <li><Link to="/home">Home</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : null}
          </ul>
        </nav>

        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                <Navigate to="/home" /> : 
                <LoginRegister onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/home" 
            element={
              isAuthenticated ? 
                <Home user={user} /> : 
                <Navigate to="/" />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? 
                <Profile user={user} /> : 
                <Navigate to="/" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;