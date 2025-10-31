import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to manage authentication state and protected actions
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for storage changes (multi-tab support)
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  const checkAuthStatus = () => {
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    const userEmail = localStorage.getItem('userEmail');

    setIsAuthenticated(!!authToken);
    
    if (authToken) {
      setUser({
        id: userId,
        username: username,
        email: userEmail,
      });
    } else {
      setUser(null);
    }
  };

  const requireAuth = (callback, message = 'You need to login to perform this action.') => {
    if (!isAuthenticated) {
      const shouldRedirect = window.confirm(`${message} Go to login page?`);
      if (shouldRedirect) {
        navigate('/login');
      }
      return false;
    }
    
    if (callback) {
      callback();
    }
    return true;
  };

  const login = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userData.id || '');
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('userEmail', userData.email || '');
    localStorage.setItem('isAuthenticated', 'true');
    checkAuthStatus();
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    requireAuth,
    login,
    logout,
    checkAuthStatus,
  };
};

export default useAuth;

