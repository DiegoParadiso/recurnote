import React, { useState } from 'react';
import { X, FilePlus, Image as ImageIcon, Layout, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';

const PremiumFeature = ({ icon: Icon, title, description, isPremium = false }) => {
  const { t } = useTranslation();
  const { isLightTheme } = useTheme();
  
  return (
    <div className={`feature-item ${isPremium ? 'premium' : ''}`}>
      <div className="feature-icon">
        <Icon size={24} />
      </div>
      <div className="feature-content">
        <h4 className="feature-title">
          {title}
          {isPremium && <span className="premium-badge">{t('premium.newBadge')}</span>}
        </h4>
        <p className="feature-description">{description}</p>
      </div>
      <style jsx>{`
        .feature-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          background: var(--color-bg-2);
          margin-bottom: 1rem;
          transition: var(--transition-all);
        }
        
        .feature-item.premium {
          border: 1px solid var(--color-text-secondary);
          position: relative;
          overflow: hidden;
          background: var(--color-neutral);
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
          margin: 0 0 0.25rem 0;
          color: var(--color-text-primary);
          font-weight: 600;
        }
        
        .premium-badge {
          --badge-highlight: color-mix(in srgb, var(--color-warning), white 20%);
          background: linear-gradient(135deg, var(--color-neutral-dark), var(--color-neutral-darker));
          color: var(--color-text-primary);
          font-size: 0.7rem;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid var(--color-border);
          box-shadow: 
            0 2px 4px var(--color-neutral-darker),
            0 0 0 1px var(--color-neutral-darker),
            inset 0 1px 0 var(--color-neutral-light);
          position: relative;
          overflow: hidden;
          animation: pulse 2s infinite;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
          margin-left: 0.5rem;
          transform: translateY(-1px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          min-width: 3em;
        }
        
        .premium-badge::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom right,
            var(--color-neutral-light) 0%,
            transparent 60%
          );
          border-radius: 10px;
          pointer-events: none;
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 var(--color-text-secondary);
          }
          70% {
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-text-secondary), transparent 100%);
          }
          100% {
            box-shadow: 0 0 0 0 color-mix(in srgb, var(--color-text-secondary), transparent 100%);
          }
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
        <button className="close-button" onClick={handleClose} aria-label="Cerrar">
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <h2 className="modal-title">{t('premium.upgradeToPremium')}</h2>
          <p className="modal-subtitle">{t('premium.unlockFullPotential')}</p>
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

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: var(--z-modal);
          backdrop-filter: blur(5px);
          opacity: 1;
          transition: var(--transition-normal);
        }
        
        .modal-overlay.closing {
          opacity: 0;
        }
        
        .modal-content {
          background: var(--color-bg);
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          position: relative;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(0);
          transition: var(--transition-normal);
          border: 1px solid var(--color-border);
        }
        
        .modal-overlay.closing .modal-content {
          transform: translateY(-20px);
        }
        
        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
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
        }
        
        .close-button:hover {
          background: var(--color-neutral-dark);
          color: var(--color-text-primary);
        }
        
        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }
        
        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary);
          background: linear-gradient(135deg, var(--color-text-primary), var(--color-minimal-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .modal-subtitle {
          color: var(--color-text-primary);
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
        }
        
        .features-list {
          margin-bottom: 2rem;
        }
        
        .modal-footer {
          text-align: center;
          padding: 0 1rem;
        }
        
        .upgrade-button {
          background: linear-gradient(135deg, var(--color-minimal-primary), var(--color-minimal-accent));
          color: white;
          border: none;
          border-radius: 8px;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: var(--transition-all);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-top: 1rem;
        }
        
        .upgrade-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
          filter: brightness(1.1);
        }
        
        .upgrade-button:active {
          transform: translateY(0);
        }
        
        .free-trial {
          color: var(--color-minimal-secondary);
          font-size: 0.875rem;
          margin: 1rem 0 0 0;
          font-style: italic;
        }
        
        @media (max-width: 480px) {
          .modal-content {
            width: 95%;
            padding: 1.5rem 1rem;
          }
          
          .modal-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PremiumModal;
