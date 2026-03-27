import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './VendorDashboard.css';

const VendorDashboard = ({ setCurrentPage, user }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vendor-profile');
  
  // Vendor profile state - matching registration form EXACTLY
  const [vendorProfile, setVendorProfile] = useState({
    businessName: '',
    fullName: '',
    email: '',
    serviceCategory: '',
    budgetMin: '',
    budgetMax: '',
    contactPhone: '',
    username: '',
    description: ''
  });

  // Avatar state
  const [avatar, setAvatar] = useState(null);
  
  // Stats state
  const [profileViews, setProfileViews] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  
  // Bookings state
  const [vendorBookings, setVendorBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    clientName: '',
    eventType: '',
    date: '',
    time: '',
    location: '',
    guests: '',
    budget: '',
    requirements: '',
    status: 'pending'
  });

  // ============================================
  // Get user ID with proper number conversion
  // ============================================
  const getUserId = useCallback(() => {
    if (user?.id) {
      return parseInt(user.id);
    }
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.id ? parseInt(parsedUser.id) : null;
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return null;
  }, [user]);

  // ============================================
  // Get vendor name
  // ============================================
  const getVendorName = () => {
    if (vendorProfile?.businessName) return vendorProfile.businessName;
    if (vendorProfile?.fullName) return vendorProfile.fullName;
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return t('vendor') || 'Vendor';
  };

  // ============================================
  // Load vendor profile from backend
  // ============================================
  const loadVendorProfile = useCallback(async () => {
    const userId = getUserId();
    console.log("Loading profile for user ID:", userId);
    
    if (!userId) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/vendor/profile/${userId}`);
      console.log("Profile API response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Vendor profile loaded:", data);
        
        // Map database fields to state fields
        setVendorProfile({
          businessName: data.business_name || '',
          fullName: data.full_name || '',
          email: data.email || '',
          serviceCategory: data.service_category || '',
          budgetMin: data.budget_min || '',
          budgetMax: data.budget_max || '',
          contactPhone: data.contact_phone || '',
          username: data.username || '',
          description: data.description || ''
        });

        // Set stats
        setProfileViews(data.views || 0);
        setTotalBookings(data.bookings_count || 0);
      } else if (response.status === 404) {
        // No profile exists yet - use user data from registration
        console.log("No vendor profile found, using user data");
        setVendorProfile({
          businessName: user?.businessName || '',
          fullName: user?.fullName || '',
          email: user?.email || '',
          serviceCategory: user?.serviceCategory || '',
          budgetMin: user?.budgetMin || '',
          budgetMax: user?.budgetMax || '',
          contactPhone: user?.phone || '',
          username: user?.username || '',
          description: user?.description || ''
        });
      }
    } catch (error) {
      console.error('Error loading vendor profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [getUserId, user]);

  // ============================================
  // Load vendor bookings from database
  // ============================================
  const loadVendorBookings = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    setBookingsLoading(true);
    try {
      // First, try to get from localStorage as fallback
      const savedBookings = localStorage.getItem(`joynest_vendor_bookings_${userId}`);
      if (savedBookings) {
        try {
          setVendorBookings(JSON.parse(savedBookings));
        } catch (e) {
          console.error('Error parsing bookings:', e);
        }
      }

      // Then try to get from database
      const response = await fetch(`http://localhost:5000/api/vendor/bookings/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setVendorBookings(data);
        // Update localStorage with database data
        localStorage.setItem(`joynest_vendor_bookings_${userId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error loading vendor bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  }, [getUserId]);

  // ============================================
  // Load avatar
  // ============================================
  const loadAvatar = useCallback(() => {
    const userId = getUserId();
    if (userId) {
      const savedAvatar = localStorage.getItem(`joynest_vendor_avatar_${userId}`);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      }
    }
  }, [getUserId]);

  // ============================================
  // Track profile view
  // ============================================
  const trackProfileView = useCallback(async () => {
    const userId = getUserId();
    if (userId) {
      setProfileViews(prev => prev + 1);
      try {
        await fetch('http://localhost:5000/api/vendor/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendor_id: userId })
        });
      } catch (error) {
        console.error('Error tracking profile view:', error);
      }
    }
  }, [getUserId]);

  // ============================================
  // Load all data on mount
  // ============================================
  useEffect(() => {
    loadVendorProfile();
    loadAvatar();
    loadVendorBookings();
    trackProfileView();
  }, [loadVendorProfile, loadAvatar, loadVendorBookings, trackProfileView]);

  // ============================================
  // Handle profile form change
  // ============================================
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setVendorProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ============================================
  // Handle save profile
  // ============================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const userId = getUserId();
    if (!userId) {
      alert(t('please_login_again') || 'Please login again');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!vendorProfile.businessName || !vendorProfile.fullName || !vendorProfile.email ||
        !vendorProfile.serviceCategory || !vendorProfile.budgetMin || !vendorProfile.budgetMax || 
        !vendorProfile.contactPhone || !vendorProfile.username) {
      alert(t('fill_required_fields') || 'Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/vendor/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...vendorProfile,
          user_id: userId
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(t('profile_saved') || 'Profile saved successfully!');
        loadVendorProfile(); // Reload to get updated data
      } else {
        alert(t('error_saving_profile') + ': ' + (result.error || t('unknown_error')));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(t('failed_save_profile') || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Handle profile picture upload
  // ============================================
  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        alert(t('file_too_large') || 'File too large. Max 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const userId = getUserId();
        if (userId) {
          localStorage.setItem(`joynest_vendor_avatar_${userId}`, event.target.result);
          setAvatar(event.target.result);
          alert(t('profile_picture_updated') || 'Profile picture updated!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================
  // Remove profile picture
  // ============================================
  const handleRemoveProfilePicture = () => {
    const userId = getUserId();
    if (userId) {
      localStorage.removeItem(`joynest_vendor_avatar_${userId}`);
      setAvatar(null);
      alert(t('profile_picture_removed') || 'Profile picture removed');
    }
  };

  // ============================================
  // Handle booking form change
  // ============================================
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ============================================
  // Create booking - NOW SAVES TO DATABASE
  // ============================================
  const handleCreateBooking = async () => {
    const { clientName, eventType, date } = bookingForm;
    
    if (!clientName || !eventType || !date) {
      alert(t('fill_required_fields') || 'Please fill all required fields');
      return;
    }
    
    const userId = getUserId();
    if (!userId) return;
    
    // Show loading state
    setLoading(true);
    
    try {
      // Save to database
      const response = await fetch('http://localhost:5000/api/vendor/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendor_id: userId,
          client_name: bookingForm.clientName,
          event_type: bookingForm.eventType,
          event_date: bookingForm.date,
          event_time: bookingForm.time,
          location: bookingForm.location,
          guests: bookingForm.guests,
          budget: bookingForm.budget,
          requirements: bookingForm.requirements,
          status: bookingForm.status
        })
      });

      const result = await response.json();

      if (result.success) {
        // Add to local state
        const newBooking = {
          id: result.booking_id,
          clientName: bookingForm.clientName,
          eventType: bookingForm.eventType,
          date: bookingForm.date,
          time: bookingForm.time,
          location: bookingForm.location,
          guests: bookingForm.guests,
          budget: bookingForm.budget,
          requirements: bookingForm.requirements,
          status: bookingForm.status,
          created_at: new Date().toISOString()
        };
        
        const updatedBookings = [newBooking, ...vendorBookings];
        setVendorBookings(updatedBookings);
        
        // Update localStorage as backup
        localStorage.setItem(`joynest_vendor_bookings_${userId}`, JSON.stringify(updatedBookings));
        
        // Update total bookings count
        setTotalBookings(prev => prev + 1);
        
        // Reset form
        setBookingForm({
          clientName: '',
          eventType: '',
          date: '',
          time: '',
          location: '',
          guests: '',
          budget: '',
          requirements: '',
          status: 'pending'
        });
        
        alert(t('booking_created') || 'Booking created successfully!');
        launchConfetti();
      } else {
        alert(t('error_creating_booking') + ': ' + (result.error || t('unknown_error')));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(t('failed_create_booking') || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // Delete booking - NOW DELETES FROM DATABASE
  // ============================================
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(t('confirm_delete_booking') || 'Are you sure you want to delete this booking?')) return;
    
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        const updatedBookings = vendorBookings.filter(b => b.id !== bookingId);
        setVendorBookings(updatedBookings);
        localStorage.setItem(`joynest_vendor_bookings_${userId}`, JSON.stringify(updatedBookings));
        setTotalBookings(updatedBookings.length);
        alert(t('booking_deleted') || 'Booking deleted successfully');
      } else {
        alert(t('error_deleting_booking') + ': ' + (result.error || t('unknown_error')));
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert(t('failed_delete_booking') || 'Failed to delete booking. Please try again.');
    }
  };

  // ============================================
  // Update booking status - NOW UPDATES IN DATABASE
  // ============================================
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/vendor/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        const updatedBookings = vendorBookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        );
        setVendorBookings(updatedBookings);
        localStorage.setItem(`joynest_vendor_bookings_${userId}`, JSON.stringify(updatedBookings));
        
        let statusMessage = '';
        switch(newStatus) {
          case 'pending': statusMessage = t('pending') || 'Pending'; break;
          case 'confirmed': statusMessage = t('confirmed') || 'Confirmed'; break;
          case 'completed': statusMessage = t('completed') || 'Completed'; break;
          case 'cancelled': statusMessage = t('cancelled') || 'Cancelled'; break;
          default: statusMessage = newStatus;
        }
        alert(t('booking_status_updated') + ' ' + statusMessage);
      } else {
        alert(t('error_updating_booking') + ': ' + (result.error || t('unknown_error')));
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert(t('failed_update_booking') || 'Failed to update booking. Please try again.');
    }
  };

  // ============================================
  // Launch confetti
  // ============================================
  const launchConfetti = () => {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#b266ff', '#ffd700', '#ff9a9e']
      });
    }
  };

  // ============================================
  // Service category options with translations
  // ============================================
  const serviceCategories = [
    { value: 'catering', label: '🍽️ ' + (t('catering') || 'Catering') },
    { value: 'photography', label: '📸 ' + (t('photography') || 'Photography') },
    { value: 'venue', label: '🏛️ ' + (t('venue') || 'Venue') },
    { value: 'decoration', label: '🎨 ' + (t('decoration') || 'Decoration') },
    { value: 'entertainment', label: '🎵 ' + (t('entertainment') || 'Entertainment') },
    { value: 'audio_visual', label: '🎬 ' + (t('audio_visual') || 'Audio Visual') },
    { value: 'designer', label: '✂️ ' + (t('designer') || 'Designer') }
  ];

  // ============================================
  // Event type options with translations
  // ============================================
  const eventTypes = [
    { value: 'birthday', label: '🎂 ' + (t('birthday') || 'Birthday') },
    { value: 'wedding', label: '💍 ' + (t('wedding') || 'Wedding') },
    { value: 'corporate', label: '🏢 ' + (t('corporate') || 'Corporate') },
    { value: 'conference', label: '🎤 ' + (t('conference') || 'Conference') },
    { value: 'social', label: '🎉 ' + (t('social_gathering') || 'Social') }
  ];

  // ============================================
  // Render bookings with translations
  // ============================================
  const renderBookings = () => {
    if (bookingsLoading) {
      return (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>{t('loading_bookings') || 'Loading bookings...'}</p>
        </div>
      );
    }

    if (vendorBookings.length === 0) {
      return (
        <div className="empty-state">
          <i className="fas fa-calendar-check"></i>
          <h4>{t('no_bookings') || 'No bookings yet'}</h4>
          <p>{t('create_first_booking') || 'Create your first booking using the form above'}</p>
        </div>
      );
    }

    return vendorBookings.map(booking => (
      <div key={booking.id} className="booking-card">
        <div className="booking-header">
          <h4>{booking.clientName}</h4>
          <span className={`booking-status status-${booking.status}`}>
            {booking.status === 'confirmed' ? '✅ ' + (t('confirmed') || 'Confirmed') : 
             booking.status === 'pending' ? '⏳ ' + (t('pending') || 'Pending') : 
             booking.status === 'completed' ? '🎉 ' + (t('completed') || 'Completed') : 
             '❌ ' + (t('cancelled') || 'Cancelled')}
          </span>
        </div>
        <p><strong>{t('event') || 'Event'}:</strong> {booking.eventType}</p>
        <div className="booking-details">
          <div className="booking-detail-item">
            <i className="far fa-calendar"></i> {booking.date} {booking.time || ''}
          </div>
          <div className="booking-detail-item">
            <i className="fas fa-map-marker-alt"></i> {booking.location || (t('tbd') || 'TBD')}
          </div>
          <div className="booking-detail-item">
            <i className="fas fa-users"></i> {booking.guests || '0'} {t('guests') || 'guests'}
          </div>
          <div className="booking-detail-item">
            <i className="fas fa-rupee-sign"></i> ₹{booking.budget || '0'}
          </div>
        </div>
        {booking.requirements && (
          <p><strong>{t('requirements') || 'Requirements'}:</strong> {booking.requirements}</p>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => handleDeleteBooking(booking.id)}
          >
            <i className="fas fa-trash"></i> {t('delete') || 'Delete'}
          </button>
          <select 
            className="form-input status-select"
            value={booking.status}
            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
          >
            <option value="pending">⏳ {t('pending') || 'Pending'}</option>
            <option value="confirmed">✅ {t('confirmed') || 'Confirmed'}</option>
            <option value="completed">🎉 {t('completed') || 'Completed'}</option>
            <option value="cancelled">❌ {t('cancelled') || 'Cancelled'}</option>
          </select>
        </div>
      </div>
    ));
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="dashboard-container">
      {/* Header - Removed logout button */}
      <div className="dashboard-header">
        <button
          onClick={() => setCurrentPage('landing-page')}
          className="btn-text"
        >
          <i className="fas fa-arrow-left"></i>
          {t('back_to_home')}
        </button>
        
        <div className="user-profile">
          <div className="user-info">
            <div className="user-avatar">
              {avatar ? (
                <img src={avatar} alt="Vendor" />
              ) : (
                <span>{(vendorProfile.businessName || 'V').charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="user-name">{getVendorName()}</span>
          </div>
          {/* Logout button removed from here */}
        </div>
      </div>

      {/* Welcome Card */}
      <div className="welcome-card">
        <div className="welcome-content">
          <div className="dove-icon-large">
            <i className="fas fa-store"></i>
          </div>
          <div className="welcome-text">
            <h2>{t('welcome')}, {getVendorName()}!</h2>
            <p>{t('vendor_dashboard_desc') || 'Manage your services, bookings, and client connections'}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <i className="fas fa-eye"></i>
            <div className="stat-value">{profileViews}</div>
            <div className="stat-label">{t('profile_views') || 'Profile Views'}</div>
          </div>
          <div className="stat-card">
            <i className="fas fa-calendar-check"></i>
            <div className="stat-value">{totalBookings}</div>
            <div className="stat-label">{t('total_bookings') || 'Total Bookings'}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'vendor-profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendor-profile')}
        >
          <i className="fas fa-user-tie"></i> {t('vendor_profile') || 'Vendor Profile'}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'vendor-bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('vendor-bookings')}
        >
          <i className="fas fa-calendar-check"></i> {t('bookings') || 'Bookings'}
        </button>
      </div>

      {/* Vendor Profile Tab */}
      {activeTab === 'vendor-profile' && (
        <div className="dashboard-card">
          <div className="card-title">
            <i className="fas fa-user-tie"></i> {t('vendor_profile') || 'Vendor Profile'}
          </div>
          
          {/* Profile Picture Upload */}
          <div className="profile-picture-container">
            <div className="profile-picture-preview">
              {avatar ? (
                <img src={avatar} alt="Vendor" />
              ) : (
                <i className="fas fa-store"></i>
              )}
            </div>
            
            <div className="profile-picture-upload">
              <input 
                type="file" 
                id="profile-picture-input" 
                accept="image/*" 
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-picture-input" className="upload-btn">
                <i className="fas fa-camera"></i> {t('upload_logo') || 'Upload Logo'}
              </label>
              <button 
                onClick={handleRemoveProfilePicture}
                className="upload-btn remove-btn"
              >
                <i className="fas fa-times"></i> {t('remove') || 'Remove'}
              </button>
            </div>
          </div>

          {profileLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>{t('loading_profile') || 'Loading profile...'}</p>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile}>
              {/* Business Name */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-building"></i>
                  {t('business_name') || 'Business Name'} *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={vendorProfile.businessName}
                  onChange={handleProfileChange}
                  required
                  placeholder={t('enter_business_name') || 'Enter your business name'}
                  className="form-input"
                />
              </div>

              {/* Full Name & Email */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user"></i>
                    {t('full_name') || 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={vendorProfile.fullName}
                    onChange={handleProfileChange}
                    required
                    placeholder={t('enter_full_name') || 'Enter your full name'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-envelope"></i>
                    {t('email_address') || 'Email Address'} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={vendorProfile.email}
                    onChange={handleProfileChange}
                    required
                    placeholder={t('enter_email') || 'Enter your email'}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Service Category */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-tag"></i>
                  {t('service_category') || 'Service Category'} *
                </label>
                <select
                  name="serviceCategory"
                  value={vendorProfile.serviceCategory}
                  onChange={handleProfileChange}
                  required
                  className="form-input"
                >
                  <option value="">{t('select_service') || 'Select your service'}</option>
                  {serviceCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Budget Min & Max */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-rupee-sign"></i>
                    {t('budget_min') || 'Budget Min'} (₹) *
                  </label>
                  <input
                    type="number"
                    name="budgetMin"
                    value={vendorProfile.budgetMin}
                    onChange={handleProfileChange}
                    required
                    min="0"
                    placeholder={t('minimum_budget') || 'Minimum budget'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-rupee-sign"></i>
                    {t('budget_max') || 'Budget Max'} (₹) *
                  </label>
                  <input
                    type="number"
                    name="budgetMax"
                    value={vendorProfile.budgetMax}
                    onChange={handleProfileChange}
                    required
                    min="0"
                    placeholder={t('maximum_budget') || 'Maximum budget'}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Contact Phone & Username */}
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-phone"></i>
                    {t('contact_phone') || 'Contact Phone'} *
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={vendorProfile.contactPhone}
                    onChange={handleProfileChange}
                    required
                    placeholder={t('enter_phone') || 'Enter phone number'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-at"></i>
                    {t('username') || 'Username'} *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={vendorProfile.username}
                    onChange={handleProfileChange}
                    required
                    placeholder={t('username') || 'Username'}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-align-left"></i>
                  {t('description') || 'Description'}
                </label>
                <textarea
                  name="description"
                  value={vendorProfile.description}
                  onChange={handleProfileChange}
                  rows="4"
                  placeholder={t('describe_services') || 'Describe your services...'}
                  className="form-input"
                />
              </div>

              {/* Save Button */}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary save-btn"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {t('saving') || 'Saving...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      {t('save_changes') || 'Save Changes'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Vendor Bookings Tab */}
      {activeTab === 'vendor-bookings' && (
        <div className="dashboard-card">
          <div className="card-title">
            <i className="fas fa-calendar-check"></i> {t('bookings_inquiries') || 'Bookings & Inquiries'}
          </div>
          
          {/* Create Booking Form */}
          <div className="booking-form">
            <h3>{t('create_new_booking') || 'Create New Booking'}</h3>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('client_name') || 'Client Name'} *</label>
                <input
                  name="clientName"
                  value={bookingForm.clientName}
                  onChange={handleBookingFormChange}
                  placeholder={t('enter_client_name') || 'Enter client name'}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('event_type') || 'Event Type'} *</label>
                <select
                  name="eventType"
                  value={bookingForm.eventType}
                  onChange={handleBookingFormChange}
                  className="form-input"
                  required
                >
                  <option value="">{t('select_event_type') || 'Select event type'}</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('event_date') || 'Event Date'} *</label>
                <input
                  type="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleBookingFormChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('event_time') || 'Event Time'}</label>
                <input
                  type="time"
                  name="time"
                  value={bookingForm.time}
                  onChange={handleBookingFormChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('location') || 'Location'}</label>
              <input
                name="location"
                value={bookingForm.location}
                onChange={handleBookingFormChange}
                placeholder={t('event_location') || 'Event location'}
                className="form-input"
              />
            </div>
            
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">{t('number_of_guests') || 'Number of Guests'}</label>
                <input
                  type="number"
                  name="guests"
                  value={bookingForm.guests}
                  onChange={handleBookingFormChange}
                  placeholder={t('guest_count') || 'Guest count'}
                  min="1"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('budget') || 'Budget'} (₹)</label>
                <input
                  type="number"
                  name="budget"
                  value={bookingForm.budget}
                  onChange={handleBookingFormChange}
                  placeholder={t('budget_amount') || 'Budget amount'}
                  min="0"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('special_requirements') || 'Special Requirements'}</label>
              <textarea
                name="requirements"
                value={bookingForm.requirements}
                onChange={handleBookingFormChange}
                placeholder={t('any_special_requests') || 'Any special requests...'}
                rows="3"
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('status') || 'Status'}</label>
              <select
                name="status"
                value={bookingForm.status}
                onChange={handleBookingFormChange}
                className="form-input"
              >
                <option value="pending">⏳ {t('pending') || 'Pending'}</option>
                <option value="confirmed">✅ {t('confirmed') || 'Confirmed'}</option>
                <option value="completed">🎉 {t('completed') || 'Completed'}</option>
                <option value="cancelled">❌ {t('cancelled') || 'Cancelled'}</option>
              </select>
            </div>
            
            <button
              type="button"
              onClick={handleCreateBooking}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('creating') || 'Creating...'}
                </>
              ) : (
                <>
                  <i className="fas fa-plus-circle"></i> {t('create_booking') || 'Create Booking'}
                </>
              )}
            </button>
          </div>
          
          {/* Bookings List */}
          <div className="bookings-list">
            <h3>{t('your_bookings') || 'Your Bookings'} ({vendorBookings.length})</h3>
            {renderBookings()}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;