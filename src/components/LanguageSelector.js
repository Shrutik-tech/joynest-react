import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block'
    }}>
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value)}
        style={{
          padding: '10px 20px',
          paddingRight: '35px',
          background: 'rgba(178, 102, 255, 0.08)',
          border: '2px solid rgba(178, 102, 255, 0.2)',
          borderRadius: '40px',
          color: '#b266ff',
          fontWeight: '600',
          fontSize: '0.95rem',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          transition: 'all 0.3s ease',
          fontFamily: 'inherit'
        }}
        onFocus={(e) => e.target.style.borderColor = '#b266ff'}
        onBlur={(e) => e.target.style.borderColor = 'rgba(178, 102, 255, 0.2)'}
        onMouseEnter={(e) => e.target.style.background = 'rgba(178, 102, 255, 0.15)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(178, 102, 255, 0.08)'}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
      <div style={{
        position: 'absolute',
        right: '15px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#b266ff',
        pointerEvents: 'none',
        fontSize: '0.8rem'
      }}>
        ▼
      </div>
    </div>
  );
};

export default LanguageSelector;