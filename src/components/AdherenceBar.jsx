export default function AdherenceBar({ value }) {
  const v = value ?? 0;
  const color = v >= 80 ? '#22C55E' : v >= 55 ? '#F59E0B' : '#EF4444';
  return (
    <div className="adherence-wrap">
      <div className="adherence-track">
        <div className="adherence-fill" style={{ width: `${v}%`, background: color }} />
      </div>
      <span className="adherence-pct" style={{ color }}>{v}%</span>
    </div>
  );
}
