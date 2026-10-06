// ============================================================================
// LER EduShare — Foaie Detalii Resursă & Asistență Peer-to-Peer
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  onTeacherVerify,
  onTeacherReport,
  onAdminRemove,
  onShowToast
}) {
  const { isElev, isProfesor, isAdmin } = useAuth();
  const [showPeerForm, setShowPeerForm] = useState(false);
  const [peerQuestion, setPeerQuestion] = useState('');
  const [peerSent, setPeerSent] = useState(false);

  if (!isOpen || !resource) return null;

  function handleCopyContent() {
    navigator.clipboard.writeText(resource.content)
      .then(() => onShowToast('Conținutul a fost copiat în memorie.', 'success'))
      .catch(() => onShowToast('Eroare la copiere.', 'warning'));
  }

  function handleSendPeerQuestion() {
    if (!peerQuestion.trim()) {
      alert('Introduceți formularea întrebării înainte de transmitere.');
      return;
    }
    setPeerSent(true);
    onShowToast('Întrebarea a fost redirecționată către colegul mentor.', 'success');
    setTimeout(() => {
      setPeerQuestion('');
      setShowPeerForm(false);
      setPeerSent(false);
    }, 1500);
  }

  let parsedAttachment = null;
  if (resource.attachment) {
    try {
      parsedAttachment = typeof resource.attachment === 'string'
        ? JSON.parse(resource.attachment)
        : resource.attachment;
    } catch (e) {
      parsedAttachment = null;
    }
  }

  const viewUrl = parsedAttachment?.url || parsedAttachment?.dataUrl;
  const downloadUrl = parsedAttachment?.downloadUrl || parsedAttachment?.dataUrl;

  function handleDownloadAttachment() {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = parsedAttachment.name || 'document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <div className="sheet-tag">{resource.subject}</div>
            <h3 className="modal-title">{resource.title}</h3>
            <div className="detail-meta-row">
              <span>Disciplina: {resource.subject}</span> &bull; 
              <span>Nivel: {resource.grade}</span> &bull; 
              <span>Autor: <strong>{resource.authorName}</strong></span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Închide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="detail-content-area">
          {/* Status Box */}
          {resource.isVerified ? (
            <div className="evaluator-strip" style={{ margin: 0, padding: '12px 16px' }}>
              <strong style={{ fontSize: '13px', display: 'block' }}>
                Validat Metodologic: {resource.verifiedBy}
              </strong>
              {resource.teacherComment && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <em>„{resource.teacherComment}”</em>
                </p>
              )}
            </div>
          ) : (
            <div className="evaluator-strip" style={{ backgroundColor: 'var(--apple-orange-subtle)', color: 'var(--orange-text)', margin: 0 }}>
              <strong style={{ fontSize: '13px', display: 'block' }}>În curs de analiză metodică</strong>
              <p style={{ fontSize: '12px', marginTop: '2px' }}>
                Resursă înaintată de elevi. Cadrele didactice pot certifica acuratețea conținutului prin acordarea avizului.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="detail-heading">Descriere și Obiective</h4>
            <p className="detail-body-text">{resource.description}</p>
          </div>

          {/* Attached Document / PDF */}
          {parsedAttachment && (
            <div>
              <h4 className="detail-heading">Document Atașat</h4>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--apple-subtle)',
                border: '1px solid var(--border-hairline)',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--apple-blue-subtle)',
                    color: 'var(--apple-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>
                      {parsedAttachment.name}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {parsedAttachment.size} &bull; Fișier didactic
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {viewUrl && (
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Vizualizează Document
                    </a>
                  )}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownloadAttachment}
                  >
                    Descarcă Fișier
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Block */}
          {resource.content && resource.content !== `[Fișier atașat: ${parsedAttachment?.name}]` && (
            <div>
              <div className="detail-header-action">
                <h4 className="detail-heading">Corp Resursă / Conținut Didactic</h4>
                <button className="btn btn-ghost btn-sm" onClick={handleCopyContent}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiază Conținutul
                </button>
              </div>
              <pre className="code-terminal">{resource.content}</pre>
            </div>
          )}

          {/* External Link */}
          {resource.link && (
            <div>
              <h4 className="detail-heading">Depozit Document</h4>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', gap: '6px' }}>
                <span>Deschide referința externă</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          )}

          {/* Peer Help Module */}
          <div className="mentor-box">
            <div className="mentor-box-header">
              <div>
                <span className="mentor-title">Asistență Didactică Peer-to-Peer</span>
                <span className="mentor-sub">Canal direct de colaborare și lămurire între elevi</span>
              </div>
              <span className="contact-pill">{resource.contactHandle}</span>
            </div>
            <div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowPeerForm(!showPeerForm)}
              >
                {showPeerForm ? 'Ascunde Formularul' : 'Formulează o Întrebare pentru Autor'}
              </button>
            </div>

            {showPeerForm && (
              <div style={{ marginTop: '14px' }}>
                <textarea
                  rows={2}
                  className="apple-textarea"
                  style={{ width: '100%' }}
                  placeholder="Formulați punctual neclaritatea legată de acest material..."
                  value={peerQuestion}
                  onChange={(e) => setPeerQuestion(e.target.value)}
                />
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSendPeerQuestion}>
                    Transmite Mesajul
                  </button>
                  {peerSent && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--apple-green)' }}>
                      Mesajul a fost transmis autorului.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Role Actions */}
        <div className="modal-bottom">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Închide
          </button>

          {isProfesor && (
            <>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onClose();
                  onTeacherReport(resource);
                }}
              >
                Semnalează Neconformitate
              </button>
              {!resource.isVerified && (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    onClose();
                    onTeacherVerify(resource);
                  }}
                >
                  Certifică Materialul
                </button>
              )}
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm('Confirmați retragerea acestei resurse din catalogul public?')) {
                  onClose();
                  onAdminRemove(resource.id);
                }
              }}
            >
              Elimină din Catalog
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
