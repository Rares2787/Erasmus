// ============================================================================
// LER EduShare — Modal Avizare Didactică Oficială (Profesor)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TeacherVerifyModal({ resource, isOpen, onClose, onConfirmVerify }) {
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const [teacherName, setTeacherName] = useState(currentUser?.fullName || 'Prof. Mihaela Ionescu');
  const [feedback, setFeedback] = useState('');
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
      await onConfirmVerify(resource.id, {
        teacherName: teacherName || t('roleProfesor'),
        teacherComment: feedback
      });
      onClose();
      setFeedback('');
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
            <h3 className="modal-title">{t('verifyTitle')}</h3>
            <p className="modal-sub">{t('verifySub')}</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label={t('modalCloseBtn')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="context-recap">
          <span className="context-label">{t('verifyRecapLabel')}</span>
          <h4 className="context-title">{resource.title}</h4>
          <span className="context-author">{t('verifyAuthorLabel')} {resource.authorName} ({resource.grade})</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>{t('verifyTeacherLabel')}</label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>{t('verifyFeedbackLabel')}</label>
            <textarea
              rows={3}
              required
              placeholder={t('verifyFeedbackPlaceholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {t('verifyCancelBtn')}
            </button>
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? t('verifySubmittingBtn') : t('verifySubmitBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
