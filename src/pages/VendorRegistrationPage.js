import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { authApi } from '../services/authApi';

const VendorRegistrationPage = ({ setCurrentPage, setCurrentUser }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: '',
    fullName: '',
    email: '',
    serviceCategory: '',
    budgetMin: '',
    budgetMax: '',
    phone: '',
    phoneCountry: '+91', // Default to India
    username: '',
    password: '',
    address: '',
    city: ''
  });

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

  const getCurrentCountryInfo = () => {
    return countryCodes.find(c => c.code === formData.phoneCountry) || countryCodes[0];
  };

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

  // Enhanced phone number validation with only numbers allowed
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

  // Only allow numbers in phone input
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
    setLoading(true);
    setError('');

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidationError = validatePhoneNumber(formData.phone, formData.phoneCountry);
      if (phoneValidationError) {
        setError(phoneValidationError);
        setLoading(false);
        return;
      }
    }

    // Simple password validation
    const passwordValidationError = validatePassword(formData.password);
    if (passwordValidationError) {
      setError(passwordValidationError);
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.businessName || !formData.fullName || !formData.email ||
        !formData.serviceCategory || !formData.username || !formData.password) {
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
        username: formData.username,
        phone: fullPhoneNumber,
        userType: 'vendor',
        // Vendor specific fields
        businessName: formData.businessName,
        serviceCategory: formData.serviceCategory,
        budgetMin: formData.budgetMin || 0,
        budgetMax: formData.budgetMax || 0,
        address: formData.address || '',
        city: formData.city || ''
      };

      console.log("📤 Sending vendor registration data:", userData);

      // Send to backend
      const result = await authApi.register(userData);
      console.log("📥 Registration response:", result);
      
      if (result.user) {
        // Show success message
        setSuccess(true);
        alert('Registration successful! Please login with your credentials.');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          setCurrentPage('login-page');
        }, 1500);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Service category options
  const serviceCategories = [
    { value: 'catering', label: t('catering') },
    { value: 'photography', label: t('photography') },
    { value: 'venue', label: t('venue') },
    { value: 'decoration', label: t('decoration') },
    { value: 'entertainment', label: t('entertainment') },
    { value: 'audio_visual', label: t('audio_visual') },
    { value: 'designer', label: t('designer') }
  ];

  const currentCountry = getCurrentCountryInfo();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'linear-gradient(135deg, #ffe6f0, #f3e6ff, #f0e6ff)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '32px',
        maxWidth: '800px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(178, 102, 255, 0.15)',
        border: '1px solid rgba(178, 102, 255, 0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          {/* Store Icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            borderRadius: '24px',
            color: 'white',
            fontSize: '2.2rem',
            margin: '0 auto 20px',
            boxShadow: '0 10px 25px rgba(178, 102, 255, 0.3)'
          }}>
            <i className="fas fa-store"></i>
          </div>
          <h2 style={{ 
            fontSize: '2rem', 
            marginBottom: '10px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t('vendor_registration')}
          </h2>
          <p style={{ 
            color: '#4a4a4a', 
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            {t('join_vendor_network')}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            fontSize: '0.95rem',
            textAlign: 'center',
            border: '1px solid #a5d6a7'
          }}>
            <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
            Registration successful! Redirecting to login...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '25px',
            fontSize: '0.95rem',
            textAlign: 'center',
            border: '1px solid #ffcdd2'
          }}>
            <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Business Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex',
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d2d2d',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-building" style={{ color: '#b266ff' }}></i>
              {t('business_name')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
            </label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              style={inputStyle}
              placeholder={t('business_name')}
              required
              disabled={loading || success}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
            />
          </div>

          {/* Full Name & Email - Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-user-tie" style={{ color: '#b266ff' }}></i>
                {t('full_name')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('full_name')}
                required
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-envelope" style={{ color: '#b266ff' }}></i>
                {t('email_address')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('email_address')}
                required
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
          </div>

          {/* Service Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex',
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d2d2d',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-tag" style={{ color: '#b266ff' }}></i>
              {t('service_category')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
            </label>
            <select
              name="serviceCategory"
              value={formData.serviceCategory}
              onChange={handleChange}
              style={selectStyle}
              required
              disabled={loading || success}
              onFocus={(e) => e.target.style.borderColor = '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
            >
              <option value="">{t('select_service')}</option>
              {serviceCategories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Budget Min & Max - Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-rupee-sign" style={{ color: '#b266ff' }}></i>
                {t('budget_min')}
              </label>
              <input
                type="number"
                name="budgetMin"
                value={formData.budgetMin}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('budget_min')}
                min="0"
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-rupee-sign" style={{ color: '#b266ff' }}></i>
                {t('budget_max')}
              </label>
              <input
                type="number"
                name="budgetMax"
                value={formData.budgetMax}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('budget_max')}
                min="0"
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
          </div>

          {/* Phone with Country Code & Username - Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-phone" style={{ color: '#b266ff' }}></i>
                {t('contact_phone')}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={formData.phoneCountry}
                  onChange={handleCountryChange}
                  style={{
                    width: '100px',
                    padding: '14px 8px',
                    border: `2px solid ${phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}`,
                    borderRadius: '16px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                  disabled={loading || success}
                  onFocus={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : '#b266ff'}
                  onBlur={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  pattern="\d*"
                  style={{
                    flex: 1,
                    padding: '14px 12px',
                    border: `2px solid ${phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}`,
                    borderRadius: '16px',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  placeholder={`${currentCountry.maxLength} digits (e.g., ${currentCountry.example})`}
                  disabled={loading || success}
                  onFocus={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : '#b266ff'}
                  onBlur={(e) => e.target.style.borderColor = phoneError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}
                />
              </div>
              
              {/* Phone Info */}
              {formData.phone && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '0.75rem',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="fas fa-info-circle" style={{ color: '#b266ff' }}></i>
                  Full: {formData.phoneCountry}{formData.phone} ({formData.phone.length}/{currentCountry.maxLength} digits)
                </div>
              )}
              
              {phoneError && (
                <div style={{
                  color: '#ff4444',
                  fontSize: '0.8rem',
                  marginTop: '5px',
                  paddingLeft: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="fas fa-exclamation-circle"></i>
                  {phoneError}
                </div>
              )}
              {formData.phone && !phoneError && formData.phone.length === currentCountry.maxLength && (
                <div style={{
                  color: '#00C851',
                  fontSize: '0.8rem',
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
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-user-circle" style={{ color: '#b266ff' }}></i>
                {t('username')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={inputStyle}
                placeholder={t('username')}
                required
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
          </div>

          {/* Address & City - Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-map-marker-alt" style={{ color: '#b266ff' }}></i>
                {t('address') || 'Address'}
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Street address, building, etc."
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
            <div>
              <label style={{ 
                display: 'flex',
                marginBottom: '8px', 
                fontWeight: '600', 
                color: '#2d2d2d',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-city" style={{ color: '#b266ff' }}></i>
                {t('city') || 'City'}
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={inputStyle}
                placeholder="City / Town"
                disabled={loading || success}
                onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex',
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d2d2d',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-lock" style={{ color: '#b266ff' }}></i>
              {t('password')} <span style={{ color: '#ff69b4', marginLeft: '2px' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handlePasswordChange}
              style={{
                ...inputStyle,
                borderColor: passwordError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'
              }}
              placeholder="Create a password (min. 6 characters)"
              required
              disabled={loading || success}
              onFocus={(e) => e.target.style.borderColor = passwordError ? '#ff4444' : '#b266ff'}
              onBlur={(e) => e.target.style.borderColor = passwordError ? '#ff4444' : 'rgba(178, 102, 255, 0.2)'}
            />
            {passwordError && (
              <div style={{
                color: '#ff4444',
                fontSize: '0.8rem',
                marginTop: '5px',
                paddingLeft: '5px'
              }}>
                {passwordError}
              </div>
            )}
            {formData.password && !passwordError && (
              <div style={{
                color: '#00C851',
                fontSize: '0.8rem',
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
            disabled={loading || success || passwordError !== ''}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || success || passwordError) ? '#ccc' : 'linear-gradient(135deg, #ff69b4, #b266ff)',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '700',
              color: 'white',
              cursor: (loading || success || passwordError) ? 'not-allowed' : 'pointer',
              marginBottom: '20px',
              boxShadow: (loading || success || passwordError) ? 'none' : '0 8px 20px rgba(178, 102, 255, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            onMouseEnter={(e) => {
              if (!loading && !success && !passwordError) {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !success && !passwordError) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 20px rgba(178, 102, 255, 0.3)';
              }
            }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Registering...
              </>
            ) : success ? (
              <>
                <i className="fas fa-check"></i>
                Registration Successful!
              </>
            ) : (
              <>
                <i className="fas fa-store"></i>
                {t('register_as_vendor')}
              </>
            )}
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <p style={{ color: '#666' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setCurrentPage('login-page')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b266ff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '1rem'
                }}
                disabled={loading}
              >
                Login here
              </button>
            </p>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setCurrentPage('role-selection-page')}
              style={{
                background: 'none',
                border: 'none',
                color: '#b266ff',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: '600',
                padding: '8px 16px',
                borderRadius: '30px',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = 'rgba(178, 102, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = 'none';
                  e.target.style.transform = 'translateY(0)';
                }
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

// Input style
const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  border: '2px solid rgba(178, 102, 255, 0.2)',
  borderRadius: '16px',
  fontSize: '1rem',
  outline: 'none',
  transition: 'all 0.3s ease',
  backgroundColor: 'white'
};

// Select style
const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b266ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 1rem center',
  backgroundSize: '1rem'
};

export default VendorRegistrationPage;