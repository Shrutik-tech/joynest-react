import React from 'react';
import './Navbar.css';

const Navbar = ({ setCurrentPage, user, setCurrentUser }) => {
  const handleLogoClick = () => {
    setCurrentPage('landing-page');
  };

  const handleSignIn = () => {
    setCurrentPage('login-page');
  };

  const handleGetStarted = () => {
    setCurrentPage('role-selection-page');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('landing-page');
  };

  const handleDashboard = () => {
    if (user?.isVendor) {
      setCurrentPage('vendor-dashboard');
    } else {
      setCurrentPage('user-dashboard');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={handleLogoClick}>
          <div className="joynest-symbol">
            <i className="fas fa-dove"></i>
          </div>
          <div className="logo-text">
            <span className="logo-title rainbow-text">JoyNest</span>
            <span className="logo-subtitle">EVENT MANAGEMENT</span>
          </div>
        </div>

        <div className="navbar-menu">
          {!user ? (
            <>
              <button className="nav-btn" onClick={handleSignIn}>
                <i className="fas fa-sign-in-alt"></i>
                Sign In
              </button>
              <button className="nav-btn nav-btn-primary" onClick={handleGetStarted}>
                <i className="fas fa-user-plus"></i>
                Get Started
              </button>
            </>
          ) : (
            <div className="user-menu">
              <div className="user-avatar">
                {user.name?.charAt(0) || user.businessName?.charAt(0) || 'U'}
              </div>
              <span className="user-name">{user.name || user.businessName || 'User'}</span>
              <button className="nav-btn" onClick={handleDashboard}>
                <i className="fas fa-tachometer-alt"></i>
                Dashboard
              </button>
              <button className="nav-btn" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;