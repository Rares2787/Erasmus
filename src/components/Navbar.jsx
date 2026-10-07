// ============================================================================
// LER EduShare — Navigație Instituțională Cupertino (Securitate Strictă)
// Suport Bilingv (Română / Engleză cu Slider) & Temă Dark/Light
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({
  pendingAdminCount,
  onOpenAddModal,
  onOpenAuthModal,
  onOpenPalette,
  theme = 'light',
  onToggleTheme
}) {
  const { currentUser, isElev, isAdmin, logout } = useAuth();
  const { lang, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop or Esc
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  function getRoleLabel(role) {
    if (role === 'elev') return t('roleElev');
    if (role === 'profesor') return t('roleProfesor');
    if (role === 'admin') return t('roleAdmin');
    return role;
  }

  function handleActionClick(actionFn) {
    setMobileMenuOpen(false);
    if (actionFn) actionFn();
  }

  return (
    <>
      {/* Navigație Principală cu Efect Frosted Glass */}
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand" onClick={() => { setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="brand-symbol">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">{t('brandName')}</span>
              <span className="brand-context">{t('brandContext')}</span>
            </div>
          </div>

          {/* Acțiuni de Navigație Desktop (> 768px) */}
          <div className="nav-actions-desktop">
            {/* Slider Comutare Limbă (RO / EN) */}
            <div
              className="lang-slider-container"
              role="radiogroup"
              aria-label={t('langAria')}
              title={t('langAria')}
            >
              <div
                className={`lang-slider-pill ${lang === 'ro' ? 'is-ro' : 'is-en'}`}
                aria-hidden="true"
              />
              <button
                type="button"
                className={`lang-slider-btn ${lang === 'ro' ? 'active' : ''}`}
                onClick={() => setLanguage('ro')}
                role="radio"
                aria-checked={lang === 'ro'}
              >
                RO
              </button>
              <button
                type="button"
                className={`lang-slider-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
                role="radio"
                aria-checked={lang === 'en'}
              >
                EN
              </button>
            </div>

            {/* Buton Dark / Light Theme */}
            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
              aria-label="Comută tema"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Buton Propune Material */}
            {(isElev || isAdmin) && (
              <button className="btn btn-primary" onClick={onOpenAddModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>{t('proposeMaterial')}</span>
              </button>
            )}

            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="user-capsule">
                  <div className="user-dot-avatar">
                    {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span className="user-capsule-name">{currentUser.fullName}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {getRoleLabel(currentUser.role)}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={logout}
                  title={t('logout')}
                >
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenAuthModal('login')}
                >
                  {t('login')}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenAuthModal('register')}
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>

          {/* Acțiuni de Navigație Mobile (<= 768px) */}
          <div className="nav-actions-mobile">
            {/* Buton Dark / Light Theme pe mobil */}
            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
              aria-label="Comută tema"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Buton Rapid Adaugă Resursă pe Mobil */}
            {(isElev || isAdmin) && (
              <button
                className="btn btn-primary nav-mobile-add-btn"
                onClick={onOpenAddModal}
                title={t('proposeMaterial')}
                aria-label={t('proposeMaterial')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            )}

            {/* Buton Meniu Hamburger */}
            <button
              className="nav-hamburger-btn"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Deschide meniul"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Meniu Mobil Dropdown / Overlay */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
          >
            <div className="mobile-menu-drawer">
              {/* Secțiune Profil Utilizator sau Autentificare */}
              {currentUser ? (
                <div className="mobile-user-card">
                  <div className="mobile-user-header">
                    <div className="user-dot-avatar mobile-avatar">
                      {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
                    </div>
                    <div className="mobile-user-meta">
                      <span className="mobile-user-name">{currentUser.fullName}</span>
                      <span className="session-role-badge">
                        {getRoleLabel(currentUser.role)}
                        {currentUser.classGrade && ` • ${currentUser.classGrade}`}
                        {currentUser.department && ` • ${currentUser.department}`}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '12px' }}
                    onClick={() => handleActionClick(logout)}
                  >
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <div className="mobile-auth-actions">
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => handleActionClick(() => onOpenAuthModal('login'))}
                  >
                    {t('login')}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => handleActionClick(() => onOpenAuthModal('register'))}
                  >
                    {t('register')}
                  </button>
                </div>
              )}

              {/* Acțiuni de Navigație în Meniu */}
              <div className="mobile-menu-links">
                {(isElev || isAdmin) && (
                  <button
                    className="btn btn-primary mobile-menu-btn"
                    onClick={() => handleActionClick(onOpenAddModal)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>{t('proposeMaterial')}</span>
                  </button>
                )}

                {onOpenPalette && (
                  <button
                    className="btn btn-secondary mobile-menu-btn"
                    onClick={() => handleActionClick(onOpenPalette)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>{t('quickSearch')}</span>
                  </button>
                )}
              </div>

              {/* Rând Comutare Limbă în Meniu */}
              <div className="mobile-lang-row">
                <span className="mobile-row-label">Limbă / Language</span>
                <div
                  className="lang-slider-container"
                  role="radiogroup"
                  aria-label={t('langAria')}
                >
                  <div
                    className={`lang-slider-pill ${lang === 'ro' ? 'is-ro' : 'is-en'}`}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`lang-slider-btn ${lang === 'ro' ? 'active' : ''}`}
                    onClick={() => setLanguage('ro')}
                    role="radio"
                    aria-checked={lang === 'ro'}
                  >
                    RO
                  </button>
                  <button
                    type="button"
                    className={`lang-slider-btn ${lang === 'en' ? 'active' : ''}`}
                    onClick={() => setLanguage('en')}
                    role="radio"
                    aria-checked={lang === 'en'}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
