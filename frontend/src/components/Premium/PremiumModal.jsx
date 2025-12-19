import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, FilePlus, Image as ImageIcon, Layout, Clock } from 'lucide-react';
import { useTheme } from '@context/ThemeContext';
import { useTranslation } from 'react-i18next';
import logoRecurNote from '../../assets/logorecurnote.png';
import './PremiumModal.css';

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
    navigate('/pricing');
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


    </div>
  );
};

export default PremiumModal;
