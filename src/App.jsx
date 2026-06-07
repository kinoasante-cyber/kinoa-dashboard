import { useState, useMemo } from 'react';
import { STATUTS } from './data/patients';
import { usePatients } from './hooks/usePatients';
import { useAllPatients } from './hooks/useAllPatients';
import { useCliniques } from './hooks/useCliniques';
import StatCard from './components/StatCard';
import PatientRow from './components/PatientRow';
import PatientModal from './components/PatientModal';
import './App.css';

const FILTER_ALL = 'TOUS';
const today = new Date();

function isThisWeek(dateStr) {
  const diff = (new Date(dateStr) - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

function IconUsers() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function IconAlert() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>; }
function IconCalendar() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function IconChart() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function IconSearch() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function IconRefresh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>; }
function IconBuilding() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function IconCopy() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>; }

function SkeletonCard() { return <div className="stat-card skeleton-card"><div className="skeleton skeleton-icon" /><div style={{ flex: 1 }}><div className="skeleton" style={{ height: 28, width: '60%', borderRadius: 6, marginBottom: 8 }} /><div className="skeleton" style={{ height: 12, width: '80%', borderRadius: 4 }} /></div></div>; }
function SkeletonRow() { return <tr className="skeleton-row">{[140,90,150,50,180,110,70,110,70,80].map((w,i) => <td key={i}><div className="skeleton" style={{ height: 14, width: w, borderRadius: 4 }} /></td>)}</tr>; }
function ErrorPanel({ message, onRetry }) { return <div className="error-panel"><div className="error-icon"><IconAlert /></div><h3 className="error-title">Impossible de charger les donnees</h3><p className="error-msg">{message}</p><button className="retry-btn" onClick={onRetry}><IconRefresh /> Reessayer</button></div>; }

function ClinicStatCard({ nom, patients }) {
  const [copied, setCopied] = useState(false);
  const rouge = patients.filter(p => p.statut === 'ROUGE').length;
  const jaune = patients.filter(p => p.statut === 'JAUNE').length;
  const vert  = patients.filter(p => p.statut === 'VERT').length;
  const navUrl = `/?clinique=${encodeURIComponent(nom)}`;
  const fullUrl = `https://kinoa-dashboard.vercel.app/?clinique=${encodeURIComponent(nom)}`;

  function handleCopy(e) {
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="clinic-stat-card" onClick={() => { window.location.href = navUrl; }}>
      <div className="clinic-card-header">
        <div className="clinic-avatar">{nom.charAt(0).toUpperCase()}</div>
        <div className="clinic-card-info">
          <p className="clinic-card-name">{nom}</p>
          <p className="clinic-card-count">{patients.length} patient{patients.length !== 1 ? 's' : ''} actif{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="clinic-card-arrow">→</span>
      </div>
      <div className="clinic-url-bar" onClick={e => e.stopPropagation()}>
        <span className="clinic-url-text">{fullUrl}</span>
        <button className={`clinic-url-btn${copied ? ' clinic-url-btn--copied' : ''}`} onClick={handleCopy}>
          {copied ? '✓ Copié !' : <><IconCopy /> Copier le lien</>}
        </button>
      </div>
      <div className="clinic-statuts">
        {rouge > 0 && <span className="cstat-pill cstat-rouge"><span className="cstat-dot" />{rouge} critique{rouge !== 1 ? 's' : ''}</span>}
        {jaune > 0 && <span className="cstat-pill cstat-jaune"><span className="cstat-dot" />{jaune} surveillance</span>}
        {vert  > 0 && <span className="cstat-pill cstat-vert"><span className="cstat-dot" />{vert} ok</span>}
        {patients.length === 0 && <span className="cstat-empty">Aucun patient</span>}
      </div>
    </div>
  );
}

function CliniquesView() {
  const { cliniques, loading: clLoading, error: clError, refetch: clRefetch } = useCliniques();
  const { patients, loading: pLoading, error: pError, refetch: pRefetch } = useAllPatients();

  const loading = clLoading || pLoading;
  const error = clError || pError;

  const byClinic = useMemo(() => {
    const map = {};
    patients.forEach(p => {
      const c = p.clinique ?? p.nom_clinique ?? p.clinic ?? '';
      if (!c) return;
      if (!map[c]) map[c] = [];
      map[c].push(p);
    });
    return map;
  }, [patients]);

  function refetch() { clRefetch(); pRefetch(); }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">K</div>
          <div><p className="logo-name">Kinoa</p><p className="logo-clinic">Dashboard</p></div>
        </div>
        <nav className="sidebar-nav">
          <a href="/" className="nav-item"><IconUsers /> Patients</a>
          <a href="/?view=cliniques" className="nav-item nav-item--active"><IconBuilding /> Cliniques</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">K</div>
          <div><p className="sidebar-user">Kinoa Sante</p><p className="sidebar-role">Admin</p></div>
        </div>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <h1 className="page-title">Cliniques</h1>
            <p className="page-sub">Sélectionnez une clinique · {today.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {!loading && <button className="refresh-btn" onClick={refetch} title="Actualiser"><IconRefresh /></button>}
        </header>
        <div className="cliniques-grid">
          {loading && <p style={{ color: 'var(--muted)', gridColumn: '1/-1' }}>Chargement des cliniques...</p>}
          {!loading && error && <ErrorPanel message={error} onRetry={refetch} />}
          {!loading && !error && cliniques.map(nom => (
            <ClinicStatCard key={nom} nom={nom} patients={byClinic[nom] ?? []} />
          ))}
          {!loading && !error && cliniques.length === 0 && (
            <p style={{ color: 'var(--muted)', gridColumn: '1/-1' }}>Aucune clinique trouvée.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const clinique = params.get('clinique');
  const view = params.get('view');

  if (clinique) return <DashboardView clinique={clinique} />;
  if (view === 'cliniques') return <CliniquesView />;
  return <DashboardView clinique={null} />;
}

function DashboardView({ clinique }) {
  const { patients, loading, error, refetch } = usePatients(clinique);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState(FILTER_ALL);
  const [selected, setSelected] = useState(null);
  const [sortKey, setSortKey] = useState('nom');
  const [sortDir, setSortDir] = useState(1);

  const counts = useMemo(() => ({ ROUGE: patients.filter(p => p.statut === 'ROUGE').length, JAUNE: patients.filter(p => p.statut === 'JAUNE').length, VERT: patients.filter(p => p.statut === 'VERT').length }), [patients]);
  const avgAdherence = useMemo(() => { if (!patients.length) return 0; return Math.round(patients.reduce((s, p) => s + (p.adherence ?? 0), 0) / patients.length); }, [patients]);
  const rdvCeSemaine = useMemo(() => patients.filter(p => isThisWeek(p.prochaineVisite)).length, [patients]);

  const filtered = useMemo(() => {
    let list = patients;
    if (filterStatut !== FILTER_ALL) list = list.filter(p => p.statut === filterStatut);
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => `${p.prenom} ${p.nom}`.toLowerCase().includes(q) || (p.diagnostic ?? '').toLowerCase().includes(q) || (p.orthotiste ?? '').toLowerCase().includes(q)); }
    return [...list].sort((a, b) => { const av = a[sortKey], bv = b[sortKey]; if (typeof av === 'string') return sortDir * av.localeCompare(bv, 'fr'); return sortDir * (av - bv); });
  }, [patients, search, filterStatut, sortKey, sortDir]);

  function handleSort(key) { if (key === sortKey) setSortDir(d => -d); else { setSortKey(key); setSortDir(1); } }
  function SortTh({ label, k }) { const active = sortKey === k; return <th onClick={() => handleSort(k)} className={`th-sortable${active ? ' th-active' : ''}`}>{label} <span className="sort-arrow">{active ? (sortDir === 1 ? '↑' : '↓') : '↕'}</span></th>; }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">K</div>
          <div><p className="logo-name">Kinoa</p><p className="logo-clinic">{clinique ?? 'Toutes'}</p></div>
        </div>
        <nav className="sidebar-nav">
          {clinique && (
            <a href="/?view=cliniques" className="nav-item nav-item--back">← Toutes les cliniques</a>
          )}
          <a href="/" className="nav-item nav-item--active"><IconUsers /> Patients</a>
          <a href="/?view=cliniques" className="nav-item"><IconBuilding /> Cliniques</a>
          <a href="#" className="nav-item"><IconCalendar /> Agenda</a>
          <a href="#" className="nav-item"><IconChart /> Rapports</a>
          <a href="#" className="nav-item"><IconAlert /> Alertes{counts.ROUGE > 0 && <span className="nav-badge">{counts.ROUGE}</span>}</a>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-avatar">JC</div>
          <div><p className="sidebar-user">Julien Cote</p><p className="sidebar-role">Orthotiste</p></div>
        </div>
      </aside>
      <main className="main">
        <header className="page-header">
          <div>
            <h1 className="page-title">{clinique ?? 'Tableau de bord'}</h1>
            <p className="page-sub">{clinique ? `Clinique ${clinique}` : 'Tous les patients'} · {today.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {!loading && <button className="refresh-btn" onClick={refetch} title="Actualiser"><IconRefresh /></button>}
        </header>
        <div className="stats-grid">
          {loading ? Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />) : (
            <>
              <StatCard label="Patients actifs" value={patients.length} sub={clinique ? `clinique ${clinique}` : 'toutes cliniques'} icon={<IconUsers />} accent="#E8470A" />
              <StatCard label="Alertes critiques" value={counts.ROUGE} sub={`${counts.JAUNE} en surveillance`} icon={<IconAlert />} accent="#EF4444" />
              <StatCard label="RDV cette semaine" value={rdvCeSemaine} sub="7 prochains jours" icon={<IconCalendar />} accent="#1A2340" />
              <StatCard label="Adherence moyenne" value={`${avgAdherence}%`} sub="tous patients confondus" icon={<IconChart />} accent="#22C55E" />
            </>
          )}
        </div>
        {!loading && !error && (
          <div className="toolbar">
            <div className="search-box"><IconSearch /><input className="search-input" placeholder="Rechercher un patient, diagnostic, orthotiste..." value={search} onChange={e => setSearch(e.target.value)} /></div>
            <div className="filter-pills">{[FILTER_ALL, 'ROUGE', 'JAUNE', 'VERT'].map(s => <button key={s} onClick={() => setFilterStatut(s)} className={`pill${filterStatut === s ? ' pill--active' : ''}`} style={filterStatut === s && s !== FILTER_ALL ? { background: STATUTS[s].bg, color: STATUTS[s].color, borderColor: STATUTS[s].dot } : {}}>{s === FILTER_ALL ? 'Tous' : STATUTS[s].label}<span className="pill-count">{s === FILTER_ALL ? patients.length : counts[s]}</span></button>)}</div>
          </div>
        )}
        <div className="table-wrap">
          {error ? <ErrorPanel message={error} onRetry={refetch} /> : (
            <table className="patient-table">
              <thead><tr><SortTh label="Patient" k="nom" /><th>Telephone</th><th>Email</th><SortTh label="Age" k="ddn" /><th>Diagnostic</th><th>Orthotiste</th><SortTh label="Statut" k="statut" /><SortTh label="Adherence" k="adherence" /><SortTh label="Derniere visite" k="derniereVisite" /><SortTh label="Prochain RDV" k="prochaineVisite" /></tr></thead>
              <tbody>{loading ? Array.from({ length: 7 }, (_, i) => <SkeletonRow key={i} />) : filtered.length === 0 ? <tr><td colSpan="10" className="empty-state">Aucun patient trouve.</td></tr> : filtered.map(p => <tr key={p.id_patient} className="patient-row" style={{ cursor: 'pointer' }} onClick={() => setSelected(p)}><PatientRow patient={p} /></tr>)}</tbody>
            </table>
          )}
        </div>
        {!loading && !error && <p className="table-count">{filtered.length} patient{filtered.length !== 1 ? 's' : ''} affiche{filtered.length !== 1 ? 's' : ''}</p>}
      </main>
      <PatientModal patient={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
