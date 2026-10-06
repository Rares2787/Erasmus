// ============================================================================
// LER EduShare — Paletă de căutare rapidă (Ctrl/⌘ + K)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function CommandPalette({ isOpen, onClose, resources, onSelect }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? resources.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.subject.toLowerCase().includes(q) ||
            r.authorName.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q)
        )
      : resources;
    return list.slice(0, 7);
  }, [query, resources]);

  useEffect(() => setIndex(0), [query]);

  if (!isOpen) return null;

  function handleKey(e) {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[index]) {
      onSelect(results[index]);
      onClose();
    }
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()} onKeyDown={handleKey}>
        <div className="palette-input-row">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('palettePlaceholder')}
          />
          <kbd>Esc</kbd>
        </div>

        <div className="palette-list">
          {results.length === 0 ? (
            <div className="palette-empty">{t('paletteNoResults')} „{query}”</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                className={`palette-item ${i === index ? 'active' : ''}`}
                onMouseEnter={() => setIndex(i)}
                onClick={() => {
                  onSelect(r);
                  onClose();
                }}
              >
                <span className="palette-item-title">{r.title}</span>
                <span className="palette-item-meta">
                  {r.subject} · {r.grade} {r.isVerified && '· ✓ ' + t('badgeVerified')}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> {t('paletteNavigate')}</span>
          <span><kbd>↵</kbd> {t('paletteOpen')}</span>
        </div>
      </div>
    </div>
  );
}
