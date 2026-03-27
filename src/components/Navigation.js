import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Navigation = ({ setCurrentPage, user, setCurrentUser }) => {
  const { t } = useLanguage();

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
    localStorage.removeItem('joynest_user');
    setCurrentPage('landing-page');
  };

  const handleDashboard = () => {
    if (user?.isVendor) {
      setCurrentPage('vendor-dashboard');
    } else {
      setCurrentPage('user-dashboard');
    }
  };

  const getUserInitial = () => {
    if (user?.fullName) return user.fullName.charAt(0).toUpperCase();
    if (user?.businessName) return user.businessName.charAt(0).toUpperCase();
    if (user?.username) return user.username.charAt(0).toUpperCase();
    return 'U';
  };

  const getUserName = () => {
    if (user?.fullName) return user.fullName;
    if (user?.businessName) return user.businessName;
    if (user?.username) return user.username;
    if (user?.email) return user.email;
    return t('user');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      background: 'rgba(255,255,255,0.9)',
      backdropFilter: 'blur(10px)',
      borderBottom: '2px solid rgba(178, 102, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(178, 102, 255, 0.1)'
    }}>
      {/* Logo with Dove Symbol */}
      <div 
        onClick={handleLogoClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <div style={{
          width: '45px',
          height: '45px',
          background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.3rem',
          boxShadow: '0 4px 12px rgba(178, 102, 255, 0.3)'
        }}>
          <i className="fas fa-dove"></i>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2
          }}>
            {t('joynest')}
          </span>
          <span style={{
            fontSize: '0.7rem',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {t('event_management')}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        {/* Language Selector */}
        <LanguageSelector />

        {/* Auth Buttons / User Menu */}
        {!user ? (
          <>
            <button
              onClick={handleSignIn}
              style={{
                padding: '10px 20px',
                background: 'none',
                border: '2px solid #b266ff',
                borderRadius: '40px',
                color: '#b266ff',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#b266ff';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#b266ff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-sign-in-alt"></i>
              {t('sign_in')}
            </button>
            <button
              onClick={handleGetStarted}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                border: 'none',
                borderRadius: '40px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(178, 102, 255, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(178, 102, 255, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(178, 102, 255, 0.3)';
              }}
            >
              <i className="fas fa-user-plus"></i>
              {t('get_started')}
            </button>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '5px 15px',
              background: 'rgba(178, 102, 255, 0.08)',
              borderRadius: '40px',
              border: '1px solid rgba(178, 102, 255, 0.2)'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 10px rgba(178, 102, 255, 0.3)'
              }}>
                {getUserInitial()}
              </div>
              <span style={{
                fontWeight: '600',
                color: '#2d2d2d',
                fontSize: '0.95rem'
              }}>
                {getUserName()}
              </span>
            </div>
            
            <button
              onClick={handleDashboard}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: '2px solid #b266ff',
                borderRadius: '40px',
                color: '#b266ff',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#b266ff';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#b266ff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-tachometer-alt"></i>
              {t('dashboard')}
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 18px',
                background: 'none',
                border: '2px solid #b266ff',
                borderRadius: '40px',
                color: '#b266ff',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#b266ff';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#b266ff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;