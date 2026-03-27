// src/pages/UserRegistrationPage.js
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
// eslint-disable-next-line no-unused-vars
import { authApi } from '../services/authApi';

const UserRegistrationPage = ({ setCurrentPage, setCurrentUser }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    phoneCountry: '+91', // Default to India
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Country codes with their patterns and examples
  const countryCodes = [
    { code: '+1', country: 'USA/Canada', pattern: /^\d{10}$/, example: '4155551234', maxLength: 10 },
    { code: '+44', country: 'UK', pattern: /^\d{10}$/, example: '7911123456', maxLength: 10 },
    { code: '+91', country: 'India', pattern: /^\d{10}$/, example: '9876543210', maxLength: 10 },
    { code: '+61', country: 'Australia', pattern: /^\d{9}$/, example: '412345678', maxLength: 9 },
    { code: '+86', country: 'China', pattern: /^\d{11}$/, example: '13912345678', maxLength: 11 },
    { code: '+81', country: 'Japan', pattern: /^\d{10}$/, example: '9012345678', maxLength: 10 },
    { code: '+49', country: 'Germany', pattern: /^\d{10,11}$/, example: '15123456789', maxLength: 11 },
    { code: '+33', country: 'France', pattern: /^\d{9}$/, example: '612345678', maxLength: 9 },
    { code: '+39', country: 'Italy', pattern: /^\d{10}$/, example: '3123456789', maxLength: 10 },
    { code: '+34', country: 'Spain', pattern: /^\d{9}$/, example: '612345678', maxLength: 9 },
    { code: '+55', country: 'Brazil', pattern: /^\d{10,11}$/, example: '11912345678', maxLength: 11 },
    { code: '+52', country: 'Mexico', pattern: /^\d{10}$/, example: '5512345678', maxLength: 10 },
    { code: '+7', country: 'Russia', pattern: /^\d{10}$/, example: '9123456789', maxLength: 10 },
    { code: '+82', country: 'South Korea', pattern: /^\d{10}$/, example: '1012345678', maxLength: 10 },
    { code: '+65', country: 'Singapore', pattern: /^\d{8}$/, example: '91234567', maxLength: 8 },
    { code: '+60', country: 'Malaysia', pattern: /^\d{9,10}$/, example: '123456789', maxLength: 10 },
    { code: '+62', country: 'Indonesia', pattern: /^\d{9,12}$/, example: '8123456789', maxLength: 12 },
    { code: '+66', country: 'Thailand', pattern: /^\d{9}$/, example: '812345678', maxLength: 9 },
    { code: '+84', country: 'Vietnam', pattern: /^\d{9,10}$/, example: '912345678', maxLength: 10 },
    { code: '+63', country: 'Philippines', pattern: /^\d{10}$/, example: '9171234567', maxLength: 10 },
    { code: '+27', country: 'South Africa', pattern: /^\d{9}$/, example: '821234567', maxLength: 9 },
    { code: '+20', country: 'Egypt', pattern: /^\d{10}$/, example: '1001234567', maxLength: 10 },
    { code: '+971', country: 'UAE', pattern: /^\d{9}$/, example: '501234567', maxLength: 9 },
    { code: '+966', country: 'Saudi Arabia', pattern: /^\d{9}$/, example: '501234567', maxLength: 9 },
    { code: '+974', country: 'Qatar', pattern: /^\d{8}$/, example: '33123456', maxLength: 8 },
    { code: '+972', country: 'Israel', pattern: /^\d{9}$/, example: '501234567', maxLength: 9 },
    { code: '+47', country: 'Norway', pattern: /^\d{8}$/, example: '41234567', maxLength: 8 },
    { code: '+46', country: 'Sweden', pattern: /^\d{9}$/, example: '701234567', maxLength: 9 },
    { code: '+45', country: 'Denmark', pattern: /^\d{8}$/, example: '12345678', maxLength: 8 },
    { code: '+358', country: 'Finland', pattern: /^\d{9}$/, example: '401234567', maxLength: 9 },
    { code: '+31', country: 'Netherlands', pattern: /^\d{9}$/, example: '612345678', maxLength: 9 },
    { code: '+32', country: 'Belgium', pattern: /^\d{9}$/, example: '471234567', maxLength: 9 },
    { code: '+41', country: 'Switzerland', pattern: /^\d{9}$/, example: '791234567', maxLength: 9 },
    { code: '+43', country: 'Austria', pattern: /^\d{10}$/, example: '6641234567', maxLength: 10 },
    { code: '+48', country: 'Poland', pattern: /^\d{9}$/, example: '601234567', maxLength: 9 },
    { code: '+420', country: 'Czech Republic', pattern: /^\d{9}$/, example: '601123456', maxLength: 9 },
    { code: '+36', country: 'Hungary', pattern: /^\d{9}$/, example: '301234567', maxLength: 9 },
    { code: '+30', country: 'Greece', pattern: /^\d{10}$/, example: '6912345678', maxLength: 10 },
    { code: '+351', country: 'Portugal', pattern: /^\d{9}$/, example: '912345678', maxLength: 9 },
    { code: '+353', country: 'Ireland', pattern: /^\d{9}$/, example: '851234567', maxLength: 9 },
    { code: '+64', country: 'New Zealand', pattern: /^\d{8,10}$/, example: '211234567', maxLength: 10 },
    { code: '+852', country: 'Hong Kong', pattern: /^\d{8}$/, example: '91234567', maxLength: 8 },
    { code: '+886', country: 'Taiwan', pattern: /^\d{9}$/, example: '912345678', maxLength: 9 },
    { code: '+94', country: 'Sri Lanka', pattern: /^\d{9}$/, example: '771234567', maxLength: 9 },
    { code: '+92', country: 'Pakistan', pattern: /^\d{10}$/, example: '3001234567', maxLength: 10 },
    { code: '+880', country: 'Bangladesh', pattern: /^\d{10}$/, example: '1712345678', maxLength: 10 },
    { code: '+98', country: 'Iran', pattern: /^\d{10}$/, example: '9123456789', maxLength: 10 },
    { code: '+90', country: 'Turkey', pattern: /^\d{10}$/, example: '5321234567', maxLength: 10 },
    { code: '+54', country: 'Argentina', pattern: /^\d{10}$/, example: '9112345678', maxLength: 10 },
    { code: '+56', country: 'Chile', pattern: /^\d{9}$/, example: '912345678', maxLength: 9 },
    { code: '+57', country: 'Colombia', pattern: /^\d{10}$/, example: '3001234567', maxLength: 10 },
    { code: '+51', country: 'Peru', pattern: /^\d{9}$/, example: '912345678', maxLength: 9 },
    { code: '+58', country: 'Venezuela', pattern: /^\d{10}$/, example: '4121234567', maxLength: 10 },
  ];

  // Simple password validation
  const validatePassword = (password) => {
    if (!password) return '';
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({
      ...formData,
      password: newPassword
    });
    
    const error = validatePassword(newPassword);
    setPasswordError(error);
  };

  const getCurrentCountryInfo = () => {
    return countryCodes.find(c => c.code === formData.phoneCountry) || countryCodes[0];
  };

  // UPDATED: Enhanced phone number validation with only numbers allowed
  const validatePhoneNumber = (phone, countryCode) => {
    if (!phone) return ''; // Phone is optional
    
    const countryInfo = countryCodes.find(c => c.code === countryCode);
    if (!countryInfo) return 'Invalid country code';
    
    // Remove any non-digit characters from the phone number
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length === 0) return '';
    
    // Check if the input contains any non-digit characters
    if (phone !== cleanPhone) {
      return 'Only numbers are allowed';
    }
    
    // Check length based on country
    const expectedLength = countryInfo.maxLength;
    if (cleanPhone.length !== expectedLength) {
      return `${countryInfo.country} phone numbers must be exactly ${expectedLength} digits (e.g., ${countryInfo.example})`;
    }
    
    // Validate pattern
    if (!countryInfo.pattern.test(cleanPhone)) {
      return `Please enter a valid ${countryInfo.country} phone number (e.g., ${countryInfo.example})`;
    }
    
    return '';
  };

  // UPDATED: Only allow numbers in phone input
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    // Allow only numbers (remove any non-digit characters)
    const numbersOnly = rawValue.replace(/\D/g, '');
    
    const countryInfo = countryCodes.find(c => c.code === formData.phoneCountry);
    const maxLength = countryInfo?.maxLength || 10;
    
    // Limit to country's max length
    const limitedValue = numbersOnly.slice(0, maxLength);
    
    setFormData({
      ...formData,
      phone: limitedValue
    });
    
    const error = validatePhoneNumber(limitedValue, formData.phoneCountry);
    setPhoneError(error);
  };

  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setFormData({
      ...formData,
      phoneCountry: newCountry,
      phone: '' // Clear phone when country changes
    });
    setPhoneError(''); // Clear error when country changes
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📝 Form submitted", formData);
    
    // Validate phone if provided
    if (formData.phone) {
      const phoneValidationError = validatePhoneNumber(formData.phone, formData.phoneCountry);
      if (phoneValidationError) {
        setError(phoneValidationError);
        return;
      }
    }

    // Simple password validation
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      return;
    }
    
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Prepare full phone number with country code
      const fullPhoneNumber = formData.phone ? `${formData.phoneCountry}${formData.phone}` : '';
      
      // Prepare data for API
      const userData = {
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username || formData.email.split('@')[0],
        phone: fullPhoneNumber,
        userType: 'planner'
      };

      console.log("📤 Sending to API:", userData);
      
      // Make sure we're using the correct URL
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      console.log("📥 API Response:", result);
      
      if (result.user) {
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        
        // Update parent component
        setCurrentUser(result.user);
        
        // Show success message
        alert('Registration successful!');
        
        // Redirect to dashboard
        setCurrentPage('user-dashboard');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error("🔥 Network Error:", error);
      setError('Cannot connect to server. Make sure Flask is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const currentCountry = getCurrentCountryInfo();

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
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '40px',
        padding: '50px',
        boxShadow: '0 20px 60px rgba(178, 102, 255, 0.2)',
        border: '1px solid rgba(178, 102, 255, 0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
          }}>
            <i className="fas fa-dove" style={{ fontSize: '2.5rem', color: 'white' }}></i>
          </div>
          <h2 style={{
            fontSize: '2rem',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            {t('create_user_account')}
          </h2>
          <p style={{ color: '#666' }}>{t('join_as_planner')}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#2d2d2d',
              fontWeight: '600'
            }}>
              <i className="fas fa-user" style={{ color: '#b266ff' }}></i>
              {t('full_name')} *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '2px solid rgba(178, 102, 255, 0.2)',
                borderRadius: '16px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#2d2d2d',
              fontWeight: '600'
            }}>
              <i className="fas fa-envelope" style={{ color: '#b266ff' }}></i>
              {t('email_address')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '2px solid rgba(178, 102, 255, 0.2)',
                borderRadius: '16px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
            />
          </div>

          {/* Phone with Country Code - UPDATED */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#2d2d2d',
              fontWeight: '600'
            }}>
              <i className="fas fa-phone" style={{ color: '#b266ff' }}></i>
              {t('phone_number')}
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={formData.phoneCountry}
                onChange={handleCountryChange}
                style={{
                  width: '140px',
                  padding: '14px 10px',
                  border: '2px solid rgba(178, 102, 255, 0.2)',
                  borderRadius: '16px',
                  fontSize: '1rem',
                  outline: 'none',
                  background: 'white',
                  cursor: 'pointer'
                }}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              >
                {countryCodes.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} ({country.country}) {country.maxLength} digits
                  </option>
                ))}
              </select>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={`Enter ${currentCountry.maxLength} digits (e.g., ${currentCountry.example})`}
                inputMode="numeric"
                pattern="\d*"
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  border: `2px solid ${phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}`,
                  borderRadius: '16px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
            
            {/* Phone Number Info */}
            {formData.phone && (
              <div style={{
                marginTop: '8px',
                fontSize: '0.85rem',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="fas fa-info-circle" style={{ color: '#b266ff' }}></i>
                Full number: {formData.phoneCountry}{formData.phone} 
                ({formData.phone.length}/{currentCountry.maxLength} digits)
              </div>
            )}
            
            {phoneError && (
              <div style={{
                color: '#ff4444',
                fontSize: '0.85rem',
                marginTop: '5px',
                paddingLeft: '5px'
              }}>
                <i className="fas fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                {phoneError}
              </div>
            )}
            {formData.phone && !phoneError && formData.phone.length === currentCountry.maxLength && (
              <div style={{
                color: '#00C851',
                fontSize: '0.85rem',
                marginTop: '5px',
                paddingLeft: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="fas fa-check-circle"></i>
                ✓ Valid {currentCountry.country} phone number
              </div>
            )}
          </div>

          {/* Username */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#2d2d2d',
              fontWeight: '600'
            }}>
              <i className="fas fa-at" style={{ color: '#b266ff' }}></i>
              {t('username')}
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '2px solid rgba(178, 102, 255, 0.2)',
                borderRadius: '16px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '8px',
              color: '#2d2d2d',
              fontWeight: '600'
            }}>
              <i className="fas fa-lock" style={{ color: '#b266ff' }}></i>
              {t('create_password')} *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              placeholder="Create a password (min. 6 characters)"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                border: `2px solid ${passwordError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}`,
                borderRadius: '16px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = passwordError ? '#ff4444' : '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = passwordError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}
            />
            {passwordError && (
              <div style={{
                color: '#ff4444',
                fontSize: '0.85rem',
                marginTop: '5px',
                paddingLeft: '5px'
              }}>
                {passwordError}
              </div>
            )}
            {formData.password && !passwordError && (
              <div style={{
                color: '#00C851',
                fontSize: '0.85rem',
                marginTop: '5px',
                paddingLeft: '5px'
              }}>
                ✓ Password meets requirements
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || passwordError !== ''}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || passwordError) ? '#ccc' : 'linear-gradient(135deg, #ff69b4, #b266ff)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: (loading || passwordError) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: (loading || passwordError) ? 'none' : '0 10px 25px rgba(178, 102, 255, 0.4)',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Creating Account...
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                {t('create_account')}
              </>
            )}
          </button>

          {/* Links */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', marginBottom: '10px' }}>
              {t('already_have_account')}
            </p>
            <button
              type="button"
              onClick={() => setCurrentPage('login-page')}
              style={{
                background: 'none',
                border: 'none',
                color: '#b266ff',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {t('sign_in_here')}
            </button>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage('role-selection-page')}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <i className="fas fa-arrow-left"></i>
              {t('back_to_role')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserRegistrationPage;