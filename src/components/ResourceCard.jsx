// ============================================================================
// LER EduShare — Componentă Card Resursă Didactică (Cupertino Style)
// ============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ResourceCard({
  resource,
  onViewDetail,
  onTeacherVerify,
  onTeacherReport,
  onAdminRemove
}) {
  const { isElev, isProfesor, isAdmin } = useAuth();

  let statusBadge = null;
  if (resource.status === 'pending_admin') {
    statusBadge = <span className="status-badge pending-admin">În așteptare administrator</span>;
  } else if (resource.isVerified) {
    statusBadge = <span className="status-badge verified">Verificat de profesor</span>;
  } else {
    statusBadge = <span className="status-badge pending-teacher">În așteptare aviz didactic</span>;
  }

  return (
    <article className="resource-card">
      <div>
        <div className="card-header-line">
          <span className="tag-badge">{resource.subject} &bull; {resource.grade}</span>
          {statusBadge}
        </div>

        <h3 className="card-title">{resource.title}</h3>
        <p className="card-desc">{resource.description}</p>

        {resource.isVerified && resource.verifiedBy && (
          <div className="evaluator-strip">
            <span>Avizat de:</span> {resource.verifiedBy}
          </div>
        )}

        <div className="author-meta-row">
          <div className="author-dot">{resource.authorName ? resource.authorName.charAt(0) : 'E'}</div>
          <div className="author-details">
            <span className="author-title">{resource.authorName}</span>
            <span className="author-sub">{resource.type} &bull; {resource.contactHandle}</span>
          </div>
        </div>
      </div>

      <div className="card-action-bar">
        {isElev && (
          <button className="btn btn-primary btn-sm" onClick={() => onViewDetail(resource)}>
            Consultă Resursa
          </button>
        )}

        {isProfesor && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(resource)}>
              Detalii
            </button>
            {!resource.isVerified ? (
              <>
                <button className="btn btn-success btn-sm" onClick={() => onTeacherVerify(resource)}>
                  Acordă Aviz
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onTeacherReport(resource)} title="Semnalează neconformitate metodologică">
                  Semnalează
                </button>
              </>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => onTeacherReport(resource)}>
                Solicită Retragerea
              </button>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(resource)}>
              Detalii
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onAdminRemove(resource.id)}>
              Elimină din Catalog
            </button>
          </>
        )}
      </div>
    </article>
  );
}
