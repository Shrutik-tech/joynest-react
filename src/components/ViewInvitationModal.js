// src/components/ViewInvitationModal.js
import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ViewInvitationModal = ({ invitation, onClose }) => {
  // ============================================
  // TEMPLATE BACKGROUNDS
  // ============================================
  const getTemplateBackground = (templateId) => {
    switch(templateId) {
      case 1: return 'linear-gradient(135deg, #2b1545 0%, #1a0d2e 50%, #2b1545 100%)';
      case 2: return 'linear-gradient(135deg, #0a1931 0%, #0c2340 50%, #0a1931 100%)';
      case 3: return 'linear-gradient(135deg, #064e3b 0%, #0a5f4e 50%, #064e3b 100%)';
      case 4: return 'linear-gradient(135deg, #5c1a33 0%, #7e1946 50%, #5c1a33 100%)';
      case 5: return 'linear-gradient(135deg, #d4708c 0%, #b8546e 50%, #d4708c 100%)';
      case 6: return 'linear-gradient(135deg, #001529 0%, #002a52 50%, #001529 100%)';
      case 7: return 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #1b4332 100%)';
      case 8: return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff6b6b 100%)';
      case 9: return 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)';
      case 10: return 'linear-gradient(135deg, #8b7355 0%, #a0826d 50%, #8b7355 100%)';
      case 11: return 'linear-gradient(135deg, #0f766e 0%, #14b8a6 50%, #0f766e 100%)';
      case 12: return 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #1f2937 100%)';
      case 13: return 'linear-gradient(135deg, #fecdd3 0%, #fda4af 50%, #fecdd3 100%)';
      case 14: return 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 50%, #4c1d95 100%)';
      case 15: return 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)';
      default: return 'linear-gradient(135deg, #2b1545 0%, #1a0d2e 50%, #2b1545 100%)';
    }
  };

  // ============================================
  // DOWNLOAD FUNCTIONS
  // ============================================
  const downloadImage = async () => {
    const element = document.getElementById('viewInvitationPreview');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${invitation.eventName || 'invitation'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      alert('Invitation downloaded as PNG!');
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading invitation. Please try again.');
    }
  };

  const downloadPDF = async () => {
    const element = document.getElementById('viewInvitationPreview');
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
      pdf.save(`${invitation.eventName || 'invitation'}.pdf`);
      
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF error:', error);
      alert('Error creating PDF. Please try again.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 20000,
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
        maxWidth: '900px',
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
          <h2 style={{
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ff69b4, #b266ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {invitation.eventName || 'Invitation Preview'}
          </h2>
        </div>

        {/* Invitation Preview */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <div
            id="viewInvitationPreview"
            style={{
              position: 'relative',
              width: '550px',
              minHeight: '700px',
              background: getTemplateBackground(invitation.template || 1),
              borderRadius: '20px',
              padding: '45px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              overflow: 'hidden',
              color: invitation.fontColor || '#d4af37',
              fontFamily: invitation.fontFamily || "'Great Vibes', cursive"
            }}
          >
            {/* Border */}
            <div style={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              right: '15px',
              bottom: '15px',
              border: invitation.template === 2 ? '2px dashed currentColor' :
                      invitation.template === 4 ? '5px double currentColor' :
                      invitation.template === 6 ? '8px solid transparent' :
                      '3px solid currentColor',
              borderImage: invitation.template === 6 ? 'linear-gradient(45deg, currentColor, transparent, currentColor) 1' : 'none',
              borderRadius: 
                invitation.template === 3 ? '20px' :
                invitation.template === 5 ? '25px' :
                invitation.template === 8 ? '18px' :
                invitation.template === 11 ? '26px' :
                '12px',
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
              color: invitation.accentColor || '#ff69b4'
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
              color: invitation.accentColor || '#ff69b4'
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
              {invitation.photo && (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  border: '4px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}>
                  <img src={invitation.photo} alt="Person" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Title */}
              <div style={{
                fontSize: '2.2rem',
                marginBottom: '5px',
                fontWeight: '400',
                letterSpacing: '2px'
              }}>
                {invitation.eventName?.includes('birthday') ? 'Birthday Invitation' : 
                 invitation.eventName?.includes('wedding') ? 'Wedding Invitation' : 'Invitation'}
              </div>
              
              <div style={{
                fontSize: '1rem',
                letterSpacing: '4px',
                marginBottom: '15px',
                textTransform: 'lowercase',
                fontFamily: "'Playfair Display', serif"
              }}>
                save the date
              </div>
              
              {/* Name */}
              <div style={{
                fontSize: '3rem',
                margin: '15px 0',
                lineHeight: 1.2,
                fontWeight: '400'
              }}>
                {invitation.eventName?.split("'s")[0] || 'Your Name'}
              </div>
              
              {/* Tagline */}
              {invitation.tagline && (
                <div style={{
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  marginBottom: '15px',
                  fontFamily: "'Playfair Display', serif"
                }}>
                  {invitation.tagline.toUpperCase()}
                </div>
              )}
              
              {/* Divider */}
              <div style={{
                margin: '15px auto',
                width: '150px',
                height: '2px',
                background: `linear-gradient(to right, transparent, ${invitation.accentColor || '#ff69b4'}, transparent)`
              }}></div>
              
              {/* Event Details */}
              <div style={{
                lineHeight: 1.8,
                textTransform: 'uppercase',
                letterSpacing: '2px',
                fontSize: '0.9rem',
                fontFamily: "'Playfair Display', serif"
              }}>
                <div>{(invitation.date || 'DATE TBD').toUpperCase()}</div>
                {invitation.time && (
                  <div style={{ marginTop: '5px' }}>{invitation.time.toUpperCase()}</div>
                )}
                <div style={{ marginTop: '10px' }}>{(invitation.location || 'VENUE TBD').toUpperCase()}</div>
                {invitation.address && (
                  <div style={{ marginTop: '5px', fontSize: '0.85rem' }}>
                    {invitation.address.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Download Buttons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={downloadImage}
            style={{
              padding: '14px 30px',
              background: 'white',
              border: '2px solid #b266ff',
              borderRadius: '50px',
              color: '#b266ff',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#b266ff';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#b266ff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-download"></i>
            Download PNG
          </button>
          <button
            onClick={downloadPDF}
            style={{
              padding: '14px 30px',
              background: 'white',
              border: '2px solid #b266ff',
              borderRadius: '50px',
              color: '#b266ff',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#b266ff';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
              e.target.style.color = '#b266ff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            <i className="fas fa-file-pdf"></i>
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInvitationModal;