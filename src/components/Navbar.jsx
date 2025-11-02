import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusSquare, MessageCircle, User, Snowflake, LogOut, Heart } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      setIsAuthenticated(!!authToken);
    };
    
    checkAuth();
    
    // Listen for storage changes (for multi-tab support)
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setShowProfileMenu(false);
    navigate('/');
  };

  const handleProtectedAction = (action) => {
    if (!isAuthenticated) {
      // Show toast message
      const actionMessages = {
        'favorites': 'Please login to view your favorites',
        'create-post': 'Please login to create a post',
        'messages': 'Please login to view messages',
      };
      
      showToast(
        actionMessages[action] || 'Please login to continue',
        'warning'
      );
    } else {
      // Perform the action
      switch(action) {
        case 'create-post':
          navigate('/create');
          break;
        case 'favorites':
        case 'messages':
          console.log(`Performing action: ${action}`);
          // TODO: Implement actual functionality
          break;
        default:
          break;
      }
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo - Left */}
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <Snowflake className="logo-icon" size={28} />
          <span className="logo-text">SnowHub</span>
        </div>

        {/* Search Bar - Center */}
        <div className="navbar-search">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Search posts, gear, resorts..." 
            className="search-input"
          />
        </div>

        {/* Navigation Icons - Right */}
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              {/* Authenticated User Menu */}
              <button 
                className="nav-icon"
                onClick={() => handleProtectedAction('favorites')}
                title="Favorites"
              >
                <Heart size={24} />
                <span>Favorites</span>
              </button>
              <button 
                className="nav-icon create-btn"
                onClick={() => handleProtectedAction('create-post')}
              >
                <PlusSquare size={24} />
                <span>Post</span>
              </button>
              <button 
                className="nav-icon"
                onClick={() => handleProtectedAction('messages')}
              >
                <MessageCircle size={24} />
                <span>Messages</span>
              </button>
              <div className="profile-menu-wrapper">
                <button 
                  className="nav-icon"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <User size={24} />
                  <span>Profile</span>
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <div className="profile-dropdown-header">
                      <User size={20} />
                      <span>{username}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/profile');
                      }} 
                      className="profile-link-btn"
                    >
                      <User size={18} />
                      <span>View Profile</span>
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Guest User Menu - Single Login/Signup Button */}
              <button 
                className="nav-auth-btn auth-btn"
                onClick={() => navigate('/login')}
              >
                Login / Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

