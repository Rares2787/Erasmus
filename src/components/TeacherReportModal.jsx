// ============================================================================
// LER EduShare — Modal Semnalare Neconformitate (Profesor)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TeacherReportModal({ resource, isOpen, onClose, onConfirmReport }) {
  const { currentUser } = useAuth();

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
        teacherName: teacherName || 'Cadru Didactic LER',
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
            <h3 className="modal-title">Semnalare Neconformitate</h3>
            <p className="modal-sub">Înaintare solicitare de retragere sau notificare de remediere către autor.</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Închide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="context-recap caution">
          <span className="context-label">Material identificat cu neconformități:</span>
          <h4 className="context-title">{resource.title}</h4>
          <span className="context-author">Autor: {resource.authorName} ({resource.grade})</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>Destinația Semnalării *</label>
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
                  <strong>Către Administrator (Solicitare Retragere / Dat Jos)</strong>
                  <span>Materialul conține erori fundamentale și trebuie suspendat din catalogul public.</span>
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
                  <strong>Către Elevul Autor (Solicitare Corectare)</strong>
                  <span>Indicații directe pentru remedierea erorilor minore de formulare sau de sintaxă.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="field-group">
            <label>Cadru Didactic *</label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Grad de Severitate *</label>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="major">Severitate Ridicată (Erori conceptuale majore - Se impune retragerea)</option>
              <option value="minor">Severitate Moderată (Omitere de caz particular - Necesită revizuire)</option>
            </select>
          </div>

          <div className="field-group">
            <label>Argumentație Metodică și Indicații de Corectură *</label>
            <textarea
              rows={4}
              required
              placeholder="Descrieți cu exactitate neconcordanțele identificate (linii de cod, enunț sau formulări eronate)..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Anulare
            </button>
            <button type="submit" className="btn btn-danger" disabled={submitting}>
              {submitting ? 'Se transmite...' : 'Transmite Sesizarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
