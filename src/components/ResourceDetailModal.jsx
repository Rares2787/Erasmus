// ============================================================================
// LER EduShare — Foaie Detalii Resursă & Asistență Peer-to-Peer
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { db } from '../services/database';

export default function ResourceDetailModal({
  resource,
  isOpen,
  onClose,
  onTeacherVerify,
  onTeacherReport,
  onAdminRemove,
  onShowToast
}) {
  const { currentUser, isElev, isProfesor, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMsgText, setNewMsgText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    if (isOpen && resource?.id) {
      setLoadingMessages(true);
      db.getPeerMessages(resource.id)
        .then((data) => setMessages(data || []))
        .catch(() => setMessages([]))
        .finally(() => setLoadingMessages(false));
    } else {
      setMessages([]);
    }
  }, [isOpen, resource?.id]);

  if (!isOpen || !resource) return null;

  function handleCopyContent() {
    navigator.clipboard.writeText(resource.content)
      .then(() => onShowToast(t('toastCopied'), 'success'))
      .catch(() => onShowToast(t('toastCopyError'), 'warning'));
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    if (!newMsgText.trim()) return;

    setSendingMsg(true);
    const sender = currentUser?.fullName || (isElev ? t('roleElev') : 'User');
    try {
      const added = await db.addPeerMessage(resource.id, sender, newMsgText.trim());
      setMessages((prev) => [...prev, added]);
      setNewMsgText('');
      onShowToast(t('toastMsgSent'), 'success');
    } catch (err) {
      onShowToast(t('toastMsgError'), 'error');
    } finally {
      setSendingMsg(false);
    }
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

  function handleViewDocument() {
    if (!parsedAttachment?.dataUrl) return;
    const url = parsedAttachment.dataUrl;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
      return;
    }

    try {
      const parts = url.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const binary = atob(parts[1]);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      // Deshide o nouă filă cu vizualizator dedicat (fără ecran alb sau blocări de securitate Chrome)
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="ro">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${parsedAttachment.name || 'Document PDF'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                html, body { width: 100%; height: 100%; overflow: hidden; background: #2c2c2e; }
                iframe, embed { width: 100%; height: 100%; border: none; display: block; }
              </style>
            </head>
            <body>
              <embed src="${blobUrl}" type="${mime}" width="100%" height="100%">
            </body>
          </html>
        `);
        win.document.close();
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Eroare la deschiderea PDF:', err);
      handleDownloadAttachment();
    }
  }

  function handleDownloadAttachment() {
    if (!parsedAttachment?.dataUrl) return;
    try {
      const parts = parsedAttachment.dataUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
      const binary = atob(parts[1]);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = parsedAttachment.name || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
    } catch (e) {
      const a = document.createElement('a');
      a.href = parsedAttachment.dataUrl;
      a.download = parsedAttachment.name || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <div className="sheet-tag">{resource.subject}</div>
            <h3 className="modal-title">{resource.title}</h3>
            <div className="detail-meta-row">
              <span>{t('modalSubject')} {resource.subject}</span> &bull; 
              <span>{t('modalLevel')} {resource.grade}</span> &bull; 
              <span>{t('modalAuthor')} <strong>{resource.authorName}</strong></span>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label={t('modalCloseBtn')}>
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
                {t('modalMethodValidated')} {resource.verifiedBy}
              </strong>
              {resource.teacherComment && (
                <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <em>„{resource.teacherComment}”</em>
                </p>
              )}
            </div>
          ) : (
            <div className="evaluator-strip" style={{ backgroundColor: 'var(--apple-orange-subtle)', color: 'var(--orange-text)', margin: 0 }}>
              <strong style={{ fontSize: '13px', display: 'block' }}>{t('modalUnderReview')}</strong>
              <p style={{ fontSize: '12px', marginTop: '2px' }}>
                {t('modalUnderReviewDesc')}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="detail-heading">{t('modalDescHeading')}</h4>
            <p className="detail-body-text">{resource.description}</p>
          </div>

          {/* Attached Document / PDF */}
          {parsedAttachment && (
            <div>
              <h4 className="detail-heading">{t('modalAttachedDoc')}</h4>
              <div className="attachment-preview-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
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
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {parsedAttachment.name}
                    </strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {parsedAttachment.size} &bull; {t('modalTeachingFile')}
                    </span>
                  </div>
                </div>

                <div className="attachment-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleViewDocument}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>{t('modalViewDoc')}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownloadAttachment}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>{t('modalDownloadFile')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content Block (doar dacă există conținut real, nu placeholder [Fișier atașat: ...]) */}
          {resource.content && 
           resource.content !== `[Fișier atașat: ${parsedAttachment?.name}]` && 
           resource.content !== `[Attached file: ${parsedAttachment?.name}]` && 
           !resource.content.startsWith('[Fișier atașat:') && 
           !resource.content.startsWith('[Attached file:') && (
            <div>
              <div className="detail-header-action">
                <h4 className="detail-heading">{t('modalContentHeading')}</h4>
                <button className="btn btn-ghost btn-sm" onClick={handleCopyContent}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  {t('modalCopyBtn')}
                </button>
              </div>
              <pre className="code-terminal">{resource.content}</pre>
            </div>
          )}

          {/* External Link */}
          {resource.link && (
            <div>
              <h4 className="detail-heading">{t('modalRepoHeading')}</h4>
              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', display: 'inline-flex', gap: '6px' }}>
                <span>{t('modalOpenExternal')}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
            </div>
          )}

          {/* Secțiune de Mesagerie și Discuții pe Material */}
          <div className="mentor-box" style={{ padding: '20px' }}>
            <div className="mentor-box-header" style={{ marginBottom: '16px' }}>
              <div>
                <span className="mentor-title" style={{ fontSize: '15px' }}>
                  {t('modalDiscussionTitle')}
                </span>
                <span className="mentor-sub">
                  {t('modalDiscussionSub', { author: resource.authorName })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="contact-pill" title={t('modalAuthorPillTitle')}>
                  {resource.contactHandle}
                </span>
              </div>
            </div>

            {/* Listă Mesaje */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--apple-canvas)',
              border: '1px solid var(--border-hairline)',
              marginBottom: '16px'
            }}>
              {loadingMessages ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {t('modalLoadingDiscussions')}
                </div>
              ) : messages.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                  {t('modalNoQuestions')}
                </div>
              ) : (
                messages.map((m) => {
                  const isAuthor = m.senderName === resource.authorName;
                  const isMe = currentUser?.fullName && m.senderName === currentUser.fullName;
                  const formattedTime = m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isMe ? 'var(--apple-blue)' : 'var(--apple-card)',
                        color: isMe ? '#ffffff' : 'var(--text-primary)',
                        border: isMe ? 'none' : '1px solid var(--border-hairline)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isMe ? 'rgba(255, 255, 255, 0.9)' : 'var(--text-primary)'
                        }}>
                          {m.senderName} {isAuthor && t('modalAuthorTag')}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          color: isMe ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-tertiary)'
                        }}>
                          {formattedTime}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '13px',
                        lineHeight: 1.45,
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {m.message}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formular Trimitere Mesaj Nou */}
            <form onSubmit={handleSendMessage} className="peer-msg-form">
              <input
                type="text"
                className="apple-textarea"
                placeholder={t('modalAskPlaceholder', { author: resource.authorName })}
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                disabled={sendingMsg}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={sendingMsg || !newMsgText.trim()}
              >
                {sendingMsg ? t('modalSendingBtn') : t('modalSendBtn')}
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer with Role Actions */}
        <div className="modal-bottom">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {t('modalCloseBtn')}
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
                {t('modalReportIssueBtn')}
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
                  {t('modalCertifyBtn')}
                </button>
              )}
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (confirm(t('confirmRemoveCard'))) {
                  onClose();
                  onAdminRemove(resource.id);
                }
              }}
            >
              {t('modalRemoveBtn')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
