import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const RoleSelectionPage = ({ setCurrentPage }) => {
  const { t } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #ffe6f0, #f3e6ff, #f0e6ff)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '40px',
        padding: '3rem',
        width: '100%',
        maxWidth: '1000px',
        boxShadow: '0 30px 60px rgba(178, 102, 255, 0.2)',
        border: '2px solid rgba(178, 102, 255, 0.2)',
        animation: 'fadeIn 0.6s ease'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          {/* Dove Symbol */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            borderRadius: '30px',
            color: 'white',
            fontSize: '2.8rem',
            margin: '0 auto 25px',
            boxShadow: '0 15px 30px rgba(178, 102, 255, 0.3)'
          }}>
            <i className="fas fa-dove"></i>
          </div>
          <h2 style={{
            fontSize: '2.8rem',
            marginBottom: '15px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t('join_joynest')}
          </h2>
          <p style={{
            color: '#4a4a4a',
            fontSize: '1.3rem',
            fontWeight: '500'
          }}>
            {t('choose_role')}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>
          {/* User Card */}
          <div
            onClick={() => setCurrentPage('user-registration-page')}
            style={{
              background: 'white',
              border: '2px solid rgba(178, 102, 255, 0.2)',
              borderRadius: '32px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 30px rgba(178, 102, 255, 0.1)',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#b266ff';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(178, 102, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.1)';
            }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              boxShadow: '0 15px 30px rgba(178, 102, 255, 0.3)'
            }}>
              <i className="fas fa-calendar-check" style={{ fontSize: '3rem', color: 'white' }}></i>
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#2d2d2d', fontWeight: '700' }}>
              {t('event_planner')}
            </h3>
            <p style={{ color: '#4a4a4a', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '300px' }}>
              {t('event_planner_desc')}
            </p>
            <button style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '250px',
              marginTop: 'auto',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 20px rgba(178, 102, 255, 0.3)';
            }}>
              {t('continue_as_user')}
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {/* Vendor Card */}
          <div
            onClick={() => setCurrentPage('vendor-registration-page')}
            style={{
              background: 'white',
              border: '2px solid rgba(178, 102, 255, 0.2)',
              borderRadius: '32px',
              padding: '3rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 15px 30px rgba(178, 102, 255, 0.1)',
              height: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = '#b266ff';
              e.currentTarget.style.boxShadow = '0 25px 50px rgba(178, 102, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.1)';
            }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem',
              background: 'linear-gradient(135deg, #b266ff, #9d4edd)',
              boxShadow: '0 15px 30px rgba(178, 102, 255, 0.3)'
            }}>
              <i className="fas fa-store" style={{ fontSize: '3rem', color: 'white' }}></i>
            </div>
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#2d2d2d', fontWeight: '700' }}>
              {t('vendor')}
            </h3>
            <p style={{ color: '#4a4a4a', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '300px' }}>
              {t('vendor_desc')}
            </p>
            <button style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              border: 'none',
              borderRadius: '50px',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              maxWidth: '250px',
              marginTop: 'auto',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 20px rgba(178, 102, 255, 0.3)';
            }}>
              {t('continue_as_vendor')}
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid rgba(178, 102, 255, 0.2)'
        }}>
          <p style={{ color: '#4a4a4a', marginBottom: '1rem', fontSize: '1.1rem' }}>
            {t('already_have_account')}
          </p>
          <button
            onClick={() => setCurrentPage('login-page')}
            style={{
              background: 'none',
              border: 'none',
              color: '#b266ff',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '10px 20px',
              borderRadius: '30px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(178, 102, 255, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            {t('sign_in_here')}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => setCurrentPage('landing-page')}
            style={{
              background: 'none',
              border: 'none',
              color: '#b266ff',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '10px 20px',
              borderRadius: '30px',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(178, 102, 255, 0.1)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
              e.target.style.transform = 'translateY(0)';
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

export default RoleSelectionPage;