// ============================================================================
// LER EduShare — Modale Autentificare & Înregistrare (Securitate Strictă)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onShowToast }) {
  const { login, register } = useAuth();
  const { t } = useLanguage();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'

  // Stare formular login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Stare formular register
  const [regRole, setRegRole] = useState('elev');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regGrade, setRegGrade] = useState('Clasa a X-a');
  const [regDept, setRegDept] = useState('Catedra de Informatică LER');
  const [regContact, setRegContact] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      onShowToast(t('toastLoginSuccess'), 'success');
      onClose();
      setLoginEmail('');
      setLoginPass('');
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        fullName: regName,
        email: regEmail,
        password: regPass,
        role: regRole,
        classGrade: regRole === 'elev' ? regGrade : null,
        department: regRole === 'profesor' ? regDept : null,
        contactHandle: regContact || (regRole === 'elev' ? 'Discord: @elev.ler' : 'Teams: @prof.ler')
      });
      onShowToast(t('toastRegisterSuccess'), 'success');
      onClose();
      setRegName('');
      setRegEmail('');
      setRegPass('');
      setRegContact('');
    } catch (err) {
      onShowToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal-dialog">
        <div className="modal-top">
          <div>
            <h3 className="modal-title">{t('authTitle')}</h3>
            <p className="modal-sub">{t('authSub')}</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label={t('modalCloseBtn')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Segmented Switcher între Conectare și Înregistrare */}
        <div style={{ padding: '16px 24px 0 24px' }}>
          <div className="segmented-control" style={{ width: '100%', justifyContent: 'center' }}>
            <button
              className={`segmented-item ${tab === 'login' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('login')}
            >
              {t('authTabLogin')}
            </button>
            <button
              className={`segmented-item ${tab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('register')}
            >
              {t('authTabRegister')}
            </button>
          </div>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="modal-form">
            <div className="field-group">
              <label>{t('authEmailLabel')}</label>
              <input
                type="email"
                required
                placeholder="elev@ler.ro sau profesor@ler.ro"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>{t('authPassLabel')}</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>

            <div style={{
              backgroundColor: 'var(--apple-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              lineHeight: 1.5,
              color: 'var(--text-secondary)'
            }}>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {t('authDemoTitle')}
              </strong>
              • Elev: <code>elev@ler.ro</code> / <code>elev123</code><br />
              • Profesor: <code>profesor@ler.ro</code> / <code>prof123</code><br />
              • Administrator: <code>admin@ler.ro</code> / <code>admin123</code>
            </div>

            <div className="modal-bottom" style={{ padding: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('addCancelBtn')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t('authProcessing') : t('authLoginSubmit')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            <div className="field-group">
              <label>{t('authRoleLabel')}</label>
              <div className="segmented-control" style={{ width: '100%' }}>
                <button
                  type="button"
                  className={`segmented-item ${regRole === 'elev' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRegRole('elev')}
                >
                  {t('roleElev')}
                </button>
                <button
                  type="button"
                  className={`segmented-item ${regRole === 'profesor' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRegRole('profesor')}
                >
                  {t('roleProfesor')}
                </button>
              </div>
            </div>

            <div className="field-group">
              <label>{t('authNameLabel')}</label>
              <input
                type="text"
                required
                placeholder="Ex: Andrei Popescu"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>{t('authEmailLabel')}</label>
              <input
                type="email"
                required
                placeholder="adresa@ler.ro"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>{t('authPassLabel')}</label>
              <input
                type="password"
                required
                placeholder="Minim 6 caractere"
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
              />
            </div>

            {regRole === 'elev' ? (
              <div className="field-group">
                <label>{t('authGradeLabel')}</label>
                <select value={regGrade} onChange={(e) => setRegGrade(e.target.value)}>
                  <option value="Clasa a IX-a">{t('grade9')}</option>
                  <option value="Clasa a X-a">{t('grade10')}</option>
                  <option value="Clasa a XI-a">{t('grade11')}</option>
                  <option value="Clasa a XII-a">{t('grade12')}</option>
                </select>
              </div>
            ) : (
              <div className="field-group">
                <label>{t('authDeptLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Catedra de Matematică"
                  value={regDept}
                  onChange={(e) => setRegDept(e.target.value)}
                />
              </div>
            )}

            <div className="field-group">
              <label>{t('authContactLabel')}</label>
              <input
                type="text"
                placeholder={regRole === 'elev' ? 'Discord: @popescu' : 'Teams: prenume.nume@ler.ro'}
                value={regContact}
                onChange={(e) => setRegContact(e.target.value)}
              />
            </div>

            <div className="modal-bottom" style={{ padding: 0 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {t('addCancelBtn')}
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? t('authProcessing') : t('authRegisterSubmit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
