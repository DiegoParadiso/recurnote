import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FilePlus, Image as ImageIcon, Layout, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';
import logoRecurNote from '../../assets/logorecurnote.png';

const PremiumFeature = ({ icon: Icon, title, description, isPremium = false }) => {
  const { t } = useTranslation();
  const { isLightTheme } = useTheme();

  return (
    <div className={`feature-item ${isPremium ? 'premium' : ''}`}>
      <div className="feature-icon">
        <Icon size={20} />
      </div>
      <div className="feature-content">
        <h4 className="feature-title">
          {title}
        </h4>
        <p className="feature-description">{description}</p>
      </div>
      <style jsx>{`
        .feature-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 5px;
          background: var(--color-bg-2);
          margin-bottom: 1rem;
          transition: var(--transition-all);
          border: 1px solid transparent;
        }
        
        .feature-item.premium {
          background: color-mix(in srgb, var(--color-bg), transparent 50%);
          border: 1px solid color-mix(in srgb, var(--color-text-secondary), transparent 80%);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(5px);
        }
        
        .feature-icon {
          color: var(--color-minimal-primary);
        }
        
        .feature-content {
          flex: 1;
        }
        
        .feature-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--color-text-primary);
        }
        
        .feature-description {
          margin: 0;
          font-size: 0.9rem;
          color: var(--color-minimal-secondary);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};

const PremiumModal = ({ isOpen, onClose, onUpgrade }) => {
  const { t } = useTranslation();
  const { isLightTheme } = useTheme();
  const [isClosing, setIsClosing] = useState(false);

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };



  const handleUpgrade = () => {
    onUpgrade();
    handleClose();
    navigate('/payment');
  };

  const features = [
    {
      icon: FilePlus,
      title: t('premium.unlimitedNotes'),
      description: t('premium.unlimitedNotesDesc'),
      premium: true
    },
    {
      icon: ImageIcon,
      title: t('premium.exclusiveStyles'),
      description: t('premium.exclusiveStylesDesc'),
      premium: true
    },
    {
      icon: Layout,
      title: t('premium.whiteboardMode'),
      description: t('premium.whiteboardModeDesc'),
      premium: true
    },
    {
      icon: Clock,
      title: t('premium.fullHistory'),
      description: t('premium.fullHistoryDesc'),
      premium: true
    }
  ];

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-background-logo">
          <img src={logoRecurNote} alt="" aria-hidden="true" />
        </div>

        <div className="modal-scroll-content">
          <button className="close-button" onClick={handleClose} aria-label="Cerrar">
            <X size={20} />
          </button>

          <div className="modal-header">
          </div>

          <div className="features-list">
            {features.map((feature, index) => (
              <PremiumFeature
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isPremium={feature.premium}
              />
            ))}
          </div>

          <div className="modal-footer">
            <button className="upgrade-button" onClick={handleUpgrade}>
              {t('premium.upgradeNow')}
            </button>
            <p className="free-trial">{t('premium.freeTrial')}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: calc(var(--z-max) + 10);
          backdrop-filter: blur(8px);
          opacity: 1;
        }
        
        .modal-overlay.closing {
          opacity: 0;
        }
        
        .modal-content {
          background: var(--color-premium-overlay);
          border-radius: 10px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          position: relative;
          transform: translateY(0) scale(1);
          transition: var(--transition-normal);
          border: 1px solid color-mix(in srgb, var(--color-text-primary), transparent 92%);
          display: flex;
          flex-direction: column;
          overflow: hidden; /* Clips the logo */
        }

        .modal-scroll-content {
          overflow-y: auto;
          overflow-x: hidden;
          padding: 2.5rem 2rem;
          flex: 1;
          position: relative;
          z-index: 1;
        }
        
        .modal-overlay.closing .modal-content {
          transform: translateY(20px) scale(0.95);
        }
        
        .modal-background-logo {
          position: absolute;
          bottom: -15%;
          right: -15%;
          top: auto;
          left: auto;
          transform: rotate(-15deg);
          width: 60%;
          pointer-events: none;
          z-index: 0;
          opacity: 0.15; /* Darker for light mode (was 0.05 in theme) */
          filter: brightness(var(--logo-brightness)) invert(var(--logo-invert)) contrast(var(--logo-contrast));
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        /* Dark mode adjustments */
        :global(html.dark) .modal-background-logo {
          opacity: var(--logo-opacity); /* Use theme default for dark mode */
        }
        
        .modal-background-logo img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }
        
        .close-button {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: none;
          border: none;
          color: var(--color-minimal-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-all);
          z-index: 2;
        }
        
        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
          position: relative;
          z-index: 1;
        }
        
        .modal-title {
          font-size: 1.85rem;
          font-weight: 800;
          margin: 0 0 0.75rem 0;
          color: var(--color-text-primary);
          letter-spacing: -0.02em;
        }
        
        .modal-subtitle {
          color: var(--color-text-secondary);
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.5;
          font-weight: 500;
        }
        
        .features-list {
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 1;
        }
        
        .modal-footer {
          text-align: center;
          padding: 0 1rem;
          position: relative;
          z-index: 1;
        }
        
        .upgrade-button {
          background: var(--color-text-primary);
          color: var(--color-bg);
          border: none;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: var(--transition-all);
        }
        
        .upgrade-button:hover {
          letter-spacing: 0.5px;
        }
        
        .upgrade-button:active {
          transform: scale(0.98);
        }
        
        .free-trial {
          color: var(--color-minimal-secondary);
          font-size: 0.9rem;
          margin: 1.25rem 0 0 0;
          font-weight: 500;
        }
        
        @media (max-width: 480px) {
          .modal-content {
            width: 95%;
            padding: 2rem 1.5rem;
            border-radius: 20px;
          }
          
          .modal-title {
            font-size: 1.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumModal;
