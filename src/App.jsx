// ============================================================================
// LER EduShare — Aplicație Principală React (Sincronizare în Timp Real)
// Liceul Teoretic „Emil Racoviță” Vaslui | Erasmus+ DIGI-EQUAL
// Suport Bilingv Complet (Română / Engleză)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { db } from './services/database';

import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ResourceCard from './components/ResourceCard';
import AddResourceModal from './components/AddResourceModal';
import TeacherVerifyModal from './components/TeacherVerifyModal';
import TeacherReportModal from './components/TeacherReportModal';
import ResourceDetailModal from './components/ResourceDetailModal';
import Toast from './components/Toast';
import CommandPalette from './components/CommandPalette';

// Număr care se animează de la 0 la valoare
function CountUp({ value, duration = 1200 }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setShown(Math.round(value * (1 - Math.pow(1 - t, 4))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{shown}</>;
}

export default function App() {
  const { currentUser, isElev, isProfesor, isAdmin, isAuthenticated } = useAuth();
  const { lang, t } = useLanguage();

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

  // Paletă de căutare (Ctrl/⌘ + K)
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((o) => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sistem Toast
  const [toasts, setToasts] = useState([]);

  // Stare Temă (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ler_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ler_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }

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
      if (!silent) showToast(t('toastSyncError'), 'error');
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
      showToast(t('toastLoginPrompt'), 'warning');
      setAuthInitialTab('login');
      setIsAuthOpen(true);
      return;
    }

    try {
      const created = await db.addResource(payload);
      setResources((prev) => [created, ...prev]);
      showToast(t('toastProposalSent'), 'success');
    } catch (err) {
      showToast(t('toastSaveError'), 'error');
    }
  }

  async function handleAdminApprove(id) {
    if (!isAdmin) {
      showToast(t('toastAdminOnlyApprove'), 'error');
      return;
    }
    try {
      const updated = await db.updateResource(id, { status: 'approved' });
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, status: 'approved' } : r)));
      showToast(t('toastApproved'), 'success');
    } catch (err) {
      showToast(t('toastApproveError'), 'error');
    }
  }

  async function handleAdminReject(id) {
    if (!isAdmin) {
      showToast(t('toastAdminOnlyReject'), 'error');
      return;
    }
    if (!confirm(t('confirmRejectProposal'))) return;
    try {
      const updated = await db.updateResource(id, { status: 'rejected' });
      setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated, status: 'rejected' } : r)));
      showToast(t('toastRejected'), 'warning');
    } catch (err) {
      showToast(t('toastRejectError'), 'error');
    }
  }

  async function handleTeacherVerifyConfirm(id, { teacherName, teacherComment }) {
    if (!isProfesor) {
      showToast(t('toastTeacherOnlyVerify'), 'error');
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
      showToast(t('toastVerifiedSuccess'), 'success');
    } catch (err) {
      showToast(t('toastVerifyError'), 'error');
    }
  }

  async function handleTeacherReportConfirm(payload) {
    if (!isProfesor) {
      showToast(t('toastTeacherOnlyReport'), 'error');
      return;
    }
    try {
      const newReport = await db.addReport(payload);
      setReports((prev) => [newReport, ...prev]);
      if (payload.targetRecipient === 'admin') {
        showToast(t('toastReportSentAdmin'), 'warning');
      } else {
        showToast(t('toastReportSentAuthor'), 'success');
      }
    } catch (err) {
      showToast(t('toastReportError'), 'error');
    }
  }

  async function handleTakeDownResource(resourceId, reportId) {
    if (!isAdmin) {
      showToast(t('toastAdminOnlyTakedown'), 'error');
      return;
    }
    if (!confirm(t('confirmTakedown'))) return;
    try {
      await db.deleteResource(resourceId);
      await db.resolveReport(reportId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? { ...rep, status: 'resolved' } : rep))
      );
      showToast(t('toastResourceRemoved'), 'error');
    } catch (err) {
      showToast(t('toastRemoveError'), 'error');
    }
  }

  async function handleResolveReport(reportId) {
    if (!isAdmin && !isProfesor) return;
    try {
      await db.resolveReport(reportId);
      setReports((prev) =>
        prev.map((rep) => (rep.id === reportId ? { ...rep, status: 'resolved' } : rep))
      );
      showToast(t('toastReportArchived'), 'success');
    } catch (err) {
      showToast(t('toastReportUpdateError'), 'error');
    }
  }

  async function handleAdminRemove(id) {
    if (!isAdmin) {
      showToast(t('toastAdminOnlyTakedown'), 'error');
      return;
    }
    try {
      await db.deleteResource(id);
      setResources((prev) => prev.filter((r) => r.id !== id));
      showToast(t('toastResourceRemoved'), 'error');
    } catch (err) {
      showToast(t('toastDeleteError'), 'error');
    }
  }

  // Apariție treptată la scroll
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.resource-card, .stream-card, .panel-header-card').forEach((el, i) => {
      if (el.classList.contains('in')) return;
      el.classList.add('reveal');
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      io.observe(el);
    });
    return () => io.disconnect();
  }, [activeTab, filteredCatalog, loading, reports, mySubmissions, pendingAdminResources]);

  // Discipline options
  const subjectOptions = [
    { id: 'all', label: t('allSubjects') },
    { id: 'Informatica (C++)', label: t('subjCpp') },
    { id: 'Python', label: t('subjPython') },
    { id: 'Matematica', label: t('subjMath') },
    { id: 'Fizica', label: t('subjPhysics') },
    { id: 'Limba Romana', label: t('subjRomanian') },
    { id: 'Chimie / Biologie', label: t('subjSciences') }
  ];

  return (
    <>
      {/* Navigație cu slider bilingv și comutator temă */}
      <Navbar
        pendingAdminCount={isAdmin ? pendingAdminResources.length : 0}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenAuthModal={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthOpen(true);
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Bară Informații Sesiune Curentă */}
      <section className="session-strip">
        <div className="container session-inner">
          <div className="session-identity">
            <span
              className="status-indicator"
              style={{ backgroundColor: isAuthenticated ? 'var(--apple-green)' : 'var(--text-tertiary)' }}
            ></span>
            <span className="session-label">{t('sessionLabel')}</span>
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
                <strong>{t('unauthenticatedVisitor')}</strong>
                <span className="session-role-badge">{t('publicAccess')}</span>
              </>
            )}
          </div>

          <div className="session-capability">
            {!isAuthenticated && t('capVisitor')}
            {isElev && t('capElev')}
            {isProfesor && t('capProfesor')}
            {isAdmin && t('capAdmin')}
          </div>
        </div>
      </section>

      {/* Hero & Metrici Didactice */}
      <section className="hero-section">
        <div className="container hero-inner">
          <div>
            <div className="kicker">{t('heroKicker')}</div>
            <h1 className="hero-title">
              {[t('heroLine1'), t('heroLine2')].map((line, li) => (
                <span key={li} className="hero-line">
                  {line.split(' ').map((w, wi) => (
                    <span key={wi} className="hero-word" style={{ animationDelay: `${(li * 4 + wi) * 70}ms` }}>{w}&nbsp;</span>
                  ))}
                </span>
              ))}
            </h1>
            <p className="hero-description">
              {t('heroDescription')}
            </p>

            {/* Căutare Apple Style */}
            <div className="search-container">
              <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setSearchQuery(tempSearch);
                }}
              />
              <button
                className="palette-hint"
                onClick={() => setIsPaletteOpen(true)}
                title={t('quickSearch')}
              >
                <kbd>Ctrl K</kbd>
              </button>
              <button
                className="btn btn-primary btn-search"
                onClick={() => setSearchQuery(tempSearch)}
              >
                {t('searchButton')}
              </button>
            </div>
          </div>

          {/* Panou Metrici */}
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-value"><CountUp value={verifiedResources.length} /></span>
              <span className="metric-label">{t('metricVerified')}</span>
              <span className="metric-sub">{t('metricVerifiedSub')}</span>
            </div>
            <div className="metric-card">
              <span className="metric-value"><CountUp value={approvedResources.length} /></span>
              <span className="metric-label">{t('metricApproved')}</span>
              <span className="metric-sub">{t('metricApprovedSub')}</span>
            </div>
            <div className="metric-card">
              <span className="metric-value"><CountUp value={14} /></span>
              <span className="metric-label">{t('metricMentors')}</span>
              <span className="metric-sub">{t('metricMentorsSub')}</span>
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
            <span>{t('tabCatalog')}</span>
          </button>

          {/* Tab vizibil EXCLUSIV pentru Administrator */}
          {isAdmin && (
            <button
              className={`tab-button ${activeTab === 'adminQueue' ? 'active' : ''}`}
              onClick={() => setActiveTab('adminQueue')}
            >
              <span>{t('tabAdminQueue')}</span>
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
              <span>{t('tabReportsQueue')}</span>
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
              <span>{t('tabMySubmissions')}</span>
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
                {subjectOptions.map((chip) => (
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
                  <option value="all">{t('allMaterials')}</option>
                  <option value="verified">{t('onlyVerified')}</option>
                  <option value="pending_teacher">{t('pendingVerification')}</option>
                </select>

                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="apple-select"
                >
                  <option value="all">{t('allGrades')}</option>
                  <option value="Clasa a IX-a">{t('grade9')}</option>
                  <option value="Clasa a X-a">{t('grade10')}</option>
                  <option value="Clasa a XI-a">{t('grade11')}</option>
                  <option value="Clasa a XII-a (BAC)">{t('grade12')}</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-view">
                <p className="empty-desc">{t('loadingCatalog')}</p>
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="empty-view">
                <div className="empty-symbol">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 className="empty-title">{t('noResults')}</h3>
                <p className="empty-desc">{t('noResultsDesc')}</p>
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
                  {t('resetFilters')}
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
                <span className="panel-tag">{t('adminPanelTag')}</span>
                <h3>{t('adminPanelTitle')}</h3>
                <p>{t('adminPanelDesc')}</p>
              </div>
            </div>

            {pendingAdminResources.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">{t('adminEmptyTitle')}</h3>
                <p className="empty-desc">{t('adminEmptyDesc')}</p>
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
                          {t('adminAuthorLabel')} <strong>{item.authorName}</strong> | {t('adminFormatLabel')} {item.type} | {t('adminContactLabel')} {item.contactHandle}
                        </p>
                      </div>
                      <span className="status-badge pending-admin">{t('adminPendingBadge')}</span>
                    </div>

                    <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{item.description}</p>

                    <div>
                      <strong style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '6px' }}>
                        {t('adminTechPreview')}
                      </strong>
                      <div className="stream-content-box">{item.content}</div>
                    </div>

                    {item.link && (
                      <div style={{ fontSize: '13px', color: 'var(--apple-blue)' }}>
                        {t('adminReference')} <a href={item.link} target="_blank" rel="noopener noreferrer" className="file-link">{item.link}</a>
                      </div>
                    )}

                    <div className="stream-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleAdminReject(item.id)}>
                        {t('adminRejectBtn')}
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdminApprove(item.id)}>
                        {t('adminApproveBtn')}
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
                <span className="panel-tag warning">{t('reportsPanelTag')}</span>
                <h3>{t('reportsPanelTitle')}</h3>
                <p>{t('reportsPanelDesc')}</p>
              </div>
            </div>

            {reports.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">{t('reportsEmptyTitle')}</h3>
                <p className="empty-desc">{t('reportsEmptyDesc')}</p>
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
                            {isUrgent ? t('reportUrgentBadge') : t('reportCorrectionBadge')}
                          </span>
                          <h4 className="stream-title">{t('reportTitlePrefix')} „{rep.resourceTitle}”</h4>
                          <p className="stream-meta">
                            {t('reportInitiator')} <strong>{rep.teacherName}</strong> &bull; {t('reportRecipient')} <strong>{rep.targetRecipient === 'admin' ? t('reportRecipientAdmin') : t('reportRecipientAuthor')}</strong>
                          </p>
                        </div>
                        <span className={`status-badge ${isResolved ? 'verified' : 'pending-teacher'}`}>
                          {isResolved ? t('reportStatusResolved') : t('reportStatusActive')}
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--apple-subtle)', border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', fontSize: '13px', color: 'var(--text-primary)' }}>
                        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                          {t('reportFindings')}
                        </strong>
                        {rep.details}
                      </div>

                      <div className="stream-actions">
                        {isAdmin && !isResolved && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleTakeDownResource(rep.resourceId, rep.id)}
                          >
                            {t('reportTakedownBtn')}
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleResolveReport(rep.id)}
                          >
                            {t('reportArchiveBtn')}
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
                <span className="panel-tag">{t('mySubmissionsTag')}</span>
                <h3>{t('mySubmissionsTitle')} {currentUser.fullName}</h3>
                <p>{t('mySubmissionsDesc')}</p>
              </div>
            </div>

            {mySubmissions.length === 0 ? (
              <div className="empty-view">
                <h3 className="empty-title">{t('mySubmissionsEmptyTitle')}</h3>
                <p className="empty-desc">{t('mySubmissionsEmptyDesc')}</p>
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

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        resources={approvedResources}
        onSelect={(res) => setDetailTarget(res)}
      />

      {/* Notificări Toast Apple */}
      <Toast toasts={toasts} />

      {/* Subsol Instituțional */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-legal">
            <strong>{t('footerSystemTitle')}</strong>
            <p>{t('footerSchool')}</p>
          </div>
          <div className="footer-meta">
            <span>{t('footerRoles')}</span>
          </div>
        </div>
      </footer>
    </>
  );
}
