import { STATUTS } from '../data/patients';

export default function StatusBadge({ statut }) {
  const s = STATUTS[statut];
  if (!s) return <span className="status-badge">—</span>;
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color }}>
      <span className="status-dot" style={{ background: s.dot }} />
      {s.label}
    </span>
  );
}
