import StatusBadge from './StatusBadge';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? '—' : d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'long', year: 'numeric' });
}

function Field({ label, value, full }) {
  return (
    <div className={`panel-field${full ? ' panel-field--full' : ''}`}>
      <span className="panel-field-label">{label}</span>
      <span className="panel-field-value">{value || '—'}</span>
    </div>
  );
}

function ScoreChip({ label, value }) {
  return (
    <div className="score-chip">
      <span className="score-chip-label">{label}</span>
      <span className="score-chip-value">{value || '—'}</span>
    </div>
  );
}

export default function PatientModal({ patient, onClose }) {
  if (!patient) return null;
  return (
    <div className="panel-overlay" onClick={onClose}>
      <div className="panel" onClick={e => e.stopPropagation()}>
        <button className="panel-close" onClick={onClose} aria-label="Fermer">✕</button>

        {/* En-tête */}
        <div className="panel-header">
          <div className="panel-avatar">{patient.prenom?.[0]}{patient.nom?.[0]}</div>
          <div>
            <h2 className="panel-name">{patient.prenom} {patient.nom}</h2>
            {patient.nom_clinique && (
              <p className="panel-clinic">{patient.nom_clinique}</p>
            )}
            <div style={{ marginTop: 8 }}>
              <StatusBadge statut={patient.statut} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <p className="panel-section-title">Contact</p>
        <div className="panel-grid">
          <Field label="Téléphone"    value={patient.telephone} />
          <Field label="Email"        value={patient.email} />
        </div>

        {/* Suivi */}
        <p className="panel-section-title">Suivi</p>
        <div className="panel-grid">
          <Field label="Date de livraison" value={fmt(patient.date_livraison)} />
          <Field label="Flag risque"       value={patient.flag_risque} />
          <Field label="Prochaine action"  value={patient.prochaine_action} full />
        </div>

        {/* Scores */}
        <p className="panel-section-title">Scores</p>
        <div className="score-grid">
          <ScoreChip label="J7"    value={patient.score_j7} />
          <ScoreChip label="J15"   value={patient.score_j15} />
          <ScoreChip label="J30"   value={patient.score_j30} />
          <ScoreChip label="Moyen" value={patient.score_moyen} />
        </div>

        {/* Notes */}
        {(patient.notes) && (
          <>
            <p className="panel-section-title">Notes cliniques</p>
            <p className="panel-notes">{patient.notes}</p>
          </>
        )}
      </div>
    </div>
  );
}
