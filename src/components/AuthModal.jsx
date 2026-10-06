// ============================================================================
// LER EduShare — Modale Autentificare & Înregistrare (Securitate Strictă)
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onShowToast }) {
  const { login, register } = useAuth();
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
      onShowToast('Autentificare realizată cu succes.', 'success');
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
        role: regRole, // Doar 'elev' sau 'profesor'
        classGrade: regRole === 'elev' ? regGrade : null,
        department: regRole === 'profesor' ? regDept : null,
        contactHandle: regContact || (regRole === 'elev' ? 'Discord: @elev.ler' : 'Teams: @prof.ler')
      });
      onShowToast('Contul a fost creat și autentificat cu succes.', 'success');
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h3 className="modal-title">Cont Instituțional EduShare</h3>
            <p className="modal-sub">Autentificare în sistemul educațional al Liceului Teoretic „Emil Racoviță”</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Închide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              Autentificare
            </button>
            <button
              className={`segmented-item ${tab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setTab('register')}
            >
              Înregistrare Cont Nou
            </button>
          </div>
        </div>

        {tab === 'login' ? (
          <div style={{ padding: '24px' }}>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field-group">
                <label>Adresă Email Instituțională *</label>
                <input
                  type="email"
                  required
                  placeholder="ex: elev@ler.ro, profesor@ler.ro sau admin@ler.ro"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Parolă *</label>
                <input
                  type="password"
                  required
                  placeholder="Introduceți parola..."
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                />
              </div>

              {/* Ghid informativ discret privind conturile existente */}
              <div style={{ background: 'var(--apple-subtle)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '11px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                <strong>Conturi configurate în sistem:</strong><br />
                &bull; <strong>Elev</strong>: elev@ler.ro (parolă: elev123)<br />
                &bull; <strong>Profesor</strong>: profesor@ler.ro (parolă: prof123)<br />
                &bull; <strong>Administrator</strong>: admin@ler.ro (parolă: admin123)
              </div>

              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  Anulare
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Se verifică datele...' : 'Conectare'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="modal-form">
            <div className="field-group">
              <label>Statut în Instituție (Rol) *</label>
              <div className="segmented-control" style={{ width: '100%', justifyContent: 'center' }}>
                <button
                  type="button"
                  className={`segmented-item ${regRole === 'elev' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRegRole('elev')}
                >
                  Elev (Liceu)
                </button>
                <button
                  type="button"
                  className={`segmented-item ${regRole === 'profesor' ? 'active' : ''}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setRegRole('profesor')}
                >
                  Cadru Didactic (Profesor)
                </button>
              </div>
            </div>

            <div className="form-grid">
              <div className="field-group span-2">
                <label>Nume și Prenume *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Andrei Vasilescu"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Adresă Email *</label>
                <input
                  type="email"
                  required
                  placeholder="andrei@ler.ro"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label>Parolă *</label>
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
                  <label>Clasă de Proveniență *</label>
                  <select value={regGrade} onChange={(e) => setRegGrade(e.target.value)}>
                    <option value="Clasa a IX-a">Clasa a IX-a</option>
                    <option value="Clasa a X-a">Clasa a X-a</option>
                    <option value="Clasa a XI-a">Clasa a XI-a</option>
                    <option value="Clasa a XII-a">Clasa a XII-a</option>
                  </select>
                </div>
              ) : (
                <div className="field-group">
                  <label>Catedră / Specialitate *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Catedra de Informatică"
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value)}
                  />
                </div>
              )}

              <div className="field-group">
                <label>Canal de Contact (Discord / Teams) *</label>
                <input
                  type="text"
                  required
                  placeholder="Discord: @nume sau Teams"
                  value={regContact}
                  onChange={(e) => setRegContact(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-bottom">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Anulare
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Se creează contul...' : 'Înregistrare Cont'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
