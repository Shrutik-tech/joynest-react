import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LandingPage.css';

const LandingPage = ({ setCurrentPage }) => {
  const { t } = useLanguage();

  const features = [
    {
      icon: 'fa-robot',
      title: t('ai_assistant'),
      description: t('ai_assistant_desc'),
      gradient: 'linear-gradient(135deg, #ff69b4, #b266ff, #9d4edd)'
    },
    {
      icon: 'fa-store',
      title: t('vendor_network'),
      description: t('vendor_network_desc'),
      gradient: 'linear-gradient(135deg, #b266ff, #9d4edd, #ff69b4)'
    },
    {
      icon: 'fa-envelope',
      title: t('smart_invitations'),
      description: t('smart_invitations_desc'),
      gradient: 'linear-gradient(135deg, #9d4edd, #ff69b4, #b266ff)'
    },
    {
      icon: 'fa-chart-line',
      title: t('event_analytics'),
      description: t('event_analytics_desc'),
      gradient: 'linear-gradient(135deg, #ff69b4, #9d4edd, #b266ff)'
    }
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content fade-in">
            {/* DOVE SYMBOL - SIMPLIFIED */}
            <div style={{
              width: '100px',
              height: '100px',
              margin: '0 auto 25px',
              background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
              borderRadius: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 15px 30px rgba(178, 102, 255, 0.4)'
            }}>
              <i className="fas fa-dove" style={{
                fontSize: '3rem',
                color: 'white'
              }}></i>
            </div>
            
            <div className="hero-badge">
              <span className="badge-pulse">{t('ai_powered')}</span>
            </div>
            
            <h1 className="hero-title">
              {t('plan_perfect_events')}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{t('joynest')}</span>
            </h1>
            
            <p className="hero-subtitle">
              {t('hero_description')}
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => setCurrentPage('role-selection-page')}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                  border: 'none',
                  borderRadius: '50px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 20px rgba(178, 102, 255, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #b266ff, #9d4edd)';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 15px 30px rgba(178, 102, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ff69b4, #b266ff)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 20px rgba(178, 102, 255, 0.3)';
                }}
              >
                <i className="fas fa-rocket"></i>
                {t('get_started_free')}
              </button>
              
              <button 
                className="btn btn-outline btn-large"
                onClick={() => setCurrentPage('login-page')}
                style={{
                  padding: '16px 32px',
                  background: 'transparent',
                  border: '2px solid #b266ff',
                  borderRadius: '50px',
                  color: '#b266ff',
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#b266ff';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(178, 102, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#b266ff';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <i className="fas fa-play"></i>
                {t('watch_demo')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge" style={{
              display: 'inline-block',
              padding: '8px 20px',
              background: 'rgba(178, 102, 255, 0.15)',
              borderRadius: '50px',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#b266ff',
              border: '1px solid rgba(178, 102, 255, 0.3)',
              marginBottom: '20px'
            }}>{t('why_choose_us')}</span>
            
            <h2 className="section-title">
              {t('everything_you_need')}{' '}
              <span style={{
                background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{t('create_amazing_events')}</span>
            </h2>
            
            <p className="section-subtitle">
              {t('features_description')}
            </p>
          </div>

          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px'
          }}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card" style={{
                background: 'white',
                padding: '40px 30px',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(178, 102, 255, 0.1)',
                border: '1px solid rgba(178, 102, 255, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(178, 102, 255, 0.2)';
                e.currentTarget.style.borderColor = '#b266ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(178, 102, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(178, 102, 255, 0.2)';
              }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  margin: '0 auto 25px',
                  background: feature.gradient,
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(178, 102, 255, 0.2)'
                }}>
                  <i className={`fas ${feature.icon}`} style={{ fontSize: '2rem', color: 'white' }}></i>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '15px', color: '#2d2d2d' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#4a4a4a', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{
        padding: '120px 0',
        background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h2 style={{ fontSize: '2.8rem', fontWeight: '700', marginBottom: '20px' }}>
            {t('ready_to_create')}
          </h2>
          <p style={{ fontSize: '1.3rem', marginBottom: '40px', opacity: '0.95' }}>
            {t('join_thousands')}
          </p>
          <button 
            onClick={() => setCurrentPage('role-selection-page')}
            style={{
              padding: '18px 40px',
              background: 'white',
              border: 'none',
              borderRadius: '50px',
              color: '#b266ff',
              fontWeight: '700',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.5)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.8)';
              e.target.style.color = '#ff69b4';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.5)';
              e.target.style.color = '#b266ff';
            }}
          >
            <i className="fas fa-calendar-plus"></i>
            {t('create_first_event')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;