// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../services/authApi';

const LoginPage = ({ setCurrentPage, setCurrentUser }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError(t('fill_credentials') || 'Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await authApi.login(email, password);
      
      if (result.user) {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update parent component
        setCurrentUser(result.user);
        
        // Show success message
        alert(t('login_success') || 'Login successful!');
        
        // Navigate to appropriate dashboard based on user type
        if (result.user.user_type === 'vendor') {
          setCurrentPage('vendor-dashboard');
        } else {
          setCurrentPage('user-dashboard');
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #fff5f7 0%, #f8f0ff 50%, #fff0f5 100%)'
    }}>
      <div style={{
        maxWidth: '450px',
        width: '100%',
        background: 'white',
        borderRadius: '40px',
        padding: '50px',
        boxShadow: '0 20px 60px rgba(178, 102, 255, 0.2)',
        border: '1px solid rgba(178, 102, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 25px',
            boxShadow: '0 15px 30px rgba(178, 102, 255, 0.3)',
            border: '3px solid white'
          }}>
            <i className="fas fa-dove" style={{
              fontSize: '3rem',
              color: 'white'
            }}></i>
          </div>
          <h2 style={{
            fontSize: '2.2rem',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            {t('welcome_back')}
          </h2>
          <p style={{
            color: '#4a4a4a',
            fontSize: '1.1rem'
          }}>
            {t('sign_in_account')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px 20px',
            borderRadius: '16px',
            marginBottom: '25px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #ffcdd2'
          }}>
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              color: '#2d2d2d',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <i className="fas fa-envelope" style={{ color: '#b266ff' }}></i>
              {t('email_username')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '2px solid rgba(178, 102, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              color: '#2d2d2d',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              <i className="fas fa-lock" style={{ color: '#b266ff' }}></i>
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '15px 20px',
                border: '2px solid rgba(178, 102, 255, 0.2)',
                borderRadius: '20px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              disabled={loading}
            />
          </div>

          <div style={{
            textAlign: 'right',
            marginBottom: '30px'
          }}>
            <button
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: '#b266ff',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '5px'
              }}
            >
              {t('forgot_password')}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '18px',
              background: loading ? '#cccccc' : 'linear-gradient(135deg, #ff69b4, #b266ff)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: loading ? 'none' : '0 10px 25px rgba(178, 102, 255, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 35px rgba(178, 102, 255, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.4)';
              }
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                {t('sign_in')}
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '2px solid rgba(178, 102, 255, 0.1)'
        }}>
          <p style={{ color: '#4a4a4a', marginBottom: '15px' }}>
            {t('no_account')}
          </p>
          <button
            onClick={() => setCurrentPage('role-selection-page')}
            style={{
              background: 'none',
              border: 'none',
              color: '#b266ff',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px'
            }}
          >
            <i className="fas fa-user-plus"></i>
            {t('register_here')}
          </button>
        </div>

        {/* Back Button */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <button
            onClick={() => setCurrentPage('landing-page')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4a4a4a',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#b266ff';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#4a4a4a';
            }}
          >
            <i className="fas fa-arrow-left"></i>
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;