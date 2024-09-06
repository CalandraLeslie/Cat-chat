import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onLogin }) => {
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
};

export default AuthContainer;