// ============================================================================
// LER EduShare — Modal Propunere Resursă Didactică (Elev)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function AddResourceModal({ isOpen, onClose, onSubmitResource }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Informatica (C++)');
  const [grade, setGrade] = useState('Clasa a IX-a');
  const [type, setType] = useState('Cod Sursă & Algoritmi');
  const [contactHandle, setContactHandle] = useState(currentUser?.email || currentUser?.contactHandle || '');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [attachment, setAttachment] = useState(null); // { name, size, type, dataUrl }
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser?.email) {
      setContactHandle(currentUser.email);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert(t('addFileLimit'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'application/pdf',
        dataUrl: reader.result
      });
      if (file.name.toLowerCase().endsWith('.pdf')) {
        setType('Document PDF & Fişă');
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveAttachment() {
    setAttachment(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim() && !attachment) {
      alert(t('addAlertNoContent'));
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitResource({
        title,
        subject,
        grade,
        type,
        authorId: currentUser?.id,
        authorName: currentUser?.fullName || (currentUser?.role === 'elev' ? t('roleElev') : 'User'),
        contactHandle,
        description,
        content: content.trim() || '',
        link: link.trim() || null,
        attachment: attachment ? JSON.stringify(attachment) : null
      });
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setContent('');
      setLink('');
      setAttachment(null);
    } finally {
      setSubmitting(false);
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
            <h3 className="modal-title">{t('addModalTitle')}</h3>
            <p className="modal-sub">{t('addModalSub')}</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label={t('modalCloseBtn')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="field-group span-2">
              <label>{t('addTitleLabel')}</label>
              <input
                type="text"
                required
                placeholder={t('addTitlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>{t('addSubjectLabel')}</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Informatica (C++)">{t('subjCpp')}</option>
                <option value="Python">{t('subjPython')}</option>
                <option value="Matematica">{t('subjMath')}</option>
                <option value="Fizica">{t('subjPhysics')}</option>
                <option value="Limba Romana">{t('subjRomanian')}</option>
                <option value="Chimie / Biologie">{t('subjSciences')}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{t('addGradeLabel')}</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="Clasa a IX-a">{t('grade9')}</option>
                <option value="Clasa a X-a">{t('grade10')}</option>
                <option value="Clasa a XI-a">{t('grade11')}</option>
                <option value="Clasa a XII-a (BAC)">{t('grade12')}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{t('addFormatLabel')}</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Document PDF & Fişă">{t('formatPdf')}</option>
                <option value="Note de Curs & Sinteză">{t('formatNotes')}</option>
                <option value="Cod Sursă & Algoritmi">{t('formatCode')}</option>
                <option value="Fișă Aplicativă de Lucru">{t('formatWorksheet')}</option>
                <option value="Scheme Structurale">{t('formatDiagrams')}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{t('addContactLabel')}</label>
              <input
                type="email"
                required
                placeholder={t('addContactPlaceholder')}
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>{t('addFileLabel')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="file"
                accept=".pdf,application/pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                style={{
                  fontSize: '13px',
                  padding: '8px',
                  border: '1px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--apple-subtle)',
                  cursor: 'pointer'
                }}
              />
              {attachment && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--apple-blue-subtle)',
                  border: '1px solid var(--apple-blue)',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <span style={{ fontWeight: 600, color: 'var(--apple-blue)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {attachment.name}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)' }}>({attachment.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--apple-red)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 600
                    }}
                  >
                    {t('addRemoveFile')}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="field-group">
            <label>{t('addDescLabel')}</label>
            <textarea
              rows={2}
              required
              placeholder={t('addDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>{t('addContentLabel')}</label>
            <textarea
              rows={6}
              className="apple-textarea code-font"
              placeholder={t('addContentPlaceholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>{t('addLinkLabel')}</label>
            <input
              type="url"
              placeholder="https://github.com/... sau link către resurse didactice"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('addCancelBtn')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? t('addSubmittingBtn') : t('addSubmitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
