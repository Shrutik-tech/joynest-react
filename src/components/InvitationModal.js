import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const InvitationModal = ({ onClose, onSave, userId }) => {
  // ============================================
  // TEMPLATE CONFIGURATIONS - 15 Unique Designs
  // ============================================
  const templates = [
    {
      id: 1,
      name: "Royal Purple",
      colors: ['#d4af37', '#ffd700', '#fff3e0'],
      background: 'linear-gradient(135deg, #2b1545 0%, #1a0d2e 50%, #2b1545 100%)',
      description: "Elegant dark purple with gold accents"
    },
    {
      id: 2,
      name: "Navy Gold",
      colors: ['#ffd700', '#ffed4e', '#fff9c4'],
      background: 'linear-gradient(135deg, #0a1931 0%, #0c2340 50%, #0a1931 100%)',
      description: "Classic navy blue with gold highlights"
    },
    {
      id: 3,
      name: "Emerald",
      colors: ['#86efac', '#bbf7d0', '#dcfce7'],
      background: 'linear-gradient(135deg, #064e3b 0%, #0a5f4e 50%, #064e3b 100%)',
      description: "Modern green with light accents"
    },
    {
      id: 4,
      name: "Burgundy",
      colors: ['#fbbf24', '#fcd34d', '#fde68a'],
      background: 'linear-gradient(135deg, #5c1a33 0%, #7e1946 50%, #5c1a33 100%)',
      description: "Rich burgundy with golden details"
    },
    {
      id: 5,
      name: "Rose Gold",
      colors: ['#ffd7ba', '#fed7aa', '#fdba74'],
      background: 'linear-gradient(135deg, #d4708c 0%, #b8546e 50%, #d4708c 100%)',
      description: "Romantic pink with rose gold"
    },
    {
      id: 6,
      name: "Midnight Blue",
      colors: ['#60a5fa', '#93c5fd', '#dbeafe'],
      background: 'linear-gradient(135deg, #001529 0%, #002a52 50%, #001529 100%)',
      description: "Deep blue with modern accents"
    },
    {
      id: 7,
      name: "Forest Green",
      colors: ['#d4e157', '#e6ee9c', '#f0f4c3'],
      background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)',
      description: "Nature-inspired green design"
    },
    {
      id: 8,
      name: "Coral Peach",
      colors: ['#fff3e0', '#ffecb3', '#ffe082'],
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff6b6b 100%)',
      description: "Vibrant coral with peach tones"
    },
    {
      id: 9,
      name: "Royal Blue",
      colors: ['#fbbf24', '#fcd34d', '#fde68a'],
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)',
      description: "Regal blue with gold elegance"
    },
    {
      id: 10,
      name: "Champagne",
      colors: ['#fef3c7', '#fef9c3', '#fefce8'],
      background: 'linear-gradient(135deg, #8b7355 0%, #a0826d 50%, #8b7355 100%)',
      description: "Elegant champagne gold design"
    },
    {
      id: 11,
      name: "Teal Ocean",
      colors: ['#fef08a', '#fef9c3', '#fefce8'],
      background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%)',
      description: "Ocean-inspired teal colors"
    },
    {
      id: 12,
      name: "Charcoal Silver",
      colors: ['#e5e7eb', '#f3f4f6', '#f9fafb'],
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)',
      description: "Modern minimalist design"
    },
    {
      id: 13,
      name: "Blush Pink",
      colors: ['#881337', '#9f1239', '#be123c'],
      background: 'linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fecdd3 100%)',
      description: "Soft blush pink romantic style"
    },
    {
      id: 14,
      name: "Purple Luxury",
      colors: ['#c7d2fe', '#a5b4fc', '#818cf8'],
      background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #4c1d95 100%)',
      description: "Luxurious deep purple design"
    },
    {
      id: 15,
      name: "Gold Elegance",
      colors: ['#fbbf24', '#fcd34d', '#fde68a'],
      background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)',
      description: "Black and gold luxury design"
    }
  ];

  // ============================================
  // FONT CONFIGURATIONS - 8 Beautiful Fonts
  // ============================================
  const fonts = [
    { id: 'great-vibes', name: 'Great Vibes', family: "'Great Vibes', cursive" },
    { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive" },
    { id: 'pacifico', name: 'Pacifico', family: "'Pacifico', cursive" },
    { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif" },
    { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif" },
    { id: 'alex-brush', name: 'Alex Brush', family: "'Alex Brush', cursive" },
    { id: 'satisfy', name: 'Satisfy', family: "'Satisfy', cursive" },
    { id: 'tangerine', name: 'Tangerine', family: "'Tangerine', cursive" }
  ];

  // ============================================
  // COLOR OPTIONS
  // ============================================
  const fontColors = [
    '#d4af37', '#ffd700', '#ffffff', '#000000', '#ff69b4', '#b266ff',
    '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#795548'
  ];

  const accentColors = [
    '#ff69b4', '#b266ff', '#d4af37', '#4CAF50', '#2196F3', '#FF9800',
    '#9C27B0', '#607D8B', '#795548', '#ffffff', '#000000', '#ffd700'
  ];

  // ============================================
  // STATE VARIABLES
  // ============================================
  const [currentTemplateId, setCurrentTemplateId] = useState(1);
  const [currentFontId, setCurrentFontId] = useState('great-vibes');
  const [fontColor, setFontColor] = useState('#d4af37');
  const [accentColor, setAccentColor] = useState('#ff69b4');
  const [previewSize, setPreviewSize] = useState('normal');
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  
  // Form state - Updated with proper date and time fields
  const [formData, setFormData] = useState({
    eventType: 'wedding',
    name: '',
    tagline: '',
    eventDate: '',
    eventDateFormatted: '',
    eventTime: '',
    eventTimeAmPm: 'PM',
    venueName: '',
    venueAddress: ''
  });

  // Helper function to format date from YYYY-MM-DD to display format
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName} - ${day} ${month} - ${year}`;
  };

  // Helper function to format time with AM/PM
  const formatTimeForDisplay = (time, ampm) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    let displayHours = parseInt(hours);
    let displayAmPm = ampm;
    
    // If time is in 24-hour format, convert to 12-hour
    if (displayHours >= 12) {
      displayAmPm = 'PM';
      if (displayHours > 12) {
        displayHours = displayHours - 12;
      }
    } else {
      displayAmPm = 'AM';
      if (displayHours === 0) {
        displayHours = 12;
      }
    }
    
    return `${displayHours}:${minutes} ${displayAmPm}`;
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getCurrentTemplate = () => {
    return templates.find(t => t.id === currentTemplateId) || templates[0];
  };

  const getCurrentFont = () => {
    return fonts.find(f => f.id === currentFontId) || fonts[0];
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    
    if (id === 'eventDate') {
      // When date input changes, also update the formatted version
      const formatted = formatDateForDisplay(value);
      setFormData(prev => ({ 
        ...prev, 
        [id]: value,
        eventDateFormatted: formatted 
      }));
    } else if (id === 'eventTime') {
      // When time input changes, update time and keep current AM/PM
      setFormData(prev => ({ 
        ...prev, 
        [id]: value 
      }));
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleTimeAmPmChange = (e) => {
    setFormData(prev => ({ ...prev, eventTimeAmPm: e.target.value }));
  };

  // ============================================
  // PHOTO UPLOAD FUNCTIONS
  // ============================================
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        alert('File size too large. Please choose a file under 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = function(event) {
        setUploadedPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setUploadedPhoto(null);
    document.getElementById('photoInput').value = '';
  };

  // ============================================
  // DOWNLOAD FUNCTIONS
  // ============================================
  const downloadInvitationImage = async () => {
    const element = document.getElementById('invitationPreview');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${formData.eventType}-invitation-${formData.name || 'invitation'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      alert('Invitation downloaded as PNG!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading invitation. Please try again.');
    }
  };

  const downloadInvitationPDF = async () => {
    const element = document.getElementById('invitationPreview');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (210 - imgWidth) / 2;
      const y = (297 - imgHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${formData.eventType}-invitation-${formData.name || 'invitation'}.pdf`);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      alert('Error creating PDF. Please try again.');
    }
  };

  const shareInvitation = () => {
    alert('Share functionality coming soon!');
  };

  const saveInvitation = () => {
    if (!formData.name) {
      alert('Please enter a name for the invitation');
      return;
    }

    if (!userId) {
      alert('User not logged in. Please login again.');
      return;
    }

    // Format the time for display
    const displayTime = formatTimeForDisplay(formData.eventTime, formData.eventTimeAmPm);
    
    // Use formatted date or fallback
    const displayDate = formData.eventDateFormatted || formData.eventDate || 'Date TBD';

    const invitationData = {
      id: 'invitation_' + Date.now(),
      userId: userId, // Associate with user
      eventName: `${formData.name}'s ${formData.eventType}`,
      date: displayDate,
      time: displayTime || 'Time TBD',
      location: formData.venueName || 'Venue TBD',
      address: formData.venueAddress || 'Address TBD',
      tagline: formData.tagline || '',
      template: currentTemplateId,
      templateName: getCurrentTemplate().name,
      font: currentFontId,
      fontFamily: getCurrentFont().family,
      fontColor: fontColor,
      accentColor: accentColor,
      photo: uploadedPhoto,
      created_at: new Date().toISOString()
    };

    onSave(invitationData);
    onClose();
  };

  // ============================================
  // EVENT TYPE TITLES
  // ============================================
  const eventTypeTitles = {
    'wedding': 'Wedding Invitation',
    'engagement': 'Engagement Invitation',
    'birthday': 'Birthday Invitation',
    'anniversary': 'Anniversary Invitation',
    'corporate': 'Corporate Event Invitation',
    'baby-shower': 'Baby Shower Invitation',
    'graduation': 'Graduation Invitation',
    'housewarming': 'Housewarming Invitation'
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '32px',
        maxWidth: '1400px',
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(178, 102, 255, 0.25)',
        border: '2px solid rgba(178, 102, 255, 0.2)'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'white',
            border: '2px solid #b266ff',
            color: '#b266ff',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 100
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#b266ff';
            e.target.style.color = 'white';
            e.target.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'white';
            e.target.style.color = '#b266ff';
            e.target.style.transform = 'rotate(0deg)';
          }}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '10px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
            }}>
              <i className="fas fa-pen-fancy" style={{ fontSize: '1.8rem', color: 'white' }}></i>
            </div>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Premium Invitation Designer
            </h2>
          </div>
          <p style={{
            color: '#666',
            fontSize: '1.1rem'
          }}>
            Create stunning invitations with 15 templates, custom fonts, and color controls
          </p>
        </div>

        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: '30px'
        }}>
          {/* ======================================== */}
          {/* LEFT SIDEBAR - DESIGN CONTROLS */}
          {/* ======================================== */}
          <div style={{
            background: 'rgba(178, 102, 255, 0.02)',
            borderRadius: '24px',
            padding: '25px',
            border: '2px solid rgba(178, 102, 255, 0.2)',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}>
            {/* Info Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 20px',
              background: 'rgba(178, 102, 255, 0.1)',
              borderRadius: '50px',
              color: '#b266ff',
              fontSize: '0.95rem',
              fontWeight: '600',
              marginBottom: '25px',
              border: '1px solid rgba(178, 102, 255, 0.3)'
            }}>
              <i className="fas fa-magic" style={{ color: '#b266ff' }}></i>
              <span>15 Templates • 8 Fonts • Full Color Control</span>
            </div>

            {/* ======================================== */}
            {/* BASIC INFORMATION */}
            {/* ======================================== */}
            <div style={{
              marginBottom: '30px',
              paddingBottom: '25px',
              borderBottom: '2px solid rgba(178, 102, 255, 0.2)'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#2d2d2d',
                marginBottom: '20px',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                <i className="fas fa-edit" style={{ color: '#b266ff' }}></i>
                Basic Information
              </h3>
              
              {/* Event Type */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Event Type
                </label>
                <select
                  id="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(178, 102, 255, 0.2)',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b266ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    backgroundSize: '1rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
                >
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement</option>
                  <option value="birthday">Birthday Party</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="baby-shower">Baby Shower</option>
                  <option value="graduation">Graduation</option>
                  <option value="housewarming">Housewarming</option>
                </select>
              </div>

              {/* Name - Single field */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter name"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

              {/* Tagline */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Tagline / Description
                </label>
                <input
                  type="text"
                  id="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  placeholder="e.g., Together with their loving families"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

              {/* Date & Time */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d2d2d',
                    fontSize: '0.95rem'
                  }}>
                    Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '16px',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
                  />
                  {formData.eventDateFormatted && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#b266ff',
                      marginTop: '5px',
                      fontWeight: '500'
                    }}>
                      Preview: {formData.eventDateFormatted}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '600',
                    color: '#2d2d2d',
                    fontSize: '0.95rem'
                  }}>
                    Time
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="time"
                      id="eventTime"
                      value={formData.eventTime}
                      onChange={handleInputChange}
                      style={{
                        flex: 1,
                        padding: '12px 12px',
                        border: '2px solid rgba(178, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
                    />
                    <select
                      value={formData.eventTimeAmPm}
                      onChange={handleTimeAmPmChange}
                      style={{
                        width: '80px',
                        padding: '12px 8px',
                        border: '2px solid rgba(178, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontSize: '1rem',
                        outline: 'none',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b266ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '12px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                  {formData.eventTime && (
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#b266ff',
                      marginTop: '5px',
                      fontWeight: '500'
                    }}>
                      Preview: {formatTimeForDisplay(formData.eventTime, formData.eventTimeAmPm)}
                    </div>
                  )}
                </div>
              </div>

              {/* Venue */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Venue Name
                </label>
                <input
                  type="text"
                  id="venueName"
                  value={formData.venueName}
                  onChange={handleInputChange}
                  placeholder="e.g., Hillsdale Baptist"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
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

              {/* Address */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Address
                </label>
                <textarea
                  id="venueAddress"
                  rows="3"
                  value={formData.venueAddress}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid rgba(178, 102, 255, 0.2)',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#b266ff'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '600',
                  color: '#2d2d2d',
                  fontSize: '0.95rem'
                }}>
                  Add Photo (Optional)
                </label>
                {!uploadedPhoto ? (
                  <div
                    onClick={() => document.getElementById('photoInput').click()}
                    style={{
                      border: '2px dashed rgba(178, 102, 255, 0.4)',
                      borderRadius: '20px',
                      padding: '25px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: 'rgba(178, 102, 255, 0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#b266ff';
                      e.currentTarget.style.background = 'rgba(178, 102, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.4)';
                      e.currentTarget.style.background = 'rgba(178, 102, 255, 0.02)';
                    }}
                  >
                    <input
                      type="file"
                      id="photoInput"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                    />
                    <div style={{ fontSize: '3rem', color: '#b266ff', marginBottom: '10px' }}>📷</div>
                    <div style={{ color: '#b266ff', fontWeight: '600' }}>Click to upload a photo</div>
                    <div style={{ color: '#666', fontSize: '0.85rem', marginTop: '5px' }}>
                      JPG, PNG, GIF (Max 5MB)
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      maxWidth: '150px',
                      maxHeight: '150px',
                      margin: '0 auto 15px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 25px rgba(178, 102, 255, 0.3)',
                      border: '3px solid white'
                    }}>
                      <img src={uploadedPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <button
                      onClick={removePhoto}
                      style={{
                        padding: '10px 20px',
                        background: 'white',
                        border: '2px solid #b266ff',
                        borderRadius: '40px',
                        color: '#b266ff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#b266ff';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#b266ff';
                      }}
                    >
                      <i className="fas fa-times"></i>
                      Remove Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================== */}
            {/* TEMPLATE SELECTION */}
            {/* ======================================== */}
            <div style={{
              marginBottom: '30px',
              paddingBottom: '25px',
              borderBottom: '2px solid rgba(178, 102, 255, 0.2)'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#2d2d2d',
                marginBottom: '15px',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                <i className="fas fa-palette" style={{ color: '#b266ff' }}></i>
                Choose Design Template
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
                Select from 15 professionally designed templates
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                {templates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => {
                      setCurrentTemplateId(template.id);
                      setFontColor(template.colors[0]);
                    }}
                    style={{
                      background: currentTemplateId === template.id ? 'rgba(178, 102, 255, 0.1)' : 'white',
                      border: currentTemplateId === template.id 
                        ? '2px solid #b266ff' 
                        : '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (currentTemplateId !== template.id) {
                        e.currentTarget.style.borderColor = '#b266ff';
                        e.currentTarget.style.background = 'rgba(178, 102, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentTemplateId !== template.id) {
                        e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div style={{
                      height: '60px',
                      background: template.background,
                      borderRadius: '8px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: template.colors[0],
                      fontFamily: "'Great Vibes', cursive",
                      fontSize: '1rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px',
                        right: '3px',
                        bottom: '3px',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '4px'
                      }}></div>
                      {template.name.substring(0, 2)}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: currentTemplateId === template.id ? '#b266ff' : '#2d2d2d'
                    }}>
                      {template.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================== */}
            {/* FONT SELECTION */}
            {/* ======================================== */}
            <div style={{
              marginBottom: '30px',
              paddingBottom: '25px',
              borderBottom: '2px solid rgba(178, 102, 255, 0.2)'
            }}>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#2d2d2d',
                marginBottom: '15px',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                <i className="fas fa-font" style={{ color: '#b266ff' }}></i>
                Font Style
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px'
              }}>
                {fonts.map(font => (
                  <div
                    key={font.id}
                    onClick={() => setCurrentFontId(font.id)}
                    style={{
                      background: currentFontId === font.id ? 'rgba(178, 102, 255, 0.1)' : 'white',
                      border: currentFontId === font.id 
                        ? '2px solid #b266ff' 
                        : '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (currentFontId !== font.id) {
                        e.currentTarget.style.borderColor = '#b266ff';
                        e.currentTarget.style.background = 'rgba(178, 102, 255, 0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentFontId !== font.id) {
                        e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                  >
                    <div style={{
                      fontFamily: font.family,
                      fontSize: '1.3rem',
                      marginBottom: '5px',
                      color: '#2d2d2d'
                    }}>
                      Aa
                    </div>
                    <div style={{
                      fontSize: '0.7rem',
                      color: currentFontId === font.id ? '#b266ff' : '#666'
                    }}>
                      {font.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ======================================== */}
            {/* COLOR CUSTOMIZATION */}
            {/* ======================================== */}
            <div>
              <h3 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#2d2d2d',
                marginBottom: '20px',
                fontSize: '1.2rem',
                fontWeight: '700'
              }}>
                <i className="fas fa-fill-drip" style={{ color: '#b266ff' }}></i>
                Color Customization
              </h3>

              {/* Font Color */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#2d2d2d'
                }}>
                  Font Color
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {fontColors.map(color => (
                    <div
                      key={color}
                      onClick={() => setFontColor(color)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: fontColor === color 
                          ? '3px solid #b266ff' 
                          : '3px solid transparent',
                        boxShadow: fontColor === color 
                          ? '0 0 0 2px white, 0 0 0 4px #b266ff' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    style={{
                      width: '45px',
                      height: '45px',
                      border: '2px solid #b266ff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  />
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    Custom Font Color
                  </span>
                </div>
              </div>

              {/* Accent Color */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: '600',
                  color: '#2d2d2d'
                }}>
                  Accent Color
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {accentColors.map(color => (
                    <div
                      key={color}
                      onClick={() => setAccentColor(color)}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        backgroundColor: color,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: accentColor === color 
                          ? '3px solid #b266ff' 
                          : '3px solid transparent',
                        boxShadow: accentColor === color 
                          ? '0 0 0 2px white, 0 0 0 4px #b266ff' 
                          : '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    style={{
                      width: '45px',
                      height: '45px',
                      border: '2px solid #b266ff',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  />
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    Custom Accent Color
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================== */}
          {/* RIGHT SIDEBAR - PREVIEW & DOWNLOAD */}
          {/* ======================================== */}
          <div style={{
            background: 'rgba(178, 102, 255, 0.02)',
            borderRadius: '24px',
            padding: '25px',
            border: '2px solid rgba(178, 102, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}>
            {/* Preview Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '15px',
              borderBottom: '2px solid rgba(178, 102, 255, 0.2)',
              flexWrap: 'wrap',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  background: 'rgba(178, 102, 255, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-eye" style={{ color: '#b266ff', fontSize: '1.2rem' }}></i>
                </div>
                <span style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  color: '#2d2d2d'
                }}>
                  Live Preview
                </span>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                {['compact', 'normal', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setPreviewSize(size)}
                    style={{
                      padding: '8px 16px',
                      background: previewSize === size ? '#b266ff' : 'white',
                      border: previewSize === size ? 'none' : '2px solid rgba(178, 102, 255, 0.2)',
                      borderRadius: '30px',
                      color: previewSize === size ? 'white' : '#666',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (previewSize !== size) {
                        e.target.style.background = 'rgba(178, 102, 255, 0.1)';
                        e.target.style.color = '#b266ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (previewSize !== size) {
                        e.target.style.background = 'white';
                        e.target.style.color = '#666';
                      }
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Invitation Preview */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.5)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '25px',
              minHeight: '500px'
            }}>
              <div
                id="invitationPreview"
                style={{
                  position: 'relative',
                  width: previewSize === 'compact' ? '350px' : previewSize === 'normal' ? '450px' : '550px',
                  minHeight: previewSize === 'compact' ? '500px' : previewSize === 'normal' ? '600px' : '700px',
                  background: getCurrentTemplate().background,
                  borderRadius: '20px',
                  padding: previewSize === 'compact' ? '25px' : previewSize === 'normal' ? '35px' : '45px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  color: fontColor,
                  fontFamily: getCurrentFont().family
                }}
              >
                {/* Border */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '15px',
                  right: '15px',
                  bottom: '15px',
                  border: currentTemplateId === 2 ? '2px dashed currentColor' :
                          currentTemplateId === 4 ? '5px double currentColor' :
                          currentTemplateId === 6 ? '8px solid transparent' :
                          '3px solid currentColor',
                  borderImage: currentTemplateId === 6 ? 'linear-gradient(45deg, currentColor, transparent, currentColor) 1' : 'none',
                  borderRadius: 
                    currentTemplateId === 3 ? '20px' :
                    currentTemplateId === 5 ? '25px' :
                    currentTemplateId === 8 ? '18px' :
                    currentTemplateId === 11 ? '26px' :
                    '12px',
                  boxShadow: currentTemplateId === 7 ? '0 0 20px rgba(212,225,87,0.3)' :
                            currentTemplateId === 15 ? '0 0 30px rgba(251,191,36,0.4)' : 'none',
                  pointerEvents: 'none'
                }}></div>

                {/* Floral Decorations */}
                <svg className="floral-top" style={{
                  position: 'absolute',
                  top: '25px',
                  left: '25px',
                  width: '70px',
                  height: '70px',
                  opacity: 0.8,
                  color: accentColor
                }} viewBox="0 0 100 100">
                  <path d="M10,50 Q10,10 50,10 Q90,10 90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="30" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                  <circle cx="50" cy="15" r="10" fill="currentColor" opacity="0.8"/>
                  <circle cx="70" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                </svg>

                <svg className="floral-bottom" style={{
                  position: 'absolute',
                  bottom: '25px',
                  right: '25px',
                  width: '70px',
                  height: '70px',
                  opacity: 0.8,
                  transform: 'rotate(180deg)',
                  color: accentColor
                }} viewBox="0 0 100 100">
                  <path d="M10,50 Q10,10 50,10 Q90,10 90,50" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="30" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                  <circle cx="50" cy="15" r="10" fill="currentColor" opacity="0.8"/>
                  <circle cx="70" cy="25" r="8" fill="currentColor" opacity="0.7"/>
                </svg>

                {/* Content */}
                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  {/* Photo */}
                  {uploadedPhoto && (
                    <div style={{
                      width: previewSize === 'compact' ? '80px' : '120px',
                      height: previewSize === 'compact' ? '80px' : '120px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      marginBottom: '20px',
                      border: '4px solid rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }}>
                      <img src={uploadedPhoto} alt="Person" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Title */}
                  <div style={{
                    fontSize: previewSize === 'compact' ? '1.8rem' : previewSize === 'normal' ? '2.2rem' : '2.8rem',
                    marginBottom: '5px',
                    fontWeight: '400',
                    letterSpacing: '2px',
                    fontFamily: getCurrentFont().family
                  }}>
                    {eventTypeTitles[formData.eventType] || 'Invitation'}
                  </div>
                  
                  <div style={{
                    fontSize: previewSize === 'compact' ? '0.8rem' : '1rem',
                    letterSpacing: '4px',
                    marginBottom: '15px',
                    textTransform: 'lowercase',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    save the date
                  </div>
                  
                  {/* Name - Single name */}
                  <div style={{
                    fontSize: previewSize === 'compact' ? '2.2rem' : previewSize === 'normal' ? '3rem' : '3.8rem',
                    margin: '15px 0',
                    lineHeight: 1.2,
                    fontWeight: '400',
                    fontFamily: getCurrentFont().family
                  }}>
                    {formData.name || 'Your Name'}
                  </div>
                  
                  {/* Tagline */}
                  <div style={{
                    fontSize: previewSize === 'compact' ? '0.8rem' : '0.9rem',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    marginBottom: '15px',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    {(formData.tagline || 'TAGLINE WILL APPEAR HERE').toUpperCase()}
                  </div>
                  
                  {/* Divider */}
                  <div style={{
                    margin: '15px auto',
                    width: previewSize === 'compact' ? '100px' : '150px',
                    height: '2px',
                    background: `linear-gradient(to right, transparent, ${accentColor}, transparent)`
                  }}></div>
                  
                  {/* Event Details */}
                  <div style={{
                    lineHeight: 1.8,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: previewSize === 'compact' ? '0.8rem' : '0.9rem',
                    fontFamily: "'Playfair Display', serif"
                  }}>
                    <div>{(formData.eventDateFormatted || 'DATE TO BE ANNOUNCED').toUpperCase()}</div>
                    {formData.eventTime && (
                      <div style={{ marginTop: '5px' }}>
                        {formatTimeForDisplay(formData.eventTime, formData.eventTimeAmPm).toUpperCase()}
                      </div>
                    )}
                    <div style={{ marginTop: '10px' }}>{(formData.venueName || 'VENUE DETAILS TO FOLLOW').toUpperCase()}</div>
                    <div style={{ marginTop: '5px', fontSize: previewSize === 'compact' ? '0.75rem' : '0.85rem' }}>
                      {(formData.venueAddress || 'ADDRESS WILL BE PROVIDED').toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div style={{
              borderTop: '2px solid rgba(178, 102, 255, 0.2)',
              paddingTop: '25px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <button
                  onClick={downloadInvitationImage}
                  style={{
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #b266ff',
                    borderRadius: '16px',
                    color: '#b266ff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b266ff';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#b266ff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fas fa-download" style={{ fontSize: '1.5rem' }}></i>
                  <span>PNG</span>
                </button>

                <button
                  onClick={downloadInvitationPDF}
                  style={{
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #b266ff',
                    borderRadius: '16px',
                    color: '#b266ff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b266ff';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#b266ff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fas fa-file-pdf" style={{ fontSize: '1.5rem' }}></i>
                  <span>PDF</span>
                </button>

                <button
                  onClick={shareInvitation}
                  style={{
                    padding: '15px',
                    background: 'white',
                    border: '2px solid #b266ff',
                    borderRadius: '16px',
                    color: '#b266ff',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#b266ff';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.color = '#b266ff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className="fas fa-share-alt" style={{ fontSize: '1.5rem' }}></i>
                  <span>Share</span>
                </button>

                <button
                  onClick={saveInvitation}
                  style={{
                    padding: '15px',
                    background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                    border: 'none',
                    borderRadius: '16px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px rgba(178, 102, 255, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(178, 102, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.3)';
                  }}
                >
                  <i className="fas fa-save" style={{ fontSize: '1.5rem' }}></i>
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationModal;