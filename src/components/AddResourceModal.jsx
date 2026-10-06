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
  const [attachment, setAttachment] = useState(null); // { name, size, type, dataUrl }
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Dimensiunea fișierului depășește limita recomandată de 8MB.');
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
      // Dacă este PDF, actualizăm automat formatul conținutului dacă nu e deja setat
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
      alert('Vă rugăm să introduceți textul sau să atașați un fișier/PDF.');
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
        authorName: currentUser?.fullName || 'Elev LER',
        contactHandle,
        description,
        content: content.trim() || `[Fișier atașat: ${attachment.name}]`,
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
                <option value="Document PDF & Fişă">Document PDF & Fişă</option>
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
            <label>Atașare Fișier / Document PDF (Opțional sau în loc de text)</label>
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
                  border: '1px solid var(--apple-blue)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{attachment.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>({attachment.size})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachment}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--apple-red)',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Șterge
                  </button>
                </div>
              )}
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
            <label>Conținut Tehnic / Cod / Note Structurate {attachment ? '(Opțional)' : '*'}</label>
            <textarea
              rows={5}
              className="mono-field"
              required={!attachment}
              placeholder={attachment ? "Opțional: adăugați comentarii, instrucțiuni de studiu sau cod..." : "Introduceți corpul complet al materialului, pașii metodici sau codul sursă..."}
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
