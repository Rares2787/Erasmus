// ============================================================================
// LER EduShare — Modal Avizare Didactică Oficială (Profesor)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function TeacherVerifyModal({ resource, isOpen, onClose, onConfirmVerify }) {
  const { currentUser } = useAuth();
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
        teacherName: teacherName || 'Cadru Didactic LER',
        teacherComment: feedback
      });
      onClose();
      setFeedback('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h3 className="modal-title">Avizare Didactică Oficială</h3>
            <p className="modal-sub">Certificarea conformității științifice și metodologice a materialului.</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Închide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="context-recap">
          <span className="context-label">Resursa supusă validării:</span>
          <h4 className="context-title">{resource.title}</h4>
          <span className="context-author">Autor: {resource.authorName} ({resource.grade})</span>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field-group">
            <label>Cadru Didactic Evaluator *</label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Apreciere Metodică & Concluzie *</label>
            <textarea
              rows={3}
              required
              placeholder="Ex: Materialul respectă programa școlară în vigoare. Structura logică și algoritmii sunt riguros implementați."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Anulare
            </button>
            <button type="submit" className="btn btn-success" disabled={submitting}>
              {submitting ? 'Se validează...' : 'Certifică Materialul („Verificat de Profesor”)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
