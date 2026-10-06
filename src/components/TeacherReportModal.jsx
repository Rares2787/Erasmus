// ============================================================================
// LER EduShare — Modal Semnalare Neconformitate (Profesor)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TeacherReportModal({ resource, isOpen, onClose, onConfirmReport }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [recipient, setRecipient] = useState('admin');
  const [teacherName, setTeacherName] = useState(currentUser?.fullName || 'Prof. Mihaela Ionescu');
  const [urgency, setUrgency] = useState('major');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser?.fullName) {
      setTeacherName(currentUser.fullName);
    }
  }, [currentUser]);

  if (!isOpen || !resource) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onConfirmReport({
        resourceId: resource.id,
        resourceTitle: resource.title,
        teacherName: teacherName || t('roleProfesor'),
        targetRecipient: recipient,
        urgency,
        details
      });
      onClose();
      setDetails('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h3 className="modal-title">{t('reportModalTitle')}</h3>
            <p className="modal-sub">{t('reportModalSub')}</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label={t('modalCloseBtn')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="context-recap caution">
          <span className="context-label">{t('reportRecapLabel')}</span>
          <h4 className="context-title">{resource.title}</h4>
          <span className="context-author">{t('modalAuthor')} {resource.authorName} ({resource.grade})</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>{t('reportDestLabel')}</label>
            <div className="selection-cards">
              <label className="selection-card">
                <input
                  type="radio"
                  name="recipient"
                  value="admin"
                  checked={recipient === 'admin'}
                  onChange={() => setRecipient('admin')}
                />
                <div className="selection-info">
                  <strong>{t('reportDestAdminTitle')}</strong>
                  <span>{t('reportDestAdminDesc')}</span>
                </div>
              </label>

              <label className="selection-card">
                <input
                  type="radio"
                  name="recipient"
                  value="author"
                  checked={recipient === 'author'}
                  onChange={() => setRecipient('author')}
                />
                <div className="selection-info">
                  <strong>{t('reportDestAuthorTitle')}</strong>
                  <span>{t('reportDestAuthorDesc')}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="field-group">
            <label>{t('reportTeacherLabel')}</label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>{t('reportUrgencyLabel')}</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="major">{t('reportUrgencyMajor')}</option>
              <option value="minor">{t('reportUrgencyMinor')}</option>
            </select>
          </div>

          <div className="field-group">
            <label>{t('reportDetailsLabel')}</label>
            <textarea
              rows={4}
              required
              placeholder={t('reportDetailsPlaceholder')}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('reportCancelBtn')}
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? t('reportSubmittingBtn') : t('reportSubmitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
