// ============================================================================
// LER EduShare — Navigație Instituțională Cupertino (Securitate Strictă)
// ============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  pendingAdminCount,
  onOpenAddModal,
  onOpenAuthModal,
  theme = 'light',
  onToggleTheme
}) {
  const { currentUser, isElev, isAdmin, logout } = useAuth();

  function getRoleLabel(role) {
    if (role === 'elev') return 'Elev';
    if (role === 'profesor') return 'Profesor';
    if (role === 'admin') return 'Administrator';
    return role;
  }

  return (
    <>
      {/* Navigație Principală cu Efect Frosted Glass */}
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-symbol">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-name">EduShare</span>
              <span className="brand-context">Liceul Teoretic „Emil Racoviță”</span>
            </div>
          </div>

          {/* Acțiuni de Navigație și Stare Autentificare */}
          <div className="nav-actions">
            {/* Buton Dark / Light Theme */}
            <button
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Comută pe Mod Clar (Light)' : 'Comută pe Mod Întunecat (Dark)'}
              aria-label="Comută tema"
            >
              {theme === 'dark' ? (
                /* Sun Icon */
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
                /* Moon Icon */
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* Buton Propune Material (Disponibil pentru Elevi și Administratori logați) */}
            {(isElev || isAdmin) && (
              <button className="btn btn-primary" onClick={onOpenAddModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Propune Material</span>
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
                  title="Deconectare din contul curent"
                >
                  Deconectare
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onOpenAuthModal('login')}
                >
                  Conectare
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onOpenAuthModal('register')}
                >
                  Înregistrare
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
