// ============================================================================
// LER EduShare — Aplicație Principală React (Sincronizare în Timp Real)
// Liceul Teoretic „Emil Racoviță” Vaslui | Erasmus+ DIGI-EQUAL
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { db } from './services/database';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResourceCard from './components/ResourceCard';
import AddResourceModal from './components/AddResourceModal';
import TeacherVerifyModal from './components/TeacherVerifyModal';
import TeacherReportModal from './components/TeacherReportModal';
import ResourceDetailModal from './components/ResourceDetailModal';
import Toast from './components/Toast';

export default function App() {
  const { currentUser, isElev, isProfesor, isAdmin, isAuthenticated } = useAuth();

  // Date din Baza de Date
  const [resources, setResources] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab activ
  const [activeTab, setActiveTab] = useState('catalog');

  // Filtre catalog
  const [activeSubject, setActiveSubject] = useState('all');
  const [filterVerification, setFilterVerification] = useState('all');
  const [filterGrade, setFilterGrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');

  // Modale
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState('login');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  // Sistem Toast
  const [toasts, setToasts] = useState([]);

  function showToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }

  // Încărcare date din baza de date
  async function reloadData(silent = false) {
    if (!silent) setLoading(true);
    try {
      const [resData, repData] = await Promise.all([
        db.getResources(),
        db.getReports()
      ]);
      setResources(resData);
      setReports(repData);
    } catch (err) {
      if (!silent) showToast('Eroare la sincronizarea bazei de date.', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }

  // Încărcare inițială și abonare la actualizări live
  useEffect(() => {
    reloadData();

    // 1. Abonare la evenimente Supabase Realtime (dacă este conectat cloud)
    const unsubscribe = db.subscribeLiveUpdates(() => {
      reloadData(true);
    });

    // 2. Sincronizare automată periodică la fiecare 12 secunde
    const interval = setInterval(() => {
      reloadData(true);
    }, 12000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Protecție strictă a taburilor în funcție de rol
  useEffect(() => {
    if (activeTab === 'adminQueue' && !isAdmin) {
      setActiveTab('catalog');
    }
    if (activeTab === 'reportsQueue' && !isProfesor && !isAdmin) {
      setActiveTab('catalog');
    }
    if (activeTab === 'mySubmissions' && !isAuthenticated) {
      setActiveTab('catalog');
    }
  }, [currentUser, isElev, isProfesor, isAdmin, isAuthenticated, activeTab]);

  // Statistici
  const pendingAdminResources = useMemo(
    () => resources.filter((r) => r.status === 'pending_admin'),
    [resources]
  );
  const approvedResources = useMemo(
    () => resources.filter((r) => r.status === 'approved'),
    [resources]
  );
  const verifiedResources = useMemo(
    () => approvedResources.filter((r) => r.isVerified),
    [approvedResources]
  );
  const openReports = useMemo(
    () => reports.filter((r) => r.status === 'open'),
    [reports]
  );

  // Filtrare Catalog Public
  const filteredCatalog = useMemo(() => {
    return approvedResources.filter((r) => {
      if (activeSubject !== 'all' && r.subject !== activeSubject) return false;
      if (filterVerification === 'verified' && !r.isVerified) return false;
      if (filterVerification === 'pending_teacher' && r.isVerified) return false;
      if (filterGrade !== 'all' && r.grade !== filterGrade) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matches =
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.subject.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          r.authorName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [approvedResources, activeSubject, filterVerification, filterGrade, searchQuery]);

  // Materialele utilizatorului curent
  const mySubmissions = useMemo(() => {
    if (!currentUser) return [];
    return resources.filter(
      (r) => r.authorId === currentUser.id || r.authorName.includes(currentUser.fullName)
    );
  }, [resources, currentUser]);

  // Operațiuni Bază de Date Securizate
  async function handleAddResource(payload) {
    if (!isAuthenticated) {
      showToast('Trebuie să fii autentificat pentru a propune o resursă.', 'warning');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      const created = await db.addResource(payload);
      setResources((prev) => [created, ...prev]);
      showToast('Propunerea a fost înregistrată. Va fi redirecționată către administrator.', 'success');
    } catch (err) {
      showToast('Eroare la salvarea resursei.', 'error');
    }
  }

  async function handleAdminApprove(id) {
    if (!isAdmin) {
      showToast('Acces interzis. Doar administratorul poate autoriza publicarea.', 'error');
      return;
    }
    try {
      const updated = await db.updateResource(id, { status: 'approved' });
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, status: 'approved' } : r)));
      showToast('Resursa a fost autorizată și publicată în catalogul public.', 'success');
    } catch (err) {
      showToast('Eroare la aprobare.', 'error');
    }
  }

  async function handleAdminReject(id) {
    if (!isAdmin) {
      showToast('Acces interzis. Doar administratorul poate respinge propuneri.', 'error');
      return;
    }
    if (!confirm('Confirmați respingerea acestei propuneri didactice?')) return;
    try {
      const updated = await db.updateResource(id, { status: 'rejected' });
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, status: 'rejected' } : r)));
      showToast('Propunerea a fost respinsă.', 'warning');
    } catch (err) {
      showToast('Eroare la respingere.', 'error');
    }
  }

  async function handleTeacherVerifyConfirm(id, { teacherName, teacherComment }) {
    if (!isProfesor) {
      showToast('Acces interzis. Doar cadrele didactice pot acorda aviz metodic.', 'error');
      return;
    }
    try {
      await db.updateResource(id, {
        isVerified: true,
        verifiedBy: teacherName,
        teacherComment
      });
      setResources((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, isVerified: true, verifiedBy: teacherName, teacherComment }
            : r
        )
      );
      showToast('Avizul didactic a fost acordat cu succes.', 'success');
    } catch (err) {
      showToast('Eroare la validare.', 'error');
    }
  }

  async function handleTeacherReportConfirm(payload) {
    if (!isProfesor) {
      showToast('Acces interzis. Doar cadrele didactice pot iniția sesizări metodice.', 'error');
      return;
    }
    try {
      const newReport = await db.addReport(payload);
      setReports((prev) => [newReport, ...prev]);
      if (payload.targetRecipient === 'admin') {
        showToast('Sesizarea a fost înaintată către administrator.', 'warning');
      } else {
        showToast('Indicațiile de corectură au fost transmise elevului autor.', 'success');
      }
    } catch (err) {
      showToast('Eroare la transmiterea sesizării.', 'error');
    }
  }

  async function handleTakeDownResource(resourceId, reportId) {
    if (!isAdmin) {
      showToast('Acces interzis. Doar administratorul poate retrage definitiv o resursă.', 'error');
      return;
    }
    if (!confirm('Confirmați retragerea definitivă a acestei resurse din catalog?')) return;
    try {
      await db.deleteResource(resourceId);
      await db.resolveReport(reportId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? { ...rep, status: 'resolved' } : rep))
      );
      showToast('Resursa a fost retrasă din catalog.', 'error');
    } catch (err) {
      showToast('Eroare la retragerea resursei.', 'error');
    }
  }

  async function handleResolveReport(reportId) {
    if (!isAdmin && !isProfesor) return;
    try {
      await db.resolveReport(reportId);
      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? { ...rep, status: 'resolved' } : rep))
      );
      showToast('Sesizarea a fost arhivată.', 'success');
    } catch (err) {
      showToast('Eroare la actualizarea sesizării.', 'error');
    }
  }

  async function handleAdminRemove(id) {
    if (!isAdmin) {
      showToast('Acces interzis. Doar administratorul poate elimina resurse.', 'error');
      return;
    }
    try {
      await db.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast('Resursa a fost ștearsă din catalog.', 'error');
    } catch (err) {
      showToast('Eroare la ștergerea resursei.', 'error');
    }
  }

  return (
    <>
      {/* Navigație fără comutator demo */}
      <Navbar
        pendingAdminCount={isAdmin ? pendingAdminResources.length : 0}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenAuthModal={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthOpen(true);
        }}
      />

      {/* Bară Informații Sesiune Curentă */}
      <section className="session-strip">
        <div className="container session-inner">
          <div className="session-identity">
            <span
              className="status-indicator"
              style={{ backgroundColor: isAuthenticated ? 'var(--apple-green)' : 'var(--text-tertiary)' }}
            ></span>
            <span className="session-label">Sesiune:</span>
            {isAuthenticated ? (
              <>
                <strong>{currentUser.fullName}</strong>
                <span className="session-role-badge">
                  {currentUser.role.toUpperCase()}
                  {currentUser.classGrade && ` • ${currentUser.classGrade}`}
                  {currentUser.department && ` • ${currentUser.department}`}
                </span>
              </>
            ) : (
              <>
                <strong>Vizitator Neautentificat</strong>
                <span className="session-role-badge">ACCES PUBLIC</span>
              </>
            )}
          </div>

          <div className="session-capability">
            {!isAuthenticated && 'Consultare catalog public. Conectați-vă pentru a propune materiale didactice.'}
            {isElev && 'Rol Elev: Consultare catalog, descărcare resurse, propunere materiale și mentorat peer-to-peer.'}
            {isProfesor && 'Rol Profesor: Validare metodică a resurselor, acordare avize didactice și semnalare neconformități.'}
            {isAdmin && 'Rol Administrator: Autorizare inițială a resurselor propuse și gestionare cereri de retragere.'}
          </div>
        </div>
      </section>

      {/* Hero & Metrici Didactice */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div>
            <div className="kicker">Platformă Instituțională de Învățare Colaborativă</div>
            <h1 className="hero-title">Resurse didactice validate.<br />Egalitate de șanse în educație.</h1>
            <p className="hero-description">
              Dezvoltat în cadrul mobilității Erasmus+ <strong>DIGI-EQUAL</strong>, sistemul conectează elevii Liceului Teoretic „Emil Racoviță” prin materiale de studiu riguros structurate, verificate metodologic de cadrele didactice pentru eliminarea erorilor științifice.
            </p>

            {/* Căutare Apple Style */}
            <div className="search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Căutare după disciplină, concept sau titlu (ex: vectori, grafuri, BAC)..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSearchQuery(tempSearch);
                }}
              />
              <button
                className="btn btn-primary btn-search"
                onClick={() => setSearchQuery(tempSearch)}
              >
                Căutare
              </button>
            </div>
          </div>

          {/* Panou Metrici */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-value">{verifiedResources.length}</span>
              <span className="metric-label">Resurse Verificate</span>
              <span className="metric-sub">Aviz didactic acordat</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{approvedResources.length}</span>
              <span className="metric-label">Publicate în Catalog</span>
              <span className="metric-sub">Disponibile comunității</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">14</span>
              <span className="metric-label">Mentori Voluntari</span>
              <span className="metric-sub">Sprijin reciproc elev-elev</span>
            </div>
          </div>
        </div>
      </section>

      {/* Spațiu de Lucru Principal cu Taburi Protejate */}
      <main className="container workspace">
        <div className="workspace-tabs">
          <button
            className={`tab-button ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <span>Catalog Resurse</span>
          </button>

          {/* Tab vizibil EXCLUSIV pentru Administrator */}
          {isAdmin && (
            <button
              className={`tab-button ${activeTab === 'adminQueue' ? 'active' : ''}`}
              onClick={() => setActiveTab('adminQueue')}
            >
              <span>Moderare Admin</span>
              {pendingAdminResources.length > 0 && (
                <span className="tab-count">{pendingAdminResources.length}</span>
              )}
            </button>
          )}

          {/* Tab vizibil EXCLUSIV pentru Profesori și Administrator */}
          {(isProfesor || isAdmin) && (
            <button
              className={`tab-button ${activeTab === 'reportsQueue' ? 'active' : ''}`}
              onClick={() => setActiveTab('reportsQueue')}
            >
              <span>Sesizări Profesori</span>
              {openReports.length > 0 && (
                <span className="tab-count warning">{openReports.length}</span>
              )}
            </button>
          )}

          {/* Tab vizibil doar utilizatorilor conectați */}
          {isAuthenticated && (
            <button
              className={`tab-button ${activeTab === 'mySubmissions' ? 'active' : ''}`}
              onClick={() => setActiveTab('mySubmissions')}
            >
              <span>Materialele Mele</span>
              {mySubmissions.length > 0 && (
                <span className="tab-count" style={{ background: 'var(--text-secondary)' }}>
                  {mySubmissions.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* 1. VEDERE: Catalog Resurse (Public) */}
        {activeTab === 'catalog' && (
          <div>
            <div className="filter-toolbar">
              <div className="discipline-chips">
                {[
                  { id: 'all', label: 'Toate disciplinele' },
                  { id: 'Informatica (C++)', label: 'Informatică (C++)' },
                  { id: 'Python', label: 'Python' },
                  { id: 'Matematica', label: 'Matematică' },
                  { id: 'Fizica', label: 'Fizică' },
                  { id: 'Limba Romana', label: 'Limba Română' },
                  { id: 'Chimie / Biologie', label: 'Științe Exacte' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    className={`chip ${activeSubject === chip.id ? 'active' : ''}`}
                    onClick={() => setActiveSubject(chip.id)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              <div className="select-filters">
                <select
                  value={filterVerification}
                  onChange={(e) => setFilterVerification(e.target.value)}
                  className="apple-select"
                >
                  <option value="all">Toate materialele</option>
                  <option value="verified">Doar verificate de profesor</option>
                  <option value="pending_teacher">În curs de avizare didactică</option>
                </select>

                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="apple-select"
                >
                  <option value="all">Toate clasele</option>
                  <option value="Clasa a IX-a">Clasa a IX-a</option>
                  <option value="Clasa a X-a">Clasa a X-a</option>
                  <option value="Clasa a XI-a">Clasa a XI-a</option>
                  <option value="Clasa a XII-a (BAC)">Clasa a XII-a (BAC)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-view">
                <p className="empty-desc">Se încarcă catalogul de resurse din baza de date...</p>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="empty-view">
                <div className="empty-symbol">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 className="empty-title">Niciun rezultat găsit</h3>
                <p className="empty-desc">Nu există materiale conforme cu filtrele selectate.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setActiveSubject('all');
                    setFilterVerification('all');
                    setFilterGrade('all');
                    setSearchQuery('');
                    setTempSearch('');
                  }}
                >
                  Resetează filtrele
                </button>
              </div>
            ) : (
              <div className="cards-grid">
                {filteredCatalog.map((item) => (
                  <ResourceCard
                    key={item.id}
                    resource={item}
                    onViewDetail={(res) => setDetailTarget(res)}
                    onTeacherVerify={(res) => setVerifyTarget(res)}
                    onTeacherReport={(res) => setReportTarget(res)}
                    onAdminRemove={(id) => handleAdminRemove(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. VEDERE: Moderare Administrator (STRICT ADMIN) */}
        {activeTab === 'adminQueue' && isAdmin && (
          <div>
            <div className="panel-header-card">
              <div className="panel-title-wrap">
                <span className="panel-tag">Panou de Securitate și Moderare</span>
                <h3>Fluxul de Aprobare Inițială (Administrator)</h3>
                <p>
                  Conform procedurii stabilite: nicio resursă încărcată de elevi nu se publică fără validarea conformității de către administrator. 
                  Verificați integritatea conținutului înainte de autorizarea publicării în catalogul liceului.
                </p>
              </div>
            </div>

            {pendingAdminResources.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">Niciun material în așteptare</h3>
                <p className="empty-desc">Toate resursele propuse de elevi au fost verificate și autorizate.</p>
              </div>
            ) : (
              <div className="admin-stream">
                {pendingAdminResources.map((item) => (
                  <div key={item.id} className="stream-card">
                    <div className="stream-top">
                      <div>
                        <span className="tag-badge">{item.subject} &bull; {item.grade}</span>
                        <h4 className="stream-title">{item.title}</h4>
                        <p className="stream-meta">
                          Autor propunere: <strong>{item.authorName}</strong> | Format: {item.type} | Contact: {item.contactHandle}
                        </p>
                      </div>
                      <span className="status-badge pending-admin">În așteptare autorizare</span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.description}</p>

                    <div>
                      <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
                        Previzualizare Conținut Tehnic:
                      </strong>
                      <div className="stream-content-box">{item.content}</div>
                    </div>

                    {item.link && (
                      <div style={{ fontSize: '13px', color: 'var(--apple-blue)' }}>
                        Referință: <a href={item.link} target="_blank" rel="noopener noreferrer" className="file-link">{item.link}</a>
                      </div>
                    )}

                    <div className="stream-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleAdminReject(item.id)}>
                        Respinge Propunerea
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdminApprove(item.id)}>
                        Autorizează Publicarea în Catalog
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. VEDERE: Sesizări Cadre Didactice (STRICT PROFESORI & ADMIN) */}
        {activeTab === 'reportsQueue' && (isProfesor || isAdmin) && (
          <div>
            <div className="panel-header-card">
              <div className="panel-title-wrap">
                <span className="panel-tag warning">Registru Sesizări Metodice</span>
                <h3>Observații Cadre Didactice și Solicitări de Retragere</h3>
                <p>
                  Profesorii evaluează conținutul științific al resurselor. În cazul identificării unor erori de conținut, 
                  aceștia solicită corectarea directă de către autor sau retragerea imediată a materialului de către administrator.
                </p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">Registru curat</h3>
                <p className="empty-desc">Nu există sesizări active înaintate de cadrele didactice.</p>
              </div>
            ) : (
              <div className="reports-stream">
                {reports.map((rep) => {
                  const isUrgent = rep.urgency === 'major';
                  const isResolved = rep.status === 'resolved';

                  return (
                    <div key={rep.id} className={`stream-card ${isUrgent ? 'severe' : ''}`}>
                      <div className="stream-top">
                        <div>
                          <span className={`status-badge ${isUrgent ? 'pending-admin' : 'pending-teacher'}`}>
                            {isUrgent ? 'Severitate Ridicată (Solicitare Retragere)' : 'Observație Metodică (Corectură)'}
                          </span>
                          <h4 className="stream-title">Sesizare metodologică: „{rep.resourceTitle}”</h4>
                          <p className="stream-meta">
                            Inițiator: <strong>{rep.teacherName}</strong> &bull; Destinatar: <strong>{rep.targetRecipient === 'admin' ? 'Administrator (procedură retragere)' : 'Elevul autor'}</strong>
                          </p>
                        </div>
                        <span className={`status-badge ${isResolved ? 'verified' : 'pending-teacher'}`}>
                          {isResolved ? 'Rezolvat' : 'Activ'}
                        </span>
                      </div>

                      <div style={{ backgroundColor: '#fbfbfd', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                          Constatări didactice:
                        </strong>
                        {rep.details}
                      </div>

                      <div className="stream-actions">
                        {isAdmin && !isResolved && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleTakeDownResource(rep.resourceId, rep.id)}
                          >
                            Retrage Resursa din Catalog
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolveReport(rep.id)}
                          >
                            Arhivează Sesizarea
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 4. VEDERE: Materialele Mele (Doar utilizatorul curent) */}
        {activeTab === 'mySubmissions' && isAuthenticated && (
          <div>
            <div className="panel-header-card subtle">
              <div className="panel-title-wrap">
                <span className="panel-tag">Registru Personal</span>
                <h3>Materialele înaintate de {currentUser.fullName}</h3>
                <p>Urmăriți parcursul administrativ și pedagogic al contribuțiilor dumneavoastră.</p>
              </div>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">Nu ați înaintat încă propuneri</h3>
                <p className="empty-desc">Folosiți butonul „Propune Material” din bara superioară pentru a trimite o resursă didactică.</p>
              </div>
            ) : (
              <div className="cards-grid">
                {mySubmissions.map((item) => (
                  <ResourceCard
                    key={item.id}
                    resource={item}
                    onViewDetail={(res) => setDetailTarget(res)}
                    onTeacherVerify={(res) => setVerifyTarget(res)}
                    onTeacherReport={(res) => setReportTarget(res)}
                    onAdminRemove={(id) => handleAdminRemove(id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modale */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authInitialTab}
        onClose={() => setIsAuthOpen(false)}
        onShowToast={showToast}
      />

      <AddResourceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmitResource={handleAddResource}
      />

      <TeacherVerifyModal
        resource={verifyTarget}
        isOpen={Boolean(verifyTarget)}
        onClose={() => setVerifyTarget(null)}
        onConfirmVerify={handleTeacherVerifyConfirm}
      />

      <TeacherReportModal
        resource={reportTarget}
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        onConfirmReport={handleTeacherReportConfirm}
      />

      <ResourceDetailModal
        resource={detailTarget}
        isOpen={Boolean(detailTarget)}
        onClose={() => setDetailTarget(null)}
        onTeacherVerify={(res) => setVerifyTarget(res)}
        onTeacherReport={(res) => setReportTarget(res)}
        onAdminRemove={(id) => handleAdminRemove(id)}
        onShowToast={showToast}
      />

      {/* Notificări Toast Apple */}
      <Toast toasts={toasts} />

      {/* Subsol Instituțional */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-legal">
            <strong>LER EduShare</strong> — Sistem Didactic Instituțional
            <p>Liceul Teoretic &#8222;Emil Racovi&#355;&#259;&#8221; Vaslui.</p>
          </div>
          <div className="footer-meta">
            <span>Securitate pe Roluri: Elev &bull; Cadru Didactic &bull; Administrator</span>
          </div>
        </div>
      </footer>
    </>
  );
}
