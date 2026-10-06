// ============================================================================
// LER EduShare — Notificări Toast Apple Cupertino
// ============================================================================

import React from 'react';

export default function Toast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-feed">
      {toasts.map((toast) => (
        <div key={toast.id} className={`apple-toast ${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
