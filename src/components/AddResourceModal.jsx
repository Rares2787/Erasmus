// ============================================================================
// LER EduShare — Modal Propunere Resursă Didactică (Elev)
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AddResourceModal({ isOpen, onClose, onSubmitResource }) {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Informatica (C++)');
  const [grade, setGrade] = useState('Clasa a IX-a');
  const [type, setType] = useState('Cod Sursă & Algoritmi');
  const [contactHandle, setContactHandle] = useState(currentUser?.contactHandle || 'Discord: @elev.ler');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitResource({
        title,
        subject,
        grade,
        type,
        authorId: currentUser?.id,
        authorName: currentUser?.fullName || 'Elev LER',
        contactHandle,
        description,
        content,
        link
      });
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setContent('');
      setLink('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <div>
            <h3 className="modal-title">Propunere Resursă Didactică</h3>
            <p className="modal-sub">Materialul va fi redirecționat către administrator pentru aprobare prealabilă.</p>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Închide">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="field-group span-2">
              <label>Titlul Resursei *</label>
              <input
                type="text"
                required
                placeholder="Ex: Algoritmul lui Dijkstra explicat formal și prin grafuri"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Disciplina *</label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="Informatica (C++)">Informatică (C++)</option>
                <option value="Python">Python</option>
                <option value="Matematica">Matematică</option>
                <option value="Fizica">Fizică</option>
                <option value="Limba Romana">Limba Română</option>
                <option value="Chimie / Biologie">Științe Exacte</option>
              </select>
            </div>

            <div className="field-group">
              <label>Nivel de Studiu *</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="Clasa a IX-a">Clasa a IX-a</option>
                <option value="Clasa a X-a">Clasa a X-a</option>
                <option value="Clasa a XI-a">Clasa a XI-a</option>
                <option value="Clasa a XII-a">Clasa a XII-a (BAC)</option>
              </select>
            </div>

            <div className="field-group">
              <label>Format Conținut *</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="Note de Curs & Sinteză">Note de Curs & Sinteză</option>
                <option value="Cod Sursă & Algoritmi">Cod Sursă & Algoritmi</option>
                <option value="Fișă Aplicativă de Lucru">Fișă Aplicativă de Lucru</option>
                <option value="Scheme Structurale">Scheme Structurale</option>
              </select>
            </div>

            <div className="field-group">
              <label>Canal Instituțional de Contact *</label>
              <input
                type="text"
                required
                placeholder="Discord: @alex.ler sau Teams"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
              />
            </div>
          </div>

          <div className="field-group">
            <label>Rezumat Didactic & Obiectiv de Învățare *</label>
            <textarea
              rows={2}
              required
              placeholder="Sintetizați noțiunile tratate și cum facilitează acest material înțelegerea conceptelor complexe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Conținut Tehnic / Cod / Note Structurate *</label>
            <textarea
              rows={6}
              className="mono-field"
              required
              placeholder="Introduceți corpul complet al materialului, pașii metodici sau codul sursă..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label>Referință Document Extern (Opțional)</label>
            <input
              type="url"
              placeholder="https://drive.google.com/... sau depozit GitHub"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <div className="modal-bottom">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Anulare
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Se transmite...' : 'Înaintează spre Aprobare Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
