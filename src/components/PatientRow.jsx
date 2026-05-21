import StatusBadge from './StatusBadge';
import AdherenceBar from './AdherenceBar';

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? '—' : d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' });
}

function age(ddn) {
  if (!ddn) return null;
  const years = Math.floor((Date.now() - new Date(ddn).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  return isNaN(years) ? null : years;
}

export default function PatientRow({ patient }) {
  const ageVal = age(patient.ddn);
  return (
    <>
      <td>
        <div className="patient-identity">
          <span className="patient-avatar">{patient.prenom?.[0]}{patient.nom?.[0]}</span>
          <span className="patient-fullname">{patient.prenom} {patient.nom}</span>
        </div>
      </td>
      <td className="td-contact">{patient.telephone || '—'}</td>
      <td className="td-contact td-email">{patient.email || '—'}</td>
      <td className="td-center">{ageVal != null ? `${ageVal} ans` : '—'}</td>
      <td className="td-diagnose">{patient.diagnostic ?? '—'}</td>
      <td>{patient.orthotiste ?? '—'}</td>
      <td><StatusBadge statut={patient.statut} /></td>
      <td><AdherenceBar value={patient.adherence} /></td>
      <td className="td-center">{fmt(patient.derniereVisite)}</td>
      <td className="td-center">{fmt(patient.prochaineVisite)}</td>
    </>
  );
}
