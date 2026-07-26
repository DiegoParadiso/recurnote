import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, HelpCircle, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EmptyLogo from '@components/common/EmptyLogo';
import '@styles/legal.css';

export default function LegalLayout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/terms', label: t('legal.nav.terms') || 'Términos', icon: <FileText size={18} /> },
    { path: '/privacy', label: t('legal.nav.privacy') || 'Privacidad', icon: <Shield size={18} /> },
    { path: '/faq', label: t('legal.nav.faq') || 'FAQ', icon: <HelpCircle size={18} /> }
  ];

  return (
    <div className="legal-layout">
      {/* Sidebar Navigation */}
      <aside className="legal-sidebar">
        <div className="legal-sidebar-header">
          <Link to="/register" className="back-button">
            <ArrowLeft size={18} />
            <span>{t('legal.nav.back') || 'Volver'}</span>
          </Link>
        </div>

        <nav className="legal-nav">
          <div className="legal-nav-section">
            <h3 className="legal-nav-title">{t('legal.nav.resources') || 'Recursos Legales'}</h3>
            <ul>
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`legal-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:recurnote@gmail.com" className="legal-nav-link">
                  <Mail size={18} />
                  <span>{t('legal.nav.contact') || 'Contacto'}</span>
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="legal-main" style={{ position: 'relative', overflow: 'hidden' }}>
        {children}
        <EmptyLogo 
          circleSize="500px" 
          style={{ 
            top: 'auto', 
            left: 'auto', 
            bottom: '-10%', 
            right: '-10%', 
            transform: 'rotate(-15deg)',
            zIndex: 0
          }} 
        />
      </main>
    </div>
  );
}
