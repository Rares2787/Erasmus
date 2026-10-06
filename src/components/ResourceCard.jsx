// ============================================================================
// LER EduShare — Componentă Card Resursă Didactică (Cupertino Style)
// Suport Bilingv (Română / Engleză)
// ============================================================================

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ResourceCard({
  resource,
  onViewDetail,
  onTeacherVerify,
  onTeacherReport,
  onAdminRemove
}) {
  const { isElev, isProfesor, isAdmin } = useAuth();
  const { t } = useLanguage();

  let statusBadge = null;
  if (resource.status === 'pending_admin') {
    statusBadge = <span className="status-badge pending-admin">{t('badgePendingAdmin')}</span>;
  } else if (resource.isVerified) {
    statusBadge = <span className="status-badge verified">{t('badgeVerified')}</span>;
  } else {
    statusBadge = <span className="status-badge pending-teacher">{t('badgePendingTeacher')}</span>;
  }

  return (
    <article className="resource-card">
      <div>
        <div className="card-header-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span className="tag-badge">{resource.subject} &bull; {resource.grade}</span>
            {(resource.type === 'Document PDF & Fişă' || resource.type === 'PDF Document & Worksheet' || resource.attachment || (resource.link && resource.link.includes('pdf'))) && (
              <span className="tag-badge" style={{ backgroundColor: 'var(--apple-blue-subtle)', color: 'var(--apple-blue)', fontWeight: 700 }}>
                PDF
              </span>
            )}
          </div>
          {statusBadge}
        </div>

        <h3 className="card-title">{resource.title}</h3>
        <p className="card-desc">{resource.description}</p>

        {resource.isVerified && resource.verifiedBy && (
          <div className="evaluator-strip">
            <span>{t('cardCertifiedBy')}</span> {resource.verifiedBy}
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
            {t('cardViewResource')}
          </button>
        )}

        {isProfesor && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(resource)}>
              {t('cardDetails')}
            </button>
            {!resource.isVerified ? (
              <>
                <button className="btn btn-success btn-sm" onClick={() => onTeacherVerify(resource)}>
                  {t('cardGrantApproval')}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => onTeacherReport(resource)} title={t('cardReport')}>
                  {t('cardReport')}
                </button>
              </>
            ) : (
              <button className="btn btn-danger btn-sm" onClick={() => onTeacherReport(resource)}>
                {t('cardRequestTakedown')}
              </button>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(resource)}>
              {t('cardDetails')}
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                if (confirm(t('confirmRemoveCard'))) {
                  onAdminRemove(resource.id);
                }
              }}
            >
              {t('cardRemoveCatalog')}
            </button>
          </>
        )}
      </div>
    </article>
  );
}
