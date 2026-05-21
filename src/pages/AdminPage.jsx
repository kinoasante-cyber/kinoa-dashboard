import { useState, useMemo, useRef } from 'react';
import { useAllPatients } from '../hooks/useAllPatients';
import { useCliniques } from '../hooks/useCliniques';
import { STATUTS } from '../data/patients';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import PatientModal from '../components/PatientModal';
import './AdminPage.css';

const ADMIN_PASSWORD = 'KINOA_ADMIN_2026';
const AUTH_KEY = 'kinoa_admin_auth';
const BASE_URL = 'https://kinoa-dashboard.netlify.app';

/* ── Icons ──────────────────────────────────────────── */
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
function IconAlert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  );
}
function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}
function IconArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

/* ── Login ──────────────────────────────────────────── */
function LoginForm({ onSuccess }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, '1');
      onSuccess();
    } else {
      setError(true);
      setPw('');
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <div className="admin-login-logo">K</div>
        <div>
          <h1 className="admin-login-title">Dashboard Kinoa</h1>
          <p className="admin-login-sub">Accès réservé à l'équipe Kinoa</p>
        </div>
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <input
            type="password"
            className={`admin-login-input${error ? ' admin-login-input--error' : ''}`}
            placeholder="Mot de passe"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="admin-login-error">Mot de passe incorrect.</p>}
          <button type="submit" className="admin-login-btn">Se connecter</button>
        </form>
      </div>
    </div>
  );
}

/* ── Status breakdown ───────────────────────────────── */
function StatusBreakdown({ patients }) {
  return (
    <div className="status-breakdown">
      {['ROUGE', 'JAUNE', 'VERT'].map(s => {
        const count = patients.filter(p => p.statut === s).length;
        return (
          <span key={s} className="breakdown-chip"
            style={{ background: STATUTS[s].bg, color: STATUTS[s].color }}>
            <span className="breakdown-dot" style={{ background: STATUTS[s].dot }} />
            {STATUTS[s].label} <strong>{count}</strong>
          </span>
        );
      })}
    </div>
  );
}

/* ── Clinic URL field + copy ────────────────────────── */
function ClinicUrlField({ cliniqueName }) {
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const url = `${BASE_URL}/?clinique=${encodeURIComponent(cliniqueName)}`;

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="clinic-url-row">
      <input
        ref={inputRef}
        type="text"
        readOnly
        value={url}
        className="clinic-url-input"
        onClick={() => inputRef.current?.select()}
      />
      <button
        className={`clinic-url-copy${copied ? ' clinic-url-copy--copied' : ''}`}
        onClick={handleCopy}
        title="Copier le lien"
      >
        {copied ? <IconCheck /> : <IconCopy />}
        {copied ? 'Copié !' : 'Copier'}
      </button>
    </div>
  );
}

/* ── Clinic card ────────────────────────────────────── */
function ClinicCard({ cliniqueName, patients, onViewPatients }) {
  return (
    <div className="clinic-card">
      <div className="clinic-card-top">
        <div className="clinic-card-icon">
          {cliniqueName.charAt(0).toUpperCase()}
        </div>
        <div className="clinic-card-meta">
          <h3 className="clinic-name">{cliniqueName}</h3>
          <p className="clinic-count-line">
            <span className="clinic-count">{patients.length}</span>
            {' '}patient{patients.length !== 1 ? 's' : ''} actif{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <StatusBreakdown patients={patients} />

      <ClinicUrlField cliniqueName={cliniqueName} />

      <button className="btn-see-patients" onClick={() => onViewPatients(cliniqueName)}>
        <IconUsers />
        Voir les patients
      </button>
    </div>
  );
}

/* ── Detail view ────────────────────────────────────── */
function ClinicDetailView({ cliniqueName, patients, onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <>
      <div className="detail-header">
        <button className="detail-back-btn" onClick={onBack}>
          <IconArrowLeft /> Retour
        </button>
        <div>
          <h1 className="admin-title">{cliniqueName}</h1>
          <p className="admin-sub">
            {patients.length} patient{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="detail-summary">
        {['ROUGE', 'JAUNE', 'VERT'].map(s => {
          const count = patients.filter(p => p.statut === s).length;
          return (
            <div key={s} className="detail-stat" style={{ borderTopColor: STATUTS[s].dot }}>
              <span className="detail-stat-value" style={{ color: STATUTS[s].color }}>{count}</span>
              <span className="detail-stat-label">{STATUTS[s].label}</span>
            </div>
          );
        })}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Email</th>
              <th>Statut</th>
              <th>Date d'intake</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan="6" className="empty-state">Aucun patient.</td></tr>
            ) : (
              patients.map((p, i) => (
                <tr
                  key={p.id_patient ?? i}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelected(p)}
                >
                  <td>{p.prenom}</td>
                  <td style={{ fontWeight: 600 }}>{p.nom}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.telephone || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{p.email || '—'}</td>
                  <td><StatusBadge statut={p.statut} /></td>
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>
                    {p.date_intake ? new Date(p.date_intake).toLocaleDateString('fr-CA') : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="table-count" style={{ marginTop: 10 }}>
        {patients.length} patient{patients.length !== 1 ? 's' : ''} affiché{patients.length !== 1 ? 's' : ''}
      </p>

      <PatientModal patient={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/* ── Dashboard shell ────────────────────────────────── */
function AdminDashboard({ patients, cliniquesList, loading, error, refetch, onLogout }) {
  const [selectedClinic, setSelectedClinic] = useState(null);
  const today = new Date();

  const counts = useMemo(() => ({
    ROUGE: patients.filter(p => p.statut === 'ROUGE').length,
    JAUNE: patients.filter(p => p.statut === 'JAUNE').length,
    VERT:  patients.filter(p => p.statut === 'VERT').length,
  }), [patients]);

  // Group patients by clinic name for fast lookup
  const patientsByClinic = useMemo(() => {
    const map = {};
    patients.forEach(p => {
      const key = p.nom_clinique || p.clinique || '';
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return map;
  }, [patients]);

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div className="logo-mark">K</div>
          <div>
            <p className="logo-name">Kinoa</p>
            <p className="logo-clinic">Dashboard mère</p>
          </div>
        </div>

        <nav className="admin-sidebar-links">
          <button
            className={`admin-nav-item${!selectedClinic ? ' admin-nav-item--active' : ''}`}
            onClick={() => setSelectedClinic(null)}
          >
            <IconShield /> <span>Vue globale</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={onLogout}>
            <IconLogout /> <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          {selectedClinic ? (
            <button className="detail-back-btn" onClick={() => setSelectedClinic(null)}>
              <IconArrowLeft /> Retour
            </button>
          ) : (
            <div>
              <h1 className="admin-title">Dashboard mère</h1>
              <p className="admin-sub">
                {today.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          {!loading && (
            <button className="refresh-btn" onClick={refetch} title="Actualiser" style={{ marginLeft: 'auto' }}>
              <IconRefresh />
            </button>
          )}
        </header>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner" /> Chargement des données…
          </div>
        ) : error ? (
          <div className="error-panel">
            <div className="error-icon"><IconAlert /></div>
            <h3 className="error-title">Impossible de charger les données</h3>
            <p className="error-msg">{error}</p>
            <button className="retry-btn" onClick={refetch}><IconRefresh /> Réessayer</button>
          </div>
        ) : selectedClinic ? (
          <ClinicDetailView
            cliniqueName={selectedClinic}
            patients={patientsByClinic[selectedClinic] ?? []}
            onBack={() => setSelectedClinic(null)}
          />
        ) : (
          <>
            {/* Global stats */}
            <div className="admin-stats-grid">
              <StatCard label="Total patients"  value={patients.length} sub="toutes cliniques"               icon={<IconUsers />}  accent="#E8470A" />
              <StatCard label="Critiques"       value={counts.ROUGE}    sub={`${counts.JAUNE} en surveillance`} icon={<IconAlert />}  accent="#EF4444" />
              <StatCard label="En surveillance" value={counts.JAUNE}    sub={`${counts.VERT} en bonne santé`}   icon={<IconChart />}  accent="#F59E0B" />
              <StatCard label="Bonne santé"     value={counts.VERT}     sub="statut VERT"                     icon={<IconChart />}  accent="#22C55E" />
            </div>

            {/* Clinic cards — from API clinics list */}
            <p className="admin-section-title">
              Cliniques ({cliniquesList.length})
            </p>
            <div className="clinic-cards">
              {cliniquesList.map(name => (
                <ClinicCard
                  key={name}
                  cliniqueName={name}
                  patients={patientsByClinic[name] ?? []}
                  onViewPatients={setSelectedClinic}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Entry point ────────────────────────────────────── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_KEY) === '1');

  const { patients, loading: loadingP, error: errorP, refetch: refetchP } = useAllPatients();
  const { cliniques, loading: loadingC, error: errorC, refetch: refetchC } = useCliniques();

  const loading = loadingP || loadingC;
  const error   = errorP ?? errorC ?? null;

  function refetch() { refetchP(); refetchC(); }

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
  }

  if (!authed) return <LoginForm onSuccess={() => setAuthed(true)} />;

  return (
    <AdminDashboard
      patients={patients}
      cliniquesList={cliniques}
      loading={loading}
      error={error}
      refetch={refetch}
      onLogout={handleLogout}
    />
  );
}
