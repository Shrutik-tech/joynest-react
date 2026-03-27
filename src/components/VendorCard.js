// src/components/VendorCard.js
import React, { useState } from 'react';

const VendorCard = ({ vendor }) => {
  const [showContact, setShowContact] = useState(false);

  // Get service type label
  const getServiceLabel = (type) => {
    const types = {
      'catering': 'Catering',
      'photography': 'Photography',
      'venue': 'Venue',
      'decoration': 'Decoration',
      'entertainment': 'Entertainment',
      'audio_visual': 'Audio Visual',
      'designer': 'Designer'
    };
    return types[type] || type;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `₹${Number(price).toLocaleString()}`;
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '24px',
      padding: '25px',
      boxShadow: '0 10px 25px rgba(178, 102, 255, 0.1)',
      border: '1px solid rgba(178, 102, 255, 0.2)',
      transition: 'all 0.3s ease',
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 20px 35px rgba(178, 102, 255, 0.15)';
      e.currentTarget.style.borderColor = '#b266ff';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(178, 102, 255, 0.1)';
      e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
    }}>
      {/* Vendor Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.5rem'
        }}>
          <i className="fas fa-store"></i>
        </div>
        <div>
          <h3 style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            marginBottom: '4px',
            color: '#2d2d2d'
          }}>
            {vendor.business_name}
          </h3>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(178, 102, 255, 0.1)',
            borderRadius: '30px',
            color: '#b266ff',
            fontSize: '0.8rem',
            fontWeight: '600'
          }}>
            {getServiceLabel(vendor.service_type)}
          </span>
        </div>
      </div>

      {/* Rating */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '15px'
      }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className="fas fa-star"
            style={{
              color: star <= Math.floor(vendor.rating) ? '#ffc107' : '#e0e0e0',
              fontSize: '0.9rem'
            }}
          ></i>
        ))}
        <span style={{
          marginLeft: '8px',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {vendor.rating} / 5
        </span>
      </div>

      {/* Description */}
      <p style={{
        color: '#666',
        lineHeight: '1.6',
        marginBottom: '20px',
        fontSize: '0.95rem',
        flex: 1
      }}>
        {vendor.description?.length > 100
          ? vendor.description.substring(0, 100) + '...'
          : vendor.description || 'No description provided'}
      </p>

      {/* Price Range */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0',
        borderTop: '1px solid rgba(178, 102, 255, 0.1)',
        borderBottom: '1px solid rgba(178, 102, 255, 0.1)'
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: '#2d2d2d',
          fontWeight: '600'
        }}>
          <i className="fas fa-rupee-sign" style={{ color: '#b266ff' }}></i>
          Budget Range
        </span>
        <span style={{ color: '#b266ff', fontWeight: '700' }}>
          {formatPrice(vendor.min_price)} - {formatPrice(vendor.max_price)}
        </span>
      </div>

      {/* Contact Info - Toggle */}
      {showContact ? (
        <div style={{
          background: '#f8f9fa',
          padding: '15px',
          borderRadius: '12px',
          marginBottom: '15px'
        }}>
          <p style={{ marginBottom: '8px', color: '#2d2d2d' }}>
            <i className="fas fa-phone" style={{ color: '#b266ff', width: '20px', marginRight: '8px' }}></i>
            {vendor.phone || 'Not provided'}
          </p>
          <p style={{ marginBottom: '8px', color: '#2d2d2d' }}>
            <i className="fas fa-envelope" style={{ color: '#b266ff', width: '20px', marginRight: '8px' }}></i>
            {vendor.email || 'Not provided'}
          </p>
          <p style={{ color: '#2d2d2d' }}>
            <i className="fas fa-user" style={{ color: '#b266ff', width: '20px', marginRight: '8px' }}></i>
            {vendor.owner_name || 'Vendor'}
          </p>
        </div>
      ) : null}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginTop: 'auto'
      }}>
        <button
          onClick={() => setShowContact(!showContact)}
          style={{
            flex: 1,
            padding: '12px',
            background: showContact ? '#b266ff' : 'white',
            border: '2px solid #b266ff',
            borderRadius: '50px',
            color: showContact ? 'white' : '#b266ff',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (!showContact) {
              e.target.style.background = '#b266ff';
              e.target.style.color = 'white';
            }
          }}
          onMouseLeave={(e) => {
            if (!showContact) {
              e.target.style.background = 'white';
              e.target.style.color = '#b266ff';
            }
          }}
        >
          <i className={`fas ${showContact ? 'fa-times' : 'fa-phone'}`} style={{ marginRight: '8px' }}></i>
          {showContact ? 'Hide Contact' : 'Show Contact'}
        </button>
      </div>
    </div>
  );
};

export default VendorCard;