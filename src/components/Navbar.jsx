// ============================================================================
// LER EduShare — Navigație Instituțională Cupertino (Securitate Strictă)
// ============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  pendingAdminCount,
  onOpenAddModal,
  onOpenAuthModal
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
      {/* Antet Instituțional Erasmus+ */}
      <aside className="global-banner" aria-label="Program Erasmus+">
        <div className="container banner-inner">
          <div className="banner-left">
            <span className="eu-flag-box">EU</span>
            <span>Programul Erasmus+ | Parteneriat Strategic DIGI-EQUAL</span>
          </div>
          <div className="banner-right">
            <span>Liceul Teoretic „Emil Racoviță” Vaslui</span>
            <span className="divider-dot"></span>
            <span>Sesiunea 2026</span>
          </div>
        </div>
      </aside>

      {/* Navigație Principală cu Efect Frosted Glass */}
      <header className="navbar">
        <div className="container nav-inner">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="brand-symbol">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
            {/* Buton Propune Material (Disponibil pentru Elevi și Administratori logați) */}
            {(isElev || isAdmin) && (
              <button className="btn btn-primary" onClick={onOpenAddModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
